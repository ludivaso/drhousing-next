/**
 * Centralized contact numbers for DR Housing
 * Single source of truth for all phone-based integrations
 */

/** Office main line — used for tel: links and general inquiries */
export const CENTRAL_PHONE = '50686540888'

/** Diego's direct line — used for agent card and broker contact only */
export const BROKER_PHONE = '50660775000'

/**
 * WhatsApp lead destination
 * Currently points to CENTRAL_PHONE
 * When 8777-2000 WhatsApp API becomes available and monitored,
 * change this to '50687772000' in ONE place (here)
 */
export const WHATSAPP_LEADS = CENTRAL_PHONE

/** Format phone for URL (remove non-digits) */
export const formatPhoneForUrl = (phone: string) => phone.replace(/\D/g, '')
