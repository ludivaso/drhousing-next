import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropertyForm from '@/components/admin/PropertyForm';
import { useProperty } from '@/hooks/useProperties';

export default function AdminListingEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: property, isLoading, error } = useProperty(id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('admin.listings.propertyNotFound')}</p>
        <Link to="/admin/listings" className="text-primary hover:underline">
          {t('admin.listings.backToListings')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/listings"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('admin.listings.backToListings')}
        </Link>
        <h1 className="font-serif text-3xl font-semibold">{t('admin.listings.editProperty')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.listings.editPropertyDesc')}
        </p>
      </div>

      <PropertyForm property={property} mode="edit" />
    </div>
  );
}
