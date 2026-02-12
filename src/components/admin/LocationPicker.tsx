import { useState, useEffect, useRef, useCallback, Component, ReactNode, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { GOOGLE_MAPS_CONFIG, isGoogleMapsConfigured } from '@/config/google-maps';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icon issue - run once
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  });
}

interface LocationPickerProps {
  lat: string;
  lng: string;
  onLocationChange: (lat: string, lng: string) => void;
}

// Error boundary to catch Leaflet DOM errors
class MapErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    // Suppress Leaflet DOM errors during unmount
    if (error.message.includes('removeChild')) {
      console.warn('Leaflet map cleanup error (suppressed):', error.message);
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Component to handle map clicks
function MapClickHandler({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// Component to update map view when coordinates change
function MapUpdater({ lat, lng, hasValidLocation }: { lat: number; lng: number; hasValidLocation: boolean }) {
  const map = useMap();
  
  useEffect(() => {
    if (hasValidLocation && lat && lng && !isNaN(lat) && !isNaN(lng)) {
      map.setView([lat, lng], 16);
    }
  }, [lat, lng, hasValidLocation, map]);
  
  return null;
}

// Google Places Autocomplete types
declare global {
  interface Window {
    google: any;
    initGooglePlaces?: () => void;
  }
}

interface PlacePrediction {
  description: string;
  place_id: string;
  structured_formatting?: {
    main_text: string;
    secondary_text: string;
  };
}

export default function LocationPicker({ lat, lng, onLocationChange }: LocationPickerProps) {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [googleLoaded, setGoogleLoaded] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  
  const autocompleteServiceRef = useRef<any>(null);
  const placesServiceRef = useRef<any>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  // Use config for default center
  const defaultCenter = useMemo<[number, number]>(() => [
    GOOGLE_MAPS_CONFIG.defaultCenter.lat,
    GOOGLE_MAPS_CONFIG.defaultCenter.lng
  ], []);
  const currentLat = parseFloat(lat) || defaultCenter[0];
  const currentLng = parseFloat(lng) || defaultCenter[1];
  const hasValidLocation = Boolean(lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng)));

  const googleMapsApiKey = GOOGLE_MAPS_CONFIG.apiKey;

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Delay map mounting to avoid conflicts with React's initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isMountedRef.current) {
        setMapReady(true);
      }
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Load Google Places API
  useEffect(() => {
    if (!googleMapsApiKey) {
      console.warn('Google Maps API key not configured');
      return;
    }

    if (window.google?.maps?.places) {
      setGoogleLoaded(true);
      return;
    }

    // Check if script is already loading
    const existingScript = document.querySelector('script[src*="maps.googleapis.com"]');
    if (existingScript) {
      existingScript.addEventListener('load', () => setGoogleLoaded(true));
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => setGoogleLoaded(true);
    script.onerror = () => {
      console.error('Failed to load Google Maps API');
      toast({
        title: 'Google Maps unavailable',
        description: 'Using manual coordinate entry instead.',
        variant: 'destructive',
      });
    };
    document.head.appendChild(script);
  }, [googleMapsApiKey, toast]);

  // Initialize services when Google is loaded
  useEffect(() => {
    if (googleLoaded && window.google?.maps?.places) {
      autocompleteServiceRef.current = new window.google.maps.places.AutocompleteService();
      
      // Create a dummy div for PlacesService (it needs an element)
      const div = document.createElement('div');
      placesServiceRef.current = new window.google.maps.places.PlacesService(div);
    }
  }, [googleLoaded]);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Search for places
  const searchPlaces = useCallback(async (query: string) => {
    if (!query.trim() || !autocompleteServiceRef.current) {
      setPredictions([]);
      return;
    }

    setIsSearching(true);
    
    try {
      const request = {
        input: query,
        componentRestrictions: { country: 'cr' }, // Costa Rica
        types: ['establishment', 'geocode'],
      };

      autocompleteServiceRef.current.getPlacePredictions(
        request,
        (results: PlacePrediction[] | null, status: string) => {
          setIsSearching(false);
          if (status === 'OK' && results) {
            setPredictions(results);
            setShowDropdown(true);
          } else {
            setPredictions([]);
          }
        }
      );
    } catch (error) {
      console.error('Places search error:', error);
      setIsSearching(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.length >= 3) {
        searchPlaces(searchQuery);
      } else {
        setPredictions([]);
        setShowDropdown(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchPlaces]);

  // Select a place and get its coordinates
  const selectPlace = useCallback((prediction: PlacePrediction) => {
    if (!placesServiceRef.current) return;

    placesServiceRef.current.getDetails(
      { placeId: prediction.place_id, fields: ['geometry', 'name'] },
      (place: any, status: string) => {
        if (status === 'OK' && place?.geometry?.location) {
          const newLat = place.geometry.location.lat();
          const newLng = place.geometry.location.lng();
          
          onLocationChange(newLat.toFixed(6), newLng.toFixed(6));
          setSearchQuery(prediction.description);
          setShowDropdown(false);
          setPredictions([]);
          
          toast({
            title: 'Location set',
            description: `${prediction.structured_formatting?.main_text || prediction.description}`,
          });
        } else {
          toast({
            title: 'Could not get location',
            description: 'Please try selecting another place or click on the map.',
            variant: 'destructive',
          });
        }
      }
    );
  }, [onLocationChange, toast]);

  const handleMapClick = useCallback((newLat: number, newLng: number) => {
    onLocationChange(newLat.toFixed(6), newLng.toFixed(6));
    toast({
      title: 'Location updated',
      description: `Coordinates: ${newLat.toFixed(6)}, ${newLng.toFixed(6)}`,
    });
  }, [onLocationChange, toast]);

  return (
    <div className="space-y-4">
      {/* Google Places Search - Always show, with fallback message if not configured */}
      <div className="space-y-2" ref={searchContainerRef}>
        <label className="text-sm font-medium flex items-center gap-2">
          <Search className="w-4 h-4" />
          Search Location (Google Places)
        </label>
        {isGoogleMapsConfigured ? (
          <>
            <div className="relative">
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Type condo name, address, or landmark..."
                className="pr-10"
                disabled={!googleLoaded}
              />
              {isSearching && (
                <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-muted-foreground" />
              )}
              
              {/* Predictions dropdown */}
              {showDropdown && predictions.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-background border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
                  {predictions.map((prediction) => (
                    <button
                      key={prediction.place_id}
                      type="button"
                      className="w-full px-4 py-3 text-left hover:bg-muted transition-colors border-b border-border last:border-b-0"
                      onClick={() => selectPlace(prediction)}
                    >
                      <p className="font-medium text-sm">
                        {prediction.structured_formatting?.main_text || prediction.description}
                      </p>
                      {prediction.structured_formatting?.secondary_text && (
                        <p className="text-xs text-muted-foreground">
                          {prediction.structured_formatting.secondary_text}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {googleLoaded 
                ? 'Search for the condominium, building, or address. Results are filtered to Costa Rica.'
                : 'Loading Google Places...'}
            </p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground bg-muted p-2 rounded border">
            Google Places search is not configured. Add VITE_GOOGLE_MAPS_API_KEY to your .env file to enable location search. You can still click on the map or enter coordinates manually below.
          </p>
        )}
      </div>

      {/* Manual Coordinate inputs - always available as fallback */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium mb-1 block">Latitude</label>
          <Input
            type="number"
            step="any"
            value={lat}
            onChange={(e) => onLocationChange(e.target.value, lng)}
            placeholder="9.9277"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Longitude</label>
          <Input
            type="number"
            step="any"
            value={lng}
            onChange={(e) => onLocationChange(lat, e.target.value)}
            placeholder="-84.1384"
          />
        </div>
      </div>

      {/* Interactive Map */}
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          {hasValidLocation ? 'Fine-tune by clicking on the map' : 'Click on the map to set location'}
        </label>
        <div ref={mapContainerRef} className="h-[400px] rounded-lg overflow-hidden border border-border bg-muted">
          {mapReady && (
            <MapErrorBoundary 
              fallback={
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  Map unavailable. Use manual coordinates above.
                </div>
              }
            >
              <MapContainer
                key={mapKey}
                center={defaultCenter}
                zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
                className="h-full w-full"
                scrollWheelZoom={true}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapClickHandler onLocationSelect={handleMapClick} />
                <MapUpdater lat={currentLat} lng={currentLng} hasValidLocation={hasValidLocation} />
                {hasValidLocation && <Marker position={[currentLat, currentLng]} />}
              </MapContainer>
            </MapErrorBoundary>
          )}
        </div>
        
        {/* Show current coordinates */}
        {hasValidLocation && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span>Lat: {currentLat.toFixed(6)}</span>
            <span>Lng: {currentLng.toFixed(6)}</span>
            <Button 
              type="button" 
              variant="ghost" 
              size="sm"
              className="h-auto py-1 px-2 text-xs"
              onClick={() => {
                onLocationChange('', '');
                setSearchQuery('');
              }}
            >
              Clear location
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
