import { LocaleLink as Link } from '@/components/LocaleLink';
import { Bed, Bath, Maximize } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Property } from '@/types';
import { cn } from '@/lib/utils';
import { getStatusLabel, getTierLabel } from '@/lib/propertyLabels';
import { normalizeLang } from '@/lib/i18nUtils';
import { useAutoTranslateText } from '@/hooks/useAutoTranslateText';

interface ListingBriefProps {
  property: Property;
  className?: string;
}

function formatPrice(price: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(price);
}

/**
 * ListingBrief - A case-brief style property presentation
 * Designed to feel like legal/advisory documentation with visual evidence
 * NOT a product card or marketplace tile
 */
export function ListingBrief({ property, className }: ListingBriefProps) {
  const { t, i18n } = useTranslation();
  const lang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const numberLocale = lang === 'es' ? 'es-ES' : 'en-US';

  const { text: translatedTitle } = useAutoTranslateText(property.title, { enabled: true });
  const { text: translatedDescription } = useAutoTranslateText(
    property.description?.slice(0, 200) || '', 
    { enabled: true }
  );

  return (
    <Link 
      to={`/properties/${property.id}`}
      className={cn(
        'group block',
        className
      )}
    >
      <article className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8 py-10 border-b border-border/60 hover:bg-muted/20 transition-colors -mx-4 px-4 lg:-mx-8 lg:px-8">
        {/* Visual Evidence */}
        <div className="relative aspect-[4/3] lg:aspect-square overflow-hidden bg-muted">
          {property.images[0] ? (
            <img
              src={property.images[0]}
              alt={translatedTitle}
              className="w-full h-full object-cover grayscale-[20%] group-hover:grayscale-0 transition-all duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-muted to-muted-foreground/10 flex items-center justify-center">
              <span className="font-serif text-3xl text-muted-foreground/30">DR</span>
            </div>
          )}
          
          {/* Tier indicator - subtle */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent py-3 px-4">
            <span className="text-xs text-white/80 tracking-wide uppercase">
              {getTierLabel(t, property.tier)}
            </span>
          </div>
        </div>

        {/* Case Brief Content */}
        <div className="flex flex-col justify-center">
          {/* Location & Status Line */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground mb-3">
            <span className="tracking-wide">{property.locationName}</span>
            <span className="text-border">·</span>
            <span className="uppercase text-xs tracking-widest">
              {getStatusLabel(t, property.status)}
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-xl lg:text-2xl font-medium text-foreground mb-4 leading-snug group-hover:text-primary transition-colors">
            {translatedTitle}
          </h3>

          {/* Brief Description */}
          {translatedDescription && (
            <p className="text-muted-foreground text-sm leading-relaxed mb-5 line-clamp-2 max-w-xl">
              {translatedDescription}
            </p>
          )}

          {/* Specifications - Clinical presentation */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-foreground/70 mb-5">
            {property.bedrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bed className="w-4 h-4" />
                <span>{property.bedrooms} {t('property.bedrooms')}</span>
              </div>
            )}
            {property.bathrooms > 0 && (
              <div className="flex items-center gap-1.5">
                <Bath className="w-4 h-4" />
                <span>{property.bathrooms} {t('property.bathrooms')}</span>
              </div>
            )}
            {property.constructionSizeSqm && (
              <div className="flex items-center gap-1.5">
                <Maximize className="w-4 h-4" />
                <span>{property.constructionSizeSqm} m²</span>
              </div>
            )}
          </div>

          {/* Price - Understated, with price improvement */}
          <div>
            <div className="flex items-baseline gap-3">
              {property.priceSale && (
                <>
                  {property.originalPrice && property.originalPrice > property.priceSale && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(property.originalPrice, property.currency, numberLocale)}
                    </span>
                  )}
                  <span className="font-serif text-lg text-foreground">
                    {formatPrice(property.priceSale, property.currency, numberLocale)}
                  </span>
                </>
              )}
              {property.priceRentMonthly && (
                <span className={cn(
                  'text-sm text-muted-foreground',
                  !property.priceSale && 'font-serif text-lg text-foreground'
                )}>
                  {property.priceSale && '· '}
                  {formatPrice(property.priceRentMonthly, property.currency, numberLocale)}{t('property.perMonth')}
                </span>
              )}
            </div>
            {property.priceNote && (
              <p className="text-xs text-muted-foreground mt-1">{property.priceNote}</p>
            )}
          </div>

          {/* View Details hint */}
          <div className="mt-5">
            <span className="text-xs text-muted-foreground tracking-wide uppercase group-hover:text-primary transition-colors">
              {t('common.viewDetails', 'View Details')} →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}
