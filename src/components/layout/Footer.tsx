import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { LocaleLink } from '@/components/LocaleLink';
import logo from '@/assets/logo.png';

export function Footer() {
  const { t } = useTranslation();

  const quickLinks = [
    { name: t('header.properties'), href: '/properties' },
    { name: t('header.agents'), href: '/agents' },
    { name: t('header.services'), href: '/services' },
    { name: t('header.toolsInsights'), href: '/tools' },
    { name: 'West GAM Luxury Guide', href: '/west-gam-guide' },
    { name: t('header.contact'), href: '/contact' },
    { name: 'Dashboard', href: '/admin' },
  ];

  const services = [
    { name: t('footer.buySell'), href: '/services#brokerage' },
    { name: t('footer.propertyManagement'), href: '/services#management' },
    { name: t('footer.legalImmigration'), href: '/services#legal' },
    { name: t('footer.development'), href: '/services#development' },
    { name: t('header.familyAffairs'), href: '/family-affairs' },
  ];

  return (
    <footer className="bg-forest-dark text-primary-foreground">
      {/* Main footer */}
      <div className="container-wide py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-3 mb-5">
              <img src={logo} alt="DR Housing" className="h-12 w-auto brightness-0 invert" />
              <div>
                <span className="font-serif text-xl font-semibold">{t('footer.brand')}</span>
              </div>
            </div>
            <p className="text-primary-foreground/70 text-sm leading-relaxed mb-6">
              {t('footer.description')}
            </p>
            <div className="flex flex-col gap-3 text-sm">
              <a href="tel:+50686540888" className="flex items-center gap-3 text-primary-foreground/80 hover:text-gold transition-colors">
                <Phone className="w-4 h-4" />
                +506 8654 0888
              </a>
              <a href="mailto:info@drhousing.net" className="flex items-center gap-3 text-primary-foreground/80 hover:text-gold transition-colors">
                <Mail className="w-4 h-4" />
                info@drhousing.net
              </a>
              <div className="flex items-start gap-3 text-primary-foreground/80">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{t('footer.location')}</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  {link.href.startsWith('/admin') ? (
                    <Link 
                      to={link.href} 
                      className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                    >
                      {link.name}
                    </Link>
                  ) : (
                    <LocaleLink 
                      to={link.href} 
                      className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                    >
                      {link.name}
                    </LocaleLink>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">{t('footer.ourServices')}</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.name}>
                  <LocaleLink 
                    to={service.href} 
                    className="text-sm text-primary-foreground/70 hover:text-gold transition-colors"
                  >
                    {service.name}
                  </LocaleLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-serif text-lg font-medium mb-4">{t('footer.stayInformed')}</h4>
            <p className="text-sm text-primary-foreground/70 mb-4">
              {t('footer.newsletterText')}
            </p>
            <form className="flex flex-col gap-4">
              <input
                type="email"
                placeholder={t('common.yourEmail')}
                className="px-4 py-3 rounded bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 focus:outline-none focus:border-gold text-sm"
              />
              <button
                type="submit"
                className="px-4 py-3 rounded bg-gold text-forest-dark font-medium text-sm tracking-wide hover:bg-gold/90 transition-colors"
              >
                {t('common.subscribe')}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-primary-foreground/10">
        <div className="container-wide py-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-primary-foreground/60">
          <p>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <div className="flex items-center gap-6">
            <LocaleLink to="/privacy" className="hover:text-gold transition-colors">{t('footer.privacyPolicy')}</LocaleLink>
            <LocaleLink to="/terms" className="hover:text-gold transition-colors">{t('footer.termsOfService')}</LocaleLink>
            <Link to="/admin/login" className="hover:text-gold transition-colors">Admin</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
