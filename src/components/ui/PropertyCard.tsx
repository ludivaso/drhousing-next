import { useState } from 'react';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { Bed, Bath, Maximize } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Property } from '@/types';
import { cn } from '@/lib/utils';
import { getStatusLabel } from '@/lib/propertyLabels';
import { normalizeLang } from '@/lib/i18nUtils';
import { useAutoTranslateText } from '@/hooks/useAutoTranslateText';

interface PropertyCardProps {
  property: Property;
  className?: string;
  compact?: boolean;
}

export function PropertyCard({ property, className, compact = false }: PropertyCardProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const numberLocale = lang === 'es' ? 'es-ES' : 'en-US';

  // Use bilingual DB fields; fall back to runtime translation only if _es not populated
  const needsRuntimeTranslation = lang === 'es' && !property.titleEs;
  const { text: runtimeTitle } = useAutoTranslateText(property.title, { enabled: needsRuntimeTranslation });
  const translatedTitle = lang === 'es'
    ? (property.titleEs || runtimeTitle || property.title)
    : (property.titleEn || property.title);

  const formatLocalizedPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat(numberLocale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(price);
  };

  // Status badge styling based on status
  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'for_sale':
        return 'bg-primary text-primary-foreground';
      case 'for_rent':
        return 'bg-accent text-accent-foreground';
      case 'both':
        return 'bg-primary text-primary-foreground';
      case 'under_contract':
        return 'bg-amber-600 text-white';
      case 'sold':
        return 'bg-muted text-muted-foreground';
      case 'rented':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-primary text-primary-foreground';
    }
  };

  // Compact variant for split view
  if (compact) {
    return (
      <Link 
        to={`/properties/${property.id}`}
        className={cn('flex gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors group', className)}
      >
        {/* Thumbnail */}
        <div className="relative w-24 h-24 shrink-0 overflow-hidden rounded-md bg-muted">
          {property.images[0] ? (
            <img
              src={property.images[0]}
              alt={translatedTitle}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <span className="font-serif text-sm text-muted-foreground/50">DR</span>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "text-[10px] uppercase tracking-wide font-medium px-1.5 py-0.5 rounded",
                getStatusBadgeStyle(property.status)
              )}>
                {getStatusLabel(t, property.status)}
              </span>
            </div>
            <p className="text-xs text-muted-foreground truncate">{property.locationName}</p>
            <h3 className="font-medium text-sm text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {translatedTitle}
            </h3>
          </div>
          
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {property.bedrooms > 0 && (
                <span className="flex items-center gap-0.5">
                  <Bed className="w-3 h-3" />
                  {property.bedrooms}
                </span>
              )}
              {property.bathrooms > 0 && (
                <span className="flex items-center gap-0.5">
                  <Bath className="w-3 h-3" />
                  {property.bathrooms}
                </span>
              )}
            </div>
            <span className="font-semibold text-sm text-foreground whitespace-nowrap">
              {property.priceSale 
                ? formatLocalizedPrice(property.priceSale, property.currency)
                : property.priceRentMonthly 
                  ? `${formatLocalizedPrice(property.priceRentMonthly, property.currency)}${t('property.perMonth')}`
                  : ''}
            </span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link 
      to={`/properties/${property.id}`}
      className={cn('block group overflow-hidden bg-card', className)}
    >
      {/* Image with minimal status badge */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {property.images[0] ? (
          <img
            src={property.images[0]}
            alt={translatedTitle}
            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
            <span className="font-serif text-3xl text-muted-foreground/30 tracking-wider">DRH</span>
          </div>
        )}
        
        {/* Single status badge - top left, subtle */}
        <div className="absolute top-3 left-3">
          <span className={cn(
            "text-xs uppercase tracking-wide font-medium px-2.5 py-1 rounded",
            getStatusBadgeStyle(property.status)
          )}>
            {getStatusLabel(t, property.status)}
          </span>
        </div>
      </div>

      {/* Content - Clean, minimal */}
      <div className="p-5 space-y-3">
        {/* Location - subtle, understated */}
        <p className="text-xs uppercase tracking-widest text-muted-foreground">
          {property.locationName}
        </p>
        
        {/* Title */}
        <h3 className="font-serif text-lg font-medium text-foreground leading-snug line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {translatedTitle}
        </h3>

        {/* Stats - minimal, elegant */}
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {property.bedrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4" />
              <span>{property.bedrooms}</span>
            </div>
          )}
          {property.bathrooms > 0 && (
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4" />
              <span>{property.bathrooms}</span>
            </div>
          )}
          {property.constructionSizeSqm && (
            <div className="flex items-center gap-1.5">
              <Maximize className="w-4 h-4" />
              <span>{property.constructionSizeSqm} m²</span>
            </div>
          )}
        </div>

        {/* Price - prominent, elegant, with price improvement */}
        <div className="pt-3 border-t border-border/50">
          {property.priceSale ? (
            <div>
              {property.originalPrice && property.originalPrice > property.priceSale && (
                <span className="text-sm text-muted-foreground line-through mr-2">
                  {formatLocalizedPrice(property.originalPrice, property.currency)}
                </span>
              )}
              <span className="font-serif text-xl tracking-tight text-foreground">
                {formatLocalizedPrice(property.priceSale, property.currency)}
              </span>
            </div>
          ) : property.priceRentMonthly ? (
            <span className="font-serif text-xl tracking-tight text-foreground">
              {formatLocalizedPrice(property.priceRentMonthly, property.currency)}
              <span className="text-sm font-sans text-muted-foreground">{t('property.perMonth')}</span>
            </span>
          ) : null}
          {property.priceNote && (
            <p className="text-xs text-muted-foreground mt-1">{property.priceNote}</p>
          )}
        </div>
      </div>
    </Link>
  );
}
