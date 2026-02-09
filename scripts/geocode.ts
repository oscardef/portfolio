#!/usr/bin/env npx tsx
/**
 * Geocode script — resolves place+country → lat, lng, country code
 * Uses the free OpenStreetMap Nominatim API (no account/key needed).
 *
 * Run:   npx tsx scripts/geocode.ts
 *
 * What it does:
 *   1. Reads rawTravelData from src/data/travel.ts
 *   2. Checks the cache file (src/data/geocode-cache.json)
 *   3. For any un-cached place, queries Nominatim
 *   4. Writes results back to the cache file
 *
 * The cache is committed to git so builds don't need network access.
 * Nominatim rate-limits to 1 req/sec so the script sleeps between calls.
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

// ── Types ──────────────────────────────────────────────────────────
interface CacheEntry {
  lat: number;
  lng: number;
  cc: string; // ISO 3166-1 alpha-2
}

type Cache = Record<string, CacheEntry>;

// ── Paths ──────────────────────────────────────────────────────────
const ROOT = join(__dirname, '..');
const CACHE_PATH = join(ROOT, 'src', 'data', 'geocode-cache.json');

// ── Load cache ─────────────────────────────────────────────────────
function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CACHE_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function saveCache(cache: Cache) {
  // Sort keys for stable diffs
  const sorted: Cache = {};
  for (const key of Object.keys(cache).sort()) {
    sorted[key] = cache[key];
  }
  writeFileSync(CACHE_PATH, JSON.stringify(sorted, null, 2) + '\n');
}

// ── Nominatim lookup ───────────────────────────────────────────────
async function geocode(place: string, country: string): Promise<CacheEntry | null> {
  const query = `${place}, ${country}`;
  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('q', query);
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('addressdetails', '1');

  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': 'oscar-portfolio-geocoder/1.0' },
  });

  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status} for "${query}"`);
    return null;
  }

  const data = await res.json();
  if (!data.length) {
    console.error(`  ✗ No results for "${query}"`);
    return null;
  }

  const result = data[0];
  const cc = (result.address?.country_code ?? '??').toUpperCase();

  return {
    lat: parseFloat(result.lat),
    lng: parseFloat(result.lon),
    cc,
  };
}

// ── Extract places from travel.ts ──────────────────────────────────
function getPlacesFromSource(): Array<{ place: string; country: string }> {
  const src = readFileSync(join(ROOT, 'src', 'data', 'travel.ts'), 'utf-8');

  const places: Array<{ place: string; country: string }> = [];
  // Match: { place: '...', country: '...' patterns in rawTravelData
  // Skip lines that start with // (commented out entries)
  const lines = src.split('\n');
  const regex = /place:\s*'([^']+)'.*?country:\s*'([^']+)'/;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('//')) continue;
    const match = regex.exec(line);
    if (match) {
      places.push({ place: match[1], country: match[2] });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  return places.filter((p) => {
    const key = `${p.place}, ${p.country}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ── Main ───────────────────────────────────────────────────────────
async function main() {
  const cache = loadCache();
  const places = getPlacesFromSource();

  console.log(`Found ${places.length} unique places in travel.ts`);

  let fetched = 0;
  for (const { place, country } of places) {
    const key = `${place}, ${country}`;
    if (cache[key]) {
      console.log(`  ✓ ${key} (cached)`);
      continue;
    }

    console.log(`  ⟳ Geocoding "${key}"...`);
    const result = await geocode(place, country);
    if (result) {
      cache[key] = result;
      console.log(`  ✓ ${key} → ${result.lat}, ${result.lng} (${result.cc})`);
      fetched++;
    }

    // Nominatim rate limit: max 1 request per second
    await new Promise((r) => setTimeout(r, 1100));
  }

  saveCache(cache);
  console.log(`\nDone. ${fetched} new lookups, ${Object.keys(cache).length} total cached entries.`);
  console.log(`Cache saved to src/data/geocode-cache.json`);
}

main().catch(console.error);
