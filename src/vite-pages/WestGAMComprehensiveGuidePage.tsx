import { LocaleLink as Link } from '@/components/LocaleLink';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { WestGAMPoiMap } from '@/components/maps/WestGAMPoiMap';
import { VideoHero } from '@/components/ui/VideoHero';
import { useResolvedHero } from '@/hooks/useResolvedHero';
import westGamHero from '@/assets/west-gam-hero.jpg';
import westGamVideo from '@/assets/videos/hero-west-gam.mp4';
import { 
  MapPin, 
  Shield, 
  TrendingUp, 
  Users, 
  Building2, 
  ArrowRight, 
  CheckCircle2,
  Hotel, 
  UtensilsCrossed, 
  ShoppingBag, 
  GraduationCap, 
  Car, 
  Stethoscope,
  Landmark,
  Plane,
  Home,
  Scale,
  Globe,
  Map
} from 'lucide-react';

export default function WestGAMComprehensiveGuidePage() {
  const { t } = useTranslation();
  const hero = useResolvedHero('west-gam-guide');

  const areas = [
    {
      id: 'sabana-rohrmoser',
      title: 'La Sabana & Rohrmoser',
      subtitle: 'Urban Sophistication Meets Metropolitan Convenience',
      keywords: ['urban luxury condominiums San José', 'Sabana real estate investment', 'Rohrmoser executive housing'],
      content: {
        overview: `La Sabana and Rohrmoser represent the premier urban luxury corridor of Costa Rica's capital region. Bordering the nation's largest metropolitan park—Parque Metropolitano La Sabana—these neighborhoods offer an exceptional blend of walkability, cultural amenities, and high-rise living that appeals to executives, diplomats, and professionals seeking proximity to San José's business district without sacrificing quality of life.`,
        marketProfile: `Demand in Sabana-Rohrmoser remains consistently strong among corporate relocations and embassy personnel. The area's established infrastructure, proximity to international schools like the Costa Rica Country Day School, and direct access to major arterial routes position it as one of the most liquid markets in the GAM. Properties here rarely linger on market, particularly those with park views or within landmark developments such as Torres del Parque and Sabana Real.`,
        propertyTypes: {
          condominiums: `The landscape is dominated by high-rise condominiums and luxury apartment towers, many featuring concierge services, rooftop amenities, and secured parking. Units range from efficient two-bedroom designs for professionals to expansive penthouses commanding premium park views.`,
          townhouses: `Select townhouse communities exist for those preferring ground-level living while maintaining urban proximity. These properties offer private gardens and multi-level layouts rarely found in the tower-dominated market.`,
          singleFamily: `Limited single-family inventory exists in Rohrmoser's quieter streets, typically older construction on generous lots appealing to buyers willing to renovate or develop.`,
          developments: `Recent developments have emphasized sustainable design and smart-home integration. Torres del Parque, Sabana Real, and the Nunciatura corridor represent premium inventory with institutional-quality amenities.`
        },
        lifestyle: `Residents enjoy morning runs around the Sabana park, world-class dining in Rohrmoser's restaurant district, and cultural events at the National Stadium and Costa Rican Art Museum. The area's flat terrain and pedestrian infrastructure make it uniquely accessible compared to hillier western suburbs.`,
        pricePosition: `Entry-level luxury condominiums begin in the mid-range bracket, with premium units in newer towers commanding prices comparable to Escazú's finest. Properties with unobstructed park views achieve significant premiums.`,
        rentalAppeal: `The rental market is exceptionally strong, driven by corporate housing needs, short-term diplomatic assignments, and professionals valuing urban convenience. Yields are competitive with suburban alternatives while benefiting from lower vacancy rates.`,
        bestFor: ['Corporate executives requiring central location', 'Diplomatic and international organization personnel', 'Professionals valuing walkability and urban amenities', 'Investors seeking stable rental income with low vacancy risk']
      }
    },
    {
      id: 'nunciatura',
      title: 'Nunciatura',
      subtitle: 'Diplomatic Prestige and Quiet Exclusivity',
      keywords: ['Nunciatura exclusive properties', 'diplomatic housing Costa Rica', 'prestigious San José neighborhoods'],
      content: {
        overview: `Nunciatura, named for its proximity to the Apostolic Nunciature, represents one of the GAM's most discreet and prestigious residential enclaves. This neighborhood bridges Rohrmoser's urban energy with Escazú's hillside exclusivity, offering a rare combination of central access and residential tranquility.`,
        marketProfile: `The Nunciatura market is characterized by limited inventory and discerning buyers. Properties here change hands quietly, often through private networks before reaching public listings. This scarcity, combined with the area's reputation for security and privacy, maintains strong value appreciation even during broader market fluctuations.`,
        propertyTypes: {
          condominiums: `Boutique condominium developments offer refined alternatives to the towers of nearby Sabana, with smaller buildings providing more intimate community environments and personalized service.`,
          townhouses: `Carefully designed townhouse communities feature sophisticated architecture, private gardens, and security infrastructure matching the neighborhood's diplomatic character.`,
          singleFamily: `Many homes occupy generous lots with mature landscaping, providing privacy unusual for such a central location. These properties attract families prioritizing space without sacrificing urban connectivity.`,
          developments: `Development pace is measured by design, with new construction carefully regulated to maintain neighborhood character and property values.`
        },
        lifestyle: `Nunciatura offers the rare advantage of feeling distinctly residential while remaining minutes from Sabana's amenities, multiple shopping centers, and direct highway access to both San José and the western suburbs. The neighborhood's tree-lined streets and measured development pace create an atmosphere of established wealth.`,
        pricePosition: `Properties in Nunciatura command premium valuations reflecting their scarcity and prestige. Single-family homes with substantial lots approach the upper ranges found in Escazú's most exclusive sectors.`,
        rentalAppeal: `Long-term rentals attract diplomatic families and C-suite executives seeking discretion and security. Short-term availability is limited, maintaining neighborhood character while providing landlords with stable, quality tenancies.`,
        bestFor: ['Diplomatic families requiring central location with privacy', 'Senior executives valuing discretion', 'Families seeking established, low-density neighborhoods', 'Investors prioritizing capital preservation over yield']
      }
    },
    {
      id: 'escazu',
      title: 'Escazú',
      subtitle: 'Costa Rica\'s Benchmark for Luxury Living',
      keywords: ['Escazú luxury real estate', 'San Rafael de Escazú properties', 'Guachipelín condominiums', 'Los Laureles gated communities'],
      content: {
        overview: `Escazú has earned its reputation as the definitive address for luxury residential living in Central America. Encompassing the distinct neighborhoods of San Rafael, Guachipelín, and Los Laureles, this municipality offers everything from hillside estates with panoramic valley views to contemporary high-rise living in planned communities.`,
        marketProfile: `As the most established luxury market in Costa Rica, Escazú benefits from exceptional liquidity, proven appreciation history, and consistent international demand. San Rafael de Escazú anchors the premium segment with legacy estates and architectural landmarks, while Guachipelín has emerged as the epicenter of modern luxury condominium development.`,
        propertyTypes: {
          condominiums: `Ultra-modern penthouses in towers like Torres Paseo Colón and Avenida Escazú developments offer contemporary luxury with full amenity packages. Guachipelín concentrates the newest inventory, while San Rafael maintains boutique options.`,
          townhouses: `Exclusive townhouse enclaves offering lock-and-leave convenience appeal to executives who travel frequently while demanding space and quality when home.`,
          singleFamily: `Historic hacienda-style estates in old Escazú, contemporary mansions in gated hillside communities, and architectural statement homes command the municipality's highest valuations.`,
          developments: `Valle Arriba, Cerro Alto, and emerging hillside communities represent the pinnacle of Costa Rican residential development, with amenities rivaling resort properties.`
        },
        lifestyle: `Escazú provides an unmatched concentration of international services: world-class hospitals including CIMA, prestigious schools such as the American International School and Blue Valley, premier shopping at Multiplaza and Avenida Escazú, and Costa Rica's finest dining scene. The municipality's hillside geography offers cooler temperatures and dramatic views of the Central Valley.`,
        pricePosition: `Escazú anchors the top of Costa Rica's residential market. Entry points in newer condominium developments remain accessible to upper-middle-market buyers, while signature estates in San Rafael and exclusive towers like those overlooking the valley command the nation's highest per-square-meter valuations.`,
        rentalAppeal: `The rental market is robust across all segments. Corporate relocations consistently absorb quality inventory, while the short-term market serves medical tourism and extended business travelers. Properties within walking distance of Avenida Escazú's retail and dining core achieve premium rates.`,
        bestFor: ['International families requiring full-service amenities', 'Executives prioritizing prestige and resale liquidity', 'Medical tourism operators and investors', 'Buyers seeking established, internationally-recognized address']
      }
    },
    {
      id: 'santa-ana',
      title: 'Santa Ana',
      subtitle: 'Modern Lifestyle Communities with Investment Upside',
      keywords: ['Santa Ana gated communities', 'Lindora real estate', 'Pozos luxury homes', 'Río Oro estates'],
      content: {
        overview: `Santa Ana represents the dynamic, forward-looking complement to Escazú's established prestige. Encompassing Lindora, Pozos, and Río Oro, this municipality has attracted major commercial investment, creating a vibrant mixed-use environment where luxury residential development meets Costa Rica's premier business parks.`,
        marketProfile: `Santa Ana's market trajectory reflects sustained momentum. The concentration of multinational headquarters in Forum Business Park, Lindora Business Center, and emerging corporate campuses generates consistent demand from executives relocating for regional positions. This commercial anchoring provides residential investors with unusual demand stability.`,
        propertyTypes: {
          condominiums: `An expanding inventory of luxury condominiums features contemporary architecture and resort-style amenities. Developments near Forum and City Place offer walkable access to dining and entertainment.`,
          townhouses: `Townhouse developments emphasizing indoor-outdoor living dominate the market, offering the space families require with the security and maintenance advantages of managed communities.`,
          singleFamily: `Río Oro's hillside positions offer estate-sized properties with valley and mountain views, while Lindora provides high-density luxury with walkable access to commercial amenities.`,
          developments: `Parque Valle del Sol, Hacienda del Sol, and emerging Río Oro communities attract families prioritizing space, views, and contemporary design.`
        },
        lifestyle: `Santa Ana has cultivated a distinctly modern Costa Rican lifestyle. The City Place shopping and entertainment complex, combined with numerous specialty restaurants and cafés, creates urban energy without San José's congestion. The slightly warmer, drier microclimate appeals to those seeking additional sunshine while remaining minutes from central valley amenities.`,
        pricePosition: `Santa Ana offers competitive positioning relative to Escazú, making it attractive for buyers seeking comparable quality at accessible price points. Premium developments in Lindora and established communities in Río Oro approach Escazú valuations, particularly for properties with views or exceptional finishes.`,
        rentalAppeal: `The executive rental market is particularly strong, driven by corporate relocations to nearby business parks. Properties within Forum and Lindora's commercial ecosystem command premium rates with low vacancy. The investor community benefits from predictable corporate leasing cycles.`,
        bestFor: ['Corporate executives with Forum/Lindora employment', 'Families seeking newer communities with modern amenities', 'Value-conscious buyers targeting Escazú-adjacent quality', 'Investors prioritizing rental yield over appreciation']
      }
    },
    {
      id: 'belen',
      title: 'Belén & La Ribera',
      subtitle: 'Strategic Position with Airport Proximity',
      keywords: ['Belén Costa Rica properties', 'airport proximity real estate', 'La Ribera residential'],
      content: {
        overview: `Belén and the La Ribera corridor occupy a strategically valuable position in the western GAM, offering direct access to Juan Santamaría International Airport while maintaining residential character and growing luxury inventory. This area has emerged as a compelling alternative for frequent travelers and aviation industry professionals.`,
        marketProfile: `Market development in Belén has accelerated significantly, driven by improved infrastructure and spillover demand from saturated Escazú and Santa Ana markets. The area attracts practical luxury buyers who prioritize efficiency—particularly those with regional travel requirements or businesses dependent on international connectivity.`,
        propertyTypes: {
          condominiums: `Select condominium projects cater to professionals seeking modern living with convenient airport access. Developments emphasize efficiency and quality over ostentation.`,
          townhouses: `Townhouse developments emphasizing low-maintenance living appeal to traveling professionals and families seeking turnkey convenience.`,
          singleFamily: `Properties tend toward efficient floor plans optimized for professionals, though estate-style options exist in peripheral zones for those seeking more space.`,
          developments: `Cariari and Hacienda del Río represent established luxury options, while newer developments target the growing professional market.`
        },
        lifestyle: `Belén offers convenient access to western GAM amenities while maintaining a less congested environment than its higher-profile neighbors. The COYOL Free Trade Zone provides employment anchoring, while Costa Rica's craft brewery scene has established a notable presence in the area. Airport proximity enables seamless travel without the premium associated with Costa Rica's traditional luxury addresses.`,
        pricePosition: `Belén provides an entry point to the western GAM luxury market at valuations below Escazú and Santa Ana equivalents. This positioning attracts first-time luxury buyers and investors seeking appreciation potential as the area's infrastructure and amenity base continue developing.`,
        rentalAppeal: `The rental market serves a distinct niche: traveling professionals, airline crews, and executives requiring airport proximity. Corporate housing for Free Trade Zone employers provides additional demand stability.`,
        bestFor: ['Frequent international travelers', 'Aviation and logistics professionals', 'First-time luxury buyers seeking value', 'Investors targeting emerging area appreciation']
      }
    },
    {
      id: 'la-guacima',
      title: 'La Guácima',
      subtitle: 'Estate Living and Equestrian Heritage',
      keywords: ['La Guácima estates', 'equestrian properties Costa Rica', 'polo lifestyle Central America'],
      content: {
        overview: `La Guácima represents the western GAM's answer to those seeking space, privacy, and connection to Costa Rica's agricultural heritage. This Alajuela district has evolved from its equestrian and farming roots into an exclusive enclave where estate-sized properties offer an alternative to the density of Escazú and Santa Ana.`,
        marketProfile: `The La Guácima market caters to a specific buyer profile: those prioritizing acreage, privacy, and a slower pace without sacrificing access to international amenities. Inventory is limited, and the most desirable properties—particularly those with polo grounds, equestrian facilities, or exceptional views—trade infrequently and typically through private channels.`,
        propertyTypes: {
          condominiums: `Limited condominium inventory exists, with the market dominated by ground-level living appealing to those seeking land and space.`,
          townhouses: `Newer developments targeting families seeking suburban space with security offer townhouse options, though this remains a minor market segment.`,
          singleFamily: `Estate properties dominate La Guácima's luxury segment, often featuring multiple structures, staff quarters, equestrian infrastructure, and agricultural components.`,
          developments: `Gated community homes on generous lots and newer developments targeting families seeking suburban space with security represent the accessible end of the market.`
        },
        lifestyle: `La Guácima offers what urban GAM cannot: quiet mornings, genuine green space, and the rhythms of countryside living. The area's equestrian heritage persists through polo clubs and horse-boarding facilities. Despite its rural character, residents remain within 20-30 minutes of Santa Ana and Escazú's full amenity offerings.`,
        pricePosition: `Price-per-square-meter in La Guácima typically falls below urban GAM equivalents, but total property values for estates can match or exceed Escazú's most expensive listings due to land area. This creates opportunity for buyers seeking space-per-dollar optimization.`,
        rentalAppeal: `The rental market is limited but specialized. Properties with equestrian facilities command premium rates from the international polo and horse-breeding community. Family estates appeal to diplomatic and executive tenants seeking unique lifestyle experiences.`,
        bestFor: ['Equestrian enthusiasts and polo community', 'Families prioritizing space and privacy', 'Agricultural and hobby-farm investors', 'Buyers seeking refuge from urban density while maintaining GAM access']
      }
    }
  ];

  return (
    <Layout>
      <LocaleSEO titleKey="seo.westGamGuide.title" descriptionKey="seo.westGamGuide.description" />
      {/* Hero Section - Video Background */}
      <VideoHero
        videoSrc={hero.videoSrc || westGamVideo}
        fallbackImageSrc={hero.fallbackImageSrc || westGamHero}
        fallbackImageAlt={hero.fallbackImageAlt}
        heightStyle={hero.heightStyle}
        className="text-white"
        overlayStyle={hero.overlayStyle}
      >
        <div className="py-20 lg:py-32">
          <div className="max-w-4xl">
            <span className="inline-block px-4 py-1.5 border border-gold/40 text-gold text-xs tracking-widest uppercase mb-6">
              Definitive Market Intelligence
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-medium leading-tight mb-6">
              West GAM Luxury Living & Lifestyle Guide: Sabana to La Guácima
            </h1>
            <p className="text-lg lg:text-xl text-white/70 leading-relaxed mb-8 max-w-3xl">
              The comprehensive authority on Costa Rica's premier residential investment corridor—covering real estate markets, lifestyle infrastructure, and strategic insights for high-net-worth investors, relocating executives, and international families.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-transparent border border-white/40 text-white hover:bg-white/10">
                <Link to="/properties">Explore Available Portfolio</Link>
              </Button>
              <Button asChild variant="ghost" className="text-white/70 hover:text-white hover:bg-transparent">
                <Link to="/contact">Request Private Market Briefing →</Link>
              </Button>
            </div>
          </div>
        </div>
      </VideoHero>

      {/* Table of Contents */}
      <section className="py-8 bg-secondary border-b border-border">
        <div className="container-wide">
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <span className="text-muted-foreground font-medium">Navigate:</span>
            <a href="#why-west-gam" className="text-foreground hover:text-primary transition-colors">Why West GAM</a>
            <a href="#residential-areas" className="text-foreground hover:text-primary transition-colors">Residential Areas</a>
            <a href="#lifestyle-ecosystem" className="text-foreground hover:text-primary transition-colors">Lifestyle & Commerce</a>
            <a href="#investment-insight" className="text-foreground hover:text-primary transition-colors">Investment Insight</a>
            <a href="#why-specialist" className="text-foreground hover:text-primary transition-colors">Why Work With Us</a>
          </div>
        </div>
      </section>

      {/* Section 1: Introduction - Why West GAM */}
      <section id="why-west-gam" className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-8">
              Why West GAM Is Costa Rica's Prime Luxury Corridor
            </h2>
            
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p className="text-foreground/80 leading-relaxed text-lg">
                The western Greater Metropolitan Area—spanning from La Sabana through La Guácima—constitutes the most concentrated wealth corridor in Central America. This is not coincidence; it is the result of decades of deliberate infrastructure investment, international school establishment, healthcare system development, and organic community formation by Costa Rica's most successful families and the international executives they attract.
              </p>
              
              <p className="leading-relaxed">
                For investors and families evaluating Costa Rica luxury real estate, the West GAM corridor offers critical advantages that no other Central American market—and few global emerging markets—can match. Understanding these fundamentals is essential for making sound investment and relocation decisions.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 my-12">
              <div className="p-6 bg-secondary border border-border">
                <Scale className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">Legal Certainty</h3>
                <p className="text-sm text-muted-foreground">
                  Costa Rica's property rights framework provides clear title registration, constitutional protections for foreign ownership, and a legal system aligned with international standards—critical for high-value transactions.
                </p>
              </div>
              <div className="p-6 bg-secondary border border-border">
                <Shield className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">Security Infrastructure</h3>
                <p className="text-sm text-muted-foreground">
                  Established gated communities, 24/7 professional security, and Costa Rica's lowest crime indices create an environment where families and assets are protected.
                </p>
              </div>
              <div className="p-6 bg-secondary border border-border">
                <Globe className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">Multinational Presence</h3>
                <p className="text-sm text-muted-foreground">
                  Amazon, Intel, Microsoft, Boston Scientific, and dozens of Fortune 500 companies maintain regional operations in West GAM, anchoring consistent executive housing demand.
                </p>
              </div>
              <div className="p-6 bg-secondary border border-border">
                <TrendingUp className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-serif text-lg font-medium text-foreground mb-2">Market Liquidity</h3>
                <p className="text-sm text-muted-foreground">
                  Consistent international demand ensures properties can be sold within reasonable timeframes at fair valuations—a critical consideration for investment planning.
                </p>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/20">
              <h3 className="font-medium text-foreground mb-3">Investment Logic & Relocation Rationale</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                The concentration of infrastructure, services, and institutional-quality residential development in West GAM creates a self-reinforcing ecosystem. High-net-worth residents attract premium services; premium services attract additional high-net-worth residents. This dynamic, combined with limited developable land and strict zoning, supports sustained property value appreciation while providing the daily conveniences that make international relocation successful rather than merely survivable.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Residential Real Estate by Area */}
      <section id="residential-areas" className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-4">
              Residential Real Estate by Area
            </h2>
            <p className="text-muted-foreground max-w-3xl">
              Comprehensive analysis of each West GAM neighborhood—market dynamics, property types, lifestyle characteristics, and optimal buyer profiles for informed decision-making.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12">
            {/* Left Column - Quick Navigation */}
            <div className="lg:w-72 flex-shrink-0">
              <div className="sticky top-32">
                <h3 className="font-serif text-lg font-medium text-foreground mb-4">Area Guide</h3>
                <nav className="space-y-2">
                  {areas.map((area) => (
                    <a
                      key={area.id}
                      href={`#${area.id}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
                    >
                      {area.title}
                    </a>
                  ))}
                </nav>
                
                <div className="mt-8 p-4 bg-background border border-border">
                  <p className="text-xs text-muted-foreground mb-3">Need personalized guidance?</p>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link to="/contact">Speak with a Specialist</Link>
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Area Details */}
            <div className="flex-1">
              <Accordion type="multiple" className="space-y-4" defaultValue={['escazu']}>
                {areas.map((area) => (
                  <AccordionItem
                    key={area.id}
                    value={area.id}
                    id={area.id}
                    className="bg-background border border-border px-6"
                  >
                    <AccordionTrigger className="hover:no-underline py-6">
                      <div className="text-left">
                        <h3 className="font-serif text-xl font-medium text-foreground">{area.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{area.subtitle}</p>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="pb-8">
                      <div className="space-y-8 pt-2">
                        {/* Overview */}
                        <div>
                          <p className="text-muted-foreground leading-relaxed">
                            {area.content.overview}
                          </p>
                        </div>

                        {/* Market Profile */}
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-primary" />
                            Market Profile & Buyer Demand
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {area.content.marketProfile}
                          </p>
                        </div>

                        {/* Property Types - Expanded */}
                        <div>
                          <h4 className="font-medium text-foreground mb-4 flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-primary" />
                            Luxury Property Types Available
                          </h4>
                          <div className="grid sm:grid-cols-2 gap-4">
                            <div className="p-4 bg-secondary border border-border">
                              <h5 className="text-sm font-medium text-foreground mb-2">High-End Condominiums</h5>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {area.content.propertyTypes.condominiums}
                              </p>
                            </div>
                            <div className="p-4 bg-secondary border border-border">
                              <h5 className="text-sm font-medium text-foreground mb-2">Townhouses & Gated Communities</h5>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {area.content.propertyTypes.townhouses}
                              </p>
                            </div>
                            <div className="p-4 bg-secondary border border-border">
                              <h5 className="text-sm font-medium text-foreground mb-2">Single-Family Luxury Homes</h5>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {area.content.propertyTypes.singleFamily}
                              </p>
                            </div>
                            <div className="p-4 bg-secondary border border-border">
                              <h5 className="text-sm font-medium text-foreground mb-2">Landmark Developments</h5>
                              <p className="text-xs text-muted-foreground leading-relaxed">
                                {area.content.propertyTypes.developments}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Lifestyle */}
                        <div>
                          <h4 className="font-medium text-foreground mb-3 flex items-center gap-2">
                            <Users className="w-4 h-4 text-primary" />
                            Lifestyle & Daily Convenience
                          </h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {area.content.lifestyle}
                          </p>
                        </div>

                        {/* Two Column Grid - Price & Rental */}
                        <div className="grid sm:grid-cols-2 gap-6">
                          <div className="p-4 bg-secondary border border-border">
                            <h5 className="text-sm font-medium text-foreground mb-2">Relative Price Positioning</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {area.content.pricePosition}
                            </p>
                          </div>
                          <div className="p-4 bg-secondary border border-border">
                            <h5 className="text-sm font-medium text-foreground mb-2">Rental & Resale Attractiveness</h5>
                            <p className="text-xs text-muted-foreground leading-relaxed">
                              {area.content.rentalAppeal}
                            </p>
                          </div>
                        </div>

                        {/* Best For */}
                        <div className="p-4 bg-primary/5 border border-primary/20">
                          <h5 className="text-sm font-medium text-foreground mb-3">Ideal Buyer Profile</h5>
                          <div className="grid sm:grid-cols-2 gap-2">
                            {area.content.bestFor.map((item, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <span className="text-xs text-muted-foreground">{item}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Area CTA */}
                        <div className="flex flex-wrap gap-4 pt-2">
                          <Link 
                            to={`/properties?area=${encodeURIComponent(area.title.split(' & ')[0])}`}
                            className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                          >
                            View {area.title.split(' & ')[0]} Properties <ArrowRight className="w-4 h-4" />
                          </Link>
                          <Link 
                            to="/contact"
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                          >
                            Request Area-Specific Briefing
                          </Link>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Lifestyle & Commerce Ecosystem */}
      <section id="lifestyle-ecosystem" className="section-padding bg-background">
        <div className="container-wide">
          <div className="mb-12">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-4">
              Lifestyle & Commerce Ecosystem
            </h2>
            <p className="text-muted-foreground max-w-3xl">
              Beyond property specifications, successful investment and relocation depend on surrounding infrastructure. West GAM's concentration of quality services creates measurable advantages for property owners and residents.
            </p>
          </div>

          {/* Hospitality & Hotels */}
          <div className="mb-16" id="hospitality">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <Hotel className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Hospitality & Hotels</h3>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="p-5 bg-secondary border border-border">
                <h4 className="font-medium text-foreground mb-2">Escazú & Santa Ana</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The Marriott Costa Rica and Real InterContinental anchor the premium hospitality segment, offering full-service business facilities and executive meeting rooms. Boutique properties like Hotel & Spa Nau provide intimate alternatives for extended stays.
                </p>
                <p className="text-xs text-primary">Executive accommodations • Business facilities • Medical tourism support</p>
              </div>
              <div className="p-5 bg-secondary border border-border">
                <h4 className="font-medium text-foreground mb-2">Sabana & Rohrmoser</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The Crowne Plaza Corobicí and DoubleTree by Hilton Cariari host conferences, diplomatic events, and business travelers requiring proximity to San José's commercial district while avoiding downtown congestion.
                </p>
                <p className="text-xs text-primary">Conference facilities • Diplomatic events • Central access</p>
              </div>
              <div className="p-5 bg-secondary border border-border">
                <h4 className="font-medium text-foreground mb-2">Belén & Airport Corridor</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The Costa Rica Marriott Hacienda Belén and Wyndham San José provide strategic positioning for travelers and businesses dependent on international connectivity.
                </p>
                <p className="text-xs text-primary">Airport proximity • Transit accommodations • Corporate housing support</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                <strong className="text-foreground">Investor Relevance:</strong> Major hotel brands invest only in markets demonstrating long-term viability. Their presence signals mature infrastructure, supports short-term rental markets, and enables prospective buyers to experience neighborhoods before committing.
              </p>
            </div>
          </div>

          {/* Restaurants & Dining */}
          <div className="mb-16" id="dining">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <UtensilsCrossed className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Restaurants & Dining</h3>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              <div className="p-5 bg-secondary border border-border">
                <h4 className="font-medium text-foreground mb-2">Escazú Dining District</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Avenida Escazú and surrounding streets host Costa Rica's densest concentration of fine dining—contemporary Latin cuisine, pan-Asian excellence, Italian trattorias, and executive steakhouses catering to business entertainment.
                </p>
                <p className="text-xs text-primary">Executive lunch culture • Wine programs • Private dining rooms</p>
              </div>
              <div className="p-5 bg-secondary border border-border">
                <h4 className="font-medium text-foreground mb-2">Santa Ana & Forum</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  The Forum complex and City Place developments have cultivated a business dining ecosystem serving the multinational workforce—professional service, predictable timing, and discreet settings for commercial conversations.
                </p>
                <p className="text-xs text-primary">Business entertainment • International variety • Corporate accounts</p>
              </div>
              <div className="p-5 bg-secondary border border-border">
                <h4 className="font-medium text-foreground mb-2">Sabana & Rohrmoser</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  Park Café ranks among Central America's finest restaurants, while the broader area offers Lebanese, Peruvian, Japanese, and contemporary options within walking distance of residential towers.
                </p>
                <p className="text-xs text-primary">Fine dining landmarks • Diverse cuisines • Walkable from towers</p>
              </div>
            </div>
          </div>

          {/* Shopping, Healthcare & Services */}
          <div className="mb-16" id="shopping">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Shopping, Healthcare & Professional Services</h3>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Shopping */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-primary" />
                  Premium Retail
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Multiplaza Escazú</h5>
                    <p className="text-xs text-muted-foreground">Costa Rica's premier shopping destination—international luxury brands, premium department stores, and sophisticated dining.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Avenida Escazú</h5>
                    <p className="text-xs text-muted-foreground">Lifestyle center combining retail, dining, entertainment, and residential towers in a European-style pedestrian environment.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">City Place Santa Ana</h5>
                    <p className="text-xs text-muted-foreground">Mixed-use development serving the corporate population with retail, restaurants, cinema, and entertainment.</p>
                  </div>
                </div>
              </div>

              {/* Healthcare */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Stethoscope className="w-4 h-4 text-primary" />
                  Healthcare
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Hospital CIMA</h5>
                    <p className="text-xs text-muted-foreground">JCI-accredited facility representing Central America's healthcare benchmark. US-trained physicians, advanced imaging, comprehensive specialty services.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Clínica Bíblica Escazú</h5>
                    <p className="text-xs text-muted-foreground">Extension of Costa Rica's prestigious Clínica Bíblica with emergency services, diagnostics, and outpatient care.</p>
                  </div>
                  <div className="p-4 bg-primary/5 border border-primary/20">
                    <h5 className="text-sm font-medium text-foreground mb-1">Medical Tourism Impact</h5>
                    <p className="text-xs text-muted-foreground">Healthcare excellence drives significant rental demand from medical tourists—a consistent revenue source for nearby property investors.</p>
                  </div>
                </div>
              </div>

              {/* Professional Services */}
              <div className="space-y-4">
                <h4 className="font-medium text-foreground flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-primary" />
                  Professional Services
                </h4>
                <div className="space-y-3">
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Private Banking</h5>
                    <p className="text-xs text-muted-foreground">BAC Credomatic, Scotiabank, and Banco Nacional maintain premium branches with English-speaking staff and wealth management.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Legal & Notarial</h5>
                    <p className="text-xs text-muted-foreground">Concentration of international-focused law firms specializing in real estate, corporate structuring, and immigration.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Consulates & Embassies</h5>
                    <p className="text-xs text-muted-foreground">US Embassy proximity and multiple consulates facilitate visa processing and document authentication.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Education & Business Infrastructure */}
          <div className="mb-16" id="education">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Education & Business Infrastructure</h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Education */}
              <div className="space-y-6">
                <h4 className="font-medium text-foreground">International Schools</h4>
                <p className="text-sm text-muted-foreground">
                  West GAM's concentration of accredited international schools represents the single most important infrastructure element for relocating families—and the strongest stabilizer of residential property values.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Country Day School</h5>
                    <p className="text-xs text-muted-foreground">Costa Rica's premier American-curriculum institution, IB-certified, K-12. Escazú location anchors surrounding residential demand.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Blue Valley School</h5>
                    <p className="text-xs text-muted-foreground">Bilingual institution with strong US university placement. Generates consistent family housing demand in Escazú.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Lincoln School</h5>
                    <p className="text-xs text-muted-foreground">American-accredited with strong STEM focus. Accessible to Belén, Santa Ana, and eastern Escazú.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">European School</h5>
                    <p className="text-xs text-muted-foreground">German and European curriculum for families requiring continental educational continuity.</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Investment Implication:</strong> Properties within international school zones command 15-25% rental premiums and experience significantly lower vacancy rates.
                  </p>
                </div>
              </div>

              {/* Business */}
              <div className="space-y-6">
                <h4 className="font-medium text-foreground">Corporate & Business Zones</h4>
                <p className="text-sm text-muted-foreground">
                  Costa Rica has emerged as Central America's preferred headquarters location for multinational operations, and West GAM concentrates this corporate presence.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Forum Business Park</h5>
                    <p className="text-xs text-muted-foreground">Santa Ana corporate landmark hosting Amazon, Intel, Microsoft—generates significant executive housing demand in Lindora and Pozos.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">COYOL Free Trade Zone</h5>
                    <p className="text-xs text-muted-foreground">Medical device hub (Boston Scientific, Abbott) creating specialized demand for housing in Belén and La Guácima.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Ultrapark & La Sabana</h5>
                    <p className="text-xs text-muted-foreground">Technology and shared services centers driving demand for urban apartment living in Sabana and Rohrmoser.</p>
                  </div>
                  <div className="p-4 bg-secondary border border-border">
                    <h5 className="text-sm font-medium text-foreground mb-1">Zona Franca America</h5>
                    <p className="text-xs text-muted-foreground">Heredia technology corridor accessible to northern West GAM, hosting major tech operations.</p>
                  </div>
                </div>
                <div className="p-4 bg-primary/5 border border-primary/20">
                  <p className="text-sm text-muted-foreground">
                    <strong className="text-foreground">Demand Stability:</strong> Corporate relocations typically involve 2-3 year assignments with housing allowances, creating predictable, high-quality tenant pools.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Connectivity & Mobility */}
          <div id="connectivity">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <Car className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Connectivity & Mobility</h3>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Transportation infrastructure determines daily quality of life and property values. West GAM's positioning provides access advantages no other Costa Rica luxury corridor can match.
                </p>
                <div className="p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-4 h-4 text-primary" />
                    <h5 className="text-sm font-medium text-foreground">Route 27 Corridor</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">Modern highway connects West GAM to Pacific beaches in under an hour, enabling weekend coastal lifestyles impossible from other metropolitan areas.</p>
                </div>
                <div className="p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="w-4 h-4 text-primary" />
                    <h5 className="text-sm font-medium text-foreground">Airport Proximity</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">Juan Santamaría International Airport accessible in 15-35 minutes. Belén: 10 minutes. Escazú/Santa Ana: 20-25 minutes via Route 27.</p>
                </div>
                <div className="p-4 bg-secondary border border-border">
                  <div className="flex items-center gap-2 mb-2">
                    <Building2 className="w-4 h-4 text-primary" />
                    <h5 className="text-sm font-medium text-foreground">Intra-Corridor Connectivity</h5>
                  </div>
                  <p className="text-xs text-muted-foreground">Residents access hospitals, schools, shopping, and business districts without leaving the western zone—significant time-quality advantage.</p>
                </div>
              </div>

              <div className="p-6 bg-primary/5 border border-primary/20">
                <h4 className="font-medium text-foreground mb-4">Why West GAM Outperforms Beach Zones</h4>
                <div className="grid grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-foreground mb-2">West GAM</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• 20-35 min to international airport</li>
                      <li>• 5-15 min to world-class hospitals</li>
                      <li>• Same-day international flights</li>
                      <li>• Complete year-round services</li>
                      <li>• Multinational employment anchors</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-medium text-foreground mb-2">Beach Corridors</p>
                    <ul className="text-muted-foreground space-y-1 text-xs">
                      <li>• 3-5 hours to main airport</li>
                      <li>• Limited medical facilities</li>
                      <li>• Domestic flight required</li>
                      <li>• Seasonal service availability</li>
                      <li>• Tourism-dependent economy</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive POI Map */}
          <div id="interactive-map" className="mt-16">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 flex items-center justify-center">
                <Map className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-serif text-xl font-medium text-foreground">Interactive Amenities Map</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6 max-w-3xl">
              Explore the concentration of world-class amenities across West GAM. Toggle categories to view hospitals, international schools, and premium shopping centers that make this corridor Costa Rica's most livable luxury destination.
            </p>
            <WestGAMPoiMap />
          </div>
        </div>
      </section>

      {/* Section 4: Investment & Relocation Insight */}
      <section id="investment-insight" className="section-padding bg-secondary">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-8 text-center">
              Investment & Relocation Insight
            </h2>
            
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              The concentration of lifestyle infrastructure, security, and economic anchors in West GAM translates directly to measurable investment advantages and successful relocation outcomes.
            </p>

            <div className="grid sm:grid-cols-3 gap-6 mb-12">
              <div className="p-6 bg-background border border-border text-center">
                <Shield className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Capital Preservation</h3>
                <p className="text-sm text-muted-foreground">
                  Established infrastructure protects against boom-bust cycles. West GAM properties maintain value during broader market corrections, supported by consistent international demand and limited developable land.
                </p>
              </div>

              <div className="p-6 bg-background border border-border text-center">
                <Home className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Rental Demand Stability</h3>
                <p className="text-sm text-muted-foreground">
                  Corporate relocations, medical tourism, and international school families create consistent, high-quality tenant pools. Premium rates with low vacancy compared to seasonal beach markets.
                </p>
              </div>

              <div className="p-6 bg-background border border-border text-center">
                <TrendingUp className="w-8 h-8 text-primary mx-auto mb-4" />
                <h3 className="font-medium text-foreground mb-2">Long-Term Appreciation</h3>
                <p className="text-sm text-muted-foreground">
                  Continued infrastructure investment and growing international recognition position West GAM for sustained appreciation as Costa Rica's premier residential corridor.
                </p>
              </div>
            </div>

            <div className="p-8 bg-primary/5 border border-primary/20">
              <h3 className="font-serif text-xl font-medium text-foreground mb-4 text-center">
                Connecting Lifestyle to Financial Outcomes
              </h3>
              <div className="grid sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <h4 className="font-medium text-foreground mb-2">For Investors</h4>
                  <ul className="text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Properties surrounded by quality services command premium rental rates</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>School proximity reduces vacancy and attracts multi-year tenancies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Corporate employment anchors ensure consistent demand regardless of tourism cycles</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-foreground mb-2">For Relocating Families</h4>
                  <ul className="text-muted-foreground space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Access to international-standard healthcare provides peace of mind</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Educational continuity through accredited international schools</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                      <span>Professional services ecosystem supports business and personal needs</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section 5: Why Work With a West GAM Specialist */}
      <section id="why-specialist" className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-medium text-foreground mb-6">
              Why Work With a West GAM Specialist
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-12 max-w-2xl mx-auto">
              Navigating Costa Rica's luxury real estate market requires more than property access—it demands legal expertise, local relationships, and the ability to identify opportunities that never reach public listings.
            </p>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left mb-12">
              <div className="p-6 bg-secondary border border-border">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4">
                  <Scale className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Legal & Real Estate Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Combined expertise ensures transactions are structured for security, tax efficiency, and clear title—critical for international buyers.
                </p>
              </div>
              <div className="p-6 bg-secondary border border-border">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Deep Local Knowledge</h3>
                <p className="text-sm text-muted-foreground">
                  Street-level understanding of every neighborhood, development trajectory, and hidden value opportunity across the entire West GAM corridor.
                </p>
              </div>
              <div className="p-6 bg-secondary border border-border">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">International Experience</h3>
                <p className="text-sm text-muted-foreground">
                  Extensive track record with North American, European, and global clients navigating Costa Rica investment and relocation.
                </p>
              </div>
              <div className="p-6 bg-secondary border border-border">
                <div className="w-10 h-10 bg-primary/10 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-medium text-foreground mb-2">Profit-Focused Decisions</h3>
                <p className="text-sm text-muted-foreground">
                  Every recommendation considers exit strategy, rental yield, appreciation potential, and risk mitigation—not just features.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4">
              <Button asChild size="lg">
                <Link to="/contact">Request a Private Market Briefing</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/properties">Explore Available Portfolio</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Soft CTAs */}
      <section className="section-padding bg-secondary">
        <div className="container-wide">
          <h3 className="font-serif text-xl font-medium text-foreground mb-6 text-center">Continue Your Research</h3>
          <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <Link to="/properties" className="p-6 bg-background border border-border hover:border-primary/30 transition-colors group">
              <Home className="w-6 h-6 text-primary mb-3" />
              <h4 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">Explore Luxury Properties</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Browse current listings across West GAM neighborhoods with detailed specifications and investment metrics.
              </p>
              <span className="text-sm text-primary flex items-center gap-1">
                View Portfolio <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to="/contact" className="p-6 bg-background border border-border hover:border-primary/30 transition-colors group">
              <Users className="w-6 h-6 text-primary mb-3" />
              <h4 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">Request Relocation Consultation</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Personalized guidance on neighborhoods, schools, and properties matching your specific requirements.
              </p>
              <span className="text-sm text-primary flex items-center gap-1">
                Start Conversation <ArrowRight className="w-4 h-4" />
              </span>
            </Link>

            <Link to="/tools" className="p-6 bg-background border border-border hover:border-primary/30 transition-colors group">
              <TrendingUp className="w-6 h-6 text-primary mb-3" />
              <h4 className="font-medium text-foreground mb-2 group-hover:text-primary transition-colors">Access Investment Tools</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Analyze rental yields, mortgage payments, and investment returns for Costa Rica properties.
              </p>
              <span className="text-sm text-primary flex items-center gap-1">
                View Calculators <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA Strip */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-wide">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-xl font-medium mb-2">
                Ready to Explore West GAM Opportunities?
              </h3>
              <p className="text-primary-foreground/60 text-sm">
                Connect with our advisory team for personalized guidance on Costa Rica's premier luxury corridor.
              </p>
            </div>
            <Button 
              size="lg" 
              asChild 
              className="bg-transparent border border-primary-foreground/40 text-primary-foreground hover:bg-primary-foreground/10"
            >
              <Link to="/contact">
                Speak with a West GAM Specialist
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
}
