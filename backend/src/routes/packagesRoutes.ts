import { Router } from "express";
import { packagesController } from "../controllers/packagesController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public routes
router.get("/", packagesController.getAll);
router.get("/:slug", packagesController.getBySlug);

// Admin-only routes
router.post("/", requireAdmin, packagesController.create);
router.put("/:id", requireAdmin, packagesController.update);
router.delete("/:id", requireAdmin, packagesController.delete);

export default router;
