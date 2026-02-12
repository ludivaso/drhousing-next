import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Save, Loader2, ChevronDown, ChevronUp, RotateCcw, Video } from 'lucide-react';
import ImageUpload from './ImageUpload';
import LocationPicker from './LocationPicker';
import PropertySandbox from './PropertySandbox';
import CreatableLocationSelect from './CreatableLocationSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { useAutosave } from '@/hooks/useAutosave';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateProperty, useUpdateProperty } from '@/hooks/useProperties';
import { useAgents } from '@/hooks/useAgents';
import {
  Property,
  PropertyStatus,
  PropertyType,
  PropertyTier,
  PropertyCondition,
  FurnishedStatus,
  PetPolicy,
  ParkingType,
  AreaSource,
  OwnershipType,
  PROPERTY_STATUS_LABELS,
  PROPERTY_TYPE_LABELS,
  PROPERTY_TIER_LABELS,
  PROPERTY_CONDITION_LABELS,
  FURNISHED_LABELS,
  PET_POLICY_LABELS,
  PARKING_TYPE_LABELS,
  AREA_SOURCE_LABELS,
  OWNERSHIP_TYPE_LABELS,
  COMMON_INCLUDED_SERVICES,
  COMMON_APPLIANCES,
} from '@/types';
import { COMMON_AMENITIES, COMMON_FEATURES } from '@/data/constants';

interface PropertyFormProps {
  property?: Property;
  mode: 'create' | 'edit';
}

// Simple collapsible section using state
function ExpandableSection({ 
  title, 
  isOpen,
  onToggle,
  optional = false,
  children
}: { 
  title: string; 
  isOpen: boolean;
  onToggle: () => void;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className="card-elevated p-6 space-y-4">
      <button 
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between py-2 hover:bg-muted/50 rounded-lg px-2 -mx-2 transition-colors"
      >
        <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
          {title}
          {optional && <span className="text-xs font-normal text-muted-foreground">(optional)</span>}
        </h2>
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
      </button>
      <div className={cn("space-y-4 pt-2", !isOpen && "hidden")}>
        {children}
      </div>
    </section>
  );
}

const initialFormData = {
  title: '',
  status: 'for_sale' as PropertyStatus,
  priceSale: '',
  priceRentMonthly: '',
  currency: 'USD',
  bedrooms: '0',
  bathrooms: '0',
  garageSpaces: '0',
  landSizeSqm: '',
  constructionSizeSqm: '',
  locationName: '',
  lat: '',
  lng: '',
  propertyType: 'house' as PropertyType,
  tier: 'mid' as PropertyTier,
  amenities: [] as string[],
  features: [] as string[],
  description: '',
  images: [] as string[],
  featuredImages: [] as string[],
  featured: false,
  listingAgentId: '',
  // YouTube Video
  youtubeUrl: '',
  youtubeEnabled: false,
  youtubeLabel: 'Video Tour',
  // New fields
  buildingName: '',
  unitNumber: '',
  towerName: '',
  floorNumber: '',
  internalReference: '',
  yearBuilt: '',
  yearRenovated: '',
  propertyCondition: 'good' as PropertyCondition,
  levels: '1',
  terraceSqm: '',
  gardenSqm: '',
  storageSqm: '',
  areaSource: '' as AreaSource | '',
  depositAmount: '',
  minLeaseMonths: '',
  includedServices: [] as string[],
  petPolicy: 'not_allowed' as PetPolicy,
  hoaMonthly: '',
  annualPropertyTax: '',
  folioReal: '',
  planoCatastrado: '',
  ownershipType: 'person' as OwnershipType,
  condoRegulationsAvailable: false,
  hasEncumbrances: false,
  encumbrancesNotes: '',
  availabilityDate: '',
  furnished: 'no' as FurnishedStatus,
  appliancesIncluded: [] as string[],
  parkingType: '' as ParkingType | '',
  hasStorage: false,
  internalNotes: '',
  // Price Improvement
  originalPrice: '',
  priceNote: '',
  priceUpdatedAt: '',
};

export default function PropertyForm({ property, mode }: PropertyFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const createProperty = useCreateProperty();
  const updateProperty = useUpdateProperty();
  const { data: agents } = useAgents();

  const [formData, setFormData] = useState(() => {
    if (property) {
      return {
        title: property.title,
        status: property.status,
        priceSale: property.priceSale?.toString() || '',
        priceRentMonthly: property.priceRentMonthly?.toString() || '',
        currency: property.currency,
        bedrooms: property.bedrooms.toString(),
        bathrooms: property.bathrooms.toString(),
        garageSpaces: property.garageSpaces.toString(),
        landSizeSqm: property.landSizeSqm?.toString() || '',
        constructionSizeSqm: property.constructionSizeSqm?.toString() || '',
        locationName: property.locationName,
        lat: property.lat?.toString() || '',
        lng: property.lng?.toString() || '',
        propertyType: property.propertyType,
        tier: property.tier,
        amenities: property.amenities,
        features: property.features,
        description: property.description,
        images: property.images,
        featuredImages: property.featuredImages || [],
        featured: property.featured,
        listingAgentId: property.listingAgentId || '',
        // YouTube Video
        youtubeUrl: property.youtubeUrl || '',
        youtubeEnabled: property.youtubeEnabled || false,
        youtubeLabel: property.youtubeLabel || 'Video Tour',
        // New fields
        buildingName: property.buildingName || '',
        unitNumber: property.unitNumber || '',
        towerName: property.towerName || '',
        floorNumber: property.floorNumber?.toString() || '',
        internalReference: property.internalReference || '',
        yearBuilt: property.yearBuilt?.toString() || '',
        yearRenovated: property.yearRenovated?.toString() || '',
        propertyCondition: property.propertyCondition,
        levels: property.levels.toString(),
        terraceSqm: property.terraceSqm?.toString() || '',
        gardenSqm: property.gardenSqm?.toString() || '',
        storageSqm: property.storageSqm?.toString() || '',
        areaSource: property.areaSource || '',
        depositAmount: property.depositAmount?.toString() || '',
        minLeaseMonths: property.minLeaseMonths?.toString() || '',
        includedServices: property.includedServices,
        petPolicy: property.petPolicy,
        hoaMonthly: property.hoaMonthly?.toString() || '',
        annualPropertyTax: property.annualPropertyTax?.toString() || '',
        folioReal: property.folioReal || '',
        planoCatastrado: property.planoCatastrado || '',
        ownershipType: property.ownershipType,
        condoRegulationsAvailable: property.condoRegulationsAvailable,
        hasEncumbrances: property.hasEncumbrances,
        encumbrancesNotes: property.encumbrancesNotes || '',
        availabilityDate: property.availabilityDate || '',
        furnished: property.furnished,
        appliancesIncluded: property.appliancesIncluded,
        parkingType: property.parkingType || '',
        hasStorage: property.hasStorage,
        internalNotes: property.internalNotes || '',
        // Price Improvement
        originalPrice: property.originalPrice?.toString() || '',
        priceNote: property.priceNote || '',
        priceUpdatedAt: property.priceUpdatedAt ? property.priceUpdatedAt.split('T')[0] : '',
      };
    }
    return initialFormData;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customLocations, setCustomLocations] = useState<string[]>([]);
  const [showDraftRecovery, setShowDraftRecovery] = useState(false);
  
  // Autosave functionality
  const { loadDraft, clearDraft, hasDraft, getDraftTimestamp } = useAutosave(formData, {
    propertyId: property?.id,
    enabled: true,
  });

  // Check for saved draft on mount
  useEffect(() => {
    if (mode === 'create' && hasDraft()) {
      setShowDraftRecovery(true);
    }
  }, [mode, hasDraft]);

  const handleRestoreDraft = () => {
    const draft = loadDraft();
    if (draft) {
      setFormData(draft);
      setShowDraftRecovery(false);
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowDraftRecovery(false);
  };
  
  // Collapsible section states
  const [openSections, setOpenSections] = useState({
    identity: true,
    areas: true,
    rental: false,
    legal: false,
    operations: false,
  });

  const toggleSection = (section: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = useCallback((field: string, value: string | boolean | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const toggleArrayItem = useCallback((field: 'amenities' | 'features' | 'includedServices' | 'appliancesIncluded', item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  }, []);

  // Handle parsed data from sandbox
  const handleApplyParsed = useCallback((parsedData: Record<string, any>) => {
    setFormData((prev) => {
      const updated = { ...prev };
      
      for (const [key, value] of Object.entries(parsedData)) {
        if (key === 'amenities' || key === 'features') {
          // Merge arrays without duplicates
          const existing = prev[key as 'amenities' | 'features'];
          const merged = [...new Set([...existing, ...(value as string[])])];
          (updated as any)[key] = merged;
        } else if (typeof value === 'number') {
          (updated as any)[key] = value.toString();
        } else {
          (updated as any)[key] = value;
        }
      }
      
      return updated;
    });
  }, []);

  const handleCopyToDescription = useCallback((text: string) => {
    setFormData((prev) => ({
      ...prev,
      description: prev.description ? `${prev.description}\n\n${text}` : text,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const propertyData: Partial<Property> = {
      title: formData.title,
      status: formData.status,
      priceSale: formData.priceSale ? parseFloat(formData.priceSale) : null,
      priceRentMonthly: formData.priceRentMonthly ? parseFloat(formData.priceRentMonthly) : null,
      currency: formData.currency,
      bedrooms: parseInt(formData.bedrooms) || 0,
      bathrooms: parseFloat(formData.bathrooms) || 0,
      garageSpaces: parseInt(formData.garageSpaces) || 0,
      landSizeSqm: formData.landSizeSqm ? parseFloat(formData.landSizeSqm) : null,
      constructionSizeSqm: formData.constructionSizeSqm ? parseFloat(formData.constructionSizeSqm) : null,
      locationName: formData.locationName,
      lat: formData.lat ? parseFloat(formData.lat) : null,
      lng: formData.lng ? parseFloat(formData.lng) : null,
      propertyType: formData.propertyType,
      tier: formData.tier,
      amenities: formData.amenities,
      features: formData.features,
      description: formData.description,
      images: formData.images,
      featuredImages: formData.featuredImages,
      featured: formData.featured,
      listingAgentId: formData.listingAgentId || null,
      // YouTube Video
      youtubeUrl: formData.youtubeUrl || null,
      youtubeEnabled: formData.youtubeEnabled,
      youtubeLabel: formData.youtubeLabel || 'Video Tour',
      // New fields
      buildingName: formData.buildingName || null,
      unitNumber: formData.unitNumber || null,
      towerName: formData.towerName || null,
      floorNumber: formData.floorNumber ? parseInt(formData.floorNumber) : null,
      internalReference: formData.internalReference || null,
      yearBuilt: formData.yearBuilt ? parseInt(formData.yearBuilt) : null,
      yearRenovated: formData.yearRenovated ? parseInt(formData.yearRenovated) : null,
      propertyCondition: formData.propertyCondition,
      levels: parseInt(formData.levels) || 1,
      terraceSqm: formData.terraceSqm ? parseFloat(formData.terraceSqm) : null,
      gardenSqm: formData.gardenSqm ? parseFloat(formData.gardenSqm) : null,
      storageSqm: formData.storageSqm ? parseFloat(formData.storageSqm) : null,
      areaSource: formData.areaSource ? (formData.areaSource as AreaSource) : null,
      depositAmount: formData.depositAmount ? parseFloat(formData.depositAmount) : null,
      minLeaseMonths: formData.minLeaseMonths ? parseInt(formData.minLeaseMonths) : null,
      includedServices: formData.includedServices,
      petPolicy: formData.petPolicy,
      hoaMonthly: formData.hoaMonthly ? parseFloat(formData.hoaMonthly) : null,
      annualPropertyTax: formData.annualPropertyTax ? parseFloat(formData.annualPropertyTax) : null,
      folioReal: formData.folioReal || null,
      planoCatastrado: formData.planoCatastrado || null,
      ownershipType: formData.ownershipType,
      condoRegulationsAvailable: formData.condoRegulationsAvailable,
      hasEncumbrances: formData.hasEncumbrances,
      encumbrancesNotes: formData.encumbrancesNotes || null,
      availabilityDate: formData.availabilityDate || null,
      furnished: formData.furnished,
      appliancesIncluded: formData.appliancesIncluded,
      parkingType: formData.parkingType ? (formData.parkingType as ParkingType) : null,
      hasStorage: formData.hasStorage,
      internalNotes: formData.internalNotes || null,
      // Price Improvement
      originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : null,
      priceNote: formData.priceNote || null,
      priceUpdatedAt: formData.priceUpdatedAt || null,
    };

    try {
      if (mode === 'edit' && property) {
        await updateProperty.mutateAsync({ id: property.id, ...propertyData });
        toast({ title: 'Property updated', description: 'Changes saved successfully.' });
      } else {
        await createProperty.mutateAsync(propertyData);
        toast({ title: 'Property created', description: 'New listing added successfully.' });
      }
      // Clear draft on successful save
      clearDraft();
      navigate('/admin/listings');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save property.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const draftTimestamp = getDraftTimestamp();

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Draft Recovery Banner */}
      {showDraftRecovery && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <RotateCcw className="w-5 h-5 text-primary" />
            <div>
              <p className="font-medium text-sm">Unsaved draft found</p>
              <p className="text-xs text-muted-foreground">
                {draftTimestamp 
                  ? `Last saved: ${draftTimestamp.toLocaleString()}`
                  : 'You have an unsaved draft from a previous session.'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" size="sm" onClick={handleDiscardDraft}>
              Discard
            </Button>
            <Button type="button" size="sm" onClick={handleRestoreDraft}>
              Restore Draft
            </Button>
          </div>
        </div>
      )}

      {/* Sandbox Section */}
      <PropertySandbox
        title={formData.title}
        existingData={formData}
        onApplyParsed={handleApplyParsed}
        onCopyToDescription={handleCopyToDescription}
      />

      {/* Basic Info */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => handleChange('title', e.target.value)}
              placeholder="Modern Family Home in Escazú Hills"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Status *</label>
            <Select value={formData.status} onValueChange={(v) => handleChange('status', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Property Type *</label>
            <Select value={formData.propertyType} onValueChange={(v) => handleChange('propertyType', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Tier *</label>
            <Select value={formData.tier} onValueChange={(v) => handleChange('tier', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_TIER_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Location *</label>
            <CreatableLocationSelect
              value={formData.locationName}
              onChange={(v) => handleChange('locationName', v)}
              customLocations={customLocations}
              onAddCustomLocation={(loc) => setCustomLocations(prev => [...prev, loc])}
            />
          </div>
        </div>
      </section>

      {/* Description - Large resizable */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Public Description</h2>
        <p className="text-sm text-muted-foreground">
          This description will be visible on the website.
        </p>
        <Textarea
          value={formData.description}
          onChange={(e) => handleChange('description', e.target.value)}
          placeholder="Describe the property in detail..."
          className="min-h-[320px] resize-y"
        />
      </section>

      {/* Property Identity */}
      <ExpandableSection
        title="Property Identity"
        isOpen={openSections.identity}
        onToggle={() => toggleSection('identity')}
        optional
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Building / Condo Name</label>
            <Input
              value={formData.buildingName}
              onChange={(e) => handleChange('buildingName', e.target.value)}
              placeholder="Torres del Valle"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Unit Number</label>
            <Input
              value={formData.unitNumber}
              onChange={(e) => handleChange('unitNumber', e.target.value)}
              placeholder="12A"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Tower</label>
            <Input
              value={formData.towerName}
              onChange={(e) => handleChange('towerName', e.target.value)}
              placeholder="Tower B"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Floor Number</label>
            <Input
              type="number"
              value={formData.floorNumber}
              onChange={(e) => handleChange('floorNumber', e.target.value)}
              placeholder="5"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Internal Reference (SKU)</label>
            <Input
              value={formData.internalReference}
              onChange={(e) => handleChange('internalReference', e.target.value)}
              placeholder="DRH-2024-001"
            />
          </div>
        </div>
      </ExpandableSection>

      {/* Property Specs */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Property Specifications</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Bedrooms</label>
            <Input
              type="number"
              min="0"
              value={formData.bedrooms}
              onChange={(e) => handleChange('bedrooms', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Bathrooms</label>
            <Input
              type="number"
              min="0"
              step="0.5"
              value={formData.bathrooms}
              onChange={(e) => handleChange('bathrooms', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Garage Spaces</label>
            <Input
              type="number"
              min="0"
              value={formData.garageSpaces}
              onChange={(e) => handleChange('garageSpaces', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Levels</label>
            <Input
              type="number"
              min="1"
              value={formData.levels}
              onChange={(e) => handleChange('levels', e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Year Built</label>
            <Input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.yearBuilt}
              onChange={(e) => handleChange('yearBuilt', e.target.value)}
              placeholder="2020"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Year Renovated</label>
            <Input
              type="number"
              min="1900"
              max={new Date().getFullYear()}
              value={formData.yearRenovated}
              onChange={(e) => handleChange('yearRenovated', e.target.value)}
              placeholder="2023"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Condition</label>
            <Select value={formData.propertyCondition} onValueChange={(v) => handleChange('propertyCondition', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PROPERTY_CONDITION_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Furnished</label>
            <Select value={formData.furnished} onValueChange={(v) => handleChange('furnished', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FURNISHED_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Areas */}
      <ExpandableSection
        title="Areas (m²)"
        isOpen={openSections.areas}
        onToggle={() => toggleSection('areas')}
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Construction</label>
            <Input
              type="number"
              value={formData.constructionSizeSqm}
              onChange={(e) => handleChange('constructionSizeSqm', e.target.value)}
              placeholder="380"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Land / Lot</label>
            <Input
              type="number"
              value={formData.landSizeSqm}
              onChange={(e) => handleChange('landSizeSqm', e.target.value)}
              placeholder="800"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Terrace / Balcony</label>
            <Input
              type="number"
              value={formData.terraceSqm}
              onChange={(e) => handleChange('terraceSqm', e.target.value)}
              placeholder="45"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Garden</label>
            <Input
              type="number"
              value={formData.gardenSqm}
              onChange={(e) => handleChange('gardenSqm', e.target.value)}
              placeholder="200"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Storage / Bodega</label>
            <Input
              type="number"
              value={formData.storageSqm}
              onChange={(e) => handleChange('storageSqm', e.target.value)}
              placeholder="15"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Area Source</label>
            <Select value={formData.areaSource} onValueChange={(v) => handleChange('areaSource', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AREA_SOURCE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </ExpandableSection>

      {/* Pricing */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Pricing</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Currency</label>
            <Select value={formData.currency} onValueChange={(v) => handleChange('currency', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="CRC">CRC (Colón)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Sale Price</label>
            <Input
              type="number"
              value={formData.priceSale}
              onChange={(e) => handleChange('priceSale', e.target.value)}
              placeholder="895000"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Monthly Rent</label>
            <Input
              type="number"
              value={formData.priceRentMonthly}
              onChange={(e) => handleChange('priceRentMonthly', e.target.value)}
              placeholder="2500"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">HOA Monthly</label>
            <Input
              type="number"
              value={formData.hoaMonthly}
              onChange={(e) => handleChange('hoaMonthly', e.target.value)}
              placeholder="350"
            />
          </div>
        </div>

        {/* Price Improvement Fields */}
        <div className="border-t border-border pt-4 mt-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Price Improvement</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Original Price</label>
              <Input
                type="number"
                value={formData.originalPrice}
                onChange={(e) => handleChange('originalPrice', e.target.value)}
                placeholder="950000"
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty if no price change</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Price Note</label>
              <Input
                value={formData.priceNote}
                onChange={(e) => handleChange('priceNote', e.target.value)}
                placeholder="Price Improvement"
              />
              <p className="text-xs text-muted-foreground mt-1">e.g. "Price Improvement", "Seller Open to Offers"</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-1 block">Price Updated</label>
              <Input
                type="date"
                value={formData.priceUpdatedAt}
                onChange={(e) => handleChange('priceUpdatedAt', e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Rental Details */}
      <ExpandableSection
        title="Rental Details"
        isOpen={openSections.rental}
        onToggle={() => toggleSection('rental')}
        optional
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Deposit Amount</label>
            <Input
              type="number"
              value={formData.depositAmount}
              onChange={(e) => handleChange('depositAmount', e.target.value)}
              placeholder="5000"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Min. Lease (months)</label>
            <Input
              type="number"
              min="1"
              value={formData.minLeaseMonths}
              onChange={(e) => handleChange('minLeaseMonths', e.target.value)}
              placeholder="12"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Pet Policy</label>
            <Select value={formData.petPolicy} onValueChange={(v) => handleChange('petPolicy', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PET_POLICY_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Included Services</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_INCLUDED_SERVICES.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => toggleArrayItem('includedServices', service)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  formData.includedServices.includes(service)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                {service.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
      </ExpandableSection>

      {/* Legal (Costa Rica) */}
      <ExpandableSection
        title="Legal Information"
        isOpen={openSections.legal}
        onToggle={() => toggleSection('legal')}
        optional
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Folio Real</label>
            <Input
              value={formData.folioReal}
              onChange={(e) => handleChange('folioReal', e.target.value)}
              placeholder="1-123456-000"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Plano Catastrado</label>
            <Input
              value={formData.planoCatastrado}
              onChange={(e) => handleChange('planoCatastrado', e.target.value)}
              placeholder="SJ-123456-2020"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Ownership Type</label>
            <Select value={formData.ownershipType} onValueChange={(v) => handleChange('ownershipType', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OWNERSHIP_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.condoRegulationsAvailable}
              onCheckedChange={(v) => handleChange('condoRegulationsAvailable', v)}
            />
            <label className="text-sm font-medium">Condo Regulations Available</label>
          </div>
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.hasEncumbrances}
              onCheckedChange={(v) => handleChange('hasEncumbrances', v)}
            />
            <label className="text-sm font-medium">Has Encumbrances</label>
          </div>
        </div>
        {formData.hasEncumbrances && (
          <div>
            <label className="text-sm font-medium mb-1 block">Encumbrance Notes</label>
            <Textarea
              value={formData.encumbrancesNotes}
              onChange={(e) => handleChange('encumbrancesNotes', e.target.value)}
              placeholder="Describe any liens, mortgages, or restrictions..."
              rows={3}
            />
          </div>
        )}
      </ExpandableSection>

      {/* Operations */}
      <ExpandableSection
        title="Operations & Marketing"
        isOpen={openSections.operations}
        onToggle={() => toggleSection('operations')}
        optional
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Availability Date</label>
            <Input
              type="date"
              value={formData.availabilityDate}
              onChange={(e) => handleChange('availabilityDate', e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">Parking Type</label>
            <Select value={formData.parkingType} onValueChange={(v) => handleChange('parkingType', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PARKING_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3 pt-6">
            <Switch
              checked={formData.hasStorage}
              onCheckedChange={(v) => handleChange('hasStorage', v)}
            />
            <label className="text-sm font-medium">Has Storage / Bodega</label>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-2 block">Appliances Included</label>
          <div className="flex flex-wrap gap-2">
            {COMMON_APPLIANCES.map((appliance) => (
              <button
                key={appliance}
                type="button"
                onClick={() => toggleArrayItem('appliancesIncluded', appliance)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                  formData.appliancesIncluded.includes(appliance)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-primary/50'
                }`}
              >
                {appliance.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Internal Notes (NOT public)</label>
          <Textarea
            value={formData.internalNotes}
            onChange={(e) => handleChange('internalNotes', e.target.value)}
            placeholder="Notes visible only to team members..."
            rows={3}
            className="bg-muted/50"
          />
        </div>
      </ExpandableSection>

      {/* Location */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Property Location</h2>
        <LocationPicker
          lat={formData.lat}
          lng={formData.lng}
          onLocationChange={(lat, lng) => {
            handleChange('lat', lat);
            handleChange('lng', lng);
          }}
        />
      </section>

      {/* Amenities */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Amenities</h2>
        <div className="flex flex-wrap gap-2">
          {COMMON_AMENITIES.map((amenityKey) => (
            <button
              key={amenityKey}
              type="button"
              onClick={() => toggleArrayItem('amenities', amenityKey)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.amenities.includes(amenityKey)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {t(`amenities.${amenityKey}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Features</h2>
        <div className="flex flex-wrap gap-2">
          {COMMON_FEATURES.map((featureKey) => (
            <button
              key={featureKey}
              type="button"
              onClick={() => toggleArrayItem('features', featureKey)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.features.includes(featureKey)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {t(`features.${featureKey}`)}
            </button>
          ))}
        </div>
      </section>

      {/* Property Images */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Property Images</h2>
        <p className="text-sm text-muted-foreground">
          Images 1–5 will be displayed in the main gallery. Image 1 is the Hero.
        </p>
        <ImageUpload
          images={formData.images}
          onImagesChange={(images) => handleChange('images', images)}
        />
      </section>

      {/* Media - YouTube Video */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
          <Video className="w-5 h-5" />
          Media
        </h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={formData.youtubeEnabled}
              onCheckedChange={(v) => handleChange('youtubeEnabled', v)}
            />
            <label className="text-sm font-medium">Enable Video Tour</label>
          </div>
          
          {formData.youtubeEnabled && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="text-sm font-medium mb-1 block">YouTube Video URL</label>
                <Input
                  value={formData.youtubeUrl}
                  onChange={(e) => handleChange('youtubeUrl', e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Paste the full YouTube URL (supports youtube.com/watch, youtu.be, and shorts)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Video Label</label>
                <Input
                  value={formData.youtubeLabel}
                  onChange={(e) => handleChange('youtubeLabel', e.target.value)}
                  placeholder="Video Tour"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Displayed on the video thumbnail (default: "Video Tour")
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Agent & Featured */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Assignment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium mb-1 block">Listing Agent</label>
            <Select value={formData.listingAgentId || undefined} onValueChange={(v) => handleChange('listingAgentId', v)}>
              <SelectTrigger>
                <SelectValue placeholder="Select agent" />
              </SelectTrigger>
              <SelectContent>
                {agents?.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>{agent.fullName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              checked={formData.featured}
              onCheckedChange={(v) => handleChange('featured', v)}
            />
            <label className="text-sm font-medium">Featured Property</label>
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4 sticky bottom-4 bg-background/95 backdrop-blur p-4 rounded-lg shadow-lg border">
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'edit' ? 'Update Property' : 'Create Property'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" size="lg" onClick={() => navigate('/admin/listings')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
