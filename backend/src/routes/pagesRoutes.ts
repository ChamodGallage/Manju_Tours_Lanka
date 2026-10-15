import { Router } from "express";
import { pagesController } from "../controllers/pagesController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// Public reads
router.get("/", pagesController.handlePagesRoute);
router.get("/:pageKey", pagesController.getPublishedSections);

// Admin-only operations
router.post("/", requireAdmin, pagesController.saveItem);
router.put("/", requireAdmin, pagesController.saveItem);
router.delete("/", requireAdmin, pagesController.deleteItem);

router.post("/reorder", requireAdmin, pagesController.reorder);
router.post("/duplicate", requireAdmin, pagesController.duplicate);
router.post("/publish", requireAdmin, pagesController.publish);

export default router;
