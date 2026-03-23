-- Create leads table for contact form submissions
CREATE TABLE IF NOT EXISTS public.leads (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),

  -- Contact info
  full_name       text NOT NULL,
  email           text NOT NULL,
  phone           text,

  -- Preferences
  preferred_contact_method  text CHECK (preferred_contact_method IN ('email', 'phone', 'whatsapp')),
  lead_type                 text CHECK (lead_type IN ('general', 'buying', 'selling', 'relocation', 'legal_immigration', 'property_management')),
  country_of_origin         text,
  timeline                  text CHECK (timeline IN ('exploring', 'within_3_months', 'within_6_months', 'within_year', 'over_year')) DEFAULT 'exploring',
  budget_min                integer,
  budget_max                integer,
  interested_areas          text[] DEFAULT '{}',
  message                   text,

  -- Meta
  source          text DEFAULT 'website_contact',
  status          text DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'closed', 'lost'))
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- RLS: anon can INSERT only; service role reads all
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Service role can read leads"
  ON public.leads FOR SELECT
  TO service_role
  USING (true);

CREATE POLICY "Service role can update leads"
  ON public.leads FOR UPDATE
  TO service_role
  USING (true);
