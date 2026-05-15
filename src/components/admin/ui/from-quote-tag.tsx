import { ArrowLeftRight } from 'lucide-react';

/**
 * Small marker shown on invoices that were created by converting a quote
 * (invoices.sourceQuoteId is set). Purely presentational.
 */
export function FromQuoteTag() {
  return (
    <span
      title="Converted from a quote"
      className="inline-flex items-center gap-1 rounded-full bg-cyan-50 px-1.5 py-0.5 text-[10px] font-medium text-cyan-700 ring-1 ring-inset ring-cyan-200"
    >
      <ArrowLeftRight className="size-2.5" aria-hidden />
      From quote
    </span>
  );
}
