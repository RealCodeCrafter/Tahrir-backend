export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/['’ʻ‘`]/g, '')
    .replace(/[^a-z0-9\u0400-\u04FF\u0100-\u017F]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}
