import { useTranslation } from 'react-i18next';
import { Loader2, History, User, Clock, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useAuditLogs, getActionLabel } from '@/hooks/useAuditLogs';
import { formatDistanceToNow } from 'date-fns';

export default function AdminAuditLogs() {
  const { t } = useTranslation();
  const { data: logs, isLoading } = useAuditLogs({ limit: 100 });

  const getInitials = (name: string | null, email: string | null) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email?.charAt(0).toUpperCase() || 'A';
  };

  const getActionColor = (action: string): string => {
    if (action.includes('delete')) return 'destructive';
    if (action.includes('create')) return 'default';
    if (action.includes('update') || action.includes('add')) return 'secondary';
    if (action.includes('remove')) return 'outline';
    return 'secondary';
  };

  const formatDetails = (details: Record<string, unknown> | null): string => {
    if (!details) return '';
    
    const parts: string[] = [];
    
    if (details.field && details.newValue) {
      parts.push(`${details.field}: "${details.newValue}"`);
    }
    if (details.oldEmail && details.newEmail) {
      parts.push(`${details.oldEmail} → ${details.newEmail}`);
    }
    if (details.email && !details.newEmail) {
      parts.push(`${details.email}`);
    }
    if (details.role) {
      parts.push(`Role: ${details.role}`);
    }
    
    return parts.join(', ');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center gap-3">
          <History className="w-8 h-8 text-primary" />
          <div>
            <h1 className="font-serif text-3xl font-semibold">{t('admin.auditLogs.title')}</h1>
            <p className="text-muted-foreground mt-1">{t('admin.auditLogs.description')}</p>
          </div>
        </div>
      </div>

      {logs?.length === 0 ? (
        <div className="text-center py-12 card-elevated rounded-lg">
          <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">{t('admin.auditLogs.noLogs')}</p>
        </div>
      ) : (
        <div className="card-elevated rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('admin.auditLogs.admin')}</TableHead>
                <TableHead>{t('admin.auditLogs.action')}</TableHead>
                <TableHead>{t('admin.auditLogs.target')}</TableHead>
                <TableHead>{t('admin.auditLogs.details')}</TableHead>
                <TableHead>{t('admin.auditLogs.time')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs?.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="w-7 h-7">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs">
                          {getInitials(log.adminName, log.adminEmail)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-sm">
                        <p className="font-medium">{log.adminName || t('admin.users.noName')}</p>
                        <p className="text-xs text-muted-foreground">{log.adminEmail}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActionColor(log.action) as any}>
                      {getActionLabel(log.action)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{log.targetName || log.targetId || '—'}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-sm text-muted-foreground">
                      {formatDetails(log.details) || '—'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}