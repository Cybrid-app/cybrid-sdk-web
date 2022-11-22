export function getLanguageFromLocale(locale: string): string {
  return locale.slice(0, 2);
}
