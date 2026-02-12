import { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Phone, Mail, MessageCircle, Search, Eye, Archive, Users, Download } from 'lucide-react';
import { useLeads, useLead, useUpdateLead } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LeadDetailSheet } from '@/components/admin/LeadDetailSheet';
import { NewLeadDialog } from '@/components/admin/NewLeadDialog';
import { toast } from 'sonner';
import { exportLeadsToCSV } from '@/lib/csvExport';
import { Lead, LeadStatus } from '@/types';

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800 border-blue-200',
  contacted: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  qualified: 'bg-purple-100 text-purple-800 border-purple-200',
  negotiating: 'bg-orange-100 text-orange-800 border-orange-200',
  closed_won: 'bg-green-100 text-green-800 border-green-200',
  closed_lost: 'bg-gray-100 text-gray-800 border-gray-200',
  archived: 'bg-slate-100 text-slate-600 border-slate-200',
};

const LEAD_STATUS_KEYS: LeadStatus[] = ['new', 'contacted', 'qualified', 'negotiating', 'closed_won', 'closed_lost', 'archived'];
const LEAD_TYPE_KEYS = ['relocation', 'investor', 'property_management', 'development', 'legal_immigration', 'family_affairs', 'general'];

export default function AdminLeads() {
  const { t } = useTranslation();
  const { data: leads, isLoading, error } = useLeads();
  const { data: agents } = useAgents();
  const { user, hasRole } = useAuth();
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'all' | 'active'>('active');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  
  const updateLead = useUpdateLead();
  const { data: selectedLead } = useLead(selectedLeadId);
  const isAdmin = hasRole('admin');

  const currentUserAgent = useMemo(() => {
    if (!user?.email || !agents) return null;
    return agents.find(agent => agent.email?.toLowerCase() === user.email?.toLowerCase());
  }, [user, agents]);

  const handleOpenLead = (leadId: string) => { setSelectedLeadId(leadId); setSheetOpen(true); };

  const handleArchiveLead = async (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    try { await updateLead.mutateAsync({ id: lead.id, status: 'archived' }); toast.success(`${lead.fullName} ${t('admin.leadStatus.archived').toLowerCase()}`); }
    catch { toast.error(t('admin.leads.errorLoading')); }
  };

  const handleQuickContact = (e: React.MouseEvent, lead: Lead, method: 'whatsapp' | 'email' | 'phone') => {
    e.stopPropagation();
    const phone = lead.phone?.replace(/\D/g, '');
    switch (method) {
      case 'whatsapp': window.open(`https://wa.me/${phone}`, '_blank'); break;
      case 'email': window.open(`mailto:${lead.email}`, '_blank'); break;
      case 'phone': window.open(`tel:${lead.phone}`, '_blank'); break;
    }
  };

  const handleExportCSV = () => {
    if (!filteredLeads || filteredLeads.length === 0) { toast.error(t('admin.leads.noLeadsMatch')); return; }
    const timestamp = new Date().toISOString().split('T')[0];
    exportLeadsToCSV(filteredLeads, `leads-export-${timestamp}.csv`);
    toast.success(`${t('admin.leads.exportCsv')}: ${filteredLeads.length}`);
  };

  const filteredLeads = leads?.filter((lead) => {
    if (!isAdmin && currentUserAgent) { if (lead.assignedAgentId !== currentUserAgent.id) return false; }
    const matchesSearch = lead.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) || lead.phone?.includes(searchQuery);
    let matchesStatus = true;
    if (statusFilter === 'active') matchesStatus = lead.status !== 'archived';
    else if (statusFilter !== 'all') matchesStatus = lead.status === statusFilter;
    const matchesType = typeFilter === 'all' || lead.leadType === typeFilter;
    const matchesAgent = agentFilter === 'all' || (agentFilter === '__unassigned__' ? !lead.assignedAgentId : lead.assignedAgentId === agentFilter);
    return matchesSearch && matchesStatus && matchesType && matchesAgent;
  });

  if (isLoading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  if (error) return <div className="text-center py-12"><p className="text-destructive">{t('admin.leads.errorLoading')}</p></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h1 className="font-serif text-3xl font-semibold">{t('admin.leads.title')}</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground">{t('admin.leads.count', { filtered: filteredLeads?.length || 0, total: leads?.length || 0 })}</span>
          <Button variant="outline" onClick={handleExportCSV} disabled={!filteredLeads?.length}>
            <Download className="w-4 h-4 mr-2" />{t('admin.leads.exportCsv')}
          </Button>
          <NewLeadDialog />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder={t('admin.leads.searchPlaceholder')} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as LeadStatus | 'all' | 'active')}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder={t('admin.leads.activeLeads')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="active">{t('admin.leads.activeLeads')}</SelectItem>
            <SelectItem value="all">{t('admin.leads.allIncArchived')}</SelectItem>
            {LEAD_STATUS_KEYS.filter(s => s !== 'archived').map(value => (
              <SelectItem key={value} value={value}>{t(`admin.leadStatus.${value}`)}</SelectItem>
            ))}
            <SelectItem value="archived">{t('admin.leads.archivedOnly')}</SelectItem>
          </SelectContent>
        </Select>
        <Select value={typeFilter} onValueChange={setTypeFilter}>
          <SelectTrigger className="w-[180px]"><SelectValue placeholder={t('admin.leads.allTypes')} /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('admin.leads.allTypes')}</SelectItem>
            {LEAD_TYPE_KEYS.map(value => (
              <SelectItem key={value} value={value}>{t(`admin.leadType.${value}`)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isAdmin && (
          <Select value={agentFilter} onValueChange={setAgentFilter}>
            <SelectTrigger className="w-[200px]"><Users className="w-4 h-4 mr-2" /><SelectValue placeholder={t('admin.leads.allAgents')} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('admin.leads.allAgents')}</SelectItem>
              <SelectItem value="__unassigned__">{t('admin.leads.unassigned')}</SelectItem>
              {agents?.map(agent => <SelectItem key={agent.id} value={agent.id}>{agent.fullName}</SelectItem>)}
            </SelectContent>
          </Select>
        )}
      </div>
      
      {!filteredLeads || filteredLeads.length === 0 ? (
        <div className="text-center py-12 card-elevated">
          <p className="text-muted-foreground">{leads?.length === 0 ? t('admin.leads.noLeadsYet') : t('admin.leads.noLeadsMatch')}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => (
            <div key={lead.id} className="card-elevated p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => handleOpenLead(lead.id)}>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium truncate">{lead.fullName}</h3>
                    <Badge className={`${STATUS_COLORS[lead.status]} text-xs`}>{t(`admin.leadStatus.${lead.status}`)}</Badge>
                  </div>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{lead.email}</span>
                    {lead.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{lead.phone}</span>}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">{t(`admin.leadType.${lead.leadType}`)}</Badge>
                    <Badge variant="outline" className="text-xs">{t(`admin.timelineLabel.${lead.timeline}`)}</Badge>
                    <span className="text-xs text-muted-foreground">{new Date(lead.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {lead.phone && (
                    <>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={(e) => handleQuickContact(e, lead, 'phone')} title={t('admin.leadDetail.call')}><Phone className="w-4 h-4" /></Button>
                      <Button size="icon" variant="outline" className="h-8 w-8" onClick={(e) => handleQuickContact(e, lead, 'whatsapp')} title={t('admin.leadDetail.whatsApp')}><MessageCircle className="w-4 h-4" /></Button>
                    </>
                  )}
                  <Button size="icon" variant="outline" className="h-8 w-8" onClick={(e) => handleQuickContact(e, lead, 'email')} title={t('admin.leadDetail.email')}><Mail className="w-4 h-4" /></Button>
                  {lead.status !== 'archived' && (
                    <Button size="icon" variant="outline" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={(e) => handleArchiveLead(e, lead)} disabled={updateLead.isPending}><Archive className="w-4 h-4" /></Button>
                  )}
                  <Button size="sm" variant="default" onClick={(e) => { e.stopPropagation(); handleOpenLead(lead.id); }}>
                    <Eye className="w-4 h-4 mr-1" />{t('admin.leads.view')}
                  </Button>
                </div>
              </div>
              {lead.message && <p className="mt-3 text-sm text-muted-foreground line-clamp-2 border-t pt-3">{lead.message}</p>}
            </div>
          ))}
        </div>
      )}

      <LeadDetailSheet lead={selectedLead || null} open={sheetOpen} onOpenChange={setSheetOpen} />
    </div>
  );
}
