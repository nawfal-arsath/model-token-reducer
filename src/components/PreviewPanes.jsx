import React, { useState } from "react";
import { Copy, Download } from "lucide-react";

const styles = {
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 16,
    marginBottom: 32,
  },
  gridSm: {
    gridTemplateColumns: "1fr 1fr",
  },
  pane: {
    borderRadius: 12,
    border: "1px solid #DEE1D8",
    overflow: "hidden",
    background: "#FFFFFF",
  },
  paneAccent: {
    borderRadius: 12,
    border: "1px solid #0F6E6A",
    overflow: "hidden",
    background: "#FFFFFF",
  },
  paneHead: {
    padding: "10px 16px",
    borderBottom: "1px solid #EDEFE7",
    fontSize: 12,
    fontWeight: 500,
    color: "#8B9186",
  },
  paneHeadAccent: {
    padding: "10px 16px",
    borderBottom: "1px solid #EDEFE7",
    fontSize: 12,
    fontWeight: 500,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    color: "#0F6E6A",
  },
  actions: {
    display: "flex",
    gap: 8,
  },
  actionBtn: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    background: "none",
    border: "none",
    color: "inherit",
    fontSize: 12,
    cursor: "pointer",
  },
  pre: {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 12,
    padding: 16,
    overflow: "auto",
    height: 260,
    whiteSpace: "pre-wrap",
    color: "#8B9186",
    margin: 0,
  },
  preAccent: {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 12,
    padding: 16,
    overflow: "auto",
    height: 260,
    whiteSpace: "pre-wrap",
    color: "#12161C",
    margin: 0,
  },
  note: {
    padding: "8px 16px",
    fontSize: 11,
    color: "#8B9186",
    borderTop: "1px solid #EDEFE7",
    background: "#FAFAF7",
  },
};

const PREVIEW_LIMIT = 3000;

export default function PreviewPanes({ rawText, cleanTextOut, fileName }) {
  const [copied, setCopied] = useState(false);

  const copyMd = () => {
    navigator.clipboard.writeText(cleanTextOut);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const downloadMd = () => {
    const blob = new Blob([cleanTextOut], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = (fileName.replace(/\.[^.]+$/, "") || "document") + ".md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ ...styles.grid, ...styles.gridSm }}>
      <div style={styles.pane}>
        <div style={styles.paneHead}>RAW EXTRACTION</div>
        <pre style={styles.pre}>{rawText.slice(0, PREVIEW_LIMIT)}</pre>
        {rawText.length > PREVIEW_LIMIT && (
          <div style={styles.note}>
            Preview only — showing {PREVIEW_LIMIT.toLocaleString()} of {rawText.length.toLocaleString()} characters.
          </div>
        )}
      </div>

      <div style={styles.paneAccent}>
        <div style={styles.paneHeadAccent}>
          <span>CLEANED MARKDOWN</span>
          <div style={styles.actions}>
            <button onClick={copyMd} style={styles.actionBtn}>
              <Copy size={12} /> {copied ? "Copied" : "Copy"}
            </button>
            <button onClick={downloadMd} style={styles.actionBtn}>
              <Download size={12} /> .md
            </button>
          </div>
        </div>
        <pre style={styles.preAccent}>{cleanTextOut.slice(0, PREVIEW_LIMIT)}</pre>
        {cleanTextOut.length > PREVIEW_LIMIT && (
          <div style={styles.note}>
            Preview only — showing {PREVIEW_LIMIT.toLocaleString()} of {cleanTextOut.length.toLocaleString()} characters.
            The full document is in Copy / Download.
          </div>
        )}
      </div>
    </div>
  );
}
