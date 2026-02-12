import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { hashString } from '@/lib/hash';
import { normalizeLang } from '@/lib/i18nUtils';

type AutoTranslateOptions = {
  enabled?: boolean;
  sourceHint?: 'en' | 'es' | 'unknown';
};

function looksSpanish(text: string): boolean {
  // Lightweight heuristic; we still rely on the model to translate correctly.
  return /[ñáéíóúü¡¿]/i.test(text) || /\b(el|la|los|las|un|una|para|con|sin|propiedad|casa|apartamento|terreno)\b/i.test(text);
}

export function useAutoTranslateText(text: string, options: AutoTranslateOptions = {}) {
  const { i18n } = useTranslation();
  const targetLang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const enabled = options.enabled ?? true;

  const cacheKey = useMemo(() => {
    const fingerprint = hashString(`${targetLang}:${text}`);
    return `drh:tr:${fingerprint}`;
  }, [targetLang, text]);

  const [translated, setTranslated] = useState<string>(text);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!enabled) {
        setTranslated(text);
        return;
      }

      const trimmed = (text || '').trim();
      if (!trimmed) {
        setTranslated(text);
        return;
      }

      // If content is already in the target language, avoid unnecessary calls.
      const inferredSource = options.sourceHint === 'unknown' || !options.sourceHint
        ? (looksSpanish(trimmed) ? 'es' : 'en')
        : options.sourceHint;

      if (inferredSource === targetLang) {
        setTranslated(text);
        return;
      }

      // Local cache (fast + avoids repeated AI calls).
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTranslated(cached);
        return;
      }

      setIsTranslating(true);
      try {
        const { data, error } = await supabase.functions.invoke('translate', {
          body: {
            text: trimmed,
            targetLang,
          },
        });

        if (error) throw error;

        const out = (data?.translatedText as string | undefined)?.trim();
        if (!out) {
          setTranslated(text);
          return;
        }

        if (!cancelled) {
          setTranslated(out);
          localStorage.setItem(cacheKey, out);
        }
      } catch {
        // Fail closed: show original to avoid broken UI.
        if (!cancelled) setTranslated(text);
      } finally {
        if (!cancelled) setIsTranslating(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [cacheKey, enabled, options.sourceHint, targetLang, text]);

  return { text: translated, isTranslating };
}
