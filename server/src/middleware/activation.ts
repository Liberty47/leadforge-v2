import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { errorResponse } from '../lib/response.js';

// In-memory activation sessions (in production, use Redis or database)
const activationSessions = new Map<string, { activatedAt: Date; expiresAt: Date }>();

export function createActivationSession(): string {
  const token = randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  activationSessions.set(token, { activatedAt: new Date(), expiresAt });
  return token;
}

export function validateActivationSession(token: string): boolean {
  const session = activationSessions.get(token);
  if (!session) return false;
  if (new Date() > session.expiresAt) {
    activationSessions.delete(token);
    return false;
  }
  return true;
}

export function invalidateActivationSession(token: string): void {
  activationSessions.delete(token);
}

export function getActivationToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7);
  }
  return null;
}

export function activationMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const token = getActivationToken(req);

  if (!token || !validateActivationSession(token)) {
    res.status(401).json(errorResponse('UNAUTHORIZED', 'Invalid or expired activation session'));
    return;
  }

  next();
}

// Demo mode check
export function isDemoMode(): boolean {
  return !process.env.SUPABASE_SERVICE_ROLE_KEY || !process.env.ACTIVATION_SECRET;
}
