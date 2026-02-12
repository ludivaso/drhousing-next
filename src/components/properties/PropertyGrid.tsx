import { Property } from '@/types';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

interface PropertyGridProps {
  properties: Property[];
  featuredProperties: Property[];
  onClearFilters: () => void;
  compact?: boolean;
}

export function PropertyGrid({ 
  properties, 
  featuredProperties, 
  onClearFilters,
  compact = false 
}: PropertyGridProps) {
  const { t } = useTranslation();
  const regularProperties = properties.filter(p => !p.featured);

  if (compact) {
    // Compact view for split mode - single column, scrollable
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            {t('propertyGrid.count', { count: properties.length })}
          </span>
        </div>
        
        <div className="space-y-4 max-h-[calc(100vh-380px)] overflow-y-auto pr-2">
          {properties.length > 0 ? (
            properties.map(property => (
              <PropertyCard key={property.id} property={property} compact />
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">{t('propertyGrid.noMatches')}</p>
              <Button variant="outline" onClick={onClearFilters}>{t('propertyGrid.clearFilters')}</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Featured */}
      {featuredProperties.length > 0 && (
        <div className="mb-12">
          <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">{t('propertyGrid.featuredTitle')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {featuredProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </div>
      )}

      {/* All Properties */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-serif text-2xl font-semibold text-foreground">
            {regularProperties.length > 0 ? t('propertyGrid.allTitle') : t('propertyGrid.noneTitle')}
          </h2>
          <span className="text-sm text-muted-foreground">
            {t('propertyGrid.count', { count: properties.length })}
          </span>
        </div>
        
        {regularProperties.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {regularProperties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          featuredProperties.length === 0 && (
            <div className="text-center py-16">
              <p className="text-muted-foreground mb-4">{t('propertyGrid.noMatches')}</p>
              <Button variant="outline" onClick={onClearFilters}>{t('propertyGrid.clearFilters')}</Button>
            </div>
          )
        )}
      </div>
    </>
  );
}
