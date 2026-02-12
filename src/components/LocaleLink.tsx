import { forwardRef } from 'react';
import { Link, LinkProps, useParams } from 'react-router-dom';
import { normalizeLang } from '@/lib/i18nUtils';

/**
 * A locale-aware Link component. Automatically prefixes the `to` path
 * with the current locale (/en or /es) for public routes.
 * Admin routes (/admin/*) are left untouched.
 */
export const LocaleLink = forwardRef<HTMLAnchorElement, LinkProps>(
  ({ to, ...props }, ref) => {
    const { lang } = useParams<{ lang: string }>();
    const currentLang = normalizeLang(lang);

    let resolvedTo = to;

    if (typeof to === 'string') {
      // Don't prefix admin paths, external links, anchors, or already-prefixed paths
      if (
        !to.startsWith('/admin') &&
        !to.startsWith('http') &&
        !to.startsWith('#') &&
        !/^\/(en|es)(\/|$)/.test(to)
      ) {
        const clean = to.startsWith('/') ? to : `/${to}`;
        resolvedTo = `/${currentLang}${clean}`;
      }
    }

    return <Link ref={ref} to={resolvedTo} {...props} />;
  }
);

LocaleLink.displayName = 'LocaleLink';
