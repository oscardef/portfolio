#!/usr/bin/env swift
// ─────────────────────────────────────────────────────────────────────
// extract-photos.swift — Read GPS coordinates from macOS Photos library
// ─────────────────────────────────────────────────────────────────────
//
// Uses Apple's Photos framework (PhotoKit) to extract geotagged photo
// metadata. Outputs a JSON array of { lat, lng, date } records.
//
// This binary must run as a signed .app bundle so macOS will show the
// standard "Allow access to Photos" dialog. The wrapper script
// (import-photo-locations.sh) handles compilation, bundling, and signing.
//
// Supports optional date-range filtering via environment variables:
//   PHOTO_START_DATE=2025-01-01  PHOTO_END_DATE=2025-12-31
//
// Output is written to a file (path from env PHOTO_OUTPUT_FILE or
// defaults to photo-records.json next to the binary).

import Photos
import Foundation

// ── Config from environment ────────────────────────────────────────
let env = ProcessInfo.processInfo.environment

let scriptDir = URL(fileURLWithPath: CommandLine.arguments[0]).deletingLastPathComponent()
let outputDir: URL
if scriptDir.path.contains(".app/Contents/MacOS") {
    outputDir = scriptDir
        .deletingLastPathComponent()  // Contents
        .deletingLastPathComponent()  // .app
        .deletingLastPathComponent()  // folder containing .app
} else {
    outputDir = scriptDir
}

let outputPath = env["PHOTO_OUTPUT_FILE"] ?? outputDir.appendingPathComponent("photo-records.json").path
let outputFile = URL(fileURLWithPath: outputPath)
let logFile = outputDir.appendingPathComponent("photo-extract.log")

// Date range filtering
let dateFormatter = DateFormatter()
dateFormatter.dateFormat = "yyyy-MM-dd"
dateFormatter.timeZone = TimeZone(identifier: "UTC")

var startFilter: Date? = nil
var endFilter: Date? = nil

if let s = env["PHOTO_START_DATE"] {
    startFilter = dateFormatter.date(from: s)
}
if let e = env["PHOTO_END_DATE"] {
    endFilter = dateFormatter.date(from: e)
}

// ── Logging ────────────────────────────────────────────────────────
try? "".write(to: logFile, atomically: true, encoding: .utf8)

func log(_ msg: String) {
    let line = msg + "\n"
    fputs(line, stderr)
    if let data = line.data(using: .utf8) {
        if let fh = try? FileHandle(forWritingTo: logFile) {
            fh.seekToEndOfFile()
            fh.write(data)
            fh.closeFile()
        }
    }
}

log("Output file: \(outputFile.path)")
if let s = startFilter { log("Start filter: \(dateFormatter.string(from: s))") }
if let e = endFilter   { log("End filter:   \(dateFormatter.string(from: e))") }

// ── Authorization ──────────────────────────────────────────────────
let semaphore = DispatchSemaphore(value: 0)
var authorized = false
var authStatusStr = ""

if #available(macOS 13.0, *) {
    PHPhotoLibrary.requestAuthorization(for: .readWrite) { status in
        switch status {
        case .authorized:    authStatusStr = "authorized"
        case .limited:       authStatusStr = "limited"
        case .denied:        authStatusStr = "denied"
        case .restricted:    authStatusStr = "restricted"
        case .notDetermined: authStatusStr = "notDetermined"
        @unknown default:    authStatusStr = "unknown"
        }
        authorized = (status == .authorized || status == .limited)
        semaphore.signal()
    }
} else {
    PHPhotoLibrary.requestAuthorization { status in
        authorized = (status == .authorized)
        authStatusStr = "\(status.rawValue)"
        semaphore.signal()
    }
}

semaphore.wait()
log("Authorization: \(authStatusStr)")

guard authorized else {
    log("ERROR: Photos access not authorized.")
    log("Grant access in System Settings > Privacy & Security > Photos")
    exit(1)
}

// ── Fetch all assets ───────────────────────────────────────────────
log("Fetching assets...")
let fetchOptions = PHFetchOptions()
fetchOptions.sortDescriptors = [NSSortDescriptor(key: "creationDate", ascending: true)]
let allAssets = PHAsset.fetchAssets(with: fetchOptions)
let total = allAssets.count
log("Total assets in library: \(total)")

// ── Scan for geotagged photos ──────────────────────────────────────
var jsonParts: [String] = []
jsonParts.reserveCapacity(total / 2)
var geoCount = 0
var skipped = 0
var filtered = 0

log("Scanning for geotagged photos...")

allAssets.enumerateObjects { (asset, index, _) in
    guard let location = asset.location else { skipped += 1; return }
    guard let date = asset.creationDate else { skipped += 1; return }

    let lat = location.coordinate.latitude
    let lng = location.coordinate.longitude
    if abs(lat) < 0.001 && abs(lng) < 0.001 { skipped += 1; return }

    // Apply date filters
    if let s = startFilter, date < s { filtered += 1; return }
    if let e = endFilter,   date > e { filtered += 1; return }

    let dateStr = dateFormatter.string(from: date)
    jsonParts.append("{\"lat\":\(lat),\"lng\":\(lng),\"date\":\"\(dateStr)\"}")
    geoCount += 1

    if (index + 1) % 5000 == 0 {
        log("  Scanned \(index + 1)/\(total) (\(geoCount) geotagged)")
    }
}

log("Done: \(geoCount) geotagged, \(skipped) no GPS, \(filtered) outside date range")

// ── Write JSON ─────────────────────────────────────────────────────
let jsonOutput = "[\n" + jsonParts.joined(separator: ",\n") + "\n]"
do {
    try jsonOutput.write(to: outputFile, atomically: true, encoding: .utf8)
    log("SUCCESS: Wrote \(geoCount) records to \(outputFile.path)")
} catch {
    log("ERROR writing: \(error)")
    exit(1)
}
