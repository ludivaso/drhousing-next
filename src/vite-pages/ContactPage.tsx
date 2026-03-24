import { Phone, Mail, MapPin, MessageSquare, Send } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Layout } from '@/components/layout/Layout';
import { LocaleSEO } from '@/components/LocaleSEO';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/hooks/use-toast';
import { useSubmitPublicLead } from '@/hooks/useLeads';
import { 
  LeadType, 
  Timeline, 
  PreferredContactMethod,
  LEAD_TYPE_LABELS, 
  TIMELINE_LABELS, 
  CONTACT_METHOD_LABELS 
} from '@/types';
import { COSTA_RICA_AREAS } from '@/data/constants';

// Zod schema for comprehensive validation
const contactFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),
  email: z
    .string()
    .trim()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(255, 'Email must be less than 255 characters'),
  phone: z
    .string()
    .trim()
    .min(1, 'Phone number is required')
    .max(30, 'Phone must be less than 30 characters'),
  preferredContactMethod: z.enum(['email', 'phone', 'whatsapp'], {
    required_error: 'Please select a contact method',
  }),
  leadType: z.enum(['general', 'buying', 'selling', 'relocation', 'legal_immigration', 'property_management'], {
    required_error: 'Please select what you are interested in',
  }),
  countryOfOrigin: z
    .string()
    .trim()
    .max(100, 'Country must be less than 100 characters')
    .optional()
    .or(z.literal('')),
  timeline: z.enum(['exploring', 'within_3_months', 'within_6_months', 'within_year', 'over_year']).optional(),
  budgetMin: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
      message: 'Budget must be a positive number',
    }),
  budgetMax: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : undefined))
    .refine((val) => val === undefined || (Number.isInteger(val) && val >= 0), {
      message: 'Budget must be a positive number',
    }),
  interestedAreas: z
    .array(z.string().max(100))
    .max(20, 'You can select up to 20 areas')
    .default([]),
  message: z
    .string()
    .trim()
    .max(2000, 'Message must be less than 2000 characters')
    .optional()
    .or(z.literal('')),
});

type ContactFormData = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const submitLead = useSubmitPublicLead();

  const form = useForm<ContactFormData>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      preferredContactMethod: undefined,
      leadType: undefined,
      countryOfOrigin: '',
      timeline: undefined,
      budgetMin: undefined,
      budgetMax: undefined,
      interestedAreas: [],
      message: '',
    },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitLead.mutateAsync({
        fullName: data.fullName,
        email: data.email,
        phone: data.phone,
        preferredContactMethod: data.preferredContactMethod as PreferredContactMethod,
        leadType: data.leadType as LeadType,
        countryOfOrigin: data.countryOfOrigin || null,
        timeline: (data.timeline as Timeline) || 'exploring',
        budgetMin: data.budgetMin ?? null,
        budgetMax: data.budgetMax ?? null,
        interestedAreas: data.interestedAreas,
        interestedPropertyType: null,
        message: data.message || null,
      });

      toast({
        title: t('contactPage.successTitle'),
        description: t('contactPage.successDesc'),
      });

      form.reset();
    } catch (error) {
      toast({
        title: t('contact.errorTitle'),
        description: t('contact.errorMessage'),
        variant: 'destructive',
      });
    }
  };

  const handleAreaToggle = (area: string) => {
    const currentAreas = form.getValues('interestedAreas');
    const newAreas = currentAreas.includes(area)
      ? currentAreas.filter((a) => a !== area)
      : [...currentAreas, area];
    form.setValue('interestedAreas', newAreas);
  };

  const interestedAreas = form.watch('interestedAreas');

  return (
    <Layout>
      <LocaleSEO titleKey="seo.contact.title" descriptionKey="seo.contact.description" />
      {/* Header */}
      <section className="bg-forest-dark text-primary-foreground py-16">
        <div className="container-wide">
          <h1 className="font-serif text-4xl sm:text-5xl font-semibold mb-4">{t('contactPage.title')}</h1>
          <p className="text-primary-foreground/80 text-lg max-w-2xl">
            {t('contactPage.description')}
          </p>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-1">
              <h2 className="font-serif text-2xl font-semibold text-foreground mb-8">{t('contactPage.getInTouch')}</h2>
              
              <div className="space-y-8 mb-10">
                <a href="tel:+50686540888" className="flex items-start gap-4 group">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Phone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.phone')}</h4>
                    <p className="text-muted-foreground">+506 8654 0888</p>
                    <p className="text-sm text-muted-foreground/70">{t('contactPage.phoneHours')}</p>
                  </div>
                </a>

                <a href="mailto:info@drhousing.net" className="flex items-start gap-4 group">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <Mail className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.email')}</h4>
                    <p className="text-muted-foreground">info@drhousing.net</p>
                    <p className="text-sm text-muted-foreground/70">{t('contactPage.emailResponse')}</p>
                  </div>
                </a>

                <a href="https://wa.me/50686540888" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary/20 transition-colors">
                    <MessageSquare className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.whatsapp')}</h4>
                    <p className="text-muted-foreground">+506 8654 0888</p>
                    <p className="text-sm text-muted-foreground/70">{t('contactPage.whatsappResponse')}</p>
                  </div>
                </a>

                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-foreground">{t('contactPage.office')}</h4>
                    <p className="text-muted-foreground">Escazú, San José</p>
                    <p className="text-sm text-muted-foreground/70">Costa Rica</p>
                  </div>
                </div>
              </div>

              {/* Interactive Map */}
              <div className="rounded overflow-hidden border border-border mb-10">
                <iframe
                  title="DR Housing Office Location"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15719.847392214!2d-84.14842!3d9.9277!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8fa0fb6c0f4c3c5f%3A0x3c8c51e9c45e6c2d!2sEscaz%C3%BA%2C%20San%20Jos%C3%A9%20Province%2C%20Costa%20Rica!5e0!3m2!1sen!2sus!4v1709712000000!5m2!1sen!2sus"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full"
                />
              </div>

              {/* Quick Actions */}
              <div className="space-y-3">
                <Button className="w-full" size="lg" asChild>
                  <a href="tel:+50686540888">
                    <Phone className="w-4 h-4 mr-2" />
                    {t('common.callNow')}
                  </a>
                </Button>
                <Button variant="outline" className="w-full" size="lg" asChild>
                  <a href="https://wa.me/50686540888" target="_blank" rel="noopener noreferrer">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    WhatsApp
                  </a>
                </Button>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="card-elevated p-8 sm:p-10">
                <h2 className="font-serif text-2xl font-semibold text-foreground mb-3">{t('contactPage.sendMessage')}</h2>
                <p className="text-muted-foreground mb-8">
                  {t('contactPage.sendMessageDesc')}
                </p>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.fullName')} *</FormLabel>
                            <FormControl>
                              <Input placeholder="John Smith" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.emailLabel')} *</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="john@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.phoneLabel')} *</FormLabel>
                            <FormControl>
                              <Input placeholder="+1 555-123-4567" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="preferredContactMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.preferredContact')} *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('contactPage.select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(CONTACT_METHOD_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Inquiry Type */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="leadType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.interestedIn')} *</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('contactPage.select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(LEAD_TYPE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="countryOfOrigin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.countryOfOrigin')}</FormLabel>
                            <FormControl>
                              <Input placeholder="United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Timeline & Budget */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="timeline"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.timeline')}</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder={t('contactPage.select')} />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {Object.entries(TIMELINE_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>{label}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budgetMin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.minBudget')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="$200,000" 
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="budgetMax"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>{t('contactPage.maxBudget')}</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="$500,000" 
                                {...field}
                                value={field.value ?? ''}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Areas of Interest */}
                    <FormField
                      control={form.control}
                      name="interestedAreas"
                      render={() => (
                        <FormItem>
                          <FormLabel>{t('contactPage.areasOfInterest')}</FormLabel>
                          <div className="flex flex-wrap gap-2">
                            {COSTA_RICA_AREAS.slice(0, 12).map((area) => (
                              <button
                                key={area}
                                type="button"
                                onClick={() => handleAreaToggle(area)}
                                className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                                  interestedAreas.includes(area)
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                                }`}
                              >
                                {area}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Message */}
                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t('contactPage.message')}</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder={t('contactPage.messagePlaceholder')}
                              rows={4}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button type="submit" size="lg" className="w-full sm:w-auto" disabled={form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? (
                        t('contactPage.sending')
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          {t('contactPage.sendBtn')}
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
