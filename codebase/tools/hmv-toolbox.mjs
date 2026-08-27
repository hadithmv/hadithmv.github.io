// tools/hmv-toolbox.mjs - the Hadithmv Toolbox menu (node edition).
//
// A 13-item console menu for the common site tasks. Double-click the tiny
// launcher ("Hadithmv Toolbox.bat" on Windows) or run:
//   node tools/hmv-toolbox.mjs
// Run with a number argument to jump straight to an option, e.g.
//   node tools/hmv-toolbox.mjs 5   (the launcher passes its arguments through)
//
// Cross-platform: this script runs unchanged on Windows, macOS and Linux —
// only the double-click launcher differs per OS. The sibling bats
// (dist-build.bat, rebuild-index.bat) remain as quick paths.
//
// Ported 1:1 from the old self-contained bat (same text, same colours, same
// behaviour), minus cmd's quirks: no for /f token juggling, no %-escaping,
// no sentinel characters — the banner padding is computed here. Requires
// node on PATH; the preview option also needs Python.
//
// Colours use ANSI escapes (Windows 10+ consoles support them); on older
// consoles they degrade to harmless [92m-style text.

import fs from 'fs';
import os from 'os';
import path from 'path';
import { spawn, spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import readline from 'readline';
import { srcVersion, distVersion, branch, bannerTail, liveVersion } from './hmv-version.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
process.chdir(ROOT);

// ── colours ───────────────────────────────────────────────────────────
const OFF = '\x1b[0m';
const TITLE = '\x1b[92m'; // green — the banner box
const ITEM = '\x1b[96m'; // cyan — version numbers, menu numbers
const WARN = '\x1b[93m';
const ERR = '\x1b[91m';
const BOX = '+--------------------------------------------------+'; // 50 dashes

// ── the sound flag, kept in the user profile (outside the repo, so it
//    never shows in git status) ────────────────────────────────────────
const SOUND_FILE = path.join(os.homedir(), '.hadithmv-tools');
let muted = (() => {
  try { return fs.readFileSync(SOUND_FILE, 'utf8').trim() === '1'; } catch (e) { return false; }
})();
const setMuted = (m) => { muted = m; fs.writeFileSync(SOUND_FILE, m ? '1' : '0'); };

// ── PowerShell detection (used for the registry step + the failure buzz);
//    prefer pwsh (PS 7) — Windows PowerShell 5.1 cannot parse the BOM-less
//    UTF-8 registry script ─────────────────────────────────────────────
function shellName() {
  try {
    return spawnSync('pwsh', ['-NoProfile', '-Command', 'exit 0'], { stdio: 'ignore' }).status === 0
      ? 'pwsh' : 'powershell';
  } catch (e) { return 'powershell'; }
}
const PWR = shellName();

const beep = () => process.stdout.write('\x07\x07'); // success: BEL BEL
const buzz = () => { // failure: low 180 Hz double beep via the detected shell
  try {
    const c = spawn(PWR, ['-NoProfile', '-Command', '[console]::beep(180,450); Start-Sleep -m 120; [console]::beep(180,450)'], { stdio: 'ignore' });
    c.unref();
  } catch (e) { /* best effort */ }
};

// ── tiny helpers ──────────────────────────────────────────────────────
const clear = () => process.stdout.write('\x1b[2J\x1b[H');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function hasTool(name) {
  try { return spawnSync(name, ['--version'], { stdio: 'ignore' }).status === 0; }
  catch (e) { return false; }
}
function toolVersion(args) {
  try {
    const r = spawnSync('node', args, { encoding: 'utf8' });
    return r.status === 0 ? r.stdout.trim() : '';
  } catch (e) { return ''; }
}
function git(args) { return spawnSync('git', args, { encoding: 'utf8' }); }

// Windows: netstat; macOS: lsof; Linux: ss — which preview ports are up.
function listeningPorts(ports) {
  if (process.platform === 'win32') {
    const out = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
    const lines = (out.stdout || '').split(/\r?\n/);
    return ports.filter((p) => lines.some((l) => new RegExp(':' + p + '\\s').test(l) && l.indexOf('LISTENING') !== -1));
  }
  if (process.platform === 'darwin') {
    return ports.filter((p) => spawnSync('lsof', ['-iTCP:' + p, '-sTCP:LISTEN'], { stdio: 'ignore' }).status === 0);
  }
  return ports.filter((p) => {
    const out = spawnSync('ss', ['-tln'], { encoding: 'utf8' });
    return (out.stdout || '').split(/\r?\n/).some((l) => l.includes(':' + p) && l.includes('LISTEN'));
  });
}

// Open something the way the OS expects (URL, folder, file, program).
function openExternal(winArgs, macArgs, linArgs) {
  try {
    const cmd = process.platform === 'win32' ? 'cmd' : (process.platform === 'darwin' ? 'open' : 'xdg-open');
    const args = process.platform === 'win32' ? ['/c', ...winArgs] : (process.platform === 'darwin' ? macArgs : linArgs);
    const c = spawn(cmd, args, { detached: true, stdio: 'ignore' });
    c.unref();
  } catch (e) { /* best effort */ }
}
const openUrl = (u) => openExternal(['start', '', u], [u], [u]);
const openNotepad = (f) => openExternal(['start', '', 'notepad', f], [f], [f]);

// ── input ─────────────────────────────────────────────────────────────
// A manual line queue instead of rl.question: readline DROPS lines that
// arrive while no question is pending (piped input delivers several lines
// in one chunk), which would eat an answer typed just before a prompt.
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
let waiting = null;
let eof = false;
const lineQueue = [];
rl.on('line', (l) => {
  if (waiting) { const w = waiting; waiting = null; w(l); } else { lineQueue.push(l); }
});
rl.on('close', () => { // EOF: anything still waiting (or asked later) sees ''
  eof = true;
  if (waiting) { const w = waiting; waiting = null; w(''); }
});
rl.on('SIGINT', () => { process.stdout.write('\n'); process.exit(0); }); // Ctrl+C quits, like the bat
function ask(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    if (lineQueue.length) { resolve(lineQueue.shift().trim()); return; }
    if (eof) { resolve(''); return; }
    waiting = (a) => resolve(a.trim());
  });
}
async function pause() { await ask(WARN + 'Press Enter to continue.' + OFF); }

// ── banner + menu ─────────────────────────────────────────────────────
const VER = srcVersion();
const VERD = distVersion();
const BR = branch();

function showBanner() {
  clear();
  console.log(TITLE + BOX + OFF);
  if (VER && BR) {
    const tail = bannerTail();
    const pad = Math.max(0, 50 - 21 - VER.length - tail.length);
    console.log(TITLE + '|  Hadithmv Toolbox - ' + ITEM + VER + TITLE + OFF + tail + new Array(pad + 1).join(' ') + TITLE + '|' + OFF);
  } else if (VER) {
    const pad = Math.max(0, 50 - 21 - VER.length);
    console.log(TITLE + '|  Hadithmv Toolbox - ' + ITEM + VER + TITLE + OFF + new Array(pad + 1).join(' ') + TITLE + '|' + OFF);
  } else {
    console.log(TITLE + '|  Hadithmv Toolbox' + new Array(33).join(' ') + '|' + OFF);
  }
  console.log(TITLE + BOX + OFF);
  if (VER && !VERD) console.log(WARN + 'Warning: no built copy (dist) yet - run option 1.' + OFF);
  if (VER && VERD && VER !== VERD) console.log(WARN + 'Warning: the built copy (dist) is behind the source (' + VERD + ' vs ' + VER + ') - run option 1 before you commit.' + OFF);
  console.log();
  console.log(' ' + ITEM + '1.' + OFF + ' Build the site        (full build - run before you commit)');
  console.log(' ' + ITEM + '2.' + OFF + ' Rebuild search index  (so new books show up in search)');
  console.log(' ' + ITEM + '3.' + OFF + ' Refresh freshness     (quick update for data-only changes)');
  console.log(' ' + ITEM + '4.' + OFF + ' Refresh book data     (after adding or changing a book)');
  console.log(' ' + ITEM + '5.' + OFF + ' Preview the site      (opens in your browser, like the live one)');
  console.log(' ' + ITEM + '6.' + OFF + " What's changed        (what git would put in your next commit)");
  console.log(' ' + ITEM + '7.' + OFF + ' Tidy build reports    (undo the report changes from a build)');
  console.log(' ' + ITEM + '8.' + OFF + ' Open the folder       (the codebase folder in Explorer)');
  console.log(' ' + ITEM + '9.' + OFF + ' Build and preview     (build, then open the preview)');
  console.log(' ' + ITEM + '10.' + OFF + ' Run the checks       (the pre-commit verification battery)');
  console.log(' ' + ITEM + '11.' + OFF + ' About / health check (versions and tools on this machine)');
  console.log(' ' + ITEM + '12.' + OFF + ' Check the live site  (is the published site up to date?)');
  console.log(' ' + ITEM + '13.' + OFF + ' Quit');
  console.log();
}

async function invalid() {
  console.log();
  console.log(ERR + 'Not a valid choice - try again.' + OFF);
  await pause();
  return menu();
}

// ── the failure handler ───────────────────────────────────────────────
async function fail(step) {
  if (!muted) buzz();
  console.log();
  console.log(ERR + 'A step failed - read the error above. Nothing further was done.' + OFF);
  const hints = {
    build: 'the error above names the file - usually a syntax error.',
    index: 'the error above names the data file causing trouble.',
    manifest: 'this step is very quick - the error above is the whole story.',
    registry: "is the book's CSV already in the content folder?",
    preview: 'check that Python is installed and that the port is free.',
    git: 'git reported the error above itself.',
  };
  if (hints[step]) console.log(WARN + 'Hint: ' + hints[step] + OFF);
  await pause();
  return menu();
}

// Run a child with live output; resolves { ok, out } with captured output.
function runCaptured(cmd, args) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { cwd: ROOT });
    let out = '';
    c.stdout.on('data', (d) => { out += d; process.stdout.write(d); });
    c.stderr.on('data', (d) => { out += d; process.stdout.write(d); });
    // 'close' (not 'exit'): the last stdout chunk can still be in flight when
    // 'exit' fires — 'close' guarantees every byte is in `out` before resolve.
    c.on('close', (code) => resolve({ ok: code === 0, out }));
    c.on('error', () => resolve({ ok: false, out: '' }));
  });
}

// ── option 1 + 9: build / build-and-preview ───────────────────────────
function totalRow() {
  try {
    const line = fs.readFileSync(path.join(ROOT, 'dist-build-report.md'), 'utf8')
      .split(/\r?\n/).find((l) => l.startsWith('| **Total**'));
    if (!line) return null;
    const cells = line.split('|').map((c) => c.replace(/\*\*/g, '').trim());
    return { files: cells[2], input: cells[3], output: cells[4], saved: cells[5], gzip: cells[6] };
  } catch (e) { return null; }
}

async function build(followWithPreview) {
  process.title = 'Hadithmv Toolbox - building the site';
  console.log();
  console.log('Building the site - the full pre-commit build. This prepares');
  console.log('the copy that visitors see (dist/) and takes about a minute.');
  console.log();
  const t = Date.now();
  const code = await runCaptured('node', [path.join(ROOT, 'tools/dist-build.mjs')]).then((r) => r.ok ? 0 : 1);
  if (code) return fail('build');
  if (!muted) beep();
  const secs = Math.round((Date.now() - t) / 1000);
  console.log();
  if (followWithPreview) {
    console.log(secs ? 'Build done in ' + secs + ' seconds - opening the preview now.' : 'Build done - opening the preview now.');
    return preview();
  }
  console.log(secs ? 'Build done in ' + secs + ' seconds. Size summary:' : 'Build done. Size summary:');
  const row = totalRow();
  if (row) console.log('  Files: ' + row.files + '   Input: ' + row.input + '   Output: ' + row.output + '   Saved: ' + row.saved + '   Gzip: ' + row.gzip);
  console.log();
  console.log('When you are happy with it, commit in your IDE.');
  console.log(WARN + 'Tip: option 6 shows what git would put in your next commit.' + OFF);
  await pause();
  return menu();
}

// ── options 2/3/4: index, manifest, book-data refresh ─────────────────
async function index() {
  process.title = 'Hadithmv Toolbox - rebuilding search index';
  console.log();
  console.log('Rebuilding the search index - run after adding or changing a');
  console.log('book, so it shows up in search.');
  console.log();
  const ok = await runCaptured('node', [path.join(ROOT, 'data/08-rebuild-searchIndex.mjs')]).then((r) => r.ok);
  if (!ok) return fail('index');
  console.log();
  console.log('Search index rebuilt.');
  await pause();
  return menu();
}

async function manifest() {
  process.title = 'Hadithmv Toolbox - refreshing freshness';
  console.log();
  console.log('Refreshing the freshness file (dist/manifest.json) - the quick');
  console.log('update for data-only changes, when you are skipping the build.');
  console.log();
  const ok = await runCaptured('node', [path.join(ROOT, 'tools/hmv-manifest.mjs')]).then((r) => r.ok);
  if (!ok) return fail('manifest');
  console.log();
  console.log('Freshness file refreshed.');
  await pause();
  return menu();
}

async function refresh() {
  process.title = 'Hadithmv Toolbox - refreshing book data';
  console.log();
  console.log('Refreshing book data - 3 steps. Make sure the book\'s CSV is');
  console.log('already in the content folder first.');
  console.log();
  console.log('Step 1 of 3 - updating the book registry (recomputes versions)...');
  let ok = await runCaptured(PWR, ['-NoProfile', '-ExecutionPolicy', 'Bypass', '-File', path.join(ROOT, 'data/04-update-bookRegistry.ps1')]).then((r) => r.ok);
  if (!ok) return fail('registry');
  console.log('Step 2 of 3 - rebuilding the search index...');
  ok = await runCaptured('node', [path.join(ROOT, 'data/08-rebuild-searchIndex.mjs')]).then((r) => r.ok);
  if (!ok) return fail('index');
  console.log('Step 3 of 3 - refreshing the freshness file...');
  ok = await runCaptured('node', [path.join(ROOT, 'tools/hmv-manifest.mjs')]).then((r) => r.ok);
  if (!ok) return fail('manifest');
  console.log();
  console.log('All three steps done.');
  await pause();
  return menu();
}

// ── option 5: preview ─────────────────────────────────────────────────
async function preview() {
  process.title = 'Hadithmv Toolbox - starting preview';
  console.log();
  console.log('Starting a local preview - a server window will open, and your');
  console.log('browser will show the built site, just like the live one.');
  console.log('Close the server window when you are done.');
  console.log();
  if (!hasTool('python')) return noPython();
  if (listeningPorts([8897, 8898, 8899]).length) {
    console.log();
    console.log('A preview server is already running on one of the preview ports.');
    console.log('If that is the preview from earlier, just press F5 in that tab');
    console.log('to see the newest build. If it is something else, close it');
    console.log('first, then try again.');
    await pause();
    return menu();
  }
  const PORT = 8899;
  console.log();
  console.log('Opening on http://127.0.0.1:' + PORT + '/dist/books/ (port ' + PORT + ' is free).');
  try { // the server gets its own console window (Windows) — close it when done
    const c = spawn('cmd', ['/c', 'start', '"Hadithmv preview (port ' + PORT + ') - close this window when done"', 'python', '-m', 'http.server', String(PORT), '--directory', ROOT], { detached: true, stdio: 'ignore' });
    c.unref();
  } catch (e) { return fail('preview'); }
  let up = false;
  for (let i = 0; i < 3; i++) { await sleep(1000); if (listeningPorts([PORT]).length) { up = true; break; } }
  if (!up) return fail('preview');
  openUrl('http://127.0.0.1:' + PORT + '/dist/books/');
  console.log();
  console.log('Preview started. Close the server window when done, then press Enter.');
  await pause();
  return menu();
}

// ── option 6 + 7: what's changed, tidy build reports ──────────────────
async function changed() {
  process.title = "Hadithmv Toolbox - what's changed";
  console.log();
  console.log('Here is what git would put in your next commit:');
  console.log();
  if (!hasTool('git')) return noGit();
  const st = git(['status', '--porcelain']);
  if (st.status !== 0) return fail('git');
  if (!st.stdout.trim()) {
    console.log();
    console.log('Nothing changed - the tree is clean.');
    console.log();
    await pause();
    return menu();
  }
  console.log(st.stdout.trimEnd());
  const src = git(['status', '--porcelain', '--', 'src', 'static']).stdout.trim();
  const dist = git(['status', '--porcelain', '--', 'dist']).stdout.trim();
  const data = git(['status', '--porcelain', '--', 'data']).stdout.trim();
  console.log();
  if (src && !dist) console.log(WARN + 'Hint: you changed source files but did not build - run option 1 first.' + OFF);
  if (data) console.log(WARN + 'Hint: you changed book data - run option 4 to refresh it.' + OFF);
  console.log();
  await pause();
  return menu();
}

async function tidy() {
  process.title = 'Hadithmv Toolbox - tidying the build reports';
  console.log();
  console.log('Tidy the build reports (dist-build-report.md and');
  console.log('font-build-report.md) to their committed state - handy when');
  console.log('the build itself was not the point of your change.');
  console.log();
  if (!hasTool('git')) return noGit();
  const st = git(['status', '--porcelain', '--', 'dist-build-report.md', 'font-build-report.md']);
  if (st.status !== 0) return fail('git');
  if (!st.stdout.trim()) {
    console.log();
    console.log('The build reports are already clean - nothing to tidy.');
  } else {
    git(['checkout', '--', 'dist-build-report.md', 'font-build-report.md']);
    console.log();
    console.log('Reports restored - they no longer show in "what\'s changed".');
  }
  await pause();
  return menu();
}

// ── option 8: open the folder ─────────────────────────────────────────
async function openFolder() {
  process.title = 'Hadithmv Toolbox - opening the folder';
  console.log();
  console.log('Opening the codebase folder in Explorer...');
  openExternal(['start', '', 'explorer', ROOT], [ROOT], [ROOT]);
  console.log();
  console.log('Done - press Enter to go back to the menu.');
  await pause();
  return menu();
}

// ── option 10: run the checks ─────────────────────────────────────────
const CHECK_NAMES = [
  'reader smoke test',
  'info modal battery',
  'authors and periods battery',
  'library scope battery',
  'service worker battery',
  'table-of-contents scan',
  'font coverage check',
];
const CHECKS = [
  { file: 'tools/hmv-qrn-smoke.mjs', name: 'reader', label: '1/7 - the reader smoke test (clicks through the Quran reader)...' },
  { file: 'tools/hmv-info-check.mjs', name: 'info', label: '2/7 - the info modal battery...' },
  { file: 'tools/hmv-authors-check.mjs', name: 'authors', label: '3/7 - the authors and periods battery...' },
  { file: 'tools/hmv-libscope-check.mjs', name: 'library', label: '4/7 - the library scope battery...' },
  { file: 'tools/hmv-sw-check.mjs', name: 'service-worker', label: '5/7 - the service worker battery...' },
  { file: 'tools/hmv-toc-scan.cjs', name: 'contents', label: '6/7 - the table-of-contents scan...' },
];
const FONT_LABEL = "7/7 - the font coverage check (the webfont vs the site's text)...";

async function checks() {
  process.title = 'Hadithmv Toolbox - running the checks';
  console.log();
  console.log('Running the pre-commit checks - each opens an invisible browser');
  console.log('and clicks through a part of the site. This takes a few minutes.');
  console.log();
  const RPT = path.join(ROOT, 'checks-report.md');
  const t = Date.now();
  const results = []; // { ok: true|false|null(SKIP), out }
  const failed = [];
  try { fs.unlinkSync(RPT); } catch (e) { /* first run */ }
  fs.writeFileSync(RPT, [
    '# Hadithmv Toolbox - checks report', '',
    'Run date: ' + new Date().toLocaleString(), '',
    'Source: ' + VER + ' | Built: ' + VERD + ' | Branch: ' + BR,
  ].join('\n') + '\n');
  for (const c of CHECKS) {
    console.log(' ' + c.label);
    const r = await runCaptured('node', [path.join(ROOT, c.file)]);
    results.push(r);
    if (!r.ok) failed.push(c.name);
    console.log();
  }
  if (hasTool('python')) {
    console.log(' ' + FONT_LABEL);
    const r = await runCaptured('python', [path.join(ROOT, 'tools/hmv-font-subset.py'), '--check']);
    results.push(r);
    if (!r.ok) failed.push('font');
  } else {
    console.log(' 7/7 - the font coverage check skipped - python not found.');
    results.push({ ok: null, out: 'Skipped: python not found.' });
  }
  console.log();
  const secs = Math.round((Date.now() - t) / 1000);
  const verdict = (r) => (r.ok === null ? 'SKIP' : (r.ok ? 'PASS' : 'FAIL'));
  const lines = ['', '## Summary', '', '| Check | Result |', '| --- | --- |'];
  CHECK_NAMES.forEach((n, i) => lines.push('| ' + (i + 1) + '/7 ' + n + ' | ' + verdict(results[i]) + ' |'));
  lines.push('', '## Details', '');
  CHECK_NAMES.forEach((n, i) => {
    lines.push('### ' + (i + 1) + '/7 ' + n + ' - ' + verdict(results[i]));
    lines.push('```', results[i].out.trimEnd(), '```', '');
  });
  lines.push('---', '', secs ? 'Run time: ' + secs + ' seconds' : '',
    failed.length ? '**Verdict: SOME CHECKS FAILED - ' + failed.join(' ') + '**' : '**Verdict: ALL CHECKS PASSED**');
  fs.appendFileSync(RPT, lines.join('\n') + '\n');
  console.log();
  if (failed.length) {
    if (!muted) buzz();
    console.log(ERR + 'Some checks failed:' + OFF + ' ' + failed.join(' '));
    console.log(WARN + 'The full report is in checks-report.md - opening it now.' + OFF);
    openNotepad(RPT);
  } else {
    if (!muted) beep();
    console.log(ITEM + 'All checks passed.' + OFF);
    console.log(ITEM + 'Report saved to checks-report.md.' + OFF);
  }
  await pause();
  return menu();
}

// ── option 11: about / health ─────────────────────────────────────────
async function about() {
  process.title = 'Hadithmv Toolbox - about';
  const nodeV = toolVersion(['--version']);
  // python --version goes to stdout on modern Python (stderr on very old ones) —
  // read whichever stream has the answer.
  const pyV = hasTool('python') ? (() => { try { const r = spawnSync('python', ['--version'], { encoding: 'utf8' }); return (r.stdout || '').trim() || (r.stderr || '').trim(); } catch (e) { return ''; } })() : '';
  const gitV = hasTool('git') ? (() => { try { return git(['--version']).stdout.trim(); } catch (e) { return ''; } })() : '';
  console.log();
  console.log(' Site version (source):  ' + ITEM + VER + OFF);
  console.log(' Built copy (dist):      ' + ITEM + VERD + OFF);
  if (VER && !VERD) console.log(' ' + WARN + 'There is no dist yet - run option 1.' + OFF);
  if (VER && VERD && VER !== VERD) console.log(' ' + WARN + 'dist is behind source - run option 1.' + OFF);
  console.log(' Folder:                 ' + ROOT);
  if (BR) console.log(' Branch:                 ' + BR);
  console.log(' Sound:                  ' + (muted ? 'off' : 'on'));
  console.log();
  console.log(' Tools on this machine:');
  console.log(nodeV ? '  ' + ITEM + nodeV + OFF + '   node - needed for options 1-4 and 9' : '  ' + ERR + 'node not found' + OFF + ' - install from nodejs.org');
  console.log(pyV ? '  ' + ITEM + pyV + OFF + '   python - needed for option 5' : '  ' + ERR + 'python not found' + OFF + ' - install from python.org');
  console.log(gitV ? '  ' + ITEM + gitV + OFF + '   git - needed for options 6, 7 and 12' : '  ' + ERR + 'git not found' + OFF + ' - install from git-scm.com');
  console.log('  ' + ITEM + PWR + OFF + '   shell - used for option 4');
  console.log();
  console.log(' Press S to switch the sound on or off, any other key for the menu.');
  const a = await ask(WARN + '> ' + OFF);
  if (a.toLowerCase() === 's') { setMuted(!muted); return about(); }
  return menu();
}

// ── option 12: check the live site ────────────────────────────────────
async function livecheck() {
  process.title = 'Hadithmv Toolbox - checking the live site';
  console.log();
  console.log('Checking the published site (needs internet)...');
  const live = await liveVersion();
  console.log();
  if (!live) {
    console.log(ERR + 'Could not reach the live site - check the internet connection.' + OFF);
  } else if (live === VER) {
    console.log(ITEM + 'The live site is up to date: ' + live + '.' + OFF);
  } else {
    console.log(WARN + 'The live site is behind: live ' + live + ', local ' + VER + '.' + OFF);
    console.log(WARN + 'Have you pushed, and did the GitHub Pages build finish?' + OFF);
  }
  console.log();
  await pause();
  return menu();
}

// ── error screens ─────────────────────────────────────────────────────
async function noPython() {
  console.log();
  console.log(ERR + 'Python was not found - the preview needs Python. Install it from' + OFF);
  console.log(ERR + 'python.org and try again.' + OFF);
  await pause();
  return menu();
}
async function noGit() {
  console.log();
  console.log(ERR + 'Git was not found - this option needs git. Install it from' + OFF);
  console.log(ERR + 'git-scm.com and try again.' + OFF);
  await pause();
  return menu();
}

// ── dispatch + quit ───────────────────────────────────────────────────
function quit() {
  console.log(TITLE + 'Bye.' + OFF);
  rl.close();
  process.exitCode = 0;
  setTimeout(() => process.exit(0), 300); // safety net if a stray handle lingers
}

async function dispatch(c) {
  switch (c) {
    case '1': return build(false);
    case '2': return index();
    case '3': return manifest();
    case '4': return refresh();
    case '5': return preview();
    case '6': return changed();
    case '7': return tidy();
    case '8': return openFolder();
    case '9': return build(true);
    case '10': return checks();
    case '11': return about();
    case '12': return livecheck();
    case '13': return quit();
    default: return invalid();
  }
}

async function menu() {
  showBanner();
  const a = await ask(WARN + 'Pick a number: ' + OFF);
  if (!a) {
    // An empty Enter on a piped (closed) stdin means the caller is done —
    // exit cleanly instead of looping forever. On a real console it is just
    // an invalid choice, as the bat behaved.
    if (!process.stdin.isTTY) return quit();
    return invalid();
  }
  return dispatch(a);
}

// A number argument jumps straight to that option (the launcher passes it
// through); the option still lands on the menu when it is done.
if (process.argv[2] && /^[0-9]+$/.test(process.argv[2])) {
  await dispatch(process.argv[2]);
} else {
  await menu();
}
