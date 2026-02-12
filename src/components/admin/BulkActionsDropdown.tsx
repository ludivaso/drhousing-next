import { useTranslation } from 'react-i18next';
import { ChevronDown, Star, StarOff, Home, Building, Loader2, Tag, Layers, Briefcase, EyeOff, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  PropertyStatus,
  PropertyTier,
  ListingSource,
} from '@/types';

const STATUS_VALUES: PropertyStatus[] = ['for_sale', 'for_rent', 'both', 'presale', 'under_contract', 'sold', 'rented'];
const TIER_VALUES: PropertyTier[] = ['mid', 'high_end', 'ultra_luxury'];
const SOURCE_VALUES: ListingSource[] = ['direct', 'mls', 'referral', 'colleague'];

interface BulkActionsDropdownProps {
  selectedCount: number;
  isLoading: boolean;
  onMarkFeatured: (featured: boolean) => void;
  onChangeStatus: (status: PropertyStatus) => void;
  onChangeTier: (tier: PropertyTier) => void;
  onChangeSource: (source: ListingSource) => void;
  onToggleHidden: (hidden: boolean) => void;
}

export function BulkActionsDropdown({
  selectedCount,
  isLoading,
  onMarkFeatured,
  onChangeStatus,
  onChangeTier,
  onChangeSource,
  onToggleHidden,
}: BulkActionsDropdownProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ChevronDown className="w-4 h-4 mr-2" />
          )}
          {t('admin.bulk.title')} ({selectedCount})
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuItem onClick={() => onMarkFeatured(true)}>
          <Star className="w-4 h-4 mr-2" />
          {t('admin.bulk.markFeatured')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onMarkFeatured(false)}>
          <StarOff className="w-4 h-4 mr-2" />
          {t('admin.bulk.removeFeatured')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => onToggleHidden(true)}>
          <EyeOff className="w-4 h-4 mr-2" />
          {t('admin.bulk.hideListings')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onToggleHidden(false)}>
          <Eye className="w-4 h-4 mr-2" />
          {t('admin.bulk.showListings')}
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Building className="w-4 h-4 mr-2" />
            {t('admin.bulk.changeStatus')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {STATUS_VALUES.map((value) => (
              <DropdownMenuItem key={value} onClick={() => onChangeStatus(value)}>
                <Home className="w-4 h-4 mr-2" />
                {t(`property.status.${value}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Layers className="w-4 h-4 mr-2" />
            {t('admin.bulk.changeTier')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {TIER_VALUES.map((value) => (
              <DropdownMenuItem key={value} onClick={() => onChangeTier(value)}>
                <Tag className="w-4 h-4 mr-2" />
                {t(`property.tier.${value}`)}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <Briefcase className="w-4 h-4 mr-2" />
            {t('admin.bulk.setSource')}
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {SOURCE_VALUES.map((value) => (
              <DropdownMenuItem key={value} onClick={() => onChangeSource(value)}>
                <Briefcase className="w-4 h-4 mr-2" />
                {value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
