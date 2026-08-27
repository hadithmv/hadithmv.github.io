// tools/hmv-version.mjs - the site version(s) for the "Hadithmv Tools" menu.
// Reads the same appVersion block that the site sidebar shows (src/js/i18n.js),
// so the menu can never drift from the site. The " (Web)" suffix is dropped
// for the console.
//   node tools/hmv-version.mjs        -> "SRCVERSION|DISTVERSION" ('' for a missing file)
//   node tools/hmv-version.mjs live   -> the version the live site serves ('' if unreachable)
import fs from 'fs';
import https from 'https';

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
  console.log(read('src/js/i18n.js') + '|' + read('dist/js/i18n.js'));
}
