'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  Receipt,
  Users,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/quotes', label: 'Quotes', icon: FileText },
  { href: '/admin/invoices', label: 'Invoices', icon: Receipt },
  { href: '/admin/customers', label: 'Customers', icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close drawer when route changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900">
      {/* ============ DESKTOP SIDEBAR ============ */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-neutral-200 bg-white lg:flex">
        <SidebarBrand />
        <SidebarNav pathname={pathname} />
        <SidebarFooter />
      </aside>

      {/* ============ MOBILE TOP BAR ============ */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-neutral-200 bg-white/80 px-4 py-3 backdrop-blur-md lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          aria-label="Open menu"
          className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-700 hover:bg-neutral-100"
        >
          <Menu className="size-5" />
        </button>
        <Link href="/admin" className="flex items-center gap-2">
          <Image
            src="/logo-icon.png"
            alt="Invenex"
            width={24}
            height={24}
            className="rounded-md"
          />
          <span className="font-semibold tracking-tight">Invenex Admin</span>
        </Link>
      </header>

      {/* ============ MOBILE DRAWER ============ */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-neutral-900/40 backdrop-blur-sm lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <aside className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-neutral-200 bg-white shadow-2xl lg:hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
              <Link href="/admin" className="flex items-center gap-2.5">
                <Image
                  src="/logo-icon.png"
                  alt="Invenex"
                  width={28}
                  height={28}
                  className="rounded-md"
                />
                <span className="font-semibold tracking-tight">Invenex Admin</span>
              </Link>
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close menu"
                className="inline-flex size-9 items-center justify-center rounded-lg text-neutral-500 hover:bg-neutral-100"
              >
                <X className="size-5" />
              </button>
            </div>
            <SidebarNav pathname={pathname} />
            <SidebarFooter />
          </aside>
        </>
      )}

      {/* ============ MAIN ============ */}
      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">{children}</div>
      </main>
    </div>
  );
}

function SidebarBrand() {
  return (
    <div className="flex items-center gap-3 px-5 py-5 border-b border-neutral-200">
      <Image
        src="/logo-icon.png"
        alt="Invenex"
        width={36}
        height={36}
        className="rounded-lg"
      />
      <div className="leading-tight">
        <div className="font-semibold tracking-tight text-neutral-900">Invenex</div>
        <div className="text-[11px] uppercase tracking-wider text-neutral-500">
          Admin Studio
        </div>
      </div>
    </div>
  );
}

function SidebarNav({ pathname }: { pathname: string }) {
  return (
    <nav className="flex-1 overflow-y-auto px-3 py-4">
      <ul className="space-y-1">
        {ITEMS.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                  active
                    ? 'bg-[#1a2744] text-white shadow-sm'
                    : 'text-neutral-700 hover:bg-neutral-100',
                )}
              >
                <Icon
                  className={cn(
                    'size-[18px] shrink-0',
                    active ? 'text-white' : 'text-neutral-500 group-hover:text-neutral-900',
                  )}
                />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-neutral-200 p-3">
      <form action="/api/admin/logout" method="post">
        <button
          type="submit"
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
        >
          <LogOut className="size-[18px] text-neutral-500" />
          Sign out
        </button>
      </form>
    </div>
  );
}
