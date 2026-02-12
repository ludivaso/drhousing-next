import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

function escapeHtml(input: string): string {
  return (input || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getPublicImageUrl(supabaseUrl: string, imagePath: string): string {
  if (!imagePath) return "";

  // Already a full URL
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  // Strip bucket prefix if present
  const path = imagePath.startsWith("property-images/")
    ? imagePath.slice("property-images/".length)
    : imagePath;

  return `${supabaseUrl}/storage/v1/object/public/property-images/${path}`;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing property ID", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch property data
    const { data: property, error } = await supabase
      .from("properties")
      .select("id, title, description, images, updated_at")
      .eq("id", id)
      .single();

    if (error || !property) {
      console.error("Property fetch error:", error);
      return new Response("Property not found", {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    // Get the hero image URL (first image in array)
    const heroImageUrl = property.images?.[0]
      ? getPublicImageUrl(supabaseUrl, property.images[0])
      : "";

    const title = escapeHtml(property.title || "Property Listing");
    const description = escapeHtml(
      (property.description || "Luxury Real Estate Listing").slice(0, 200)
    );
    // Cache-bust og:image with updated_at or current timestamp
    const cacheBuster = property.updated_at
      ? new Date(property.updated_at).getTime()
      : Date.now();
    const safeImageUrl = escapeHtml(
      heroImageUrl ? `${heroImageUrl}?v=${cacheBuster}` : ""
    );
    const canonicalUrl = `https://drhousing.net/en/properties/${id}`;

    // Build the HTML response
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>${title} | DR Housing</title>
  <link rel="canonical" href="${canonicalUrl}">
  <meta property="og:site_name" content="DR Housing">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${safeImageUrl}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:type" content="website">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${safeImageUrl}">
</head>
<body>
  <p>Loading listing…</p>
  <script>
    window.location.href = 'https://drhousing.net/en/properties/${id}';
  </script>
</body>
</html>`;

    // Return as HTML
    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Share function error:", err);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
});
