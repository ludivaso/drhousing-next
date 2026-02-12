import { useTranslation } from 'react-i18next';
import { Filter, X, CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import {
  PropertyStatus,
  PropertyType,
  PropertyTier,
} from '@/types';

export interface ListingsFiltersState {
  status: PropertyStatus | 'all';
  propertyType: PropertyType | 'all';
  tier: PropertyTier | 'all';
  date: Date | undefined;
}

interface ListingsFiltersProps {
  filters: ListingsFiltersState;
  onFiltersChange: (filters: ListingsFiltersState) => void;
}

export const DEFAULT_LISTINGS_FILTERS: ListingsFiltersState = {
  status: 'all',
  propertyType: 'all',
  tier: 'all',
  date: undefined,
};

const STATUS_VALUES: PropertyStatus[] = ['for_sale', 'for_rent', 'both', 'presale', 'under_contract', 'sold', 'rented'];
const TYPE_VALUES: PropertyType[] = ['house', 'condo', 'land', 'commercial', 'other'];
const TIER_VALUES: PropertyTier[] = ['mid', 'high_end', 'ultra_luxury'];

export function ListingsFilters({ filters, onFiltersChange }: ListingsFiltersProps) {
  const { t } = useTranslation();
  const activeFiltersCount = Object.entries(filters).filter(([k, v]) => k === 'date' ? v !== undefined : v !== 'all').length;

  const clearFilters = () => {
    onFiltersChange(DEFAULT_LISTINGS_FILTERS);
  };

  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Filter className="w-4 h-4" />
        <span>{t('admin.filters.label')}</span>
      </div>

      <Select
        value={filters.status}
        onValueChange={(value) => onFiltersChange({ ...filters, status: value as PropertyStatus | 'all' })}
      >
        <SelectTrigger className="w-[140px] h-9 bg-background">
          <SelectValue placeholder={t('admin.table.status')} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          <SelectItem value="all">{t('admin.filters.allStatuses')}</SelectItem>
          {STATUS_VALUES.map((value) => (
            <SelectItem key={value} value={value}>{t(`property.status.${value}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.propertyType}
        onValueChange={(value) => onFiltersChange({ ...filters, propertyType: value as PropertyType | 'all' })}
      >
        <SelectTrigger className="w-[140px] h-9 bg-background">
          <SelectValue placeholder={t('admin.table.type')} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          <SelectItem value="all">{t('admin.filters.allTypes')}</SelectItem>
          {TYPE_VALUES.map((value) => (
            <SelectItem key={value} value={value}>{t(`property.type.${value}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tier}
        onValueChange={(value) => onFiltersChange({ ...filters, tier: value as PropertyTier | 'all' })}
      >
        <SelectTrigger className="w-[140px] h-9 bg-background">
          <SelectValue placeholder={t('property.tier.mid')} />
        </SelectTrigger>
        <SelectContent className="bg-background border shadow-lg z-50">
          <SelectItem value="all">{t('admin.filters.allTiers')}</SelectItem>
          {TIER_VALUES.map((value) => (
            <SelectItem key={value} value={value}>{t(`property.tier.${value}`)}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              "w-[160px] h-9 justify-start text-left font-normal",
              !filters.date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {filters.date ? format(filters.date, "MMM d, yyyy") : t('admin.filters.dateAdded')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={filters.date}
            onSelect={(date) => onFiltersChange({ ...filters, date: date || undefined })}
            initialFocus
            className={cn("p-3 pointer-events-auto")}
          />
        </PopoverContent>
      </Popover>

      {activeFiltersCount > 0 && (
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={clearFilters}
          className="h-9 gap-1"
        >
          <X className="w-3 h-3" />
          {t('admin.filters.clear')}
          <Badge variant="secondary" className="ml-1 h-5 px-1.5">
            {activeFiltersCount}
          </Badge>
        </Button>
      )}
    </div>
  );
}
