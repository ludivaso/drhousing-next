/**
 * PropertyBrochure — @react-pdf/renderer document
 * Server-side only. Uses Helvetica (built-in) — no external fonts required.
 */

import React from 'react'
import {
  Document,
  Page,
  View,
  Text,
  Image as PDFImage,
  StyleSheet,
  Link,
} from '@react-pdf/renderer'
import type { PropertyRow } from '@/src/integrations/supabase/types'

// ── Palette (DR Housing brand) ────────────────────────────────────────────────

const GOLD    = '#C9A96E'
const DARK    = '#1A1A1A'
const CREAM   = '#F5F2EE'
const GRAY    = '#6B7280'
const LIGHT   = '#E5E7EB'

// ── Styles ────────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    backgroundColor: CREAM,
    color: DARK,
    paddingBottom: 48,
  },

  // Header band
  header: {
    backgroundColor: DARK,
    paddingHorizontal: 40,
    paddingVertical: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBrand: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 1,
  },
  headerSub: {
    fontSize: 9,
    color: '#9CA3AF',
    letterSpacing: 0.5,
    marginTop: 2,
  },
  headerRef: {
    fontSize: 9,
    color: '#9CA3AF',
    textAlign: 'right',
  },

  // Hero image
  heroImage: {
    width: '100%',
    height: 260,
    objectFit: 'cover',
  },
  noImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  noImageText: {
    color: GRAY,
    fontSize: 12,
  },

  // Gold accent bar
  accentBar: {
    backgroundColor: GOLD,
    height: 4,
    width: '100%',
  },

  // Main content area
  content: {
    paddingHorizontal: 40,
    paddingTop: 28,
  },

  // Title section
  location: {
    fontSize: 9,
    color: GOLD,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    lineHeight: 1.3,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    marginBottom: 4,
  },
  priceNote: {
    fontSize: 9,
    color: GRAY,
    marginBottom: 20,
  },

  // Stats row
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: LIGHT,
  },
  statValue: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
  },
  statLabel: {
    fontSize: 8,
    color: GRAY,
    marginTop: 2,
    textAlign: 'center',
  },

  // Divider
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: LIGHT,
    marginVertical: 16,
  },

  // Section title
  sectionTitle: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: GOLD,
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 8,
  },

  // Description
  description: {
    fontSize: 10,
    color: DARK,
    lineHeight: 1.65,
    marginBottom: 24,
  },

  // Two-column layout
  twoCol: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 24,
  },
  col: {
    flex: 1,
  },

  // Key facts table
  factRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: LIGHT,
  },
  factLabel: {
    fontSize: 9,
    color: GRAY,
  },
  factValue: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: DARK,
    textAlign: 'right',
  },

  // Feature pills (text list)
  featureList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  featurePill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LIGHT,
    borderRadius: 4,
    paddingHorizontal: 7,
    paddingVertical: 3,
    fontSize: 8,
    color: DARK,
  },

  // Image grid for additional photos
  imageGrid: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  thumbImage: {
    flex: 1,
    height: 80,
    objectFit: 'cover',
    borderRadius: 4,
  },

  // Footer
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: DARK,
    paddingHorizontal: 40,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: '#9CA3AF',
  },
  footerLink: {
    fontSize: 8,
    color: GOLD,
    textDecoration: 'none',
  },
  pageNumber: {
    fontSize: 8,
    color: '#6B7280',
  },
})

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatPrice(price: number, currency: string) {
  if (currency === 'CRC') {
    return `₡${price.toLocaleString('es-CR')}`
  }
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(price)
}

function getHeroImage(p: PropertyRow): string | null {
  const imgs = p.featured_images?.length ? p.featured_images : p.images
  return imgs?.[0] ?? null
}

function getGalleryImages(p: PropertyRow): string[] {
  const imgs = p.featured_images?.length ? p.featured_images : p.images
  return (imgs ?? []).slice(1, 4) // up to 3 additional
}

// ── Document ──────────────────────────────────────────────────────────────────

interface Props {
  property: PropertyRow
  lang?: 'es' | 'en'
}

export function PropertyBrochure({ property: p, lang = 'es' }: Props) {
  const title       = lang === 'en' && p.title_en ? p.title_en : p.title
  const description = lang === 'en' && p.description_en ? p.description_en : p.description
  const price       = p.price_sale ?? p.price_rent_monthly
  const heroImg     = getHeroImage(p)
  const gallery     = getGalleryImages(p)

  const facts: Array<{ label: string; value: string | number }> = [
    p.property_type    && { label: lang === 'en' ? 'Type'    : 'Tipo',           value: p.property_type },
    p.status           && { label: 'Status',                                       value: p.status },
    p.bedrooms         && { label: lang === 'en' ? 'Bedrooms': 'Habitaciones',    value: p.bedrooms },
    p.bathrooms        && { label: lang === 'en' ? 'Bathrooms': 'Baños',          value: p.bathrooms },
    p.garage_spaces    && { label: lang === 'en' ? 'Garage'  : 'Garaje',          value: p.garage_spaces },
    p.construction_size_sqm && { label: lang === 'en' ? 'Build Area' : 'Construcción', value: `${p.construction_size_sqm} m²` },
    p.land_size_sqm    && { label: lang === 'en' ? 'Land'    : 'Terreno',         value: `${p.land_size_sqm} m²` },
    p.year_built       && { label: lang === 'en' ? 'Year Built' : 'Año',          value: p.year_built },
    p.hoa_monthly      && { label: 'HOA/mes',                                      value: formatPrice(p.hoa_monthly, p.currency) },
    p.furnished        && { label: lang === 'en' ? 'Furnished' : 'Amoblado',      value: p.furnished },
  ].filter(Boolean) as Array<{ label: string; value: string | number }>

  const features = lang === 'en' && p.features_en?.length ? p.features_en : p.features ?? []
  const amenities = lang === 'en' && p.amenities_en?.length ? p.amenities_en : p.amenities ?? []

  const propertyUrl = p.slug ? `https://drhousing.net/property/${p.slug}` : 'https://drhousing.net'

  return (
    <Document
      title={title}
      author="DR Housing"
      subject={lang === 'en' ? 'Property Brochure' : 'Ficha de Propiedad'}
      creator="DR Housing Admin"
    >
      <Page size="A4" style={s.page}>
        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.headerBrand}>DR HOUSING</Text>
            <Text style={s.headerSub}>COSTA RICA REAL ESTATE</Text>
          </View>
          <View>
            {p.reference_id && <Text style={s.headerRef}>Ref: {p.reference_id}</Text>}
            <Text style={s.headerRef}>drhousing.net</Text>
          </View>
        </View>

        {/* ── Hero image ── */}
        {heroImg ? (
          <PDFImage src={heroImg} style={s.heroImage} />
        ) : (
          <View style={s.noImage}>
            <Text style={s.noImageText}>Sin imagen</Text>
          </View>
        )}

        <View style={s.accentBar} />

        {/* ── Content ── */}
        <View style={s.content}>
          {/* Title block */}
          <Text style={s.location}>{p.location_name}</Text>
          <Text style={s.title}>{title}</Text>
          {price && (
            <Text style={s.price}>{formatPrice(price, p.currency)}{p.price_rent_monthly && !p.price_sale ? (lang === 'en' ? '/mo' : '/mes') : ''}</Text>
          )}
          {p.price_note && <Text style={s.priceNote}>{p.price_note}</Text>}

          {/* Stats row */}
          <View style={s.statsRow}>
            {p.bedrooms > 0 && (
              <View style={s.statBox}>
                <Text style={s.statValue}>{p.bedrooms}</Text>
                <Text style={s.statLabel}>{lang === 'en' ? 'Beds' : 'Hab.'}</Text>
              </View>
            )}
            {p.bathrooms > 0 && (
              <View style={s.statBox}>
                <Text style={s.statValue}>{p.bathrooms}</Text>
                <Text style={s.statLabel}>{lang === 'en' ? 'Baths' : 'Baños'}</Text>
              </View>
            )}
            {p.garage_spaces > 0 && (
              <View style={s.statBox}>
                <Text style={s.statValue}>{p.garage_spaces}</Text>
                <Text style={s.statLabel}>{lang === 'en' ? 'Garage' : 'Garaje'}</Text>
              </View>
            )}
            {p.construction_size_sqm && (
              <View style={s.statBox}>
                <Text style={s.statValue}>{p.construction_size_sqm}</Text>
                <Text style={s.statLabel}>m² {lang === 'en' ? 'Build' : 'Const.'}</Text>
              </View>
            )}
            {p.land_size_sqm && (
              <View style={s.statBox}>
                <Text style={s.statValue}>{p.land_size_sqm}</Text>
                <Text style={s.statLabel}>m² {lang === 'en' ? 'Land' : 'Terreno'}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          {description && (
            <>
              <Text style={s.sectionTitle}>{lang === 'en' ? 'Description' : 'Descripción'}</Text>
              <Text style={s.description}>{description}</Text>
            </>
          )}

          {/* Two columns: Key Facts + Features */}
          <View style={s.twoCol}>
            {/* Key facts */}
            <View style={s.col}>
              <Text style={s.sectionTitle}>{lang === 'en' ? 'Key Facts' : 'Datos Clave'}</Text>
              {facts.map((f, i) => (
                <View key={i} style={s.factRow}>
                  <Text style={s.factLabel}>{f.label}</Text>
                  <Text style={s.factValue}>{String(f.value)}</Text>
                </View>
              ))}
            </View>

            {/* Features */}
            {features.length > 0 && (
              <View style={s.col}>
                <Text style={s.sectionTitle}>{lang === 'en' ? 'Features' : 'Características'}</Text>
                <View style={s.featureList}>
                  {features.slice(0, 12).map((f, i) => (
                    <Text key={i} style={s.featurePill}>{f}</Text>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Amenities */}
          {amenities.length > 0 && (
            <>
              <Text style={s.sectionTitle}>{lang === 'en' ? 'Amenities' : 'Amenidades'}</Text>
              <View style={[s.featureList, { marginBottom: 20 }]}>
                {amenities.slice(0, 16).map((a, i) => (
                  <Text key={i} style={s.featurePill}>{a}</Text>
                ))}
              </View>
            </>
          )}

          {/* Gallery strip */}
          {gallery.length > 0 && (
            <>
              <Text style={s.sectionTitle}>{lang === 'en' ? 'Gallery' : 'Galería'}</Text>
              <View style={s.imageGrid}>
                {gallery.map((img, i) => (
                  <PDFImage key={i} src={img} style={s.thumbImage} />
                ))}
              </View>
            </>
          )}

          {/* Online link */}
          <View style={{ marginTop: 4 }}>
            <Text style={[s.factLabel, { marginBottom: 2 }]}>
              {lang === 'en' ? 'View online:' : 'Ver en línea:'}
            </Text>
            <Link src={propertyUrl} style={s.footerLink}>{propertyUrl}</Link>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            © {new Date().getFullYear()} DR Housing · Costa Rica Real Estate
          </Text>
          <Text style={s.footerText}>+506 6077-5000 · info@drhousing.net</Text>
          <Text style={s.pageNumber} render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`} />
        </View>
      </Page>
    </Document>
  )
}
