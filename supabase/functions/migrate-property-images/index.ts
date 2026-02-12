import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Get the user and verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Check if admin
    const { data: isAdmin } = await supabase.rpc('is_admin')
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get properties with external drhousing.net images
    const { data: properties, error: fetchError } = await supabase
      .from('properties')
      .select('id, title, images')
      .like('description', '%Imported from drhousing.net%')
      .not('images', 'is', null)

    if (fetchError) {
      throw fetchError
    }

    const results: { propertyId: string; title: string; migrated: number; failed: number; errors: string[] }[] = []
    let totalMigrated = 0
    let totalFailed = 0

    for (const property of properties || []) {
      const propertyResult = {
        propertyId: property.id,
        title: property.title,
        migrated: 0,
        failed: 0,
        errors: [] as string[],
      }

      const newImages: string[] = []

      for (let i = 0; i < (property.images || []).length; i++) {
        const imageUrl = property.images[i]
        
        // Skip if already migrated to our storage
        if (imageUrl.includes('supabase') || !imageUrl.includes('drhousing.net')) {
          newImages.push(imageUrl)
          continue
        }

        try {
          // Download the image
          const response = await fetch(imageUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; DRHousing Image Migration)',
            },
          })

          if (!response.ok) {
            throw new Error(`Failed to download: ${response.status}`)
          }

          const contentType = response.headers.get('content-type') || 'image/jpeg'
          const imageBuffer = await response.arrayBuffer()

          // Determine file extension
          let ext = 'jpg'
          if (contentType.includes('png')) ext = 'png'
          else if (contentType.includes('webp')) ext = 'webp'
          else if (contentType.includes('avif')) ext = 'avif'
          else if (imageUrl.includes('.avif')) ext = 'avif'
          else if (imageUrl.includes('.png')) ext = 'png'
          else if (imageUrl.includes('.webp')) ext = 'webp'

          // Generate a unique filename
          const filename = `${property.id}/${Date.now()}-${i}.${ext}`

          // Upload to storage
          const { error: uploadError } = await supabase.storage
            .from('property-images')
            .upload(filename, imageBuffer, {
              contentType,
              upsert: true,
            })

          if (uploadError) {
            throw uploadError
          }

          // Get public URL
          const { data } = supabase.storage
            .from('property-images')
            .getPublicUrl(filename)

          if (data?.publicUrl) {
            newImages.push(data.publicUrl)
            propertyResult.migrated++
            totalMigrated++
          } else {
            throw new Error('Failed to get public URL')
          }
        } catch (error) {
          propertyResult.failed++
          totalFailed++
          propertyResult.errors.push(`Image ${i}: ${error instanceof Error ? error.message : 'Unknown error'}`)
          // Keep the original URL if migration fails
          newImages.push(imageUrl)
        }
      }

      // Update the property with new image URLs
      if (propertyResult.migrated > 0) {
        const { error: updateError } = await supabase
          .from('properties')
          .update({ images: newImages })
          .eq('id', property.id)

        if (updateError) {
          propertyResult.errors.push(`Update failed: ${updateError.message}`)
        }
      }

      results.push(propertyResult)
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalProperties: properties?.length || 0,
        totalMigrated,
        totalFailed,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (error) {
    console.error('Migration error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Migration failed',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
