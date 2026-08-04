import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const start = process.hrtime();
  const { method, originalUrl, ip } = req;
  const userAgent = req.get('user-agent') || 'unknown';

  // Listen for request finish to log duration and response status
  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationInMs = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);
    const statusCode = res.statusCode;

    const logMessage = `${method} ${originalUrl} ${statusCode} - ${durationInMs}ms | IP: ${ip} | User-Agent: ${userAgent}`;

    if (statusCode >= 500) {
      Logger.error(logMessage);
    } else if (statusCode >= 400) {
      Logger.warn(logMessage);
    } else {
      Logger.info(logMessage);
    }
  });

  next();
};

export default requestLogger;
