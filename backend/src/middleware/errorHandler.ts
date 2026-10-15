import { Request, Response, NextFunction } from "express";
import { logger } from "../utils/logger.js";
import { ZodError } from "zod";

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  if (err instanceof ZodError) {
    logger.warn(`Validation error on ${req.method} ${req.originalUrl}:`, err.issues);
    return res.status(400).json({
      error: "Validation failed",
      details: err.issues.map((i) => ({ field: i.path.join("."), message: i.message })),
    });
  }

  const errorMessage = err instanceof Error ? err.message : "Internal Server Error";
  logger.error(`Unhandled error on ${req.method} ${req.originalUrl}:`, err);

  return res.status(500).json({
    error: errorMessage,
  });
}
