import { Request, Response, NextFunction } from "express";
import { reviewsService } from "../services/reviewsService.js";

export const reviewsController = {
  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const reviews = await reviewsService.getAll();
      return res.json({ reviews, count: reviews.length });
    } catch (err) {
      return next(err);
    }
  },
};
