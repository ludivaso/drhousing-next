import { useParams } from 'react-router-dom';
import { normalizeLang } from '@/lib/i18nUtils';

/**
 * Returns a function that prefixes any path with the current locale.
 * Usage: const lp = useLocalePath(); <Link to={lp('/properties')}>
 */
export function useLocalePath() {
  const { lang } = useParams<{ lang: string }>();
  const currentLang = normalizeLang(lang);

  return (path: string) => {
    // Don't prefix admin paths — they don't use locale routing
    if (path.startsWith('/admin')) return path;
    // Don't prefix paths that already have a lang prefix
    if (/^\/(en|es)(\/|$)/.test(path)) return path;
    // Strip leading slash for joining
    const clean = path.startsWith('/') ? path : `/${path}`;
    return `/${currentLang}${clean}`;
  };
}

/**
 * Returns the current locale from the URL.
 */
export function useCurrentLocale(): 'en' | 'es' {
  const { lang } = useParams<{ lang: string }>();
  return normalizeLang(lang);
}
