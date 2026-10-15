import { z } from "zod";

export const ContactFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Please provide a valid email address"),
  phone: z.string().max(30).optional().nullable(),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  message: z.string().min(10, "Message must be at least 10 characters").max(2000),
  // Anti-spam honeypot
  botField: z.string().max(0, "Spam detected").optional().or(z.literal("")),
});

export type ContactFormInput = z.infer<typeof ContactFormSchema>;
