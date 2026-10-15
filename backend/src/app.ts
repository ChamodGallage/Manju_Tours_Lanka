import express, { Request, Response } from "express";
import { corsMiddleware } from "./middleware/cors.js";
import { errorHandler } from "./middleware/errorHandler.js";
import apiRouter from "./routes/index.js";
import { logger } from "./utils/logger.js";

const app = express();

// Global Middlewares
app.use(corsMiddleware);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Request Logger in Development
app.use((req, _res, next) => {
  logger.debug(`${req.method} ${req.originalUrl}`);
  next();
});

// Root API Welcome Route
app.get("/", (_req: Request, res: Response) => {
  res.json({
    name: "Manju Tours Lanka — Backend API",
    version: "1.0.0",
    status: "active",
    docs: "/api/health",
  });
});

// Mount all API Routes
app.use("/api", apiRouter);

// 404 Handler
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: `API endpoint '${req.method} ${req.originalUrl}' not found`,
  });
});

// Centralized Error Handler
app.use(errorHandler);

export default app;
