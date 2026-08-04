import { SaleRepository } from '../repositories/sale.repository.js';
import { CustomerRepository } from '../repositories/customer.repository.js';
import { prisma } from '../prisma/index.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import { CreateSaleInput, UpdateSaleInput } from '@analyticiq/shared';

export class SaleService {
  /**
   * Creates a new sale with automatic unitPrice and totalAmount calculations.
   */
  public static async createSale(businessId: string, input: CreateSaleInput) {
    const { customerId, saleDate, items } = input;

    // 1. Verify that the customer exists and belongs to the business
    const customer = await CustomerRepository.findById(customerId, businessId);
    if (!customer) {
      throw new AppError('Customer not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    // 2. Fetch all products in a single database query to check existence & scope
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    // Validate that all products were found
    for (const item of items) {
      if (!productMap.has(item.productId)) {
        throw new AppError(
          `Product with ID "${item.productId}" was not found in your inventory.`,
          404,
          ERROR_CODES.NOT_FOUND,
        );
      }
    }

    // 3. Recalculate unit price and totals on the backend
    let calculatedTotal = 0;
    const processedItems = items.map((item) => {
      const dbProduct = productMap.get(item.productId)!;
      const basePrice = Number(dbProduct.price);
      const discount = item.discount || 0;

      // Apply discount
      const unitPrice = Math.round(basePrice * (1 - discount / 100) * 100) / 100;
      const itemSubtotal = Math.round(item.quantity * unitPrice * 100) / 100;
      calculatedTotal += itemSubtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount,
      };
    });

    // Enforce 2 decimal places for overall total
    const roundedTotal = Math.round(calculatedTotal * 100) / 100;

    // 4. Save to database using transaction inside repository
    return SaleRepository.create(businessId, customerId, saleDate, processedItems, roundedTotal);
  }

  /**
   * Lists sales with pagination and search.
   */
  public static async getSales(
    businessId: string,
    query: { search?: string; page?: string | number; limit?: string | number },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const [sales, total] = await Promise.all([
      SaleRepository.findAll(businessId, { search: query.search, page, limit }),
      SaleRepository.count(businessId, query.search),
    ]);

    return {
      sales,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Fetches a single sale by ID.
   */
  public static async getSaleById(id: string, businessId: string) {
    const sale = await SaleRepository.findById(id, businessId);
    if (!sale) {
      throw new AppError('Sale not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return sale;
  }

  /**
   * Updates an existing sale, recreating its sale items atomically in a transaction.
   */
  public static async updateSale(id: string, businessId: string, input: UpdateSaleInput) {
    // 1. Verify existence of the sale
    const sale = await SaleRepository.findById(id, businessId);
    if (!sale) {
      throw new AppError('Sale not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    const { customerId, saleDate, items } = input;

    // 2. Verify customer existence and scope
    const customer = await CustomerRepository.findById(customerId, businessId);
    if (!customer) {
      throw new AppError('Customer not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    // 3. Fetch all products to verify existence & scope
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        businessId,
      },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));

    for (const item of items) {
      if (!productMap.has(item.productId)) {
        throw new AppError(
          `Product with ID "${item.productId}" was not found in your inventory.`,
          404,
          ERROR_CODES.NOT_FOUND,
        );
      }
    }

    // 4. Recalculate unit price and totals
    let calculatedTotal = 0;
    const processedItems = items.map((item) => {
      const dbProduct = productMap.get(item.productId)!;
      const basePrice = Number(dbProduct.price);
      const discount = item.discount || 0;

      const unitPrice = Math.round(basePrice * (1 - discount / 100) * 100) / 100;
      const itemSubtotal = Math.round(item.quantity * unitPrice * 100) / 100;
      calculatedTotal += itemSubtotal;

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount,
      };
    });

    const roundedTotal = Math.round(calculatedTotal * 100) / 100;

    // 5. Update database atomically inside repository transaction
    return SaleRepository.update(
      id,
      businessId,
      customerId,
      saleDate,
      processedItems,
      roundedTotal,
    );
  }

  /**
   * Deletes a sale record.
   */
  public static async deleteSale(id: string, businessId: string) {
    const sale = await SaleRepository.findById(id, businessId);
    if (!sale) {
      throw new AppError('Sale not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return SaleRepository.delete(id, businessId);
  }
}
