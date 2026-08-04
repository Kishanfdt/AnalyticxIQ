import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class SaleController {
  /**
   * Handles sale creation request.
   */
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const data = await SaleService.createSale(businessId, req.body);

      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles listing sales request.
   */
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { search, page, limit } = req.query;

      const data = await SaleService.getSales(businessId, {
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
   * Handles fetching a single sale by ID.
   */
  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      const data = await SaleService.getSaleById(id, businessId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a sale.
   */
  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      const data = await SaleService.updateSale(id, businessId, req.body);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a sale.
   */
  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      await SaleService.deleteSale(id, businessId);

      return res.status(200).json({
        success: true,
        message: 'Sale successfully deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}
