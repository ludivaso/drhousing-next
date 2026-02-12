import { Lead, LEAD_TYPE_LABELS, LEAD_STATUS_LABELS, TIMELINE_LABELS, CONTACT_METHOD_LABELS, Property, PROPERTY_STATUS_LABELS, PROPERTY_TYPE_LABELS, PROPERTY_TIER_LABELS } from '@/types';

function downloadCSV(csvContent: string, filename: string) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSVCell(cell: string | number | null | undefined): string {
  const cellStr = String(cell ?? '');
  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n')) {
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  return cellStr;
}

export function exportLeadsToCSV(leads: Lead[], filename = 'leads-export.csv') {
  const headers = [
    'Full Name',
    'Email',
    'Phone',
    'Status',
    'Lead Type',
    'Timeline',
    'Preferred Contact',
    'Country of Origin',
    'Budget Min',
    'Budget Max',
    'Property Type Interest',
    'Interested Areas',
    'Message',
    'Notes',
    'Created At',
    'Last Contacted',
    'Assigned Agent',
  ];

  const rows = leads.map(lead => [
    lead.fullName,
    lead.email,
    lead.phone || '',
    LEAD_STATUS_LABELS[lead.status] || lead.status,
    LEAD_TYPE_LABELS[lead.leadType] || lead.leadType,
    TIMELINE_LABELS[lead.timeline] || lead.timeline,
    CONTACT_METHOD_LABELS[lead.preferredContactMethod] || lead.preferredContactMethod,
    lead.countryOfOrigin || '',
    lead.budgetMin?.toString() || '',
    lead.budgetMax?.toString() || '',
    lead.interestedPropertyType || '',
    (lead.interestedAreas || []).join('; '),
    lead.message || '',
    lead.notes || '',
    new Date(lead.createdAt).toLocaleString(),
    lead.lastContactedAt ? new Date(lead.lastContactedAt).toLocaleString() : '',
    lead.assignedAgentId || '',
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSVCell).join(',')),
  ].join('\n');

  downloadCSV(csvContent, filename);
}

export function exportPropertiesToCSV(properties: Property[], filename = 'properties-export.csv') {
  const headers = [
    'Title',
    'Status',
    'Type',
    'Tier',
    'Sale Price',
    'Rent/Month',
    'Currency',
    'Bedrooms',
    'Bathrooms',
    'Garage Spaces',
    'Land Size (m²)',
    'Construction Size (m²)',
    'Location',
    'Featured',
    'Amenities',
    'Features',
    'Created At',
  ];

  const rows = properties.map(property => [
    property.title,
    PROPERTY_STATUS_LABELS[property.status] || property.status,
    PROPERTY_TYPE_LABELS[property.propertyType] || property.propertyType,
    PROPERTY_TIER_LABELS[property.tier] || property.tier,
    property.priceSale?.toString() || '',
    property.priceRentMonthly?.toString() || '',
    property.currency,
    property.bedrooms.toString(),
    property.bathrooms.toString(),
    property.garageSpaces.toString(),
    property.landSizeSqm?.toString() || '',
    property.constructionSizeSqm?.toString() || '',
    property.locationName,
    property.featured ? 'Yes' : 'No',
    property.amenities.join('; '),
    property.features.join('; '),
    new Date(property.createdAt).toLocaleString(),
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(escapeCSVCell).join(',')),
  ].join('\n');

  downloadCSV(csvContent, filename);
}
