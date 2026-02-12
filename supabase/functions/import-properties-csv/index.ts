import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ParsedProperty {
  wpId: string
  title: string
  status: string
  imageUrls: string[]
  price: number | null
  bedrooms: number | null
  bathrooms: number | null
  halfBaths: number | null
  floors: number | null
  area: number | null
  yearBuilt: number | null
  latitude: number | null
  longitude: number | null
  videoUrl: string | null
  description: string
  keywords: string
  province: string | null
  city: string | null
  address: string | null
  garageSpaces: number | null
  lotSize: number | null
  bodega: boolean
  yearRemodeled: number | null
  condoName: string | null
}

// Parse the WordPress serialized video field to extract YouTube URL
function parseVideoUrl(videoField: string): string | null {
  if (!videoField) return null
  const match = videoField.match(/video_url";s:\d+:"([^"]+)"/)
  if (match && match[1] && match[1].length > 0) {
    return match[1]
  }
  return null
}

// Strip HTML tags and clean description text
function cleanDescription(html: string): string {
  if (!html) return ''
  return html
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
}

// Determine property status from keywords
function determineStatus(keywords: string): string {
  const kw = keywords.toLowerCase()
  if (kw.includes('bajo contrato') || kw.includes('under contract')) return 'under_contract'
  if (kw.includes('vendida') || kw.includes('sold')) return 'sold'
  if (kw.includes('rentada') || kw.includes('rentado') || kw.includes('rented')) return 'rented'
  const hasRent = kw.includes('en renta') || kw.includes('for rent') || kw.includes('alquiler')
  const hasSale = kw.includes('en venta') || kw.includes('for sale') || kw.includes('venta')
  if (hasRent && hasSale) return 'both'
  if (hasRent) return 'for_rent'
  return 'for_sale'
}

// Determine property type from keywords
function determinePropertyType(keywords: string): string {
  const kw = keywords.toLowerCase()
  if (kw.includes('terreno') || kw.includes('lote') || kw.includes('land')) return 'land'
  if (kw.includes('apartamento') || kw.includes('apartment') || kw.includes('penthouse') || kw.includes('loft')) return 'condo'
  if (kw.includes('townhouse')) return 'condo'
  if (kw.includes('comercial') || kw.includes('commercial') || kw.includes('oficina') || kw.includes('office') || kw.includes('local')) return 'commercial'
  if (kw.includes('casa') || kw.includes('house') || kw.includes('villa') || kw.includes('residencia')) return 'house'
  return 'house'
}

// Determine tier based on price
function determineTier(price: number | null): string {
  if (!price) return 'mid'
  if (price >= 1000000) return 'ultra_luxury'
  if (price >= 400000) return 'high_end'
  return 'mid'
}

// Build location name from address components
function buildLocationName(address: string | null, province: string | null, city: string | null): string {
  if (address) {
    const parts = address.split('|').filter(p =>
      p && p !== 'Costa Rica' && !p.includes('+') && p.length > 1
    )
    if (parts.length > 0) return parts.join(', ')
  }
  const pieces = [city, province].filter(Boolean)
  return pieces.length > 0 ? pieces.join(', ') : 'Costa Rica'
}

// Parse CSV properly handling quoted fields with commas and newlines
function parseCSVRows(csvText: string): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentField = ''
  let inQuotes = false
  let i = 0

  while (i < csvText.length) {
    const char = csvText[i]

    if (inQuotes) {
      if (char === '"') {
        if (i + 1 < csvText.length && csvText[i + 1] === '"') {
          currentField += '"'
          i += 2
          continue
        } else {
          inQuotes = false
          i++
          continue
        }
      } else {
        currentField += char
        i++
        continue
      }
    } else {
      if (char === '"') {
        inQuotes = true
        i++
        continue
      } else if (char === ',') {
        currentRow.push(currentField)
        currentField = ''
        i++
        continue
      } else if (char === '\n' || (char === '\r' && i + 1 < csvText.length && csvText[i + 1] === '\n')) {
        currentRow.push(currentField)
        currentField = ''
        if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0].trim() !== '')) {
          rows.push(currentRow)
        }
        currentRow = []
        i += (char === '\r' ? 2 : 1)
        continue
      } else {
        currentField += char
        i++
        continue
      }
    }
  }

  // Push last field/row
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField)
    rows.push(currentRow)
  }

  return rows
}

// Validate a single row and return issues
function validateRow(row: string[], getVal: (row: string[], col: string) => string): { valid: boolean; issues: string[] } {
  const issues: string[] = []
  const wpId = getVal(row, 'ID')
  const title = getVal(row, 'Title')

  if (!wpId || !/^\d+$/.test(wpId)) {
    issues.push('Missing or invalid ID')
  }
  if (!title || title.length < 3) {
    issues.push('Missing or too short title')
  }
  if (row.length < 10) {
    issues.push(`Row has only ${row.length} columns (expected 10+)`)
  }

  // Check if images are reachable (we won't actually fetch, just validate URLs)
  const imageUrlsRaw = getVal(row, 'Image URL')
  const imageUrls = imageUrlsRaw ? imageUrlsRaw.split('|').map(u => u.trim()).filter(u => u.length > 0) : []
  const validImageUrls = imageUrls.filter(u => u.startsWith('http'))
  if (imageUrls.length > 0 && validImageUrls.length === 0) {
    issues.push('No valid image URLs found')
  }

  return { valid: issues.length === 0, issues }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { csvContent, clearExisting = false, batchStart, batchEnd, scanOnly = false } = body

    if (!csvContent) {
      return new Response(JSON.stringify({ error: 'No CSV content provided' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Parse CSV
    const allRows = parseCSVRows(csvContent)
    if (allRows.length < 2) {
      return new Response(JSON.stringify({ error: 'CSV has no data rows' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const headers = allRows[0]

    // Build column index map
    const colIndex: Record<string, number> = {}
    headers.forEach((h, i) => { colIndex[h.trim()] = i })

    const getVal = (row: string[], col: string): string => {
      const idx = colIndex[col]
      if (idx === undefined || idx >= row.length) return ''
      return (row[idx] || '').trim()
    }
    const getNum = (row: string[], col: string): number | null => {
      const v = getVal(row, col)
      if (!v) return null
      const n = parseFloat(v)
      return isNaN(n) ? null : n
    }

    // Filter to rows with numeric ID and sufficient columns
    const propertyRows = allRows.slice(1).filter(row => {
      const id = getVal(row, 'ID')
      return id && /^\d+$/.test(id) && row.length >= 10
    })

    console.log(`Total property rows: ${propertyRows.length}`)

    // ========== SCAN-ONLY MODE ==========
    if (scanOnly) {
      const scanResults: { rowIndex: number; wpId: string; title: string; valid: boolean; issues: string[] }[] = []
      
      for (let i = 0; i < propertyRows.length; i++) {
        const row = propertyRows[i]
        const wpId = getVal(row, 'ID')
        const title = getVal(row, 'Title')
        const { valid, issues } = validateRow(row, getVal)
        scanResults.push({ rowIndex: i, wpId, title, valid, issues })
      }

      const validCount = scanResults.filter(r => r.valid).length
      const invalidCount = scanResults.filter(r => !r.valid).length

      return new Response(
        JSON.stringify({
          success: true,
          scanOnly: true,
          totalRows: propertyRows.length,
          validRows: validCount,
          invalidRows: invalidCount,
          scanResults,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ========== IMPORT MODE ==========

    // Clear existing properties if requested
    if (clearExisting) {
      const { error: deleteError } = await supabase.from('properties').delete().neq('id', '00000000-0000-0000-0000-000000000000')
      if (deleteError) {
        console.error('Failed to clear properties:', deleteError)
      } else {
        console.log('Cleared all existing properties')
      }
    }

    // Apply batch slicing if specified
    const rowsToProcess = (batchStart !== undefined && batchEnd !== undefined)
      ? propertyRows.slice(batchStart, batchEnd)
      : propertyRows

    console.log(`Processing rows ${batchStart ?? 0} to ${batchEnd ?? propertyRows.length} (${rowsToProcess.length} rows)`)
    const results: { title: string; wpId: string; success: boolean; imagesUploaded: number; imagesFailed: number; error?: string; skipped?: boolean }[] = []
    let totalSuccess = 0
    let totalFailed = 0
    let totalSkipped = 0

    for (const row of rowsToProcess) {
      const wpId = getVal(row, 'ID')
      const title = getVal(row, 'Title')

      // Pre-validate row before attempting import
      const { valid, issues } = validateRow(row, getVal)
      if (!valid) {
        results.push({ title: title || `Row ID ${wpId}`, wpId, success: false, imagesUploaded: 0, imagesFailed: 0, error: issues.join('; '), skipped: true })
        totalSkipped++
        totalFailed++
        console.log(`[SKIP] ${title || wpId}: ${issues.join('; ')}`)
        continue
      }

      const keywords = getVal(row, 'es_property_keywords') || ''
      const price = getNum(row, 'es_property_price')
      const bedrooms = getNum(row, 'es_property_bedrooms')
      const bathrooms = getNum(row, 'es_property_bathrooms')
      const halfBaths = getNum(row, 'es_property_half_baths')
      const floors = getNum(row, 'es_property_floors')
      const area = getNum(row, 'es_property_area')
      const yearBuilt = getNum(row, 'es_property_year_built')
      const latitude = getNum(row, 'es_property_latitude')
      const longitude = getNum(row, 'es_property_longitude')
      const garageSpaces = getNum(row, 'es_property_garage-spaces')
      const lotSize = getNum(row, 'es_property_lot_size')
      const yearRemodeled = getNum(row, 'es_property_year_remodeled')
      const province = getVal(row, 'es_property_province') || null
      const city = getVal(row, 'es_property_city') || null
      const address = getVal(row, 'es_property_address') || null
      const videoField = getVal(row, 'es_property_video')
      const altDesc = getVal(row, 'es_property_alternative_description')
      const condoName = getVal(row, 'es_property_condominio-residencial') || null

      // Images: pipe-separated URLs
      const imageUrlsRaw = getVal(row, 'Image URL')
      const imageUrls = imageUrlsRaw ? imageUrlsRaw.split('|').map(u => u.trim()).filter(u => u.startsWith('http')) : []

      // Determine fields
      const status = determineStatus(keywords)
      const propertyType = determinePropertyType(keywords)
      const videoUrl = parseVideoUrl(videoField)
      const description = cleanDescription(altDesc)
      const locationName = buildLocationName(address, province, city)
      const totalBathrooms = (bathrooms || 0) + (halfBaths ? 0.5 : 0)

      // Determine if price is sale or rent
      let priceSale: number | null = null
      let priceRent: number | null = null
      if (status === 'for_rent') {
        priceRent = price
      } else if (status === 'both') {
        if (price && price < 20000) {
          priceRent = price
        } else {
          priceSale = price
        }
      } else {
        priceSale = price
      }

      const tier = determineTier(priceSale || (priceRent ? priceRent * 200 : null))

      const result = { title, wpId, success: false, imagesUploaded: 0, imagesFailed: 0, error: undefined as string | undefined, skipped: false }

      try {
        // Download and upload images with timeout protection
        const uploadedImageUrls: string[] = []
        const propertyId = crypto.randomUUID()

        for (let i = 0; i < imageUrls.length; i++) {
          const imgUrl = imageUrls[i]
          try {
            // Skip .heic files (not browser-compatible)
            if (imgUrl.toLowerCase().endsWith('.heic')) {
              console.log(`Skipping HEIC image: ${imgUrl}`)
              result.imagesFailed++
              continue
            }

            // Use AbortController for per-image timeout (15s)
            const controller = new AbortController()
            const timeoutId = setTimeout(() => controller.abort(), 15000)

            const imgResponse = await fetch(imgUrl, {
              headers: { 'User-Agent': 'Mozilla/5.0 (compatible; DRHousing Migration)' },
              signal: controller.signal,
            })
            clearTimeout(timeoutId)

            if (!imgResponse.ok) {
              console.error(`Failed to download image ${i} for ${wpId}: ${imgResponse.status}`)
              result.imagesFailed++
              continue
            }

            const contentType = imgResponse.headers.get('content-type') || 'image/jpeg'
            const imageBuffer = await imgResponse.arrayBuffer()

            // Determine extension
            let ext = 'jpg'
            if (contentType.includes('png')) ext = 'png'
            else if (contentType.includes('webp')) ext = 'webp'
            else if (contentType.includes('avif')) ext = 'avif'
            else if (imgUrl.includes('.avif')) ext = 'avif'
            else if (imgUrl.includes('.png')) ext = 'png'
            else if (imgUrl.includes('.webp')) ext = 'webp'

            const filename = `${propertyId}/${Date.now()}-${i}.${ext}`

            const { error: uploadError } = await supabase.storage
              .from('property-images')
              .upload(filename, imageBuffer, { contentType, upsert: true })

            if (uploadError) {
              console.error(`Upload error for image ${i} of ${wpId}:`, uploadError)
              result.imagesFailed++
              continue
            }

            const { data: urlData } = supabase.storage
              .from('property-images')
              .getPublicUrl(filename)

            if (urlData?.publicUrl) {
              uploadedImageUrls.push(urlData.publicUrl)
              result.imagesUploaded++
            }
          } catch (imgErr) {
            // Handle timeout separately
            if (imgErr instanceof DOMException && imgErr.name === 'AbortError') {
              console.error(`Image ${i} timeout for ${wpId}: ${imgUrl}`)
            } else {
              console.error(`Image ${i} error for ${wpId}:`, imgErr)
            }
            result.imagesFailed++
          }
        }

        // Insert property
        const propertyData = {
          id: propertyId,
          title,
          status,
          price_sale: priceSale,
          price_rent_monthly: priceRent,
          currency: 'USD',
          bedrooms: bedrooms ? Math.floor(bedrooms) : 0,
          bathrooms: totalBathrooms,
          garage_spaces: garageSpaces ? Math.floor(garageSpaces) : 0,
          land_size_sqm: lotSize,
          construction_size_sqm: area,
          location_name: locationName,
          lat: latitude,
          lng: longitude,
          property_type: propertyType,
          tier,
          description,
          images: uploadedImageUrls,
          featured: false,
          year_built: yearBuilt ? Math.floor(yearBuilt) : null,
          year_renovated: yearRemodeled ? Math.floor(yearRemodeled) : null,
          levels: floors ? Math.floor(floors) : 1,
          building_name: condoName,
          youtube_url: videoUrl,
          youtube_enabled: !!videoUrl,
          has_storage: getVal(row, 'es_property_bodega') === '1',
          title_en: title,
          description_en: description,
          internal_reference: `WP-${wpId}`,
        }

        const { error: insertError } = await supabase
          .from('properties')
          .insert(propertyData)

        if (insertError) {
          throw insertError
        }

        // Trigger translation (fire and forget)
        supabase.functions.invoke('translate-property', {
          body: { propertyId },
        }).catch(err => console.error('Translation trigger failed:', err))

        result.success = true
        totalSuccess++
      } catch (err) {
        result.error = err instanceof Error ? err.message : 'Unknown error'
        totalFailed++
      }

      results.push(result)
      console.log(`[${totalSuccess + totalFailed}/${rowsToProcess.length}] ${result.success ? '✓' : '✗'} ${title} (${result.imagesUploaded} images)`)
    }

    return new Response(
      JSON.stringify({
        success: true,
        totalProperties: propertyRows.length,
        totalSuccess,
        totalFailed,
        totalSkipped,
        results,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Import error:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Import failed',
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
