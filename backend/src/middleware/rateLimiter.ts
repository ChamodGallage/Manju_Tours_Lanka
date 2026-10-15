import { Request, Response, NextFunction } from "express";
import { ENV } from "../config/env.js";

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const ipHits = new Map<string, RateLimitRecord>();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [ip, record] of ipHits.entries()) {
    if (now > record.resetTime) {
      ipHits.delete(ip);
    }
  }
}, 300000);

export function rateLimiter(req: Request, res: Response, next: NextFunction) {
  const ip = req.ip || req.socket.remoteAddress || "anonymous";
  const now = Date.now();

  const record = ipHits.get(ip);
  if (!record || now > record.resetTime) {
    ipHits.set(ip, {
      count: 1,
      resetTime: now + ENV.RATE_LIMIT_WINDOW_MS,
    });
    return next();
  }

  if (record.count >= ENV.RATE_LIMIT_MAX) {
    return res.status(429).json({
      error: "Too many requests. Please try again later.",
      retryAfterSeconds: Math.ceil((record.resetTime - now) / 1000),
    });
  }

  record.count += 1;
  return next();
}
