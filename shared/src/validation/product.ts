import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'Product name is required' })
    .max(100, { message: 'Product name must be under 100 characters' })
    .trim(),
  sku: z
    .string()
    .min(1, { message: 'SKU is required' })
    .max(50, { message: 'SKU must be under 50 characters' })
    .trim(),
  price: z.coerce.number().nonnegative({ message: 'Price must be a non-negative number' }),
  costPrice: z.coerce
    .number()
    .nonnegative({ message: 'Cost price must be a non-negative number' })
    .nullable()
    .optional(),
  stock: z.coerce
    .number()
    .int({ message: 'Stock must be an integer' })
    .nonnegative({ message: 'Stock must be non-negative' })
    .default(0),
  categoryName: z
    .string()
    .trim()
    .min(1, { message: 'Category name must be at least 1 character' })
    .nullable()
    .optional(),
  description: z.string().trim().nullable().optional(),
});

export const updateProductSchema = createProductSchema;

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
