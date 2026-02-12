import { useState } from 'react';
import { Sparkles, Copy, Trash2, Loader2, AlertCircle, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ParsedField {
  key: string;
  label: string;
  value: any;
  confidence: 'high' | 'medium' | 'low';
  isConflict: boolean;
}

interface PropertySandboxProps {
  title: string;
  existingData: Record<string, any>;
  onApplyParsed: (data: Record<string, any>) => void;
  onCopyToDescription: (text: string) => void;
}

const FIELD_LABELS: Record<string, string> = {
  bedrooms: 'Bedrooms',
  bathrooms: 'Bathrooms',
  garageSpaces: 'Garage Spaces',
  propertyType: 'Property Type',
  levels: 'Levels',
  constructionSizeSqm: 'Construction (m²)',
  landSizeSqm: 'Land Size (m²)',
  terraceSqm: 'Terrace (m²)',
  gardenSqm: 'Garden (m²)',
  storageSqm: 'Storage (m²)',
  buildingName: 'Building/Condo Name',
  locationName: 'Location',
  unitNumber: 'Unit Number',
  towerName: 'Tower',
  floorNumber: 'Floor Number',
  priceSale: 'Sale Price',
  priceRentMonthly: 'Monthly Rent',
  status: 'Listing Type',
  currency: 'Currency',
  hoaMonthly: 'HOA Monthly',
  yearBuilt: 'Year Built',
  yearRenovated: 'Year Renovated',
  propertyCondition: 'Condition',
  amenities: 'Amenities (detected)',
  features: 'Features (detected)',
  cleanedDescription: 'Public Description',
};

const STATUS_LABELS: Record<string, string> = {
  for_sale: 'For Sale',
  for_rent: 'For Rent',
  both: 'Sale & Rent',
};

// Readable labels for amenity/feature keys
const AMENITY_DISPLAY_LABELS: Record<string, string> = {
  pool: 'Pool',
  garden: 'Garden',
  security_system: 'Security System',
  central_ac: 'Central A/C',
  smart_home: 'Smart Home',
  gym: 'Gym',
  sauna: 'Sauna',
  home_theater: 'Home Theater',
  wine_cellar: 'Wine Cellar',
  staff_quarters: 'Staff Quarters',
  solar_panels: 'Solar Panels',
  backup_generator: 'Backup Generator',
  gated_entry: 'Gated Entry',
  concierge: 'Concierge',
  rooftop_terrace: 'Rooftop Terrace',
  outdoor_kitchen: 'Outdoor Kitchen',
  fire_pit: 'Fire Pit',
  private_beach_access: 'Private Beach Access',
  boat_dock: 'Boat Dock',
  helipad: 'Helipad',
  infinity_pool: 'Infinity Pool',
  spa: 'Spa/Jacuzzi',
  private_terrace: 'Private Terrace',
  business_center: 'Business Center',
  restaurant: 'Restaurant',
  yoga_pavilion: 'Yoga Pavilion',
  surf_equipment: 'Surf Equipment',
  microwave: 'Microwave',
  dishwasher: 'Dishwasher',
  washer_dryer: 'Washer/Dryer',
  air_conditioning: 'Air Conditioning',
  heating: 'Heating',
  elevator: 'Elevator',
  parking: 'Parking',
};

const FEATURE_DISPLAY_LABELS: Record<string, string> = {
  ocean_views: 'Ocean Views',
  mountain_views: 'Mountain Views',
  city_views: 'City Views',
  park_views: 'Park Views',
  jungle_setting: 'Jungle Setting',
  gated_community: 'Gated Community',
  near_international_schools: 'Near International Schools',
  walking_distance_shops: 'Walking Distance to Shops',
  pet_friendly: 'Pet Friendly',
  furnished: 'Furnished',
  high_ceilings: 'High Ceilings',
  open_floor_plan: 'Open Floor Plan',
  chefs_kitchen: "Chef's Kitchen",
  premium_finishes: 'Premium Finishes',
  eco_certified: 'Eco Certified',
  recently_renovated: 'Recently Renovated',
  direct_ocean_views: 'Direct Ocean Views',
  tropical_gardens: 'Tropical Gardens',
  road_access: 'Road Access',
  utilities_available: 'Utilities Available',
  beachfront: 'Beachfront',
  established_business: 'Established Business',
  staff_housing: 'Staff Housing',
};

export default function PropertySandbox({
  title,
  existingData,
  onApplyParsed,
  onCopyToDescription,
}: PropertySandboxProps) {
  const { toast } = useToast();
  const { user } = useAuth();
  const [sandboxText, setSandboxText] = useState('');
  const [isParsing, setIsParsing] = useState(false);
  const [parsedFields, setParsedFields] = useState<ParsedField[]>([]);
  const [selectedFields, setSelectedFields] = useState<Set<string>>(new Set());
  const [showPreview, setShowPreview] = useState(false);

  // Log audit entry for parse usage
  const logParseUsage = async (extractedFields: string[], appliedFields: string[]) => {
    if (!user?.id) return;
    
    try {
      await supabase.from('admin_audit_logs').insert({
        admin_user_id: user.id,
        action: 'parse_listing_used',
        target_type: 'property',
        target_name: title || 'New listing',
        details: {
          extracted_fields: extractedFields,
          applied_fields: appliedFields,
          text_length: sandboxText.length,
        },
      });
    } catch (error) {
      console.error('Failed to log audit entry:', error);
    }
  };

  const handleParse = async () => {
    if (!sandboxText.trim()) {
      toast({
        title: 'No text to parse',
        description: 'Please paste your property description in the sandbox first.',
        variant: 'destructive',
      });
      return;
    }

    setIsParsing(true);

    try {
      const { data, error } = await supabase.functions.invoke('parse-listing', {
        body: { title, sandboxText, existingData },
      });

      if (error) throw error;

      const { parsed, conflicts } = data;
      const fields: ParsedField[] = [];

      // Process parsed data into display format
      for (const [key, value] of Object.entries(parsed)) {
        if (key === 'confidence' || value === undefined || value === null) continue;
        
        // Handle arrays (amenities, features)
        if (Array.isArray(value) && value.length === 0) continue;

        fields.push({
          key,
          label: FIELD_LABELS[key] || key,
          value,
          confidence: parsed.confidence?.[key] || 'low',
          isConflict: conflicts?.includes(key) || false,
        });
      }

      setParsedFields(fields);
      // Pre-select non-conflicting fields
      setSelectedFields(new Set(fields.filter(f => !f.isConflict).map(f => f.key)));
      setShowPreview(true);
    } catch (error: any) {
      console.error('Parse error:', error);
      toast({
        title: 'Parse failed',
        description: error.message || 'Failed to analyze the listing text.',
        variant: 'destructive',
      });
    } finally {
      setIsParsing(false);
    }
  };

  const handleApply = async () => {
    const dataToApply: Record<string, any> = {};
    const appliedFieldKeys: string[] = [];
    
    for (const field of parsedFields) {
      if (selectedFields.has(field.key)) {
        // Map cleanedDescription to description field
        if (field.key === 'cleanedDescription') {
          dataToApply['description'] = field.value;
        } else {
          dataToApply[field.key] = field.value;
        }
        appliedFieldKeys.push(field.key);
      }
    }

    // Log audit entry
    await logParseUsage(
      parsedFields.map(f => f.key),
      appliedFieldKeys
    );

    onApplyParsed(dataToApply);
    setShowPreview(false);
    toast({
      title: 'Fields applied',
      description: `${selectedFields.size} fields populated from sandbox text.`,
    });
  };

  const handleCopyCleanedText = () => {
    // Clean up the text - remove extra whitespace, normalize line breaks
    const cleaned = sandboxText
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/[ \t]+/g, ' ')
      .trim();
    
    onCopyToDescription(cleaned);
    toast({
      title: 'Copied to description',
      description: 'Cleaned text has been added to the public description field.',
    });
  };

  const toggleField = (key: string) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFields(newSelected);
  };

  const formatValue = (key: string, value: any): string => {
    if (Array.isArray(value)) {
      // For amenities/features, show readable labels
      if (key === 'amenities') {
        const labels = value.map(v => AMENITY_DISPLAY_LABELS[v] || v);
        return labels.length > 4 ? `${labels.slice(0, 4).join(', ')}... (+${labels.length - 4} more)` : labels.join(', ');
      }
      if (key === 'features') {
        const labels = value.map(v => FEATURE_DISPLAY_LABELS[v] || v);
        return labels.length > 4 ? `${labels.slice(0, 4).join(', ')}... (+${labels.length - 4} more)` : labels.join(', ');
      }
      return value.length > 3 ? `${value.slice(0, 3).join(', ')}... (+${value.length - 3})` : value.join(', ');
    }
    if (key === 'priceSale' || key === 'priceRentMonthly' || key === 'hoaMonthly') {
      return `$${Number(value).toLocaleString()}`;
    }
    if (key === 'status') {
      return STATUS_LABELS[value] || value;
    }
    if (key === 'cleanedDescription') {
      // Show first 100 chars with preview
      const preview = String(value).slice(0, 100);
      return value.length > 100 ? `${preview}...` : preview;
    }
    return String(value);
  };

  const getConfidenceBadge = (confidence: 'high' | 'medium' | 'low') => {
    const styles = {
      high: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      low: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    };
    return <Badge variant="outline" className={styles[confidence]}>{confidence}</Badge>;
  };

  return (
    <section className="card-elevated p-6 space-y-4 border-2 border-dashed border-primary/30">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-serif text-xl font-semibold flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Sandbox – Paste Full Description
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Paste raw text from WhatsApp, email, notes, or old listings. The system will extract structured data.
          </p>
        </div>
      </div>

      <Textarea
        value={sandboxText}
        onChange={(e) => setSandboxText(e.target.value)}
        placeholder="Paste your property description here...

Example:
Beautiful 4 bedroom, 3.5 bathroom home in Escazú. 450m² construction on 800m² lot. Pool, garden, 2-car garage. Built in 2019. Asking $895,000 USD. Gated community with 24/7 security. Ocean and mountain views. Chef's kitchen with premium appliances..."
        className="min-h-[320px] resize-y font-mono text-sm"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          onClick={handleParse}
          disabled={isParsing || !sandboxText.trim()}
        >
          {isParsing ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4 mr-2" />
              Parse & Populate Listing
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleCopyCleanedText}
          disabled={!sandboxText.trim()}
        >
          <Copy className="w-4 h-4 mr-2" />
          Copy to Description
        </Button>

        <Button
          type="button"
          variant="ghost"
          onClick={() => setSandboxText('')}
          disabled={!sandboxText.trim()}
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Clear Sandbox
        </Button>
      </div>

      {/* Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              Extracted Data Preview
            </DialogTitle>
            <DialogDescription>
              Review the extracted fields. Uncheck any you don't want to apply. 
              Fields marked with ⚠️ will overwrite existing values.
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[400px] pr-4">
            {parsedFields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No structured data could be extracted from the text.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {parsedFields.map((field) => (
                  <div
                    key={field.key}
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      field.isConflict ? 'border-yellow-300 bg-yellow-50 dark:bg-yellow-950/30' : 'border-border'
                    }`}
                  >
                    <Checkbox
                      checked={selectedFields.has(field.key)}
                      onCheckedChange={() => toggleField(field.key)}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{field.label}</span>
                        {field.isConflict && (
                          <span className="text-yellow-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Overwrites existing
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground truncate">
                        {formatValue(field.key, field.value)}
                      </p>
                    </div>
                    {getConfidenceBadge(field.confidence)}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreview(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply} disabled={selectedFields.size === 0}>
              <Check className="w-4 h-4 mr-2" />
              Apply {selectedFields.size} Fields
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
