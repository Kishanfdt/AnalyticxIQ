import { prisma } from '../prisma/index.js';
import { Prisma } from '@prisma/client';

export class CustomerRepository {
  /**
   * Creates a new customer.
   */
  public static async create(data: Prisma.CustomerUncheckedCreateInput) {
    return prisma.customer.create({
      data,
    });
  }

  /**
   * Retrieves paginated customers for a business with search filter.
   */
  public static async findAll(
    businessId: string,
    options: { search?: string; page: number; limit: number },
  ) {
    const { search, page, limit } = options;
    const skip = (page - 1) * limit;

    const where: Prisma.CustomerWhereInput = {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Returns total customer count for a business matching search query.
   */
  public static async count(businessId: string, search?: string) {
    const where: Prisma.CustomerWhereInput = {
      businessId,
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search, mode: 'insensitive' } },
              { company: { contains: search, mode: 'insensitive' } },
            ],
          }
        : {}),
    };

    return prisma.customer.count({ where });
  }

  /**
   * Finds a customer by its ID and businessId.
   */
  public static async findById(id: string, businessId: string) {
    return prisma.customer.findFirst({
      where: { id, businessId },
    });
  }

  /**
   * Finds a customer by its email and businessId.
   */
  public static async findByEmail(email: string, businessId: string) {
    return prisma.customer.findFirst({
      where: { email, businessId },
    });
  }

  /**
   * Updates an existing customer.
   */
  public static async update(
    id: string,
    businessId: string,
    data: Prisma.CustomerUncheckedUpdateInput,
  ) {
    return prisma.customer.update({
      where: { id, businessId },
      data,
    });
  }

  /**
   * Deletes a customer.
   */
  public static async delete(id: string, businessId: string) {
    return prisma.customer.delete({
      where: { id, businessId },
    });
  }
}
