import { Request, Response, NextFunction } from "express";
import { settingsService } from "../services/settingsService.js";

export const settingsController = {
  async get(_req: Request, res: Response, next: NextFunction) {
    try {
      const settings = await settingsService.get();
      return res.json({ settings });
    } catch (err) {
      return next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await settingsService.update(req.body);
      return res.json({ success: true, settings: updated });
    } catch (err) {
      return next(err);
    }
  },
};
