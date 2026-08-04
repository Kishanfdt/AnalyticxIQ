import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class AnalyticsController {
  /**
   * Handles GET /analytics/overview.
   */
  public static async getOverview(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { startDate, endDate } = req.query;

      const data = await AnalyticsService.getOverview(
        businessId,
        startDate as string,
        endDate as string,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles GET /analytics/products.
   */
  public static async getProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { startDate, endDate } = req.query;

      const data = await AnalyticsService.getBestSellingProducts(
        businessId,
        startDate as string,
        endDate as string,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles GET /analytics/customers.
   */
  public static async getCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { startDate, endDate } = req.query;

      const data = await AnalyticsService.getTopCustomers(
        businessId,
        startDate as string,
        endDate as string,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles GET /analytics/categories.
   */
  public static async getCategories(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { startDate, endDate } = req.query;

      const data = await AnalyticsService.getRevenueByCategory(
        businessId,
        startDate as string,
        endDate as string,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles GET /analytics/trends.
   */
  public static async getTrends(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { startDate, endDate } = req.query;

      const data = await AnalyticsService.getMonthlyTrends(
        businessId,
        startDate as string,
        endDate as string,
      );

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }
}
