#!/usr/bin/env node
// Generates PWA icons and favicon from docs/logo/logo-light.svg
// Requires: rsvg-convert (brew install librsvg)

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const LOGO_SVG = path.join(ROOT, 'docs/logo/logo-light.svg');
const ICONS_DIR = path.join(ROOT, 'web/public/icons');
const FAVICON_PATH = path.join(ROOT, 'web/public/favicon.ico');

const logoContent = fs.readFileSync(LOGO_SVG, 'utf8');
// Strip the outer <svg ...> wrapper so we can re-embed the paths
const innerSVG = logoContent
  .replace(/<\?xml[^>]*\?>\s*/g, '')
  .replace(/<!DOCTYPE[^>]*>\s*/g, '')
  .replace(/^<svg[^>]*>/, '')
  .replace(/<\/svg>\s*$/, '')
  .trim();

// Wrapper that embeds the logo in a padded, rounded-corner square
function makeWrapper(bg, logoFill) {
  // The logo viewBox is "262 34 500 500" — we use a nested svg to handle this cleanly
  // logoFill: null = keep original colours, 'white' = override fills to white
  const filter = logoFill === 'white'
    ? `<defs>
        <filter id="white-fill" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>
        </filter>
      </defs>`
    : '';
  const filterAttr = logoFill === 'white' ? ' filter="url(#white-fill)"' : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${filter}
  <rect width="512" height="512" rx="90" fill="${bg}"/>
  <svg x="56" y="56" width="400" height="400" viewBox="262 34 500 500"${filterAttr}>
    ${innerSVG}
  </svg>
</svg>`;
}

// Maskable variant: more padding so the logo stays in the safe zone
function makeMaskable(bg, logoFill) {
  const filter = logoFill === 'white'
    ? `<defs>
        <filter id="white-fill" color-interpolation-filters="sRGB">
          <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"/>
        </filter>
      </defs>`
    : '';
  const filterAttr = logoFill === 'white' ? ' filter="url(#white-fill)"' : '';

  return `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  ${filter}
  <rect width="512" height="512" fill="${bg}"/>
  <svg x="96" y="96" width="320" height="320" viewBox="262 34 500 500"${filterAttr}>
    ${innerSVG}
  </svg>
</svg>`;
}

const SIZES = [72, 96, 128, 144, 152, 192, 384, 512];

// Colours
const LIGHT_BG = '#ffffff';
const DARK_BG  = '#0c4a6e';   // matches manifest background_color

function writeAndConvert(svgContent, outPath, size) {
  const tmpSvg = outPath.replace(/\.png$/, '_tmp.svg');
  fs.writeFileSync(tmpSvg, svgContent);
  execSync(`rsvg-convert -w ${size} -h ${size} -o "${outPath}" "${tmpSvg}"`);
  fs.unlinkSync(tmpSvg);
}

// --- Light icons (white background, original blue logo) ---
console.log('Generating light icons...');
for (const size of SIZES) {
  const isMaskable = size === 192 || size === 512;
  const svg = isMaskable
    ? makeMaskable(LIGHT_BG, null)
    : makeWrapper(LIGHT_BG, null);
  writeAndConvert(svg, path.join(ICONS_DIR, `icon-${size}x${size}.png`), size);
  console.log(`  icon-${size}x${size}.png`);
}

// --- Dark icons (dark background, white logo) ---
console.log('Generating dark icons...');
fs.mkdirSync(path.join(ICONS_DIR, 'dark'), { recursive: true });
for (const size of SIZES) {
  const isMaskable = size === 192 || size === 512;
  const svg = isMaskable
    ? makeMaskable(DARK_BG, 'white')
    : makeWrapper(DARK_BG, 'white');
  writeAndConvert(svg, path.join(ICONS_DIR, 'dark', `icon-${size}x${size}.png`), size);
  console.log(`  dark/icon-${size}x${size}.png`);
}

// --- Favicon: embed the SVG directly as favicon.svg, also make a 32x32 PNG ---
console.log('Generating favicon...');
// SVG favicon (modern browsers)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="262 34 500 500">
  ${innerSVG}
</svg>`;
fs.writeFileSync(path.join(ROOT, 'web/public/favicon.svg'), faviconSvg);
console.log('  favicon.svg');

// 32x32 PNG for legacy favicon.ico via sips
const favicon32Path = path.join(ICONS_DIR, 'favicon-32x32.png');
const favicon16Path = path.join(ICONS_DIR, 'favicon-16x16.png');
const faviconWrapSvg = makeWrapper(LIGHT_BG, null);
const tmpFavicon = path.join(ICONS_DIR, 'favicon_tmp.svg');
fs.writeFileSync(tmpFavicon, faviconWrapSvg);
execSync(`rsvg-convert -w 32 -h 32 -o "${favicon32Path}" "${tmpFavicon}"`);
execSync(`rsvg-convert -w 16 -h 16 -o "${favicon16Path}" "${tmpFavicon}"`);
fs.unlinkSync(tmpFavicon);
console.log('  favicon-32x32.png, favicon-16x16.png');

// Combine 16+32 into a .ico using sips (macOS)
// sips can't make multi-size .ico directly, so copy the 32x32 as .ico
execSync(`cp "${favicon32Path}" "${FAVICON_PATH}"`);
console.log('  favicon.ico (32x32)');

console.log('\nDone. All icons written to web/public/icons/');
