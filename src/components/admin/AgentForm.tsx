import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useCreateAgent, useUpdateAgent } from '@/hooks/useAgents';
import { Agent, AgentRole } from '@/types';
import { COSTA_RICA_AREAS } from '@/data/constants';
import SingleImageUpload from './SingleImageUpload';

interface AgentFormProps {
  agent?: Agent;
  mode: 'create' | 'edit';
}

const ROLE_OPTIONS: { value: AgentRole; label: string }[] = [
  { value: 'listing_agent', label: 'Listing Agent' },
  { value: 'sales_rep', label: 'Sales Representative' },
  { value: 'admin', label: 'Administrator' },
];

const LANGUAGE_OPTIONS = ['English', 'Spanish', 'Portuguese', 'French', 'German', 'Italian'];

const initialFormData = {
  fullName: '',
  role: 'sales_rep' as AgentRole,
  bio: '',
  phone: '',
  email: '',
  photoUrl: null as string | null,
  languages: [] as string[],
  serviceAreas: [] as string[],
};

export default function AgentForm({ agent, mode }: AgentFormProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const createAgent = useCreateAgent();
  const updateAgent = useUpdateAgent();

  const [formData, setFormData] = useState(() => {
    if (agent) {
      return {
        fullName: agent.fullName,
        role: agent.role,
        bio: agent.bio || '',
        phone: agent.phone || '',
        email: agent.email || '',
        photoUrl: agent.photoUrl,
        languages: agent.languages || [],
        serviceAreas: agent.serviceAreas || [],
      };
    }
    return initialFormData;
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string | string[] | null) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleArrayItem = (field: 'languages' | 'serviceAreas', item: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].includes(item)
        ? prev[field].filter((i) => i !== item)
        : [...prev[field], item],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const agentData: Partial<Agent> = {
      fullName: formData.fullName,
      role: formData.role,
      bio: formData.bio || undefined,
      phone: formData.phone || undefined,
      email: formData.email || undefined,
      photoUrl: formData.photoUrl,
      languages: formData.languages,
      serviceAreas: formData.serviceAreas,
    };

    try {
      if (mode === 'edit' && agent) {
        await updateAgent.mutateAsync({ id: agent.id, ...agentData });
        toast({ title: 'Agent updated', description: 'Changes saved successfully.' });
      } else {
        await createAgent.mutateAsync(agentData);
        toast({ title: 'Agent created', description: 'New agent added successfully.' });
      }
      navigate('/admin/agents');
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save agent.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
      {/* Photo Upload */}
      <section className="card-elevated p-6">
        <h2 className="font-serif text-xl font-semibold mb-4 text-center">Profile Photo</h2>
        <SingleImageUpload
          imageUrl={formData.photoUrl}
          onImageChange={(url) => handleChange('photoUrl', url)}
          bucket="agent-photos"
          folder="agents"
        />
      </section>

      {/* Basic Info */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Basic Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-sm font-medium mb-1 block">Full Name *</label>
            <Input
              value={formData.fullName}
              onChange={(e) => handleChange('fullName', e.target.value)}
              placeholder="John Smith"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Role *</label>
            <Select value={formData.role} onValueChange={(v) => handleChange('role', v)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {ROLE_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Email</label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="agent@drhousing.com"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block">Phone</label>
            <Input
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+506 8888-8888"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-1 block">Bio</label>
          <Textarea
            value={formData.bio}
            onChange={(e) => handleChange('bio', e.target.value)}
            placeholder="Tell us about this agent's experience and expertise..."
            rows={4}
          />
        </div>
      </section>

      {/* Languages */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Languages</h2>
        <div className="flex flex-wrap gap-2">
          {LANGUAGE_OPTIONS.map((language) => (
            <button
              key={language}
              type="button"
              onClick={() => toggleArrayItem('languages', language)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.languages.includes(language)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {language}
            </button>
          ))}
        </div>
      </section>

      {/* Service Areas */}
      <section className="card-elevated p-6 space-y-4">
        <h2 className="font-serif text-xl font-semibold">Service Areas</h2>
        <div className="flex flex-wrap gap-2">
          {COSTA_RICA_AREAS.map((area) => (
            <button
              key={area}
              type="button"
              onClick={() => toggleArrayItem('serviceAreas', area)}
              className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                formData.serviceAreas.includes(area)
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-background border-border hover:border-primary/50'
              }`}
            >
              {area}
            </button>
          ))}
        </div>
      </section>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'edit' ? 'Update Agent' : 'Create Agent'}
            </>
          )}
        </Button>
        <Button type="button" variant="outline" onClick={() => navigate('/admin/agents')}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
