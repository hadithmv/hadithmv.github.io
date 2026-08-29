// tools/hmv-toolbox.mjs - the Hadithmv Toolbox menu (node edition).
//
// An 18-item console menu for the common site tasks. Double-click the tiny
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
//  7  openFolder()               Explorer on the codebase folder
//  8  build(true)                build + preview
//  9  checks()                   the 7 batteries, or one; checks-report.md
// 10  about()                    versions, tools, preview + last-checks
//                                state
// 11  livecheck()                compare the published version with local
// 12  openNotes()                Explorer on static/notes/ (authors + works)
// 13  newBook()                  copy a template + add-a-book checklist,
//                                then offers to fill the registry row
// 14  finishBookRegistration()   fill/edit a book's row in
//                                03-registry-bookMeta.csv
// 15  addAuthor()                append a row to 02-registry-bookAuthors.csv
// 16  soundToggle()              sound on/off (the flag lives in the user
//                                profile, outside the repo)
// 17  restart()                  start the menu over: re-probe the tools,
//                                re-read the sound flag, redraw
// 18  quit()                     exit
//
// Shared helpers used by several options: runCaptured() (every worker
// step, with an optional spinner while the child is quiet), startSpin()
// (the silent-wait spinners in options 1, 5, 9 and 11 - they count the
// elapsed seconds once a wait passes a few seconds),
// openExternal()/openUrl()/openNotepad() (options 5, 7, 9, 11, 12),
// listeningPorts()/listenerPids()/previewStatus() (option 5, About and the
// menu footer), lastChecks()/footerLine() (the menu footer + About),
// csvQuote()/csvFields()/readRegistry()/writeRegistry()/registryCodes()/
// bookVersion() (options 14 and 15 - the registries are quoted CSV;
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
function readSoundFlag() {
  try { return fs.readFileSync(SOUND_FILE, 'utf8').trim() === '1'; } catch (e) { return false; }
}
let muted = readSoundFlag();
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

// A tiny ASCII spinner (|/-\) for the genuinely silent waits: the live-site
// fetch (option 11), the preview server boot (option 5), the build (option
// 1), and each battery's quiet stretches in checks() (option 9).
// startSpin() returns stop(), which erases the line, so the spinner never
// fights streamed output. After ~5 s of spinning it starts showing the
// elapsed seconds ("building - 42s") - real time, not a fake bar.
// ASCII only - old consoles render fancy glyphs as ?? (pitfall 6).
function startSpin(label) {
  const FRAMES = ['|', '/', '-', '\\'];
  const born = Date.now();
  let i = 0;
  let stopped = false;
  const draw = () => {
    const secs = Math.round((Date.now() - born) / 1000);
    const t = secs >= 5 ? ' - ' + secs + 's' : '';
    process.stdout.write('\r' + label + t + ' ' + FRAMES[i = (i + 1) % FRAMES.length]);
  };
  draw();
  const t = setInterval(draw, 120);
  return () => {
    clearInterval(t);
    if (stopped) return;
    stopped = true;
    // wide enough for the growing time suffix (" - 9999s") plus the frame
    process.stdout.write('\r' + new Array(label.length + 18).join(' ') + '\r');
  };
}

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

// Probed once at load (cheap --version calls): the menu dims the options
// whose tools are missing (5 needs python, 6 and 7 need git). Picking a
// dimmed option still runs and explains. The About screen probes afresh.
// re-probed by option 17 (Restart), so a tool installed mid-session lights
// its row back up without relaunching the menu
let HAS_GIT = hasTool('git');
let HAS_PY = hasTool('python');

function showBanner() {
  clear();
  console.log(TITLE + BOX + OFF);
  if (VER && BR) {
    const tail = bannerTail(); // ' - <branch>' — split so both hyphens are box-green
    const pad = Math.max(0, 50 - 21 - VER.length - tail.length);
    console.log(TITLE + '|  Hadithmv Toolbox - ' + ITEM + VER + OFF + TITLE + ' - ' + OFF + tail.slice(3) + new Array(pad + 1).join(' ') + TITLE + '|' + OFF);
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
  // the action name stays white, the parenthetical hint is dimmed, so the
  // list scans at a glance; rows whose tool is missing are fully dimmed.
  // Every hint starts in the same column — the longest action name
  // ('Finish a book registration') plus one space — so the hints scan as
  // a table of their own.
  console.log(' ' + ITEM + '1.' + OFF + ' Build the site' + DIM + '              (full build - run before you commit)' + OFF);
  console.log(' ' + ITEM + '2.' + OFF + ' Rebuild search index' + DIM + '        (so new books show up in search)' + OFF);
  console.log(' ' + ITEM + '3.' + OFF + ' Refresh freshness' + DIM + '           (quick update for data-only changes)' + OFF);
  console.log(' ' + ITEM + '4.' + OFF + ' Refresh book data' + DIM + '           (after adding or changing a book)' + OFF);
  const dim5 = HAS_PY ? '' : DIM, dim5Off = HAS_PY ? '' : OFF;
  const dimG = HAS_GIT ? '' : DIM, dimGOff = HAS_GIT ? '' : OFF;
  console.log(' ' + (HAS_PY ? ITEM : DIM) + '5.' + OFF + dim5 + ' Preview the site' + DIM + '            (opens in your browser, like the live one)' + OFF + dim5Off);
  const ch6 = changedHint(); // the hint's own colour signals the state: amber when files await, dim when clean
  console.log(' ' + (HAS_GIT ? ITEM : DIM) + '6.' + OFF + dimG + " What's changed" + DIM + '              ' + (ch6.color || DIM) + ch6.text + OFF + dimGOff);
  console.log(' ' + ITEM + '7.' + OFF + ' Open the folder' + DIM + '             (the codebase folder in Explorer)' + OFF);
  console.log(' ' + ITEM + '8.' + OFF + ' Build and preview' + DIM + '           (build, then open the preview)' + OFF);
  console.log(' ' + ITEM + '9.' + OFF + ' Run the checks' + DIM + '              (the pre-commit verification battery)' + OFF);
  console.log(' ' + ITEM + '10.' + OFF + ' About / health check' + DIM + '       (versions and tools on this machine)' + OFF);
  console.log(' ' + ITEM + '11.' + OFF + ' Check the live site' + DIM + '        (is the published site up to date?)' + OFF);
  console.log(' ' + ITEM + '12.' + OFF + ' Open the notes folder' + DIM + '      (authors + works markdown)' + OFF);
  console.log(' ' + ITEM + '13.' + OFF + ' New book' + DIM + '                   (copy a template + checklist)' + OFF);
  console.log(' ' + ITEM + '14.' + OFF + ' Finish a book registration' + DIM + ' (fill the registry row)' + OFF);
  console.log(' ' + ITEM + '15.' + OFF + ' Add an author' + DIM + '              (append to the authors registry)' + OFF);
  // the hint carries the state: dim when on, amber when muted (the warn colour
  // the footer used to show for it)
  console.log(' ' + ITEM + '16.' + OFF + ' Sound on/off' + (muted ? WARN : DIM) + '               (now ' + (muted ? 'off' : 'on') + ')' + OFF);
  console.log(' ' + ITEM + '17.' + OFF + ' Restart' + DIM + '                    (start over - re-checks the tools)' + OFF);
  console.log(' ' + ITEM + '18.' + OFF + ' Quit');
  const foot = footerLine();
  console.log(DIM + new Array(Math.max(50, foot.plain.length) + 1).join('-') + OFF); // a dim rule closes the menu; the footer below is status, not an option
  console.log(foot.colored);
  console.log(DIM + 'Tip: Ctrl+C quits from anywhere.' + OFF);
  console.log();
}

// The one-line state footer under the menu: when the checks last ran (and
// the verdict), when the site was last built, and whether a preview server
// is up. The sound state lives in its own menu row (16), not here — no
// screen shows it twice.
// Returns { plain, colored } — the rule above it is sized to the plain
// text, so the status line never outruns its own rule.
function footerLine() {
  const c = lastChecks();
  const ports = previewStatus();
  const bld = lastBuild();
  let plain, colored;
  if (!c) { plain = 'checks: never run'; colored = DIM + plain + OFF; }
  else if (c.text.indexOf('FAILED') !== -1) {
    // the verdict names the failing check(s) - surface them in the footer
    const nm = (c.text.match(/ - (.+)$/) || ['', ''])[1];
    const name = nm ? ' (' + nm + ')' : '';
    plain = 'checks: failed' + name + ' ' + c.when;
    colored = DIM + 'checks: ' + OFF + ERR + 'failed' + OFF + DIM + name + ' ' + c.when + OFF;
  } else {
    plain = 'checks: passed ' + c.when;
    colored = DIM + 'checks: ' + OFF + (c.days > STALE_DAYS ? WARN : ITEM) + 'passed' + OFF + DIM + ' ' + c.when + OFF;
  }
  const bldSeg = bld ? '  |  built ' + bld : ''; // dimmed like the preview-off state - a fact, not a verdict
  const bldCol = bld ? DIM + '  |  built ' + bld + OFF : '';
  const prv = ports.length ? 'preview: running on ' + ports[0] : 'preview: off';
  const prvCol = ports.length ? ITEM + prv + OFF : DIM + prv + OFF;
  return {
    plain: ' ' + plain + bldSeg + '  |  ' + prv,
    colored: ' ' + colored + bldCol + DIM + '  |  ' + OFF + prvCol,
  };
}

// The row-6 hint: how many files git would put in your next commit, so the
// menu answers "is there anything to commit?" at a glance. Returns
// { text, color } — the text is plain, the color signals attention:
// WARN (amber) when files await, '' (the hint's usual dim) when the tree
// is clean; the plain explanatory hint when git is missing or errors (the
// row is dimmed then anyway). One ~20ms git call per menu draw - the
// count is always fresh, so no caching.
function changedHint() {
  if (!HAS_GIT) return { text: '(what git would put in your next commit)', color: '' };
  try {
    const st = git(['status', '--porcelain']);
    if (st.status !== 0) return { text: '(what git would put in your next commit)', color: '' };
    const n = st.stdout.trim() ? st.stdout.trim().split('\n').length : 0;
    return n
      ? { text: '(' + n + (n === 1 ? ' file' : ' files') + ' - what git would put in your next commit)', color: WARN }
      : { text: '(nothing to commit)', color: '' };
  } catch (e) { return { text: '(what git would put in your next commit)', color: '' }; }
}

// The verdict + run time out of checks-report.md (a local file - cheap).
// Returns null when the report has never been written (or has no verdict).
function lastChecks() {
  try {
    const t = fs.readFileSync(path.join(ROOT, 'checks-report.md'), 'utf8');
    const m = t.match(/\*\*Verdict: ([^*]+)\*\*/);
    if (!m) return null;
    const d = fs.statSync(path.join(ROOT, 'checks-report.md')).mtime;
    const when = relWhen(d);
    const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
    const days = Math.round((startOf(new Date()) - startOf(d)) / 86400000);
    return { text: m[1].trim(), when, days };
  } catch (e) { return null; }
}

// Shared "when was it" wording — today / yesterday / D Mon, plus HH:MM. One
// path, so the checks verdict and the last-build time never drift apart.
function relWhen(d) {
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const hh = ('0' + d.getHours()).slice(-2);
  const mm = ('0' + d.getMinutes()).slice(-2);
  const startOf = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(new Date()) - startOf(d)) / 86400000);
  return days <= 0 ? 'today ' + hh + ':' + mm
    : days === 1 ? 'yesterday ' + hh + ':' + mm
    : d.getDate() + ' ' + MON[d.getMonth()] + ' ' + hh + ':' + mm;
}

// When the site was last built — the mtime of the size report that every
// build (option 1 / dist-build.bat) rewrites. Null when it has never been
// built here; the footer then omits the segment instead of guessing. (The
// report is committed, so a fresh clone shows the checkout time until the
// first build — same limitation as any committed ledger.)
function lastBuild() {
  try { return relWhen(fs.statSync(path.join(ROOT, 'dist-build-report.md')).mtime); }
  catch (e) { return null; }
}

// A passed verdict older than this many days is stale and turns yellow
// (footer + About) - fresh green, stale amber, failed red.
const STALE_DAYS = 7;

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
// When `spinLabel` is given, a spinner shows whenever the child is quiet:
// it stops on each output burst and resumes after ~1.5 s of silence, so it
// covers whole silent runs (the build) and the long gaps between a battery's
// lines, not just the boot. Close/error always clears the spinner.
function runCaptured(cmd, args, spinLabel) {
  return new Promise((resolve) => {
    const c = spawn(cmd, args, { cwd: ROOT });
    let out = '';
    let stop = null; // the active spinner, if any
    let idle = null; // the resume timer, if armed
    const talk = () => {
      if (stop) { stop(); stop = null; }
      if (idle) { clearTimeout(idle); idle = null; }
    };
    const breathe = (d) => {
      talk();
      out += d;
      process.stdout.write(d);
      if (spinLabel) idle = setTimeout(() => { if (!stop) stop = startSpin(spinLabel); }, 1500);
    };
    if (spinLabel) stop = startSpin(spinLabel);
    c.stdout.on('data', breathe);
    c.stderr.on('data', breathe);
    // 'close' (not 'exit'): the last stdout chunk can still be in flight when
    // 'exit' fires — 'close' guarantees every byte is in `out` before resolve.
    c.on('close', (code) => { talk(); resolve({ ok: code === 0, out }); });
    c.on('error', () => { talk(); resolve({ ok: false, out: '' }); });
  });
}

// ── option 1 + 8: build / build-and-preview ───────────────────────────
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
  const code = await runCaptured('node', [path.join(ROOT, 'tools/dist-build.mjs')], 'building').then((r) => r.ok ? 0 : 1);
  if (code) return fail('build');
  if (!muted) beep();
  const secs = Math.round((Date.now() - t) / 1000);
  console.log();
  if (followWithPreview) {
    console.log(ITEM + (secs ? 'Build done in ' + secs + ' seconds - opening the preview now.' : 'Build done - opening the preview now.') + OFF);
    return preview();
  }
  console.log(ITEM + (secs ? 'Build done in ' + secs + ' seconds. Size summary:' : 'Build done. Size summary:') + OFF);
  const row = totalRow();
  if (row) console.log('  Files: ' + ITEM + row.files + OFF + '   Input: ' + ITEM + row.input + OFF + '   Output: ' + ITEM + row.output + OFF + '   Saved: ' + ITEM + row.saved + OFF + '   Gzip: ' + ITEM + row.gzip + OFF);
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
  console.log(ITEM + 'Search index rebuilt.' + OFF);
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
  console.log(ITEM + 'Freshness file refreshed.' + OFF);
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
  if (!ok) { console.log(' ' + ERR + 'failed' + OFF); return fail('registry'); }
  console.log(' ' + ITEM + 'done' + OFF);
  console.log('Step 2 of 3 - rebuilding the search index...');
  ok = await runCaptured('node', [path.join(ROOT, 'data/08-rebuild-searchIndex.mjs')]).then((r) => r.ok);
  if (!ok) { console.log(' ' + ERR + 'failed' + OFF); return fail('index'); }
  console.log(' ' + ITEM + 'done' + OFF);
  console.log('Step 3 of 3 - refreshing the freshness file...');
  ok = await runCaptured('node', [path.join(ROOT, 'tools/hmv-manifest.mjs')]).then((r) => r.ok);
  if (!ok) { console.log(' ' + ERR + 'failed' + OFF); return fail('manifest'); }
  console.log(' ' + ITEM + 'done' + OFF);
  console.log();
  console.log(ITEM + 'All three steps done.' + OFF);
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
        console.log(ITEM + 'Preview server stopped - the port is free now. Pick 5 again to start fresh.' + OFF);
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
  const stopSpin = startSpin('waiting for the server');
  for (let i = 0; i < 3; i++) { await sleep(1000); if (listeningPorts([PORT]).length) { up = true; break; } }
  stopSpin();
  if (!up) return fail('preview');
  openUrl('http://127.0.0.1:' + PORT + '/dist/books/');
  console.log();
  console.log(ITEM + 'Preview started. Close the server window when done, then press Enter.' + OFF);
  await pause();
  return menu();
}

// ── option 6: what's changed ──────────────────────────────────────────
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
  // git-style colours on the status code: staged work green (TITLE), unstaged
  // work and untracked files red (ERR) - the path itself stays plain
  const STAGED = { A: TITLE, C: TITLE, D: TITLE, M: TITLE, R: TITLE };
  const UNSTAGED = { D: ERR, M: ERR, T: ERR };
  for (const ln of st.stdout.trimEnd().split('\n')) {
    const x = ln[0], y = ln[1];
    const cx = x === '?' ? ERR : STAGED[x] || '';
    const cy = y === '?' ? ERR : UNSTAGED[y] || '';
    console.log((cx ? cx + x + OFF : x) + (cy ? cy + y + OFF : y) + ln.slice(2));
  }
  // git's own bottom line - "N files changed, X insertions(+), Y deletions(-)".
  // Tracked changes only; untracked files stay in the porcelain list above.
  // Skipped when HEAD does not exist yet or only untracked files await.
  const stat = git(['diff', '--stat', 'HEAD']);
  if (stat.status === 0 && stat.stdout.trim()) {
    console.log(DIM + stat.stdout.trimEnd().split('\n').pop().trim() + OFF);
  }
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

// ── option 7: open the folder ─────────────────────────────────────────
async function openFolder() {
  process.title = 'Hadithmv Toolbox - opening the folder';
  console.log();
  console.log('Opening the codebase folder in Explorer...');
  openExternal(['start', '', 'explorer', ROOT], [ROOT], [ROOT]);
  console.log();
  console.log(ITEM + 'Done - press Enter to go back to the menu.' + OFF);
  await pause();
  return menu();
}

// ── option 12: open the notes folder ──────────────────────────────────
const NOTES = path.join(ROOT, 'static', 'notes'); // the site's hand-authored notes (static/notes/authors + /works)
async function openNotes() {
  process.title = 'Hadithmv Toolbox - opening the notes folder';
  fs.mkdirSync(path.join(NOTES, 'authors'), { recursive: true }); // notes are optional - make the folders if missing
  fs.mkdirSync(path.join(NOTES, 'works'), { recursive: true });
  console.log();
  console.log('Opening the notes folder (authors + works markdown) in Explorer...');
  openExternal(['start', '', 'explorer', NOTES], [NOTES], [NOTES]);
  console.log();
  console.log(ITEM + 'Done - press Enter to go back to the menu.' + OFF);
  await pause();
  return menu();
}

// ── option 13: new book (template copy + checklist) ───────────────────
const CONTENT = path.join(ROOT, 'data', 'content');
// ── CSV helpers (options 14 and 15) ────────────────────────────────────
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
  console.log(' 2. If the author is new - option 15 adds the row to');
  console.log('    data/02-registry-bookAuthors.csv (code, names in AR/DV/EN, born/died AH).');
  console.log('    Optional: static/notes/authors/' + code + '.md for the biography.');
  console.log(' 3. If a tag is new - add a row to data/01-registry-bookTags.csv');
  console.log('    (row order = the colour palette order - hand-controlled).');
  console.log(' 4. Run option 4 - it registers the book, computes its version, sorts,');
  console.log('    rebuilds the search index and refreshes the manifest.');
  console.log(' 5. Option 15 (or the question below) fills the 03 row for you: the');
  console.log('    three titles, authorCode, tags. Version stays computed, last column.');
  console.log(' 6. Optional: write static/notes/works/' + code + '.md (book notes for the info modal).');
  console.log(' 7. Run option 9, check 7 - new text may need font glyphs.');
  console.log(' 8. Build (option 1), commit in your IDE, push, then option 11.');
  console.log();
  const reg = await ask(WARN + 'Register it now - fill the registry row with me? (y/n) ' + OFF);
  if (reg.toLowerCase() === 'y') return finishBookRegistration(code);
  await pause();
  return menu();
}

// ── option 14: finish a book registration (fill/edit the 03 row) ──────
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
    console.log(WARN + 'Create the book first with option 13.' + OFF);
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
    console.log(WARN + 'Author code "' + fields[1] + '" is not in 02-registry-bookAuthors.csv - add it with option 15.' + OFF);
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

// ── option 15: add an author (append a row to 02) ──────────────────────
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

// ── option 9: run the checks ──────────────────────────────────────────
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
  const fmtDur = (s) => (s >= 60 ? Math.floor(s / 60) + 'm ' + (s % 60) + 's' : s + 's');
  const note = (r, t0) => { // one line per battery: PASS/FAIL + its own time
    const cs = Math.round((Date.now() - t0) / 1000);
    console.log(' ' + (r.ok ? ITEM + 'PASS' : ERR + 'FAIL') + OFF + ' - ' + (cs ? fmtDur(cs) : '<1s'));
  };
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
      const t0 = Date.now();
      results[idx] = await runCaptured('node', [path.join(ROOT, CHECKS[idx].file)], 'working');
      if (!results[idx].ok) failed.push(CHECKS[idx].name);
      note(results[idx], t0);
    } else if (hasTool('python')) {
      console.log(' ' + FONT_LABEL);
      const t0 = Date.now();
      results[6] = await runCaptured('python', [path.join(ROOT, 'tools/hmv-font-subset.py'), '--check'], 'working');
      if (!results[6].ok) failed.push('font');
      note(results[6], t0);
    } else {
      console.log(' 7/7 - the font coverage check skipped - python not found.');
      results[6] = { ok: null, out: 'Skipped: python not found.' };
    }
    console.log();
  } else {
    for (const c of CHECKS) {
      console.log(' ' + c.label);
      const t0 = Date.now();
      const r = await runCaptured('node', [path.join(ROOT, c.file)], 'working');
      results.push(r);
      if (!r.ok) failed.push(c.name);
      note(r, t0);
      console.log();
    }
    if (hasTool('python')) {
      console.log(' ' + FONT_LABEL);
      const t0 = Date.now();
      const r = await runCaptured('python', [path.join(ROOT, 'tools/hmv-font-subset.py'), '--check'], 'working');
      results.push(r);
      if (!r.ok) failed.push('font');
      note(r, t0);
    } else {
      console.log(' 7/7 - the font coverage check skipped - python not found.');
      results.push({ ok: null, out: 'Skipped: python not found.' });
    }
    console.log();
  }
  const secs = Math.round((Date.now() - t) / 1000);
  const dur = secs ? ' - ' + fmtDur(secs) : '';
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
    console.log(ERR + 'Some checks failed:' + OFF + ' ' + failed.join(' ') + dur);
    console.log(WARN + 'The full report is in checks-report.md - opening it now.' + OFF);
    openNotepad(RPT);
  } else {
    if (!muted) beep();
    console.log(ITEM + 'All checks passed.' + OFF + dur);
    console.log(ITEM + 'Report saved to checks-report.md.' + OFF);
    const o = await ask(WARN + 'Open the report? (y/n) ' + OFF);
    if (o.toLowerCase() === 'y') openNotepad(RPT);
  }
  await pause();
  return menu();
}

// ── option 10: about / health ─────────────────────────────────────────
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
  // corpus size from the registries - a one-glance sanity check (0 books = a broken registry)
  console.log(' Corpus:                 ' + ITEM + registryCodes(META).length + OFF + ' books, ' + ITEM + registryCodes(AUTHORS).length + OFF + ' authors');
  const ports = previewStatus();
  console.log(' Preview:                ' + (ports.length ? ITEM + 'running on ' + ports[0] + OFF : DIM + 'not running' + OFF));
  const lc = lastChecks();
  console.log(' Last checks:            ' + (lc ? (lc.text.indexOf('FAILED') !== -1 ? ERR : lc.days > STALE_DAYS ? WARN : ITEM) + lc.text.toLowerCase() + OFF + ' - ' + lc.when : DIM + 'never run' + OFF));
  console.log(' Sound:                  ' + (muted ? 'off' : 'on'));
  console.log();
  console.log(' Tools on this machine:');
  console.log(nodeV ? '  ' + ITEM + nodeV + OFF + '   node - needed for options 1-4 and 8' : '  ' + ERR + 'node not found' + OFF + ' - install from nodejs.org');
  console.log(pyV ? '  ' + ITEM + pyV + OFF + '   python - needed for option 5' : '  ' + ERR + 'python not found' + OFF + ' - install from python.org');
  console.log(gitV ? '  ' + ITEM + gitV + OFF + '   git - needed for options 6 and 11' : '  ' + ERR + 'git not found' + OFF + ' - install from git-scm.com');
  console.log('  ' + ITEM + PWR + OFF + '   shell - used for option 4');
  console.log();
  // Sound has its own menu row (option 16); this screen only shows the state.
  await pause();
  return menu();
}

// ── option 11: check the live site ────────────────────────────────────
async function livecheck() {
  process.title = 'Hadithmv Toolbox - checking the live site';
  console.log();
  console.log('Checking the published site (needs internet)...');
  const stopSpin = startSpin('checking');
  const live = await liveVersion();
  stopSpin();
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

// ── option 16: sound on/off ───────────────────────────────────────────
async function soundToggle() {
  process.title = 'Hadithmv Toolbox - sound on/off';
  setMuted(!muted);
  console.log();
  console.log('Sound is ' + (muted ? ITEM + 'off' + OFF + ' - the beeps and buzzes are muted.' : ITEM + 'on' + OFF + ' - the beeps and buzzes are back.'));
  console.log();
  console.log(ITEM + 'Done - press Enter to go back to the menu.' + OFF);
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
// Option 17: start the menu over in place — re-probe the tools (a dimmed
// row lights up if python or git appeared mid-session), re-read the sound
// flag, and redraw. The menu already redraws after every option; this is
// the part that would otherwise need a fresh double-click of the bat.
function restart() {
  HAS_GIT = hasTool('git');
  HAS_PY = hasTool('python');
  muted = readSoundFlag();
  return menu();
}
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
    case '7': return openFolder();
    case '8': return build(true);
    case '9': return checks();
    case '10': return about();
    case '11': return livecheck();
    case '12': return openNotes();
    case '13': return newBook();
    case '14': return finishBookRegistration();
    case '15': return addAuthor();
    case '16': return soundToggle();
    case '17': return restart();
    case '18': return quit();
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
