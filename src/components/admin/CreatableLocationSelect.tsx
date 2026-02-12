import { useState, useMemo } from 'react';
import { Check, ChevronsUpDown, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { COSTA_RICA_AREAS } from '@/data/constants';

interface CreatableLocationSelectProps {
  value: string;
  onChange: (value: string) => void;
  customLocations?: string[];
  onAddCustomLocation?: (location: string) => void;
}

export default function CreatableLocationSelect({
  value,
  onChange,
  customLocations = [],
  onAddCustomLocation,
}: CreatableLocationSelectProps) {
  const [open, setOpen] = useState(false);
  const [showNewDialog, setShowNewDialog] = useState(false);
  const [newLocation, setNewLocation] = useState('');
  const [searchValue, setSearchValue] = useState('');

  // Combine default areas with custom ones
  const allLocations = useMemo(() => {
    const combined = new Set([...COSTA_RICA_AREAS, ...customLocations]);
    return Array.from(combined).sort();
  }, [customLocations]);

  // Filter locations based on search
  const filteredLocations = useMemo(() => {
    if (!searchValue) return allLocations;
    const search = searchValue.toLowerCase();
    return allLocations.filter((loc) => loc.toLowerCase().includes(search));
  }, [allLocations, searchValue]);

  const handleAddLocation = () => {
    if (newLocation.trim()) {
      const trimmed = newLocation.trim();
      onAddCustomLocation?.(trimmed);
      onChange(trimmed);
      setNewLocation('');
      setShowNewDialog(false);
      setOpen(false);
    }
  };

  const showCreateOption = searchValue && !allLocations.some(
    (loc) => loc.toLowerCase() === searchValue.toLowerCase()
  );

  return (
    <>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value || 'Select location...'}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create location..."
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty className="py-2">
                {showCreateOption ? (
                  <button
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-left hover:bg-accent rounded-md"
                    onClick={() => {
                      setNewLocation(searchValue);
                      setShowNewDialog(true);
                    }}
                  >
                    <Plus className="w-4 h-4" />
                    Create "{searchValue}"
                  </button>
                ) : (
                  <span className="px-4 text-muted-foreground">No locations found.</span>
                )}
              </CommandEmpty>
              <CommandGroup>
                {filteredLocations.map((location) => (
                  <CommandItem
                    key={location}
                    value={location}
                    onSelect={() => {
                      onChange(location);
                      setOpen(false);
                      setSearchValue('');
                    }}
                  >
                    <Check
                      className={cn(
                        'mr-2 h-4 w-4',
                        value === location ? 'opacity-100' : 'opacity-0'
                      )}
                    />
                    {location}
                    {customLocations.includes(location) && (
                      <span className="ml-auto text-xs text-muted-foreground">Custom</span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
              {showCreateOption && filteredLocations.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => {
                        setNewLocation(searchValue);
                        setShowNewDialog(true);
                      }}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Create "{searchValue}"
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* New Location Dialog */}
      <Dialog open={showNewDialog} onOpenChange={setShowNewDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Location</DialogTitle>
            <DialogDescription>
              Create a custom location that will be available in the dropdown.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="location-name">Location Name</Label>
              <Input
                id="location-name"
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g., Hacienda Los Reyes, Distrito 4"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLocation} disabled={!newLocation.trim()}>
              Add Location
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
