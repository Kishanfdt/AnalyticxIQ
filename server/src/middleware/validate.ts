import { Request, Response, NextFunction } from 'express';
import { Schema } from 'zod';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';

export const validateRequest = (schema: Schema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const parseResult = await schema.safeParseAsync(req.body);

    if (!parseResult.success) {
      return next(
        new AppError(
          'Request validation failed',
          400,
          ERROR_CODES.VALIDATION_ERROR,
          parseResult.error.format(),
        ),
      );
    }

    req.body = parseResult.data;
    next();
  };
};
