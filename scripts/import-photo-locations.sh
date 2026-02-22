#!/usr/bin/env bash
# ─────────────────────────────────────────────────────────────────────
# import-photo-locations.sh — One-command pipeline to extract GPS data
# from your macOS Photos library and generate travel entries.
#
# Usage:
#   ./scripts/import-photo-locations.sh [options]
#
# Options:
#   --after  YYYY-MM-DD   Only include photos after this date
#   --before YYYY-MM-DD   Only include photos before this date
#   --dry-run             Preview results without modifying travel.ts
#   --skip-extract        Skip photo extraction (reuse existing photo-records.json)
#   --radius-km N         Cluster radius in km (default: 30)
#   --gap-days N          Days between separate visits (default: 60)
#   --min-samples N       Min photos per cluster (default: 2)
#   --help                Show this help message
#
# Prerequisites:
#   • macOS with Photos app (iCloud photo library)
#   • Xcode Command Line Tools (for swiftc): xcode-select --install
#   • Python 3.8+ with: pip3 install scikit-learn numpy requests
#
# What it does:
#   1. Compiles the Swift photo extractor into a signed .app bundle
#   2. Runs it to read GPS coordinates from your Photos library
#   3. Clusters locations and reverse-geocodes via Nominatim
#   4. Outputs new travel entries (deduplicating against existing ones)
#   5. Optionally appends entries to travel.ts and runs geocode.ts
# ─────────────────────────────────────────────────────────────────────
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
SWIFT_SRC="$SCRIPT_DIR/extract-photos.swift"
APP_DIR="$SCRIPT_DIR/.build"
APP_BUNDLE="$APP_DIR/PhotoExtractor.app"
BINARY="$APP_BUNDLE/Contents/MacOS/PhotoExtractor"
RECORDS_FILE="$APP_DIR/photo-records.json"

# ── Parse arguments ─────────────────────────────────────────────────
AFTER=""
BEFORE=""
DRY_RUN=false
SKIP_EXTRACT=false
RADIUS_KM=30
GAP_DAYS=60
MIN_SAMPLES=2

while [[ $# -gt 0 ]]; do
  case $1 in
    --after)     AFTER="$2";       shift 2 ;;
    --before)    BEFORE="$2";      shift 2 ;;
    --dry-run)   DRY_RUN=true;     shift ;;
    --skip-extract) SKIP_EXTRACT=true; shift ;;
    --radius-km) RADIUS_KM="$2";   shift 2 ;;
    --gap-days)  GAP_DAYS="$2";    shift 2 ;;
    --min-samples) MIN_SAMPLES="$2"; shift 2 ;;
    --help|-h)
      head -28 "$0" | tail -25
      exit 0
      ;;
    *)
      echo "Unknown option: $1" >&2
      exit 1
      ;;
  esac
done

# ── Helpers ─────────────────────────────────────────────────────────
info()  { echo "▸ $*"; }
ok()    { echo "✓ $*"; }
fail()  { echo "✗ $*" >&2; exit 1; }

# ── Check prerequisites ────────────────────────────────────────────
check_deps() {
  command -v swiftc >/dev/null 2>&1 || fail "swiftc not found. Install Xcode CLT: xcode-select --install"
  command -v python3 >/dev/null 2>&1 || fail "python3 not found"
  python3 -c "import sklearn, numpy, requests" 2>/dev/null || {
    echo "Missing Python dependencies. Installing..." >&2
    pip3 install scikit-learn numpy requests
  }
  [[ -f "$SWIFT_SRC" ]] || fail "Swift source not found: $SWIFT_SRC"
}

# ── Step 1: Compile & bundle ───────────────────────────────────────
build_app() {
  info "Compiling Swift photo extractor..."
  mkdir -p "$APP_DIR"
  rm -rf "$APP_BUNDLE"

  # Compile
  swiftc "$SWIFT_SRC" \
    -o "$APP_DIR/PhotoExtractor" \
    -framework Photos \
    -framework Foundation \
    -sdk "$(xcrun --show-sdk-path)" \
    2>&1

  # Create .app bundle structure
  mkdir -p "$APP_BUNDLE/Contents/MacOS"
  mv "$APP_DIR/PhotoExtractor" "$BINARY"

  # Write Info.plist (required for Photos permission dialog)
  cat > "$APP_BUNDLE/Contents/Info.plist" << 'PLIST'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN"
  "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleIdentifier</key>
  <string>com.oscar.photo-extractor</string>
  <key>CFBundleName</key>
  <string>PhotoExtractor</string>
  <key>CFBundleExecutable</key>
  <string>PhotoExtractor</string>
  <key>CFBundleVersion</key>
  <string>1.0</string>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>This app reads photo GPS locations to populate the portfolio travel map.</string>
</dict>
</plist>
PLIST

  # Sign the bundle (required for permission dialog)
  xattr -cr "$APP_BUNDLE" 2>/dev/null || true
  codesign --force --deep --sign - "$APP_BUNDLE" 2>&1

  ok "App bundle built and signed"
}

# ── Step 2: Extract photos ─────────────────────────────────────────
extract_photos() {
  info "Extracting GPS data from Photos library..."

  # Set environment variables for date filtering
  export PHOTO_OUTPUT_FILE="$RECORDS_FILE"
  [[ -n "$AFTER" ]]  && export PHOTO_START_DATE="$AFTER"
  [[ -n "$BEFORE" ]] && export PHOTO_END_DATE="$BEFORE"

  # Run the app (open -W waits for it to finish; output goes to file)
  open -W "$APP_BUNDLE" 2>&1 || true

  # Check for output
  if [[ ! -f "$RECORDS_FILE" ]]; then
    # Check log for errors
    LOG_FILE="$APP_DIR/photo-extract.log"
    if [[ -f "$LOG_FILE" ]]; then
      echo "Log output:" >&2
      cat "$LOG_FILE" >&2
    fi
    fail "Photo extraction failed — no output file created"
  fi

  RECORD_COUNT=$(python3 -c "import json; print(len(json.load(open('$RECORDS_FILE'))))")
  ok "Extracted $RECORD_COUNT geotagged photo records"
}

# ── Step 3: Cluster & geocode ──────────────────────────────────────
process_locations() {
  info "Clustering and reverse-geocoding locations..."

  PYTHON_ARGS=(
    "$SCRIPT_DIR/process-photo-locations.py"
    --input "$RECORDS_FILE"
    --radius-km "$RADIUS_KM"
    --gap-days "$GAP_DAYS"
    --min-samples "$MIN_SAMPLES"
    --format ts
  )

  [[ -n "$AFTER" ]]  && PYTHON_ARGS+=(--after "$AFTER")
  [[ -n "$BEFORE" ]] && PYTHON_ARGS+=(--before "$BEFORE")

  if $DRY_RUN; then
    PYTHON_ARGS+=(--dry-run)
    python3 "${PYTHON_ARGS[@]}"
    ok "Dry run complete — no files modified"
    return
  fi

  OUTPUT_FILE="$APP_DIR/new-entries.ts"
  PYTHON_ARGS+=(--output "$OUTPUT_FILE")
  python3 "${PYTHON_ARGS[@]}"

  if [[ ! -f "$OUTPUT_FILE" ]] || [[ ! -s "$OUTPUT_FILE" ]]; then
    info "No new entries to add (all locations already in travel.ts)"
    return
  fi

  ENTRY_COUNT=$(grep -c "place:" "$OUTPUT_FILE" 2>/dev/null || echo "0")
  ok "Generated $ENTRY_COUNT new travel entries"

  echo ""
  echo "── New entries ──────────────────────────────────────────"
  cat "$OUTPUT_FILE"
  echo ""
  echo "────────────────────────────────────────────────────────"
  echo ""

  # Ask user to confirm
  read -rp "Add these entries to travel.ts? [y/N] " confirm
  if [[ "$confirm" =~ ^[Yy] ]]; then
    append_to_travel "$OUTPUT_FILE"
  else
    info "Entries saved to $OUTPUT_FILE — add manually when ready"
  fi
}

# ── Step 4: Append to travel.ts and geocode ────────────────────────
append_to_travel() {
  local entries_file="$1"
  local travel_file="$PROJECT_ROOT/src/data/travel.ts"

  info "Appending entries to travel.ts..."

  # Insert before the closing ]; of rawTravelData
  # Find the line number of the last ];
  local insert_line
  insert_line=$(grep -n "^];" "$travel_file" | tail -1 | cut -d: -f1)

  if [[ -z "$insert_line" ]]; then
    fail "Could not find end of rawTravelData array in travel.ts"
  fi

  # Create temp file with entries inserted
  {
    head -n $((insert_line - 1)) "$travel_file"
    echo ""
    cat "$entries_file"
    tail -n +"$insert_line" "$travel_file"
  } > "$travel_file.tmp"

  mv "$travel_file.tmp" "$travel_file"
  ok "Updated travel.ts"

  # Run geocode script
  info "Resolving coordinates via geocode.ts..."
  cd "$PROJECT_ROOT"
  npx tsx scripts/geocode.ts
  ok "Geocode cache updated"

  echo ""
  ok "Done! Run 'npm run dev' to see your new travel markers on the globe."
}

# ── Cleanup ─────────────────────────────────────────────────────────
cleanup() {
  # Keep the build dir but clean up the app bundle (it's large)
  # The photo-records.json and new-entries.ts are kept for reference
  info "Build artifacts are in $APP_DIR/"
  info "To clean up: rm -rf $APP_DIR"
}

# ── Main ────────────────────────────────────────────────────────────
main() {
  echo "╔══════════════════════════════════════════════════╗"
  echo "║  Photo Location Import Pipeline                  ║"
  echo "╚══════════════════════════════════════════════════╝"
  echo ""

  check_deps

  if $SKIP_EXTRACT; then
    if [[ ! -f "$RECORDS_FILE" ]]; then
      fail "No existing photo-records.json found. Run without --skip-extract first."
    fi
    info "Skipping extraction, using existing $RECORDS_FILE"
  else
    build_app
    extract_photos
  fi

  process_locations
  cleanup
}

main
