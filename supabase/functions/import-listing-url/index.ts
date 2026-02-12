import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function extractMeta(html: string, property: string): string | null {
  // Match both property="..." and name="..."
  const patterns = [
    new RegExp(`<meta[^>]*property=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*property=["']${property}["']`, 'i'),
    new RegExp(`<meta[^>]*name=["']${property}["'][^>]*content=["']([^"']*)["']`, 'i'),
    new RegExp(`<meta[^>]*content=["']([^"']*)["'][^>]*name=["']${property}["']`, 'i'),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return match[1].trim();
  }
  return null;
}

function extractTitle(html: string): string {
  // Priority: og:title → h1 → title tag
  const ogTitle = extractMeta(html, 'og:title');
  if (ogTitle) return ogTitle;

  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match?.[1]) return h1Match[1].replace(/<[^>]+>/g, '').trim();

  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  if (titleMatch?.[1]) return titleMatch[1].trim();

  return '';
}

function extractDescription(html: string): string {
  // Priority: og:description → meta description → first long paragraph
  const ogDesc = extractMeta(html, 'og:description');
  if (ogDesc) return ogDesc;

  const metaDesc = extractMeta(html, 'description');
  if (metaDesc) return metaDesc;

  // Find content blocks - look for long paragraphs
  const paragraphs = html.match(/<p[^>]*>([\s\S]*?)<\/p>/gi) || [];
  const longParas = paragraphs
    .map(p => p.replace(/<[^>]+>/g, '').trim())
    .filter(p => p.length > 80);

  if (longParas.length > 0) {
    return longParas.slice(0, 5).join('\n\n');
  }

  return '';
}

function extractFeatures(html: string): string[] {
  const features: string[] = [];

  // Look for lists within common content sections
  const listMatches = html.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
  for (const li of listMatches) {
    const text = li.replace(/<[^>]+>/g, '').trim();
    // Only include reasonable-length items that look like features
    if (text.length > 3 && text.length < 200 && !text.includes('©') && !text.includes('http')) {
      features.push(text);
    }
    if (features.length >= 30) break;
  }

  return [...new Set(features)];
}

function extractImages(html: string, baseUrl: string): string[] {
  const images: string[] = [];
  const seen = new Set<string>();

  const addImage = (src: string) => {
    if (!src || seen.has(src)) return;
    // Skip tiny icons, tracking pixels, etc.
    if (src.includes('favicon') || src.includes('logo') || src.includes('icon') || src.includes('tracking') || src.includes('pixel')) return;
    if (src.startsWith('data:')) return;

    let fullUrl = src;
    if (src.startsWith('//')) {
      fullUrl = 'https:' + src;
    } else if (src.startsWith('/')) {
      try {
        const base = new URL(baseUrl);
        fullUrl = base.origin + src;
      } catch { return; }
    } else if (!src.startsWith('http')) {
      try {
        fullUrl = new URL(src, baseUrl).href;
      } catch { return; }
    }

    seen.add(fullUrl);
    images.push(fullUrl);
  };

  // og:image first
  const ogImage = extractMeta(html, 'og:image');
  if (ogImage) addImage(ogImage);

  // Gallery / content images
  const imgMatches = html.match(/<img[^>]*src=["']([^"']+)["'][^>]*>/gi) || [];
  for (const img of imgMatches) {
    const srcMatch = img.match(/src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) addImage(srcMatch[1]);
  }

  // Also check srcset and data-src attributes
  const dataSrcMatches = html.match(/data-src=["']([^"']+)["']/gi) || [];
  for (const match of dataSrcMatches) {
    const srcMatch = match.match(/data-src=["']([^"']+)["']/i);
    if (srcMatch?.[1]) addImage(srcMatch[1]);
  }

  // Background images in style attributes
  const bgMatches = html.match(/background-image:\s*url\(["']?([^"')]+)["']?\)/gi) || [];
  for (const match of bgMatches) {
    const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/i);
    if (urlMatch?.[1]) addImage(urlMatch[1]);
  }

  return images;
}

function extractPrice(html: string): { priceSale: number | null; priceRentMonthly: number | null } {
  // Look for price patterns in the HTML
  const pricePatterns = [
    /\$\s*([\d,]+(?:\.\d{2})?)/g,
    /USD\s*([\d,]+(?:\.\d{2})?)/gi,
    /price[^>]*>\s*\$?\s*([\d,]+(?:\.\d{2})?)/gi,
  ];

  const prices: number[] = [];
  for (const pattern of pricePatterns) {
    let match;
    while ((match = pattern.exec(html)) !== null) {
      const num = parseFloat(match[1].replace(/,/g, ''));
      if (num > 1000 && num < 100000000) {
        prices.push(num);
      }
    }
  }

  if (prices.length === 0) return { priceSale: null, priceRentMonthly: null };

  const price = prices[0];
  // Heuristic: under $10,000 likely rent
  if (price < 10000) {
    return { priceSale: null, priceRentMonthly: price };
  }
  return { priceSale: price, priceRentMonthly: null };
}

function extractBedBath(html: string): { bedrooms: number; bathrooms: number } {
  let bedrooms = 0;
  let bathrooms = 0;

  const bedPatterns = [
    /(\d+)\s*(?:bed(?:room)?s?|hab(?:itacion(?:es)?)?|rec[aá]maras?|dormitorios?)/gi,
    /bed(?:room)?s?\s*[:]\s*(\d+)/gi,
  ];
  const bathPatterns = [
    /(\d+(?:\.\d)?)\s*(?:bath(?:room)?s?|ba[ñn]os?)/gi,
    /bath(?:room)?s?\s*[:]\s*(\d+(?:\.\d)?)/gi,
  ];

  for (const p of bedPatterns) {
    const m = p.exec(html);
    if (m) { bedrooms = parseInt(m[1]); break; }
  }
  for (const p of bathPatterns) {
    const m = p.exec(html);
    if (m) { bathrooms = parseFloat(m[1]); break; }
  }

  return { bedrooms, bathrooms };
}

async function downloadAndUploadImage(
  imageUrl: string,
  supabaseAdmin: any,
  propertyFolder: string,
  index: number
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PropertyImporter/1.0)',
        'Accept': 'image/*',
      },
    });
    clearTimeout(timeout);

    if (!response.ok) return null;

    const contentType = response.headers.get('content-type') || 'image/jpeg';
    if (!contentType.startsWith('image/')) return null;

    const arrayBuffer = await response.arrayBuffer();
    if (arrayBuffer.byteLength < 1000) return null; // Skip tiny images

    const ext = contentType.includes('png') ? 'png'
      : contentType.includes('webp') ? 'webp'
      : 'jpg';

    const filePath = `${propertyFolder}/imported-${index}.${ext}`;

    const { error } = await supabaseAdmin.storage
      .from('property-images')
      .upload(filePath, arrayBuffer, {
        contentType,
        upsert: true,
      });

    if (error) {
      console.error(`Upload failed for image ${index}:`, error.message);
      return null;
    }

    const { data: publicUrlData } = supabaseAdmin.storage
      .from('property-images')
      .getPublicUrl(filePath);

    return publicUrlData?.publicUrl || null;
  } catch (err) {
    console.error(`Failed to download image ${index}:`, err);
    return null;
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url || typeof url !== 'string') {
      return new Response(
        JSON.stringify({ success: false, error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate URL
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
    } catch {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid URL format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching listing from:', parsedUrl.href);

    // Fetch the page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000);

    let pageResponse: Response;
    try {
      pageResponse = await fetch(parsedUrl.href, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5,es;q=0.3',
        },
      });
      clearTimeout(timeout);
    } catch (err) {
      clearTimeout(timeout);
      return new Response(
        JSON.stringify({ success: false, error: 'Could not reach the URL. The page may block scraping or be unavailable.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!pageResponse.ok) {
      return new Response(
        JSON.stringify({ success: false, error: `Page returned status ${pageResponse.status}. It may block automated access.` }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const html = await pageResponse.text();
    if (!html || html.length < 200) {
      return new Response(
        JSON.stringify({ success: false, error: 'Page returned very little content. It may require JavaScript to render.' }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Extract data
    const title = extractTitle(html);
    const description = extractDescription(html);
    const features = extractFeatures(html);
    const imageUrls = extractImages(html, parsedUrl.href);
    const { priceSale, priceRentMonthly } = extractPrice(html);
    const { bedrooms, bathrooms } = extractBedBath(html);

    // Download and upload images to Supabase Storage
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const propertyFolder = `imports/${crypto.randomUUID()}`;
    const uploadedImages: string[] = [];
    const failedImages: number[] = [];

    // Limit to 20 images max
    const imagesToProcess = imageUrls.slice(0, 20);
    console.log(`Processing ${imagesToProcess.length} images...`);

    for (let i = 0; i < imagesToProcess.length; i++) {
      const result = await downloadAndUploadImage(
        imagesToProcess[i],
        supabaseAdmin,
        propertyFolder,
        i
      );
      if (result) {
        uploadedImages.push(result);
      } else {
        failedImages.push(i);
      }
    }

    console.log(`Uploaded ${uploadedImages.length} images, ${failedImages.length} failed`);

    // Build the draft listing data
    const listing = {
      title: title || '',
      description: description || '',
      features,
      images: uploadedImages,
      priceSale,
      priceRentMonthly,
      bedrooms,
      bathrooms,
      status: priceRentMonthly && !priceSale ? 'for_rent' : 'for_sale',
      listingSource: 'colleague' as const,
      sourceUrl: parsedUrl.href,
    };

    const warnings: string[] = [];
    if (!title) warnings.push('Title not found — please enter manually');
    if (!description) warnings.push('Description not found on the page');
    if (uploadedImages.length === 0 && imageUrls.length > 0) warnings.push('Images were found but could not be downloaded');
    if (imageUrls.length === 0) warnings.push('No images found on the page');
    if (failedImages.length > 0) warnings.push(`${failedImages.length} image(s) could not be downloaded`);
    if (!priceSale && !priceRentMonthly) warnings.push('Price not detected — please enter manually');
    if (bedrooms === 0) warnings.push('Bedrooms not detected');

    return new Response(
      JSON.stringify({
        success: true,
        listing,
        warnings,
        stats: {
          imagesFound: imageUrls.length,
          imagesUploaded: uploadedImages.length,
          imagesFailed: failedImages.length,
          featuresFound: features.length,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Import error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'An unexpected error occurred' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
