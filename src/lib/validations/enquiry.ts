import { z } from "zod";

export const TourEnquirySchema = z.object({
  tourId: z.string().optional().nullable(),
  tourTitle: z.string().optional().nullable(),
  name: z.string().min(2, "Full name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().min(6, "Please provide a valid phone or WhatsApp number").max(30),
  country: z.string().min(2, "Please indicate your home country").max(60),
  travelStartDate: z.string().optional().nullable(),
  travelEndDate: z.string().optional().nullable(),
  flexibleMonth: z.string().optional().nullable(),
  numberOfAdults: z.coerce.number().int().min(1, "At least 1 adult is required").max(50).default(2),
  numberOfChildren: z.coerce.number().int().min(0).max(30).default(0),
  travelStyle: z.string().max(50).optional().nullable(),
  message: z.string().min(10, "Please share a few details about your plans (minimum 10 characters)").max(2000),
  // Anti-spam honeypot field
  botField: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type TourEnquiryInput = z.infer<typeof TourEnquirySchema>;
