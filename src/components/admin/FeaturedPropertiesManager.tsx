import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { GripVertical, Star, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAllFeaturedProperties, useUpdateFeaturedOrder } from '@/hooks/useProperties';
import { Property } from '@/types';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export function FeaturedPropertiesManager() {
  const { t } = useTranslation();
  const { data: featuredProperties = [], isLoading } = useAllFeaturedProperties();
  const updateOrder = useUpdateFeaturedOrder();
  const { toast } = useToast();
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [items, setItems] = useState<Property[] | null>(null);

  const displayItems = items ?? featuredProperties;

  const handleDragStart = (index: number) => {
    setDragIndex(index);
    if (!items) setItems([...featuredProperties]);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index || !items) return;
    const newItems = [...items];
    const [dragged] = newItems.splice(dragIndex, 1);
    newItems.splice(index, 0, dragged);
    setItems(newItems);
    setDragIndex(index);
  };

  const handleDragEnd = () => {
    setDragIndex(null);
  };

  const handleSaveOrder = async () => {
    if (!items) return;
    const orders = items.map((item, index) => ({ id: item.id, featured_order: index }));
    try {
      await updateOrder.mutateAsync(orders);
      toast({ title: t('admin.featured.orderSaved'), description: t('admin.featured.orderSavedDesc') });
      setItems(null);
    } catch (error: any) {
      toast({ title: t('admin.listings.error'), description: error.message, variant: 'destructive' });
    }
  };

  const hasChanges = items !== null;

  if (isLoading) {
    return <div className="text-sm text-muted-foreground py-4">{t('admin.featured.loading')}</div>;
  }

  if (featuredProperties.length === 0) {
    return <div className="text-sm text-muted-foreground py-4">{t('admin.featured.empty')}</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-serif text-lg font-semibold">{t('admin.featured.title')}</h3>
          <p className="text-xs text-muted-foreground">{t('admin.featured.description')}</p>
        </div>
        {hasChanges && (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setItems(null)}>{t('admin.featured.cancel')}</Button>
            <Button size="sm" onClick={handleSaveOrder} disabled={updateOrder.isPending}>{t('admin.featured.saveOrder')}</Button>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {displayItems.map((property, index) => (
          <div
            key={property.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'flex items-center gap-3 p-3 rounded-lg border bg-card cursor-grab active:cursor-grabbing transition-all',
              dragIndex === index && 'opacity-50 border-primary',
              index < 4 ? 'border-primary/30' : 'border-border opacity-70'
            )}
          >
            <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
            <span className="text-xs font-mono text-muted-foreground w-5 shrink-0">{index + 1}</span>
            <div className="w-10 h-10 rounded overflow-hidden bg-muted shrink-0">
              {property.images?.[0] ? (
                <img src={property.images[0]} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">—</div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{property.title}</p>
              <p className="text-xs text-muted-foreground">{property.locationName}</p>
            </div>
            {property.hidden && <EyeOff className="w-4 h-4 text-muted-foreground shrink-0" />}
            {index < 4 && (
              <span className="text-[10px] uppercase tracking-wide text-primary font-medium px-2 py-0.5 rounded bg-primary/10 shrink-0">
                {t('admin.featured.homepage')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
