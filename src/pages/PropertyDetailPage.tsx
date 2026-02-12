import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Bed, Bath, Car, Maximize, TreePine, MapPin, Calendar, Heart, Phone, Expand, Loader2, Check, Share2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { AgentCard } from '@/components/ui/AgentCard';
import { Button } from '@/components/ui/button';
import { ImageLightbox } from '@/components/ui/ImageLightbox';
import { AmenityIcon, hasAmenityIcon } from '@/components/properties/AmenityIcon';
import { PropertyDescription } from '@/components/properties/PropertyDescription';
import { YouTubeVideoThumbnail } from '@/components/properties/YouTubeVideoThumbnail';
import { useProperty, usePublicProperties } from '@/hooks/useProperties';
import { useAgents } from '@/hooks/useAgents';
import { cn } from '@/lib/utils';
import { getStatusLabel, getTierLabel, getTypeLabel } from '@/lib/propertyLabels';
import { normalizeLang } from '@/lib/i18nUtils';
import { useAutoTranslateText } from '@/hooks/useAutoTranslateText';
import { shareProperty } from '@/lib/shareUtils';
import { toast } from 'sonner';

function formatPrice(price: number, currency: string = 'USD', locale: string = 'en-US') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

// Check if id looks like a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export default function PropertyDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const numberLocale = lang === 'es' ? 'es-ES' : 'en-US';
  const { data: property, isLoading } = useProperty(id);
  const { data: allProperties = [] } = usePublicProperties();
  const { data: agents = [] } = useAgents();
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [shareSuccess, setShareSuccess] = useState(false);

  // Use bilingual DB fields; fall back to runtime translation if _es not yet populated
  const { text: runtimeTitle } = useAutoTranslateText(property?.title ?? '', { enabled: !!property && lang === 'es' && !property?.titleEs });
  const { text: runtimeDescription } = useAutoTranslateText(property?.description ?? '', { enabled: !!property && lang === 'es' && !property?.descriptionEs });

  // Resolve the correct language version
  const translatedTitle = lang === 'es'
    ? (property?.titleEs || runtimeTitle || property?.title || '')
    : (property?.titleEn || property?.title || '');
  const translatedDescription = lang === 'es'
    ? (property?.descriptionEs || runtimeDescription || property?.description || '')
    : (property?.descriptionEn || property?.description || '');
  
  // Resolve features and amenities by language
  const displayFeatures = lang === 'es' && property?.featuresEs?.length
    ? property.featuresEs
    : (property?.featuresEn?.length ? property.featuresEn : property?.features || []);
  const displayAmenities = lang === 'es' && property?.amenitiesEs?.length
    ? property.amenitiesEs
    : (property?.amenitiesEn?.length ? property.amenitiesEn : property?.amenities || []);

  // Build display images: use featuredImages first, then fill gaps with gallery images
  const displayImages = useMemo(() => {
    if (!property) return [];
    const featured = property.featuredImages || [];
    const gallery = property.images || [];
    const result: string[] = [];
    
    // Fill 5 slots with featured images, then gallery images for gaps
    for (let i = 0; i < 5; i++) {
      if (featured[i]) {
        result.push(featured[i]);
      } else {
        // Find next available gallery image not already in result
        const availableGallery = gallery.find(img => !result.includes(img) && !featured.includes(img));
        if (availableGallery) {
          result.push(availableGallery);
        }
      }
    }
    
    return result.filter(Boolean);
  }, [property]);

  // All images for lightbox (featured + gallery, no duplicates)
  const allLightboxImages = useMemo(() => {
    if (!property) return [];
    const featured = property.featuredImages || [];
    const gallery = property.images || [];
    const combined = [...featured.filter(Boolean), ...gallery.filter(img => !featured.includes(img))];
    return combined;
  }, [property]);

  // Redirect legacy IDs to proper UUID URLs for clean URLs
  useEffect(() => {
    if (!isLoading && property && id && !isValidUUID(id)) {
      navigate(`/${lang}/properties/${property.id}`, { replace: true });
    }
  }, [property, id, isLoading, navigate]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleShare = async () => {
    if (!property) return;
    
    const result = await shareProperty({
      id: property.id,
      title: translatedTitle || property.title,
      description: translatedDescription || property.description,
    });
    
    if (result.success) {
      if (result.method === 'clipboard') {
        setShareSuccess(true);
        toast.success(t('propertyDetail.linkCopied', 'Link copied to clipboard!'));
        setTimeout(() => setShareSuccess(false), 2000);
      }
    } else {
      toast.error(t('propertyDetail.shareFailed', 'Failed to share'));
    }
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide section-padding flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout>
        <div className="container-wide section-padding text-center">
          <h1 className="font-serif text-3xl font-semibold mb-4">{t('propertyDetail.notFound')}</h1>
          <p className="text-muted-foreground mb-6">{t('propertyDetail.notFoundDesc')}</p>
          <Button asChild>
            <Link to="/properties">{t('propertyDetail.browseAll')}</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const listingAgent = agents.find(a => a.id === property.listingAgentId);
  const relatedProperties = allProperties
    .filter(p => p.id !== property.id && (p.locationName === property.locationName || p.tier === property.tier))
    .slice(0, 4);

  const statusBadgeClass = {
    for_sale: 'badge-sale',
    for_rent: 'badge-rent',
    both: 'badge-both',
  }[property.status];

  const tierBadgeClass = {
    mid: 'bg-tier-mid/20 text-tier-mid',
    high_end: 'bg-tier-high/20 text-tier-high',
    ultra_luxury: 'bg-tier-ultra/20 text-tier-ultra',
  }[property.tier];

  return (
    <Layout>
      {/* Back navigation */}
      <div className="bg-card border-b border-border">
        <div className="container-wide py-4">
          <Link to="/properties" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t('propertyDetail.backToProperties')}
          </Link>
        </div>
      </div>

      {/* Hero Gallery */}
      <section className="bg-muted">
        <div className="container-wide py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative">
            {/* View All Photos Button */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => openLightbox(0)}
              className="absolute bottom-10 right-6 z-10 gap-2 shadow-lg"
            >
              <Expand className="w-4 h-4" />
              {t('propertyDetail.viewAllPhotos')} ({allLightboxImages.length})
            </Button>
            <button
              onClick={() => openLightbox(0)}
              className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative group cursor-pointer"
            >
              {displayImages[0] ? (
                <>
                  <img src={displayImages[0]} alt={property.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <Expand className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </>
              ) : (
                <span className="font-serif text-6xl text-muted-foreground/30">DR</span>
              )}
            </button>
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((index) => (
                <button
                  key={index}
                  onClick={() => displayImages[index] && openLightbox(index)}
                  disabled={!displayImages[index]}
                  className="aspect-[4/3] rounded-xl overflow-hidden bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center relative group cursor-pointer disabled:cursor-default disabled:opacity-0"
                >
                  {displayImages[index] ? (
                    <>
                      <img src={displayImages[index]} alt={`${property.title} ${index + 1}`} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                        <Expand className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                    </>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          {/* YouTube Video Thumbnail */}
          {property.youtubeEnabled && property.youtubeUrl && (
            <div className="mt-6">
              <YouTubeVideoThumbnail
                youtubeUrl={property.youtubeUrl}
                label={property.youtubeLabel || 'Video Tour'}
                locationOverlay={{
                  buildingName: property.buildingName,
                  locationName: property.locationName,
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Image Lightbox */}
      <ImageLightbox
        images={allLightboxImages}
        initialIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={property.title}
      />

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Title & Badges */}
              <div className="flex flex-wrap items-start gap-3 mb-4">
                <span className={statusBadgeClass}>{getStatusLabel(t, property.status)}</span>
                <span className={cn('text-xs font-medium px-2 py-0.5 rounded', tierBadgeClass)}>
                  {getTierLabel(t, property.tier)}
                </span>
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-muted text-muted-foreground">
                  {getTypeLabel(t, property.propertyType)}
                </span>
              </div>

              <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
                {translatedTitle}
              </h1>
              
              <div className="flex items-center gap-2 text-muted-foreground mb-6">
                <MapPin className="w-4 h-4" />
                <span>{property.locationName}</span>
              </div>

              {/* At a Glance */}
              <div className="flex flex-wrap gap-6 p-6 bg-secondary rounded-xl mb-8">
                {property.bedrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bed className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{property.bedrooms}</span>
                      <span className="text-sm text-muted-foreground ml-1">{t('propertyDetail.beds')}</span>
                    </div>
                  </div>
                )}
                {property.bathrooms > 0 && (
                  <div className="flex items-center gap-2">
                    <Bath className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{property.bathrooms}</span>
                      <span className="text-sm text-muted-foreground ml-1">{t('propertyDetail.baths')}</span>
                    </div>
                  </div>
                )}
                {property.garageSpaces > 0 && (
                  <div className="flex items-center gap-2">
                    <Car className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{property.garageSpaces}</span>
                      <span className="text-sm text-muted-foreground ml-1">{t('propertyDetail.garage')}</span>
                    </div>
                  </div>
                )}
                {property.constructionSizeSqm && (
                  <div className="flex items-center gap-2">
                    <Maximize className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{property.constructionSizeSqm}</span>
                      <span className="text-sm text-muted-foreground ml-1">{t('propertyDetail.sqmBuilt')}</span>
                    </div>
                  </div>
                )}
                {property.landSizeSqm && (
                  <div className="flex items-center gap-2">
                    <TreePine className="w-5 h-5 text-primary" />
                    <div>
                      <span className="font-semibold text-foreground">{property.landSizeSqm}</span>
                      <span className="text-sm text-muted-foreground ml-1">{t('propertyDetail.sqmLand')}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">{t('propertyDetail.overview')}</h2>
                <PropertyDescription content={translatedDescription || ''} />
              </div>

              {/* Features */}
              {displayFeatures.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">{t('propertyDetail.features')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {displayFeatures.map((feature, idx) => (
                      <div 
                        key={`${feature}-${idx}`} 
                        className="flex items-center gap-3 p-3 bg-secondary/50 rounded-lg border border-border/50"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <AmenityIcon amenityKey={property.features[idx] || feature} className="text-primary" size={18} />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {t(`features.${feature}`, feature)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Amenities */}
              {displayAmenities.length > 0 && (
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">{t('propertyDetail.amenities')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {displayAmenities.map((amenity, idx) => (
                      <div 
                        key={`${amenity}-${idx}`} 
                        className="flex items-center gap-3 p-3 bg-primary/5 rounded-lg border border-primary/10"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <AmenityIcon amenityKey={property.amenities[idx] || amenity} className="text-primary" size={18} />
                        </div>
                        <span className="text-sm font-medium text-foreground">
                          {t(`amenities.${amenity}`, amenity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Interactive Map */}
              <div className="mb-8">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">{t('propertyDetail.location')}</h2>
                <div className="aspect-video rounded-xl overflow-hidden border border-border">
                  {property.lat && property.lng ? (
                    <iframe
                      title={`Map of ${property.title}`}
                      src={`https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3000!2d${property.lng}!3d${property.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM!5e0!3m2!1sen!2sus!4v1709712000000!5m2!1sen!2sus`}
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center">
                      <div className="text-center">
                        <MapPin className="w-10 h-10 text-muted-foreground/50 mx-auto mb-2" />
                        <p className="text-muted-foreground">{property.locationName}</p>
                      </div>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  {property.locationName}
                </p>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-[140px] space-y-6">
                {/* Price Card */}
                <div className="card-elevated p-6">
                  <div className="mb-4">
                    {property.priceSale && (
                      <div>
                        {/* Original price with strikethrough if price improvement exists */}
                        {property.originalPrice && property.originalPrice > property.priceSale && (
                          <div className="text-sm text-muted-foreground line-through mb-1">
                            {formatPrice(property.originalPrice, property.currency, numberLocale)}
                          </div>
                        )}
                        <div className="font-serif text-3xl font-semibold text-foreground">
                          {formatPrice(property.priceSale, property.currency, numberLocale)}
                        </div>
                      </div>
                    )}
                    {property.priceRentMonthly && (
                      <div className={cn(
                        property.priceSale ? 'text-muted-foreground mt-1' : ''
                      )}>
                        {/* Original price for rent if no sale price */}
                        {!property.priceSale && property.originalPrice && property.originalPrice > property.priceRentMonthly && (
                          <div className="text-sm text-muted-foreground line-through mb-1">
                            {formatPrice(property.originalPrice, property.currency, numberLocale)}{t('propertyDetail.perMonth')}
                          </div>
                        )}
                        <div className={cn(
                          !property.priceSale && 'font-serif text-3xl font-semibold text-foreground'
                        )}>
                          {formatPrice(property.priceRentMonthly, property.currency, numberLocale)}{t('propertyDetail.perMonth')}
                        </div>
                      </div>
                    )}
                    {/* Price note - editorial, text only */}
                    {property.priceNote && (
                      <p className="text-sm text-muted-foreground mt-2">{property.priceNote}</p>
                    )}
                  </div>

                  <Button
                    onClick={handleShare}
                    size="lg"
                    className="w-full justify-center gap-2 mb-3"
                  >
                    {shareSuccess ? (
                      <Check className="w-5 h-5" />
                    ) : (
                      <Share2 className="w-5 h-5" />
                    )}
                    {shareSuccess 
                      ? t('propertyDetail.linkCopied', 'Link Copied!')
                      : t('propertyDetail.shareProperty', 'Share Property')
                    }
                  </Button>

                  <div className="flex gap-2 mb-4">
                    <Button variant="outline" size="icon" aria-label={t('propertyDetail.save', 'Save')}>
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>

                  <Button className="w-full mb-3" size="lg" asChild>
                    <Link to="/contact">{t('propertyDetail.scheduleViewing')}</Link>
                  </Button>
                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <a href="tel:+50686540888">
                      <Phone className="w-4 h-4 mr-2" />
                      {t('common.callNow')}
                    </a>
                  </Button>
                </div>

                {/* Agent Card */}
                {listingAgent && (
                  <div>
                    <h3 className="font-medium text-foreground mb-3">{t('propertyDetail.listingAgent')}</h3>
                    <AgentCard agent={listingAgent} compact />
                  </div>
                )}

                {/* Meta */}
                <div className="text-sm text-muted-foreground">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="w-4 h-4" />
                    {t('propertyDetail.listed')}: {new Date(property.createdAt).toLocaleDateString()}
                  </div>
                  <p>ID: {property.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Related Properties */}
          {relatedProperties.length > 0 && (
            <div className="mt-16 pt-16 border-t border-border">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">{t('propertyDetail.similarProperties')}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {relatedProperties.map(p => (
                  <PropertyCard key={p.id} property={p} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
