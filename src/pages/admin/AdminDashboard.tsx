import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Users, TrendingUp, Loader2, UserCircle, Stethoscope } from 'lucide-react';
import { useProperties } from '@/hooks/useProperties';
import { useLeads } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';

export default function AdminDashboard() {
  const { t } = useTranslation();
  const { data: properties, isLoading: propertiesLoading } = useProperties();
  const { data: leads, isLoading: leadsLoading } = useLeads();
  const { data: agents, isLoading: agentsLoading } = useAgents();

  const isLoading = propertiesLoading || leadsLoading || agentsLoading;

  // Filter out archived leads for the count
  const activeLeads = leads?.filter(l => l.status !== 'archived') || [];

  const stats = [
    { labelKey: 'admin.dashboard.totalListings', value: properties?.length || 0, icon: Home, href: '/admin/listings' },
    { labelKey: 'admin.dashboard.agents', value: agents?.length || 0, icon: UserCircle, href: '/admin/agents' },
    { labelKey: 'admin.dashboard.activeLeads', value: activeLeads.length, icon: Users, href: '/admin/leads' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold mb-6">{t('admin.dashboard.title')}</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => (
          <Link 
            key={stat.labelKey} 
            to={stat.href}
            className="card-elevated p-6 hover:shadow-lg transition-shadow cursor-pointer group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t(stat.labelKey)}</p>
                <p className="font-serif text-3xl font-semibold">{stat.value}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <p className="text-muted-foreground mb-4">{t('admin.dashboard.welcome')}</p>
      <Link to="/diagnostic" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
        <Stethoscope className="w-4 h-4" />
        {t('admin.dashboard.diagnostic')}
      </Link>
    </div>
  );
}
