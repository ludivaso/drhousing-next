import type { Metadata } from "next";
import { notFound } from "next/navigation";

// Minimal server-rendered property page for OG previews
// Uses Supabase REST to avoid adding new dependencies.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

export const revalidate = 60;

function formatPrice(amount?: number | null, currency = "USD") {
  if (amount == null) return undefined;
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch (e) {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

async function fetchProperty(id: string) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return null;
  }

  const url = `${SUPABASE_URL}/rest/v1/properties` +
    `?id=eq.${encodeURIComponent(id)}` +
    `&select=id,title,description,featured_images,price_sale,price_rent_monthly,currency,price_note`;

  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const rows = (await res.json()) as any[];
  const row = rows[0];
  if (!row) return null;

  const salePriceLabel = formatPrice(row.price_sale, row.currency);
  const rentPriceLabel = formatPrice(row.price_rent_monthly, row.currency);

  let priceTag: string | undefined;
  if (salePriceLabel) priceTag = salePriceLabel;
  else if (rentPriceLabel) priceTag = `${rentPriceLabel} / month`;
  else priceTag = undefined;

  return {
    id: row.id as string,
    title: (row.title ?? "") as string,
    description: (row.description ?? "") as string,
    featuredImages: (row.featured_images ?? []) as string[],
    priceTag,
    priceNote: (row.price_note ?? "") as string,
  };
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const property = await fetchProperty(params.id);
  if (!property) {
    return { title: "Property not found" };
  }

  const hero = property.featuredImages?.[0] || undefined;
  const title = property.title || "Property";
  const description = property.description || "Luxury real estate";

  const pageUrl = SITE_URL
    ? `${SITE_URL.replace(/\/$/, "")}/properties/${property.id}`
    : `/properties/${property.id}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: pageUrl,
      images: hero ? [{ url: hero }] : undefined,
    },
    twitter: {
      card: hero ? "summary_large_image" : "summary",
      title,
      description,
      images: hero ? [hero] : undefined,
    },
    alternates: {
      canonical: pageUrl,
    },
  };
}

export default async function PropertyPage({
  params,
}: {
  params: { id: string };
}) {
  const property = await fetchProperty(params.id);
  if (!property) {
    notFound();
  }

  const hero = property.featuredImages?.[0];

  return (
    <main className="mx-auto max-w-5xl p-6">
      {hero ? (
        <img
          src={hero}
          alt={property.title}
          style={{ width: "100%", height: "auto", borderRadius: 16 }}
        />
      ) : null}

      <h1 className="mt-6 font-serif text-4xl font-semibold text-gray-900">
        {property.title}
      </h1>

      {property.priceTag ? (
        <div className="mt-3 text-2xl font-semibold text-gray-800">
          {property.priceTag}
        </div>
      ) : null}

      {property.priceNote ? (
        <p className="mt-1 text-sm text-muted-foreground">
          {property.priceNote}
        </p>
      ) : null}

      {property.description ? (
        <p
          className="mt-4 text-lg leading-relaxed text-gray-700"
          style={{ whiteSpace: "pre-line" }}
        >
          {property.description}
        </p>
      ) : null}
    </main>
  );
}
