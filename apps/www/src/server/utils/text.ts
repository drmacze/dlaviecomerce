export function sanitizeText(input: string): string {
  return input.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, '').trim();
}
export function normalizeWhitespace(input: string): string {
  return sanitizeText(input)
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n');
}
