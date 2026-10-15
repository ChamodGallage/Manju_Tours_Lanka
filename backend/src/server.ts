import app from "./app.js";
import { ENV } from "./config/env.js";
import { logger } from "./utils/logger.js";

const server = app.listen(ENV.PORT, () => {
  logger.info(`🌴 Manju Tours Lanka Backend API running on port ${ENV.PORT}`);
  logger.info(`📡 Health Check: http://localhost:${ENV.PORT}/api/health`);
  logger.info(`🌐 Allowed Frontend: ${ENV.FRONTEND_URL}`);
  logger.info(`🗄️  Firebase Project: ${ENV.FIREBASE_PROJECT_ID || "Configured via local environment"}`);
});

process.on("SIGTERM", () => {
  logger.info("SIGTERM received, closing server...");
  server.close(() => {
    logger.info("Server closed successfully");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.info("SIGINT received, closing server...");
  server.close(() => {
    logger.info("Server closed successfully");
    process.exit(0);
  });
});
