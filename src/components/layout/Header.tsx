import { useState } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { Menu, X, Phone, Mail, ChevronDown, BookOpen, Calculator, MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { LocaleLink } from '@/components/LocaleLink';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { normalizeLang } from '@/lib/i18nUtils';
import logo from '@/assets/logo.png';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { lang } = useParams<{ lang: string }>();
  const { t, i18n } = useTranslation();
  const currentLang = normalizeLang(lang);
  const isSpanish = currentLang === 'es';

  // Build locale-aware path helper
  const lp = (path: string) => `/${currentLang}${path}`;

  // Check if current path matches (accounting for locale prefix)
  const isActive = (path: string) => {
    const localizedPath = lp(path);
    return location.pathname === localizedPath;
  };

  const navigation = [
    { name: t('header.home'), href: '/' },
    { name: t('header.properties'), href: '/properties' },
    { name: t('header.agents'), href: '/agents' },
    { name: t('header.services'), href: '/services' },
    { name: t('header.contact'), href: '/contact' },
  ];

  const resourcesItems = [
    { 
      name: isSpanish ? 'Guía West GAM' : 'West GAM Guide', 
      href: '/west-gam-guide',
      description: isSpanish ? 'Guía completa de vida de lujo' : 'Comprehensive luxury living guide',
      icon: MapPin
    },
    { 
      name: isSpanish ? 'Herramientas y Calculadoras' : 'Tools & Calculators', 
      href: '/tools',
      description: isSpanish ? 'Calculadora de hipotecas y más' : 'Mortgage calculator & more',
      icon: Calculator
    },
  ];

  const isResourcesActive = resourcesItems.some(item => isActive(item.href));

  // Language switcher: navigate to the same path but with different locale
  const switchLanguage = () => {
    const newLang = currentLang === 'en' ? 'es' : 'en';
    // Replace /:lang/ prefix in current path
    const pathWithoutLang = location.pathname.replace(/^\/(en|es)/, '');
    navigate(`/${newLang}${pathWithoutLang || '/'}${location.search}${location.hash}`);
  };

  return (
    <header className="sticky top-0 z-50 bg-card/95 backdrop-blur-md border-b border-border">
      {/* Top bar */}
      <div className="hidden md:block bg-primary text-primary-foreground">
        <div className="container-wide py-2 flex items-center justify-between text-sm">
          <span className="font-medium">{t('header.tagline')}</span>
          <div className="flex items-center gap-6">
            <a href="tel:+50686540888" className="flex items-center gap-2 hover:text-gold transition-colors">
              <Phone className="w-4 h-4" />
              +506 8654 0888
            </a>
            <a href="mailto:info@drhousing.net" className="flex items-center gap-2 hover:text-gold transition-colors">
              <Mail className="w-4 h-4" />
              info@drhousing.net
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <nav className="container-wide py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <LocaleLink to="/" className="flex items-center gap-3">
            <img src={logo} alt="DR Housing" className="h-14 w-auto" />
            <div>
              <span className="font-serif text-xl font-semibold text-foreground tracking-tight">DR Housing</span>
              <span className="hidden sm:block text-xs text-muted-foreground tracking-wide">Costa Rica Real Estate</span>
            </div>
          </LocaleLink>

          {/* Desktop navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navigation.map((item) => (
              <LocaleLink
                key={item.name}
                to={item.href}
                className={cn(
                  'text-sm font-medium transition-colors link-underline',
                  isActive(item.href)
                    ? 'text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {item.name}
              </LocaleLink>
            ))}
            
            {/* Resources Dropdown */}
            <DropdownMenu open={resourcesOpen} onOpenChange={setResourcesOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  className={cn(
                    'text-sm font-medium transition-colors link-underline flex items-center gap-1',
                    isResourcesActive
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  <BookOpen className="w-4 h-4" />
                  {isSpanish ? 'Recursos' : 'Resources'}
                  <ChevronDown className={cn(
                    'w-3.5 h-3.5 transition-transform',
                    resourcesOpen && 'rotate-180'
                  )} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 bg-popover border border-border shadow-lg z-50"
                sideOffset={8}
              >
                {resourcesItems.map((item) => (
                  <DropdownMenuItem key={item.href} asChild>
                    <LocaleLink 
                      to={item.href} 
                      className={cn(
                        "flex items-start gap-3 p-3 cursor-pointer",
                        isActive(item.href) && "bg-accent"
                      )}
                    >
                      <item.icon className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <div className="font-medium text-foreground">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.description}</div>
                      </div>
                    </LocaleLink>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Toggle - URL-based */}
            <Button variant="ghost" size="sm" className="gap-2" onClick={switchLanguage}>
              <span>{currentLang === 'en' ? '🇺🇸 EN' : '🇪🇸 ES'}</span>
            </Button>
            <LocaleLink to="/family-affairs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              {t('header.familyAffairs')}
            </LocaleLink>
            <Button asChild>
              <LocaleLink to="/contact">{t('common.talkToUs')}</LocaleLink>
            </Button>
          </div>

          {/* Mobile menu button */}
          <button
            type="button"
            className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-t border-border pt-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navigation.map((item) => (
                <LocaleLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'text-base font-medium py-2',
                    isActive(item.href)
                      ? 'text-primary'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {item.name}
                </LocaleLink>
              ))}
              
              {/* Mobile Resources Section */}
              <div className="py-2">
                <div className="flex items-center gap-2 text-base font-medium text-foreground mb-2">
                  <BookOpen className="w-4 h-4" />
                  {isSpanish ? 'Recursos' : 'Resources'}
                </div>
                <div className="pl-6 flex flex-col gap-2">
                  {resourcesItems.map((item) => (
                    <LocaleLink
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'text-sm py-1.5 flex items-center gap-2',
                        isActive(item.href)
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      )}
                    >
                      <item.icon className="w-4 h-4" />
                      {item.name}
                    </LocaleLink>
                  ))}
                </div>
              </div>
              
              <LocaleLink
                to="/family-affairs"
                onClick={() => setMobileMenuOpen(false)}
                className="text-base font-medium py-2 text-muted-foreground hover:text-foreground"
              >
                {t('header.familyAffairs')}
              </LocaleLink>
              <div className="pt-4 border-t border-border flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <a href="tel:+50686540888" className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    +506 8654 0888
                  </a>
                  <Button variant="ghost" size="sm" onClick={switchLanguage}>
                    {currentLang === 'en' ? '🇪🇸 Español' : '🇺🇸 English'}
                  </Button>
                </div>
                <Button asChild className="w-full">
                  <LocaleLink to="/contact" onClick={() => setMobileMenuOpen(false)}>{t('common.talkToUs')}</LocaleLink>
                </Button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
