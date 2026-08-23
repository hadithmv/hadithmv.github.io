// One-shot probe: screenshot + ink-rect measurement of the nav triangles.
// Usage: node tools/_nav-probe.mjs [width]  (delete after use)
import { spawn } from "node:child_process";
import fs from "node:fs";
import http from "node:http";

const PORT = 9373;
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const PROFILE = `${process.env.TEMP}\\hmv-nav-probe-${Date.now()}`;
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".csv": "text/csv", ".json": "application/json", ".md": "text/markdown", ".woff2": "font/woff2", ".ttf": "font/ttf", ".svg": "image/svg+xml", ".png": "image/png" };

function serve() {
  return new Promise((res) => {
    const server = http.createServer((req, res) => {
      const p = decodeURIComponent(req.url.split("?")[0]);
      const full = `${process.cwd()}${p === "/" ? "/books/reader.html" : p}`;
      if (!fs.existsSync(full)) { res.writeHead(404); res.end(); return; }
      const ext = p.slice(p.lastIndexOf(".")).toLowerCase();
      res.writeHead(200, { "Content-Type": (TYPES[ext] || "application/octet-stream") + "; charset=utf-8" });
      res.end(fs.readFileSync(full));
    });
    server.listen(PORT, "127.0.0.1", () => res(server));
  });
}

async function main() {
  const server = await serve();
  const width = process.argv[2] || "1280";
  const edge = spawn(EDGE, [
    "--headless=new", "--disable-gpu", "--no-first-run",
    `--user-data-dir=${PROFILE}`, `--remote-debugging-port=${PORT + 100}`,
    `--window-size=${width},800`,
    `http://127.0.0.1:${PORT}/books/reader.html?book=HDT-muwattaMalik`,
  ], { stdio: "ignore" });

  let ws;
  try {
    let target = null;
    for (let i = 0; i < 60 && !target; i++) {
      try {
        const list = JSON.parse(await (await fetch(`http://127.0.0.1:${PORT + 100}/json`)).text());
        target = list.find((t) => t.type === "page");
      } catch {}
      if (!target) await new Promise((r) => setTimeout(r, 200));
    }
    if (!target) { console.log("NO_TARGET"); return; }
    ws = new WebSocket(target.webSocketDebuggerUrl);
    await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
    let id = 0;
    const pending = new Map();
    ws.onmessage = (e) => {
      const m = JSON.parse(e.data);
      if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
    };
    const send = (method, params = {}) => new Promise((res) => {
      const i = ++id; pending.set(i, res);
      ws.send(JSON.stringify({ id: i, method, params }));
    });
    await send("Runtime.enable");
    const ev = (expression) => send("Runtime.evaluate", { expression, returnByValue: true }).then((m) => m.result.result.value);
    const waitNode = async (expr, tries = 100) => {
      for (let i = 0; i < tries; i++) {
        let r;
        try { r = await send("Runtime.evaluate", { expression: expr, returnByValue: true }); }
        catch { await new Promise((r2) => setTimeout(r2, 200)); continue; }
        const v = r.result && r.result.result ? r.result.result.value : null;
        if (v) return v;
        await new Promise((r2) => setTimeout(r2, 200));
      }
      return null;
    };

    await waitNode(`document.querySelector(".reader-author-btn") && document.readyState === "complete"`);
    await ev(`document.querySelector(".reader-author-btn").click()`);
    await waitNode(`document.getElementById("infoOverlay") && document.getElementById("infoOverlay").classList.contains("open")`);

    const out = await ev(`(function () {
      try {
      var prev = document.getElementById("infoSearchPrev");
      var next = document.getElementById("infoSearchNext");
      var pr = prev.getBoundingClientRect(), nr = next.getBoundingClientRect();
      var rangeOf = function (el) { var r = document.createRange(); r.selectNodeContents(el); return r.getBoundingClientRect(); };
      var pi = rangeOf(prev), ni = rangeOf(next);
      var cs = getComputedStyle(prev);
      return {
        width: window.innerWidth,
        prevBtn: { x: Math.round(pr.x), y: Math.round(pr.y), w: Math.round(pr.width), h: Math.round(pr.height) },
        nextBtn: { x: Math.round(nr.x), y: Math.round(nr.y), w: Math.round(nr.width), h: Math.round(nr.height) },
        btnGap: Math.round((nr.x - (pr.x + pr.width)) * 10) / 10,
        prevInk: { y: Math.round(pi.y * 10) / 10, h: Math.round(pi.height * 10) / 10 },
        nextInk: { y: Math.round(ni.y * 10) / 10, h: Math.round(ni.height * 10) / 10 },
        inkStagger: Math.round((pi.y - ni.y) * 10) / 10,
        lineHeight: cs.lineHeight,
        font: cs.fontFamily.slice(0, 60),
      };
      } catch (e) { return { error: e.message }; }
    })()`);
    console.log(JSON.stringify(out, null, 1));

    // screenshot of the search row
    const shot = await send("Page.captureScreenshot", { format: "png" });
    if (shot.result && shot.result.data) {
      fs.writeFileSync(`${process.cwd()}/tools/_nav-row.png`, Buffer.from(shot.result.data, "base64"));
      console.log("screenshot: tools/_nav-row.png");
    }
  } finally {
    ws && ws.close();
    edge.kill();
    server.close();
    try { fs.rmSync(PROFILE, { recursive: true, force: true, maxRetries: 5, retryDelay: 300 }); } catch {}
  }
}

main().catch((e) => { console.error("ERR " + e.message); process.exit(1); });
