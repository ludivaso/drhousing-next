import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompt = `You are a professional translation engine for a high-net-worth real estate platform in Costa Rica.

Rules:
- Translate the provided text into the requested target language.
- If the source text is ALREADY in the target language, translate it to the OTHER language instead (e.g., if asked to translate to Spanish but text is already Spanish, translate to English).
- Preserve proper nouns, place names, brand names (e.g. "DR Housing"), currencies, numbers, measurements, and formatting.
- For arrays of feature/amenity keys (like "pool", "ocean_views"), translate the KEY values into natural equivalents in the target language.
- Keep tone professional and luxurious.
- Return ONLY the translated text. No quotes. No extra commentary.`;

async function translateText(text: string, targetLang: string, apiKey: string): Promise<string> {
  if (!text || !text.trim()) return "";

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Target language: ${targetLang}\n\nText:\n${text}` },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    console.error("Translation API error:", response.status, await response.text());
    return text; // Return original on failure
  }

  const json = await response.json();
  return json?.choices?.[0]?.message?.content?.trim() || text;
}

async function translateArray(items: string[], targetLang: string, apiKey: string): Promise<string[]> {
  if (!items || items.length === 0) return [];

  // Translate array items as a batch by joining with a delimiter
  const joined = items.join("\n|||SEPARATOR|||\n");
  const prompt = `Translate each line below to ${targetLang}. These are feature/amenity labels for real estate listings. Keep each on its own line, separated by |||SEPARATOR|||. Translate the human meaning, not literally. If a term is already a proper noun or brand, keep it as-is.\n\n${joined}`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-lite",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.1,
    }),
  });

  if (!response.ok) {
    console.error("Array translation error:", response.status);
    return items;
  }

  const json = await response.json();
  const result = json?.choices?.[0]?.message?.content?.trim() || "";
  return result.split(/\|\|\|SEPARATOR\|\|\|/).map((s: string) => s.trim()).filter(Boolean);
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { propertyId } = await req.json();

    if (!propertyId) {
      return new Response(
        JSON.stringify({ error: "Missing propertyId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const apiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch property fields
    const { data: property, error: fetchError } = await supabase
      .from("properties")
      .select("title_en, title_es, description_en, description_es, features_en, features_es, amenities_en, amenities_es, youtube_label_en, youtube_label_es")
      .eq("id", propertyId)
      .single();

    if (fetchError || !property) {
      console.error("Property fetch error:", fetchError);
      return new Response(
        JSON.stringify({ error: "Property not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Detect if source content is Spanish using a simple heuristic
    const titleText = property.title_en || "";
    const looksSpanish = /[ñáéíóúü¡¿]/i.test(titleText) || 
      /\b(el|la|los|las|una|para|con|sin|propiedad|casa|apartamento|lujo|exclusividad|venta|alquiler)\b/i.test(titleText);

    const updates: Record<string, any> = {};

    if (looksSpanish) {
      // Source is Spanish: _en fields contain Spanish text
      // Set _es from _en (it's already Spanish), translate _en to English
      const [titleEn, descEn, featEn, amenEn, ytLabelEn] = await Promise.all([
        translateText(property.title_en || "", "en", apiKey),
        translateText(property.description_en || "", "en", apiKey),
        translateArray(property.features_en || [], "en", apiKey),
        translateArray(property.amenities_en || [], "en", apiKey),
        translateText(property.youtube_label_en || "", "en", apiKey),
      ]);
      // Move original Spanish into _es, put English translation into _en
      updates.title_es = property.title_en;
      updates.description_es = property.description_en;
      updates.features_es = property.features_en;
      updates.amenities_es = property.amenities_en;
      updates.youtube_label_es = property.youtube_label_en;
      updates.title_en = titleEn;
      updates.description_en = descEn;
      updates.features_en = featEn;
      updates.amenities_en = amenEn;
      updates.youtube_label_en = ytLabelEn;
      // Also update legacy fields with English
      updates.title = titleEn;
      updates.description = descEn;
    } else {
      // Source is English: translate to Spanish
      const [titleEs, descEs, featEs, amenEs, ytLabelEs] = await Promise.all([
        translateText(property.title_en || "", "es", apiKey),
        translateText(property.description_en || "", "es", apiKey),
        translateArray(property.features_en || [], "es", apiKey),
        translateArray(property.amenities_en || [], "es", apiKey),
        translateText(property.youtube_label_en || "", "es", apiKey),
      ]);
      updates.title_es = titleEs;
      updates.description_es = descEs;
      updates.features_es = featEs;
      updates.amenities_es = amenEs;
      updates.youtube_label_es = ytLabelEs;
    }

    const { error: updateError } = await supabase
      .from("properties")
      .update(updates)
      .eq("id", propertyId);

    if (updateError) {
      console.error("Property update error:", updateError);
      return new Response(
        JSON.stringify({ error: "Failed to save translations" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log(`Successfully translated property ${propertyId}`);

    return new Response(
      JSON.stringify({ success: true, propertyId }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("translate-property error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
