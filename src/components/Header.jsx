import React from "react";
import { Lock } from "lucide-react";

const styles = {
  header: {
    borderBottom: "1px solid #DEE1D8",
  },
  inner: {
    maxWidth: 1152,
    margin: "0 auto",
    padding: "16px 24px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  brandText: {
    fontFamily: "'Fraunces', serif",
    fontSize: 20,
    color: "#12161C",
  },
  badge: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: 12,
    padding: "4px 10px",
    borderRadius: 999,
    border: "1px solid #DEE1D8",
    color: "#5B6156",
  },
};

export default function Header() {
  return (
    <header style={styles.header}>
      <div style={styles.inner}>
        <span style={styles.brandText}>Winnow</span>

        <span style={styles.badge}>
          <Lock size={12} /> Nothing uploaded or saved
        </span>
      </div>
    </header>
  );
}
