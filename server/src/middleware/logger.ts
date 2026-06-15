import type { Request, Response, NextFunction } from 'express';

// Middleware to log request paths
const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
};

export default requestLogger;