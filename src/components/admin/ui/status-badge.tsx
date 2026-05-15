import { cn } from '@/lib/utils';
import { statusChip, statusDot } from './status-colors';

type Status =
  | 'draft'
  | 'sent'
  | 'accepted'
  | 'rejected'
  | 'paid'
  | string;

export function StatusBadge({
  status,
  size = 'sm',
  className,
}: {
  status: Status;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const style = statusChip(status);
  const dot = statusDot(status);
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full font-medium ring-1 ring-inset capitalize',
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-2.5 py-1',
        style,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', dot)} aria-hidden />
      {status}
    </span>
  );
}
