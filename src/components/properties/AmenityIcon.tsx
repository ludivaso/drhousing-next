import {
  Waves, // pool, infinity_pool
  TreeDeciduous, // garden, tropical_gardens
  Shield, // security_system, gated_entry
  Wind, // central_ac, air_conditioning
  Smartphone, // smart_home
  Dumbbell, // gym
  Thermometer, // sauna
  Tv, // home_theater
  Wine, // wine_cellar
  Users, // staff_quarters, staff_housing
  Sun, // solar_panels
  Zap, // backup_generator
  Briefcase, // business_center
  Building2, // concierge
  Home, // rooftop_terrace, private_terrace
  UtensilsCrossed, // outdoor_kitchen, restaurant, chefs_kitchen
  Flame, // fire_pit
  Anchor, // private_beach_access, boat_dock, beachfront
  Plane, // helipad
  Sparkles, // spa
  Activity, // yoga_pavilion
  Waves as Surf, // surf_equipment
  Microwave, // microwave
  CircleDot, // dishwasher
  WashingMachine, // washer_dryer
  Heater, // heating
  ArrowUp, // elevator
  Car, // parking
  Mountain, // mountain_views
  Building, // city_views
  TreePine, // park_views, jungle_setting
  Lock, // gated_community
  GraduationCap, // near_international_schools
  Store, // walking_distance_shops
  PawPrint, // pet_friendly
  Sofa, // furnished
  ArrowUpFromLine, // high_ceilings
  LayoutDashboard, // open_floor_plan
  Award, // premium_finishes
  Leaf, // eco_certified
  Wrench, // recently_renovated
  Eye, // ocean_views, direct_ocean_views
  Route, // road_access
  Plug, // utilities_available
  Briefcase as Business, // established_business
  LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Map amenity/feature keys to icons
const AMENITY_ICON_MAP: Record<string, LucideIcon> = {
  // Pools & Water
  pool: Waves,
  infinity_pool: Waves,
  
  // Gardens & Nature
  garden: TreeDeciduous,
  tropical_gardens: TreeDeciduous,
  jungle_setting: TreePine,
  park_views: TreePine,
  
  // Security
  security_system: Shield,
  gated_entry: Lock,
  gated_community: Lock,
  
  // Climate
  central_ac: Wind,
  air_conditioning: Wind,
  heating: Heater,
  
  // Tech
  smart_home: Smartphone,
  
  // Fitness & Wellness
  gym: Dumbbell,
  sauna: Thermometer,
  spa: Sparkles,
  yoga_pavilion: Activity,
  
  // Entertainment
  home_theater: Tv,
  
  // Food & Drink
  wine_cellar: Wine,
  outdoor_kitchen: UtensilsCrossed,
  restaurant: UtensilsCrossed,
  chefs_kitchen: UtensilsCrossed,
  microwave: Microwave,
  dishwasher: CircleDot,
  
  // Staff & Business
  staff_quarters: Users,
  staff_housing: Users,
  business_center: Briefcase,
  concierge: Building2,
  established_business: Business,
  
  // Energy
  solar_panels: Sun,
  backup_generator: Zap,
  utilities_available: Plug,
  
  // Outdoor
  rooftop_terrace: Home,
  private_terrace: Home,
  fire_pit: Flame,
  
  // Beach & Water
  private_beach_access: Anchor,
  boat_dock: Anchor,
  beachfront: Anchor,
  surf_equipment: Surf,
  
  // Transport
  helipad: Plane,
  elevator: ArrowUp,
  parking: Car,
  road_access: Route,
  
  // Laundry
  washer_dryer: WashingMachine,
  
  // Views
  ocean_views: Eye,
  direct_ocean_views: Eye,
  mountain_views: Mountain,
  city_views: Building,
  
  // Location & Schools
  near_international_schools: GraduationCap,
  walking_distance_shops: Store,
  
  // Lifestyle
  pet_friendly: PawPrint,
  furnished: Sofa,
  
  // Architecture
  high_ceilings: ArrowUpFromLine,
  open_floor_plan: LayoutDashboard,
  premium_finishes: Award,
  
  // Sustainability
  eco_certified: Leaf,
  recently_renovated: Wrench,
};

interface AmenityIconProps {
  amenityKey: string;
  className?: string;
  size?: number;
}

export function AmenityIcon({ amenityKey, className, size = 16 }: AmenityIconProps) {
  const Icon = AMENITY_ICON_MAP[amenityKey];
  
  if (!Icon) {
    return null;
  }
  
  return <Icon className={cn('shrink-0', className)} size={size} />;
}

export function hasAmenityIcon(amenityKey: string): boolean {
  return amenityKey in AMENITY_ICON_MAP;
}
