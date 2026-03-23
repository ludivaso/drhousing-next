import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { AgentCard } from '@/components/ui/AgentCard';
import { useAgents } from '@/hooks/useAgents';
import { Loader2 } from 'lucide-react';

export default function AgentsPage() {
  const { data: agents = [], isLoading } = useAgents();
  const { t } = useTranslation();

  return (
    <Layout>
      <LocaleSEO titleKey="seo.agents.title" descriptionKey="seo.agents.description" />
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">{t('agents.title')}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('agents.description')}
          </p>
        </div>
      </section>

      {/* Advisors Grid */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {agents.map(agent => (
                <AgentCard key={agent.id} agent={agent} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Join Team CTA */}
      <section className="bg-secondary py-16">
        <div className="container-wide text-center">
          <h2 className="font-serif text-3xl font-semibold text-foreground mb-4">
            {t('agents.joinTeam')}
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-6">
            {t('agents.joinTeamDesc')}
          </p>
          <a 
            href="mailto:careers@drhousing.net"
            className="inline-flex items-center gap-2 text-primary font-medium hover:underline"
          >
            careers@drhousing.net
          </a>
        </div>
      </section>
    </Layout>
  );
}
