import { Navigate, useLocation } from 'react-router-dom';
import { normalizeLang } from '@/lib/i18nUtils';

/**
 * Redirects bare paths (without /en or /es prefix) to the locale-prefixed version.
 * Preserves the current i18n language preference.
 */
export default function LocaleRedirect() {
  const location = useLocation();
  const savedLang = normalizeLang(localStorage.getItem('i18nextLng'));
  
  // Preserve the full path after the bare prefix
  const newPath = `/${savedLang}${location.pathname}${location.search}${location.hash}`;
  
  return <Navigate to={newPath} replace />;
}
