export type LineLike = { quantity: string; unitPrice: string };
export type PaymentLike = { amount: string };

export function lineSubtotal(quantity: string, unitPrice: string): number {
  const q = Number(quantity);
  const u = Number(unitPrice);
  return round2(q * u);
}

export function recordTotals(items: LineLike[], gstPercent: string) {
  const subtotal = round2(
    items.reduce((sum, it) => sum + lineSubtotal(it.quantity, it.unitPrice), 0),
  );
  const gstAmount = round2((subtotal * Number(gstPercent)) / 100);
  const total = round2(subtotal + gstAmount);
  return { subtotal, gstAmount, total };
}

export function sumPayments(payments: PaymentLike[]): number {
  return round2(payments.reduce((s, p) => s + Number(p.amount), 0));
}

/**
 * Compute the full money picture for an invoice — totals + paid + outstanding.
 * Outstanding can be negative if customer overpaid; UI may surface that as a credit.
 */
export function recordTotalsWithPayments(
  items: LineLike[],
  gstPercent: string,
  payments: PaymentLike[],
) {
  const t = recordTotals(items, gstPercent);
  const paid = sumPayments(payments);
  const outstanding = round2(t.total - paid);
  return { ...t, paid, outstanding };
}

/**
 * Derive what status pill to display. The stored invoice.status is preserved
 * for workflow ('draft' vs 'sent'), but payment state takes precedence once
 * any payment exists.
 */
export type DerivedInvoiceStatus = 'draft' | 'sent' | 'partial' | 'paid';

export function deriveInvoiceStatus(
  storedStatus: string,
  total: number,
  paid: number,
): DerivedInvoiceStatus {
  if (storedStatus === 'draft') return 'draft';
  if (paid >= total && total > 0) return 'paid';
  if (paid > 0) return 'partial';
  return 'sent';
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
