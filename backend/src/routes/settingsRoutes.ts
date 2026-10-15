import { Router } from "express";
import { settingsController } from "../controllers/settingsController.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

router.get("/", settingsController.get);
router.put("/", requireAdmin, settingsController.update);

export default router;
