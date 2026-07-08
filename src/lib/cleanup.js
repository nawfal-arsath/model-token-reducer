// Strips whitespace bloat and standalone page-number lines. Also removes
// short, non-list lines that repeat many times verbatim (typical of
// letterhead/watermark text pasted into every section of a Word doc).
// Deliberately conservative: long lines, list items, and headings are
// never touched, since exact repetition there is usually meaningful,
// not noise.
export function cleanText(raw) {
  if (!raw) return "";
  let t = raw.replace(/\r\n/g, "\n");

  t = t.replace(/\n{3,}/g, "\n\n");
  t = t
    .split("\n")
    .map((l) => l.replace(/[ \t]+$/g, ""))
    .join("\n");

  t = t
    .split("\n")
    .filter((l) => !/^\s*(page\s+)?\d{1,4}(\s+of\s+\d{1,4})?\s*$/i.test(l))
    .join("\n");

  const lines = t.split("\n");
  const isCandidate = (l) => {
    const key = l.trim();
    if (key.length < 4 || key.length > 80) return false; // headers/watermarks are short
    if (/^(#{1,6}\s|[-*]\s|\d+\.\s)/.test(key)) return false; // never touch headings/list items
    return true;
  };

  const counts = {};
  lines.forEach((l) => {
    if (!isCandidate(l)) return;
    const key = l.trim();
    counts[key] = (counts[key] || 0) + 1;
  });

  const REPEAT_THRESHOLD = 4; // require strong repetition, not coincidence
  const seen = {};
  const filtered = lines.filter((l) => {
    const key = l.trim();
    if (isCandidate(l) && counts[key] >= REPEAT_THRESHOLD) {
      seen[key] = (seen[key] || 0) + 1;
      return seen[key] === 1; // keep only the first occurrence
    }
    return true;
  });

  return filtered.join("\n").replace(/\n{3,}/g, "\n\n").trim();
}
