import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Simple in-memory rate limiter (per IP, per minute)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 10; // max requests per minute per IP
const RATE_WINDOW_MS = 60 * 1000; // 1 minute

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimitMap.get(ip);
  
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

// Clean up old entries periodically (simple garbage collection)
function cleanupRateLimitMap() {
  const now = Date.now();
  for (const [ip, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(ip);
    }
  }
}

const systemPrompt = `You are a friendly and knowledgeable real estate assistant for DR Housing, a premium real estate agency specializing in Costa Rica properties and relocation services.

Your role is to:
1. Help visitors find their ideal property in Costa Rica based on their preferences (budget, location, property type, amenities)
2. Answer questions about relocating to Costa Rica (visa requirements, cost of living, best areas to live, schools, healthcare)
3. Provide information about DR Housing's services: real estate brokerage, legal & immigration assistance, property management, development & remodeling, and interior design
4. Share insights about different regions: Escazú, Santa Ana, Guanacaste (Tamarindo, Nosara), Manuel Antonio, and other popular areas

Key information about Costa Rica:
- Stable democracy with no military, known as the "Switzerland of Central America"
- Excellent healthcare system, both public (Caja) and private
- Popular retirement destination with pensionado and rentista visa options
- Year-round tropical climate with distinct microclimates
- Strong expat communities in Central Valley and coastal areas
- Property ownership is straightforward for foreigners

Be warm, professional, and helpful. If asked about specific listings, encourage them to browse the Properties page or contact an agent. Always respond in the same language the user writes in (English or Spanish).

Keep responses concise but informative. When discussing properties, ask clarifying questions about their needs (budget range, preferred location, must-have features).`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  // Get client IP for rate limiting
  const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() 
    || req.headers.get('x-real-ip') 
    || 'unknown';

  // Check rate limit
  if (!checkRateLimit(clientIp)) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait a moment before trying again." }),
      { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Periodic cleanup (run on ~5% of requests)
  if (Math.random() < 0.05) {
    cleanupRateLimitMap();
  }

  try {
    const { messages } = await req.json();

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: "Invalid request: messages array required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Limit message count to prevent abuse
    if (messages.length > 50) {
      return new Response(
        JSON.stringify({ error: "Too many messages in conversation. Please start a new chat." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Our assistant is busy right now. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Service temporarily unavailable. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      return new Response(
        JSON.stringify({ error: "Unable to connect to assistant. Please try again." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Chat function error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
