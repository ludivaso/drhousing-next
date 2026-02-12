import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Save, Loader2, User, Globe, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import SingleImageUpload from '@/components/admin/SingleImageUpload';
import { useToast } from '@/hooks/use-toast';
import { useCurrentProfile, useCurrentUserRoles, useUpdateProfile } from '@/hooks/useProfiles';
import { useAuth } from '@/hooks/useAuth';

export default function ProfileSettingsPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, isLoading: authLoading } = useAuth();
  const { data: profile, isLoading: profileLoading } = useCurrentProfile();
  const { data: roles } = useCurrentUserRoles();
  const updateProfile = useUpdateProfile();

  const [formData, setFormData] = useState({
    fullName: '',
    avatarUrl: null as string | null,
    languagePreference: 'es',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/admin/login');
    }
  }, [authLoading, user, navigate]);

  // Initialize form with profile data
  useEffect(() => {
    if (profile) {
      setFormData({
        fullName: profile.fullName || '',
        avatarUrl: profile.avatarUrl,
        languagePreference: profile.languagePreference || 'es',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({
        fullName: formData.fullName || null,
        avatarUrl: formData.avatarUrl,
        languagePreference: formData.languagePreference,
      });

      // Update i18n language
      if (formData.languagePreference !== i18n.language) {
        i18n.changeLanguage(formData.languagePreference);
      }

      toast({
        title: t('profile.saveSuccess'),
        description: t('profile.saveSuccessDesc'),
      });
    } catch (error: any) {
      toast({
        title: t('profile.saveError'),
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || profileLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <LocaleSEO titleKey="seo.profile.title" descriptionKey="seo.profile.description" />
      <div className="container-wide py-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('common.back')}
        </button>

        <div className="max-w-2xl mx-auto">
          <h1 className="font-serif text-3xl font-semibold mb-2">{t('profile.title')}</h1>
          <p className="text-muted-foreground mb-8">{t('profile.description')}</p>

          <div className="space-y-6">
            {/* Profile Picture */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  {t('profile.photo')}
                </CardTitle>
                <CardDescription>{t('profile.photoDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <SingleImageUpload
                  imageUrl={formData.avatarUrl}
                  onImageChange={(url) => setFormData(prev => ({ ...prev, avatarUrl: url }))}
                  bucket="user-avatars"
                  folder={user.id}
                />
              </CardContent>
            </Card>

            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>{t('profile.basicInfo')}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('profile.fullName')}</label>
                  <Input
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder={t('profile.fullNamePlaceholder')}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">{t('profile.email')}</label>
                  <Input
                    value={user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground mt-1">{t('profile.emailHint')}</p>
                </div>
              </CardContent>
            </Card>

            {/* Language Preference */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="w-5 h-5" />
                  {t('profile.language')}
                </CardTitle>
                <CardDescription>{t('profile.languageDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={formData.languagePreference}
                  onValueChange={(v) => setFormData(prev => ({ ...prev, languagePreference: v }))}
                >
                  <SelectTrigger className="w-full max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">🇪🇸 Español</SelectItem>
                    <SelectItem value="en">🇺🇸 English</SelectItem>
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            {/* Roles (Read-only) */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  {t('profile.roles')}
                </CardTitle>
                <CardDescription>{t('profile.rolesDesc')}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 flex-wrap">
                  {roles && roles.length > 0 ? (
                    roles.map((role) => (
                      <Badge
                        key={role}
                        variant={role === 'admin' ? 'default' : 'secondary'}
                        className="capitalize"
                      >
                        {role}
                      </Badge>
                    ))
                  ) : (
                    <Badge variant="outline">{t('profile.noRoles')}</Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} disabled={isSaving} size="lg">
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t('common.saving')}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t('profile.saveChanges')}
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
