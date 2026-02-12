import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateLead } from '@/hooks/useLeads';
import { useAgents } from '@/hooks/useAgents';
import { toast } from 'sonner';
import { LeadType, PreferredContactMethod, Timeline } from '@/types';

const LEAD_TYPE_KEYS = ['relocation', 'investor', 'property_management', 'development', 'legal_immigration', 'family_affairs', 'general'];
const TIMELINE_KEYS = ['asap', '1_3_months', '3_6_months', '6_12_months', 'exploring'];
const CONTACT_METHOD_KEYS = ['email', 'phone', 'whatsapp'];

const leadFormSchema = z.object({
  fullName: z.string().trim().min(2).max(100),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().max(30).optional().or(z.literal('')),
  leadType: z.enum(['relocation', 'investor', 'property_management', 'development', 'legal_immigration', 'family_affairs', 'general']),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']),
  timeline: z.enum(['asap', '1_3_months', '3_6_months', '6_12_months', 'exploring']),
  countryOfOrigin: z.string().trim().max(100).optional().or(z.literal('')),
  budgetMin: z.coerce.number().min(0).optional().or(z.literal('')),
  budgetMax: z.coerce.number().min(0).optional().or(z.literal('')),
  interestedPropertyType: z.string().trim().max(50).optional().or(z.literal('')),
  message: z.string().trim().max(2000).optional().or(z.literal('')),
  assignedAgentId: z.string().optional().or(z.literal('')),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export function NewLeadDialog() {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const { data: agents } = useAgents();
  const createLead = useCreateLead();

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: { fullName: '', email: '', phone: '', leadType: 'general', preferredContactMethod: 'email', timeline: 'exploring', countryOfOrigin: '', budgetMin: '', budgetMax: '', interestedPropertyType: '', message: '', assignedAgentId: '' },
  });

  const onSubmit = async (values: LeadFormValues) => {
    try {
      await createLead.mutateAsync({
        fullName: values.fullName, email: values.email, phone: values.phone || undefined,
        leadType: values.leadType as LeadType, preferredContactMethod: values.preferredContactMethod as PreferredContactMethod,
        timeline: values.timeline as Timeline, countryOfOrigin: values.countryOfOrigin || null,
        budgetMin: values.budgetMin ? Number(values.budgetMin) : null, budgetMax: values.budgetMax ? Number(values.budgetMax) : null,
        interestedPropertyType: values.interestedPropertyType || null, message: values.message || null,
        assignedAgentId: values.assignedAgentId === '__unassigned__' ? null : values.assignedAgentId || null,
        status: 'new', interestedAreas: [],
      });
      toast.success(t('admin.leads.createBtn'));
      form.reset(); setOpen(false);
    } catch { toast.error(t('admin.listings.error')); }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button><Plus className="w-4 h-4 mr-2" />{t('admin.leads.newLead')}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="font-serif text-xl">{t('admin.leads.createLead')}</DialogTitle></DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="fullName" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.fullName')} *</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.email')} *</FormLabel><FormControl><Input type="email" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.phone')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="preferredContactMethod" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.preferredContact')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{CONTACT_METHOD_KEYS.map(v => <SelectItem key={v} value={v}>{t(`admin.contactMethod.${v}`)}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="leadType" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.leadType')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{LEAD_TYPE_KEYS.map(v => <SelectItem key={v} value={v}>{t(`admin.leadType.${v}`)}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="timeline" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.timeline')} *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>{TIMELINE_KEYS.map(v => <SelectItem key={v} value={v}>{t(`admin.timelineLabel.${v}`)}</SelectItem>)}</SelectContent>
                  </Select><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField control={form.control} name="countryOfOrigin" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.countryOfOrigin')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="interestedPropertyType" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.propertyTypeInterest')}</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="budgetMin" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.minBudget')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="budgetMax" render={({ field }) => (
                <FormItem><FormLabel>{t('admin.leads.maxBudget')}</FormLabel><FormControl><Input type="number" {...field} /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="assignedAgentId" render={({ field }) => (
              <FormItem><FormLabel>{t('admin.leads.assignToAgent')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value || "__unassigned__"}><FormControl><SelectTrigger><SelectValue placeholder={t('admin.leads.unassigned')} /></SelectTrigger></FormControl>
                  <SelectContent>
                    <SelectItem value="__unassigned__">{t('admin.leads.unassigned')}</SelectItem>
                    {agents?.map(agent => <SelectItem key={agent.id} value={agent.id}>{agent.fullName}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage /></FormItem>
            )} />
            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem><FormLabel>{t('admin.leads.notesMessage')}</FormLabel><FormControl><Textarea rows={3} {...field} /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>{t('common.cancel')}</Button>
              <Button type="submit" disabled={createLead.isPending}>
                {createLead.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}{t('admin.leads.createBtn')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
