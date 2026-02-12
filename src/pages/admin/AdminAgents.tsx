import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Search, Edit, Trash2, Loader2, UserCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useAgents, useDeleteAgent } from '@/hooks/useAgents';
import { useToast } from '@/hooks/use-toast';
import { Agent } from '@/types';

export default function AdminAgents() {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Agent | null>(null);
  const { data: agents, isLoading } = useAgents();
  const deleteAgent = useDeleteAgent();
  const { toast } = useToast();

  const filtered = agents?.filter(a => 
    a.fullName.toLowerCase().includes(search.toLowerCase()) ||
    a.email?.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteAgent.mutateAsync(deleteTarget.id);
      toast({ title: t('admin.agentsPage.delete'), description: `"${deleteTarget.fullName}" ${t('admin.listings.propertyDeletedDesc', { title: '' }).includes('removed') ? 'has been removed.' : 'ha sido eliminado.'}` });
    } catch (error: any) {
      toast({ title: t('admin.listings.error'), description: error.message, variant: 'destructive' });
    } finally { setDeleteTarget(null); }
  };

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-serif text-3xl font-semibold">{t('admin.agentsPage.title')}</h1>
        <Button asChild><Link to="/admin/agents/new"><Plus className="w-4 h-4 mr-2" />{t('admin.agentsPage.addAgent')}</Link></Button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input placeholder={t('admin.agentsPage.searchPlaceholder')} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">{t('admin.agentsPage.noAgents')}</p>
          <Button asChild><Link to="/admin/agents/new">{t('admin.agentsPage.addFirstAgent')}</Link></Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((agent) => (
            <div key={agent.id} className="card-elevated p-4 flex items-start gap-4">
              {agent.photoUrl ? (
                <img src={agent.photoUrl} alt={agent.fullName} className="w-16 h-16 rounded-full object-cover flex-shrink-0" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center flex-shrink-0"><UserCircle className="w-8 h-8 text-muted-foreground" /></div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-medium truncate">{agent.fullName}</h3>
                <p className="text-sm text-muted-foreground">{t(`admin.roles.${agent.role === 'listing_agent' ? 'propertyAdvisor' : agent.role === 'sales_rep' ? 'clientAdvisor' : 'administrator'}`)}</p>
                {agent.email && <p className="text-xs text-muted-foreground truncate mt-1">{agent.email}</p>}
                <div className="flex gap-1 mt-3">
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/admin/agents/${agent.id}`}><Edit className="w-4 h-4 mr-1" />{t('admin.agentsPage.edit')}</Link>
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(agent)} className="text-destructive hover:text-destructive hover:bg-destructive/10">
                    <Trash2 className="w-4 h-4 mr-1" />{t('admin.agentsPage.delete')}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('admin.agentsPage.deleteAgent')}</AlertDialogTitle>
            <AlertDialogDescription>{t('admin.agentsPage.deleteAgentDesc', { name: deleteTarget?.fullName })}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              {deleteAgent.isPending ? (<><Loader2 className="w-4 h-4 mr-2 animate-spin" />{t('admin.agentsPage.deleting')}</>) : t('admin.agentsPage.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
