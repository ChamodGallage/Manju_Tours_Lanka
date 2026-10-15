import { Router } from "express";
import { enquiriesController } from "../controllers/enquiriesController.js";
import { requireAdmin } from "../middleware/auth.js";
import { rateLimiter } from "../middleware/rateLimiter.js";

const router = Router();

// Public submission routes (protected by rate limiting)
router.post("/enquiry", rateLimiter, enquiriesController.submitEnquiry);
router.post("/contact", rateLimiter, enquiriesController.submitContact);

// Admin-only management routes
router.get("/admin/enquiries", requireAdmin, enquiriesController.getAll);
router.patch("/admin/enquiries/:id", requireAdmin, enquiriesController.updateStatus);
router.delete("/admin/enquiries/:id", requireAdmin, enquiriesController.delete);

export default router;
