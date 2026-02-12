import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';

export interface AuditLog {
  id: string;
  adminUserId: string;
  adminName: string | null;
  adminEmail: string | null;
  action: string;
  targetType: string;
  targetId: string | null;
  targetName: string | null;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
}

export function useAuditLogs(options?: { limit?: number }) {
  const limit = options?.limit || 50;

  return useQuery({
    queryKey: ['auditLogs', limit],
    queryFn: async () => {
      // Fetch audit logs
      const { data: logs, error: logsError } = await supabase
        .from('admin_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (logsError) throw logsError;

      // Get unique admin user IDs
      const adminUserIds = [...new Set(logs.map(log => log.admin_user_id))];

      // Fetch admin profiles
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', adminUserIds);

      const profilesByUserId = (profiles || []).reduce((acc, p) => {
        acc[p.user_id] = p;
        return acc;
      }, {} as Record<string, { full_name: string | null; email: string | null }>);

      // Map to typed objects
      return logs.map((log): AuditLog => ({
        id: log.id,
        adminUserId: log.admin_user_id,
        adminName: profilesByUserId[log.admin_user_id]?.full_name || null,
        adminEmail: profilesByUserId[log.admin_user_id]?.email || null,
        action: log.action,
        targetType: log.target_type,
        targetId: log.target_id,
        targetName: log.target_name,
        details: log.details as Record<string, unknown> | null,
        ipAddress: log.ip_address,
        createdAt: log.created_at,
      }));
    },
  });
}

// Log client-side admin actions (role changes, etc.)
export function useLogAdminAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      action,
      targetType,
      targetId,
      targetName,
      details,
    }: {
      action: string;
      targetType: string;
      targetId?: string | null;
      targetName?: string | null;
      details?: Record<string, unknown> | null;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('admin_audit_logs')
        .insert([{
          admin_user_id: user.id,
          action,
          target_type: targetType,
          target_id: targetId || null,
          target_name: targetName || null,
          details: (details || null) as Json,
        }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auditLogs'] });
    },
  });
}

// Action labels for display
export const ACTION_LABELS: Record<string, string> = {
  'user.create': 'Created user',
  'user.profile.update': 'Updated user profile',
  'user.email.update': 'Changed user email',
  'user.password.reset_sent': 'Sent password reset',
  'user.delete': 'Deleted user',
  'user.role.add': 'Added user role',
  'user.role.remove': 'Removed user role',
  'property.create': 'Created property',
  'property.update': 'Updated property',
  'property.delete': 'Deleted property',
  'agent.create': 'Created agent',
  'agent.update': 'Updated agent',
  'agent.delete': 'Deleted agent',
};

export function getActionLabel(action: string): string {
  return ACTION_LABELS[action] || action;
}