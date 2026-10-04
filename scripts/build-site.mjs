import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const site = (process.argv[2] || process.env.SITE_URL || '').replace(/\/$/, '');
if (!site || !/^https:\/\/[a-z0-9.-]+(?::\d+)?(?:\/[a-z0-9._~!$&'()*+,;=:@%-]*)*$/i.test(site)) {
  console.error('Uso: node scripts/build-site.mjs https://usuario.github.io/repositorio');
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
if (path.dirname(output) !== root || path.basename(output) !== 'dist') throw new Error('Ruta de salida inesperada');
fs.rmSync(output, { recursive: true, force: true });
const config = fs.readFileSync(path.join(root, 'site-config.js'), 'utf8');
const amazonTag = config.match(/amazonTag:\s*["']([^"']*)["']/)?.[1] || '';
if (amazonTag && !/^[a-zA-Z0-9_-]+-21$/.test(amazonTag)) throw new Error('amazonTag debe ser el ID de seguimiento de Amazon.es terminado en -21.');
const publicReady = process.env.PUBLICATION_READY === 'true';
const legal = {
  name: process.env.LEGAL_NAME || '',
  address: process.env.LEGAL_ADDRESS || '',
  email: process.env.LEGAL_EMAIL || ''
};
if (publicReady && Object.values(legal).some((value) => !value.trim())) {
  throw new Error('Para producción: establece LEGAL_NAME, LEGAL_ADDRESS y LEGAL_EMAIL antes de PUBLICATION_READY=true.');
}
const include = [
  'index.html', 'styles.css', 'legal.css', 'app.js', 'ads.js', 'site-config.js', 'favicon.svg',
  'robots.txt', 'sitemap.xml', 'privacidad', 'afiliacion', 'aviso-legal'
];
for (const item of include) {
  const source = path.join(root, item);
  const destination = path.join(output, item);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.cpSync(source, destination, { recursive: true });
}
const sitemapPath = path.join(output, 'sitemap.xml');
const robotsPath = path.join(output, 'robots.txt');
let sitemap = publicReady
  ? fs.readFileSync(sitemapPath, 'utf8').replaceAll('https://CAMBIA-ESTA-URL', site)
  : '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>\n';
fs.writeFileSync(sitemapPath, sitemap);
fs.writeFileSync(robotsPath, publicReady
  ? `User-agent: *\nAllow: /\nSitemap: ${site}/sitemap.xml\n`
  : 'User-agent: *\nDisallow: /\n');
const htmlEscape = (value) => value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const visit = (dir) => {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { visit(full); continue; }
    if (!entry.name.endsWith('.html')) continue;
    const relativeDir = path.relative(output, path.dirname(full)).split(path.sep).filter(Boolean).join('/');
    const pageUrl = `${site}/${relativeDir ? `${relativeDir}/` : ''}`;
    let html = fs.readFileSync(full, 'utf8');
    html = html.replaceAll('{{LEGAL_NAME}}', htmlEscape(legal.name || '[TITULAR PENDIENTE]'))
      .replaceAll('{{LEGAL_ADDRESS}}', htmlEscape(legal.address || '[DOMICILIO PENDIENTE]'))
      .replaceAll('{{LEGAL_EMAIL}}', htmlEscape(legal.email || '[CORREO DE CONTACTO PENDIENTE]'));
    if (!publicReady) html = html.replace('</head>', '  <meta name="robots" content="noindex,nofollow">\n</head>');
    html = html.replace(/(<link\s+rel="canonical"\s+href=")[^"]*(">)/, `$1${pageUrl}$2`);
    if (!/<meta\s+property="og:url"/.test(html)) html = html.replace('</head>', `  <meta property="og:url" content="${pageUrl}">\n</head>`);
    fs.writeFileSync(full, html);
  }
};
visit(output);
console.log(`Sitio listo en dist/ para ${site}`);
