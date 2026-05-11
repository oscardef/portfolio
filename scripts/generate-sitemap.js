const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.BASE_URL || 'https://oscar.defrancesca.com';
const outPath = path.join(process.cwd(), 'public', 'sitemap.xml');

function getFiles(dir, prefix = '') {
  const entries = [];
  if (!fs.existsSync(dir)) return entries;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      entries.push(...getFiles(full, path.join(prefix, name)));
    } else if (/\.(mdx?|tsx?|html?)$/.test(name)) {
      entries.push(path.join(prefix, name));
    }
  }
  return entries;
}

// Collect content files under /content
const contentDir = path.join(process.cwd(), 'content');
const contentFiles = getFiles(contentDir);

// Start with known static routes
const urls = new Set([
  '/',
  '/about',
  '/projects',
  '/experience',
]);

for (const f of contentFiles) {
  const parts = f.split(path.sep);
  // remove leading '.' or 'content' segments
  if (parts[0] === 'content') parts.shift();
  const filename = parts.pop();
  const name = filename.replace(/\.(mdx?|tsx?|html?)$/, '');
  const route = '/' + [...parts, name].join('/');
  urls.add(route.replace(/\/index$/, '/'));
}

// Add any image or asset directories you want indexed (optional)

const now = new Date().toISOString();
const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[...urls]
  .map(
    (u) => `  <url>\n    <loc>${BASE_URL}${u}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.7</priority>\n  </url>`
  )
  .join('\n')}\n</urlset>`;

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, xml, 'utf8');
console.log('Wrote', outPath);
