export function normalizeLang(lang: string | undefined | null): 'en' | 'es' {
  const raw = (lang || 'en').toLowerCase();
  const base = raw.split('-')[0];
  return base === 'es' ? 'es' : 'en';
}
