#!/usr/bin/env python3
"""
process-photo-locations.py — Cluster photo GPS points into travel entries.

Reads a JSON file of { lat, lng, date } records (from extract-photos.swift),
clusters them spatially with DBSCAN (30 km radius), splits clusters into
separate visits by time gaps, reverse-geocodes each cluster center via
Nominatim, deduplicates against existing travel.ts entries, and outputs
TypeScript-ready travel entries.

Usage:
    python3 scripts/process-photo-locations.py [options]

Options:
    --input FILE         Input JSON file (default: photo-records.json)
    --output FILE        Output file for new entries (default: stdout)
    --format ts|json     Output format (default: ts)
    --min-samples N      Min photos per cluster (default: 2)
    --radius-km N        Cluster radius in km (default: 30)
    --gap-days N         Days between visits to split (default: 60)
    --dry-run            Show what would be added without writing
    --after YYYY-MM-DD   Only include photos after this date
    --before YYYY-MM-DD  Only include photos before this date

Dependencies:
    pip3 install scikit-learn numpy requests
"""

import argparse
import json
import math
import os
import re
import sys
import time
from collections import defaultdict
from datetime import datetime, timedelta
from pathlib import Path

# ── Lazy imports with helpful error ────────────────────────────────
def _import_deps():
    try:
        import numpy as np
        from sklearn.cluster import DBSCAN
        return np, DBSCAN
    except ImportError:
        print("Missing dependencies. Install with:", file=sys.stderr)
        print("  pip3 install scikit-learn numpy", file=sys.stderr)
        sys.exit(1)

try:
    import requests
except ImportError:
    print("Missing 'requests'. Install with: pip3 install requests", file=sys.stderr)
    sys.exit(1)

# ── Constants ──────────────────────────────────────────────────────
EARTH_RADIUS_KM = 6371.0
NOMINATIM_URL = "https://nominatim.openstreetmap.org/reverse"
USER_AGENT = "oscar-portfolio-photo-extractor/1.0"

# Known place name improvements (local/admin names → recognizable names)
PLACE_RENAMES = {
    "Sakhu": "Phuket",
    "Thalang": "Phuket",
    "Kathu": "Phuket",
    "Mueang Phuket": "Phuket",
    "Mono County": "Yosemite",
    "Mariposa County": "Yosemite",
    "Tuolumne County": "Yosemite",
    "Municipality of Ilioupoli": "Athens",
    "Ilioupoli": "Athens",
    "Zhuqiao": None,          # Airport transit — skip
    "Narita": None,            # Airport transit — skip
    "Schiphol": None,          # Airport transit — skip
}

# Strip these suffixes from place names
STRIP_SUFFIXES = [
    " Municipality",
    " Kommune",
    " District",
    " Subdistrict",
    " Sub-district",
]

SCRIPT_DIR = Path(__file__).parent
PROJECT_ROOT = SCRIPT_DIR.parent


def load_photo_records(path: str, after: str = None, before: str = None) -> list:
    """Load and optionally filter photo records by date."""
    with open(path) as f:
        records = json.load(f)

    if after:
        records = [r for r in records if r["date"] >= after]
    if before:
        records = [r for r in records if r["date"] <= before]

    print(f"Loaded {len(records)} photo records", file=sys.stderr)
    return records


def cluster_photos(records: list, radius_km: float, min_samples: int):
    """Cluster photo locations with DBSCAN using haversine distance."""
    np, DBSCAN = _import_deps()

    coords = np.array([[r["lat"], r["lng"]] for r in records])
    coords_rad = np.radians(coords)

    eps_rad = radius_km / EARTH_RADIUS_KM

    db = DBSCAN(
        eps=eps_rad,
        min_samples=min_samples,
        metric="haversine",
        algorithm="ball_tree",
    )
    labels = db.fit_predict(coords_rad)

    clusters = defaultdict(list)
    noise = 0
    for i, label in enumerate(labels):
        if label == -1:
            noise += 1
            continue
        clusters[label].append(records[i])

    print(f"Found {len(clusters)} spatial clusters ({noise} noise points)", file=sys.stderr)
    return clusters


def split_by_time_gap(clusters: dict, gap_days: int) -> list:
    """Split clusters into separate visits when photos are far apart in time."""
    visits = []

    for label, photos in clusters.items():
        photos.sort(key=lambda p: p["date"])
        current_visit = [photos[0]]

        for p in photos[1:]:
            prev_date = datetime.strptime(current_visit[-1]["date"], "%Y-%m-%d")
            curr_date = datetime.strptime(p["date"], "%Y-%m-%d")
            if (curr_date - prev_date).days > gap_days:
                visits.append(current_visit)
                current_visit = [p]
            else:
                current_visit.append(p)

        visits.append(current_visit)

    print(f"Split into {len(visits)} time-separated visits", file=sys.stderr)
    return visits


def reverse_geocode(lat: float, lng: float) -> dict | None:
    """Reverse-geocode a coordinate via Nominatim. Returns place info or None."""
    try:
        resp = requests.get(
            NOMINATIM_URL,
            params={
                "lat": lat,
                "lon": lng,
                "format": "json",
                "accept-language": "en",
                "zoom": 10,
            },
            headers={"User-Agent": USER_AGENT},
            timeout=10,
        )
        if resp.status_code != 200:
            return None

        data = resp.json()
        addr = data.get("address", {})

        # Try to find the best place name
        place = (
            addr.get("city")
            or addr.get("town")
            or addr.get("village")
            or addr.get("municipality")
            or addr.get("county")
            or addr.get("state")
            or data.get("name")
        )

        country = addr.get("country", "Unknown")
        state = addr.get("state")
        country_code = addr.get("country_code", "??").upper()

        return {
            "place": place,
            "country": country,
            "state": state if country_code == "US" else None,
            "country_code": country_code,
        }
    except Exception as e:
        print(f"  Geocode error: {e}", file=sys.stderr)
        return None


def clean_place_name(name: str) -> str | None:
    """Apply renames and clean up a place name. Returns None to skip."""
    if not name:
        return None

    # Check renames (exact match)
    if name in PLACE_RENAMES:
        return PLACE_RENAMES[name]

    # Strip known suffixes
    for suffix in STRIP_SUFFIXES:
        if name.endswith(suffix):
            name = name[: -len(suffix)]

    return name.strip()


def haversine_km(lat1: float, lng1: float, lat2: float, lng2: float) -> float:
    """Haversine distance between two points in km."""
    lat1, lng1, lat2, lng2 = map(math.radians, [lat1, lng1, lat2, lng2])
    dlat = lat2 - lat1
    dlng = lng2 - lng1
    a = math.sin(dlat / 2) ** 2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlng / 2) ** 2
    return 2 * EARTH_RADIUS_KM * math.asin(math.sqrt(a))


def load_existing_locations() -> list[dict]:
    """Load existing places from geocode-cache.json for deduplication."""
    cache_path = PROJECT_ROOT / "src" / "data" / "geocode-cache.json"
    if not cache_path.exists():
        return []

    with open(cache_path) as f:
        cache = json.load(f)

    return [
        {"key": key, "lat": val["lat"], "lng": val["lng"]}
        for key, val in cache.items()
    ]


def is_duplicate(lat: float, lng: float, existing: list[dict], threshold_km: float = 30) -> str | None:
    """Check if a location is within threshold_km of any existing location.
    Returns the matching key or None."""
    for loc in existing:
        if haversine_km(lat, lng, loc["lat"], loc["lng"]) < threshold_km:
            return loc["key"]
    return None


def process_visits(visits: list, existing: list[dict], dry_run: bool = False) -> list[dict]:
    """Reverse-geocode visits, deduplicate, and return travel entries."""
    np, _ = _import_deps()
    entries = []
    skipped_dup = 0
    skipped_rename = 0
    geocode_cache = {}  # lat,lng → geocode result (avoid re-querying nearby clusters)

    for i, visit in enumerate(visits):
        lats = [p["lat"] for p in visit]
        lngs = [p["lng"] for p in visit]
        center_lat = sum(lats) / len(lats)
        center_lng = sum(lngs) / len(lngs)

        dates = sorted(p["date"] for p in visit)
        start_date = dates[0]
        end_date = dates[-1] if dates[-1] != dates[0] else None

        # Check if this location already exists in travel.ts
        dup_key = is_duplicate(center_lat, center_lng, existing)
        if dup_key:
            skipped_dup += 1
            continue

        # Reverse geocode (with simple cache for nearby points)
        cache_key = f"{round(center_lat, 2)},{round(center_lng, 2)}"
        if cache_key in geocode_cache:
            geo = geocode_cache[cache_key]
        else:
            geo = reverse_geocode(center_lat, center_lng)
            geocode_cache[cache_key] = geo
            time.sleep(1.1)  # Nominatim rate limit

        if not geo or not geo["place"]:
            print(f"  Could not geocode cluster at ({center_lat:.4f}, {center_lng:.4f})", file=sys.stderr)
            continue

        place = clean_place_name(geo["place"])
        if place is None:
            skipped_rename += 1
            continue

        country = geo["country"]
        state = geo.get("state")

        # Build entry
        entry = {
            "place": place,
            "country": country,
            "startDate": start_date,
            "purpose": "travel",
            "_photos": len(visit),
            "_lat": round(center_lat, 4),
            "_lng": round(center_lng, 4),
        }
        if end_date:
            entry["endDate"] = end_date
        if state and geo.get("country_code") == "US":
            entry["state"] = state

        entries.append(entry)

        if (i + 1) % 10 == 0:
            print(f"  Processed {i + 1}/{len(visits)} visits...", file=sys.stderr)

    # Deduplicate entries with same place+country (keep the one with most photos)
    seen = {}
    for e in entries:
        key = f"{e['place']}, {e['country']}"
        if key not in seen or e["_photos"] > seen[key]["_photos"]:
            seen[key] = e

    deduped = list(seen.values())
    deduped.sort(key=lambda e: e["startDate"])

    print(f"\nResults:", file=sys.stderr)
    print(f"  {len(deduped)} new travel entries", file=sys.stderr)
    print(f"  {skipped_dup} skipped (already in travel.ts)", file=sys.stderr)
    print(f"  {skipped_rename} skipped (filtered by PLACE_RENAMES)", file=sys.stderr)

    return deduped


def format_ts_entry(entry: dict) -> str:
    """Format a single entry as a TypeScript object literal."""
    parts = [f"place: '{entry['place']}'"]
    parts.append(f"country: '{entry['country']}'")
    if entry.get("state"):
        parts.append(f"state: '{entry['state']}'")
    parts.append(f"startDate: '{entry['startDate']}'")
    if entry.get("endDate"):
        parts.append(f"endDate: '{entry['endDate']}'")
    parts.append(f"purpose: '{entry['purpose']}'")

    # Pad for alignment
    inner = ", ".join(parts)
    return f"  {{ {inner} }},"


def format_output(entries: list[dict], fmt: str) -> str:
    """Format entries as TypeScript or JSON."""
    if fmt == "json":
        # Remove internal fields
        clean = [{k: v for k, v in e.items() if not k.startswith("_")} for e in entries]
        return json.dumps(clean, indent=2, ensure_ascii=False)

    # TypeScript format
    lines = ["  // ── Extracted from Photos ──"]
    for entry in entries:
        lines.append(format_ts_entry(entry))
    return "\n".join(lines)


def main():
    parser = argparse.ArgumentParser(
        description="Cluster photo GPS data into travel entries for the portfolio globe."
    )
    parser.add_argument(
        "--input", default="photo-records.json",
        help="Input JSON file of photo records (default: photo-records.json)"
    )
    parser.add_argument(
        "--output", default=None,
        help="Output file (default: stdout)"
    )
    parser.add_argument(
        "--format", choices=["ts", "json"], default="ts",
        help="Output format (default: ts)"
    )
    parser.add_argument(
        "--min-samples", type=int, default=2,
        help="Minimum photos per cluster (default: 2)"
    )
    parser.add_argument(
        "--radius-km", type=float, default=30,
        help="Cluster radius in km (default: 30)"
    )
    parser.add_argument(
        "--gap-days", type=int, default=60,
        help="Days between visits to split a cluster (default: 60)"
    )
    parser.add_argument(
        "--after",
        help="Only include photos after this date (YYYY-MM-DD)"
    )
    parser.add_argument(
        "--before",
        help="Only include photos before this date (YYYY-MM-DD)"
    )
    parser.add_argument(
        "--dry-run", action="store_true",
        help="Preview results without writing"
    )

    args = parser.parse_args()

    # Load records
    records = load_photo_records(args.input, after=args.after, before=args.before)
    if not records:
        print("No photo records to process.", file=sys.stderr)
        sys.exit(0)

    # Cluster
    clusters = cluster_photos(records, args.radius_km, args.min_samples)
    if not clusters:
        print("No clusters found.", file=sys.stderr)
        sys.exit(0)

    # Split by time
    visits = split_by_time_gap(clusters, args.gap_days)

    # Load existing for dedup
    existing = load_existing_locations()
    print(f"Loaded {len(existing)} existing locations for deduplication", file=sys.stderr)

    # Process
    entries = process_visits(visits, existing, dry_run=args.dry_run)

    if not entries:
        print("\nNo new entries to add.", file=sys.stderr)
        sys.exit(0)

    # Format output
    output = format_output(entries, args.format)

    if args.dry_run:
        print("\n── DRY RUN — would generate: ──\n", file=sys.stderr)
        print(output)
        return

    if args.output:
        with open(args.output, "w") as f:
            f.write(output + "\n")
        print(f"\nWrote {len(entries)} entries to {args.output}", file=sys.stderr)
    else:
        print(output)


if __name__ == "__main__":
    main()
