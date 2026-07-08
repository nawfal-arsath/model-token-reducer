// Minimal, dependency-free HTML -> Markdown converter tuned for the
// subset of tags mammoth.js produces from a .docx file.

function inline(node) {
  let out = "";
  node.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) {
      out += child.textContent;
      return;
    }
    if (child.nodeType !== Node.ELEMENT_NODE) return;
    const tag = child.tagName.toLowerCase();
    const content = inline(child).trim();
    switch (tag) {
      case "strong":
      case "b":
        out += `**${content}**`;
        break;
      case "em":
      case "i":
        out += `*${content}*`;
        break;
      case "br":
        out += " ";
        break;
      default:
        out += content;
    }
  });
  return out.replace(/\s+/g, " ");
}

// Builds a proper Markdown table (header row + separator row) from a
// <table> element, instead of flattening every cell onto one line.
function tableToMarkdown(tableEl) {
  const rows = Array.from(tableEl.querySelectorAll("tr")).map((tr) =>
    Array.from(tr.querySelectorAll("td,th")).map((cell) => inline(cell).trim() || " ")
  );
  if (rows.length === 0) return "";

  const colCount = Math.max(...rows.map((r) => r.length));
  const normalized = rows.map((r) => {
    const row = [...r];
    while (row.length < colCount) row.push(" ");
    return row;
  });

  const [header, ...body] = normalized;
  const headerLine = `| ${header.join(" | ")} |`;
  const sepLine = `| ${header.map(() => "---").join(" | ")} |`;
  const bodyLines = body.map((r) => `| ${r.join(" | ")} |`);

  return [headerLine, sepLine, ...bodyLines].join("\n");
}

export function htmlToMarkdown(html) {
  const doc = new DOMParser().parseFromString(html, "text/html");

  function walk(node) {
    let out = "";
    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        out += child.textContent;
        return;
      }
      if (child.nodeType !== Node.ELEMENT_NODE) return;

      const tag = child.tagName.toLowerCase();

      // Tables are handled as a whole unit, not walked child-by-child.
      if (tag === "table") {
        out += `\n${tableToMarkdown(child)}\n\n`;
        return;
      }

      const innerText = inline(child).trim();

      switch (tag) {
        case "h1":
          out += `\n# ${innerText}\n\n`;
          break;
        case "h2":
          out += `\n## ${innerText}\n\n`;
          break;
        case "h3":
          out += `\n### ${innerText}\n\n`;
          break;
        case "h4":
        case "h5":
        case "h6":
          out += `\n#### ${innerText}\n\n`;
          break;
        case "p":
          out += `${innerText}\n\n`;
          break;
        case "ul":
        case "ol": {
          const items = Array.from(child.children).filter((c) => c.tagName.toLowerCase() === "li");
          items.forEach((li, i) => {
            const prefix = tag === "ol" ? `${i + 1}.` : "-";
            out += `${prefix} ${inline(li).trim()}\n`;
          });
          out += "\n";
          break;
        }
        default:
          out += walk(child);
      }
    });
    return out;
  }

  return walk(doc.body).replace(/\n{3,}/g, "\n\n").trim();
}
