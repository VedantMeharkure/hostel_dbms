import { Request, Response, NextFunction } from 'express';

export function errorHandler(
  err: any,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  console.error('[ERROR]', err.message);
  res.status(err.statusCode ?? 500).json({
    error: err.message ?? 'Internal server error',
  });
}