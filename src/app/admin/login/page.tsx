import type { Metadata } from 'next';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { ShieldCheck } from 'lucide-react';
import { verifySession, SESSION_COOKIE_NAME } from '@/server/auth/session';
import { PasswordInput } from '@/components/admin/ui/password-input';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

export default async function AdminLoginPage(props: {
  searchParams: Promise<{ redirect?: string; error?: string }>;
}) {
  const sp = await props.searchParams;
  const cookieStore = await cookies();
  const existing = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (await verifySession(existing)) {
    redirect(sp.redirect || '/admin');
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#0f1829]">
      {/* Background — soft navy gradient mesh + faint blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          background:
            'radial-gradient(60% 50% at 80% 0%, rgba(34, 211, 238, 0.25) 0%, rgba(15, 24, 41, 0) 70%), radial-gradient(50% 50% at 0% 100%, rgba(245, 158, 11, 0.18) 0%, rgba(15, 24, 41, 0) 70%), linear-gradient(180deg, #0f1829 0%, #1a2744 100%)',
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          {/* Brand mark */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="relative">
              {/* Triple-layer glow for premium brand presence */}
              <div className="absolute inset-0 -m-6 rounded-[2rem] bg-cyan-400/30 blur-2xl" aria-hidden />
              <div className="absolute inset-0 -m-3 rounded-3xl bg-cyan-300/20 blur-lg" aria-hidden />
              <div className="relative flex size-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20 backdrop-blur-sm shadow-2xl">
                <Image
                  src="/logo-icon.png"
                  alt="Invenex"
                  width={40}
                  height={40}
                  className="rounded-lg"
                  priority
                />
              </div>
            </div>
            <h1 className="mt-6 text-2xl font-semibold tracking-tight text-white">
              Invenex Admin Studio
            </h1>
            <p className="mt-2 text-sm text-white/60">
              Sign in to manage quotes &amp; invoices
            </p>
          </div>

          {/* Card */}
          <div className="rounded-3xl bg-white shadow-2xl ring-1 ring-white/10">
            <form action="/api/admin/login" method="post" className="p-8 space-y-5">
              <input type="hidden" name="redirect" value={sp.redirect ?? '/admin'} />

              <PasswordInput
                name="password"
                label="Password"
                autoComplete="current-password"
                required
                placeholder="Enter your admin password"
                error={sp.error ? decodeURIComponent(sp.error) : undefined}
              />

              <button
                type="submit"
                className="group relative inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#1a2744] px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-[#0f1829] hover:shadow-lg active:scale-[0.99]"
              >
                <ShieldCheck className="size-4 opacity-80 group-hover:opacity-100" />
                Sign in securely
              </button>

              <p className="text-center text-xs text-neutral-500">
                Authorized access only. All activity is recorded.
              </p>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-white/40">
            © {new Date().getFullYear()} Invenex · Moulding Value with Excellence &amp; Accuracy
          </p>
        </div>
      </div>
    </main>
  );
}
