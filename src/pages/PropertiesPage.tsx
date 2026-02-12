import { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, Grid, MapIcon, Columns, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { PropertiesMap } from '@/components/properties/PropertiesMap';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { usePublicProperties } from '@/hooks/useProperties';
import { 
  PropertyFilters, 
  DEFAULT_FILTERS, 
} from '@/types';
import { getStatusLabel, getTierLabel, getTypeLabel } from '@/lib/propertyLabels';

type ViewMode = 'grid' | 'map' | 'split';

export default function PropertiesPage() {
  const { t } = useTranslation();
  const [filters, setFilters] = useState<PropertyFilters>(DEFAULT_FILTERS);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [showFilters, setShowFilters] = useState(false);

  const { data: properties = [], isLoading, isError } = usePublicProperties();

  const filteredProperties = useMemo(() => {
    return properties.filter(property => {
      if (filters.status !== 'all' && property.status !== filters.status) return false;
      if (filters.propertyType !== 'all' && property.propertyType !== filters.propertyType) return false;
      if (filters.tier !== 'all' && property.tier !== filters.tier) return false;
      if (filters.bedroomsMin && property.bedrooms < filters.bedroomsMin) return false;
      if (filters.bathroomsMin && property.bathrooms < filters.bathroomsMin) return false;
      
      const price = property.priceSale || property.priceRentMonthly || 0;
      if (filters.priceMin && price < filters.priceMin) return false;
      if (filters.priceMax && price > filters.priceMax) return false;
      
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        const searchableText = `${property.title} ${property.locationName} ${property.description}`.toLowerCase();
        if (!searchableText.includes(query)) return false;
      }
      
      return true;
    });
  }, [filters, properties]);

  const featuredProperties = filteredProperties
    .filter(p => p.featured)
    .sort((a, b) => (a.featuredOrder ?? 0) - (b.featuredOrder ?? 0));
  const regularProperties = filteredProperties.filter(p => !p.featured);

  const clearFilters = () => setFilters(DEFAULT_FILTERS);

  const hasActiveFilters = filters.status !== 'all' || 
    filters.propertyType !== 'all' || 
    filters.tier !== 'all' ||
    filters.bedroomsMin || 
    filters.bathroomsMin ||
    filters.priceMin ||
    filters.priceMax ||
    filters.searchQuery;

  return (
    <Layout>
      <LocaleSEO titleKey="seo.properties.title" descriptionKey="seo.properties.description" />
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">{t('properties.title')}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('properties.description')}
          </p>
        </div>
      </section>

      {/* Search & Filters */}
      <section className="bg-card border-b border-border sticky top-[60px] md:top-[100px] z-40">
        <div className="container-wide py-4">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder={t('properties.searchPlaceholder')}
                value={filters.searchQuery}
                onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                className="pl-10"
              />
            </div>

            {/* Quick Filters */}
            <div className="flex gap-2 flex-wrap">
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={t('properties.filters.status')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.filters.allStatus')}</SelectItem>
                  <SelectItem value="for_sale">{getStatusLabel(t, 'for_sale')}</SelectItem>
                  <SelectItem value="for_rent">{getStatusLabel(t, 'for_rent')}</SelectItem>
                  <SelectItem value="both">{getStatusLabel(t, 'both')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.propertyType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, propertyType: value as any }))}
              >
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder={t('properties.filters.type')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.filters.allTypes')}</SelectItem>
                  <SelectItem value="house">{getTypeLabel(t, 'house')}</SelectItem>
                  <SelectItem value="condo">{getTypeLabel(t, 'condo')}</SelectItem>
                  <SelectItem value="land">{getTypeLabel(t, 'land')}</SelectItem>
                  <SelectItem value="commercial">{getTypeLabel(t, 'commercial')}</SelectItem>
                  <SelectItem value="other">{getTypeLabel(t, 'other')}</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tier}
                onValueChange={(value) => setFilters(prev => ({ ...prev, tier: value as any }))}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={t('properties.filters.tier')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('properties.filters.allTiers')}</SelectItem>
                  <SelectItem value="mid">{getTierLabel(t, 'mid')}</SelectItem>
                  <SelectItem value="high_end">{getTierLabel(t, 'high_end')}</SelectItem>
                  <SelectItem value="ultra_luxury">{getTierLabel(t, 'ultra_luxury')}</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilters(!showFilters)}
                className={showFilters ? 'bg-primary text-primary-foreground' : ''}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </Button>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="w-4 h-4" />
                  {t('properties.filters.clear')}
                </Button>
              )}

              {/* View Mode Toggles */}
              <div className="hidden md:flex border-l border-border pl-2 gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('properties.viewModes.grid')}</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('split')}
                    >
                      <Columns className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('properties.viewModes.split')}</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                      size="icon"
                      onClick={() => setViewMode('map')}
                    >
                      <MapIcon className="w-4 h-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>{t('properties.viewModes.map')}</TooltipContent>
                </Tooltip>
              </div>
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-4 animate-fade-in">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('properties.filters.minBedrooms')}</label>
                <Select
                  value={filters.bedroomsMin?.toString() || 'any'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, bedroomsMin: value === 'any' ? null : parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('properties.filters.any')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('properties.filters.any')}</SelectItem>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('properties.filters.minBathrooms')}</label>
                <Select
                  value={filters.bathroomsMin?.toString() || 'any'}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, bathroomsMin: value === 'any' ? null : parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('properties.filters.any')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">{t('properties.filters.any')}</SelectItem>
                    {[1, 2, 3, 4, 5].map(n => (
                      <SelectItem key={n} value={n.toString()}>{n}+</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('properties.filters.minPrice')}</label>
                <Input
                  type="number"
                  placeholder={t('properties.filters.minPricePlaceholder')}
                  value={filters.priceMin || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMin: e.target.value ? parseInt(e.target.value) : null }))}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-1 block">{t('properties.filters.maxPrice')}</label>
                <Input
                  type="number"
                  placeholder={t('properties.filters.maxPricePlaceholder')}
                  value={filters.priceMax || ''}
                  onChange={(e) => setFilters(prev => ({ ...prev, priceMax: e.target.value ? parseInt(e.target.value) : null }))}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="section-padding bg-background">
        <div className={viewMode === 'split' ? 'px-4 md:px-6' : 'container-wide'}>
          {isLoading && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">{t('properties.loading')}</p>
            </div>
          )}

          {isError && (
            <div className="py-20 text-center">
              <p className="text-muted-foreground">{t('properties.loadError')}</p>
            </div>
          )}

          {/* Grid View */}
          {!isLoading && !isError && viewMode === 'grid' && (
            <>
              {/* Featured */}
              {featuredProperties.length > 0 && (
                <div className="mb-14">
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-8">{t('propertyGrid.featuredShort')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {featuredProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              )}

              {/* All Properties */}
              <div>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-foreground">
                    {regularProperties.length > 0 ? t('propertyGrid.allListingsTitle') : t('propertyGrid.noneTitle')}
                  </h2>
                  <span className="text-sm text-muted-foreground tracking-wide">
                    {t('propertyGrid.count', { count: filteredProperties.length })}
                  </span>
                </div>
                
                {regularProperties.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {regularProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                ) : (
                  featuredProperties.length === 0 && (
                    <div className="text-center py-16">
                      <p className="text-muted-foreground mb-4">{t('propertyGrid.noMatches')}</p>
                      <Button variant="outline" onClick={clearFilters}>{t('propertyGrid.clearFilters')}</Button>
                    </div>
                  )
                )}
              </div>
            </>
          )}

          {/* Split View - Map + List Side by Side */}
          {!isLoading && !isError && viewMode === 'split' && (
            <div className="flex gap-6 h-[calc(100vh-300px)] min-h-[600px]">
              {/* Property List (Left Side) */}
              <div className="w-[400px] shrink-0 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-serif text-xl font-semibold text-foreground">{t('properties.split.listTitle')}</h2>
                  <span className="text-sm text-muted-foreground">
                    {t('properties.split.resultsCount', { count: filteredProperties.length })}
                  </span>
                </div>
                
                <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin">
                  {filteredProperties.length > 0 ? (
                    filteredProperties.map(property => (
                      <PropertyCard key={property.id} property={property} compact />
                    ))
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4 text-sm">{t('propertyGrid.noMatches')}</p>
                      <Button variant="outline" size="sm" onClick={clearFilters}>{t('propertyGrid.clearFilters')}</Button>
                    </div>
                  )}
                </div>
              </div>

              {/* Map (Right Side) */}
              <div className="flex-1 rounded-xl overflow-hidden border border-border">
                <PropertiesMap properties={filteredProperties} />
              </div>
            </div>
          )}

          {/* Full Map View */}
          {!isLoading && !isError && viewMode === 'map' && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-serif text-2xl font-semibold text-foreground">
                  {t('properties.map.title')}
                </h2>
                <span className="text-sm text-muted-foreground">
                  {t('properties.map.count', {
                    shown: filteredProperties.filter(p => p.lat && p.lng).length,
                    total: filteredProperties.length,
                  })}
                </span>
              </div>
              <PropertiesMap properties={filteredProperties} />
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
