import { z } from 'zod';

export const createCustomerSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Customer name is required' })
    .max(100, { message: 'Customer name must be under 100 characters' })
    .trim(),
  email: z
    .string()
    .trim()
    .email({ message: 'Invalid email address' })
    .or(z.literal(''))
    .nullable()
    .optional(),
  phone: z
    .string()
    .trim()
    .max(30, { message: 'Phone number must be under 30 characters' })
    .nullable()
    .optional(),
  company: z
    .string()
    .trim()
    .max(100, { message: 'Company name must be under 100 characters' })
    .nullable()
    .optional(),
  address: z
    .string()
    .trim()
    .max(255, { message: 'Address must be under 255 characters' })
    .nullable()
    .optional(),
  notes: z
    .string()
    .trim()
    .max(1000, { message: 'Notes must be under 1000 characters' })
    .nullable()
    .optional(),
});

export const updateCustomerSchema = createCustomerSchema;

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
