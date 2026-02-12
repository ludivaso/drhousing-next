import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { LocaleLink as Link } from '@/components/LocaleLink';
import { ArrowLeft, Phone, Mail, Globe, MapPin, Loader2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { PropertyCard } from '@/components/ui/PropertyCard';
import { Button } from '@/components/ui/button';
import { useAgent } from '@/hooks/useAgents';
import { normalizeLang } from '@/lib/i18nUtils';
import { useTranslation } from 'react-i18next';
import { usePublicProperties } from '@/hooks/useProperties';
import { AgentContactForm } from '@/components/agents/AgentContactForm';

// Check if id looks like a valid UUID
function isValidUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
}

export default function AgentProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const lang = normalizeLang(i18n.resolvedLanguage || i18n.language);
  const { data: agent, isLoading } = useAgent(id);
  const { data: allProperties = [] } = usePublicProperties();

  // Redirect legacy IDs to proper UUID URLs for clean URLs
  useEffect(() => {
    if (!isLoading && agent && id && !isValidUUID(id)) {
      navigate(`/${lang}/agents/${agent.id}`, { replace: true });
    }
  }, [agent, id, isLoading, navigate]);

  if (isLoading) {
    return (
      <Layout>
        <div className="container-wide section-padding flex items-center justify-center min-h-[50vh]">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!agent) {
    return (
      <Layout>
        <div className="container-wide section-padding text-center">
          <h1 className="font-serif text-3xl font-semibold mb-4">Agent Not Found</h1>
          <p className="text-muted-foreground mb-6">The agent you're looking for doesn't exist.</p>
          <Button asChild>
            <Link to="/agents">View All Agents</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  // Find properties where this agent is the listing agent
  const agentProperties = allProperties.filter(p => p.listingAgentId === agent.id);

  return (
    <Layout>
      {/* Back navigation */}
      <div className="bg-card border-b border-border">
        <div className="container-wide py-4">
          <Link to="/agents" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back to Team
          </Link>
        </div>
      </div>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* Main Content */}
            <div className="lg:col-span-2">
              <div className="flex flex-col sm:flex-row gap-6 mb-8">
                {/* Photo */}
                <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {agent.photoUrl ? (
                    <img src={agent.photoUrl} alt={agent.fullName} className="w-full h-full object-cover" />
                  ) : (
                    <span className="font-serif text-4xl text-muted-foreground">
                      {agent.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  )}
                </div>

                <div>
                  <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-foreground mb-2">
                    {agent.fullName}
                  </h1>
                  <p className="text-lg text-muted-foreground capitalize mb-4">
                    {agent.role.replace('_', ' ')}
                  </p>
                  
                  <div className="flex flex-wrap gap-4 text-sm">
                    {agent.languages.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Globe className="w-4 h-4" />
                        <span>{agent.languages.join(', ')}</span>
                      </div>
                    )}
                    {agent.serviceAreas.length > 0 && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4" />
                        <span>{agent.serviceAreas.join(', ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {agent.bio && (
                <div className="mb-8">
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-4">About</h2>
                  <p className="text-muted-foreground leading-relaxed">{agent.bio}</p>
                </div>
              )}

              {/* Agent Properties */}
              {agentProperties.length > 0 && (
                <div>
                  <h2 className="font-serif text-2xl font-semibold text-foreground mb-6">
                    Properties ({agentProperties.length})
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {agentProperties.map(property => (
                      <PropertyCard key={property.id} property={property} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-[140px] space-y-6">
                {/* Quick Contact */}
                <div className="card-elevated p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Quick Contact</h3>
                  
                  <div className="space-y-4 mb-6">
                    {agent.phone && (
                      <a href={`tel:${agent.phone}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                        <Phone className="w-5 h-5" />
                        <span>{agent.phone}</span>
                      </a>
                    )}
                    {agent.email && (
                      <a href={`mailto:${agent.email}`} className="flex items-center gap-3 text-muted-foreground hover:text-foreground transition-colors">
                        <Mail className="w-5 h-5" />
                        <span>{agent.email}</span>
                      </a>
                    )}
                  </div>

                  {agent.phone && (
                    <Button className="w-full mb-3" asChild>
                      <a href={`tel:${agent.phone}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Schedule a Call
                      </a>
                    </Button>
                  )}
                  {agent.email && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={`mailto:${agent.email}`}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email Advisor
                      </a>
                    </Button>
                  )}
                </div>

                {/* Contact Form */}
                <div className="card-elevated p-6">
                  <h3 className="font-serif text-xl font-semibold text-foreground mb-4">Send an Inquiry</h3>
                  <AgentContactForm agent={agent} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
