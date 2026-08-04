import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export class CustomerController {
  /**
   * Handles customer creation request.
   */
  public static async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const data = await CustomerService.createCustomer(businessId, req.body);

      return res.status(201).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles listing customers request.
   */
  public static async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const businessId = req.user.businessId;
      const { search, page, limit } = req.query;

      const data = await CustomerService.getCustomers(businessId, {
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
   * Handles fetching a single customer by ID.
   */
  public static async getById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      const data = await CustomerService.getCustomerById(id, businessId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles updating a customer.
   */
  public static async update(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      const data = await CustomerService.updateCustomer(id, businessId, req.body);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles deleting a customer.
   */
  public static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const { id } = req.params;
      const businessId = req.user.businessId;
      await CustomerService.deleteCustomer(id, businessId);

      return res.status(200).json({
        success: true,
        message: 'Customer successfully deleted.',
      });
    } catch (error) {
      next(error);
    }
  }
}
