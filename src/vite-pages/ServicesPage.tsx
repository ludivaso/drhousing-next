import { LocaleLink as Link } from '@/components/LocaleLink';
import { Home, Scale, Building2, Briefcase, ArrowRight, Phone, Palette } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { Button } from '@/components/ui/button';
import { VideoHero } from '@/components/ui/VideoHero';
import { useResolvedHero } from '@/hooks/useResolvedHero';

// Service images
import brokerageImage from '@/assets/services/real-estate-brokerage.jpg';
import legalImage from '@/assets/services/legal-immigration.jpg';
import developmentImage from '@/assets/services/development-remodeling.jpg';
import interiorImage from '@/assets/services/interior-design.jpg';
import managementImage from '@/assets/services/property-management.jpg';
import heroVideo from '@/assets/videos/hero-services.mp4';

export default function ServicesPage() {
  const { t } = useTranslation();
  const hero = useResolvedHero('services');

  const services = [
    {
      id: 'brokerage',
      icon: Home,
      image: brokerageImage,
      title: t('services.brokerage.title'),
      subtitle: t('services.brokerage.subtitle'),
      description: t('services.brokerage.description'),
      features: [
        t('services.brokerage.feature1'),
        t('services.brokerage.feature2'),
        t('services.brokerage.feature3'),
        t('services.brokerage.feature4'),
        t('services.brokerage.feature5'),
      ],
    },
    {
      id: 'legal',
      icon: Scale,
      image: legalImage,
      title: t('services.legal.title'),
      subtitle: t('services.legal.subtitle'),
      description: t('services.legal.description'),
      features: [
        t('services.legal.feature1'),
        t('services.legal.feature2'),
        t('services.legal.feature3'),
        t('services.legal.feature4'),
        t('services.legal.feature5'),
      ],
    },
    {
      id: 'development',
      icon: Building2,
      image: developmentImage,
      title: t('services.development.title'),
      subtitle: t('services.development.subtitle'),
      description: t('services.development.description'),
      features: [
        t('services.development.feature1'),
        t('services.development.feature2'),
        t('services.development.feature3'),
        t('services.development.feature4'),
        t('services.development.feature5'),
      ],
    },
    {
      id: 'interior-design',
      icon: Palette,
      image: interiorImage,
      title: t('services.interiorDesign.title'),
      subtitle: t('services.interiorDesign.subtitle'),
      description: t('services.interiorDesign.description'),
      features: [
        t('services.interiorDesign.feature1'),
        t('services.interiorDesign.feature2'),
        t('services.interiorDesign.feature3'),
        t('services.interiorDesign.feature4'),
        t('services.interiorDesign.feature5'),
        t('services.interiorDesign.feature6'),
      ],
    },
    {
      id: 'management',
      icon: Briefcase,
      image: managementImage,
      title: t('services.management.title'),
      subtitle: t('services.management.subtitle'),
      description: t('services.management.description'),
      features: [
        t('services.management.feature1'),
        t('services.management.feature2'),
        t('services.management.feature3'),
        t('services.management.feature4'),
        t('services.management.feature5'),
      ],
    },
  ];

  return (
    <Layout>
      <LocaleSEO titleKey="seo.services.title" descriptionKey="seo.services.description" />
      {/* Hero Section - Video Background */}
      <VideoHero
        videoSrc={hero.videoSrc || heroVideo}
        fallbackImageSrc={hero.fallbackImageSrc || interiorImage}
        fallbackImageAlt={hero.fallbackImageAlt}
        heightStyle={hero.heightStyle}
        overlayStyle={hero.overlayStyle}
      >
        <div className="py-16 lg:py-24">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold text-primary-foreground mb-4">{t('services.title')}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('services.description')}
          </p>
        </div>
      </VideoHero>

      {/* Solutions */}
      <section className="section-padding bg-background">
        <div className="container-wide space-y-20">
          {services.map((service, index) => (
            <div 
              key={service.id}
              id={service.id}
              className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${
                index % 2 === 1 ? 'lg:flex-row-reverse' : ''
              }`}
            >
              <div className={index % 2 === 1 ? 'lg:order-2' : ''}>
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center">
                    <service.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground tracking-wide">{service.subtitle}</p>
                    <h2 className="font-serif text-2xl sm:text-3xl font-semibold text-foreground">
                      {service.title}
                    </h2>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-8">
                  {service.description}
                </p>

                <ul className="space-y-4 mb-8">
                  {service.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-4">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold mt-2.5 flex-shrink-0" />
                      <span className="text-muted-foreground leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button asChild>
                  <Link to="/contact" className="gap-2">
                    {t('services.inquire')}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </Button>
              </div>

              <div className={`${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                <div className="aspect-[4/3] rounded overflow-hidden shadow-lg">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Family Affairs Link */}
      <section className="bg-secondary py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {t('services.privateAdvisory')}
              </h3>
              <p className="text-muted-foreground">
                {t('services.privateAdvisoryDesc')}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link to="/family-affairs" className="gap-2">
                {t('header.familyAffairs')}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-12">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="font-serif text-2xl font-semibold mb-2">
                {t('services.readyStart')}
              </h3>
              <p className="text-primary-foreground/80">
                {t('services.readyStartDesc')}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild className="bg-gold text-forest-dark hover:bg-gold/90">
                <Link to="/contact">
                  {t('common.scheduleConsultation')}
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10">
                <a href="tel:+50686540888">
                  <Phone className="w-4 h-4 mr-2" />
                  {t('common.callNow')}
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
