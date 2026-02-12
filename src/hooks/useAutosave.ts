import { useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

const AUTOSAVE_KEY = 'property_form_draft';
const AUTOSAVE_INTERVAL = 30000; // 30 seconds

interface AutosaveOptions {
  propertyId?: string;
  enabled?: boolean;
}

export function useAutosave<T extends Record<string, any>>(
  data: T,
  options: AutosaveOptions = {}
) {
  const { propertyId, enabled = true } = options;
  const { toast } = useToast();
  const lastSavedRef = useRef<string>('');
  const toastShownRef = useRef(false);

  const storageKey = propertyId 
    ? `${AUTOSAVE_KEY}_${propertyId}` 
    : `${AUTOSAVE_KEY}_new`;

  // Save to localStorage
  const saveDraft = useCallback(() => {
    if (!enabled) return;
    
    const dataString = JSON.stringify(data);
    
    // Only save if data has changed
    if (dataString === lastSavedRef.current) return;
    
    try {
      const draft = {
        data,
        savedAt: new Date().toISOString(),
        propertyId,
      };
      localStorage.setItem(storageKey, JSON.stringify(draft));
      lastSavedRef.current = dataString;
      
      // Show toast only once per session
      if (!toastShownRef.current) {
        toast({
          title: 'Draft saved',
          description: 'Your changes are being saved automatically.',
        });
        toastShownRef.current = true;
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
    }
  }, [data, enabled, propertyId, storageKey, toast]);

  // Auto-save on interval
  useEffect(() => {
    if (!enabled) return;
    
    const interval = setInterval(saveDraft, AUTOSAVE_INTERVAL);
    return () => clearInterval(interval);
  }, [enabled, saveDraft]);

  // Save when window loses focus or before unload
  useEffect(() => {
    if (!enabled) return;

    const handleBeforeUnload = () => saveDraft();
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveDraft();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [enabled, saveDraft]);

  // Load saved draft
  const loadDraft = useCallback((): T | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      
      const draft = JSON.parse(saved);
      return draft.data as T;
    } catch {
      return null;
    }
  }, [storageKey]);

  // Get saved timestamp
  const getDraftTimestamp = useCallback((): Date | null => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (!saved) return null;
      
      const draft = JSON.parse(saved);
      return new Date(draft.savedAt);
    } catch {
      return null;
    }
  }, [storageKey]);

  // Clear saved draft
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(storageKey);
      lastSavedRef.current = '';
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  }, [storageKey]);

  // Check if a draft exists
  const hasDraft = useCallback((): boolean => {
    return localStorage.getItem(storageKey) !== null;
  }, [storageKey]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    getDraftTimestamp,
  };
}
