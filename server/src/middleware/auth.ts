import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { AppError } from '../utils/errors.js';
import { ERROR_CODES } from '@analyticiq/shared';
import { UserRole } from '@prisma/client';

interface TokenPayload {
  id: string;
  email: string;
  role: UserRole;
  businessId: string;
}

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  // 1. Verify header existence and format
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(
      new AppError(
        'Authentication required. Please provide a Bearer token in the Authorization header.',
        401,
        ERROR_CODES.UNAUTHORIZED,
      ),
    );
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return next(
      new AppError(
        'Invalid authentication format. Bearer token is empty.',
        401,
        ERROR_CODES.UNAUTHORIZED,
      ),
    );
  }

  try {
    // 2. Decode and verify JWT
    const decoded = jwt.verify(token, config.JWT_SECRET) as TokenPayload;

    // 3. Attach session payload to Express request context
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      businessId: decoded.businessId,
    };

    next();
  } catch (error) {
    return next(
      new AppError(
        'Invalid or expired authentication token. Please log in again.',
        401,
        ERROR_CODES.UNAUTHORIZED,
        error,
      ),
    );
  }
};
