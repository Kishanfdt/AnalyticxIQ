import { z } from 'zod';

export const createSaleItemSchema = z.object({
  productId: z
    .string()
    .min(1, { message: 'Product ID is required' })
    .uuid({ message: 'Invalid Product ID format' }),
  quantity: z.coerce
    .number()
    .int({ message: 'Quantity must be an integer' })
    .positive({ message: 'Quantity must be positive' }),
  discount: z.coerce
    .number()
    .min(0, { message: 'Discount cannot be negative' })
    .max(100, { message: 'Discount cannot exceed 100%' })
    .default(0),
});

export const createSaleSchema = z.object({
  customerId: z
    .string()
    .min(1, { message: 'Customer is required' })
    .uuid({ message: 'Invalid Customer ID format' }),
  saleDate: z.coerce.date().optional().nullable(),
  items: z.array(createSaleItemSchema).min(1, { message: 'At least one sale item is required' }),
});

export const updateSaleSchema = createSaleSchema;

export type CreateSaleItemInput = z.infer<typeof createSaleItemSchema>;
export type CreateSaleInput = z.infer<typeof createSaleSchema>;
export type UpdateSaleInput = z.infer<typeof updateSaleSchema>;
