'use client';

import { useState } from 'react';

export type LineItemRow = {
  description: string;
  quantity: string;
  unitPrice: string;
};

export function LineItemsEditor({
  initial,
  onChange,
}: {
  initial: LineItemRow[];
  onChange: (rows: LineItemRow[]) => void;
}) {
  const [rows, setRows] = useState<LineItemRow[]>(
    initial.length ? initial : [{ description: '', quantity: '1', unitPrice: '0' }],
  );

  const update = (next: LineItemRow[]) => {
    setRows(next);
    onChange(next);
  };

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 gap-2 text-xs font-medium text-neutral-500 px-2">
        <div className="col-span-6">Description</div>
        <div className="col-span-2 text-right">Quantity</div>
        <div className="col-span-3 text-right">Unit Price (₹)</div>
        <div className="col-span-1" />
      </div>
      {rows.map((row, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 items-start">
          <input
            className="col-span-6 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow"
            value={row.description}
            onChange={(e) =>
              update(rows.map((r, i) => (i === idx ? { ...r, description: e.target.value } : r)))
            }
            placeholder="e.g., 3D MOULD DESIGN"
          />
          <input
            className="col-span-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-right placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow tabular-nums"
            inputMode="decimal"
            value={row.quantity}
            onChange={(e) =>
              update(rows.map((r, i) => (i === idx ? { ...r, quantity: e.target.value } : r)))
            }
          />
          <input
            className="col-span-3 rounded-xl border border-neutral-200 bg-white px-3 py-2 text-sm text-right placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/40 focus:border-cyan-500 shadow-sm transition-shadow tabular-nums font-mono"
            inputMode="decimal"
            value={row.unitPrice}
            onChange={(e) =>
              update(rows.map((r, i) => (i === idx ? { ...r, unitPrice: e.target.value } : r)))
            }
          />
          <button
            type="button"
            onClick={() => update(rows.filter((_, i) => i !== idx))}
            disabled={rows.length === 1}
            className="col-span-1 text-red-500 hover:underline disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label="Remove line"
          >
            ×
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => update([...rows, { description: '', quantity: '1', unitPrice: '0' }])}
        className="inline-flex items-center gap-1 text-sm font-medium text-cyan-700 hover:text-cyan-900 mt-2"
      >
        + Add line
      </button>
    </div>
  );
}
