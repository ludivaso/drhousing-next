import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Phone, Mail, MessageSquare, Calendar, MapPin, DollarSign, 
  Building2, Clock, User, ExternalLink, MessageCircle, Save
} from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useUpdateLead } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import { toast } from 'sonner';
import { Lead, LeadStatus } from '@/types';

interface LeadDetailSheetProps {
  lead: (Lead & { property?: { id: string; title: string; images: string[] } | null }) | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STATUS_COLORS: Record<LeadStatus, string> = {
  new: 'bg-blue-100 text-blue-800',
  contacted: 'bg-yellow-100 text-yellow-800',
  qualified: 'bg-purple-100 text-purple-800',
  negotiating: 'bg-orange-100 text-orange-800',
  closed_won: 'bg-green-100 text-green-800',
  closed_lost: 'bg-gray-100 text-gray-800',
  archived: 'bg-slate-100 text-slate-600',
};

const LEAD_STATUS_KEYS: LeadStatus[] = ['new', 'contacted', 'qualified', 'negotiating', 'closed_won', 'closed_lost', 'archived'];

export function LeadDetailSheet({ lead, open, onOpenChange }: LeadDetailSheetProps) {
  const { t } = useTranslation();
  const [notes, setNotes] = useState(lead?.notes || '');
  const [status, setStatus] = useState<LeadStatus>(lead?.status || 'new');
  const [assignedAgentId, setAssignedAgentId] = useState(lead?.assignedAgentId || '');
  
  const { data: agents } = useAgents();
  const updateLead = useUpdateLead();

  useState(() => {
    if (lead) { setNotes(lead.notes || ''); setStatus(lead.status); setAssignedAgentId(lead.assignedAgentId || ''); }
  });

  if (!lead) return null;

  const handleSave = async () => {
    try {
      await updateLead.mutateAsync({
        id: lead.id, notes, status,
        assignedAgentId: assignedAgentId || null,
        lastContactedAt: status !== lead.status && status !== 'new' ? new Date().toISOString() : lead.lastContactedAt,
      });
      toast.success(t('admin.leadDetail.saveChanges'));
    } catch { toast.error(t('admin.listings.error')); }
  };

  const handleContact = (method: 'whatsapp' | 'sms' | 'email' | 'phone') => {
    const phone = lead.phone?.replace(/\D/g, '');
    switch (method) {
      case 'whatsapp': window.open(`https://wa.me/${phone}?text=Hello ${lead.fullName}, following up on your inquiry...`, '_blank'); break;
      case 'sms': window.open(`sms:${lead.phone}`, '_blank'); break;
      case 'email': window.open(`mailto:${lead.email}?subject=RE: Your Inquiry&body=Hello ${lead.fullName},%0D%0A%0D%0AThank you for your interest...`, '_blank'); break;
      case 'phone': window.open(`tel:${lead.phone}`, '_blank'); break;
    }
  };

  const formatBudget = (min: number | null, max: number | null) => {
    if (!min && !max) return t('admin.leadDetail.notSpecified');
    if (min && max) return `$${min.toLocaleString()} - $${max.toLocaleString()}`;
    if (min) return t('admin.leadDetail.budgetFrom', { amount: min.toLocaleString() });
    return t('admin.leadDetail.budgetUpTo', { amount: max?.toLocaleString() });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-3">
            <span className="font-serif text-xl">{lead.fullName}</span>
            <Badge className={STATUS_COLORS[lead.status]}>{t(`admin.leadStatus.${lead.status}`)}</Badge>
          </SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap gap-2">
            {lead.phone && (
              <>
                <Button size="sm" variant="outline" onClick={() => handleContact('phone')}><Phone className="w-4 h-4 mr-2" />{t('admin.leadDetail.call')}</Button>
                <Button size="sm" variant="outline" onClick={() => handleContact('whatsapp')}><MessageCircle className="w-4 h-4 mr-2" />{t('admin.leadDetail.whatsApp')}</Button>
                <Button size="sm" variant="outline" onClick={() => handleContact('sms')}><MessageSquare className="w-4 h-4 mr-2" />{t('admin.leadDetail.sms')}</Button>
              </>
            )}
            <Button size="sm" variant="outline" onClick={() => handleContact('email')}><Mail className="w-4 h-4 mr-2" />{t('admin.leadDetail.email')}</Button>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">{t('admin.leadDetail.contactInfo')}</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-muted-foreground" /><a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a></div>
              {lead.phone && <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-muted-foreground" /><a href={`tel:${lead.phone}`} className="hover:underline">{lead.phone}</a></div>}
              {lead.countryOfOrigin && <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-muted-foreground" /><span>{lead.countryOfOrigin}</span></div>}
              <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-muted-foreground" /><span>{t('admin.leadDetail.prefers', { method: t(`admin.contactMethod.${lead.preferredContactMethod}`) })}</span></div>
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="font-medium mb-3">{t('admin.leadDetail.leadDetails')}</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-muted-foreground">{t('admin.leadDetail.type')}</span><p className="font-medium">{t(`admin.leadType.${lead.leadType}`)}</p></div>
              <div><span className="text-muted-foreground">{t('admin.leadDetail.timeline')}</span><p className="font-medium">{t(`admin.timelineLabel.${lead.timeline}`)}</p></div>
              <div><span className="text-muted-foreground">{t('admin.leadDetail.budget')}</span><p className="font-medium">{formatBudget(lead.budgetMin, lead.budgetMax)}</p></div>
              <div><span className="text-muted-foreground">{t('admin.leadDetail.submitted')}</span><p className="font-medium">{new Date(lead.createdAt).toLocaleDateString()}</p></div>
              {lead.interestedPropertyType && <div><span className="text-muted-foreground">{t('admin.leadDetail.propertyType')}</span><p className="font-medium capitalize">{lead.interestedPropertyType}</p></div>}
              {lead.interestedAreas?.length > 0 && <div className="col-span-2"><span className="text-muted-foreground">{t('admin.leadDetail.interestedAreas')}</span><p className="font-medium">{lead.interestedAreas.join(', ')}</p></div>}
            </div>
          </div>

          {lead.property && (
            <><Separator /><div>
              <h3 className="font-medium mb-3">{t('admin.leadDetail.sourceProperty')}</h3>
              <Link to={`/properties/${lead.property.id}`} target="_blank" className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted transition-colors">
                {lead.property.images?.[0] && <img src={lead.property.images[0]} alt={lead.property.title} className="w-16 h-12 object-cover rounded" />}
                <div className="flex-1 min-w-0"><p className="font-medium truncate">{lead.property.title}</p><p className="text-xs text-muted-foreground">{t('admin.leadDetail.clickToView')}</p></div>
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
              </Link>
            </div></>
          )}

          {lead.message && (
            <><Separator /><div>
              <h3 className="font-medium mb-3">{t('admin.leadDetail.message')}</h3>
              <p className="text-sm bg-muted p-3 rounded-lg whitespace-pre-wrap">{lead.message}</p>
            </div></>
          )}

          <Separator />

          <div className="space-y-4">
            <h3 className="font-medium">{t('admin.leadDetail.crmManagement')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t('admin.leadDetail.status')}</label>
                <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {LEAD_STATUS_KEYS.map(value => <SelectItem key={value} value={value}>{t(`admin.leadStatus.${value}`)}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">{t('admin.leadDetail.assignedAgent')}</label>
                <Select value={assignedAgentId || '__unassigned__'} onValueChange={(v) => setAssignedAgentId(v === '__unassigned__' ? '' : v)}>
                  <SelectTrigger><SelectValue placeholder={t('admin.leads.unassigned')} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unassigned__">{t('admin.leads.unassigned')}</SelectItem>
                    {agents?.map(agent => <SelectItem key={agent.id} value={agent.id}>{agent.fullName}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">{t('admin.leadDetail.notes')}</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder={t('admin.leadDetail.notesPlaceholder')} rows={4} />
            </div>
            <Button onClick={handleSave} disabled={updateLead.isPending} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {updateLead.isPending ? t('admin.leadDetail.saving') : t('admin.leadDetail.saveChanges')}
            </Button>
          </div>

          {lead.lastContactedAt && (
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {t('admin.leadDetail.lastContacted', { date: new Date(lead.lastContactedAt).toLocaleString() })}
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
