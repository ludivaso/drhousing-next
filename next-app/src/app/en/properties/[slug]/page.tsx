import { Metadata } from 'next';
import { notFound } from 'next/navigation';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://drhousing.net';

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

export type PropertyRecord = {
  id: string;
  title: string;
  description: string;
  slug: string;
  featured_images: unknown;
  price_sale: number | null;
  price_rent_monthly: number | null;
  currency: string | null;
  price_note: string | null;
};

async function fetchPropertyBySlug(slug: string): Promise<PropertyRecord | null> {
  const params = new URLSearchParams();
  params.set('slug', `eq.${slug}`);
  params.set('select', [
    'id',
    'slug',
    'title',
    'description',
    'featured_images',
    'price_sale',
    'price_rent_monthly',
    'currency',
    'price_note',
  ].join(','));
  params.set('limit', '1');

  const resp = await fetch(`${supabaseUrl}/rest/v1/properties?${params.toString()}`, {
    headers: {
      apikey: supabaseAnonKey,
      Authorization: `Bearer ${supabaseAnonKey}`,
      Accept: 'application/json',
    },
    next: { revalidate: 60 },
  });

  if (!resp.ok) {
    throw new Error(`Supabase request failed: ${resp.status} ${resp.statusText}`);
  }

  const data = (await resp.json()) as PropertyRecord[];
  return data[0] ?? null;
}

function normalizeFeaturedImages(raw: PropertyRecord['featured_images']): Array<{ src: string }>
 | Array<{ url: string }> {
  if (!raw) return [] as any;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) return parsed as any;
  } catch {
    // ignore
  }
  return [] as any;
}

function getHeroImageUrl(property: PropertyRecord): string | null {
  const imgs = normalizeFeaturedImages(property.featured_images);
  const first = imgs[0] as any;
  const candidate = first?.src ?? first?.url;
  return typeof candidate === 'string' ? candidate : null;
}

function formatPrice(property: PropertyRecord): string {
  const currency = property.currency || 'USD';
  const sale = property.price_sale ?? null;
  const rent = property.price_rent_monthly ?? null;
  const nf = new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 });

  if (sale) return nf.format(sale);
  if (rent) return `${nf.format(rent)} / month`;
  return '';
}

export async function generateMetadata({ params }: { params: { slug: string; lang: string } }): Promise<Metadata> {
  const property = await fetchPropertyBySlug(params.slug);
  if (!property) {
    return { title: 'Property not found' };
  }

  const hero = getHeroImageUrl(property);
  const url = `${siteUrl}/${params.lang}/properties/${property.slug}`;

  return {
    title: property.title,
    description: property.description,
    alternates: { canonical: url },
    openGraph: {
      url,
      title: property.title,
      description: property.description,
      images: hero ? [{ url: hero }] : undefined,
    },
  };
}

export default async function PropertyPage({ params }: { params: { slug: string; lang: string } }) {
  const property = await fetchPropertyBySlug(params.slug);
  if (!property) notFound();

  const hero = getHeroImageUrl(property);
  const price = formatPrice(property);

  return (
    <main>
      {hero ? (
        <img src={hero} alt={property.title} style={{ width: '100%', height: 500, objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: 500, background: '#111', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#777' }}>No hero image</span>
        </div>
      )}
      <section style={{ maxWidth: 960, margin: '0 auto', padding: '2rem 1rem' }}>
        <h1 style={{ fontSize: 36, margin: '0 0 0.5rem' }}>{property.title}</h1>
        {price && <div style={{ fontSize: 20, fontWeight: 700, marginBottom: '0.5rem' }}>{price}</div>}
        {property.price_note && <div style={{ marginBottom: '1rem', color: '#999' }}>{property.price_note}</div>}
        <p style={{ whiteSpace: 'pre-line', lineHeight: 1.6 }}>{property.description}</p>
      </section>
    </main>
  );
}
