import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Loader2, Save, Image as ImageIcon, Video, Eye } from 'lucide-react';
import { toast } from 'sonner';
import {
  useHeroGlobalSettings,
  useAllHeroMedia,
  useUpdateHeroGlobalSettings,
  useUpsertHeroMedia,
  buildOverlayStyle,
  type HeroGlobalSettings,
  type HeroMedia,
} from '@/hooks/useHeroSettings';
import { supabase } from '@/integrations/supabase/client';

// ─── Global Settings Tab ────────────────────────────────────────────────

function GlobalSettingsTab() {
  const { t } = useTranslation();
  const { data: settings, isLoading } = useHeroGlobalSettings();
  const updateMutation = useUpdateHeroGlobalSettings();
  const [form, setForm] = useState<HeroGlobalSettings | null>(null);

  useEffect(() => {
    if (settings && !form) setForm(settings);
  }, [settings]);

  if (isLoading || !form) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const update = <K extends keyof HeroGlobalSettings>(key: K, value: HeroGlobalSettings[K]) => {
    setForm(prev => prev ? { ...prev, [key]: value } : prev);
  };

  const handleSave = async () => {
    if (!form.id) return;
    try {
      await updateMutation.mutateAsync(form);
      toast.success(t('admin.hero.settingsSaved'));
    } catch {
      toast.error(t('admin.hero.settingsFailed'));
    }
  };

  const overlayPreviewStyle = buildOverlayStyle(form);

  return (
    <div className="space-y-6">
      {/* Height */}
      <Card className="p-6 space-y-4">
        <h3 className="font-serif text-lg font-medium">{t('admin.hero.height')}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label>{t('admin.hero.unit')}</Label>
            <Select value={form.hero_height_mode} onValueChange={(v) => update('hero_height_mode', v as 'vh' | 'px')}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="vh">{t('admin.hero.viewportHeight')}</SelectItem>
                <SelectItem value="px">{t('admin.hero.pixels')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>{t('admin.hero.value')}</Label>
            <Input type="number" value={form.hero_height_value} onChange={e => update('hero_height_value', Number(e.target.value))} min={20} max={form.hero_height_mode === 'vh' ? 100 : 2000} />
          </div>
        </div>
      </Card>

      {/* Overlay */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-serif text-lg font-medium">{t('admin.hero.overlay')}</h3>
          <Switch checked={form.overlay_enabled} onCheckedChange={v => update('overlay_enabled', v)} />
        </div>

        {form.overlay_enabled && (
          <div className="space-y-4">
            <div>
              <Label>{t('admin.hero.type')}</Label>
              <Select value={form.overlay_type} onValueChange={v => update('overlay_type', v as 'solid' | 'gradient')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="solid">{t('admin.hero.solid')}</SelectItem>
                  <SelectItem value="gradient">{t('admin.hero.gradient')}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>{t('admin.hero.opacity')}: {form.overlay_opacity.toFixed(2)}</Label>
              <Slider value={[form.overlay_opacity * 100]} onValueChange={([v]) => update('overlay_opacity', v / 100)} min={0} max={100} step={1} />
            </div>

            {form.overlay_type === 'gradient' && (
              <>
                <div>
                  <Label>{t('admin.hero.direction')}</Label>
                  <Select value={form.gradient_direction} onValueChange={v => update('gradient_direction', v as HeroGlobalSettings['gradient_direction'])}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="to_bottom">{t('admin.hero.topToBottom')}</SelectItem>
                      <SelectItem value="to_top">{t('admin.hero.bottomToTop')}</SelectItem>
                      <SelectItem value="to_right">{t('admin.hero.leftToRight')}</SelectItem>
                      <SelectItem value="to_left">{t('admin.hero.rightToLeft')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.hero.startColor')}</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.gradient_start_color} onChange={e => update('gradient_start_color', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                      <Input value={form.gradient_start_color} onChange={e => update('gradient_start_color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                  <div>
                    <Label>{t('admin.hero.endColor')}</Label>
                    <div className="flex gap-2 items-center">
                      <input type="color" value={form.gradient_end_color} onChange={e => update('gradient_end_color', e.target.value)} className="w-10 h-10 rounded border cursor-pointer" />
                      <Input value={form.gradient_end_color} onChange={e => update('gradient_end_color', e.target.value)} className="flex-1" />
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.hero.startStop')}: {form.gradient_start_stop}%</Label>
                    <Slider value={[form.gradient_start_stop]} onValueChange={([v]) => update('gradient_start_stop', v)} min={0} max={100} step={1} />
                  </div>
                  <div>
                    <Label>{t('admin.hero.endStop')}: {form.gradient_end_stop}%</Label>
                    <Slider value={[form.gradient_end_stop]} onValueChange={([v]) => update('gradient_end_stop', v)} min={0} max={100} step={1} />
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </Card>

      {/* Live Preview */}
      <Card className="p-6 space-y-4">
        <h3 className="font-serif text-lg font-medium flex items-center gap-2"><Eye className="w-4 h-4" /> {t('admin.hero.livePreview')}</h3>
        <div className="relative rounded overflow-hidden" style={{ height: form.hero_height_mode === 'vh' ? `${Math.min(form.hero_height_value, 50)}vh` : `${Math.min(form.hero_height_value, 400)}px` }}>
          <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
          <div className="absolute inset-0" style={overlayPreviewStyle} />
          <div className="relative z-10 flex items-center justify-center h-full">
            <p className="text-white font-serif text-2xl">{t('admin.hero.heroPreview')}</p>
          </div>
        </div>
      </Card>

      <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
        {updateMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        {t('admin.hero.saveGlobalSettings')}
      </Button>
    </div>
  );
}

// ─── Per-Page Media Tab ─────────────────────────────────────────────────

function PerPageMediaTab() {
  const { t } = useTranslation();
  const { data: allMedia, isLoading } = useAllHeroMedia();
  const { data: globalSettings } = useHeroGlobalSettings();
  const upsertMutation = useUpsertHeroMedia();
  const [editingSlug, setEditingSlug] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<HeroMedia>>({});
  const [uploading, setUploading] = useState(false);

  const PAGE_OPTIONS = [
    { slug: 'home', label: t('admin.hero.pageHome') },
    { slug: 'services', label: t('admin.hero.pageServices') },
    { slug: 'west-gam-guide', label: t('admin.hero.pageWestGam') },
  ];

  if (isLoading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>;
  }

  const mediaMap = new Map((allMedia || []).map(m => [m.page_slug, m]));

  const startEdit = (slug: string) => {
    const existing = mediaMap.get(slug);
    setForm(existing || { page_slug: slug, media_type: 'video', video_source: 'existing_default', alt_text: '', is_enabled: true });
    setEditingSlug(slug);
  };

  const handleFileUpload = async (file: File, field: 'video_file' | 'image_file' | 'poster_image') => {
    if (field === 'video_file' && file.size > 20 * 1024 * 1024) {
      toast.error(t('admin.hero.videoTooLarge'));
      return;
    }
    if ((field === 'image_file' || field === 'poster_image') && file.size > 10 * 1024 * 1024) {
      toast.error(t('admin.hero.imageTooLarge'));
      return;
    }

    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `${editingSlug}/${field}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('hero-media').upload(path, file, { upsert: true });
    if (error) {
      toast.error(`${t('admin.hero.uploadFailed')}: ${error.message}`);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('hero-media').getPublicUrl(path);
    setForm(prev => ({ ...prev, [field]: urlData.publicUrl }));
    setUploading(false);
    toast.success(t('admin.hero.fileUploaded'));
  };

  const handleSave = async () => {
    if (!form.page_slug) return;
    try {
      await upsertMutation.mutateAsync(form as Partial<HeroMedia> & { page_slug: string });
      toast.success(t('admin.hero.heroSaved', { slug: form.page_slug }));
      setEditingSlug(null);
    } catch {
      toast.error(t('admin.hero.heroSaveFailed'));
    }
  };

  const overlayPreviewStyle = buildOverlayStyle(globalSettings);

  return (
    <div className="space-y-4">
      {PAGE_OPTIONS.map(page => {
        const media = mediaMap.get(page.slug);
        const isEditing = editingSlug === page.slug;

        return (
          <Card key={page.slug} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {media?.media_type === 'image' ? <ImageIcon className="w-5 h-5 text-muted-foreground" /> : <Video className="w-5 h-5 text-muted-foreground" />}
                <div>
                  <p className="font-medium">{page.label}</p>
                  <p className="text-xs text-muted-foreground">/{page.slug === 'home' ? '' : page.slug}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded ${media?.is_enabled !== false ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                  {media?.is_enabled !== false ? t('admin.hero.enabled') : t('admin.hero.disabled')}
                </span>
                <span className="text-xs text-muted-foreground capitalize">{media?.video_source || 'existing_default'}</span>
                <Button size="sm" variant="outline" onClick={() => isEditing ? setEditingSlug(null) : startEdit(page.slug)}>
                  {isEditing ? t('admin.hero.cancel') : t('admin.hero.edit')}
                </Button>
              </div>
            </div>

            {isEditing && (
              <div className="space-y-4 border-t pt-4">
                <div className="flex items-center gap-4">
                  <Label>{t('admin.hero.enabled')}</Label>
                  <Switch checked={form.is_enabled !== false} onCheckedChange={v => setForm(prev => ({ ...prev, is_enabled: v }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.hero.mediaType')}</Label>
                    <Select value={form.media_type || 'video'} onValueChange={v => setForm(prev => ({ ...prev, media_type: v as 'video' | 'image' }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="video">{t('admin.hero.video')}</SelectItem>
                        <SelectItem value="image">{t('admin.hero.image')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {form.media_type === 'video' && (
                    <div>
                      <Label>{t('admin.hero.videoSource')}</Label>
                      <Select value={form.video_source || 'existing_default'} onValueChange={v => setForm(prev => ({ ...prev, video_source: v as any }))}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="existing_default">{t('admin.hero.currentDefault')}</SelectItem>
                          <SelectItem value="upload">{t('admin.hero.upload')}</SelectItem>
                          <SelectItem value="url">{t('admin.hero.externalUrl')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                {form.media_type === 'video' && form.video_source === 'upload' && (
                  <div>
                    <Label>{t('admin.hero.uploadVideo')}</Label>
                    <Input type="file" accept="video/mp4,video/webm" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'video_file')} disabled={uploading} />
                    {form.video_file && <p className="text-xs text-muted-foreground mt-1 truncate">{form.video_file}</p>}
                  </div>
                )}

                {form.media_type === 'video' && form.video_source === 'url' && (
                  <div>
                    <Label>{t('admin.hero.videoUrl')}</Label>
                    <Input value={form.video_url || ''} onChange={e => setForm(prev => ({ ...prev, video_url: e.target.value }))} placeholder="https://..." />
                  </div>
                )}

                {form.media_type === 'image' && (
                  <div>
                    <Label>{t('admin.hero.uploadImage')}</Label>
                    <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'image_file')} disabled={uploading} />
                    {form.image_file && <p className="text-xs text-muted-foreground mt-1 truncate">{form.image_file}</p>}
                  </div>
                )}

                <div>
                  <Label>{t('admin.hero.posterImage')}</Label>
                  <Input type="file" accept="image/*" onChange={e => e.target.files?.[0] && handleFileUpload(e.target.files[0], 'poster_image')} disabled={uploading} />
                  {form.poster_image && <p className="text-xs text-muted-foreground mt-1 truncate">{form.poster_image}</p>}
                </div>

                <div>
                  <Label>{t('admin.hero.altText')}</Label>
                  <Input value={form.alt_text || ''} onChange={e => setForm(prev => ({ ...prev, alt_text: e.target.value }))} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.hero.headline')}</Label>
                    <Input value={form.headline || ''} onChange={e => setForm(prev => ({ ...prev, headline: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t('admin.hero.subheadline')}</Label>
                    <Input value={form.subheadline || ''} onChange={e => setForm(prev => ({ ...prev, subheadline: e.target.value }))} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>{t('admin.hero.ctaLabel')}</Label>
                    <Input value={form.cta_label || ''} onChange={e => setForm(prev => ({ ...prev, cta_label: e.target.value }))} />
                  </div>
                  <div>
                    <Label>{t('admin.hero.ctaUrl')}</Label>
                    <Input value={form.cta_url || ''} onChange={e => setForm(prev => ({ ...prev, cta_url: e.target.value }))} />
                  </div>
                </div>

                {/* Mini preview */}
                <Card className="p-4">
                  <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Eye className="w-3 h-3" /> {t('admin.hero.previewWithOverlay')}</p>
                  <div className="relative rounded overflow-hidden h-32">
                    <div className="absolute inset-0 bg-gradient-to-br from-muted to-muted-foreground/20" />
                    <div className="absolute inset-0" style={overlayPreviewStyle} />
                    <div className="relative z-10 flex items-center justify-center h-full text-white">
                      <div className="text-center">
                        <p className="font-serif text-lg">{form.headline || page.label}</p>
                        {form.subheadline && <p className="text-sm opacity-70">{form.subheadline}</p>}
                      </div>
                    </div>
                  </div>
                </Card>

                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={upsertMutation.isPending || uploading} className="gap-2">
                    {(upsertMutation.isPending || uploading) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {t('admin.hero.save')}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingSlug(null)}>{t('admin.hero.cancel')}</Button>
                </div>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────

export default function AdminHeroControls() {
  const { t } = useTranslation();

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">{t('admin.hero.title')}</h1>
      <Tabs defaultValue="global" className="w-full">
        <TabsList>
          <TabsTrigger value="global">{t('admin.hero.globalSettings')}</TabsTrigger>
          <TabsTrigger value="per-page">{t('admin.hero.perPageMedia')}</TabsTrigger>
        </TabsList>
        <TabsContent value="global">
          <GlobalSettingsTab />
        </TabsContent>
        <TabsContent value="per-page">
          <PerPageMediaTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
