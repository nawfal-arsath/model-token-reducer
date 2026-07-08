import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Sparkles, Info } from "lucide-react";
import { MODELS, estimateTokens } from "../lib/tokenEstimate";
import { ModelRow } from "./StatCards";

const styles = {
  card: {
    borderRadius: 12,
    border: "1px solid #DEE1D8",
    padding: 20,
    marginBottom: 32,
    background: "#FFFFFF",
  },
  headRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
  },
  heading: {
    fontSize: 14,
    fontWeight: 600,
    color: "#12161C",
  },
  divider: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: "1px solid #EDEFE7",
  },
  note: {
    fontSize: 12,
    marginTop: 16,
    display: "flex",
    alignItems: "flex-start",
    gap: 6,
    color: "#8B9186",
  },
  noteIcon: {
    marginTop: 2,
    flexShrink: 0,
  },
};

export default function ModelChart({ rawText, cleanTextOut }) {
  const chartData = MODELS.map((m) => ({
    name: m.name.replace("Claude ", ""),
    Before: estimateTokens(rawText, m.charsPerToken),
    After: estimateTokens(cleanTextOut, m.charsPerToken),
    color: m.color,
  }));

  return (
    <div style={styles.card}>
      <div style={styles.headRow}>
        <Sparkles size={16} color="#0F6E6A" />
        <h3 style={styles.heading}>Estimated tokens by model</h3>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} barGap={4}>
          <CartesianGrid strokeDasharray="3 3" stroke="#EDEFE7" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#5B6156" }} axisLine={{ stroke: "#DEE1D8" }} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: "#5B6156" }} axisLine={false} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #DEE1D8" }} />
          <Bar dataKey="Before" fill="#DADDD1" radius={[4, 4, 0, 0]} />
          <Bar dataKey="After" radius={[4, 4, 0, 0]}>
            {chartData.map((d, i) => (
              <Cell key={i} fill={d.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div style={styles.divider}>
        {MODELS.map((m) => (
          <ModelRow
            key={m.id}
            model={m}
            before={estimateTokens(rawText, m.charsPerToken)}
            after={estimateTokens(cleanTextOut, m.charsPerToken)}
          />
        ))}
      </div>

      <p style={styles.note}>
        <Info size={13} style={styles.noteIcon} />
        Token counts are estimated from character length using each model family's approximate
        tokenizer ratio — not an exact count from the provider's API. Useful for comparing
        before/after, not for billing.
      </p>
    </div>
  );
}
