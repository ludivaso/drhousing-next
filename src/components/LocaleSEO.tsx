import { useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const PUBLISHED_ORIGIN = 'https://drhousing.net';

interface LocaleSEOProps {
  titleKey: string;
  descriptionKey: string;
  /** Optional fallback if translation key is missing */
  titleFallback?: string;
  descriptionFallback?: string;
}

/**
 * Sets document <title>, meta description, and injects hreflang + canonical
 * link tags based on the current locale prefix.
 */
export function LocaleSEO({
  titleKey,
  descriptionKey,
  titleFallback,
  descriptionFallback,
}: LocaleSEOProps) {
  const { lang } = useParams<{ lang: string }>();
  const { t } = useTranslation();
  const location = useLocation();

  const currentLang = lang || 'en';
  const alternateLang = currentLang === 'es' ? 'en' : 'es';

  // Build the path without the lang prefix
  const pathWithoutLang = location.pathname.replace(/^\/(en|es)/, '') || '/';

  const title = t(titleKey, titleFallback || '');
  const description = t(descriptionKey, descriptionFallback || '');

  useEffect(() => {
    // Set document title
    document.title = title ? `${title} | DR Housing` : 'DR Housing | Costa Rica Real Estate';

    // Meta description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);

    // OG tags
    const setMeta = (property: string, content: string) => {
      let el = document.querySelector(`meta[property="${property}"]`);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute('property', property);
        document.head.appendChild(el);
      }
      el.setAttribute('content', content);
    };
    setMeta('og:title', title);
    setMeta('og:description', description);

    // Canonical
    const canonicalUrl = `${PUBLISHED_ORIGIN}/${currentLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    let canonical = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    // Hreflang tags
    const hreflangIds = ['hreflang-current', 'hreflang-alternate', 'hreflang-xdefault'];
    hreflangIds.forEach((id) => {
      const existing = document.getElementById(id);
      if (existing) existing.remove();
    });

    const currentUrl = `${PUBLISHED_ORIGIN}/${currentLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;
    const alternateUrl = `${PUBLISHED_ORIGIN}/${alternateLang}${pathWithoutLang === '/' ? '' : pathWithoutLang}`;

    const createHreflang = (id: string, hreflang: string, href: string) => {
      const link = document.createElement('link');
      link.id = id;
      link.rel = 'alternate';
      link.hreflang = hreflang;
      link.href = href;
      document.head.appendChild(link);
    };

    createHreflang('hreflang-current', currentLang, currentUrl);
    createHreflang('hreflang-alternate', alternateLang, alternateUrl);
    createHreflang('hreflang-xdefault', 'x-default', `${PUBLISHED_ORIGIN}/en${pathWithoutLang === '/' ? '' : pathWithoutLang}`);

    return () => {
      hreflangIds.forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.remove();
      });
    };
  }, [title, description, currentLang, alternateLang, pathWithoutLang]);

  return null;
}
