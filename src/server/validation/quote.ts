import { z } from 'zod';

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const decimal = (max = 12, scale = 2) =>
  z
    .string()
    .regex(new RegExp(`^-?\\d{1,${max - scale}}(\\.\\d{1,${scale}})?$`), 'Invalid number');

const lineItemSchema = z.object({
  description: z.string().min(1, 'Description required').max(500),
  quantity: decimal().refine((v) => Number(v) > 0, 'Quantity must be > 0'),
  unitPrice: decimal().refine((v) => Number(v) >= 0, 'Unit price must be >= 0'),
});

export const quoteCreateSchema = z
  .object({
    customerId: z.string().uuid(),
    title: z.string().min(1, 'Title required').max(500),
    issueDate: isoDate,
    validUntil: isoDate,
    gstPercent: z
      .string()
      .regex(/^\d{1,3}(\.\d{1,2})?$/)
      .refine((v) => {
        const n = Number(v);
        return n >= 0 && n <= 100;
      }, 'GST % must be between 0 and 100'),
    terms: z.string().min(1, 'Terms required').max(5000),
    notes: z.string().max(2000).optional().nullable().or(z.literal('')),
    items: z.array(lineItemSchema).min(1, 'At least one line item required'),
  })
  .refine((q) => q.validUntil >= q.issueDate, {
    message: 'Valid until must be on or after issue date',
    path: ['validUntil'],
  });

export const quoteUpdateSchema = quoteCreateSchema;

export type QuoteInput = z.infer<typeof quoteCreateSchema>;
export type LineItemInput = z.infer<typeof lineItemSchema>;
