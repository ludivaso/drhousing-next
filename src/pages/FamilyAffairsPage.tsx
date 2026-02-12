import { LocaleLink as Link } from '@/components/LocaleLink';
import { Shield, Landmark, TrendingUp, Lock, Phone, Mail, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { Button } from '@/components/ui/button';

export default function FamilyAffairsPage() {
  const { t } = useTranslation();

  const offerings = [
    {
      icon: Shield,
      titleKey: 'familyAffairs.offerings.familyOffice.title',
      descriptionKey: 'familyAffairs.offerings.familyOffice.description',
    },
    {
      icon: Landmark,
      titleKey: 'familyAffairs.offerings.financing.title',
      descriptionKey: 'familyAffairs.offerings.financing.description',
    },
    {
      icon: TrendingUp,
      titleKey: 'familyAffairs.offerings.assetStrategy.title',
      descriptionKey: 'familyAffairs.offerings.assetStrategy.description',
    },
    {
      icon: Lock,
      titleKey: 'familyAffairs.offerings.tokenization.title',
      descriptionKey: 'familyAffairs.offerings.tokenization.description',
    },
  ];

  return (
    <Layout>
      <LocaleSEO titleKey="seo.familyAffairs.title" descriptionKey="seo.familyAffairs.description" />
      {/* Header - More understated */}
      <section className="bg-forest-dark text-primary-foreground py-20">
        <div className="container-narrow text-center">
          <span className="inline-block text-sm text-gold font-medium tracking-wider uppercase mb-4">
            {t('familyAffairs.badge')}
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-6">{t('familyAffairs.title')}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-xl mx-auto">
            {t('familyAffairs.subtitle')}
          </p>
        </div>
      </section>

      {/* Introduction */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              {t('familyAffairs.intro')}
            </p>
          </div>

          {/* Offerings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {offerings.map((offering) => (
              <div 
                key={offering.titleKey} 
                className="p-8 rounded border border-border bg-card hover:border-primary/20 transition-colors"
              >
                <div className="w-14 h-14 rounded bg-gold/10 flex items-center justify-center mb-5">
                  <offering.icon className="w-7 h-7 text-gold" />
                </div>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-4">
                  {t(offering.titleKey)}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {t(offering.descriptionKey)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Approach */}
      <section className="bg-secondary py-16">
        <div className="container-narrow">
          <div className="text-center mb-10">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground mb-4">
              {t('familyAffairs.approach.title')}
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              {t('familyAffairs.approach.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="text-center p-6">
              <div className="font-serif text-4xl font-semibold text-gold mb-2">01</div>
              <h4 className="font-medium text-foreground mb-2">{t('familyAffairs.approach.understand')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('familyAffairs.approach.understandDesc')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="font-serif text-4xl font-semibold text-gold mb-2">02</div>
              <h4 className="font-medium text-foreground mb-2">{t('familyAffairs.approach.advise')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('familyAffairs.approach.adviseDesc')}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="font-serif text-4xl font-semibold text-gold mb-2">03</div>
              <h4 className="font-medium text-foreground mb-2">{t('familyAffairs.approach.execute')}</h4>
              <p className="text-sm text-muted-foreground">
                {t('familyAffairs.approach.executeDesc')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Private Consultation CTA */}
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <div className="rounded bg-forest-dark text-primary-foreground p-10 sm:p-14 text-center">
            <h2 className="font-serif text-2xl sm:text-3xl font-semibold mb-5">
              {t('familyAffairs.cta.title')}
            </h2>
            <p className="text-primary-foreground/80 max-w-lg mx-auto mb-10">
              {t('familyAffairs.cta.description')}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <Button size="lg" asChild className="bg-gold text-forest-dark hover:bg-gold/90">
                <Link to="/contact" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  {t('familyAffairs.cta.requestMeeting')}
                </Link>
              </Button>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <a href="tel:+50686540888" className="flex items-center gap-2 text-primary-foreground/70 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />
                +506 8654 0888
              </a>
              <a href="mailto:private@drhousing.net" className="flex items-center gap-2 text-primary-foreground/70 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" />
                private@drhousing.net
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
