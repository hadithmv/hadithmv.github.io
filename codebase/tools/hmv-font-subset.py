#!/usr/bin/env python3
"""hmv-font-subset.py — carve the site webfont to the corpus union.

The site ships one merged webfont (Arabic + Thaana + Latin, CFF) used by
every page in every UI language — the content is trilingual by design, so
the unicode-range split idea was rejected (docs/ARCHITECTURE.md "Fonts").
This tool rebuilds the font as a subset of exactly the characters the
site can render: the union of all text sources, carved with
fontTools.subset (GSUB/GPOS kept whole — Arabic positional forms are
required for shaping).

Sources scanned (the corpus contract — keep in sync with ARCHITECTURE):
    data/**/*.csv, data/**/*.json   — book content, registries, index
    static/notes/**/*.md            — info-modal notes
    src/books/*.html                — pages incl. inline scripts
    src/js/*.js                     — UI strings, export writers
    src/css/*.css                   — content: pseudo-elements

Decoding applied before counting: HTML entities (html.unescape — CSV/HTML
contexts are browser-decoded by design), JS \\uXXXX / \\u{...} escapes
incl. surrogate pairs. Over-inclusion is safe (a few wasted bytes);
under-inclusion means glyph fallback to system fonts.

Coverage contract: the subset must lose no corpus character the original
font covered. Corpus characters the original never covered (326 today:
Quranic marks, transliteration letters, emoji, control codes) keep falling
back to system fonts, exactly as before.

The full font is archived, committed once, at `src/font/` — the ingredient
drawer — and never overwritten; every carve is made from it. Carved output
lands in `dist/font/` (the optimized serving tree). `dist-build.mjs` wipes
dist/ each build and then runs this tool, so the served tree always ships a
fresh carve; a standalone run here only happens for content-only changes (a
future content addition: run `--check`; if it fails, run the full tool; it
re-carves from `src/font/` with the grown corpus).

Usage:
    python tools/hmv-font-subset.py          # scan, subset, verify, write
    python tools/hmv-font-subset.py --check  # scan + verify committed fonts only

A full run also writes `font-build-report.md` (codebase root) — a
machine-generated, committed, diffable ledger in the same pattern as
`dist-build-report.md` / `data/search-index-report.md`. The Version column is
the first 16 hex of sha256(woff2), the diffable key; the timestamp varies.

Needs (one-time):  python -m pip install fonttools brotli
"""

import datetime
import glob
import hashlib
import html
import os
import re
import sys
import time
from collections import Counter
from io import BytesIO
from pathlib import Path

# Windows consoles default to cp1252 and crash printing non-Latin-1 codepoints
# (the corpus dump lists U+02BC, Quranic marks, emoji). Force UTF-8 output.
try:
    sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.stderr.reconfigure(encoding="utf-8", errors="replace")
except AttributeError:  # pragma: no cover — Python < 3.7
    pass

from fontTools.subset import Options, Subsetter
from fontTools.ttLib import TTFont
from importlib.metadata import version as _pkg_version

FONTTOOLS_VERSION = _pkg_version("fonttools")

ROOT = Path(__file__).resolve().parent.parent
BASE = "merged-400"
# The FULL font lives in the ingredient drawer (src/font/) — committed once,
# never overwritten. The tool always carves from here.
SRC_FULL2 = ROOT / "src" / "font" / (BASE + ".woff2")  # canonical source (CFF)
SRC_FULLW = ROOT / "src" / "font" / (BASE + ".woff")
# Carved output goes to the optimized serving tree (dist/font/). dist/ is
# wiped by dist-build.mjs every build, which then re-runs this tool, so a
# standalone run here only happens for content-only changes.
OUT_WOFF2 = ROOT / "dist" / "font" / (BASE + ".woff2")
OUT_WOFF = ROOT / "dist" / "font" / (BASE + ".woff")
REPORT = ROOT / "font-build-report.md"

PATTERNS = [
    "data/**/*.csv",
    "data/**/*.json",
    "static/notes/**/*.md",
    "src/books/*.html",
    "src/js/*.js",
    "src/css/*.css",
]

# JS escape sequences: \uXXXX (surrogate pairs first), then \u{...}
PAIR_ESC = re.compile(
    r"\\u([dD][89a-fA-F][0-9a-fA-F]{2})\\u([dD][c-fC-F][0-9a-fA-F]{2})"
)
BRACE_ESC = re.compile(r"\\u\{([0-9a-fA-F]{1,6})\}")
HEX_ESC = re.compile(r"\\u([0-9a-fA-F]{4})")


def scan_corpus():
    cps = set()
    n_files = 0
    for pat in PATTERNS:
        for fn in glob.glob(os.path.join(ROOT, *pat.split("/"))):
            n_files += 1
            with open(fn, "rb") as fh:
                raw = fh.read()
            if raw.startswith(b"\xef\xbb\xbf"):
                raw = raw[3:]  # BOM
            text = raw.decode("utf-8", "ignore")
            text = html.unescape(text)
            text = PAIR_ESC.sub(
                lambda m: chr(
                    0x10000
                    + ((int(m.group(1), 16) & 0x3FF) << 10)
                    + (int(m.group(2), 16) & 0x3FF)
                ),
                text,
            )
            text = BRACE_ESC.sub(lambda m: chr(int(m.group(1), 16)), text)
            text = HEX_ESC.sub(lambda m: chr(int(m.group(1), 16)), text)
            cps.update(ord(c) for c in text)
    cps.discard(0xFEFF)
    return cps, n_files


def block_counts(cps):
    c = Counter()
    for cp in cps:
        if 0x0780 <= cp <= 0x07FF:
            c["Thaana"] += 1
        elif (
            0x0600 <= cp <= 0x06FF
            or 0x0750 <= cp <= 0x077F
            or 0x08A0 <= cp <= 0x08FF
            or 0xFB50 <= cp <= 0xFEFF
        ):
            c["Arabic"] += 1
        elif cp < 0x0300:
            c["Latin"] += 1
        else:
            c["other"] += 1
    return c


def cmap_cps(font):
    return set(font.getBestCmap().keys())


def subset_font(cps):
    """Carve both flavors from the archived full font; returns {flavor: size}."""
    opts = Options()
    opts.layout_features = ["*"]  # all GSUB/GPOS — Arabic forms, marks
    opts.name_IDs = ["*"]         # name table (identity, license) intact
    opts.glyph_names = True
    opts.notdef_glyph = True
    opts.notdef_outline = True
    opts.hinting = True           # keep whatever the source carries
    # The archived full font is the source; the output woff2 write below
    # overwrites OUT_WOFF2, never src/. The woff flavor is the same carve
    # re-flavored from the same frozen bytes.
    src_bytes = SRC_FULL2.read_bytes()
    out = {}
    for flavor, path in (("woff2", OUT_WOFF2), ("woff", OUT_WOFF)):
        # recalcTimestamp=False: head.compile() stamps head.modified with
        # "now" otherwise — byte-stable output across runs is a requirement
        # (same source, same bytes, diffable fonts).
        font = TTFont(BytesIO(src_bytes), recalcTimestamp=False)
        font.flavor = flavor
        sub = Subsetter(options=opts)
        sub.populate(unicodes=sorted(cps))
        sub.subset(font)
        path.parent.mkdir(parents=True, exist_ok=True)  # dist/font may not exist yet
        font.save(path)
        out[flavor] = path.stat().st_size
    return out


def verify(cps, path, label, original_cmap):
    f = TTFont(path)
    sub = cmap_cps(f)
    already = cps - original_cmap
    missing = cps - sub
    regress = missing - already
    return len(sub), len(f.getGlyphOrder()), missing, regress


def never_covered_buckets(already):
    """(label, count) pairs for the report table, count-descending.

    The full per-character list stays on stdout; the report carries the
    categories so a corpus drift shows as a changed row, not a changed dump.
    """
    b = Counter()
    for cp in already:
        if cp < 0x20 or 0x7F <= cp <= 0x9F:
            b["Control codes"] += 1
        elif 0x0600 <= cp <= 0x08FF or 0xFB50 <= cp <= 0xFEFF:
            b["Arabic blocks (Quranic marks, presentation forms)"] += 1
        elif 0x0100 <= cp <= 0x024F or 0x1E00 <= cp <= 0x1EFF:
            b["Latin extended (transliteration)"] += 1
        elif cp >= 0x1F000:
            b["Emoji / symbols"] += 1
        else:
            b["Other"] += 1
    return sorted(b.items(), key=lambda kv: -kv[1])


def write_report(ts, sha, cps, n_files, bc, already, out, results, times):
    """Machine-generated ledger — same pattern as dist-build-report.md.

    Sizes are KB with one decimal (the house unit — matches dist-build-report).
    The Version column is the diffable key: it fingerprints the font bytes, so
    the timestamp varying between runs cannot hide a stale carve.
    """
    kb = lambda n: "%.1f" % (n / 1024.0)
    text = [
        "# Font Build Report",
        "",
        "Regenerated by `python tools/hmv-font-subset.py` — machine output, do not hand-edit.",
        "",
        "| Carved | Version (sha256 of woff2, first 16) |",
        "|---|---|",
        "| %s (%s s) | `%s` |" % (ts, times["total"], sha[:16]),
        "",
        "## Source",
        "",
        "The archived full font this carve was made from — committed once, never overwritten:",
        "",
        "| File | Size (KB) |",
        "|---|---|",
        "| `src/font/merged-400.woff2` | %s |" % kb(SRC_FULL2.stat().st_size),
        "| `src/font/merged-400.woff` | %s |" % kb(SRC_FULLW.stat().st_size),
        "",
        "## Corpus (scan sources: data CSV/JSON, notes md, src html/js/css)",
        "",
        "| Files | Codepoints | Thaana | Arabic | Latin | Other |",
        "|---|---|---|---|---|---|",
        "| %d | %d | %d | %d | %d | %d |"
        % (n_files, len(cps), bc["Thaana"], bc["Arabic"], bc["Latin"], bc["other"]),
        "",
        "## Subset (carved output — what the site serves)",
        "",
        "| Flavor | Full (KB) | Subset (KB) | Saved |",
        "|---|---|---|---|",
        "| dist/font/merged-400.woff2 | %s | %s | %.1f%% |"
        % (kb(SRC_FULL2.stat().st_size), kb(out["woff2"]), (1 - out["woff2"] / SRC_FULL2.stat().st_size) * 100),
        "| dist/font/merged-400.woff | %s | %s | %.1f%% |"
        % (kb(SRC_FULLW.stat().st_size), kb(out["woff"]), (1 - out["woff"] / SRC_FULLW.stat().st_size) * 100),
        "",
        "| Codepoints | Glyphs | Lost vs source |",
        "|---|---|---|",
        "| %d | %d | %d |" % (results["woff2"][0], results["woff2"][1], len(results["woff2"][3])),
        "",
        "## Coverage: corpus chars the source font never covered",
        "",
        "These fall back to system fonts exactly as before the carve — the subset"
        " loses nothing the source covered. Only a regression (a row in"
        " \"Lost vs source\" above) fails the run.",
        "",
        "| Category | Chars |",
        "|---|---|",
    ]
    for label, count in never_covered_buckets(already):
        text.append("| %s | %d |" % (label, count))
    text += [
        "| **Total** | **%d** |" % len(already),
        "",
        "## Build Stats",
        "",
        "- Total: %s s — scan %s s · carve %s s · verify %s s"
        % (times["total"], times["scan"], times["carve"], times["verify"]),
        "- Python %s · fontTools %s" % (sys.version.split()[0], FONTTOOLS_VERSION),
        "",
        "## Notes",
        "",
        "- Version = sha256 of woff2, first 16 hex — the diffable key; the timestamp varies, the sha does not",
        "- The woff is the same carve re-flavored (identical coverage — built from the woff2's bytes)",
        "- GSUB/GPOS kept whole: Arabic positional forms, lam-alef ligature, ccmp, locl — shaping is intact",
        "- Output is byte-stable: carving the same source with the same corpus twice yields identical files",
        "",
    ]
    REPORT.write_text("\n".join(text), encoding="utf-8", newline="\n")


def main():
    check_only = len(sys.argv) > 1 and sys.argv[1] == "--check"
    t0 = time.monotonic()

    cps, n = scan_corpus()
    t_scan = time.monotonic()
    print("corpus: %d files -> %d unique codepoints" % (n, len(cps)))
    bc = block_counts(cps)
    print("  " + ", ".join("%s %d" % (k, v) for k, v in bc.items()))

    src = TTFont(SRC_FULL2)
    original_cmap = cmap_cps(src)
    already = sorted(cps - original_cmap)
    print(
        "source src/font/%s.woff2: %d codepoints, %d glyphs, OS/2 weight %d"
        % (BASE, len(original_cmap), len(src.getGlyphOrder()), src["OS/2"].usWeightClass)
    )
    print(
        "corpus chars the source never covered (system-font fallback, must stay that way): %d"
        % len(already)
    )
    for cp in already:
        print("    U+%04X %r" % (cp, chr(cp)))
    # The two committed flavors must agree with each other (both subsets, or
    # both the full font) — compare them against each other, not the archive.
    # dist/ is wiped by every dist-build.mjs run, so a missing pair here just
    # means a full run is about to create it; --check reports it per-flavor.
    if OUT_WOFF2.exists() and OUT_WOFF.exists():
        out2 = TTFont(OUT_WOFF2)
        pair = TTFont(OUT_WOFF)
        if cmap_cps(pair) != cmap_cps(out2):
            print("ERROR: woff and woff2 cmaps differ — aborting")
            sys.exit(1)
        out2.close()
        pair.close()

    if check_only:
        print("\n--check: verifying committed fonts against the corpus")
        bad = False
        for flavor, path in (("woff2", OUT_WOFF2), ("woff", OUT_WOFF)):
            if not path.exists():
                print("  %s: MISSING %s  FAIL" % (flavor, path))
                bad = True
                continue
            nsub, nglyphs, missing, regress = verify(cps, path, flavor, original_cmap)
            ok = not regress
            bad = bad or not ok
            print(
                "  %s: %d codepoints / %d glyphs; corpus chars lost vs source: %d  %s"
                % (flavor, nsub, nglyphs, len(regress), "OK" if ok else "FAIL")
            )
        sys.exit(1 if bad else 0)

    # Guard: a full merged font's cmap always exceeds the corpus (it carries
    # hundreds of unused chars); a subset's is smaller (corpus ∩ source, plus
    # maybe a stray GSUB-referenced glyph like U+2039). Refuse to re-subset —
    # the archived src/ font is the one and only full original.
    if len(original_cmap) < len(cps):
        print("ERROR: %s is already a subset (cmap %d < corpus %d)." % (SRC_FULL2, len(original_cmap), len(cps)))
        print("Restore the full original first:  git checkout HEAD -- src/font/merged-400.woff2 src/font/merged-400.woff")
        sys.exit(1)

    out = subset_font(cps)
    t_carve = time.monotonic()
    full = {"woff2": SRC_FULL2.stat().st_size, "woff": SRC_FULLW.stat().st_size}
    print("\nsubset written:")
    for flavor, after in out.items():
        before = full[flavor]
        print(
            "  %s.%s: %d -> %d bytes (%.1f%% saved)"
            % (BASE, flavor, before, after, (1 - after / before) * 100)
        )

    results = {}
    bad = False
    for flavor, path in (("woff2", OUT_WOFF2), ("woff", OUT_WOFF)):
        nsub, nglyphs, missing, regress = verify(cps, path, flavor, original_cmap)
        results[flavor] = (nsub, nglyphs, missing, regress)
        ok = not regress
        bad = bad or not ok
        print(
            "coverage %s: %d codepoints / %d glyphs; lost vs source: %d  %s"
            % (flavor, nsub, nglyphs, len(regress), "OK" if ok else "FAIL")
        )
        if regress:
            for cp in sorted(regress):
                print("    LOST U+%04X %r" % (cp, chr(cp)))
    t_verify = time.monotonic()
    h = hashlib.sha256(OUT_WOFF2.read_bytes()).hexdigest()
    print("sha256(woff2) first 16: %s  (idempotency: run twice, compare)" % h[:16])
    if not bad:  # the ledger only ever records a verified carve
        times = {
            "total": "%.1f" % (t_verify - t0),
            "scan": "%.1f" % (t_scan - t0),
            "carve": "%.1f" % (t_carve - t_scan),
            "verify": "%.1f" % (t_verify - t_carve),
        }
        write_report(
            datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="milliseconds"),
            h, cps, n, bc, already, out, results, times,
        )
        print("wrote %s (%d B)" % (REPORT.name, REPORT.stat().st_size))
    sys.exit(1 if bad else 0)


if __name__ == "__main__":
    main()
