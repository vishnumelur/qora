'use client';

import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown, Search, UserPlus } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Customer } from '@/server/db/schema';

type Props = {
  customers: Customer[];
  value: string;
  onChange: (id: string) => void;
  error?: string;
  required?: boolean;
};

export function CustomerCombobox({ customers, value, onChange, error, required }: Props) {
  const reactId = useId();
  const selected = customers.find((c) => c.id === value) ?? null;

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [highlighted, setHighlighted] = useState(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  // Filtered list — name, attention, or address
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.attention, c.addressLine, c.email]
        .filter(Boolean)
        .some((s) => (s as string).toLowerCase().includes(q)),
    );
  }, [customers, query]);

  // Reset highlight when filter changes
  useEffect(() => {
    setHighlighted(0);
  }, [query, open]);

  // Focus the search input when opening
  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Click-outside to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Keep highlighted item in view
  useEffect(() => {
    if (!open) return;
    const items = listRef.current?.querySelectorAll('[role="option"]');
    items?.[highlighted]?.scrollIntoView({ block: 'nearest' });
  }, [highlighted, open]);

  function pick(c: Customer) {
    onChange(c.id);
    setOpen(false);
    setQuery('');
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const c = filtered[highlighted];
      if (c) pick(c);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
      setQuery('');
    }
  }

  return (
    <div className="relative" ref={wrapperRef}>
      {/* Hidden input mirrors the value for forms / required validation */}
      <input
        type="text"
        name="customerId"
        value={value}
        readOnly
        required={required}
        tabIndex={-1}
        aria-hidden
        className="sr-only"
      />

      {/* Trigger button — looks like the other inputs */}
      <button
        type="button"
        id={reactId}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={cn(
          'group w-full rounded-xl border bg-white px-4 py-2.5 text-left text-sm shadow-sm',
          'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500',
          'transition-shadow',
          error ? 'border-rose-400' : 'border-neutral-200 hover:border-neutral-300',
        )}
      >
        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            {selected ? (
              <>
                <div className="truncate font-medium text-neutral-900">{selected.name}</div>
                {(selected.attention || selected.addressLine) && (
                  <div className="truncate text-xs text-neutral-500 mt-0.5">
                    {[selected.attention, selected.addressLine].filter(Boolean).join(' · ')}
                  </div>
                )}
              </>
            ) : (
              <span className="text-neutral-400">Pick a customer…</span>
            )}
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-neutral-400 group-focus:text-neutral-700" />
        </div>
      </button>

      {/* Popover */}
      {open && (
        <div
          className="absolute z-30 mt-2 w-full overflow-hidden rounded-2xl bg-white ring-1 ring-neutral-200 shadow-xl"
          onKeyDown={onKeyDown}
        >
          {/* Search row */}
          <div className="relative border-b border-neutral-100">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search by name, attention, address…"
              className="w-full bg-transparent pl-9 pr-3 py-2.5 text-sm focus:outline-none placeholder:text-neutral-400"
            />
          </div>

          {/* List */}
          {filtered.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm">
              <div className="text-neutral-500">No customers match &ldquo;{query}&rdquo;</div>
              <a
                href="/admin/customers/new"
                className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-[#1a2744] px-3 py-1.5 text-xs font-medium text-white hover:bg-[#0f1829]"
              >
                <UserPlus className="size-3.5" />
                Create new customer
              </a>
            </div>
          ) : (
            <ul
              ref={listRef}
              role="listbox"
              className="max-h-72 overflow-y-auto py-1"
            >
              {filtered.map((c, idx) => {
                const isSelected = c.id === value;
                const isHighlighted = idx === highlighted;
                return (
                  <li
                    key={c.id}
                    role="option"
                    aria-selected={isSelected}
                    onMouseEnter={() => setHighlighted(idx)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      pick(c);
                    }}
                    className={cn(
                      'flex items-center gap-3 px-4 py-2.5 cursor-pointer',
                      isHighlighted && 'bg-neutral-50',
                    )}
                  >
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#1a2744]/5 text-[#1a2744] text-xs font-semibold">
                      {c.name.slice(0, 1).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium text-neutral-900">
                        {c.name}
                      </div>
                      {(c.attention || c.addressLine) && (
                        <div className="truncate text-xs text-neutral-500">
                          {[c.attention, c.addressLine].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                    {isSelected && <Check className="size-4 shrink-0 text-cyan-700" />}
                  </li>
                );
              })}
            </ul>
          )}

          {/* Footer "Create new" link when list is non-empty too */}
          {filtered.length > 0 && (
            <a
              href="/admin/customers/new"
              className="flex items-center gap-2 border-t border-neutral-100 px-4 py-2.5 text-xs font-medium text-cyan-700 hover:bg-neutral-50"
            >
              <UserPlus className="size-3.5" />
              Create new customer
            </a>
          )}
        </div>
      )}

      {error && <p className="text-xs text-rose-600 mt-1">{error}</p>}
    </div>
  );
}
