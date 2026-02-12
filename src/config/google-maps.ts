// Google Maps configuration
// This is a publishable API key - safe to include in frontend code
// It should be restricted to specific domains in Google Cloud Console

export const GOOGLE_MAPS_CONFIG = {
  // Publishable API key for client-side use
  // Note: Restrict this key to your domains in Google Cloud Console
  apiKey: 'AIzaSyDpcelzUFNG1b8xYTVTNaSLb9icXVOn5do',
  
  // Default settings for Costa Rica
  defaultCenter: {
    lat: 9.7489,
    lng: -83.7534,
  },
  defaultZoom: 7,
  country: 'cr', // Costa Rica country code for Places API restrictions
};

// Check if Google Maps is properly configured
export const isGoogleMapsConfigured = Boolean(GOOGLE_MAPS_CONFIG.apiKey);
