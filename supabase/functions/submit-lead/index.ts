import { createClient } from "npm:@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Simple in-memory rate limiter (per IP)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT = 5 // max requests
const RATE_WINDOW_MS = 60 * 1000 // per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)
  
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS })
    return false
  }
  
  if (entry.count >= RATE_LIMIT) {
    return true
  }
  
  entry.count++
  return false
}

// Validation functions
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email) && email.length <= 255
}

function validateFullName(name: string): boolean {
  return name.trim().length > 0 && name.length <= 100
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Rate limiting by IP
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
               req.headers.get('x-real-ip') || 
               'unknown'
    
    if (isRateLimited(ip)) {
      return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    
    // Validate required fields
    if (!body.email || !validateEmail(body.email)) {
      return new Response(
        JSON.stringify({ error: 'Valid email is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!body.full_name || !validateFullName(body.full_name)) {
      return new Response(
        JSON.stringify({ error: 'Full name is required (max 100 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate optional fields with length limits
    if (body.phone && body.phone.length > 30) {
      return new Response(
        JSON.stringify({ error: 'Phone number too long (max 30 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (body.message && body.message.length > 2000) {
      return new Response(
        JSON.stringify({ error: 'Message too long (max 2000 characters)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate enum values
    const validTimelines = ['exploring', 'within_month', 'within_3_months', 'within_6_months', 'within_year']
    const validContactMethods = ['email', 'phone', 'whatsapp']
    const validLeadTypes = ['general', 'property', 'service', 'relocation', 'buying', 'selling', 'legal_immigration', 'property_management']

    const timeline = body.timeline || 'exploring'
    if (!validTimelines.includes(timeline)) {
      return new Response(
        JSON.stringify({ error: 'Invalid timeline value' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const preferredContact = body.preferred_contact_method || 'email'
    if (!validContactMethods.includes(preferredContact)) {
      return new Response(
        JSON.stringify({ error: 'Invalid contact method' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const leadType = body.lead_type || 'general'
    if (!validLeadTypes.includes(leadType)) {
      return new Response(
        JSON.stringify({ error: 'Invalid lead type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Validate interested areas
    const interestedAreas = body.interested_areas || []
    if (interestedAreas.length > 20) {
      return new Response(
        JSON.stringify({ error: 'Too many interested areas (max 20)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Use service role to insert (bypasses RLS)
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    })

    // Sanitize and prepare data
    const leadData = {
      email: body.email.trim().toLowerCase(),
      full_name: body.full_name.trim(),
      phone: body.phone?.trim() || null,
      message: body.message?.trim() || null,
      lead_type: leadType,
      preferred_contact_method: preferredContact,
      timeline: timeline,
      country_of_origin: body.country_of_origin?.substring(0, 100) || null,
      budget_min: typeof body.budget_min === 'number' ? body.budget_min : null,
      budget_max: typeof body.budget_max === 'number' ? body.budget_max : null,
      interested_areas: interestedAreas,
      interested_property_type: body.interested_property_type?.substring(0, 50) || null,
      property_id: body.property_id || null,
      status: 'new',
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('Failed to insert lead:', error)
      return new Response(
        JSON.stringify({ error: 'Failed to submit lead' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('Error in submit-lead:', message)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
