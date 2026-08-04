import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/product.service.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class ProductController {
  /**
   * Handles product creation request.
   */
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const data = await ProductService.createProduct(businessId, req.body);

      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles listing products request.
   */
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { search, page, limit } = req.query;

      const data = await ProductService.getProducts(businessId, {
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles fetching a single product by ID.
   */
  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      const data = await ProductService.getProductById(id, businessId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a product.
   */
  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      const data = await ProductService.updateProduct(id, businessId, req.body);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a product.
   */
  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      await ProductService.deleteProduct(id, businessId);

      return res.status(200).json({
        success: true,
        message: 'Product successfully deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}
