// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

const refresh = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh, push: vi.fn() }),
}));

const setQuoteStatusAction = vi.fn();
const setInvoiceStatusAction = vi.fn();
vi.mock('@/server/actions/quotes', () => ({
  setQuoteStatusAction: (...a: unknown[]) => setQuoteStatusAction(...a),
}));
vi.mock('@/server/actions/invoices', () => ({
  setInvoiceStatusAction: (...a: unknown[]) => setInvoiceStatusAction(...a),
}));

import { StatusSelect } from '@/components/admin/ui/status-select';

describe('StatusSelect — inline status change from list', () => {
  beforeEach(() => {
    refresh.mockClear();
    setQuoteStatusAction.mockReset().mockResolvedValue(undefined);
    setInvoiceStatusAction.mockReset().mockResolvedValue(undefined);
  });

  it('calls setQuoteStatusAction with the new value and refreshes (quote)', async () => {
    render(<StatusSelect kind="quote" id="q-1" status="draft" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'accepted' } });

    await waitFor(() => expect(setQuoteStatusAction).toHaveBeenCalledWith('q-1', 'accepted'));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(setInvoiceStatusAction).not.toHaveBeenCalled();
  });

  it('calls setInvoiceStatusAction with the new value and refreshes (invoice)', async () => {
    render(<StatusSelect kind="invoice" id="inv-9" status="sent" />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'paid' } });

    await waitFor(() => expect(setInvoiceStatusAction).toHaveBeenCalledWith('inv-9', 'paid'));
    await waitFor(() => expect(refresh).toHaveBeenCalled());
    expect(setQuoteStatusAction).not.toHaveBeenCalled();
  });

  it('renders quote-specific options', () => {
    render(<StatusSelect kind="quote" id="q-2" status="draft" />);
    expect(screen.getByRole('option', { name: 'Accepted' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Rejected' })).toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Paid' })).not.toBeInTheDocument();
  });

  it('is colour-coded by status and the colour flips instantly on change', () => {
    render(<StatusSelect kind="quote" id="q-3" status="draft" />);
    const select = screen.getByRole('combobox');

    // draft → neutral palette
    expect(select.className).toContain('bg-neutral-100');
    expect(select.className).not.toContain('bg-emerald-50');

    // changing to accepted flips to the emerald palette immediately (local state)
    fireEvent.change(select, { target: { value: 'accepted' } });
    expect(select.className).toContain('bg-emerald-50');
    expect(select.className).not.toContain('bg-neutral-100');
  });
});
