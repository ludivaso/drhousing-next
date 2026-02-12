/**
 * Share utilities for generating OG-friendly URLs
 * 
 * Since Vite is a client-side SPA, social media crawlers can't read
 * dynamically generated meta tags. We use an edge function that serves
 * proper OG meta tags for crawlers, then redirects to the actual page.
 * 
 * IMPORTANT: When sharing property links on social media/WhatsApp,
 * users MUST use the share URL (not the direct URL) to get proper previews.
 * The share URL serves OG tags to crawlers and redirects browsers to the SPA.
 */

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SITE_URL = import.meta.env.VITE_SUPABASE_URL?.includes('localhost') 
  ? 'http://localhost:5173'
  : 'https://drhousing.net';

/**
 * Get the shareable URL for a property that includes proper OG meta tags.
 * This URL serves crawlers with meta tags, then redirects users to the real page.
 * 
 * Format: /functions/v1/translate?id=UUID
 * - Crawlers (WhatsApp, Facebook, Twitter): See OG meta tags and preview image
 * - Browsers: Immediately redirect to /properties/UUID
 */
export function getPropertyShareUrl(propertyId: string): string {
  return `${SUPABASE_URL}/functions/v1/property-share?id=${propertyId}`;
}

/**
 * Get the direct property URL (for internal navigation only)
 * NOTE: This URL will NOT show OG previews on social media due to SPA limitations.
 */
export function getPropertyDirectUrl(propertyId: string): string {
  return `${SITE_URL}/properties/${propertyId}`;
}

/**
 * Share a property via Web Share API or fallback to clipboard.
 * Always uses the share URL that includes OG meta tags.
 */
export async function shareProperty(property: {
  id: string;
  title: string;
  description?: string;
}): Promise<{ success: boolean; method: 'share' | 'clipboard' | 'failed' }> {
  const shareUrl = getPropertyShareUrl(property.id);
  const shareData = {
    title: property.title,
    text: property.description || `Check out this property: ${property.title}`,
    url: shareUrl,
  };

  // Try native Web Share API first (mobile)
  if (navigator.share && navigator.canShare?.(shareData)) {
    try {
      await navigator.share(shareData);
      return { success: true, method: 'share' };
    } catch (err) {
      // User cancelled or error - fall through to clipboard
      if ((err as Error).name === 'AbortError') {
        return { success: false, method: 'failed' };
      }
    }
  }

  // Fallback to clipboard
  try {
    await navigator.clipboard.writeText(shareUrl);
    return { success: true, method: 'clipboard' };
  } catch {
    return { success: false, method: 'failed' };
  }
}
