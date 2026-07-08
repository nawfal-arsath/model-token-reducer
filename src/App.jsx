import React, { useCallback, useEffect, useState } from "react";
import mammoth from "mammoth";
import { FileText, ShieldCheck, Sparkles, ArrowRight } from "lucide-react";

import { cleanText } from "./lib/cleanup";
import { htmlToMarkdown } from "./lib/htmlToMarkdown";
import { extractPdfText } from "./lib/pdfExtract";
import { MODELS, estimateTokens } from "./lib/tokenEstimate";

import Header from "./components/Header";
import UploadZone from "./components/UploadZone";
import { StatCard } from "./components/StatCards";
import ModelChart from "./components/ModelChart";
import PreviewPanes from "./components/PreviewPanes";

const styles = {
  page: {
    minHeight: "100vh",
    background: "#F5F6F1",
  },
  main: {
    maxWidth: 1152,
    margin: "0 auto",
    padding: "48px 24px",
  },
  heroWrap: {
    maxWidth: 640,
    marginBottom: 40,
  },
  h1: {
    fontFamily: "'Fraunces', serif",
    lineHeight: 1.15,
    color: "#12161C",
    margin: 0,
  },
  heroP: {
    marginTop: 16,
    fontSize: 16,
    color: "#5B6156",
  },
  errorBox: {
    marginTop: 16,
    borderRadius: 8,
    padding: 16,
    fontSize: 14,
    border: "1px solid #EAC7B6",
    background: "#FBEFEA",
    color: "#8A4A26",
  },
  resultHead: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  resultHeadLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 14,
    color: "#5B6156",
  },
  resetLink: {
    fontSize: 14,
    textDecoration: "underline",
    background: "none",
    border: "none",
    color: "#0F6E6A",
    cursor: "pointer",
  },
  statGrid: {
    display: "grid",
    gap: 12,
    marginBottom: 32,
  },
  footerGrid: {
    display: "grid",
    gap: 16,
    marginTop: 56,
    paddingTop: 40,
    borderTop: "1px solid #DEE1D8",
  },
  footerItem: {
    display: "flex",
    gap: 12,
  },
  footerIcon: {
    flexShrink: 0,
    marginTop: 2,
  },
  footerTitle: {
    fontSize: 14,
    fontWeight: 500,
    color: "#12161C",
  },
  footerSub: {
    fontSize: 12,
    marginTop: 2,
    color: "#8B9186",
  },
};

// simple responsive tweak without a CSS framework
const mq = window.matchMedia("(min-width: 640px)");

export default function App() {
  const [isWide, setIsWide] = useState(mq.matches);
  useEffect(() => {
    const handler = (e) => setIsWide(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const [status, setStatus] = useState("idle"); // idle | processing | done | error
  const [errorMsg, setErrorMsg] = useState("");
  const [fileName, setFileName] = useState("");
  const [rawText, setRawText] = useState("");
  const [cleanTextOut, setCleanTextOut] = useState("");
  const [pdfFailed, setPdfFailed] = useState(false);
  const [pageCount, setPageCount] = useState(null);

  const process = useCallback(async (file) => {
    setStatus("processing");
    setErrorMsg("");
    setFileName(file.name);
    setPageCount(null);
    try {
      const ext = file.name.split(".").pop().toLowerCase();
      let raw = "";
      let cleaned = "";

      if (ext === "docx") {
        const buf = await file.arrayBuffer();
        const rawRes = await mammoth.extractRawText({ arrayBuffer: buf });
        raw = rawRes.value;
        const htmlRes = await mammoth.convertToHtml({ arrayBuffer: buf });
        cleaned = cleanText(htmlToMarkdown(htmlRes.value));
      } else if (ext === "pdf") {
        try {
          const { raw: r, structured, pageCount: pc } = await extractPdfText(file);
          raw = r;
          cleaned = cleanText(structured);
          setPageCount(pc);
        } catch (e) {
          setPdfFailed(true);
          throw new Error("Couldn't read that PDF. Try a .docx or .txt file instead.");
        }
      } else if (ext === "txt" || ext === "md") {
        raw = await file.text();
        cleaned = cleanText(raw);
      } else {
        throw new Error("Unsupported file type. Try .docx, .pdf, .txt, or .md.");
      }

      setRawText(raw);
      setCleanTextOut(cleaned);
      setStatus("done");
    } catch (e) {
      setErrorMsg(e.message || "Something went wrong reading that file.");
      setStatus("error");
    }
  }, []);

  const reset = () => {
    setStatus("idle");
    setRawText("");
    setCleanTextOut("");
    setFileName("");
    setErrorMsg("");
  };

  const charReduction = rawText.length > 0 ? Math.round((1 - cleanTextOut.length / rawText.length) * 100) : 0;
  const avgTokenReduction =
    rawText.length > 0
      ? Math.round(
          (MODELS.reduce(
            (acc, m) =>
              acc + (1 - estimateTokens(cleanTextOut, m.charsPerToken) / (estimateTokens(rawText, m.charsPerToken) || 1)),
            0
          ) /
            MODELS.length) *
            100
        )
      : 0;

  return (
    <div style={styles.page}>
      <Header />

      <main style={styles.main}>
        <div style={styles.heroWrap}>
          <h1 style={{ ...styles.h1, fontSize: isWide ? 48 : 32 }}>
            Turn raw documents into lean, model-ready text.
          </h1>
          <p style={styles.heroP}>
            Drop in a PDF or Word doc. Winnow strips layout noise, repeated headers, and
            page-number clutter, then shows you exactly how many tokens you saved — across five models.
          </p>
        </div>

        {status !== "done" && (
          <UploadZone onFile={process} status={status} fileName={fileName} pdfFailed={pdfFailed} />
        )}

        {status === "error" && <div style={styles.errorBox}>{errorMsg}</div>}

        {status === "done" && (
          <div>
            <div style={styles.resultHead}>
              <div style={styles.resultHeadLeft}>
                <FileText size={16} /> {fileName}
                {pageCount != null && <span> · {pageCount} page{pageCount === 1 ? "" : "s"} read</span>}
              </div>
              <button onClick={reset} style={styles.resetLink}>
                Try another file
              </button>
            </div>

            <div style={{ ...styles.statGrid, gridTemplateColumns: isWide ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
              <StatCard label="Raw characters" value={rawText.length.toLocaleString()} />
              <StatCard label="Cleaned characters" value={cleanTextOut.length.toLocaleString()} accent="#0F6E6A" />
              <StatCard label="Character reduction" value={`${charReduction}%`} accent="#0F6E6A" sub="size of extracted text" />
              <StatCard label="Avg. token reduction" value={`${avgTokenReduction}%`} accent="#B8702B" sub="across 5 models" />
            </div>

            <ModelChart rawText={rawText} cleanTextOut={cleanTextOut} />
            <PreviewPanes rawText={rawText} cleanTextOut={cleanTextOut} fileName={fileName} />
          </div>
        )}

        <div style={{ ...styles.footerGrid, gridTemplateColumns: isWide ? "repeat(3, 1fr)" : "1fr" }}>
          <div style={styles.footerItem}>
            <ShieldCheck size={18} color="#0F6E6A" style={styles.footerIcon} />
            <div>
              <div style={styles.footerTitle}>Nothing uploaded, ever</div>
              <div style={styles.footerSub}>
                Parsing happens locally in your browser. Files never touch a server.
              </div>
            </div>
          </div>
          <div style={styles.footerItem}>
            <Sparkles size={18} color="#0F6E6A" style={styles.footerIcon} />
            <div>
              <div style={styles.footerTitle}>Structure-aware cleanup</div>
              <div style={styles.footerSub}>Headings, lists, and tables are preserved — only the noise is cut.</div>
            </div>
          </div>
          <div style={styles.footerItem}>
            <ArrowRight size={18} color="#0F6E6A" style={styles.footerIcon} />
            <div>
              <div style={styles.footerTitle}>More on the way</div>
              <div style={styles.footerSub}>Accounts and saved document history can be added back in later.</div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
