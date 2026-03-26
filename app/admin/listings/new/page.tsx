'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft, Loader2, Sparkles, Link2,
  DollarSign, MapPin, Image as ImageIcon, X, Star,
} from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Status = 'for_sale' | 'for_rent' | 'for_sale_and_rent' | 'presale'
type Tier   = 'luxury' | 'high' | 'mid' | 'entry'

const STATUS_OPTIONS: { value: Status; label: string; desc: string; color: string }[] = [
  { value: 'for_sale',          label: 'For Sale',    desc: 'Ownership transfer',   color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
  { value: 'for_rent',          label: 'For Rent',    desc: 'Monthly lease',        color: 'border-blue-500 bg-blue-50 text-blue-900' },
  { value: 'for_sale_and_rent', label: 'Sale & Rent', desc: 'Both options',         color: 'border-yellow-500 bg-yellow-50 text-yellow-900' },
  { value: 'presale',           label: 'Pre-Sale',    desc: 'Development project',  color: 'border-purple-500 bg-purple-50 text-purple-900' },
]

const TIER_OPTIONS: { value: Tier; label: string; range: string }[] = [
  { value: 'luxury', label: 'Luxury',    range: '$800k+' },
  { value: 'high',   label: 'High-End',  range: '$350k-$800k' },
  { value: 'mid',    label: 'Mid-Range', range: '$120k-$350k' },
  { value: 'entry',  label: 'Entry',     range: 'Under $120k' },
]

const TYPE_OPTIONS = ['house','condo','apartment','land','commercial','office','farm','penthouse','townhouse','villa']

function makeSlug(title: string) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80) + '-' + Date.now()
}
export default function NewListingPage() {
  const router = useRouter()
  const [step, setStep] = useState<'intent' | 'details' | 'ai' | 'publish'>('intent')
  const [importUrl, setImportUrl] = useState('')
  const [importing, setImporting] = useState(false)
  const [importError, setImportError] = useState('')
  const [status, setStatus] = useState<Status>('for_sale')
  const [tier, setTier] = useState<Tier>('mid')
  const [propType, setPropType] = useState('house')
  const [title, setTitle] = useState('')
  const [titleName, setTitleName] = useState('')
  const [location, setLocation] = useState('')
  const [priceSale, setPriceSale] = useState('')
  const [priceRent, setPriceRent] = useState('')
  const [beds, setBeds] = useState('')
  const [baths, setBaths] = useState('')
  const [sqm, setSqm] = useState('')
  const [landSqm, setLandSqm] = useState('')
  const [rawNotes, setRawNotes] = useState('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [newImageUrl, setNewImageUrl] = useState('')
  const [titleEs, setTitleEs] = useState('')
  const [titleEn, setTitleEn] = useState('')
  const [subtitle, setSubtitle] = useState('')
  const [descEs, setDescEs] = useState('')
  const [descEn, setDescEn] = useState('')
  const [features, setFeatures] = useState('')
  const [amenities, setAmenities] = useState('')
  const [metaDesc, setMetaDesc] = useState('')
  const [generatingAI, setGeneratingAI] = useState(false)
  const [aiError, setAiError] = useState('')
  const [visibility, setVisibility] = useState<'public' | 'private'>('public')
  const [featured, setFeatured] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')

  const handleImport = useCallback(async () => {
    if (!importUrl.trim()) return
    setImporting(true); setImportError('')
    try {
      const { data, error } = await supabase.functions.invoke('import-listing-url', { body: { url: importUrl.trim() } })
      if (error) throw new Error(error.message)
      if (data?.title) setTitle(data.title)
      if (data?.title_name) setTitleName(data.title_name)
      if (data?.location_name) setLocation(data.location_name)
      if (data?.price_sale) setPriceSale(String(data.price_sale))
      if (data?.price_rent_monthly) setPriceRent(String(data.price_rent_monthly))
      if (data?.bedrooms) setBeds(String(data.bedrooms))
      if (data?.bathrooms) setBaths(String(data.bathrooms))
      if (data?.construction_size_sqm) setSqm(String(data.construction_size_sqm))
      if (data?.land_size_sqm) setLandSqm(String(data.land_size_sqm))
      if (data?.description) setRawNotes(data.description)
      if (data?.property_type) setPropType(data.property_type)
      if (data?.images?.length) setImageUrls(data.images)
      setStep('details')
    } catch (e: any) { setImportError(e.message ?? 'Import failed') }
    finally { setImporting(false) }
  }, [importUrl])

  const handleGenerate = useCallback(async () => {
    setGeneratingAI(true); setAiError('')
    try {
      const rawInput = [
        titleName && `Property name: ${titleName}`,
        `Type: ${propType}`, `Status: ${status}`, `Tier: ${tier}`,
        location && `Location: ${location}`,
        priceSale && `Sale price: $${priceSale}`,
        priceRent && `Rent: $${priceRent}/mo`,
        beds && `Bedrooms: ${beds}`,
        baths && `Bathrooms: ${baths}`,
        sqm && `Construction: ${sqm} mÂ²`,
        landSqm && `Land: ${landSqm} mÂ²`,
        rawNotes && `\nNotes:\n${rawNotes}`,
      ].filter(Boolean).join('\n')
      const statusCtx = {
        for_sale: 'FOCUS ON SALE: investment value, ownership benefits, appreciation',
        for_rent: 'FOCUS ON RENTAL: lifestyle, included services, flexibility',
        for_sale_and_rent: 'DUAL PURPOSE: balance sale and rental appeal',
        presale: 'FOCUS ON PRESALE: early-mover advantage, developer credibility',
      }[status]
      const systemPrompt = `You are a luxury real estate content specialist for DR Housing in Costa Rica.\n${statusCtx}\nGenerate SEO, GEO, AEO optimized content.\n- Title ES/EN: max 65 chars, location + type + key diff\n- Subtitle: editorial highlight phrase\nReturn ONLY valid JSON with: title_es, title_en, subtitle_es, description_es, description_en, features_es(array), features_en(array), amenities_es(array), meta_description_es`
      const { data, error } = await supabase.functions.invoke('ai-listing-generate', {
        body: { raw_input: rawInput, system_prompt_override: systemPrompt, status, tier, property_type: propType, location_name: location },
      })
      if (error) throw new Error(error.message)
      const result = typeof data === 'string' ? JSON.parse(data) : (data?.result ?? data)
      if (result.title_es) setTitleEs(result.title_es)
      if (result.title_en) setTitleEn(result.title_en)
      if (result.subtitle_es) setSubtitle(result.subtitle_es)
      if (result.description_es) setDescEs(result.description_es)
      if (result.description_en) setDescEn(result.description_en)
      if (result.features_es) setFeatures(Array.isArray(result.features_es) ? result.features_es.join('\n') : result.features_es)
      if (result.amenities_es) setAmenities(Array.isArray(result.amenities_es) ? result.amenities_es.join(', ') : result.amenities_es)
      if (result.meta_description_es) setMetaDesc(result.meta_description_es)
      setStep('publish')
    } catch (e: any) { setAiError(e.message ?? 'AI generation failed') }
    finally { setGeneratingAI(false) }
  }, [status, tier, propType, location, priceSale, priceRent, beds, baths, sqm, landSqm, rawNotes, titleName])

  const handleSave = async () => {
    if (!title && !titleEs) { setSaveError('Add a title first'); return }
    setSaving(true); setSaveError('')
    const finalTitle = titleEs || title
    const slug = makeSlug(finalTitle)
    const featureArray = features.split('\n').map(s => s.trim()).filter(Boolean)
    const amenityArray = amenities.split(',').map(s => s.trim()).filter(Boolean)
    const { error } = await supabase.from('properties').insert({
      title: finalTitle, title_es: titleEs || null, title_en: titleEn || null,
      subtitle: subtitle || null, description: descEs || null,
      description_es: descEs || null, description_en: descEn || null,
      features_es: featureArray.length ? featureArray : null,
      features_en: featureArray.length ? featureArray : null,
      amenities_es: amenityArray.length ? amenityArray : null,
      amenities_en: amenityArray.length ? amenityArray : null,
      location_name: location || null, property_type: propType, status, tier,
      price_sale: priceSale ? parseInt(priceSale) : null,
      price_rent_monthly: priceRent ? parseInt(priceRent) : null,
      bedrooms: beds ? parseInt(beds) : 0,
      bathrooms: baths ? parseFloat(baths) : 0,
      construction_size_sqm: sqm ? parseInt(sqm) : null,
      land_size_sqm: landSqm ? parseInt(landSqm) : null,
      images: imageUrls.length ? imageUrls : null,
      visibility, hidden: visibility !== 'public', featured,
      currency: 'USD', slug,
      encuentra24_published: 'false', facebook_published: 'false',
    })
    if (error) { setSaveError(error.message); setSaving(false); return }
    router.push('/admin/listings')
  }
  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/listings" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-semibold">Add Listing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step === 'intent' && 'Step 1 â Set purpose & type'}
            {step === 'details' && 'Step 2 â Property details'}
            {step === 'ai' && 'Step 3 â AI content'}
            {step === 'publish' && 'Step 4 â Publish'}
          </p>
        </div>
      </div>

      <div className="flex gap-1.5 mb-8">
        {['intent','details','ai','publish'].map((s,i) => (
          <div key={s} className={`h-1 flex-1 rounded-full transition-colors ${
            ['intent','details','ai','publish'].indexOf(step) >= i ? 'bg-primary' : 'bg-border'
          }`} />
        ))}
      </div>

      {step === 'intent' && (
        <div className="space-y-8">
          <div className="card-elevated p-5">
            <div className="flex items-center gap-2 mb-3">
              <Link2 className="w-4 h-4 text-primary" />
              <h2 className="font-medium text-sm">Quick Import from URL</h2>
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Paste any listing URL â we'll extract title, location, price, specs and images automatically.</p>
            <div className="flex gap-2">
              <input value={importUrl} onChange={e => setImportUrl(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleImport()}
                placeholder="https://www.remax.cr/listing/12345..."
                className="flex-1 px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={handleImport} disabled={importing || !importUrl.trim()}
                className="px-4 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
            {importError && <p className="text-xs text-destructive mt-2">{importError}</p>}
          </div>

          <div>
            <h2 className="font-medium text-sm mb-1">Primary purpose <span className="text-destructive">*</span></h2>
            <p className="text-xs text-muted-foreground mb-3">This shapes the AI content focus â choose before generating.</p>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setStatus(opt.value)}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${status === opt.value ? opt.color : 'border-border hover:border-muted-foreground/30'}`}>
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs opacity-70 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-medium text-sm mb-3">Property type <span className="text-destructive">*</span></h2>
            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map(t => (
                <button key={t} onClick={() => setPropType(t)}
                  className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${
                    propType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-input text-muted-foreground hover:border-primary/40'}`}>{t}</button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-medium text-sm mb-3">Market tier</h2>
            <div className="grid grid-cols-4 gap-2">
              {TIER_OPTIONS.map(t => (
                <button key={t.value} onClick={() => setTier(t.value)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    tier === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.range}</div>
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => setStep('details')}
            className="w-full py-3 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90">
            Continue to Details â
          </button>
        </div>
      )}

      {step === 'details' && (
        <div className="space-y-6">
          <div className="card-elevated p-5 space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Property name <span className="text-muted-foreground font-normal text-xs ml-1">(e.g. &quot;Casa Amari&quot;)</span></label>
              <input value={titleName} onChange={e => setTitleName(e.target.value)} placeholder="Casa Amari"
                className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Listing title <span className="text-muted-foreground font-normal text-xs ml-1">(AI will improve)</span></label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="3BR House with Pool - EscazÃº"
                className=ÜµÕ±°Áà´ÌÁä´È¸Ô½ÉÈ½ÉÈµ¥¹ÁÕÐÉ½Õ¹µ­É½Õ¹ÑáÐµÍ´½ÕÌé½ÕÑ±¥¹µ¹½¹½ÕÌéÉ¥¹´È½ÕÌéÉ¥¹µÁÉ¥µÉä¼ÈÀ¼ø(ð½¥Øø(ñ¥Øø(ñ±°±ÍÍ9µôÑáÐµÍ´½¹Ðµµ¥Õ´µ´Ä±½¬±à¥ÑµÌµ¹ÑÈÀ´Äøñ5ÁA¥¸±ÍÍ9µôÜ´Ì¸Ô ´Ì¸Ô¼ø1½Ñ¥½¸ñÍÁ¸±ÍÍ9µôÑáÐµÍÑÉÕÑ¥Ùø¨ð½ÍÁ¸øð½±°ø(ñ¥¹ÁÕÐÙ±Õõí±½Ñ¥½¹ô½¹
¡¹õíôøÍÑ1½Ñ¥½¸¡¹ÑÉÐ¹Ù±Õ¥ôÁ±¡½±ÈôÍëè°M¸)½Ï¤°
½ÍÑI¥(±ÍÍ9µö'rÖgVÆÂÓ2Ó"ãR&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæRfö7W3§&ærÓ"fö7W3§&ær×&Ö'ó#"óà¢ÂöFcà¢ÆFb6Æ74æÖS×¶w&BvÓ2G·7FGW2ÓÓÒvf÷%÷6ÆUöæE÷&VçBròvw&BÖ6öÇ2Ó"r¢vw&BÖ6öÇ2ÓwÖÓà¢²7FGW2ÓÓÒvf÷%÷6ÆRrÇÂ7FGW2ÓÓÒvf÷%÷6ÆUöæE÷&VçBrÇÂ7FGW2ÓÓÒw&W6ÆRrbb¢ÆFcà¢ÆÆ&VÂ6Æ74æÖSÒ'FWB×6ÒföçBÖÖVFVÒÖ"Ó&Æö6²fÆWFV×2Ö6VçFW"vÓ#ãÄFöÆÆ%6vâ6Æ74æÖSÒ'rÓ2ãRÓ2ãR"óâ6ÆR&6RU4BÂöÆ&VÃà¢ÆçWBGSÒ&çVÖ&W""fÇVS×·&6U6ÆWÒöä6ævS×¶RÓâ6WE&6U6ÆRRçF&vWBçfÇVRÒÆ6VöÆFW#Ò#3S ¢6Æ74æÖSÒ'rÖgVÆÂÓ2Ó"ãR&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæRfö7W3§&ærÓ"fö7W3§&ær×&Ö'ó#"óà¢ÂöFcà¢Ð¢²7FGW2ÇÂ7FGW2ÓÓÒvf÷%÷&VçBrÇÂ7FGW2ÓÓÒvf÷%÷6ÆUöæE÷&VçBrbb¢ÆFcà¢ÆÆ&VÂ6Æ74æÖSÒ'FWB×6ÒföçBÖÖVFVÒÖ"Ó&Æö6²fÆWFV×2Ö6VçFW"vÓ#ãÄFöÆÆ%6vâ6Æ74æÖSÒ'rÓ2ãRÓ2ãR"óâ&VçBòÖöçFU4BÂöÆ&VÃà¢ÆçWBGSÒ&çVÖ&W""fÇVS×·&6U&VçGÒöä6ævS×¶RÓâ6WE&6U&VçBRçF&vWBçfÇVRÒÆ6VöÆFW#Ò##S ¢6Æ74æÖSÒ'rÖgVÆÂÓ2Ó"ãR&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæRfö7W3§&ærÓ"fö7W3§&ær×&Ö'ó#"óà¢ÂöFcà¢Ð¢ÂöFcà¢ÆFb6Æ74æÖSÒ&w&Bw&BÖ6öÇ2Ó"6Ó¦w&BÖ6öÇ2ÓBvÓ2#à¢²°¢²Æ&VÃ¢t&VG2rÂfÇVS¢&VG2Âöä6ævS¢6WD&VG2Â¢s2rÒÀ¢²Æ&VÃ¢t&F2rÂfÇVS¢&F2Âöä6ævS¢6WD&F2Â¢s"rÒÀ¢²Æ&VÃ¢t'VÆBÕÇS#"rÂfÇVS¢7ÒÂöä6ævS¢6WE7ÒÂ¢srÒÀ¢²Æ&VÃ¢tÆæBÕÇS#"rÂfÇVS¢ÆæE7ÒÂöä6ævS¢6WDÆæE7ÒÂ¢sSrÒÀ¢ÒæÖbÓâ¢ÆFb¶W×¶bæÆ&VÇÓà¢ÆÆ&VÂ6Æ74æÖSÒ'FWB×2föçBÖÖVFVÒÖ"Ó&Æö6²FWBÖ×WFVBÖf÷&Vw&÷VæBWW&66RG&6¶ær×vFR#ç¶bæÆ&VÇÓÂöÆ&VÃà¢ÆçWBGSÒ&çVÖ&W""fÇVS×¶bçfÇVWÒöä6ævS×¶RÓâbæöä6ævRRçF&vWBçfÇVRÒÆ6VöÆFW#×¶bçÐ¢6Æ74æÖSÒ'rÖgVÆÂÓ2Ó"&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæRfö7W3§&ærÓ"fö7W3§&ær×&Ö'ó#"óà¢ÂöFcà¢Ð¢ÂöFcà¢ÆFcà¢ÆÆ&VÂ6Æ74æÖSÒ'FWB×6ÒföçBÖÖVFVÒÖ"Ó"&Æö6²fÆWFV×2Ö6VçFW"vÓ#ãÄÖvT6öâ6Æ74æÖSÒ'rÓ2ãRÓ2ãR"óâÖvW3ÂöÆ&VÃà¢ÆFb6Æ74æÖSÒ&fÆWvÓ"Ö"Ó"#à¢ÆçWBfÇVS×¶æWtÖvUW&ÇÒöä6ævS×¶RÓâ6WDæWtÖvUW&ÂRçF&vWBçfÇVRÐ¢öä¶WF÷vã×¶RÓâ²bRæ¶WÓÓÒtVçFW"rbbæWtÖvUW&ÂçG&Ò²6WDÖvUW&Ç2Óâ²ââçÂæWtÖvUW&ÂçG&ÒÒ²6WDæWtÖvUW&ÂrrÒ×Ð¢Æ6VöÆFW#Ò%7FRÖvRU$ÂæB&W72VçFW"âââ ¢6Æ74æÖSÒ&fÆWÓÓ2Ó"&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæR"óà¢Æ'WGFöâöä6Æ6³×²Óâ²bæWtÖvUW&ÂçG&Ò²6WDÖvUW&Ç2Óâ²ââçÂæWtÖvUW&ÂçG&ÒÒ²6WDæWtÖvUW&ÂrrÒ×Ð¢6Æ74æÖSÒ'Ó2Ó"&÷VæFVB&÷&FW"&÷&FW"ÖçWBFWB×6ÒFWBÖ×WFVBÖf÷&Vw&÷VæB÷fW#§FWBÖf÷&Vw&÷VæB#äFCÂö'WGFöãà¢ÂöFcà¢¶ÖvUW&Ç2æÆVæwFâbb¢ÆFb6Æ74æÖSÒ&fÆWfÆW×w&vÓ"#à¢¶ÖvUW&Ç2æÖW&ÂÂÓâ¢ÆFb¶W×¶Ò6Æ74æÖSÒ'&VÆFfRw&÷W#à¢ÆÖr7&3×·W&ÇÒÇCÒ""6Æ74æÖSÒ'rÓbÓbö&¦V7BÖ6÷fW"&÷VæFVB&÷&FW""óà¢Æ'WGFöâöä6Æ6³×²Óâ6WDÖvUW&Ç2ÓâæfÇFW"òÂ¢Óâ¢ÓÒÐ¢6Æ74æÖSÒ&'6öÇWFR×F÷ÓãR×&vBÓãRrÓBÓB&÷VæFVBÖgVÆÂ&rÖFW7G'V7FfRFWB×vFRfÆWFV×2Ö6VçFW"§W7FgÖ6VçFW"÷6GÓw&÷WÖ÷fW#¦÷6GÓ#à¢Å6Æ74æÖSÒ'rÓ"ãRÓ"ãR"óà¢Âö'WGFöãà¢ÂöFcà¢Ð¢ÂöFcà¢Ð¢ÂöFcà¢ÂöFcà ¢ÆFb6Æ74æÖSÒ&6&BÖVÆWfFVBÓR#à¢ÆÆ&VÂ6Æ74æÖSÒ'FWB×6ÒföçBÖÖVFVÒÖ"Ó&Æö6²fÆWFV×2Ö6VçFW"vÓ#à¢Å7&¶ÆW26Æ74æÖSÒ'rÓ2ãRÓ2ãRFWB×&Ö'"óâ&ræ÷FW2f÷"¢Ç7â6Æ74æÖSÒ'FWBÖ×WFVBÖf÷&Vw&÷VæBföçBÖæ÷&ÖÂFWB×2ÖÂÓ#â7FRçFærÒFW67&FöâÂvÆvG2Âæ÷FW2Â÷7ãà¢ÂöÆ&VÃà¢ÇFWF&VfÇVS×·&tæ÷FW7Òöä6ævS×¶RÓâ6WE&tæ÷FW2RçF&vWBçfÇVRÒ&÷w3×³WÐ¢Æ6VöÆFW#Ò%6ævÆRÆWfVÂÂÖ÷VçFâfWw2Â&fFRööÂÂÖâg&öÒ6çFævvâââ ¢6Æ74æÖSØËY[LÈKLHÜ\Ü\Z[]Ý[YËXXÚÙÜÝ[^\ÛHØÝ\ÎÝ][K[ÛHØÝ\Î[ËLØÝ\Î[Ë\[X\KÌ\Ú^K[ÛHÏÙ]]Û\ÜÓ[YOH^Ø\LÈ]ÛÛÛXÚÏ^Ê
HOÙ]Ý\
	Ú[[	Ê_HÛ\ÜÓ[YOH^LHKLHÝ[YÜ\Ü\XÜ\^\ÛHÝ\Ë\ÙXÛÛ\H8¡¤XÚÂØ]Û]ÛÛÛXÚÏ^Ê
HOÙ]Ý\
	ØZIÊ_HÛ\ÜÓ[YOHNKLHÝ[YË\[X\H^\[X\KYÜYÜÝ[^\ÛHÛ[YY][HÝ\Ë\[X\KÎLÛÛ[YHÈRH8¡¤Ø]ÛÙ]Ù]
_B      {step === 'ai' && (
        <div className="space-y-6">
          <div className="card-elevated p-5">
            <h2 className="font-medium text-sm mb-3">AI will generate content optimized for:</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                {STATUS_OPTIONS.find(s => s.value === status)?.label}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium capitalize">{propType}</span>
              <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium capitalize">
                {TIER_OPTIONS.find(t => t.value === tier)?.label}
              </span>
              {location && <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium">ð {location}</span>}
            </div>
            <p className="text-xs text-muted-foreground">Generates bilingual (ES/EN) titles, subtitles, descriptions, features, amenities &amp; SEO meta â all tuned for the purpose you selected.</p>
          </div>

          <button onClick={handleGenerate} disabled={generatingAI}
            className="w-full py-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-3">
            {generatingAI
              ? <><Loader2 className="w+zg§·RÓRæÖFR×7â"óâvVæW&Fær4Tò²tTò²Tò6öçFVçN(
cÂóà¢¢ÃãÅ7&¶ÆW26Æ74æÖSÒ'rÓRÓR"óâvVæW&FR6öçFVçCÂóçÐ¢Âö'WGFöãà¢¶W'&÷"bbÇ6Æ74æÖSÒ'FWB×6ÒFWBÖFW7G'V7FfR#ç¶W'&÷'ÓÂ÷çÐ¢ÆFb6Æ74æÖSÒ'FWBÖ6VçFW"#à¢Æ'WGFöâöä6Æ6³×²Óâ6WE7FWwV&Æ6rÒ6Æ74æÖSÒ'FWB×2FWBÖ×WFVBÖf÷&Vw&÷VæB÷fW#§FWBÖf÷&Vw&÷VæBVæFW&ÆæR#à¢6¶(	BV&Æ6vF&rFF¢Âö'WGFöãà¢ÂöFcà¢Æ'WGFöâöä6Æ6³×²Óâ6WE7FWvFWFÇ2rÒ6Æ74æÖSÒ'r·¦z{u-full py-2.5 rounded border border-border text-sm hover:bg-secondary">
            â Back to Details
          </button>
        </div>
      )}

      {step === 'publish' && (
        <div className="space-y-5">
          {titleEs && (
            <div className="card-elevated p-5 space-y-4">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-primary" />
                <h2 className="font-medium text-sm">AI Generated Content</h2>
                <span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Ready</span>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Title ES</label>
                  <input value={titleEs} onChange={e => setTitleEs(e.target.value)} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /></div>
                <div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Title EN</label>
                  <input value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w[LÈKLÜ\Ü\Z[]Ý[YËXXÚÙÜÝ[^\ÛHØÝ\ÎÝ][K[ÛHÏÙ]Ù]]X[Û\ÜÓ[YOH^^È^[]]YYÜYÜÝ[\\Ø\ÙHXÚÚ[Ë]ÚYHXLHØÚÈÝX]OÛX[[][YO^ÜÝX]_HÛÚ[ÙO^ÙHOÙ]ÝX]JK\Ù][YJ_HÛ\ÜÓ[YOHËY[LÈKLÜ\Ü\Z[]Ý[YËXXÚÙÜÝ[^\ÛHØÝ\ÎÝ][K[ÛHÏÙ]]X[Û\ÜÓ[YOH^^È^[]]YYÜYÜÝ[\\Ø\ÙHXÚÚ[Ë]ÚYHXLHØÚÈ\ØÜ\[ÛTÏÛX[^\XH[YO^Ù\ØÑ\ßHÛÚ[ÙO^ÙHOÙ]\ØÑ\ÊK\Ù][YJ_HÝÜÏ^ÍHÛ\ÜÓ[YOHÆgVÆÂÓ2Ó"&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæR&W6¦RÖæöæR"óãÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ'FWB×2FWBÖ×WFVBÖf÷&Vw&÷VæBWW&66RG&6¶ær×vFRÖ"Ó&Æö6²#äfVGW&W2öæRW"ÆæRÂöÆ&VÃà¢ÇFWF&VfÇVS×¶fVGW&W7Òöä6ævS×¶RÓâ6WDfVGW&W2RçF&vWBçfÇVRÒ&÷w3×³WÒ6Æ74æÖSÒ'rÖgVÆÂÓ2Ó"&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæR&W6¦RÖæöæRföçBÖÖöæò"óãÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ'FWB×2FWBÖ×WFVBÖf÷&Vw&÷VæBWW&66RG&6¶ær×vFRÖ"Ó&Æö6²#äÖVæFW26öÖÖ6W&FVBÂöÆ&VÃà¢ÆçWBfÇVS×¶ÖVæFW7Òöä6ævS×¶RÓâ6WDÖVæFW2RçF&vWBçfÇVRÒ6Æ74æÖSÒ'rÖgVÆÂÓ2Ó"&÷&FW"&÷&FW"ÖçWB&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæR"óãÂöFcà¢ÆFcãÆÆ&VÂ6Æ74æÖSÒ'FWB×2FWBÖ×WFVBÖf÷&Vw&÷VæBWW&66RG&6¶ær×vFRÖ"Ó&Æö6²#å4TòÖWFÇ7â6Æ74æÖSÒ'FWBÕ³Ò#â¶ÖWFFW62æÆVæwFÒóSRÂ÷7ããÂöÆ&VÃà¢ÆçWBfÇVS×¶ÖWFFW67Òöä6ævS×¶RÓâ6WDÖWFFW62RçF&vWBçfÇVRÒÖÆVæwF×³cÒ6Æ74æÖS×¶rÖgVÆÂÓ2Ó"&÷&FW"&÷VæFVB&rÖ&6¶w&÷VæBFWB×6Òfö7W3¦÷WFÆæRÖæöæRG¶ÖWFFW62æÆVæwFâSRòv&÷&FW"ÖFW7G'V7FfRr¢v&÷&FW"ÖçWBwÖÒóãÂöFcà¢ÂöFcà¢Ð ¢ÆFb6Æ74æÖSÒ&6&BÖVÆWfFVBÓR76R×ÓB#à¢Æ"6Æ74æÖSÒ&föçBÖÖVFVÒFWB×6ÒÖ"Ó2#åV&Æ6ær6WGFæw3Âö#à¢ÆFb6Æ74æÖSÒ&w&Bw&BÖ6öÇ2Ó"vÓ2#à¢µ·²fÇVS¢wV&Æ2rÂÆ&VÃ¢uV&Æ2rÂFW63¢uf6&ÆRFòWfW'öæRrÂ6öã¢øÉrÒÀ¢²fÇVS¢w&fFRrÂÆ&VÃ¢u&fFRrÂFW63¢tÆæ²öæÇ²ârÂ6öã¢	ùJ"rÐ¢ÒæÖbÓâ¢Æ'WGFöâ¶W×·bçfÇVWÒöä6Æ6³×²Óâ6WEf6&ÆGbçfÇVR2çÐ¢6Æ74æÖS×¶Ó2&÷VæFVBÖÆr&÷&FW"Ó"FWBÖÆVgBG&ç6FöâÖÆÂG°¢f6&ÆGÓÓÒbçfÇVRòv&÷&FW"×&Ö'&r×&Ö'óRr¢v&÷&FW"Ö&÷&FW"÷fW#¦&÷&FW"Ö×WFVBÖf÷&Vw&÷VæBó3p¢ÖÓà¢ÆFb6Æ74æÖSÒ&föçBÖÖVFVÒFWB×6Ò#ç·bæ6öçÒ·bæÆ&VÇÓÂöFcà¢ÆFb6Æ74æÖSÒ'FWB×2FWBÖ×WFVBÖf÷&Vw&÷VæB×BÓãR#ç·bæFW67ÓÂöFcà¢Âö'WGFöãà¢Ð¢ÂöFcà¢ÆÆ&VÂ6Æ74æÖSÒ&fÆWFV×2Ö6VçFW"vÓ27W'6÷"×öçFW"#à¢ÆçWBGSÒ&6V6¶&÷"6V6¶VC×¶fVGW&VGÒöä6ævS×¶RÓâ6WDfVGW&VBRçF&vWBæ6V6¶VBÒ6Æ74æÖSÒ'r·¦z{t h-4 rounded" />
              <div>
                <div className="text-sm font-medium flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Feature on homepage</div>
                <div className="text-xs text-muted-foreground">Appears in the featured properties section</div>
              </div>
            </label>
          </div>

          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep('ai')} className="flex-1 py-2.5 rounded border border-border text-sm hover:bg-secondary">
              â Back
            </button>
            <button onClick={handleSave} disabled={saving}
              className="px-8 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Savingâ¦</> : 'â Publish Listing'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
