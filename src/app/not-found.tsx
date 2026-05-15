import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl font-bold text-neutral-900">404</p>
      <h1 className="text-lg font-medium text-neutral-700">Page not found</h1>
      <Link
        href="/admin"
        className="rounded-xl bg-[#1a2744] px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#0f1829]"
      >
        Go to admin
      </Link>
    </div>
  );
}
