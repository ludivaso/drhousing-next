import { LocaleLink as Link } from '@/components/LocaleLink';
import { ArrowRight, Shield, MapPin, Users, Briefcase, Building2, Scale, Home as HomeIcon, Sparkles, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { ListingBrief } from '@/components/ui/ListingBrief';
import { Button } from '@/components/ui/button';
import { VideoHero } from '@/components/ui/VideoHero';
import { useFeaturedProperties } from '@/hooks/useProperties';
import { useResolvedHero } from '@/hooks/useResolvedHero';
import heroImage from '@/assets/hero-costa-rica.jpg';
import heroVideo from '@/assets/videos/hero-homepage.mp4';
import drPortrait from '@/assets/dr-portrait.png';

export default function HomePage() {
  const { t } = useTranslation();
  const { data: featuredProperties = [] } = useFeaturedProperties();
  const hero = useResolvedHero('home');

  const howWeHelp = [
    {
      icon: HomeIcon,
      title: t('home.howWeHelp.realEstate'),
      description: t('home.howWeHelp.realEstateDesc'),
      href: '/properties',
    },
    {
      icon: Scale,
      title: t('home.howWeHelp.legalImmigration'),
      description: t('home.howWeHelp.legalImmigrationDesc'),
      href: '/services',
    },
    {
      icon: Building2,
      title: t('home.howWeHelp.development'),
      description: t('home.howWeHelp.developmentDesc'),
      href: '/services',
    },
    {
      icon: Palette,
      title: t('home.howWeHelp.interiorDesign'),
      description: t('home.howWeHelp.interiorDesignDesc'),
      href: '/services',
    },
    {
      icon: Briefcase,
      title: t('home.howWeHelp.propertyManagement'),
      description: t('home.howWeHelp.propertyManagementDesc'),
      href: '/services',
    },
    {
      icon: Sparkles,
      title: t('home.howWeHelp.familyAffairs'),
      description: t('home.howWeHelp.familyAffairsDesc'),
      href: '/family-affairs',
    },
  ];

  const trustPoints = [
    {
      icon: Shield,
      title: t('home.trust.experience'),
      description: t('home.trust.experienceDesc'),
    },
    {
      icon: Users,
      title: t('home.trust.families'),
      description: t('home.trust.familiesDesc'),
    },
    {
      icon: MapPin,
      title: t('home.trust.local'),
      description: t('home.trust.localDesc'),
    },
  ];

  return (
    <Layout>
      <LocaleSEO titleKey="seo.home.title" descriptionKey="seo.home.description" />
      <VideoHero
        videoSrc={hero.videoSrc || heroVideo}
        fallbackImageSrc={hero.fallbackImageSrc || heroImage}
        fallbackImageAlt={hero.fallbackImageAlt}
        heightStyle={hero.heightStyle}
        overlayStyle={hero.overlayStyle}
      >
        <div className="py-24">
          <div className="max-w-2xl">
            {/* Refined badge - more understated */}
            <span className="inline-block px-4 py-1.5 border border-gold/40 text-gold text-xs tracking-widest uppercase mb-8 animate-fade-in">
              {t('home.hero.badge')}
            </span>
            
            <h1 className="font-serif text-4xl sm:text-5xl lg:text-[3.5rem] font-medium text-primary-foreground leading-[1.15] mb-8 animate-slide-up">
              {t('home.hero.title')}
              <span className="text-gold"> {t('home.hero.titleHighlight')}</span>
            </h1>
            
            <p className="text-lg text-primary-foreground/70 leading-relaxed mb-12 max-w-xl animate-slide-up" style={{ animationDelay: '0.1s' }}>
              {t('home.hero.description')}
            </p>
            
            {/* Single advisory CTA - no urgency */}
            <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <Button 
                size="lg" 
                asChild 
                className="bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10 hover:border-primary-foreground/60 transition-all"
              >
                <Link to="/contact">
                  {t('home.hero.advisoryCta', 'Request a Private Consultation')}
                </Link>
              </Button>
            </div>
            
            {/* Subtle service links */}
            <div className="flex flex-wrap gap-8 mt-16 pt-8 border-t border-primary-foreground/10 animate-fade-in" style={{ animationDelay: '0.3s' }}>
              <Link to="/services" className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase">
                {t('home.hero.relocationGuidance')}
              </Link>
              <Link to="/services" className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase">
                {t('home.hero.investorServices')}
              </Link>
              <Link to="/tools" className="text-xs text-primary-foreground/50 hover:text-primary-foreground/80 transition-colors tracking-wide uppercase">
                {t('home.hero.calculatorsTools')}
              </Link>
            </div>
          </div>
        </div>
      </VideoHero>

      {/* Featured Properties - Case Brief Style */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-2">
                {t('home.featured.title')}
              </h2>
              <p className="text-sm text-muted-foreground">
                {t('home.featured.subtitle')}
              </p>
            </div>
            <Link 
              to="/properties" 
              className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
            >
              {t('common.viewAll')} →
            </Link>
          </div>

          {/* Case briefs - vertical list, not grid */}
          <div className="divide-y-0">
            {featuredProperties.slice(0, 3).map((property) => (
              <ListingBrief key={property.id} property={property} />
            ))}
          </div>
        </div>
      </section>

      {/* How We Help - Minor polish for spacing */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="text-center mb-14">
            <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-4">
              {t('home.howWeHelp.title')}
            </h2>
            <p className="text-sm text-muted-foreground max-w-xl mx-auto leading-relaxed">
              {t('home.howWeHelp.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {howWeHelp.map((item) => (
              <Link
                key={item.title}
                to={item.href}
                className={`card-elevated p-8 text-center hover:border-primary/30 transition-all ${
                  item.title === t('home.howWeHelp.familyAffairs') ? 'opacity-80 hover:opacity-100' : ''
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <item.icon className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-serif text-base font-medium text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="font-serif text-2xl sm:text-3xl font-medium text-foreground mb-6">
                {t('home.trust.title')}
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-10 text-sm">
                {t('home.trust.description')}
              </p>
              
              <div className="space-y-8">
                {trustPoints.map((point) => (
                  <div key={point.title} className="flex gap-4">
                    <div className="w-10 h-10 rounded bg-muted flex items-center justify-center flex-shrink-0">
                      <point.icon className="w-4 h-4 text-foreground/70" />
                    </div>
                    <div>
                      <h4 className="font-medium text-foreground text-sm mb-1">{point.title}</h4>
                      <p className="text-sm text-muted-foreground">{point.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10">
                <Link 
                  to="/agents" 
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors tracking-wide uppercase"
                >
                  {t('home.trust.meetTeam')} →
                </Link>
              </div>
            </div>

            <div className="relative hidden lg:block">
              <div className="overflow-hidden rounded-sm">
                <img src={drPortrait} alt="DR Housing — Private Real Estate Advisory" className="w-full h-auto object-contain" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Strip - Refined, less promotional */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-medium mb-2">
                {t('home.cta.title')}
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                {t('home.cta.description')}
              </p>
            </div>
            <Button 
              size="lg" 
              asChild 
              className="bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact">
                {t('home.hero.advisoryCta', 'Request a Private Consultation')}
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}