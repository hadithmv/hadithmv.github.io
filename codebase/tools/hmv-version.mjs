// tools/hmv-version.mjs - the site version(s) for the "Hadithmv Toolbox" menu.
// Reads the same appVersion block that the site sidebar shows (src/js/i18n.js),
// so the menu can never drift from the site. The " (Web)" suffix is dropped
// for the console. The node menu (tools/hmv-toolbox.mjs) imports the exported
// functions directly; the CLI keeps the pipe format for script use:
//   node tools/hmv-version.mjs        -> "SRCVERSION|DISTVERSION|PAD|BRANCH"
//   node tools/hmv-version.mjs live   -> the version the live site serves ('' if unreachable)
import fs from 'fs';
import https from 'https';
import path from 'path';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const RE = /appVersion[\s\S]*?en:\s*"([^"]+)"/;
const clean = (v) => v.replace(/ \(Web\)/, '');
const read = (f) => {
  try {
    const m = fs.readFileSync(path.join(ROOT, f), 'utf8').match(RE);
    return m ? clean(m[1]) : '';
  } catch (e) {
    return '';
  }
};

export function srcVersion() { return read('src/js/i18n.js'); }
export function distVersion() { return read('dist/js/i18n.js'); }

// The git branch ('' when not in a repo or git is missing).
export function branch() {
  try {
    const r = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' });
    if (r.status === 0) return r.stdout.trim();
  } catch (e) { /* no git */ }
  return '';
}

// The banner tail: " - " + branch, clamped to 12 chars ('' when no branch).
export function bannerTail() {
  const b = branch().slice(0, 12);
  return b ? ' - ' + b : '';
}

// The version the live site serves ('' when unreachable). The menu imports
// it directly for option 12; the CLI keeps the same call for scripts.
export function liveVersion() {
  return new Promise((resolve) => {
    const t = setTimeout(() => { resolve(''); }, 15000);
    https.get('https://hadithmv.github.io/codebase/dist/js/i18n.js', (r) => {
      let d = '';
      r.on('data', (c) => { d += c; });
      r.on('end', () => {
        clearTimeout(t);
        const m = d.match(RE);
        resolve(m ? clean(m[1]) : '');
      });
    }).on('error', () => { clearTimeout(t); resolve(''); });
  });
}

// CLI mode (no-op when imported): the banner tail padded to the menu's 50-wide
// box with a "." sentinel (the legacy cmd consumer drops the last char — the
// node menu computes its own padding and never needs the sentinel), plus the
// raw clamped branch as the 4th token.
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (process.argv[2] === 'live') {
    liveVersion().then((v) => console.log(v));
  } else {
    const ver = srcVersion();
    const tail = bannerTail();
    const b = branch().slice(0, 12);
    const pad = Math.max(0, 50 - 21 - ver.length - tail.length);
    console.log(ver + '|' + distVersion() + '|' + tail + new Array(pad + 1).join(' ') + '.' + '|' + b);
  }
}
