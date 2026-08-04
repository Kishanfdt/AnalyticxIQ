import { Request, Response, NextFunction } from 'express';
import { ImportService } from '../services/import.service.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';

export class ImportController {
  /**
   * Helper utility to parse file buffer based on mimetype and extension
   */
  private static parseFileToRows(file: Express.Multer.File): any[] {
    const filename = file.originalname.toLowerCase();
    const buffer = file.buffer;

    if (filename.endsWith('.csv') || file.mimetype === 'text/csv') {
      const csvStr = buffer.toString('utf-8');
      const parsed = Papa.parse(csvStr, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: false,
      });

      if (parsed.errors.length > 0) {
        throw new AppError(
          `Failed parsing CSV file: ${parsed.errors[0].message}`,
          400,
          ERROR_CODES.BAD_REQUEST
        );
      }
      return parsed.data;
    } else if (
      filename.endsWith('.xlsx') ||
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      const workbook = XLSX.read(buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      if (!sheetName) {
        throw new AppError('The Excel file has no worksheets.', 400, ERROR_CODES.BAD_REQUEST);
      }
      const sheet = workbook.Sheets[sheetName];
      return XLSX.utils.sheet_to_json(sheet, { defval: '' });
    } else {
      throw new AppError(
        'Invalid file format. Only CSV (.csv) and Excel (.xlsx) files are supported.',
        400,
        ERROR_CODES.BAD_REQUEST
      );
    }
  }

  /**
   * Handles POST /import/products.
   */
  public static async importProducts(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No import file uploaded.', 400, ERROR_CODES.BAD_REQUEST);
      }
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const rows = ImportController.parseFileToRows(req.file);
      if (rows.length === 0) {
        throw new AppError('The uploaded file is empty.', 400, ERROR_CODES.BAD_REQUEST);
      }

      const result = await ImportService.importProducts(req.user.businessId, rows);

      return res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles POST /import/customers.
   */
  public static async importCustomers(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No import file uploaded.', 400, ERROR_CODES.BAD_REQUEST);
      }
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const rows = ImportController.parseFileToRows(req.file);
      if (rows.length === 0) {
        throw new AppError('The uploaded file is empty.', 400, ERROR_CODES.BAD_REQUEST);
      }

      const result = await ImportService.importCustomers(req.user.businessId, rows);

      return res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Handles POST /import/sales.
   */
  public static async importSales(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.file) {
        throw new AppError('No import file uploaded.', 400, ERROR_CODES.BAD_REQUEST);
      }
      if (!req.user || !req.user.businessId) {
        throw new AppError('Unauthorized access.', 401, ERROR_CODES.UNAUTHORIZED);
      }

      const rows = ImportController.parseFileToRows(req.file);
      if (rows.length === 0) {
        throw new AppError('The uploaded file is empty.', 400, ERROR_CODES.BAD_REQUEST);
      }

      const result = await ImportService.importSales(req.user.businessId, rows);

      return res.status(200).json({
        success: result.success,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
}
