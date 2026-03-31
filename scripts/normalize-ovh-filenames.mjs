/**
 * Le miroir wget crée des fichiers dont le nom contient un « ? » (ex. sentry.min.js?v=1.0.3).
 * En HTTP, ?v= est interprété comme query string : le chemin vu par Express est sentry.min.js,
 * qui ne correspond pas au fichier sur disque → 404 puis fallback SPA (page « cassée »).
 * On renomme vers le nom avant le premier « ? » (en cas de doublon, on garde le premier fichier).
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const dir = path.join(root, 'apps/host/public/ovh-bare-metal');

function main() {
  if (!fs.existsSync(dir)) {
    // eslint-disable-next-line no-console
    console.warn('[normalize-ovh] Dossier absent:', dir);
    return;
  }

  const names = fs.readdirSync(dir);
  const withQuery = names.filter((n) => n.includes('?'));
  let renamed = 0;
  let dropped = 0;

  for (const name of withQuery) {
    const base = name.split('?')[0];
    const src = path.join(dir, name);
    const dst = path.join(dir, base);
    if (src === dst) continue;
    if (fs.existsSync(dst)) {
      fs.unlinkSync(src);
      dropped++;
      continue;
    }
    fs.renameSync(src, dst);
    renamed++;
  }

  // eslint-disable-next-line no-console
  console.log(
    `[normalize-ovh] OK: ${renamed} renommage(s), ${dropped} doublon(s) supprimé(s)`
  );
}

main();
