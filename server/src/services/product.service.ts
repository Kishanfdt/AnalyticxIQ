import { ProductRepository } from '../repositories/product.repository.js';
import { prisma } from '../prisma/index.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import { CreateProductInput, UpdateProductInput } from '@analyticiq/shared';

export class ProductService {
  /**
   * Creates a new product for the authenticated business.
   */
  public static async createProduct(businessId: string, input: CreateProductInput) {
    const { name, sku, price, costPrice, stock, categoryName, description } = input;

    // 1. Enforce SKU uniqueness per business
    const existingProduct = await ProductRepository.findBySku(sku, businessId);
    if (existingProduct) {
      throw new AppError(
        `Product with SKU "${sku}" already exists in your inventory.`,
        409,
        ERROR_CODES.CONFLICT,
      );
    }

    // 2. Find or create the category if categoryName is provided
    let categoryId: string | null = null;
    if (categoryName) {
      const category = await prisma.category.upsert({
        where: {
          name_businessId: {
            name: categoryName,
            businessId,
          },
        },
        create: {
          name: categoryName,
          businessId,
        },
        update: {},
      });
      categoryId = category.id;
    }

    // 3. Save the product
    return ProductRepository.create({
      name,
      sku,
      price,
      costPrice,
      stock,
      categoryId,
      description,
      businessId,
    });
  }

  /**
   * Lists products with pagination and search.
   */
  public static async getProducts(
    businessId: string,
    query: { search?: string; page?: string | number; limit?: string | number },
  ) {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.max(1, Math.min(100, Number(query.limit) || 20));

    const [products, total] = await Promise.all([
      ProductRepository.findAll(businessId, { search: query.search, page, limit }),
      ProductRepository.count(businessId, query.search),
    ]);

    return {
      products,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Fetches a single product by ID.
   */
  public static async getProductById(id: string, businessId: string) {
    const product = await ProductRepository.findById(id, businessId);
    if (!product) {
      throw new AppError('Product not found.', 404, ERROR_CODES.NOT_FOUND);
    }
    return product;
  }

  /**
   * Updates an existing product.
   */
  public static async updateProduct(id: string, businessId: string, input: UpdateProductInput) {
    // 1. Verify existence and business ownership
    const product = await ProductRepository.findById(id, businessId);
    if (!product) {
      throw new AppError('Product not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    const { name, sku, price, costPrice, stock, categoryName, description } = input;

    // 2. Enforce SKU uniqueness if changing
    if (sku && sku !== product.sku) {
      const existingSku = await ProductRepository.findBySku(sku, businessId);
      if (existingSku) {
        throw new AppError(
          `Product with SKU "${sku}" already exists in your inventory.`,
          409,
          ERROR_CODES.CONFLICT,
        );
      }
    }

    // 3. Find or create Category if categoryName is changed/provided
    let categoryId: string | null = product.categoryId;
    if (categoryName !== undefined) {
      if (categoryName) {
        const category = await prisma.category.upsert({
          where: {
            name_businessId: {
              name: categoryName,
              businessId,
            },
          },
          create: {
            name: categoryName,
            businessId,
          },
          update: {},
        });
        categoryId = category.id;
      } else {
        categoryId = null;
      }
    }

    // 4. Perform update
    return ProductRepository.update(id, businessId, {
      name,
      sku,
      price,
      costPrice,
      stock,
      categoryId,
      description,
    });
  }

  /**
   * Deletes a product.
   */
  public static async deleteProduct(id: string, businessId: string) {
    // 1. Verify existence and ownership
    const product = await ProductRepository.findById(id, businessId);
    if (!product) {
      throw new AppError('Product not found.', 404, ERROR_CODES.NOT_FOUND);
    }

    // 2. Check if product is referenced in any SaleItem transactions
    const saleItemCount = await prisma.saleItem.count({
      where: { productId: id },
    });

    if (saleItemCount > 0) {
      throw new AppError(
        'This product is referenced in one or more transactions and cannot be deleted.',
        409,
        ERROR_CODES.CONFLICT,
      );
    }

    // 3. Delete the product
    return ProductRepository.delete(id, businessId);
  }
}
