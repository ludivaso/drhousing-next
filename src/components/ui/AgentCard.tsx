import { LocaleLink as Link } from '@/components/LocaleLink';
import { Phone, Mail, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Agent } from '@/types';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface AgentCardProps {
  agent: Agent;
  className?: string;
  compact?: boolean;
}

export function AgentCard({ agent, className, compact = false }: AgentCardProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('card-elevated p-6', className)}>
      <div className={cn('flex gap-4', compact ? 'flex-row items-center' : 'flex-col sm:flex-row sm:items-start')}>
        {/* Photo */}
        <div className={cn(
          'rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0',
          compact ? 'w-16 h-16' : 'w-20 h-20 sm:w-24 sm:h-24'
        )}>
          {agent.photoUrl ? (
            <img
              src={agent.photoUrl}
              alt={agent.fullName}
              className="w-full h-full object-cover rounded-full"
            />
          ) : (
            <span className="font-serif text-2xl text-muted-foreground">
              {agent.fullName.split(' ').map(n => n[0]).join('')}
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <Link to={`/agents/${agent.id}`}>
            <h3 className="font-serif text-lg font-medium text-foreground hover:text-primary transition-colors">
              {agent.fullName}
            </h3>
          </Link>
          
          <p className="text-sm text-muted-foreground capitalize mb-2">
            {agent.role.replace('_', ' ')}
          </p>

          {!compact && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Globe className="w-4 h-4" />
                <span>{agent.languages.join(', ')}</span>
              </div>
              
              <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                {agent.bio}
              </p>
            </>
          )}

          {/* Actions */}
          <div className={cn('flex gap-3', compact ? 'mt-2' : 'flex-wrap')}>
            <Button variant="outline" size="sm" asChild>
              <a href={`tel:${agent.phone}`} className="gap-1.5">
                <Phone className="w-3.5 h-3.5" />
                {compact ? '' : t('agentCard.scheduleCall')}
              </a>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <a href={`mailto:${agent.email}`} className="gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {compact ? '' : t('agentCard.email')}
              </a>
            </Button>
            {!compact && (
              <Button size="sm" asChild>
                <Link to={`/agents/${agent.id}`}>{t('agentCard.viewProfile')}</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
