import { Request, Response, NextFunction } from 'express';
import { errorResponse } from '../lib/response.js';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error('Error:', err);
  res.status(500).json(errorResponse('INTERNAL_ERROR', 'An unexpected error occurred'));
}
