import { prisma } from '../prisma/index.js';
import { Prisma } from '@prisma/client';

export class ProductRepository {
  /**
   * Creates a new product.
   */
  public static async create(data: Prisma.ProductUncheckedCreateInput) {
    return prisma.product.create({
      data,
      include: {
        category: true,
      },
    });
  }

  /**
   * Retrieves paginated products for a business with search filter.
   */
  public static async findAll(
    businessId: string,
    options: { search?: string; page: number; limit: number },
  ) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
      },
    });
  }

  /**
   * Returns total product count for a business matching search query.
   */
  public static async count(businessId: string, search?: string) {
    const where: Prisma.ProductWhereInput = {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.product.count({ where });
  }

  /**
   * Finds a product by its ID and businessId.
   */
  public static async findById(id: string, businessId: string) {
    return prisma.product.findFirst({
      where: { id, businessId },
      include: {
        category: true,
      },
    });
  }

  /**
   * Finds a product by its SKU and businessId.
   */
  public static async findBySku(sku: string, businessId: string) {
    return prisma.product.findFirst({
      where: { sku, businessId },
    });
  }

  /**
   * Updates an existing product.
   */
  public static async update(
    id: string,
    businessId: string,
    data: Prisma.ProductUncheckedUpdateInput,
  ) {
    return prisma.product.update({
      where: { id, businessId },
      data,
      include: {
        category: true,
      },
    });
  }

  /**
   * Deletes a product.
   */
  public static async delete(id: string, businessId: string) {
    return prisma.product.delete({
      where: { id, businessId },
    });
  }
}
