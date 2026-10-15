import { Request, Response, NextFunction } from "express";
import { enquiriesService } from "../services/enquiriesService.js";
import { TourEnquirySchema, ContactFormSchema } from "../validators/enquiryValidator.js";

export const enquiriesController = {
  async submitEnquiry(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = TourEnquirySchema.parse(req.body);
      if (validated.botField && validated.botField.length > 0) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      const ip = (req.ip || req.socket.remoteAddress || "anonymous").toString();
      const created = await enquiriesService.create(validated, ip);
      return res.status(201).json({
        success: true,
        message: "Thank you! Your tour inquiry has been received. Manju will reach out promptly.",
        enquiryId: created.id,
      });
    } catch (err) {
      return next(err);
    }
  },

  async submitContact(req: Request, res: Response, next: NextFunction) {
    try {
      const validated = ContactFormSchema.parse(req.body);
      if (validated.botField && validated.botField.length > 0) {
        return res.status(400).json({ error: "Invalid submission" });
      }

      const ip = (req.ip || req.socket.remoteAddress || "anonymous").toString();
      const created = await enquiriesService.createContact(validated, ip);
      return res.status(201).json({
        success: true,
        message: "Message received! We will respond within 24 hours.",
        enquiryId: created.id,
      });
    } catch (err) {
      return next(err);
    }
  },

  async getAll(_req: Request, res: Response, next: NextFunction) {
    try {
      const enquiries = await enquiriesService.getAll();
      return res.json({ enquiries, count: enquiries.length });
    } catch (err) {
      return next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const { status, admin_notes } = req.body;
      if (!status) {
        return res.status(400).json({ error: "Missing required 'status'" });
      }

      const updated = await enquiriesService.updateStatus(id, status, admin_notes);
      if (!updated) {
        return res.status(404).json({ error: `Enquiry with ID '${id}' not found` });
      }
      return res.json({ success: true, enquiry: updated });
    } catch (err) {
      return next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = req.params.id as string;
      const deleted = await enquiriesService.delete(id);
      if (!deleted) {
        return res.status(404).json({ error: `Enquiry with ID '${id}' not found` });
      }
      return res.json({ success: true, message: "Enquiry deleted successfully" });
    } catch (err) {
      return next(err);
    }
  },
};
