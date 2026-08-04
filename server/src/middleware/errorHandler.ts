import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  // If headers already sent, delegate to default express handler
  if (res.headersSent) {
    return next(err);
  }

  // 1. Handled Application Errors
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.errorCode,
        message: err.message,
        details: err.details,
      },
    });
  }

  // 2. Prisma Duplicate Key / Unique Constraint Violations (P2002)
  if (err.code === 'P2002') {
    const targetFields = err.meta?.target || [];
    return res.status(409).json({
      success: false,
      error: {
        code: ERROR_CODES.CONFLICT,
        message: `Resource already exists: Duplicate value in [${targetFields.join(', ')}]`,
        details: targetFields,
      },
    });
  }

  // Log unhandled server exceptions internally
  console.error('💥 Unhandled Exception:', err);

  // 3. Fallback to Internal Server Error
  return res.status(500).json({
    success: false,
    error: {
      code: ERROR_CODES.INTERNAL_SERVER_ERROR,
      message: 'An unexpected server error occurred. Please try again later.',
    },
  });
};
