/**
 * Removes diacritical marks (accents) from a string.
 * Useful for accent-insensitive search in Portuguese text.
 * Example: "essência" → "essencia"
 */
export function stripDiacritics(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Normalizes a string for search comparison:
 * strips diacritics and converts to lowercase.
 */
export function normalizeSearch(str: string): string {
  return stripDiacritics(str).toLowerCase();
}
