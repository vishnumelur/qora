// Smart INR formatter: whole rupees render without trailing ".00",
// paise render with the full ".XX" pair so they don't look truncated.
//   5000   → "₹5,000"
//   5000.5 → "₹5,000.50"
//   0      → "₹0"
const inrWholeFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const inrPaiseFmt = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function inr(value: number | string): string {
  const n = typeof value === 'string' ? Number(value) : value;
  // Round to 2 places so "5000.001" and "5000" both display cleanly.
  const rounded2 = Math.round(n * 100) / 100;
  return rounded2 === Math.round(rounded2) ? inrWholeFmt.format(rounded2) : inrPaiseFmt.format(rounded2);
}

const dateFmt = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: '2-digit',
  year: 'numeric',
});

export function fmtDate(iso: string): string {
  // iso is "YYYY-MM-DD" — parse as a local date to avoid TZ shift.
  const [y, m, d] = iso.split('-').map(Number);
  return dateFmt.format(new Date(y, m - 1, d));
}
