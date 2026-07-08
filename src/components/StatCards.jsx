import React from "react";

const styles = {
  card: {
    borderRadius: 12,
    padding: 16,
    border: "1px solid #DEE1D8",
    background: "#FFFFFF",
  },
  label: {
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "#8B9186",
  },
  value: {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 24,
    marginTop: 4,
  },
  sub: {
    fontSize: 12,
    marginTop: 4,
    color: "#8B9186",
  },
  rowWrap: {
    marginBottom: 16,
  },
  rowHead: {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  rowName: {
    fontSize: 14,
    fontWeight: 500,
    color: "#12161C",
  },
  rowStat: {
    fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
    fontSize: 12,
  },
  rowStatMuted: {
    color: "#A7ABA0",
  },
  rowPct: {
    marginLeft: 8,
    fontWeight: 600,
  },
  track: {
    position: "relative",
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
    background: "#E7E9E1",
  },
  bar: (widthPct, color) => ({
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    borderRadius: 999,
    width: `${widthPct}%`,
    background: color,
  }),
};

export function StatCard({ label, value, sub, accent }) {
  return (
    <div style={styles.card}>
      <div style={styles.label}>{label}</div>
      <div style={{ ...styles.value, color: accent || "#12161C" }}>{value}</div>
      {sub && <div style={styles.sub}>{sub}</div>}
    </div>
  );
}

export function ModelRow({ model, before, after }) {
  const pct = before > 0 ? Math.round((1 - after / before) * 100) : 0;
  const maxVal = before || 1;
  return (
    <div style={styles.rowWrap}>
      <div style={styles.rowHead}>
        <span style={styles.rowName}>{model.name}</span>
        <span style={{ ...styles.rowStat, color: model.color }}>
          {after.toLocaleString()} <span style={styles.rowStatMuted}>/ {before.toLocaleString()} tok</span>
          <span style={{ ...styles.rowPct, color: model.color }}>&minus;{pct}%</span>
        </span>
      </div>
      <div style={styles.track}>
        <div className="fill-anim" style={styles.bar((before / maxVal) * 100, "#DADDD1")} />
        <div className="fill-anim" style={styles.bar((after / maxVal) * 100, model.color)} />
      </div>
    </div>
  );
}
