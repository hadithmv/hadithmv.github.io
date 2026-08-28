// tools/hmv-toolbox.mjs - the Hadithmv Toolbox menu (node edition).
//
// A 17-item console menu for the common site tasks. Double-click the tiny
// launcher ("Hadithmv Toolbox.bat" on Windows) or run:
//   node tools/hmv-toolbox.mjs
// Run with a number argument to jump straight to an option, e.g.
//   node tools/hmv-toolbox.mjs 5   (the launcher passes its arguments through)
//
// ── what's here: option → function ─────────────────────────────────────
//  1  build()                    full build into dist/ + size summary,
//                                then offers to run the checks
//  2  index()                    rebuild the search index
//  3  manifest()                 rewrite dist/manifest.json (freshness)
//  4  refresh()                  3 steps: registry PS1 + index + manifest
//  5  preview()                  python http.server on 8899; when one is
//                                already running: open it or stop it (S)
//  6  changed()                  git status + hints
//  7  tidy()                     restore the two committed build reports
//  8  openFolder()               Explorer on the codebase folder
//  9  build(true)                build + preview
// 10  checks()                   the 7 batteries, or one; checks-report.md
// 11  about()                    versions, tools, preview + last-checks
//                                state; S toggles the sound
// 12  livecheck()                compare the published version with local
// 13  openNotes()                Explorer on static/notes/ (authors + works)
// 14  newBook()                  copy a template + add-a-book checklist,
//                                then offers to fill the registry row
// 15  finishBookRegistration()   fill/edit a book's row in
//                                03-registry-bookMeta.csv
// 16  addAuthor()                append a row to 02-registry-bookAuthors.csv
// 17  quit()                     exit
//
// Shared helpers used by several options: runCaptured() (every worker
// step), openExternal()/openUrl()/openNotepad() (options 5, 8, 10, 12, 13),
// listeningPorts()/listenerPids()/previewStatus() (option 5, About and the
// menu footer), lastChecks()/footerLine() (the menu footer + About),
// csvQuote()/csvFields()/readRegistry()/writeRegistry()/registryCodes()/
// bookVersion() (options 15 and 16 - the registries are quoted CSV;
// `version` is ALWAYS the last column and is never typed, always computed).
// The human-facing reference is docs/TOOLBOX.md - read it before touching
// this file or the batteries.
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

import crypto from 'crypto';
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
const DIM = '\x1b[90m'; // gray - the footer / status line
const BOX = '+--------------------------------------------------+'; // 50 dashes

// ── the sound flag, kept in the user profile (outside the repo, so it
//    never shows in git status) ────────────────────────────────────────
const SOUND_FILE = path.join(os.homedir(), '.hadithmv-tools');
let muted = (() => {
  try { return fs.readFileSync(SOUND_FILE, 'utf8').trim() === '1'; } catch (e) { return false; }
})();
const setMuted = (m) => { muted = m; fs.writeFileSync(SOUND_FILE, m ? '1' : '0'); };

// ── PowerShell detection (used for the registry step + the failure buzz);
//    prefer pwsh (PS 7); the registry script carries a UTF-8 BOM so even
//    Windows PowerShell 5.1 parses it ──────────────────────────────────
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
// Cached preview state (5 s) - the footer and the About screen redraw often,
// and netstat spawns are not free; the preview option itself always asks for
// a fresh check.
let _pvAt = 0;
let _pvPorts = [];
function previewStatus() {
  if (Date.now() - _pvAt > 5000) { _pvAt = Date.now(); _pvPorts = listeningPorts([8897, 8898, 8899]); }
  return _pvPorts;
}
// PIDs listening on the given ports (for the preview-stop rescue).
function listenerPids(ports) {
  if (process.platform === 'win32') {
    const out = spawnSync('netstat', ['-ano'], { encoding: 'utf8' });
    const pids = new Set();
    for (const l of (out.stdout || '').split(/\r?\n/)) {
      if (l.indexOf('LISTENING') === -1) continue;
      for (const p of ports) {
        if (new RegExp(':' + p + '\\s').test(l)) {
          const t = l.trim().split(/\s+/);
          const pid = t[t.length - 1];
          if (/^\d+$/.test(pid)) pids.add(pid);
        }
      }
    }
    return Array.from(pids);
  }
  try { // macOS/Linux: lsof prints the PIDs themselves (-t)
    const out = spawnSync('lsof', ['-tiTCP:' + ports.join(','), '-sTCP:LISTEN'], { encoding: 'utf8' });
    return (out.stdout || '').trim().split(/\s+/).filter((l) => /^\d+$/.test(l));
  } catch (e) { return []; }
}

// Open something the way the OS expects (URL, folder, file, program).
function openExternal(winArgs, macArgs, linArgs) {
  try {
    const c = process.platform === 'win32'
      // winArgs go through `start` — join them into ONE verbatim string so
      // node's arg quoting can't mangle them (it rewrites embedded quotes,
      // which makes cmd read a quoted start-title as a program name).
      ? spawn('cmd', ['/c', winArgs.join(' ')], { detached: true, stdio: 'ignore', windowsVerbatimArguments: true })
      : spawn(process.platform === 'darwin' ? 'open' : 'xdg-open', process.platform === 'darwin' ? macArgs : linArgs, { detached: true, stdio: 'ignore' });
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
  console.log(' ' + ITEM + '13.' + OFF + ' Open the notes folder (authors + works markdown)');
  console.log(' ' + ITEM + '14.' + OFF + ' New book           (copy a template + checklist)');
  console.log(' ' + ITEM + '15.' + OFF + ' Finish a book registration (fill the registry row)');
  console.log(' ' + ITEM + '16.' + OFF + ' Add an author      (append to the authors registry)');
  console.log(' ' + ITEM + '17.' + OFF + ' Quit');
  console.log(DIM + '--------------------------------------------------' + OFF); // a dim rule closes the menu; the footer below is status, not an option
  console.log(footerLine());
  console.log();
}

// The one-line state footer under the menu: when the checks last ran (and
// the verdict) and whether a preview server is up.
function footerLine() {
  const c = lastChecks();
  const ports = previewStatus();
  let chk;
  if (!c) chk = DIM + 'checks: never run' + OFF;
  else if (c.text.indexOf('FAILED') !== -1) chk = DIM + 'checks: ' + OFF + ERR + 'failed' + OFF + DIM + ' ' + c.when + OFF;
  else chk = DIM + 'checks: ' + OFF + ITEM + 'passed' + OFF + DIM + ' ' + c.when + OFF;
  const prv = ports.length ? ITEM + 'preview: running on ' + ports[0] + OFF : DIM + 'preview: off' + OFF;
  return ' ' + chk + DIM + '  |  ' + OFF + prv;
}

// The verdict + run time out of checks-report.md (a local file - cheap).
// Returns null when the report has never been written (or has no verdict).
function lastChecks() {
  try {
    const t = fs.readFileSync(path.join(ROOT, 'checks-report.md'), 'utf8');
    const m = t.match(/\*\*Verdict: ([^*]+)\*\*/);
    if (!m) return null;
    const d = fs.statSync(path.join(ROOT, 'checks-report.md')).mtime;
    const hh = ('0' + d.getHours()).slice(-2);
    const mm = ('0' + d.getMinutes()).slice(-2);
    const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const days = Math.round((startOf(new Date()) - startOf(d)) / 86400000);
    const when = days <= 0 ? 'today ' + hh + ':' + mm
      : days === 1 ? 'yesterday ' + hh + ':' + mm
      : d.getDate() + ' ' + MON[d.getMonth()] + ' ' + hh + ':' + mm;
    return { text: m[1].trim(), when };
  } catch (e) { return null; }
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
  const runChecks = await ask(WARN + 'Run the checks now? (y/n) ' + OFF);
  if (runChecks.toLowerCase() === 'y') return checks();
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
  const PY = process.platform === 'win32' ? 'python' : 'python3';
  if (!hasTool(PY)) return noPython();
  const busy = listeningPorts([8897, 8898, 8899]);
  if (busy.length) {
    console.log();
    console.log('A preview server is already running on port ' + ITEM + busy[0] + OFF + '.');
    const a = await ask(WARN + 'Open it (Enter), or stop the server (S)? ' + OFF);
    if (a.toLowerCase() === 's') {
      const pids = listenerPids(busy);
      if (!pids.length) {
        console.log();
        console.log(ERR + 'Could not find the server process - close it by hand.' + OFF);
      } else {
        for (const pid of pids) {
          const r = process.platform === 'win32'
            ? spawnSync('taskkill', ['/F', '/PID', pid], { encoding: 'utf8' })
            : spawnSync('kill', [pid], { encoding: 'utf8' });
          console.log('Stopped process ' + pid + (r.status === 0 ? '.' : ' - could not stop it.'));
        }
        await sleep(500);
        console.log();
        console.log('Preview server stopped - the port is free now. Pick 5 again to start fresh.');
      }
    } else {
      openUrl('http://127.0.0.1:' + busy[0] + '/dist/books/');
      console.log('Opened the running preview in your browser - press F5 there to see the newest build.');
    }
    await pause();
    return menu();
  }
  const PORT = 8899;
  console.log();
  console.log('Opening on http://127.0.0.1:' + PORT + '/dist/books/ (port ' + PORT + ' is free).');
  try { // the server gets its own console window (Windows) — close it when done
    if (process.platform === 'win32') {
      // ONE verbatim command line (windowsVerbatimArguments): node's quoting
      // rewrites the start-title's embedded quotes, and cmd then reads a title
      // fragment as the program name ("Windows cannot find 'preview'").
      const cmdLine = 'start "Hadithmv preview (port ' + PORT + ') - close this window when done" '
        + PY + ' -m http.server ' + PORT + ' --directory "' + ROOT + '"';
      const c = spawn('cmd', ['/c', cmdLine], { detached: true, stdio: 'ignore', windowsVerbatimArguments: true });
      c.unref();
    } else { // macOS/Linux: the server just detaches in the background
      const c = spawn('sh', ['-c', PY + ' -m http.server ' + PORT + ' --directory "' + ROOT + '" >/dev/null 2>&1 &'], { detached: true, stdio: 'ignore' });
      c.unref();
    }
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

// ── option 13: open the notes folder ──────────────────────────────────
const NOTES = path.join(ROOT, 'static', 'notes'); // the site's hand-authored notes (static/notes/authors + /works)
async function openNotes() {
  process.title = 'Hadithmv Toolbox - opening the notes folder';
  fs.mkdirSync(path.join(NOTES, 'authors'), { recursive: true }); // notes are optional - make the folders if missing
  fs.mkdirSync(path.join(NOTES, 'works'), { recursive: true });
  console.log();
  console.log('Opening the notes folder (authors + works markdown) in Explorer...');
  openExternal(['start', '', 'explorer', NOTES], [NOTES], [NOTES]);
  console.log();
  console.log('Done - press Enter to go back to the menu.');
  await pause();
  return menu();
}

// ── option 14: new book (template copy + checklist) ───────────────────
const CONTENT = path.join(ROOT, 'data', 'content');
// ── CSV helpers (options 15 and 16) ────────────────────────────────────
// The registries are quoted CSV: a field containing a comma, a quote or a
// newline is wrapped in double quotes, with inner quotes doubled. A row is
// split with the same rules it is quoted with, so a round trip is byte-exact
// (and the PS1 keeps `version` as ALWAYS the last column - nothing follows it).
function csvQuote(f) {
  if (/[",\r\n]/.test(f)) return '"' + f.replace(/"/g, '""') + '"';
  return f;
}
function csvFields(line) {
  const out = []; let cur = ''; let inq = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inq) {
      if (c === '"') { if (line[i + 1] === '"') { cur += '"'; i++; } else inq = false; }
      else cur += c;
    } else if (c === '"') inq = true;
    else if (c === ',') { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out;
}
function readRegistry(file) {
  const raw = fs.readFileSync(file, 'utf8');
  const lines = raw.split(/\r?\n/);
  return {
    eol: raw.indexOf('\r\n') !== -1 ? '\r\n' : '\n',
    endsNL: raw.endsWith('\n'),
    header: lines[0],
    rows: lines.slice(1).filter((l) => l.trim() !== ''),
  };
}
function writeRegistry(file, r) {
  fs.writeFileSync(file, [r.header].concat(r.rows).join(r.eol) + (r.endsNL ? r.eol : ''), 'utf8');
}
function registryCodes(file) {
  try { return readRegistry(file).rows.map((l) => l.split(',')[0].trim()); }
  catch (e) { return []; }
}
// Version = SHA-256 of the content CSV's LF bytes, first 12 hex, lowercase -
// exactly what option 4 computes (it converts CRLF to LF first, like git's
// clean filter, so the hash always describes the served bytes).
function bookVersion(code) {
  try {
    const raw = fs.readFileSync(path.join(CONTENT, code + '.csv')).toString('latin1');
    const clean = raw.indexOf('\r\n') !== -1 ? raw.replace(/\r\n/g, '\n') : raw;
    return crypto.createHash('sha256').update(clean, 'latin1').digest('hex').slice(0, 12);
  } catch (e) { return ''; }
}
const META = path.join(ROOT, 'data', '03-registry-bookMeta.csv');
const AUTHORS = path.join(ROOT, 'data', '02-registry-bookAuthors.csv');
const TAGS = path.join(ROOT, 'data', '01-registry-bookTags.csv');
// The template default is the smallest book with the fullest layout (row
// numbers, head + body in both languages, foot) - a small starter; type any
// code to use that book instead.
function defaultTemplate() {
  let best = null, bestB = Infinity, any = null, anyB = Infinity;
  for (const f of fs.readdirSync(CONTENT)) {
    if (!f.endsWith('.csv')) continue;
    const b = fs.statSync(path.join(CONTENT, f)).size;
    if (b < anyB) { anyB = b; any = f.slice(0, -4); }
    const cols = fs.readFileSync(path.join(CONTENT, f), 'utf8').split(/\r?\n/)[0].split(',');
    if (cols.length >= 5 && cols.indexOf('foot') !== -1 && b < bestB) { bestB = b; best = f.slice(0, -4); }
  }
  return best || any;
}
function registeredBookCodes() {
  try {
    return fs.readFileSync(path.join(ROOT, 'data', '03-registry-bookMeta.csv'), 'utf8')
      .split(/\r?\n/).slice(1) // skip the header
      .map((l) => l.split(',')[0].trim())
      .filter(Boolean);
  } catch (e) { return []; }
}
async function newBook() {
  process.title = 'Hadithmv Toolbox - new book';
  console.log();
  console.log('New book - a working copy of an existing book (same columns,');
  console.log('same language setup) is dropped into the content folder, then');
  console.log('a checklist walks you through the rest.');
  console.log();
  const code = await ask(WARN + 'New book code (letters, digits, dash, underscore - e.g. HDT-something): ' + OFF);
  if (!/^[A-Za-z0-9_-]{2,64}$/.test(code)) {
    console.log();
    console.log(ERR + 'Invalid code - use letters, digits, dashes and underscores only.' + OFF);
    await pause();
    return menu();
  }
  if (fs.existsSync(path.join(CONTENT, code + '.csv'))) {
    console.log();
    console.log(ERR + 'A file named ' + code + '.csv already exists in the content folder.' + OFF);
    await pause();
    return menu();
  }
  if (registeredBookCodes().indexOf(code) !== -1) {
    console.log();
    console.log(ERR + code + ' is already registered - check 03-registry-bookMeta.csv.' + OFF);
    await pause();
    return menu();
  }
  const defTpl = defaultTemplate();
  const tpl = await ask(WARN + 'Template book (Enter = ' + defTpl + ' - smallest full-layout book, or type any code): ' + OFF);
  const tplCode = tpl || defTpl;
  if (!fs.existsSync(path.join(CONTENT, tplCode + '.csv'))) {
    console.log();
    console.log(ERR + 'No template named ' + tplCode + ' - check the content folder.' + OFF);
    await pause();
    return menu();
  }
  fs.copyFileSync(path.join(CONTENT, tplCode + '.csv'), path.join(CONTENT, code + '.csv'));
  const tplInfo = fs.readFileSync(path.join(CONTENT, tplCode + '.csv'), 'utf8');
  console.log();
  console.log('Copied ' + tplCode + '.csv to ' + code + '.csv (byte-exact - LF, no BOM).');
  console.log('Template: ' + Math.max(1, Math.round(fs.statSync(path.join(CONTENT, tplCode + '.csv')).size / 1024)) + ' KB, ' + (tplInfo.split(/\r?\n/).length - 1) + ' rows, columns: ' + tplInfo.split(/\r?\n/)[0] + '.');
  openExternal(['start', '', 'explorer', CONTENT], [CONTENT], [CONTENT]);
  console.log('Opened the content folder in Explorer.');
  console.log();
  console.log('Checklist:');
  console.log(' 1. Replace the template text with the real book - edit the new CSV.');
  console.log(' 2. If the author is new - option 16 adds the row to');
  console.log('    data/02-registry-bookAuthors.csv (code, names in AR/DV/EN, born/died AH).');
  console.log('    Optional: static/notes/authors/' + code + '.md for the biography.');
  console.log(' 3. If a tag is new - add a row to data/01-registry-bookTags.csv');
  console.log('    (row order = the colour palette order - hand-controlled).');
  console.log(' 4. Run option 4 - it registers the book, computes its version, sorts,');
  console.log('    rebuilds the search index and refreshes the manifest.');
  console.log(' 5. Option 15 (or the question below) fills the 03 row for you: the');
  console.log('    three titles, authorCode, tags. Version stays computed, last column.');
  console.log(' 6. Optional: write static/notes/works/' + code + '.md (book notes for the info modal).');
  console.log(' 7. Run option 10, check 7 - new text may need font glyphs.');
  console.log(' 8. Build (option 1), commit in your IDE, push, then option 12.');
  console.log();
  const reg = await ask(WARN + 'Register it now - fill the registry row with me? (y/n) ' + OFF);
  if (reg.toLowerCase() === 'y') return finishBookRegistration(code);
  await pause();
  return menu();
}

// ── option 15: finish a book registration (fill/edit the 03 row) ──────
async function finishBookRegistration(preCode) {
  process.title = 'Hadithmv Toolbox - finishing a book registration';
  console.log();
  console.log("Fills or edits a book's row in 03-registry-bookMeta.csv - the");
  console.log('three titles, the author and the tags. The version is computed');
  console.log('from the book content, never typed.');
  console.log();
  let code = preCode || '';
  if (!code) {
    code = await ask(WARN + 'Book code (Enter = cancel): ' + OFF);
    if (!code) { console.log(); console.log('Cancelled.'); await pause(); return menu(); }
  }
  if (!/^[A-Za-z0-9_-]{2,64}$/.test(code)) {
    console.log();
    console.log(ERR + 'Invalid code - use letters, digits, dashes and underscores only.' + OFF);
    await pause();
    return menu();
  }
  const hasCsv = fs.existsSync(path.join(CONTENT, code + '.csv'));
  const reg = readRegistry(META);
  let ri = reg.rows.findIndex((l) => l.split(',')[0].trim() === code);
  if (ri === -1 && !hasCsv) {
    console.log();
    console.log(ERR + 'Nothing named ' + code + ' - no content CSV and no registry row.' + OFF);
    console.log(WARN + 'Create the book first with option 14.' + OFF);
    await pause();
    return menu();
  }
  if (ri === -1) { console.log(); console.log('New row - ' + code + ' will be added to the registry.'); }
  if (ri !== -1 && !hasCsv) console.log(WARN + 'Warning: the content CSV is missing - the version stays empty until it is back.' + OFF);
  const cur = ri !== -1 ? csvFields(reg.rows[ri]) : [];
  while (cur.length < 8) cur.push(''); // code, author, 3 titles, tags, excludeFromIndex, version
  const keep = (i) => (cur[i] ? ' (Enter = keep "' + cur[i] + '")' : ' (Enter = empty)');
  const fields = [code, cur[1], cur[2], cur[3], cur[4], cur[5], cur[6], cur[7]];
  let v = await ask(WARN + 'Author code' + keep(1) + ': ' + OFF);
  if (v) fields[1] = v;
  if (fields[1] && registryCodes(AUTHORS).indexOf(fields[1]) === -1)
    console.log(WARN + 'Author code "' + fields[1] + '" is not in 02-registry-bookAuthors.csv - add it with option 16.' + OFF);
  v = await ask(WARN + 'Title AR' + keep(2) + ': ' + OFF);
  if (v) fields[2] = v;
  v = await ask(WARN + 'Title DV' + keep(3) + ': ' + OFF);
  if (v) fields[3] = v;
  v = await ask(WARN + 'Title EN' + keep(4) + ': ' + OFF);
  if (v) fields[4] = v;
  v = await ask(WARN + 'Tags' + keep(5) + ' (space- or comma-separated): ' + OFF);
  if (v) fields[5] = v.split(/[,\s]+/).filter(Boolean).join(',');
  if (fields[5]) fields[5].split(',').forEach((t) => {
    if (registryCodes(TAGS).indexOf(t) === -1)
      console.log(WARN + 'Tag "' + t + '" is not in 01-registry-bookTags.csv - add it by hand (row order = the colour order).' + OFF);
  });
  fields[7] = bookVersion(code); // always recomputed - never typed, always last
  const row = fields.map(csvQuote).join(',');
  if (ri === -1) reg.rows.push(row); else reg.rows[ri] = row;
  writeRegistry(META, reg);
  console.log();
  console.log(ITEM + 'Row updated:' + OFF);
  console.log(' ' + row);
  console.log('Version: ' + ITEM + (fields[7] || '(empty - no content CSV yet)') + OFF + ' - the same value option 4 computes.');
  console.log();
  console.log('Refreshing the freshness file (the row is served content)...');
  const ok = await runCaptured('node', [path.join(ROOT, 'tools/hmv-manifest.mjs')]).then((r) => r.ok);
  if (!ok) return fail('manifest');
  if (!muted) beep(); // the row is written and the freshness file refreshed
  console.log();
  console.log(WARN + 'Remember: if the book is new, run option 4 to rebuild the search index.' + OFF);
  await pause();
  return menu();
}

// ── option 16: add an author (append a row to 02) ──────────────────────
async function addAuthor() {
  process.title = 'Hadithmv Toolbox - adding an author';
  console.log();
  console.log("Adds a row to 02-registry-bookAuthors.csv - the author's code,");
  console.log('the three names and the AH years. New authors belong at the');
  console.log('end of the file, so this appends.');
  console.log();
  const code = await ask(WARN + 'Author code (Enter = cancel): ' + OFF);
  if (!code) { console.log(); console.log('Cancelled.'); await pause(); return menu(); }
  if (!/^[A-Za-z0-9_-]{2,64}$/.test(code)) {
    console.log();
    console.log(ERR + 'Invalid code - use letters, digits, dashes and underscores only.' + OFF);
    await pause();
    return menu();
  }
  const reg = readRegistry(AUTHORS);
  if (reg.rows.some((l) => l.split(',')[0].trim() === code)) {
    console.log();
    console.log(ERR + code + ' is already in the authors registry - pick another code, or edit that row by hand.' + OFF);
    await pause();
    return menu();
  }
  const nameAR = await ask(WARN + 'Name AR (Arabic, Enter = empty): ' + OFF);
  const nameDV = await ask(WARN + 'Name DV (Dhivehi, Enter = empty): ' + OFF);
  const nameEN = await ask(WARN + 'Name EN (English, Enter = empty): ' + OFF);
  const bornAH = await ask(WARN + 'Born AH (e.g. 93, Enter = empty): ' + OFF);
  if (bornAH && !/^\d{0,4}$/.test(bornAH)) console.log(WARN + '"' + bornAH + '" is not a year - leaving it empty.' + OFF);
  const diedAH = await ask(WARN + 'Died AH (e.g. 179, Enter = empty): ' + OFF);
  if (diedAH && !/^\d{0,4}$/.test(diedAH)) console.log(WARN + '"' + diedAH + '" is not a year - leaving it empty.' + OFF);
  const row = [
    code,
    nameAR,
    nameDV,
    nameEN,
    /^\d{0,4}$/.test(bornAH) ? bornAH : '',
    /^\d{0,4}$/.test(diedAH) ? diedAH : '',
  ].map(csvQuote).join(',');
  reg.rows.push(row);
  writeRegistry(AUTHORS, reg);
  console.log();
  console.log(ITEM + 'Row added:' + OFF);
  console.log(' ' + row);
  console.log();
  console.log('Refreshing the freshness file (the row is served content)...');
  const ok = await runCaptured('node', [path.join(ROOT, 'tools/hmv-manifest.mjs')]).then((r) => r.ok);
  if (!ok) return fail('manifest');
  if (!muted) beep(); // the row is written and the freshness file refreshed
  console.log();
  console.log(WARN + 'The author shows on the site after the next build (option 1).' + OFF);
  console.log(WARN + 'Optional: static/notes/authors/' + code + '.md for the biography.' + OFF);
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
  console.log('All seven, or just one - type 1-7 for a single check, Enter runs all.');
  const RPT = path.join(ROOT, 'checks-report.md');
  const t = Date.now();
  const results = []; // { ok: true|false|null(SKIP), out }
  const failed = [];
  const pick = await ask(WARN + 'All 7, or one? (1-7 = just that check) ' + OFF);
  const single = /^[1-7]$/.test(pick);
  const idx = single ? parseInt(pick, 10) - 1 : -1;
  if (single) console.log('Running ' + CHECK_NAMES[idx] + ' only - the report marks the rest SKIP.');
  console.log();
  try { fs.unlinkSync(RPT); } catch (e) { /* first run */ }
  fs.writeFileSync(RPT, [
    '# Hadithmv Toolbox - checks report', '',
    'Run date: ' + new Date().toLocaleString(), '',
    'Source: ' + VER + ' | Built: ' + VERD + ' | Branch: ' + BR,
    single ? 'Scope: ' + CHECK_NAMES[idx] + ' only (the rest were skipped)' : 'Scope: all 7 checks',
  ].join('\n') + '\n');
  if (single) {
    for (let i = 0; i < 7; i++) results.push({ ok: null, out: 'Skipped: single-check run - only the chosen check ran.' });
    if (idx < 6) {
      console.log(' ' + CHECKS[idx].label);
      results[idx] = await runCaptured('node', [path.join(ROOT, CHECKS[idx].file)]);
      if (!results[idx].ok) failed.push(CHECKS[idx].name);
    } else if (hasTool('python')) {
      console.log(' ' + FONT_LABEL);
      results[6] = await runCaptured('python', [path.join(ROOT, 'tools/hmv-font-subset.py'), '--check']);
      if (!results[6].ok) failed.push('font');
    } else {
      console.log(' 7/7 - the font coverage check skipped - python not found.');
      results[6] = { ok: null, out: 'Skipped: python not found.' };
    }
    console.log();
  } else {
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
  }
  const secs = Math.round((Date.now() - t) / 1000);
  const verdict = (r) => (r.ok === null ? 'SKIP' : (r.ok ? 'PASS' : 'FAIL'));
  const lines = ['', '## Summary', '', '| Check | Result |', '| --- | --- |'];
  CHECK_NAMES.forEach((n, i) => lines.push('| ' + (i + 1) + '/7 ' + n + ' | ' + verdict(results[i]) + ' |'));
  lines.push('', '## Details', '');
  CHECK_NAMES.forEach((n, i) => {
    lines.push('### ' + (i + 1) + '/7 ' + n + ' - ' + verdict(results[i]));
    lines.push('```', results[i].out.trimEnd(), '```', '');
  });
  const verdictLine = single
    ? (failed.length ? '**Verdict: CHECK FAILED - ' + failed.join(' ') + '**' : '**Verdict: PASSED (' + CHECK_NAMES[idx] + ' only)**')
    : (failed.length ? '**Verdict: SOME CHECKS FAILED - ' + failed.join(' ') + '**' : '**Verdict: ALL CHECKS PASSED**');
  lines.push('---', '', secs ? 'Run time: ' + secs + ' seconds' : '', verdictLine);
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
    const o = await ask(WARN + 'Open the report? (y/n) ' + OFF);
    if (o.toLowerCase() === 'y') openNotepad(RPT);
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
  const ports = previewStatus();
  console.log(' Preview:                ' + (ports.length ? ITEM + 'running on ' + ports[0] + OFF : DIM + 'not running' + OFF));
  const lc = lastChecks();
  console.log(' Last checks:            ' + (lc ? (lc.text.indexOf('FAILED') !== -1 ? ERR : ITEM) + lc.text.toLowerCase() + OFF + ' - ' + lc.when : DIM + 'never run' + OFF));
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
    const a = await ask(WARN + 'Open the live site? (y/n) ' + OFF);
    if (a.toLowerCase() === 'y') openUrl('https://hadithmv.github.io/');
  } else {
    console.log(WARN + 'The live site is behind: live ' + live + ', local ' + VER + '.' + OFF);
    console.log(WARN + 'Have you pushed, and did the GitHub Pages build finish?' + OFF);
    const a = await ask(WARN + 'Open the GitHub Actions page (a) or the live site (l)? (Enter = skip) ' + OFF);
    if (a.toLowerCase() === 'a') openUrl('https://github.com/hadithmv/hadithmv.github.io/actions');
    else if (a.toLowerCase() === 'l') openUrl('https://hadithmv.github.io/');
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
    case '13': return openNotes();
    case '14': return newBook();
    case '15': return finishBookRegistration();
    case '16': return addAuthor();
    case '17': return quit();
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
