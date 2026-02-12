import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200 });
  }

  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing ID", { status: 400 });
    }

    const sbUrl = Deno.env.get("SUPABASE_URL")!;
    const sbKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    const res = await fetch(
      `${sbUrl}/rest/v1/properties?select=id,title,description,images,updated_at&id=eq.${id}`,
      {
        headers: {
          apikey: sbKey,
          Authorization: `Bearer ${sbKey}`,
          Accept: "application/json",
          "Accept-Profile": "public",
        },
      }
    );

    const rows = await res.json();
    const p = rows?.[0];

    if (!p) {
      return new Response("Not found", { status: 404 });
    }

    let imgUrl = "";
    const raw = p.images?.[0] || "";
    if (raw) {
      if (raw.startsWith("http")) {
        imgUrl = raw;
      } else {
        const path = raw.startsWith("property-images/")
          ? raw.slice("property-images/".length)
          : raw;
        imgUrl = `${sbUrl}/storage/v1/object/public/property-images/${path}`;
      }
    }

    const esc = (s: string) =>
      (s || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");

    const title = esc(p.title || "Property Listing");
    const desc = esc((p.description || "Luxury Real Estate Listing").slice(0, 200));
    const v = p.updated_at ? new Date(p.updated_at).getTime() : Date.now();
    const ogImg = imgUrl ? esc(`${imgUrl}?v=${v}`) : "https://drhousing.net/og-fallback.jpg";
    const canon = `https://drhousing.net/en/properties/${id}`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${title} | DR Housing</title>
<link rel="canonical" href="${canon}">
<meta property="og:site_name" content="DR Housing">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${ogImg}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:url" content="${canon}">
<meta property="og:type" content="website">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${desc}">
<meta name="twitter:image" content="${ogImg}">
</head>
<body>
<p>Redirecting...</p>
<script>window.location.href='${canon}';</script>
</body>
</html>`;

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
      },
    });
  } catch (err) {
    console.error("og-test error:", err);
    return new Response("Internal server error", { status: 500 });
  }
});
