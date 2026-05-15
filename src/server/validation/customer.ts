import { z } from 'zod';

const optionalText = (max: number) =>
  z
    .string()
    .max(max)
    .optional()
    .nullable()
    .or(z.literal(''));

export const customerSchema = z.object({
  name: z.string().min(1, 'Name is required').max(200),
  attention: optionalText(200),
  addressLine: optionalText(500),
  gstNumber: optionalText(50),
  email: z.string().email().max(200).optional().nullable().or(z.literal('')),
  phone: optionalText(50),
  notes: optionalText(2000),
});

export type CustomerInput = z.infer<typeof customerSchema>;
