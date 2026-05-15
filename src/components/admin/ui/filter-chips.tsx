'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export type FilterChip = {
  label: string;
  value: string | null; // null = "All"
  count?: number;
};

export function FilterChips({
  chips,
  paramKey = 'status',
  basePath,
}: {
  chips: FilterChip[];
  paramKey?: string;
  basePath: string;
}) {
  const sp = useSearchParams();
  const current = sp.get(paramKey);

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => {
        const isActive = (current ?? null) === c.value;
        const params = new URLSearchParams(sp.toString());
        if (c.value) params.set(paramKey, c.value);
        else params.delete(paramKey);
        const href = `${basePath}${params.toString() ? `?${params.toString()}` : ''}`;
        return (
          <Link
            key={c.label}
            href={href}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors',
              isActive
                ? 'bg-[#1a2744] text-white shadow-sm'
                : 'bg-white text-neutral-700 ring-1 ring-neutral-200 hover:bg-neutral-50',
            )}
          >
            {c.label}
            {typeof c.count === 'number' && (
              <span
                className={cn(
                  'inline-flex items-center justify-center rounded-full px-1.5 text-[10px] font-semibold tabular-nums',
                  isActive ? 'bg-white/15 text-white' : 'bg-neutral-100 text-neutral-600',
                )}
              >
                {c.count}
              </span>
            )}
          </Link>
        );
      })}
    </div>
  );
}
