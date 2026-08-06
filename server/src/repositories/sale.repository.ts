import { prisma } from '../prisma/index.js';
import { Prisma } from '@prisma/client';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class SaleRepository {
  /**
   * Creates a new sale and its associated items inside a Prisma transaction.
   */
  public static async create(
    businessId: string,
    customerId: string,
    saleDate: Date | null | undefined,
    items: { productId: string; quantity: number; unitPrice: number; discount: number }[],
    totalAmount: number,
  ) {
    return prisma.$transaction(async (tx) => {
      // Deduct product stock and validate
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product with ID "${item.productId}" not found.`, 404, ERROR_CODES.NOT_FOUND);
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
            400,
            ERROR_CODES.BAD_REQUEST,
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return tx.sale.create({
        data: {
          businessId,
          customerId,
          saleDate: saleDate || undefined,
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
    });
  }

  /**
   * Retrieves paginated sales for a business with search filter (searches customer name/company).
   */
  public static async findAll(
    businessId: string,
    options: { search?: string; page: number; limit: number },
  ) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.SaleWhereInput = {
      businessId,
      ...(search
        ? {
            customer: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    return prisma.sale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { saleDate: 'desc' },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Returns total sale count for a business matching search query.
   */
  public static async count(businessId: string, search?: string) {
    const where: Prisma.SaleWhereInput = {
      businessId,
      ...(search
        ? {
            customer: {
              OR: [
                { name: { contains: search, mode: 'insensitive' } },
                { company: { contains: search, mode: 'insensitive' } },
              ],
            },
          }
        : {}),
    };

    return prisma.sale.count({ where });
  }

  /**
   * Finds a sale by its ID and businessId.
   */
  public static async findById(id: string, businessId: string) {
    return prisma.sale.findFirst({
      where: { id, businessId },
      include: {
        customer: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });
  }

  /**
   * Updates an existing sale and its items inside a Prisma transaction.
   */
  public static async update(
    id: string,
    businessId: string,
    customerId: string,
    saleDate: Date | null | undefined,
    items: { productId: string; quantity: number; unitPrice: number; discount: number }[],
    totalAmount: number,
  ) {
    return prisma.$transaction(async (tx) => {
      // 1. Retrieve the existing sale items to revert their quantities back to stock
      const existingSale = await tx.sale.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!existingSale) {
        throw new AppError('Sale not found.', 404, ERROR_CODES.NOT_FOUND);
      }

      // Revert the stock of existing sale items
      for (const oldItem of existingSale.items) {
        await tx.product.update({
          where: { id: oldItem.productId },
          data: {
            stock: {
              increment: oldItem.quantity,
            },
          },
        });
      }

      // 2. Validate new quantities against the restored stock and deduct stock
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new AppError(`Product with ID "${item.productId}" not found.`, 404, ERROR_CODES.NOT_FOUND);
        }

        if (product.stock < item.quantity) {
          throw new AppError(
            `Insufficient stock for product "${product.name}". Available: ${product.stock}, requested: ${item.quantity}.`,
            400,
            ERROR_CODES.BAD_REQUEST,
          );
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      // 3. Delete all existing sale items for this sale
      await tx.saleItem.deleteMany({
        where: { saleId: id },
      });

      // 4. Update the sale and insert new items
      return tx.sale.update({
        where: { id, businessId },
        data: {
          customerId,
          saleDate: saleDate || undefined,
          totalAmount,
          items: {
            create: items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              discount: item.discount,
            })),
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          customer: true,
        },
      });
    });
  }

  /**
   * Deletes a sale. (Child sale items cascade delete)
   */
  public static async delete(id: string, businessId: string) {
    return prisma.$transaction(async (tx) => {
      const existingSale = await tx.sale.findFirst({
        where: { id, businessId },
        include: { items: true },
      });

      if (!existingSale) {
        throw new AppError('Sale not found.', 404, ERROR_CODES.NOT_FOUND);
      }

      // Restore stock for all items
      for (const item of existingSale.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      // Delete the sale record (cascade delete will handle SaleItem)
      return tx.sale.delete({
        where: { id, businessId },
      });
    });
  }
}
