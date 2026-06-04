#!/usr/bin/env node
// Generates PWA icons and favicons from docs/logo/logo-light.svg
// Requires: rsvg-convert (brew install librsvg)
//
// Outputs:
//   web/public/icons/             light  (white bg, blue logo)
//   web/public/icons/dark/        dark   (navy bg, white logo)
//   web/public/icons/transparent/ transparent (no bg, blue logo)
//   web/public/favicon.svg        SVG favicon  (transparent)
//   web/public/favicon.ico        multi-size ICO (16/32/48, transparent)
//   web/public/icons/favicon-{16,32,48}x*.png   transparent
//   web/public/icons/favicon-dark-{16,32,48}x*.png  transparent, white logo

const fs   = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT      = path.resolve(__dirname, '..');
const LOGO_SVG  = path.join(ROOT, 'docs/logo/logo-light.svg');
const ICONS_DIR = path.join(ROOT, 'web/public/icons');

// ── Parse logo inner content ──────────────────────────────────────────────────

const logoRaw = fs.readFileSync(LOGO_SVG, 'utf8');
const innerSVG = logoRaw
  .replace(/<\?xml[^>]*\?>\s*/g, '')
  .replace(/<!DOCTYPE[^>]*>\s*/g, '')
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim();

// ── Coordinate constants ──────────────────────────────────────────────────────
// Logo content centre and tight square bounds (calculated from circle extents).
// Using a single-layer SVG with <g> avoids nested-SVG clipping bugs in rsvg-convert.

const CX   = 512.01;   // horizontal centre of logo content
const CY   = 284.00;   // vertical centre of logo content
const HALF = 226.72;   // half of square side (437.45/2 + 4px margin ≈ 222.73 + 4 = 226.73)

// Standard viewBox: square, centred on logo, 4px margin around content
const VX = +(CX - HALF).toFixed(2);  // 285.29
const VY = +(CY - HALF).toFixed(2);  //  57.28
const VS = +(HALF * 2).toFixed(2);   // 453.44 (square side)

// ── Colours ───────────────────────────────────────────────────────────────────

const LIGHT_BG = '#ffffff';
const DARK_BG  = '#0c4a6e';

// ── Colour filter (blue → white) ─────────────────────────────────────────────

const WHITE_FILTER = `<defs>
  <filter id="wf" color-interpolation-filters="sRGB">
    <feColorMatrix type="matrix"
      values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>
  </filter>
</defs>`;

// ── SVG builders (no nested <svg>, just <g> inside one viewport) ──────────────

// Standard icon: rounded-rect background, logo filling ~88% of canvas
function makeIcon(bg, white) {
  const rx = (VS * 0.18).toFixed(1);  // ~iOS corner radius
  const fa = white ? ` filter="url(#wf)"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VX} ${VY} ${VS} ${VS}">
  ${white ? WHITE_FILTER : ''}
  <rect x="${VX}" y="${VY}" width="${VS}" height="${VS}" rx="${rx}" fill="${bg}"/>
  <g${fa}>${innerSVG}</g>
</svg>`;
}

// Maskable icon: full-bleed background, logo in safe zone (~78% of canvas)
// Safe zone = 80% circle; padding = 11% per side
function makeMaskable(bg, white) {
  const pad  = +(VS * 0.11).toFixed(2);
  const mx   = +(VX - pad).toFixed(2);
  const my   = +(VY - pad).toFixed(2);
  const ms   = +(VS + pad * 2).toFixed(2);
  const fa   = white ? ` filter="url(#wf)"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${mx} ${my} ${ms} ${ms}">
  ${white ? WHITE_FILTER : ''}
  <rect x="${mx}" y="${my}" width="${ms}" height="${ms}" fill="${bg}"/>
  <g${fa}>${innerSVG}</g>
</svg>`;
}

// Transparent icon: no background, logo fills canvas with 2px breathing room
function makeTransparent(white) {
  const fa = white ? ` filter="url(#wf)"` : '';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${VX} ${VY} ${VS} ${VS}">
  ${white ? WHITE_FILTER : ''}
  <g${fa}>${innerSVG}</g>
</svg>`;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function mkdirp(dir) { fs.mkdirSync(dir, { recursive: true }); }

function convert(svgContent, outPath, size) {
  const tmp = outPath + '.__tmp__.svg';
  fs.writeFileSync(tmp, svgContent);
  execSync(`rsvg-convert -w ${size} -h ${size} -o "${outPath}" "${tmp}"`);
  fs.unlinkSync(tmp);
}

// ── Sizes ─────────────────────────────────────────────────────────────────────

const APP_SIZES     = [72, 96, 128, 144, 152, 192, 384, 512];
const FAVICON_SIZES = [16, 32, 48];
const MASKABLE      = new Set([192, 512]);

// ── 1. Light (white bg, blue logo) ───────────────────────────────────────────

console.log('Light icons (white background)...');
mkdirp(ICONS_DIR);
for (const size of APP_SIZES) {
  const svg = MASKABLE.has(size) ? makeMaskable(LIGHT_BG, false) : makeIcon(LIGHT_BG, false);
  convert(svg, path.join(ICONS_DIR, `icon-${size}x${size}.png`), size);
  console.log(`  icon-${size}x${size}.png`);
}

// ── 2. Dark (navy bg, white logo) ────────────────────────────────────────────

console.log('Dark icons (navy background)...');
mkdirp(path.join(ICONS_DIR, 'dark'));
for (const size of APP_SIZES) {
  const svg = MASKABLE.has(size) ? makeMaskable(DARK_BG, true) : makeIcon(DARK_BG, true);
  convert(svg, path.join(ICONS_DIR, 'dark', `icon-${size}x${size}.png`), size);
  console.log(`  dark/icon-${size}x${size}.png`);
}

// ── 3. Transparent (no bg, blue logo) ────────────────────────────────────────

console.log('Transparent icons...');
mkdirp(path.join(ICONS_DIR, 'transparent'));
for (const size of APP_SIZES) {
  convert(makeTransparent(false), path.join(ICONS_DIR, 'transparent', `icon-${size}x${size}.png`), size);
  console.log(`  transparent/icon-${size}x${size}.png`);
}

// ── 4. Favicons ───────────────────────────────────────────────────────────────

console.log('Favicons...');

// SVG favicon — the original SVG as-is (already has tight viewBox)
fs.copyFileSync(LOGO_SVG, path.join(ROOT, 'web/public/favicon.svg'));
console.log('  favicon.svg');

// Transparent PNGs (16, 32, 48)
for (const size of FAVICON_SIZES) {
  convert(makeTransparent(false), path.join(ICONS_DIR, `favicon-${size}x${size}.png`), size);
  console.log(`  favicon-${size}x${size}.png`);
}

// Dark transparent PNGs (16, 32, 48) — white logo for dark browser chrome
for (const size of FAVICON_SIZES) {
  convert(makeTransparent(true), path.join(ICONS_DIR, `favicon-dark-${size}x${size}.png`), size);
  console.log(`  favicon-dark-${size}x${size}.png`);
}

// favicon.ico — real multi-size ICO (16/32/48, transparent)
const icoScript = `
import struct, sys, os

sizes = [16, 32, 48]
icons_dir = sys.argv[1]
out_path  = sys.argv[2]

pngs = []
for s in sizes:
    p = os.path.join(icons_dir, f'favicon-{s}x{s}.png')
    with open(p, 'rb') as f:
        pngs.append(f.read())

count = len(pngs)
header = struct.pack('<HHH', 0, 1, count)
offset = 6 + count * 16
entries = b''
for s, data in zip(sizes, pngs):
    w = s if s < 256 else 0
    h = s if s < 256 else 0
    entries += struct.pack('<BBBBHHII', w, h, 0, 0, 1, 32, len(data), offset)
    offset += len(data)

with open(out_path, 'wb') as f:
    f.write(header + entries)
    for data in pngs:
        f.write(data)
print('  favicon.ico (16/32/48px, transparent)')
`;

const icoScriptPath = path.join(ICONS_DIR, '_ico.py');
fs.writeFileSync(icoScriptPath, icoScript);
execSync(`python3 "${icoScriptPath}" "${ICONS_DIR}" "${path.join(ROOT, 'web/public/favicon.ico')}"`);
fs.unlinkSync(icoScriptPath);

console.log('\nDone.');
