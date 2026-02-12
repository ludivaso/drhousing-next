import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PropertyForm from '@/components/admin/PropertyForm';

export default function AdminListingNew() {
  const { t } = useTranslation();

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
        <h1 className="font-serif text-3xl font-semibold">{t('admin.listings.addNewProperty')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.listings.addNewPropertyDesc')}
        </p>
      </div>

      <PropertyForm mode="create" />
    </div>
  );
}
