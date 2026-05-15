import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'neutral',
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  tone?: 'neutral' | 'navy' | 'emerald' | 'amber';
  className?: string;
}) {
  const toneStyles: Record<string, { bg: string; icon: string }> = {
    neutral: { bg: 'bg-white', icon: 'bg-neutral-100 text-neutral-600' },
    navy: { bg: 'bg-[#1a2744] text-white', icon: 'bg-white/10 text-white' },
    emerald: { bg: 'bg-white', icon: 'bg-emerald-50 text-emerald-600' },
    amber: { bg: 'bg-white', icon: 'bg-amber-50 text-amber-600' },
  };
  const s = toneStyles[tone];

  return (
    <div
      className={cn(
        'rounded-2xl p-5 ring-1 ring-neutral-200/70 shadow-sm transition-shadow hover:shadow-md',
        s.bg,
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p
            className={cn(
              'text-xs uppercase tracking-wider font-medium',
              tone === 'navy' ? 'text-white/60' : 'text-neutral-500',
            )}
          >
            {label}
          </p>
          <p
            className={cn(
              'mt-2 font-semibold tabular-nums tracking-[-0.02em] whitespace-nowrap text-2xl',
              tone === 'navy' ? 'text-white' : 'text-neutral-900',
            )}
          >
            {value}
          </p>
          {hint && (
            <p
              className={cn(
                'mt-1 text-xs',
                tone === 'navy' ? 'text-white/60' : 'text-neutral-500',
              )}
            >
              {hint}
            </p>
          )}
        </div>
        {Icon && (
          <div className={cn('flex size-10 items-center justify-center rounded-xl shrink-0', s.icon)}>
            <Icon className="size-5" />
          </div>
        )}
      </div>
    </div>
  );
}
