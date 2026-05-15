import { describe, it, expect } from 'vitest';
import { renderToBuffer } from '@react-pdf/renderer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { QuotePdf } from '@/server/pdf/QuotePdf';

describe('QuotePdf', () => {
  it('renders a 3-page quote to a valid PDF buffer', async () => {
    const buf = await renderToBuffer(
      QuotePdf({
        kind: 'quote',
        number: 'MV/Q/2026-0007',
        title: 'Two-cavity injection mould for connector housing',
        issueDate: '2026-05-15',
        secondDate: '2026-05-22',
        customer: {
          name: 'Acme Precision Components Pvt. Ltd.',
          attention: 'Mr. R. Krishnan',
          addressLine: 'Plot 14, MIDC Industrial Area, Pune – 411019',
        },
        items: [
          { description: 'Mould design — 3D CAD + 2D drawings', quantity: '1', unitPrice: '85000' },
          { description: 'Core & cavity machining (P20 hardened)', quantity: '1', unitPrice: '275000' },
          { description: 'Hot-runner system integration (single drop)', quantity: '1', unitPrice: '95000' },
          { description: 'Trial moulding + first-article inspection', quantity: '1', unitPrice: '32000' },
          { description: 'Documentation & process sheets', quantity: '1', unitPrice: '8500' },
        ],
        gstPercent: '18.00',
        terms: [
          'Prices quoted are valid for 7 days from the issue date.',
          'Payment terms: 20% advance, remaining upon delivery.',
          'Delivery Timeline: 10–12 working days from confirmation of purchase order and advance payment.',
          'All customer drawings and technical data will be treated as confidential.',
        ].join('\n'),
        status: 'draft',
      }),
    );

    // Valid PDF starts with "%PDF-"
    expect(buf.slice(0, 5).toString()).toBe('%PDF-');
    expect(buf.length).toBeGreaterThan(20_000);

    // Drop a copy locally so the human can eyeball it.
    if (process.env.PDF_PREVIEW_OUT) {
      const out = path.join('/tmp', 'molvexa-quote-preview.pdf');
      await fs.writeFile(out, new Uint8Array(buf));
      // eslint-disable-next-line no-console
      console.log(`[QuotePdf preview] wrote ${out} (${buf.length} bytes)`);
    }
  }, 30_000);
});
