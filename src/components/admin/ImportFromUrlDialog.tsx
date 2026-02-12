import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Loader2, AlertTriangle, CheckCircle2, ImageOff, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateProperty } from '@/hooks/useProperties';
import { supabase } from '@/integrations/supabase/client';
import { PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS, PropertyStatus, PropertyType } from '@/types';

interface ImportedListing {
  title: string;
  description: string;
  features: string[];
  images: string[];
  priceSale: number | null;
  priceRentMonthly: number | null;
  bedrooms: number;
  bathrooms: number;
  status: string;
  listingSource: string;
  sourceUrl: string;
}

interface ImportResult {
  success: boolean;
  error?: string;
  listing?: ImportedListing;
  warnings?: string[];
  stats?: {
    imagesFound: number;
    imagesUploaded: number;
    imagesFailed: number;
    featuresFound: number;
  };
}

type Step = 'input' | 'fetching' | 'preview';

interface ImportFromUrlDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function ImportFromUrlDialog({ open, onOpenChange }: ImportFromUrlDialogProps) {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<Step>('input');
  const [result, setResult] = useState<ImportResult | null>(null);
  const [draft, setDraft] = useState<ImportedListing | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { toast } = useToast();
  const createProperty = useCreateProperty();
  const navigate = useNavigate();

  const reset = () => {
    setUrl('');
    setStep('input');
    setResult(null);
    setDraft(null);
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  const handleFetch = async () => {
    if (!url.trim()) return;
    setStep('fetching');
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('import-listing-url', {
        body: { url: url.trim() },
      });

      if (error) throw new Error(error.message);
      if (!data?.success) throw new Error(data?.error || 'Failed to fetch listing');

      setResult(data);
      setDraft({ ...data.listing });
      setStep('preview');
    } catch (err: any) {
      setResult({ success: false, error: err.message });
      setStep('input');
      toast({
        title: 'Import Failed',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const handleSaveDraft = async () => {
    if (!draft) return;
    setIsSaving(true);

    try {
      const propertyData = {
        title: draft.title || 'Imported Listing',
        description: draft.description,
        features: draft.features,
        images: draft.images,
        priceSale: draft.priceSale,
        priceRentMonthly: draft.priceRentMonthly,
        bedrooms: draft.bedrooms,
        bathrooms: draft.bathrooms,
        status: draft.status as PropertyStatus,
        listingSource: 'colleague' as const,
        internalNotes: `Imported from: ${draft.sourceUrl}`,
        // Defaults
        currency: 'USD',
        garageSpaces: 0,
        propertyType: 'house' as PropertyType,
        tier: 'mid' as const,
        amenities: [] as string[],
        featured: false,
        locationName: '',
        featuredImages: draft.images.slice(0, 5),
      };

      const created = await createProperty.mutateAsync(propertyData);

      toast({
        title: 'Draft saved',
        description: `"${created.title}" created as draft. You can now edit all details.`,
      });

      handleClose();
      navigate(`/admin/listings/${created.id}`);
    } catch (err: any) {
      toast({
        title: 'Save Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const updateDraft = (field: keyof ImportedListing, value: any) => {
    if (!draft) return;
    setDraft({ ...draft, [field]: value });
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-serif flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Import Listing from URL
          </DialogTitle>
          <DialogDescription>
            Paste a URL from another listing page. We'll extract the data and create a draft for your review.
          </DialogDescription>
        </DialogHeader>

        {/* Step 1: URL Input */}
        {(step === 'input' || step === 'fetching') && (
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label htmlFor="import-url">Listing URL</Label>
              <div className="flex gap-2">
                <Input
                  id="import-url"
                  type="url"
                  placeholder="https://example.com/property/123"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  disabled={step === 'fetching'}
                  onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
                />
                <Button
                  onClick={handleFetch}
                  disabled={!url.trim() || step === 'fetching'}
                >
                  {step === 'fetching' ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Fetching…
                    </>
                  ) : (
                    'Fetch Listing'
                  )}
                </Button>
              </div>
            </div>

            {step === 'fetching' && (
              <div className="text-sm text-muted-foreground flex items-center gap-2 py-4">
                <Loader2 className="w-4 h-4 animate-spin" />
                Downloading page and images… This may take a moment.
              </div>
            )}

            {result && !result.success && (
              <div className="flex items-start gap-2 p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                <span>{result.error}</span>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Preview & Edit */}
        {step === 'preview' && draft && result && (
          <div className="space-y-5 pt-2">
            {/* Warnings */}
            {result.warnings && result.warnings.length > 0 && (
                <div className="space-y-1 p-3 rounded-md bg-accent/50 border border-accent">
                <p className="text-sm font-medium text-foreground flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4" />
                  Extraction Notes
                </p>
                {result.warnings.map((w, i) => (
                  <p key={i} className="text-xs text-muted-foreground ml-5">• {w}</p>
                ))}
              </div>
            )}

            {/* Stats */}
            {result.stats && (
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                  {result.stats.imagesUploaded} images uploaded
                </Badge>
                {result.stats.imagesFailed > 0 && (
                  <Badge variant="outline" className="text-destructive border-destructive/30">
                    <ImageOff className="w-3 h-3 mr-1" />
                    {result.stats.imagesFailed} failed
                  </Badge>
                )}
                <Badge variant="secondary">{result.stats.featuresFound} features found</Badge>
                <Badge variant="outline">Source: Colleague</Badge>
              </div>
            )}

            {/* Editable Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input
                  value={draft.title}
                  onChange={(e) => updateDraft('title', e.target.value)}
                  placeholder="Property title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={draft.status}
                    onValueChange={(v) => updateDraft('status', v)}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(PROPERTY_STATUS_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Price (Sale)</Label>
                  <Input
                    type="number"
                    value={draft.priceSale ?? ''}
                    onChange={(e) => updateDraft('priceSale', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Rent/mo</Label>
                  <Input
                    type="number"
                    value={draft.priceRentMonthly ?? ''}
                    onChange={(e) => updateDraft('priceRentMonthly', e.target.value ? Number(e.target.value) : null)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bedrooms</Label>
                  <Input
                    type="number"
                    value={draft.bedrooms}
                    onChange={(e) => updateDraft('bedrooms', Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Bathrooms</Label>
                  <Input
                    type="number"
                    value={draft.bathrooms}
                    onChange={(e) => updateDraft('bathrooms', Number(e.target.value))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={draft.description}
                  onChange={(e) => updateDraft('description', e.target.value)}
                  rows={6}
                  placeholder="Property description…"
                />
              </div>

              {/* Features */}
              {draft.features.length > 0 && (
                <div className="space-y-2">
                  <Label>Extracted Features ({draft.features.length})</Label>
                  <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border rounded-md bg-muted/30">
                    {draft.features.map((f, i) => (
                      <Badge key={i} variant="secondary" className="text-xs gap-1">
                        {f}
                        <button
                          type="button"
                          onClick={() => updateDraft('features', draft.features.filter((_, j) => j !== i))}
                          className="ml-0.5 hover:text-destructive"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Images Preview */}
              {draft.images.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Images ({draft.images.length})</Label>
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto">
                    {draft.images.map((img, i) => (
                      <div key={i} className="relative group aspect-video rounded-md overflow-hidden border bg-muted">
                        <img src={img} alt={`Imported ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => updateDraft('images', draft.images.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                        {i === 0 && (
                          <span className="absolute bottom-1 left-1 text-[10px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded">
                            Hero
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="outline" onClick={() => { setStep('input'); setDraft(null); }}>
                Back
              </Button>
              <Button onClick={handleSaveDraft} disabled={isSaving}>
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving…
                  </>
                ) : (
                  'Save as Draft'
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
