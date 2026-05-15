/**
 * Single source of truth for status → colour classes, shared by
 * StatusBadge (dashboard / detail) and StatusSelect (list dropdowns)
 * so the colour language stays consistent everywhere.
 */

export const STATUS_CHIP: Record<string, string> = {
  draft: 'bg-neutral-100 text-neutral-700 ring-neutral-200',
  sent: 'bg-sky-50 text-sky-700 ring-sky-200',
  accepted: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  rejected: 'bg-rose-50 text-rose-700 ring-rose-200',
  paid: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  partial: 'bg-amber-50 text-amber-700 ring-amber-200',
};

export const STATUS_DOT: Record<string, string> = {
  draft: 'bg-neutral-400',
  sent: 'bg-sky-500',
  accepted: 'bg-emerald-500',
  rejected: 'bg-rose-500',
  paid: 'bg-emerald-500',
  partial: 'bg-amber-500',
};

export function statusChip(status: string): string {
  return STATUS_CHIP[status] ?? STATUS_CHIP.draft;
}

export function statusDot(status: string): string {
  return STATUS_DOT[status] ?? STATUS_DOT.draft;
}
