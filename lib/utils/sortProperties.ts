import type { PropertyRow } from '@/lib/supabase/queries';

export function sortProperties(properties: PropertyRow[]): PropertyRow[] {
  return [...properties].sort((a, b) => {
    // Featured properties first
    if (a.featured && !b.featured) return -1;
    if (!a.featured && b.featured) return 1;
    // Among featured, sort by featured_order ASC (nulls last)
    if (a.featured && b.featured) {
      return (a.featured_order ?? 999) - (b.featured_order ?? 999);
    }
    // Among non-featured, newest first
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}
