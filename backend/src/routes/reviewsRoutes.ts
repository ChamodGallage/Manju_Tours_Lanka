import { Router } from "express";
import { reviewsController } from "../controllers/reviewsController.js";

const router = Router();

router.get("/", reviewsController.getAll);

export default router;
