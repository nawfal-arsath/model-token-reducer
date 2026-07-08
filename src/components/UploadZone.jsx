import React, { useRef, useState } from "react";
import { UploadCloud, Loader2, Info } from "lucide-react";

const styles = {
  zone: (dragOver) => ({
    borderRadius: 16,
    border: `2px dashed ${dragOver ? "#0F6E6A" : "#D3D6CB"}`,
    padding: 48,
    textAlign: "center",
    background: "#FFFFFF",
    boxShadow: dragOver ? "0 0 0 2px #0F6E6A inset" : "none",
    transition: "all 150ms ease",
  }),
  processingWrap: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
  },
  processingText: {
    fontSize: 14,
    color: "#5B6156",
  },
  iconCircle: {
    margin: "0 auto",
    width: 48,
    height: 48,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    background: "#EDEFE7",
  },
  mainText: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 4,
    color: "#12161C",
  },
  link: {
    textDecoration: "underline",
    color: "#0F6E6A",
    background: "none",
    border: "none",
    fontSize: 14,
    fontWeight: 500,
  },
  subText: {
    fontSize: 12,
    color: "#8B9186",
  },
  warnText: {
    fontSize: 12,
    marginTop: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    color: "#B8702B",
  },
};

export default function UploadZone({ onFile, status, fileName, pdfFailed }) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const onDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFile(file);
  };

  const onPick = (e) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={onDrop}
      style={styles.zone(dragOver)}
    >
      {status === "processing" ? (
        <div style={styles.processingWrap}>
          <Loader2 className="animate-spin" size={28} color="#0F6E6A" />
          <p style={styles.processingText}>Extracting and cleaning {fileName}…</p>
        </div>
      ) : (
        <>
          <div style={styles.iconCircle}>
            <UploadCloud size={22} color="#0F6E6A" />
          </div>
          <p style={styles.mainText}>
            Drag a file here, or{" "}
            <button style={styles.link} onClick={() => inputRef.current?.click()}>
              browse
            </button>
          </p>
          <p style={styles.subText}>.docx, .pdf, .txt, .md — nothing leaves your device</p>
          <input
            ref={inputRef}
            type="file"
            accept=".docx,.pdf,.txt,.md"
            style={{ display: "none" }}
            onChange={onPick}
          />
          {pdfFailed && (
            <p style={styles.warnText}>
              <Info size={12} /> PDF engine failed to load — .docx and .txt still work fine.
            </p>
          )}
        </>
      )}
    </div>
  );
}
