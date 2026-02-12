import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { LocaleLink as Link } from '@/components/LocaleLink';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Property, PROPERTY_STATUS_LABELS, PROPERTY_TIER_LABELS } from '@/types';
import { Bed, Bath, Maximize } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Fix for default marker icons in Leaflet with Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom marker icons by tier
const createCustomIcon = (tier: string) => {
  const colors = {
    mid: '#10B981', // emerald
    high_end: '#3B82F6', // blue
    ultra_luxury: '#8B5CF6', // violet
  };
  
  const color = colors[tier as keyof typeof colors] || colors.mid;
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      ">
        <div style="
          transform: rotate(45deg);
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          $
        </div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Custom cluster icon
const createClusterIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  let size = 'small';
  let dimension = 36;
  
  if (count >= 10) {
    size = 'large';
    dimension = 48;
  } else if (count >= 5) {
    size = 'medium';
    dimension = 42;
  }
  
  return L.divIcon({
    html: `<div class="cluster-marker cluster-${size}"><span>${count}</span></div>`,
    className: 'custom-cluster-icon',
    iconSize: L.point(dimension, dimension),
  });
};

function formatPrice(price: number, currency: string = 'USD') {
  if (price >= 1000000) {
    return `$${(price / 1000000).toFixed(1)}M`;
  }
  if (price >= 1000) {
    return `$${(price / 1000).toFixed(0)}K`;
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

// Component to fit bounds to markers
function FitBounds({ properties }: { properties: Property[] }) {
  const map = useMap();
  const hasFitted = useRef(false);
  
  useEffect(() => {
    if (hasFitted.current) return;
    
    const propertiesWithCoords = properties.filter(p => p.lat && p.lng);
    if (propertiesWithCoords.length === 0) return;
    
    const bounds = L.latLngBounds(
      propertiesWithCoords.map(p => [p.lat!, p.lng!] as [number, number])
    );
    
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    hasFitted.current = true;
  }, [map, properties]);
  
  return null;
}

interface PropertiesMapProps {
  properties: Property[];
  className?: string;
}

export function PropertiesMap({ properties, className }: PropertiesMapProps) {
  // Filter properties that have coordinates
  const propertiesWithCoords = properties.filter(p => p.lat && p.lng);
  
  // Default center (Costa Rica)
  const defaultCenter: [number, number] = [9.7489, -83.7534];
  
  if (propertiesWithCoords.length === 0) {
    return (
      <div className={cn("rounded-xl bg-muted flex items-center justify-center h-full min-h-[400px]", className)}>
        <div className="text-center">
          <p className="text-muted-foreground">No properties with location data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl overflow-hidden border border-border h-full min-h-[500px]", className)}>
      <MapContainer
        center={defaultCenter}
        zoom={8}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds properties={propertiesWithCoords} />
        
        <MarkerClusterGroup
          chunkedLoading
          iconCreateFunction={createClusterIcon}
          maxClusterRadius={60}
          spiderfyOnMaxZoom={true}
          showCoverageOnHover={false}
          zoomToBoundsOnClick={true}
        >
          {propertiesWithCoords.map((property) => (
            <Marker
            key={property.id}
            position={[property.lat!, property.lng!]}
            icon={createCustomIcon(property.tier)}
          >
            <Popup className="property-popup" minWidth={280} maxWidth={320}>
              <div className="p-0">
                {/* Property Image */}
                <div className="relative aspect-[16/10] -mx-5 -mt-3 mb-3 overflow-hidden">
                  {property.images[0] ? (
                    <img
                      src={property.images[0]}
                      alt={property.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                      <span className="font-serif text-2xl text-muted-foreground/30">DR</span>
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex gap-1">
                    <span className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded',
                      property.status === 'for_sale' && 'bg-emerald-500/90 text-white',
                      property.status === 'for_rent' && 'bg-blue-500/90 text-white',
                      property.status === 'both' && 'bg-violet-500/90 text-white'
                    )}>
                      {PROPERTY_STATUS_LABELS[property.status]}
                    </span>
                  </div>
                </div>
                
                {/* Property Info */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-semibold text-foreground text-sm leading-tight line-clamp-2">
                      {property.title}
                    </h3>
                    <span className={cn(
                      'text-[10px] font-medium px-1.5 py-0.5 rounded shrink-0',
                      property.tier === 'mid' && 'bg-tier-mid/20 text-tier-mid',
                      property.tier === 'high_end' && 'bg-tier-high/20 text-tier-high',
                      property.tier === 'ultra_luxury' && 'bg-tier-ultra/20 text-tier-ultra'
                    )}>
                      {PROPERTY_TIER_LABELS[property.tier]}
                    </span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground">{property.locationName}</p>
                  
                  {/* Stats */}
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    {property.bedrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-3.5 h-3.5" />
                        {property.bedrooms}
                      </span>
                    )}
                    {property.bathrooms > 0 && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-3.5 h-3.5" />
                        {property.bathrooms}
                      </span>
                    )}
                    {property.constructionSizeSqm && (
                      <span className="flex items-center gap-1">
                        <Maximize className="w-3.5 h-3.5" />
                        {property.constructionSizeSqm} m²
                      </span>
                    )}
                  </div>
                  
                  {/* Price */}
                  <div className="pt-2 border-t border-border flex items-center justify-between">
                    <div>
                      {property.priceSale && (
                        <span className="font-semibold text-foreground">
                          {formatPrice(property.priceSale, property.currency)}
                        </span>
                      )}
                      {property.priceRentMonthly && (
                        <span className={cn(
                          property.priceSale ? 'text-xs text-muted-foreground ml-1' : 'font-semibold text-foreground'
                        )}>
                          {property.priceSale && '/ '}
                          {formatPrice(property.priceRentMonthly, property.currency)}/mo
                        </span>
                      )}
                    </div>
                    <Button size="sm" variant="default" asChild className="h-7 text-xs">
                      <Link to={`/properties/${property.id}`}>View</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
