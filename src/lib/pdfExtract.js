import * as pdfjsLib from "pdfjs-dist";
import pdfWorkerUrl from "pdfjs-dist/build/pdf.worker.min.js?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;

// Groups a page's text items into visual lines by rounding their y-position.
function groupIntoLines(items) {
  const buckets = new Map();
  items.forEach((it) => {
    const y = Math.round(it.transform[5] / 2) * 2; // 2pt tolerance
    if (!buckets.has(y)) buckets.set(y, []);
    buckets.get(y).push(it);
  });
  // top of page first (higher y = higher on the page in PDF space)
  const lines = Array.from(buckets.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([y, items]) => ({
      y,
      text: items
        .sort((a, b) => a.transform[4] - b.transform[4])
        .map((it) => it.str)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim(),
      maxHeight: Math.max(...items.map((it) => it.transform[3])),
    }))
    .filter((l) => l.text.length > 0);
  return lines;
}

const isPageNumberLine = (t) => /^\s*(page\s+)?\d{1,4}(\s+of\s+\d{1,4})?\s*$/i.test(t);

// Footers/headers often share a line with the page number (e.g. "Confidential   7").
// Strip a trailing/leading standalone number before comparing across pages, so the
// rest of the line still matches even though the number itself changes per page.
const normalizeForBoundaryMatch = (t) =>
  t
    .replace(/\s+\d{1,4}\s*$/, "")
    .replace(/^\d{1,4}\s+/, "")
    .trim()
    .toLowerCase();

export async function extractPdfText(file) {
  const buf = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buf }).promise;

  const pages = [];
  let raw = "";

  for (let p = 1; p <= pdf.numPages; p++) {
    const page = await pdf.getPage(p);
    const content = await page.getTextContent();
    const lines = groupIntoLines(content.items);
    pages.push(lines);
    raw += lines.map((l) => l.text).join("\n") + `\nPage ${p}\n`;
  }

  // Identify running headers/footers: lines that appear among the first 2 or
  // last 2 lines of a page, on at least half the pages (min 2 pages) — a much
  // stronger signal than "this exact text repeated 3 times anywhere".
  const boundaryCounts = new Map();
  if (pages.length >= 2) {
    pages.forEach((lines) => {
      const boundary = [...lines.slice(0, 2), ...lines.slice(-2)];
      const seenOnThisPage = new Set();
      boundary.forEach((l) => {
        const key = normalizeForBoundaryMatch(l.text);
        if (key.length < 3 || seenOnThisPage.has(key)) return;
        seenOnThisPage.add(key);
        boundaryCounts.set(key, (boundaryCounts.get(key) || 0) + 1);
      });
    });
  }
  const repeatThreshold = Math.max(2, Math.ceil(pages.length * 0.5));
  const runningHeaderFooters = new Set(
    [...boundaryCounts.entries()].filter(([, count]) => count >= repeatThreshold).map(([key]) => key)
  );

  // Compute average line height across the doc to detect headings.
  const allHeights = pages.flat().map((l) => l.maxHeight).filter(Boolean);
  const avgH = allHeights.reduce((a, b) => a + b, 0) / (allHeights.length || 1);

  let structured = "";
  pages.forEach((lines) => {
    lines.forEach((l) => {
      const key = normalizeForBoundaryMatch(l.text);
      if (runningHeaderFooters.has(key)) return;
      if (isPageNumberLine(l.text)) return;

      const isHeading = l.maxHeight > avgH * 1.25 && l.text.length > 2 && l.text.length < 120;
      structured += isHeading ? `\n## ${l.text}\n` : `${l.text}\n`;
    });
    structured += "\n";
  });

  return {
    raw,
    structured: structured.replace(/\n{3,}/g, "\n\n").trim(),
    pageCount: pdf.numPages,
  };
}
