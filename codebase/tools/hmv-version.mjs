// tools/hmv-version.mjs - the site version(s) for the "Hadithmv Toolbox" menu.
// Reads the same appVersion block that the site sidebar shows (src/js/i18n.js),
// so the menu can never drift from the site. The " (Web)" suffix is dropped
// for the console. The git branch (and its banner padding) ride along:
//   node tools/hmv-version.mjs        -> "SRCVERSION|DISTVERSION|PAD|BRANCH"
//   node tools/hmv-version.mjs live   -> the version the live site serves ('' if unreachable)
import fs from 'fs';
import https from 'https';
import { spawnSync } from 'child_process';

const RE = /appVersion[\s\S]*?en:\s*"([^"]+)"/;
const clean = (v) => v.replace(/ \(Web\)/, '');
const read = (f) => {
  try {
    const m = fs.readFileSync(f, 'utf8').match(RE);
    return m ? clean(m[1]) : '';
  } catch (e) {
    return '';
  }
};

// git branch, clamped to 12 chars, with the right-alignment padding for the
// 50-wide banner: "  " + name + " - " = 21 chars, plus the version's length.
const bannerBranch = (ver) => {
  let branch = '';
  try {
    const r = spawnSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' });
    if (r.status === 0) branch = r.stdout.trim();
  } catch (e) { /* no git */ }
  const b = branch.slice(0, 12);
  const pad = branch ? new Array(Math.max(0, 29 - ver.length - b.length) + 1).join(' ') : '';
  return pad + '|' + b;
};

if (process.argv[2] === 'live') {
  const t = setTimeout(() => { console.log(''); process.exit(0); }, 15000);
  https.get('https://hadithmv.github.io/codebase/dist/js/i18n.js', (r) => {
    let d = '';
    r.on('data', (c) => { d += c; });
    r.on('end', () => {
      clearTimeout(t);
      const m = d.match(RE);
      console.log(m ? clean(m[1]) : '');
    });
  }).on('error', () => { clearTimeout(t); console.log(''); });
} else {
  const ver = read('src/js/i18n.js');
  console.log(ver + '|' + read('dist/js/i18n.js') + '|' + bannerBranch(ver));
}
