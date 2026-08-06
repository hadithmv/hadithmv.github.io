/**
 * Export formats — TXT, MD, JSON, CSV, TSV, PDF, PNG, Excel, EPUB,
 * YAML, TOON, HTML, HTML Table, XML, Word.
 *
 * Extracted from reader.js to keep the main module under 2 000 lines.
 * Pass a context object with the data and callbacks the exports need.
 */

import { unparseCSV } from "./csv.js";
import { escapeHTML } from "./search-utils.js";

export function initExports(ctx) {
  var btnExport = document.getElementById("btnExport");
  var exportDropdown = document.getElementById("exportDropdown");
  if (!btnExport || !exportDropdown) return;

  btnExport.addEventListener("click", function (e) {
    e.stopPropagation();
    if (exportDropdown.style.display === "none" || !exportDropdown.style.display) {
      window.openDropdown(exportDropdown, btnExport);
    } else {
      exportDropdown.style.display = "none";
    }
  });
  window.registerDropdown("exportDropdown", exportDropdown, btnExport);

  function downloadFile(content, filename, mime) {
    var blob = new Blob([content], { type: mime });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // Busy state for the export button — large exports (54k rows, EPUB+font)
  // take seconds; without feedback users double-click and get duplicates.
  function setExportBusy(on) {
    if (on) {
      btnExport.disabled = true;
      btnExport.dataset.origText = btnExport.textContent;
      btnExport.textContent = ctx.t("exportPreparing");
    } else {
      btnExport.disabled = false;
      if (btnExport.dataset.origText) btnExport.textContent = btnExport.dataset.origText;
      delete btnExport.dataset.origText;
    }
  }

  exportDropdown.querySelectorAll(".export-option").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var fmt = this.dataset.format;
      var meta = ctx.metadata;
      var baseName = (meta.titleEN || meta.bookCode || "book");
      var rows = ctx.allData;
      var rowsWithHeader = ctx.headerRow ? [ctx.headerRow].concat(rows) : rows;
      var content, filename, mime;
      var siteURL = window.location.origin + window.location.pathname + "?book=" + meta.bookCode;
      var versionFull = ctx.t("appVersion");
      var versionText = versionFull.replace(/ \(.*\)/, "");
      var exportHeader = (meta.titleEN || meta.bookCode) + "\n" + meta.titleDV + "\n" + meta.titleAR + "\n\n" + siteURL + "\nHadithmv\n" + versionText + "\n\n" + "──────────\n\n";

      // Close the dropdown and show the busy label immediately
      exportDropdown.style.display = "none";
      setExportBusy(true);

      if (fmt === "txt") {
        content = exportHeader + ctx.buildClipboardText(0, rows.length);
        filename = baseName + ".txt";
        mime = "text/plain";
      } else if (fmt === "md") {
        content = "# " + (meta.titleEN || meta.bookCode) + "\n\n" + meta.titleDV + "\n" + meta.titleAR + "\n\n" + siteURL + "\n\nHadithmv\n" + versionText + "\n\n---\n\n";
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          content += "## " + (ctx.hasRowNums ? "#" : "") + (ctx.hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "\n\n";
          var exportStart0 = ctx.hasRowNums ? 1 : 0;
          var mdPrevHdr = "";
          for (var j = exportStart0; j < r.length; j++) {
            if (r[j] && String(r[j]).trim()) {
              var mdHdr = (ctx.headerRow && ctx.headerRow[j]) ? ctx.headerRow[j].toLowerCase() : "";
              if (mdPrevHdr.startsWith("matn") && mdHdr.startsWith("sharh")) content += "· · ·\n\n";
              content += String(r[j]).trim() + "\n\n";
              mdPrevHdr = mdHdr;
            }
          }
          content += "---\n\n";
        }
        filename = baseName + ".md";
        mime = "text/markdown";
      } else if (fmt === "json") {
        content = JSON.stringify(rowsWithHeader, null, 2);
        filename = baseName + ".json";
        mime = "application/json";
      } else if (fmt === "csv") {
        content = unparseCSV(rowsWithHeader);
        filename = baseName + ".csv";
        mime = "text/csv";
      } else if (fmt === "tsv") {
        content = rowsWithHeader.map(function (row) {
          return row.map(function (cell) {
            var s = cell == null ? "" : String(cell);
            return s.replace(/\t/g, " ").replace(/\n/g, " ");
          }).join("\t");
        }).join("\n");
        filename = baseName + ".tsv";
        mime = "text/tab-separated-values";
      } else if (fmt === "pdf") {
        var fontUrl = window.location.origin + window.location.pathname.replace(/\/[^/]*$/, "/../font/merged-300.woff2");
        var pdfHTML = '<html dir="rtl"><head><meta charset="utf-8"><style>@page{@bottom-center{content:counter(page);font-family:Hadithmv;font-size:9pt;color:#999}} @font-face{font-family:Hadithmv;src:url(' + fontUrl + ') format("woff2");font-weight:300;font-display:block} body{font-family:Hadithmv,"Traditional Arabic","Scheherazade New",serif;font-size:14pt;line-height:2.2;padding:30px;direction:rtl;max-width:700px;margin:0 auto} h1{text-align:center;margin-bottom:8px} h2{font-size:11pt;color:#888;margin:24px 0 4px} p{margin:8px 0} hr{border:none;border-top:1px solid #ddd;margin:16px 0}</style></head><body>';
        pdfHTML += "<p style='text-align:center;font-size:9pt;color:#999'>Hadithmv - " + siteURL + " - " + versionText + "</p>";
        pdfHTML += "<h1>" + meta.titleDV + "</h1><p style='text-align:center'>" + meta.titleAR + "</p>";
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          pdfHTML += "<h2>" + (ctx.hasRowNums ? "#" : "") + (ctx.hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "</h2>";
          var fields = [];
          for (var j = (ctx.hasRowNums ? 1 : 0); j < r.length; j++) {
            if (r[j] && String(r[j]).trim()) fields.push({ value: String(r[j]).trim(), index: j });
          }
          for (var j = 0; j < fields.length; j++) {
            var colHeader2 = (ctx.headerRow && ctx.headerRow[fields[j].index]) ? ctx.headerRow[fields[j].index].toLowerCase() : "";
            if (j > 0) {
              var prevHdr2 = (ctx.headerRow && ctx.headerRow[fields[j - 1].index]) ? ctx.headerRow[fields[j - 1].index].toLowerCase() : "";
              if (prevHdr2.endsWith("ar") && colHeader2.endsWith("dv")) pdfHTML += "<p>&nbsp;</p>";
              if (prevHdr2.startsWith("matn") && colHeader2.startsWith("sharh")) pdfHTML += '<p style="text-align:center;color:#bbb;margin:6px 0;font-size:8pt;letter-spacing:3px">· · ·</p>';
            }
            if (colHeader2.startsWith("foot") && fields.length > 1) pdfHTML += '<p style="color:#999;font-size:11pt">ــــــــــــــــــــــــــــــــــــــــــــ</p>';
            if (!colHeader2.startsWith("foot")) {
              if (colHeader2.startsWith("head")) {
                pdfHTML += '<p style="font-size:17pt;font-weight:700;margin:12px 0 2px">' + fields[j].value + '</p>';
              } else if (colHeader2.startsWith("kitab")) {
                pdfHTML += '<p style="font-weight:600;font-size:15pt;margin:8px 0 2px">' + fields[j].value + '</p>';
              } else if (colHeader2.startsWith("bab")) {
                pdfHTML += '<p style="font-weight:600;margin:6px 0 2px">' + fields[j].value + '</p>';
              } else if (colHeader2.startsWith("sharh")) {
                pdfHTML += '<p style="font-size:12.5pt">' + fields[j].value + '</p>';
              } else {
                pdfHTML += "<p>" + fields[j].value + "</p>";
              }
            } else {
              pdfHTML += "<p>" + fields[j].value + "</p>";
            }
          }
          pdfHTML += "<hr>";
        }
        pdfHTML += "</body></html>";
        var w = window.open("", "_blank");
        w.document.write(pdfHTML);
        w.document.close();
        w.onload = function () { w.print(); };
        setExportBusy(false);
      } else if (fmt === "png") {
        var vRow = ctx.visiblePageIndex();
        var rc = document.getElementById("readerContent");
        var bg = getComputedStyle(rc).backgroundColor;
        var fg = getComputedStyle(rc).color;
        var chunk = rc.querySelector('.reader-chunk[data-row="' + vRow + '"]');
        if (!chunk) { setExportBusy(false); return; }
        fetch("../font/merged-300.woff2").then(function(r){return r.blob();}).then(function(blob){
          var reader = new FileReader();
          reader.onload = function() {
            var fontData = reader.result;
            var clone = chunk.cloneNode(true);
            var wrapper = document.createElement("div");
            wrapper.style.cssText = "position:absolute;left:0;top:0;width:600px;font-family:Hadithmv,'Traditional Arabic',serif;direction:rtl;text-align:right;background:" + bg + ";color:" + fg + ";padding:0";
            var contentDiv = document.createElement("div");
            contentDiv.style.cssText = "padding:32px 32px 0 32px;font-size:17pt;line-height:2.3;text-align:right;direction:rtl";
            contentDiv.innerHTML = clone.outerHTML;
            var footerDiv = document.createElement("div");
            footerDiv.style.cssText = "text-align:center;padding:20px 32px;font-size:13pt;line-height:1.8;direction:rtl;margin-top:8px";
            footerDiv.textContent = meta.titleDV + "\n" + meta.titleAR + "\n" + siteURL + "\nHadithmv · " + versionText;
            footerDiv.style.whiteSpace = "pre-line";
            wrapper.appendChild(contentDiv);
            wrapper.appendChild(footerDiv);
            document.body.appendChild(wrapper);
            var rect = wrapper.getBoundingClientRect();
            var svg = '<svg xmlns="http://www.w3.org/2000/svg" width="' + rect.width + '" height="' + rect.height + '">' +
              '<defs><style>@font-face{font-family:Hadithmv;src:url(' + fontData + ') format("woff2");font-weight:300}</style></defs>' +
              '<foreignObject width="100%" height="100%">' +
              '<div xmlns="http://www.w3.org/1999/xhtml" style="font-family:Hadithmv">' + wrapper.innerHTML + '</div>' +
              '</foreignObject></svg>';
            var img = new Image();
            img.onload = function () {
              var canvas = document.createElement("canvas");
              canvas.width = rect.width * 2;
              canvas.height = rect.height * 2;
              var canvasCtx = canvas.getContext("2d");
              canvasCtx.scale(2, 2);
              canvasCtx.fillStyle = bg;
              canvasCtx.fillRect(0, 0, rect.width, rect.height);
              canvasCtx.drawImage(img, 0, 0);
              canvas.toBlob(function (b) {
                var u = URL.createObjectURL(b);
                var a = document.createElement("a");
                a.href = u; a.download = baseName + ".png";
                document.body.appendChild(a); a.click();
                document.body.removeChild(a); URL.revokeObjectURL(u);
                document.body.removeChild(wrapper);
                setExportBusy(false);
              }, "image/png");
            };
            img.onerror = function () { window.showErrorToast("PNG export failed"); setExportBusy(false); };
            img.src = "data:image/svg+xml," + encodeURIComponent(svg);
          };
          reader.onerror = function () { window.showErrorToast("PNG export failed"); setExportBusy(false); };
          reader.readAsDataURL(blob);
        }).catch(function () { window.showErrorToast("PNG export failed"); setExportBusy(false); });
        return;
      } else if (fmt === "excel") {
        import("./xlsx.js").then(function(mod) {
          var xlsxBlob = mod.createXLSX(rowsWithHeader, baseName);
          var u = URL.createObjectURL(xlsxBlob);
          var a = document.createElement("a");
          a.href = u; a.download = baseName + ".xlsx";
          document.body.appendChild(a); a.click();
          document.body.removeChild(a); URL.revokeObjectURL(u);
          setExportBusy(false);
        }).catch(function () { window.showErrorToast("Excel export failed"); setExportBusy(false); });
        return;
      } else if (fmt === "epub") {
        fetch("../font/merged-300.woff2")
          .then(function(r) { return r.ok ? r.arrayBuffer() : null; })
          .then(function(fontBuf) {
            return import("./epub.js").then(function(mod) {
              var epubBlob = mod.createEPUB(rows, {
                bookCode: meta.bookCode,
                titleEN: meta.titleEN,
                titleDV: meta.titleDV,
                titleAR: meta.titleAR
              }, {
                siteURL: siteURL,
                fontData: fontBuf ? new Uint8Array(fontBuf) : null,
                headerRow: ctx.headerRow
              });
              var u = URL.createObjectURL(epubBlob);
              var a = document.createElement("a");
              a.href = u; a.download = baseName + ".epub";
              document.body.appendChild(a); a.click();
              document.body.removeChild(a); URL.revokeObjectURL(u);
              setExportBusy(false);
            });
          }).catch(function () { window.showErrorToast("EPUB export failed"); setExportBusy(false); });
        return;
      } else if (fmt === "yaml") {
        var y = "# " + (meta.titleEN || baseName) + "\n# " + meta.titleDV + " - " + meta.titleAR + "\n# " + siteURL + "\n# Hadithmv · " + versionText + "\n---\n";
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          y += "- id: " + (ctx.hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "\n  fields:\n";
          for (var j = (ctx.hasRowNums ? 1 : 0); j < r.length; j++) {
            if (r[j] != null && String(r[j]).trim()) {
              y += "    - |\n      " + String(r[j]).trim().replace(/\n/g, "\n      ") + "\n";
            }
          }
        }
        downloadFile(y, baseName + ".yaml", "text/yaml");
      } else if (fmt === "toon") {
        var to = "[" + rows.length + "]:\n";
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          var vals = [];
          for (var j = 0; j < r.length; j++) {
            if (r[j] == null || String(r[j]).trim() === "") {
              vals.push("null");
            } else {
              var v = String(r[j]).trim();
              vals.push(/[\s,:"\\\[\]{}]/.test(v) || v === "true" || v === "false" || v === "null" || /^-?\d+(?:\.\d+)?(?:e[+\-]?\d+)?$/i.test(v) ? JSON.stringify(v) : v);
            }
          }
          to += "  - [" + vals.length + "]: " + vals.join(",") + "\n";
        }
        downloadFile(to, baseName + ".toon", "text/plain");
      } else if (fmt === "html") {
        var htmlExport = '<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>' + (meta.titleEN || baseName) + '</title><style>@font-face{font-family:Hadithmv;src:url(../font/merged-300.woff2) format("woff2");font-weight:300} body{font-family:Hadithmv,"Traditional Arabic","Scheherazade New",serif;font-size:14pt;line-height:2.2;padding:24px;max-width:700px;margin:0 auto;direction:rtl;background:#fff;color:#1a202c} h1{text-align:center;font-size:18pt;margin-bottom:4px} h2{font-size:11pt;color:#888;margin:28px 0 4px} p{margin:6px 0} .sharh{font-size:12.5pt} hr{border:none;border-top:1px solid #ddd;margin:20px 0} .ms-sep{text-align:center;color:#bbb;margin:10px 0;font-size:8pt;letter-spacing:3px} .hd{text-align:center;font-size:10pt;color:#999;margin-bottom:24px} .sep{text-align:center;color:#ccc;margin:20px 0}</style></head><body>';
        htmlExport += '<h1>' + meta.titleDV + '</h1><p style="text-align:center">' + meta.titleAR + '</p>';
        htmlExport += '<div class="hd">' + siteURL + '<br>Hadithmv · ' + versionText + '</div><hr>';
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          htmlExport += '<h2>#' + (ctx.hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + '</h2>';
          var expPrevHdr = "";
          for (var j = (ctx.hasRowNums ? 1 : 0); j < r.length; j++) {
            if (r[j] != null && String(r[j]).trim()) {
              var expHdr = (ctx.headerRow && ctx.headerRow[j]) ? ctx.headerRow[j].toLowerCase() : "";
              if (expPrevHdr.startsWith("matn") && expHdr.startsWith("sharh")) htmlExport += '<div class="ms-sep">· · ·</div>';
              if (expHdr.startsWith("sharh")) {
                htmlExport += '<p class="sharh">' + String(r[j]).trim() + '</p>';
              } else {
                htmlExport += '<p>' + String(r[j]).trim() + '</p>';
              }
              expPrevHdr = expHdr;
            }
          }
          if (i < rows.length - 1) htmlExport += '<div class="sep">◆</div>';
        }
        htmlExport += '</body></html>';
        downloadFile(htmlExport, baseName + ".html", "text/html");
      } else if (fmt === "html-table") {
        var ht = '<!doctype html><html dir="rtl"><head><meta charset="utf-8"><title>' + (meta.titleEN || baseName) + '</title><style>@font-face{font-family:Hadithmv;src:url(../font/merged-300.woff2) format("woff2");font-weight:300} body{font-family:Hadithmv,"Traditional Arabic","Scheherazade New",serif;font-size:12pt;line-height:1.8;padding:16px;direction:rtl;background:#fff;color:#1a202c} h1{text-align:center;font-size:16pt;margin-bottom:4px} table{width:100%;border-collapse:collapse;direction:rtl} th,td{padding:6px 8px;border:1px solid #ddd;text-align:right;vertical-align:top} th{background:#f5f5f5;font-weight:700;font-size:10pt;white-space:nowrap} .hd{text-align:center;font-size:9pt;color:#999;margin-bottom:16px}</style></head><body>';
        ht += '<h1>' + meta.titleDV + '</h1><p style="text-align:center">' + meta.titleAR + '</p>';
        ht += '<div class="hd">' + siteURL + '<br>Hadithmv · ' + versionText + '</div>';
        ht += '<table><thead><tr>';
        if (ctx.headerRow) {
          for (var ci = 0; ci < ctx.headerRow.length; ci++) {
            ht += '<th>' + escapeHTML(ctx.headerRow[ci] || "") + '</th>';
          }
        }
        ht += '</tr></thead><tbody>';
        for (var ri = 0; ri < rows.length; ri++) {
          ht += '<tr>';
          for (var cj = 0; cj < rows[ri].length; cj++) {
            var cv = rows[ri][cj] != null ? String(rows[ri][cj]).trim() : "";
            ht += '<td>' + escapeHTML(cv) + '</td>';
          }
          ht += '</tr>';
        }
        ht += '</tbody></table></body></html>';
        downloadFile(ht, baseName + "-table.html", "text/html");
      } else if (fmt === "xml") {
        var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<book>\n';
        xml += '  <title><dv>' + (meta.titleDV || "") + '</dv><ar>' + (meta.titleAR || "") + '</ar><en>' + (meta.titleEN || "") + '</en></title>\n';
        xml += '  <meta><url>' + siteURL + '</url><version>' + versionText + '</version></meta>\n';
        xml += '  <rows>\n';
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          xml += '    <row id="' + (ctx.hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + '">\n';
          for (var j = (ctx.hasRowNums ? 1 : 0); j < r.length; j++) {
            if (r[j] != null && String(r[j]).trim()) {
              xml += '      <col' + j + '>' + escapeHTML(String(r[j]).trim()) + '</col' + j + '>\n';
            }
          }
          xml += '    </row>\n';
        }
        xml += '  </rows>\n</book>';
        downloadFile(xml, baseName + ".xml", "application/xml");
      } else if (fmt === "word") {
        content = '<html dir="rtl"><head><meta charset="utf-8"><style>body{font-family:"Traditional Arabic","Scheherazade New",serif;font-size:14pt;line-height:2;padding:20px;direction:rtl} h2{font-size:12pt;color:#666}</style></head><body>';
        content += '<p style="text-align:center;font-size:10pt;color:#999">Hadithmv - ' + siteURL + ' - ' + versionText + '</p>';
        content += "<h1>" + meta.titleDV + " - " + meta.titleAR + "</h1>";
        for (var i = 0; i < rows.length; i++) {
          var r = rows[i];
          content += "<h2>" + (ctx.hasRowNums ? "#" : "") + (ctx.hasRowNums ? (r[0] || (i + 1)) : (i + 1)) + "</h2>";
          var fields = [];
          for (var j = (ctx.hasRowNums ? 1 : 0); j < r.length; j++) {
            if (r[j] && String(r[j]).trim()) fields.push({ value: String(r[j]).trim(), index: j });
          }
          for (var j = 0; j < fields.length; j++) {
            var colHeader3 = (ctx.headerRow && ctx.headerRow[fields[j].index]) ? ctx.headerRow[fields[j].index].toLowerCase() : "";
            if (j > 0) {
              var prevHdr3 = (ctx.headerRow && ctx.headerRow[fields[j - 1].index]) ? ctx.headerRow[fields[j - 1].index].toLowerCase() : "";
              if (prevHdr3.endsWith("ar") && colHeader3.endsWith("dv")) content += "<p>&nbsp;</p>";
              if (prevHdr3.startsWith("matn") && colHeader3.startsWith("sharh")) content += '<p style="text-align:center;color:#bbb;margin:6px 0;font-size:8pt;letter-spacing:3px">· · ·</p>';
            }
            if (colHeader3.startsWith("foot") && fields.length > 1) content += '<p style="color:#999;font-size:11pt">ــــــــــــــــــــــــــــــــــــــــــــ</p>';
            if (!colHeader3.startsWith("foot")) {
              if (colHeader3.startsWith("head")) {
                content += '<p style="font-size:17pt;font-weight:700;margin:12px 0 2px">' + fields[j].value + '</p>';
              } else if (colHeader3.startsWith("kitab")) {
                content += '<p style="font-weight:600;font-size:15pt;margin:8px 0 2px">' + fields[j].value + '</p>';
              } else if (colHeader3.startsWith("bab")) {
                content += '<p style="font-weight:600;margin:6px 0 2px">' + fields[j].value + '</p>';
              } else if (colHeader3.startsWith("sharh")) {
                content += '<p style="font-size:12.5pt">' + fields[j].value + '</p>';
              } else {
                content += "<p>" + fields[j].value + "</p>";
              }
            } else {
              content += "<p>" + fields[j].value + "</p>";
            }
          }
          content += "<hr>";
        }
        content += "</body></html>";
        filename = baseName + ".doc";
        mime = "application/msword";
      }
      if (content) downloadFile(content, filename, mime);
      setExportBusy(false);
    });
  });
}
