import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AgentForm from '@/components/admin/AgentForm';
import { useAgent } from '@/hooks/useAgents';

export default function AdminAgentEdit() {
  const { id } = useParams<{ id: string }>();
  const { data: agent, isLoading, error } = useAgent(id);
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground mb-4">{t('admin.agentsPage.agentNotFound')}</p>
        <Link to="/admin/agents" className="text-primary hover:underline">
          {t('admin.agentsPage.backToAgents')}
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <Link
          to="/admin/agents"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          {t('admin.agentsPage.backToAgents')}
        </Link>
        <h1 className="font-serif text-3xl font-semibold">{t('admin.agentsPage.editAgent')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.agentsPage.editAgentDesc')}
        </p>
      </div>

      <AgentForm agent={agent} mode="edit" />
    </div>
  );
}
