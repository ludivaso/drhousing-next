-- Step 2: Create helper functions for role-based access

-- Function to check if user has any of the specified roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id uuid, _roles app_role[])
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = ANY(_roles)
  )
$$;

-- Helper function to check if user can edit listings (admin or listing_editor)
CREATE OR REPLACE FUNCTION public.can_edit_listings()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'listing_editor']::app_role[])
$$;

-- Helper function to check if user can view leads (admin or agent)
CREATE OR REPLACE FUNCTION public.can_view_leads()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'agent']::app_role[])
$$;

-- Helper function to check if user can edit leads (admin or agent)
CREATE OR REPLACE FUNCTION public.can_edit_leads()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_any_role(auth.uid(), ARRAY['admin', 'agent']::app_role[])
$$;

-- Update properties RLS to allow listing_editor to manage
CREATE POLICY "Listing editors can manage properties"
ON public.properties
FOR ALL
USING (public.can_edit_listings());

-- Allow agents to view all leads
CREATE POLICY "Agents can view leads"
ON public.leads
FOR SELECT
USING (public.can_view_leads());

-- Allow agents to update leads (for status changes, notes, etc)
CREATE POLICY "Agents can update leads"
ON public.leads
FOR UPDATE
USING (public.can_edit_leads());