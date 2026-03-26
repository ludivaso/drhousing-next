'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Loader2, Sparkles, Link2, DollarSign, MapPin, Image as ImageIcon, X, Star } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

type Status = 'for_sale' | 'for_rent' | 'for_sale_and_rent' | 'presale'
type Tier = 'luxury' | 'high' | 'mid' | 'entry'

const STATUS_OPTIONS = [
  { value: 'for_sale' as Status, label: 'For Sale', desc: 'Ownership transfer', color: 'border-emerald-500 bg-emerald-50 text-emerald-900' },
  { value: 'for_rent' as Status, label: 'For Rent', desc: 'Monthly lease', color: 'border-blue-500 bg-blue-50 text-blue-900' },
  { value: 'for_sale_and_rent' as Status, label: 'Sale & Rent', desc: 'Both options', color: 'border-yellow-500 bg-yellow-50 text-yellow-900' },
  { value: 'presale' as Status, label: 'Pre-Sale', desc: 'Development project', color: 'border-purple-500 bg-purple-50 text-purple-900' },
]

const TIER_OPTIONS = [
  { value: 'luxury' as Tier, label: 'Luxury', range: '$800k+' },
  { value: 'high' as Tier, label: 'High-End', range: '$350k-$800k' },
  { value: 'mid' as Tier, label: 'Mid-Range', range: '$120k-$350k' },
  { value: 'entry' as Tier, label: 'Entry', range: 'Under $120k' },
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
    } catch (e: unknown) {
      setImportError(e instanceof Error ? e.message : 'Import failed')
    } finally { setImporting(false) }
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
        sqm && `Construction: ${sqm} m2`,
        landSqm && `Land: ${landSqm} m2`,
        rawNotes && `\nNotes:\n${rawNotes}`,
      ].filter(Boolean).join('\n')
      const statusCtx: Record<Status, string> = {
        for_sale: 'FOCUS ON SALE: investment value, ownership benefits, capital appreciation',
        for_rent: 'FOCUS ON RENTAL: lifestyle, included services, flexibility, move-in readiness',
        for_sale_and_rent: 'DUAL PURPOSE: balance sale investment appeal with rental lifestyle benefits',
        presale: 'FOCUS ON PRESALE: early-mover advantage, developer credibility, pre-construction pricing',
      }
      const systemPrompt = `You are a luxury real estate content specialist for DR Housing in Costa Rica.\n${statusCtx[status]}\nGenerate SEO, GEO, AEO optimized content.\n- Title ES/EN: max 65 chars, include location + property type + key differentiator\n- Subtitle: editorial highlight phrase\nReturn ONLY valid JSON with keys: title_es, title_en, subtitle_es, description_es, description_en, features_es (array), features_en (array), amenities_es (array), meta_description_es`
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
    } catch (e: unknown) {
      setAiError(e instanceof Error ? e.message : 'AI generation failed')
    } finally { setGeneratingAI(false) }
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
        <Link href="/admin/listings" className="text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="font-serif text-2xl font-semibold">Add Listing</h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            {step === 'intent' && 'Step 1 - Set purpose & type'}
            {step === 'details' && 'Step 2 - Property details'}
            {step === 'ai' && 'Step 3 - AI content generation'}
            {step === 'publish' && 'Step 4 - Review & publish'}
          </p>
        </div>
      </div>
      <div className="flex gap-1.5 mb-8">
        {['intent','details','ai','publish'].map((s, i) => (
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
              <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">Optional</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">Paste any listing URL - we will extract title, location, price, specs and images automatically.</p>
            <div className="flex gap-2">
              <input value={importUrl} onChange={e => setImportUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleImport()} placeholder="https://www.remax.cr/listing/12345 or any portal URL..." className="flex-1 px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              <button onClick={handleImport} disabled={importing || !importUrl.trim()} className="px-4 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center gap-2 whitespace-nowrap">
                {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Link2 className="w-4 h-4" />}
                {importing ? 'Importing...' : 'Import'}
              </button>
            </div>
            {importError && <p className="text-xs text-destructive mt-2">{importError}</p>}
          </div>
          <div>
            <h2 className="font-medium text-sm mb-1">Primary purpose <span className="text-destructive">*</span></h2>
            <p className="text-xs text-muted-foreground mb-3">This shapes the AI content focus - choose before generating.</p>
            <div className="grid grid-cols-2 gap-3">
              {STATUS_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setStatus(opt.value)} className={`p-4 rounded-lg border-2 text-left transition-all ${status === opt.value ? opt.color : 'border-border hover:border-muted-foreground/30'}`}>
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
                <button key={t} onClick={() => setPropType(t)} className={`px-3 py-1.5 rounded-full text-sm border transition-colors capitalize ${propType === t ? 'bg-primary text-primary-foreground border-primary' : 'border-input text-muted-foreground hover:border-primary/40'}`}>{t}</button>
              ))}
            </div>
          </div>
          <div>
            <h2 className="font-medium text-sm mb-3">Market tier</h2>
            <div className="grid grid-cols-4 gap-2">
              {TIER_OPTIONS.map(t => (
                <button key={t.value} onClick={() => setTier(t.value)} className={`p-3 rounded-lg border text-center transition-all ${tier === t.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}>
                  <div className="font-medium text-sm">{t.label}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{t.range}</div>
                </button>
              ))}
            </div>
          </div>
          <button onClick={() => setStep('details')} className="w4full py-3 rounded bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-colors">Continue to Details</button>
        </div>
      )}
      {step === 'details' && (
        <div className="space-y-6">
          <div className="card-elevated p-5 space-y-4">
            <div><label className="text-sm font-medium mb-1 block">Property / Project name <span className="text-muted-foreground font-normal text-xs ml-1">(e.g. Casa Amari, Reserva Verde)</span></label>
              <input value={titleName} onChange={e => setTitleName(e.target.value)} placeholder="Casa Amari" className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-sm font-medium mb-1 block">Listing title <span className="text-muted-foreground font-normal text-xs ml-1">(AI may improve this)</span></label>
              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="3BR House with Pool - Escazu" className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div><label className="text-sm font-medium mb-1 block flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location <span className="text-destructive">*</span></label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="Escazu, San Jose, Costa Rica" className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" /></div>
            <div className={`grid gap-3 ${status === 'for_sale_and_rent' ? 'grid-cols-2' : 'grid-cols-1'}`}>
              {(!status || status === 'for_sale' || status === 'for_sale_and_rent' || status === 'presale') && (<div><label className="text-sm font-medium mb-1 block flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Sale price (USD)</label><input type="number" value={priceSale} onChange={e => setPriceSale(e.target.value)} placeholder="350000" className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none" /></div>)}
              {(status === 'for_rent' || status === 'for_sale_and_rent') && (<div><label className="text-sm font-medium mb-1 block flex items-center gap-1"><DollarSign className="w-3.5 h-3.5" /> Rent / month (USD)</label><input type="number" value={priceRent} onChange={e => setPriceRent(e.target.value)} placeholder="2500" className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none" /></div>)}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[{ label: 'Beds', value: beds, onChange: setBeds, ph: '3' },{ label: 'Baths', value: baths, onChange: setBaths, ph: '2' },{ label: 'Build m2', value: sqm, onChange: setSqm, ph: '180' },{ label: 'Land m2', value: landSqm, onChange: setLandSqm, ph: '500' }].map(f => (<div key={f.label}><label className="text-xs font-medium mb-1 block text-muted-foreground uppercase tracking-wide">{f.label}</label><input type="number" value={f.value} onChange={e => f.onChange(e.target.value)} placeholder={f.ph} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /></div>))}
            </div>
            <div><label className="text-sm font-medium mb-2 block flex items-center gap-1"><ImageIcon className="w-3.5 h-3.5" /> Images</label>
              <div className="flex gap-2 mb-2"><input value={newImageUrl} onChange={e => setNewImageUrl(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newImageUrl.trim()) { setImageUrls(p => [...p, newImageUrl.trim()]); setNewImageUrl('') }}} placeholder="Paste image URL and press Enter..." className="flex-1 px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /><button onClick={() => { if (newImageUrl.trim()) { setImageUrls(p => [...p, newImageUrl.trim()]); setNewImageUrl('') }}} className="px-3 py-2 rounded border border-input text-sm text-muted-foreground hover:text-foreground">Add</button></div>
              {imageUrls.length > 0 && (<div className="flex flex-wrap gap-2">{imageUrls.map((url, i) => (<div key={i} className="relative group"><img src={url} alt="" className="w-16 h-16 object-cover rounded border" /><button onClick={() => setImageUrls(p => p.filter((_, j) => j !== i))} className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X className="w-2.5 h-2.5" /></button></div>))}</div>)}
            </div>
          </div>
          <div className="card-elevated p-5"><label className="text-sm font-medium mb-1 block flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-primary" /> Raw notes for AI <span className="text-muted-foreground font-normal text-xs ml-1">(paste anything - description, highlights, agent notes)</span></label><textarea value={rawNotes} onChange={e => setRawNotes(e.target.value)} rows={5} placeholder="e.g. Single level, mountain views, private pool, 10 min from Santa Ana highway..." className="w-full px-3 py-2.5 border border-input rounded bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none" /></div>
          <div className="flex gap-3"><button onClick={() => setStep('intent')} className="flex-1 py-2.5 rounded border border-border text-sm hover:bg-secondary transition-colors">Back</button><button onClick={() => setStep('ai')} className="px-8 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">Continue to AI</button></div>
        </div>
      )}
      {step === 'ai' && (
        <div className="space-y-6">
          <div className="card-elevated p-5"><h2 className="font-medium text-sm mb-3">AI will generate content optimized for:</h2><div className="flex flex-wrap gap-2 mb-4"><span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">{STATUS_OPTIONS.find(s => s.value === status)?.label}</span><span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium capitalize">{propType}</span><span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium capitalize">{TIER_OPTIONS.find(t => t.value === tier)?.label}</span>{location && <span className="px-2.5 py-1 rounded-full bg-secondary text-foreground text-xs font-medium">{location}</span>}</div><p className="text-xs text-muted-foreground">Generates bilingual (ES/EN) titles, subtitles, descriptions, features, amenities and SEO meta - all tuned for the purpose you selected.</p></div>
          <button onClick={handleGenerate} disabled={generatingAI} className="w4full py-4 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-3 transition-colors">
            {generatingAI ? <><Loader2 className="w-5 h-5 animate-spin" /> Generating SEO + GEO + AEO content...</> : <><Sparkles className="w-5 h-5" /> Generate AI Content</>}
          </button>
          {aiError && <p className="text-sm text-destructive">{aiError}</p>}
          <div className="text-center"><button onClick={() => setStep('publish')} className="text-xs text-muted-foreground hover:text-foreground underline">Skip AI - publish with raw data</button></div>
          <button onClick={() => setStep('details')} className="w-full py-2.5 rounded border border-border text-sm hover:bg-secondary transition-colors">Back to Details</button>
        </div>
      )}
      {step === 'publish' && (
        <div className="space-y-5">
          {titleEs && (<div className="card-elevated p-5 space-y-4"><div className="flex items-center gap-2 mb-1"><Sparkles className="w4 h-4 text-primary" /><h2 className="font-medium text-sm">AI Generated Content</h2><span className="text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-medium">Ready</span></div><div className="grid grid-cols-2 gap-3"><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Title ES</label><input value={titleEs} onChange={e => setTitleEs(e.target.value)} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Title EN</label><input value={titleEn} onChange={e => setTitleEn(e.target.value)} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /></div></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Subtitle</label><input value={subtitle} onChange={e => setSubtitle(e.target.value)} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Description ES</label><textarea value={descEs} onChange={e => setDescEs(e.target.value)} rows={4} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none resize-none" /></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Description EN</label><textarea value={descEn} onChange={e => setDescEn(e.target.value)} rows={4} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none resize-none" /></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Features (one per line)</label><textarea value={features} onChange={e => setFeatures(e.target.value)} rows={5} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none resize-none font-mono" /></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Amenities (comma separated)</label><input value={amenities} onChange={e => setAmenities(e.target.value)} className="w-full px-3 py-2 border border-input rounded bg-background text-sm focus:outline-none" /></div><div><label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">SEO Meta <span className="text-[10px]">({metaDesc.length}/155)</span></label><input value={metaDesc} onChange={e => setMetaDesc(e.target.value)} maxLength={160} className={`w-full px-3 py-2 border rounded bg-background text-sm focus:outline-none ${metaDesc.length > 155 ? 'border-destructive' : 'border-input'}`} /></div></div>)
          }
          <div className="card-elevated p-5 space-y-4"><h2 className="font-medium text-sm mb-3">Publishing settings</h2><div className="grid grid-cols-2 gap-3">{[{ value: 'public', label: 'Public', desc: 'Visible to everyone' },{ value: 'private', label: 'Private', desc: 'Link only + PIN' }].map(v => (<button key={v.value} onClick={() => setVisibility(v.value as 'public' | 'private')} className={`p-3 rounded-lg border-2 text-left transition-all ${visibility === v.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'}`}><div className="font-medium text-sm">{v.label}</div><div className="text-xs text-muted-foreground mt-0.5">{v.desc}</div></button>))}</div><label className="flex items-center gap-3 cursor-pointer"><input type="checkbox" checked={featured} onChange={e => setFeatured(e.target.checked)} className="w-4 h-4 rounded" /><div><div className="text-sm font-medium flex items-center gap-1"><Star className="w-3.5 h-3.5 text-yellow-500" /> Feature on homepage</div><div className="text-xs text-muted-foreground">Appears in the featured properties section</div></div></label></div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
          <div className="flex gap-3"><button onClick={() => setStep('ai')} className="flex-1 py-2.5 rounded border border-border text-sm hover:bg-secondary transition-colors">Back</button><button onClick={handleSave} disabled={saving} className="px-8 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 flex items-center justify-center gap-2">{saving ? <><Loader2 className="w4 h-4 animate-spin" /> Saving...</> : 'Publish Listing'}</button></div>
        </div>
      )}
    </div>
  )
}
