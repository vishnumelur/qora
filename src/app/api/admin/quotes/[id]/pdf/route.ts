import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { getQuote } from '@/server/actions/quotes';
import { QuotePdf } from '@/server/pdf/QuotePdf';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const q = await getQuote(id);
  if (!q) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const buffer = await renderToBuffer(
    QuotePdf({
      kind: 'quote',
      number: q.number,
      title: q.title,
      issueDate: q.issueDate,
      secondDate: q.validUntil,
      customer: q.customer,
      items: q.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
      gstPercent: q.gstPercent,
      terms: q.terms,
      status: q.status,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${q.number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
