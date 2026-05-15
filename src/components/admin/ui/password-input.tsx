'use client';

import { useId, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> & {
  label?: string;
  error?: string;
};

export function PasswordInput({ label, error, className, id, ...rest }: Props) {
  const reactId = useId();
  const inputId = id ?? reactId;
  const [show, setShow] = useState(false);

  return (
    <div className="space-y-2">
      {label && (
        <label htmlFor={inputId} className="block text-sm font-medium text-neutral-700">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          {...rest}
          id={inputId}
          type={show ? 'text' : 'password'}
          className={cn(
            'w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 pr-11',
            'text-sm text-neutral-900 placeholder:text-neutral-400',
            'focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500',
            'transition-shadow shadow-sm',
            error && 'border-rose-400 focus:ring-rose-500/30 focus:border-rose-500',
            className,
          )}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          tabIndex={-1}
          className="absolute inset-y-0 right-2 my-1 inline-flex items-center justify-center w-8 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
    </div>
  );
}
