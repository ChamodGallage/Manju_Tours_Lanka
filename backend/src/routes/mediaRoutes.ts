import { Router } from "express";
import { mediaController } from "../controllers/mediaController.js";
import { requireAdmin } from "../middleware/auth.js";
import { uploadMiddleware } from "../middleware/upload.js";

const router = Router();

// Public reads
router.get("/", mediaController.getAll);

// Admin-only management routes
router.post("/upload", requireAdmin, uploadMiddleware.single("file"), mediaController.upload);
router.post("/replace", requireAdmin, uploadMiddleware.single("file"), mediaController.replace);
router.delete("/:id", requireAdmin, mediaController.delete);

export default router;
