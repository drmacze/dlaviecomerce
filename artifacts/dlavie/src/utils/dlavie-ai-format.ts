export function formatIdr(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("id-ID", { notation: "compact" }).format(
    Number(value || 0),
  );
}

export function estimateTokens(text: string) {
  const normalized = String(text || "").trim();
  if (!normalized) return 0;
  return Math.max(1, Math.ceil(normalized.length / 4));
}

export function createChatTitle(prompt: string) {
  const clean = String(prompt || "")
    .replace(/\s+/g, " ")
    .replace(/[\u0000-\u001f<>]/g, "")
    .trim();
  if (!clean) return "Percakapan Baru";
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean;
}

export function formatStickyDate(value: string | number | Date) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function safePrompt(input: string) {
  return String(input || "")
    .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, "")
    .slice(0, 12_000)
    .trim();
}
