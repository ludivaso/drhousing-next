import type { TFunction } from 'i18next';
import type { PropertyStatus, PropertyTier, PropertyType } from '@/types';

export function getStatusLabel(t: TFunction, status: PropertyStatus) {
  return t(`property.status.${status}`);
}

export function getTierLabel(t: TFunction, tier: PropertyTier) {
  return t(`property.tier.${tier}`);
}

export function getTypeLabel(t: TFunction, type: PropertyType) {
  return t(`property.type.${type}`);
}
