import { Router } from "express";
import { destinationsController } from "../controllers/destinationsController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", destinationsController.getAll);
router.get("/:slug", destinationsController.getBySlug);

// Admin-only routes
router.post("/", requireAdmin, destinationsController.create);
router.put("/:id", requireAdmin, destinationsController.update);
router.delete("/:id", requireAdmin, destinationsController.delete);

export default router;
