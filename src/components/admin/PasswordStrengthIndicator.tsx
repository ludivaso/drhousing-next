import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface PasswordRequirement {
  key: string;
  label: string;
  validator: (password: string) => boolean;
}

const passwordRequirements: PasswordRequirement[] = [
  { 
    key: 'minLength', 
    label: 'admin.users.pwReqMinLength', 
    validator: (pw) => pw.length >= 8 
  },
  { 
    key: 'uppercase', 
    label: 'admin.users.pwReqUppercase', 
    validator: (pw) => /[A-Z]/.test(pw) 
  },
  { 
    key: 'lowercase', 
    label: 'admin.users.pwReqLowercase', 
    validator: (pw) => /[a-z]/.test(pw) 
  },
  { 
    key: 'number', 
    label: 'admin.users.pwReqNumber', 
    validator: (pw) => /\d/.test(pw) 
  },
  { 
    key: 'special', 
    label: 'admin.users.pwReqSpecial', 
    validator: (pw) => /[!@#$%^&*(),.?":{}|<>]/.test(pw) 
  },
];

export function getPasswordStrength(password: string): {
  score: number;
  isValid: boolean;
  passedRequirements: string[];
} {
  const passedRequirements = passwordRequirements
    .filter(req => req.validator(password))
    .map(req => req.key);
  
  const score = passedRequirements.length;
  // Require at least: length, one uppercase OR lowercase, and one number
  const isValid = password.length >= 8 && 
    (/[A-Z]/.test(password) || /[a-z]/.test(password)) && 
    /\d/.test(password);

  return { score, isValid, passedRequirements };
}

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const { t } = useTranslation();
  const { score, passedRequirements } = getPasswordStrength(password);

  const getStrengthLabel = () => {
    if (password.length === 0) return '';
    if (score <= 1) return t('admin.users.pwStrengthWeak');
    if (score <= 2) return t('admin.users.pwStrengthFair');
    if (score <= 3) return t('admin.users.pwStrengthGood');
    if (score <= 4) return t('admin.users.pwStrengthStrong');
    return t('admin.users.pwStrengthExcellent');
  };

  const getStrengthColor = () => {
    if (password.length === 0) return 'bg-muted';
    if (score <= 1) return 'bg-destructive';
    if (score <= 2) return 'bg-orange-500';
    if (score <= 3) return 'bg-yellow-500';
    if (score <= 4) return 'bg-emerald-500';
    return 'bg-emerald-600';
  };

  if (password.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-3', className)}>
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{t('admin.users.pwStrength')}</span>
          <span className={cn(
            'text-xs font-medium',
            score <= 1 && 'text-destructive',
            score === 2 && 'text-orange-500',
            score === 3 && 'text-yellow-600',
            score >= 4 && 'text-emerald-600'
          )}>
            {getStrengthLabel()}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((level) => (
            <div
              key={level}
              className={cn(
                'h-1.5 flex-1 rounded-full transition-colors',
                score >= level ? getStrengthColor() : 'bg-muted'
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="space-y-1">
        {passwordRequirements.map((req) => {
          const passed = passedRequirements.includes(req.key);
          return (
            <div
              key={req.key}
              className={cn(
                'flex items-center gap-2 text-xs transition-colors',
                passed ? 'text-emerald-600' : 'text-muted-foreground'
              )}
            >
              {passed ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <X className="w-3.5 h-3.5" />
              )}
              <span>{t(req.label)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
