/**
 * Rewrites absolute asset paths to document-relative in Next.js static export (out/).
 * Required for Capacitor iOS/Android WebView. Run after `next build`, before `cap sync ios`.
 */
const fs = require('fs');
const path = require('path');

const outDir = path.join(process.cwd(), 'out');

function getRelativePrefix(filePath) {
  const relative = path.relative(outDir, path.dirname(filePath));
  if (!relative || relative === '.') return './';
  const depth = relative.split(path.sep).length;
  return '../'.repeat(depth);
}

function rewriteFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const prefix = getRelativePrefix(filePath);

  // Root-relative -> document-relative (no <base>; WKWebView can be picky)
  content = content.replace(/href="\/_next\//g, `href="${prefix}_next/`);
  content = content.replace(/src="\/_next\//g, `src="${prefix}_next/`);
  content = content.replace(/href="\/favicon/g, `href="${prefix}favicon`);
  content = content.replace(/url\(\/retromanager/g, `url(${prefix}retromanager`);
  content = content.replace(/"\/_next\//g, `"${prefix}_next/`);
  content = content.replace(/'\/_next\//g, `'${prefix}_next/`);
  content = content.replace(/\\"\/_next\//g, `\\"${prefix}_next/`);
  content = content.replace(/\\"\/favicon/g, `\\"${prefix}favicon`);

  fs.writeFileSync(filePath, content, 'utf8');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full);
    else if (e.name.endsWith('.html')) rewriteFile(full);
  }
}

if (!fs.existsSync(outDir)) {
  console.error('out/ not found. Run "npm run build" first.');
  process.exit(1);
}
walk(outDir);
console.log('Capacitor: rewrote asset paths in out/ for WebView.');
