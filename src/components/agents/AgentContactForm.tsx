import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useSubmitPublicLead } from '@/hooks/useLeads';
import { toast } from '@/hooks/use-toast';
import type { Agent } from '@/types';

const contactSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required').max(100),
  email: z.string().trim().email('Invalid email address').max(255),
  phone: z.string().trim().max(30).optional(),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp']),
  message: z.string().trim().min(1, 'Message is required').max(1000),
});

type ContactFormData = z.infer<typeof contactSchema>;

interface AgentContactFormProps {
  agent: Agent;
}

export function AgentContactForm({ agent }: AgentContactFormProps) {
  const { t } = useTranslation();
  const submitLead = useSubmitPublicLead();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      preferredContactMethod: 'email',
      message: '',
    },
  });

  const preferredMethod = watch('preferredContactMethod');

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitLead.mutateAsync({
        leadType: 'general',
        fullName: data.fullName,
        email: data.email,
        phone: data.phone || '',
        preferredContactMethod: data.preferredContactMethod,
        message: `[Agent Inquiry: ${agent.fullName}] ${data.message}`,
        timeline: 'exploring',
        countryOfOrigin: null,
        budgetMin: null,
        budgetMax: null,
        interestedAreas: [],
        interestedPropertyType: null,
      });

      setSubmitted(true);
      reset();
      toast({
        title: t('contact.successTitle', 'Message Sent!'),
        description: t('contact.successMessage', 'We\'ll get back to you soon.'),
      });
    } catch (error) {
      toast({
        title: t('contact.errorTitle', 'Error'),
        description: t('contact.errorMessage', 'Failed to send message. Please try again.'),
        variant: 'destructive',
      });
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-6">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Send className="w-6 h-6 text-primary" />
        </div>
        <h4 className="font-serif text-lg font-semibold text-foreground mb-2">
          {t('contact.thankYou', 'Thank You!')}
        </h4>
        <p className="text-sm text-muted-foreground mb-4">
          {t('contact.willRespond', 'We\'ll respond to your inquiry shortly.')}
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          {t('contact.sendAnother', 'Send Another Message')}
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fullName">{t('contact.name', 'Your Name')} *</Label>
        <Input
          id="fullName"
          {...register('fullName')}
          placeholder={t('contact.namePlaceholder', 'John Doe')}
          className={errors.fullName ? 'border-destructive' : ''}
        />
        {errors.fullName && (
          <p className="text-xs text-destructive">{errors.fullName.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t('contact.email', 'Email')} *</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          placeholder={t('contact.emailPlaceholder', 'john@example.com')}
          className={errors.email ? 'border-destructive' : ''}
        />
        {errors.email && (
          <p className="text-xs text-destructive">{errors.email.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">{t('contact.phone', 'Phone')}</Label>
        <Input
          id="phone"
          type="tel"
          {...register('phone')}
          placeholder={t('contact.phonePlaceholder', '+1 (555) 123-4567')}
        />
      </div>

      <div className="space-y-2">
        <Label>{t('contact.preferredContact', 'Preferred Contact Method')}</Label>
        <RadioGroup
          value={preferredMethod}
          onValueChange={(value) => setValue('preferredContactMethod', value as 'email' | 'phone' | 'whatsapp')}
          className="flex flex-wrap gap-4"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="email" id="method-email" />
            <Label htmlFor="method-email" className="font-normal cursor-pointer">
              {t('contact.methodEmail', 'Email')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="phone" id="method-phone" />
            <Label htmlFor="method-phone" className="font-normal cursor-pointer">
              {t('contact.methodPhone', 'Phone')}
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="whatsapp" id="method-whatsapp" />
            <Label htmlFor="method-whatsapp" className="font-normal cursor-pointer">
              {t('contact.methodWhatsApp', 'WhatsApp')}
            </Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="message">{t('contact.message', 'Message')} *</Label>
        <Textarea
          id="message"
          {...register('message')}
          placeholder={t('contact.messagePlaceholder', 'I\'m interested in learning more about...')}
          rows={4}
          className={errors.message ? 'border-destructive' : ''}
        />
        {errors.message && (
          <p className="text-xs text-destructive">{errors.message.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {t('contact.sending', 'Submitting...')}
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            {t('contact.send', 'Submit Inquiry')}
          </>
        )}
      </Button>
    </form>
  );
}
