import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import AgentForm from '@/components/admin/AgentForm';

export default function AdminAgentNew() {
  const { t } = useTranslation();

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
        <h1 className="font-serif text-3xl font-semibold">{t('admin.agentsPage.addNewAgent')}</h1>
        <p className="text-muted-foreground mt-1">
          {t('admin.agentsPage.addNewAgentDesc')}
        </p>
      </div>

      <AgentForm mode="create" />
    </div>
  );
}
