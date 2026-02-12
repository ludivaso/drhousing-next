import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Star, Edit, Trash2, Eye, ImageOff, ArrowUpDown, ArrowUp, ArrowDown, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Property } from '@/types';
import { cn } from '@/lib/utils';

export type SortField = 'title' | 'price' | 'createdAt' | null;
export type SortDirection = 'asc' | 'desc';

interface ListingsTableProps {
  properties: Property[];
  selectedIds: Set<string>;
  canEditListings: boolean;
  sortField: SortField;
  sortDirection: SortDirection;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onDelete: (property: Property) => void;
  onSort: (field: SortField) => void;
}

export function ListingsTable({
  properties,
  selectedIds,
  canEditListings,
  sortField,
  sortDirection,
  onToggleSelect,
  onToggleSelectAll,
  onDelete,
  onSort,
}: ListingsTableProps) {
  const { t } = useTranslation();
  const allSelected = properties.length > 0 && selectedIds.size === properties.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < properties.length;

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    return sortDirection === 'asc' 
      ? <ArrowUp className="w-3 h-3 ml-1" /> 
      : <ArrowDown className="w-3 h-3 ml-1" />;
  };

  const SortableHeader = ({ field, children }: { field: SortField; children: React.ReactNode }) => (
    <button 
      onClick={() => onSort(field)} 
      className="flex items-center font-medium hover:text-primary transition-colors"
    >
      {children}
      <SortIcon field={field} />
    </button>
  );

  return (
    <div className="card-elevated overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted">
            <tr>
              {canEditListings && (
                <th className="p-3 w-10">
                  <Checkbox 
                    checked={allSelected}
                    onCheckedChange={onToggleSelectAll}
                    aria-label="Select all"
                    className={someSelected ? 'data-[state=checked]:bg-primary/50' : ''}
                  />
                </th>
              )}
              <th className="text-left p-3 font-medium w-16">{t('admin.table.photo')}</th>
              <th className="text-left p-3">
                <SortableHeader field="title">{t('admin.table.property')}</SortableHeader>
              </th>
              <th className="text-left p-3 font-medium hidden md:table-cell">{t('admin.table.type')}</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">{t('admin.table.status')}</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">{t('admin.table.salePrice')}</th>
              <th className="text-left p-3 font-medium hidden lg:table-cell">{t('admin.table.rentPrice')}</th>
              <th className="text-left p-3">
                <SortableHeader field="createdAt">{t('admin.table.date')}</SortableHeader>
              </th>
              <th className="text-left p-3 font-medium w-24">{t('admin.table.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {properties.map((property) => (
              <tr key={property.id} className={cn("border-t border-border hover:bg-muted/50", property.hidden && "opacity-50")}>
                {canEditListings && (
                  <td className="p-3">
                    <Checkbox 
                      checked={selectedIds.has(property.id)}
                      onCheckedChange={() => onToggleSelect(property.id)}
                      aria-label={`Select ${property.title}`}
                    />
                  </td>
                )}
                <td className="p-3">
                  <HoverCard openDelay={200} closeDelay={100}>
                    <HoverCardTrigger asChild>
                      <div className="w-12 h-12 rounded-lg overflow-hidden bg-muted flex items-center justify-center cursor-pointer">
                        {property.images?.[0] ? (
                          <img 
                            src={property.images[0]} 
                            alt={property.title} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <ImageOff className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </HoverCardTrigger>
                    {property.images?.[0] && (
                      <HoverCardContent side="right" className="w-80 p-0 overflow-hidden">
                        <img 
                          src={property.images[0]} 
                          alt={property.title} 
                          className="w-full h-48 object-cover"
                        />
                        <div className="p-3">
                          <p className="font-medium text-sm">{property.title}</p>
                          <p className="text-xs text-muted-foreground">{property.images.length} {t('admin.table.photos')}</p>
                        </div>
                      </HoverCardContent>
                    )}
                  </HoverCard>
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-2">
                    {property.featured && <Star className="w-4 h-4 text-gold fill-gold" />}
                    {property.hidden && <EyeOff className="w-4 h-4 text-muted-foreground" />}
                    <div>
                      <p className="font-medium line-clamp-1">{property.title}</p>
                      <p className="text-muted-foreground text-xs">{property.locationName}</p>
                    </div>
                  </div>
                </td>
                <td className="p-3 hidden md:table-cell">{t(`property.type.${property.propertyType}`)}</td>
                <td className="p-3 hidden sm:table-cell">{t(`property.status.${property.status}`)}</td>
                <td className="p-3 hidden lg:table-cell">
                  {property.priceSale ? `$${property.priceSale.toLocaleString()}` : '—'}
                </td>
                <td className="p-3 hidden lg:table-cell">
                  {property.priceRentMonthly ? `$${property.priceRentMonthly.toLocaleString()}/mo` : '—'}
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {new Date(property.createdAt).toLocaleDateString()}
                </td>
                <td className="p-3">
                  <div className="flex items-center gap-1">
                    {canEditListings ? (
                      <>
                        <Button variant="ghost" size="icon" asChild>
                          <Link to={`/admin/listings/${property.id}`}><Edit className="w-4 h-4" /></Link>
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => onDelete(property)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/properties/${property.id}`} target="_blank"><Eye className="w-4 h-4" /></Link>
                      </Button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
