#!/usr/bin/env node
/**
 * Lance npm avec un environnement sans les clés invalides (ex. devdir) que certains
 * environnements (IDE, sandbox) injectent via npm_config_* — ce qui déclenche
 * « Unknown env config "devdir" » sur npm récent.
 */
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const env = { ...process.env };
for (const key of Object.keys(env)) {
  if (key.toLowerCase() === 'npm_config_devdir') {
    delete env[key];
  }
}

const args = process.argv.slice(2);
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
const result = spawnSync(npm, args, {
  env,
  stdio: 'inherit',
  shell: process.platform === 'win32',
});
process.exit(result.status === null ? 1 : result.status);
