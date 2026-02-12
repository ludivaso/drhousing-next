import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { startOfDay, endOfDay } from 'date-fns';
import { Plus, Search, Trash2, Loader2, Upload, Download, FileUp, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { ListingsTable, SortField, SortDirection } from '@/components/admin/ListingsTable';
import { BulkActionsDropdown } from '@/components/admin/BulkActionsDropdown';
import { ListingsPagination } from '@/components/admin/ListingsPagination';
import { ListingsFilters, ListingsFiltersState, DEFAULT_LISTINGS_FILTERS } from '@/components/admin/ListingsFilters';
import { BatchImportDialog } from '@/components/admin/BatchImportDialog';
import ImportFromUrlDialog from '@/components/admin/ImportFromUrlDialog';
import { FeaturedPropertiesManager } from '@/components/admin/FeaturedPropertiesManager';
import { useProperties, useDeleteProperty, useBulkUpdateProperties } from '@/hooks/useProperties';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Property, PropertyStatus, PropertyTier, ListingSource } from '@/types';
import { exportPropertiesToCSV } from '@/lib/csvExport';

export default function AdminListings() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Property | null>(null);
  const [isMigrating, setIsMigrating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [pendingCsvContent, setPendingCsvContent] = useState<string | null>(null);
  const [csvRowCount, setCsvRowCount] = useState(0);
  const [batchImportOpen, setBatchImportOpen] = useState(false);
  const [urlImportOpen, setUrlImportOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [filters, setFilters] = useState<ListingsFiltersState>(DEFAULT_LISTINGS_FILTERS);
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const { data: properties, isLoading, refetch } = useProperties();
  const deleteProperty = useDeleteProperty();
  const bulkUpdate = useBulkUpdateProperties();
  const { toast } = useToast();
  const { hasAnyRole } = useAuth();
  
  const canEditListings = hasAnyRole(['admin', 'listing_editor']);

  // Filter properties by search and filters
  const filtered = useMemo(() => {
    let result = properties || [];
    
    // Apply text search
    if (search) {
      const searchLower = search.toLowerCase();
      result = result.filter(p => 
        p.title.toLowerCase().includes(searchLower) ||
        p.locationName.toLowerCase().includes(searchLower)
      );
    }
    
    // Apply dropdown filters
    if (filters.status !== 'all') {
      result = result.filter(p => p.status === filters.status);
    }
    if (filters.propertyType !== 'all') {
      result = result.filter(p => p.propertyType === filters.propertyType);
    }
    if (filters.tier !== 'all') {
      result = result.filter(p => p.tier === filters.tier);
    }
    // Apply date filter
    if (filters.date) {
      const dayStart = startOfDay(filters.date).getTime();
      const dayEnd = endOfDay(filters.date).getTime();
      result = result.filter(p => {
        const created = new Date(p.createdAt).getTime();
        return created >= dayStart && created <= dayEnd;
      });
    }
    
    return result;
  }, [properties, search, filters]);

  // Sort properties
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    
    return [...filtered].sort((a, b) => {
      let comparison = 0;
      
      switch (sortField) {
        case 'title':
          comparison = a.title.localeCompare(b.title);
          break;
        case 'price':
          const priceA = a.priceSale || a.priceRentMonthly || 0;
          const priceB = b.priceSale || b.priceRentMonthly || 0;
          comparison = priceA - priceB;
          break;
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [filtered, sortField, sortDirection]);

  // Paginate results
  const totalPages = Math.ceil(sorted.length / pageSize);
  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sorted.slice(startIndex, startIndex + pageSize);
  }, [sorted, currentPage, pageSize]);

  // Reset page when search/filters change
  const handleSearchChange = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFiltersChange = (newFilters: ListingsFiltersState) => {
    setFilters(newFilters);
    setCurrentPage(1);
  };

  const handlePageSizeChange = (size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const toExport = selectedIds.size > 0
      ? sorted.filter(p => selectedIds.has(p.id))
      : sorted;
    
    exportPropertiesToCSV(toExport, `listings-export-${new Date().toISOString().split('T')[0]}.csv`);
    toast({
      title: t('admin.listings.exportComplete'),
      description: t('admin.listings.exportCompleteDesc', { count: toExport.length }),
    });
  };

  const handleMigrateImages = async () => {
    setIsMigrating(true);
    try {
      const { data, error } = await supabase.functions.invoke('migrate-property-images');
      
      if (error) throw error;
      
      toast({
        title: t('admin.listings.migrationComplete'),
        description: `Migrated ${data.totalMigrated} images from ${data.totalProperties} properties.${data.totalFailed > 0 ? ` ${data.totalFailed} failed.` : ''}`,
      });
      
      refetch();
    } catch (error: any) {
      toast({
        title: t('admin.listings.migrationFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsMigrating(false);
    }
  };

  // Count CSV data rows (excluding header, handling quoted fields with newlines)
  const countCsvRows = (csv: string): number => {
    let inQuotes = false;
    let rowCount = 0;
    for (let i = 0; i < csv.length; i++) {
      const char = csv[i];
      if (char === '"') inQuotes = !inQuotes;
      if (!inQuotes && (char === '\n')) rowCount++;
    }
    return Math.max(0, rowCount);
  };

  const handleCsvFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      const rowCount = countCsvRows(content);
      setPendingCsvContent(content);
      setCsvRowCount(rowCount);
      
      if (rowCount > 10) {
        setBatchImportOpen(true);
      } else {
        setImportConfirmOpen(true);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleImportCsv = async (clearExisting: boolean) => {
    if (!pendingCsvContent) return;
    setImportConfirmOpen(false);
    setIsImporting(true);
    try {
      const { data, error } = await supabase.functions.invoke('import-properties-csv', {
        body: { csvContent: pendingCsvContent, clearExisting },
      });
      if (error) throw error;
      toast({
        title: t('admin.listings.importComplete'),
        description: `${data.totalSuccess} properties imported.${data.totalFailed > 0 ? ` ${data.totalFailed} failed.` : ''}`,
      });
      refetch();
    } catch (error: any) {
      toast({
        title: t('admin.listings.importFailed'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsImporting(false);
      setPendingCsvContent(null);
    }
  };

  const handleBulkTier = async (tier: PropertyTier) => {
    try {
      await bulkUpdate.mutateAsync({
        ids: Array.from(selectedIds),
        updates: { tier },
      });
      toast({
        title: t('admin.listings.propertiesUpdated'),
        description: `${selectedIds.size} properties tier changed.`,
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBulkSource = async (listingSource: ListingSource) => {
    try {
      await bulkUpdate.mutateAsync({
        ids: Array.from(selectedIds),
        updates: { listingSource },
      });
      toast({
        title: t('admin.listings.propertiesUpdated'),
        description: `${selectedIds.size} properties source changed.`,
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };
  const handleBulkHidden = async (hidden: boolean) => {
    try {
      await bulkUpdate.mutateAsync({
        ids: Array.from(selectedIds),
        updates: { hidden },
      });
      toast({
        title: t('admin.listings.propertiesUpdated'),
        description: `${selectedIds.size} properties ${hidden ? 'hidden' : 'made visible'}.`,
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };



  const handleDelete = async () => {
    if (!deleteTarget) return;
    
    try {
      await deleteProperty.mutateAsync(deleteTarget.id);
      toast({
        title: t('admin.listings.propertyDeleted'),
        description: t('admin.listings.propertyDeletedDesc', { title: deleteTarget.title }),
      });
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteProperty.mutateAsync(id);
      }
      toast({
        title: t('admin.listings.propertiesDeleted'),
        description: t('admin.listings.propertiesDeletedDesc', { count: selectedIds.size }),
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setBulkDeleteOpen(false);
    }
  };

  const handleBulkFeatured = async (featured: boolean) => {
    try {
      await bulkUpdate.mutateAsync({
        ids: Array.from(selectedIds),
        updates: { featured },
      });
      toast({
        title: t('admin.listings.propertiesUpdated'),
        description: `${selectedIds.size} properties ${featured ? 'marked as featured' : 'removed from featured'}.`,
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handleBulkStatus = async (status: PropertyStatus) => {
    try {
      await bulkUpdate.mutateAsync({
        ids: Array.from(selectedIds),
        updates: { status },
      });
      toast({
        title: t('admin.listings.propertiesUpdated'),
        description: `${selectedIds.size} properties status changed.`,
      });
      setSelectedIds(new Set());
    } catch (error: any) {
      toast({
        title: t('admin.listings.error'),
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === paginatedProperties.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(paginatedProperties.map(p => p.id)));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-serif text-3xl font-semibold">{t('admin.listings.title')}</h1>
        <div className="flex flex-wrap gap-2">
          {canEditListings && (
            <>
              {selectedIds.size > 0 && (
                <>
                  <BulkActionsDropdown
                    selectedCount={selectedIds.size}
                    isLoading={bulkUpdate.isPending}
                    onMarkFeatured={handleBulkFeatured}
                    onChangeStatus={handleBulkStatus}
                    onChangeTier={handleBulkTier}
                    onChangeSource={handleBulkSource}
                    onToggleHidden={handleBulkHidden}
                  />
                  <Button 
                    variant="destructive" 
                    onClick={() => setBulkDeleteOpen(true)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    {t('admin.listings.delete')} ({selectedIds.size})
                  </Button>
                </>
              )}
              <Button variant="outline" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-2" />
                {t('admin.listings.export')} {selectedIds.size > 0 ? `(${selectedIds.size})` : t('admin.listings.exportAll').split(' ').pop()}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleMigrateImages} 
                disabled={isMigrating}
              >
                {isMigrating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('admin.listings.migrating')}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    {t('admin.listings.migrateImages')}
                  </>
                )}
              </Button>
              <label>
                <Button variant="outline" asChild disabled={isImporting}>
                  <span>
                    {isImporting ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        {t('admin.listings.importing')}
                      </>
                    ) : (
                      <>
                        <FileUp className="w-4 h-4 mr-2" />
                        {t('admin.listings.importCsv')}
                      </>
                    )}
                    <input type="file" accept=".csv" className="hidden" onChange={handleCsvFileSelect} disabled={isImporting} />
                  </span>
                </Button>
              </label>
              <Button variant="outline" onClick={() => setUrlImportOpen(true)}>
                <Globe className="w-4 h-4 mr-2" />
                {t('admin.listings.importUrl')}
              </Button>
              <Button asChild>
                <Link to="/admin/listings/new"><Plus className="w-4 h-4 mr-2" />{t('admin.listings.addListing')}</Link>
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input 
          placeholder={t('admin.listings.searchPlaceholder')} 
          value={search} 
          onChange={(e) => handleSearchChange(e.target.value)} 
          className="pl-10" 
        />
      </div>

      <ListingsFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Featured Properties Manager */}
      <div className="card-elevated p-6 mb-6">
        <FeaturedPropertiesManager />
      </div>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t('admin.listings.noProperties')}</p>
          <Button asChild>
            <Link to="/admin/listings/new">{t('admin.listings.addFirstProperty')}</Link>
          </Button>
        </div>
      ) : (
        <>
          <ListingsTable
            properties={paginatedProperties}
            selectedIds={selectedIds}
            canEditListings={canEditListings}
            sortField={sortField}
            sortDirection={sortDirection}
            onToggleSelect={toggleSelect}
            onToggleSelectAll={toggleSelectAll}
            onDelete={setDeleteTarget}
            onSort={handleSort}
          />
          
          <ListingsPagination
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            totalItems={sorted.length}
            onPageChange={setCurrentPage}
            onPageSizeChange={handlePageSizeChange}
          />
        </>
      )}

      {/* Single Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.listings.deleteProperty')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.listings.deletePropertyDesc', { title: deleteTarget?.title })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProperty.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('admin.listings.deleting')}
                </>
              ) : (
                t('admin.listings.delete')
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Bulk Delete Confirmation Dialog */}
      <AlertDialog open={bulkDeleteOpen} onOpenChange={setBulkDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.listings.bulkDeleteTitle', { count: selectedIds.size })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.listings.bulkDeleteDesc', { count: selectedIds.size })}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBulkDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteProperty.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t('admin.listings.deleting')}
                </>
              ) : (
                t('admin.listings.deleteCount', { count: selectedIds.size })
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* CSV Import Confirmation Dialog */}
      <AlertDialog open={importConfirmOpen} onOpenChange={setImportConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.listings.importTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('admin.listings.importDesc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <Button variant="outline" onClick={() => handleImportCsv(false)}>
              {t('admin.listings.addToExisting')}
            </Button>
            <AlertDialogAction
              onClick={() => handleImportCsv(true)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('admin.listings.clearAndImport')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Batch Import Dialog */}
      <BatchImportDialog
        open={batchImportOpen}
        onOpenChange={(open) => {
          setBatchImportOpen(open);
          if (!open) setPendingCsvContent(null);
        }}
        csvContent={pendingCsvContent}
        csvRowCount={csvRowCount}
        existingProperties={properties || []}
        onComplete={() => refetch()}
      />

      {/* URL Import Dialog */}
      <ImportFromUrlDialog
        open={urlImportOpen}
        onOpenChange={setUrlImportOpen}
      />
    </div>
  );
}
