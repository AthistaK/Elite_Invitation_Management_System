import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth';

export function requireChairman(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || req.user.role !== 'CHAIRMAN') {
    res.status(403).json({
      error: 'Access denied. Only the Chairman can access this section or perform this action.',
    });
    return;
  }
  next();
}

export function requireManagement(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  if (!req.user || (req.user.role !== 'OFFICE' && req.user.role !== 'FAMILY')) {
    res.status(403).json({
      error: 'Access denied. Authorized Management member access required.',
    });
    return;
  }
  next();
}
