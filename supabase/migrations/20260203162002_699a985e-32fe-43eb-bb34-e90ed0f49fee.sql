-- Add notes column for CRM functionality
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS notes text DEFAULT NULL;

-- Add status column for lead tracking
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'new';

-- Add assigned_agent_id for agent assignment
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS assigned_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL;

-- Add last_contacted_at for tracking
ALTER TABLE public.leads 
ADD COLUMN IF NOT EXISTS last_contacted_at timestamp with time zone DEFAULT NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_assigned_agent ON public.leads(assigned_agent_id);