import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ============ SHARE LOGIC (GET requests) ============

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
  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }
  const path = imagePath.startsWith("property-images/")
    ? imagePath.slice("property-images/".length)
    : imagePath;
  return `${supabaseUrl}/storage/v1/object/public/property-images/${path}`;
}

async function handleShare(req: Request): Promise<Response> {
  try {
    const url = new URL(req.url);
    const id = url.searchParams.get("id");

    if (!id) {
      return new Response("Missing property ID", {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "text/plain" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const heroImageUrl = property.images?.[0]
      ? getPublicImageUrl(supabaseUrl, property.images[0])
      : "";

    const title = escapeHtml(property.title || "Property Listing");
    const description = escapeHtml(
      (property.description || "Luxury Real Estate Listing").slice(0, 200)
    );
    const cacheBuster = property.updated_at
      ? new Date(property.updated_at).getTime()
      : Date.now();
    const safeImageUrl = escapeHtml(
      heroImageUrl ? `${heroImageUrl}?v=${cacheBuster}` : ""
    );
    const canonicalUrl = `https://drhousing.net/en/properties/${id}`;

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

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Share handler error:", err);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
}

// Share via POST (for social media crawlers that can't handle GET)
async function handleSharePost(id: string): Promise<Response> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

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

    const heroImageUrl = property.images?.[0]
      ? getPublicImageUrl(supabaseUrl, property.images[0])
      : "";

    const title = escapeHtml(property.title || "Property Listing");
    const description = escapeHtml(
      (property.description || "Luxury Real Estate Listing").slice(0, 200)
    );
    const cacheBuster = property.updated_at
      ? new Date(property.updated_at).getTime()
      : Date.now();
    const safeImageUrl = escapeHtml(
      heroImageUrl ? `${heroImageUrl}?v=${cacheBuster}` : ""
    );
    const canonicalUrl = `https://drhousing.net/en/properties/${id}`;

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

    return new Response(html, {
      status: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=1800",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("Share POST handler error:", err);
    return new Response("Internal server error", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "text/plain" },
    });
  }
}

// ============ TRANSLATE LOGIC (POST requests) ============

const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60 * 1000;
const MAX_TEXT_LENGTH = 5000;
const VALID_LANGUAGES = ["en", "es"] as const;

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function getClientIP(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (rateLimitMap.size > 1000) {
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetTime) {
        rateLimitMap.delete(key);
      }
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

const systemPrompt = `You are a professional translation engine for a high-net-worth real estate platform.

Rules:
- Translate ONLY the provided text into the requested target language.
- Preserve proper nouns, place names, project/brand names, currencies, numbers, and formatting.
- Keep tone discreet and professional.
- Return ONLY the translated text. No quotes. No extra commentary.`;

type RequestBody = {
  text?: string;
  targetLang?: string;
};

async function handleTranslate(req: Request): Promise<Response> {
  try {
    const clientIP = getClientIP(req);
    if (!checkRateLimit(clientIP)) {
      return new Response(
        JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
        {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const body = await req.json();
    
    // Check if this is a share request
    if (body.action === "share" && body.id) {
      return handleSharePost(body.id);
    }

    const { text, targetLang } = body as RequestBody;

    if (targetLang && !VALID_LANGUAGES.includes(targetLang as typeof VALID_LANGUAGES[number])) {
      return new Response(
        JSON.stringify({ error: "Invalid target language. Supported: en, es" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const cleanText = (text || "").trim();
    const cleanTarget = targetLang === "es" ? "es" : "en";

    if (cleanText.length > MAX_TEXT_LENGTH) {
      return new Response(
        JSON.stringify({ error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!cleanText) {
      return new Response(JSON.stringify({ translatedText: "" }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const userPrompt = `Target language: ${cleanTarget}\n\nText:\n${cleanText}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Translate gateway error:", response.status, errorText);
      return new Response(JSON.stringify({ translatedText: cleanText }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const json = await response.json();
    const translatedText = (json?.choices?.[0]?.message?.content as string | undefined)?.trim() || cleanText;

    return new Response(JSON.stringify({ translatedText }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Translate function error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}

// ============ MAIN HANDLER ============

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Route GET requests with ?id= to share handler
  if (req.method === "GET") {
    const url = new URL(req.url);
    if (url.searchParams.has("id")) {
      return handleShare(req);
    }
    return new Response("OK", { headers: corsHeaders });
  }

  // Route POST requests to translate handler
  if (req.method === "POST") {
    return handleTranslate(req);
  }

  return new Response("Method not allowed", {
    status: 405,
    headers: corsHeaders,
  });
});
