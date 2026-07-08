// Character-ratio approximation of token counts. Not exact — each vendor's
// real tokenizer differs — but stable enough to compare before/after.
export const MODELS = [
  { id: "haiku", name: "Claude Haiku 4.5", family: "Anthropic", charsPerToken: 3.9, color: "#0F6E6A" },
  { id: "sonnet", name: "Claude Sonnet 5", family: "Anthropic", charsPerToken: 3.9, color: "#14807C" },
  { id: "opus", name: "Claude Opus 4.8", family: "Anthropic", charsPerToken: 3.9, color: "#1A9994" },
  { id: "gpt4o", name: "GPT-4o", family: "OpenAI", charsPerToken: 4.1, color: "#B8702B" },
  { id: "gemini", name: "Gemini 2.0 Flash", family: "Google", charsPerToken: 4.3, color: "#C98B4A" },
];

export function estimateTokens(text, charsPerToken) {
  if (!text) return 0;
  return Math.max(1, Math.round(text.length / charsPerToken));
}
