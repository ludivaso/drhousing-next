import { useEffect } from 'react';
import { Outlet, useParams, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { normalizeLang } from '@/lib/i18nUtils';

const SUPPORTED_LANGS = ['en', 'es'];

export default function LocaleLayout() {
  const { lang } = useParams<{ lang: string }>();
  const { i18n } = useTranslation();

  const normalizedLang = normalizeLang(lang);
  const isValid = !!lang && SUPPORTED_LANGS.includes(lang);

  // Sync i18n language with URL
  useEffect(() => {
    if (isValid && i18n.language !== normalizedLang) {
      i18n.changeLanguage(normalizedLang);
    }
  }, [normalizedLang, isValid, i18n]);

  // Set html lang attribute
  useEffect(() => {
    if (isValid) {
      document.documentElement.lang = normalizedLang;
    }
  }, [normalizedLang, isValid]);

  // If the lang param is not valid, redirect to /en
  if (!isValid) {
    return <Navigate to="/en" replace />;
  }

  return <Outlet />;
}
