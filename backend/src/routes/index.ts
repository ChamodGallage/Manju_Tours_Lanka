import { Router } from "express";
import destinationsRoutes from "./destinationsRoutes.js";
import packagesRoutes from "./packagesRoutes.js";
import pagesRoutes from "./pagesRoutes.js";
import enquiriesRoutes from "./enquiriesRoutes.js";
import mediaRoutes from "./mediaRoutes.js";
import reviewsRoutes from "./reviewsRoutes.js";
import settingsRoutes from "./settingsRoutes.js";
import healthRoutes from "./healthRoutes.js";

const apiRouter = Router();

apiRouter.use("/health", healthRoutes);
apiRouter.use("/destinations", destinationsRoutes);
apiRouter.use("/packages", packagesRoutes);
apiRouter.use("/pages", pagesRoutes);
apiRouter.use("/admin/pages", pagesRoutes); // Alias for admin pages
apiRouter.use("/photos", mediaRoutes);
apiRouter.use("/reviews", reviewsRoutes);
apiRouter.use("/settings", settingsRoutes);
apiRouter.use("/", enquiriesRoutes); // provides /enquiry, /contact, /admin/enquiries

export default apiRouter;
