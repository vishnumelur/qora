import { NextResponse } from 'next/server';
import { renderToBuffer } from '@react-pdf/renderer';
import { getInvoice } from '@/server/actions/invoices';
import { DocumentPdf } from '@/server/pdf/DocumentPdf';

export const runtime = 'nodejs';

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const inv = await getInvoice(id);
  if (!inv) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const buffer = await renderToBuffer(
    DocumentPdf({
      kind: 'invoice',
      number: inv.number,
      title: inv.title,
      issueDate: inv.issueDate,
      secondDate: inv.dueDate,
      customer: inv.customer,
      items: inv.items.map((it) => ({
        description: it.description,
        quantity: it.quantity,
        unitPrice: it.unitPrice,
      })),
      gstPercent: inv.gstPercent,
      terms: inv.terms,
      status: inv.status,
    }),
  );

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${inv.number}.pdf"`,
      'Cache-Control': 'no-store',
    },
  });
}
