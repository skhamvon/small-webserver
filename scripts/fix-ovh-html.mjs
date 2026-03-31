/**
 * Post-traitement du miroir wget OVH :
 * - %3F dans les noms de fichiers → ? (aligné sur les fichiers réels)
 * - chemins absolus /sites/, /7af16cdb/ → origine ovhcloud.com (non présents dans le miroir à plat)
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const htmlPath = path.join(root, 'apps/host/public/ovh-bare-metal/index.html');

let html = fs.readFileSync(htmlPath, 'utf8');
const origin = 'https://www.ovhcloud.com';

if (!html.includes('<base href="/ovh-bare-metal/"')) {
  html = html.replace(/<head>/i, '<head>\n<base href="/ovh-bare-metal/" />');
}

html = html.replace(/%3F/g, '?');

html = html.replace(/href="\/7af16cdb/g, `href="${origin}/7af16cdb`);
html = html.replace(/<use href="\/7af16cdb/g, `<use href="${origin}/7af16cdb`);

html = html.replace(/srcset="\/sites\//g, `srcset="${origin}/sites/`);
html = html.replace(/src="\/sites\//g, `src="${origin}/sites/`);
html = html.replace(/href="\/sites\//g, `href="${origin}/sites/`);

html = html.replace(
  /src="HoeSD-Image\.png"/g,
  `src="${origin}/sites/default/files/styles/text_media_horizontal/public/2019-03/HoeSD-Image.png"`
);

fs.writeFileSync(htmlPath, html, 'utf8');
// eslint-disable-next-line no-console
console.log('[fix-ovh-html] OK:', htmlPath);
