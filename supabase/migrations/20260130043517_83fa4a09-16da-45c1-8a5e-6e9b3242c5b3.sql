-- Create audit log table for tracking admin actions
CREATE TABLE public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id TEXT,
  target_name TEXT,
  details JSONB,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient querying
CREATE INDEX idx_audit_logs_created_at ON public.admin_audit_logs(created_at DESC);
CREATE INDEX idx_audit_logs_admin_user ON public.admin_audit_logs(admin_user_id);
CREATE INDEX idx_audit_logs_action ON public.admin_audit_logs(action);

-- Enable RLS
ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs"
ON public.admin_audit_logs
FOR SELECT
USING (public.is_admin());

-- Only allow inserts via service role (edge functions)
-- No direct insert policy for regular users
CREATE POLICY "Service role can insert audit logs"
ON public.admin_audit_logs
FOR INSERT
WITH CHECK (public.is_admin());