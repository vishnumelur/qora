'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';

export function SortHeader({
  field,
  label,
  basePath,
  align = 'left',
  className,
}: {
  field: string;
  label: string;
  basePath: string;
  align?: 'left' | 'right';
  className?: string;
}) {
  const sp = useSearchParams();
  const currentField = sp.get('sort') ?? 'createdAt';
  const currentDir = sp.get('dir') === 'asc' ? 'asc' : 'desc';
  const active = currentField === field;
  const nextDir = active ? (currentDir === 'asc' ? 'desc' : 'asc') : 'desc';

  const params = new URLSearchParams(sp.toString());
  params.set('sort', field);
  params.set('dir', nextDir);
  const href = `${basePath}?${params.toString()}`;

  const Icon = !active ? ArrowUpDown : currentDir === 'asc' ? ArrowUp : ArrowDown;

  return (
    <Link
      href={href}
      className={cn(
        'inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-medium',
        active ? 'text-neutral-900' : 'text-neutral-500 hover:text-neutral-900',
        align === 'right' && 'justify-end',
        className,
      )}
    >
      {label}
      <Icon className={cn('size-3', active ? 'opacity-100' : 'opacity-40')} />
    </Link>
  );
}
