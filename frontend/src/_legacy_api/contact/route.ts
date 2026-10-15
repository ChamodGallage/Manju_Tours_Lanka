import { NextRequest, NextResponse } from "next/server";
import { ContactFormSchema } from "@/lib/validations/contact";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { insertFirestoreInquiry } from "@/lib/firebase/enquiries";
import { createHash } from "node:crypto";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous-ip";
    const rateLimit = checkRateLimit(`contact_${ip}`, 10, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many messages sent. Please wait a minute or message us on WhatsApp." },
        { status: 429 }
      );
    }

    const body = await req.json();

    // Check honeypot
    if (body.botField && body.botField.length > 0) {
      return NextResponse.json({ success: true, message: "Message received." });
    }

    const parseResult = ContactFormSchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const validData = parseResult.data;

    const sanitizedName = sanitizeString(validData.name);
    const sanitizedEmail = sanitizeString(validData.email);
    const sanitizedPhone = validData.phone ? sanitizeString(validData.phone) : "";
    const sanitizedSubject = sanitizeString(validData.subject);
    const sanitizedMessage = sanitizeString(validData.message);

    const ipHash = createHash("sha256").update(ip).digest("hex");
    const firestoreResult = await insertFirestoreInquiry({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone || "Not provided",
      country: "Not provided",
      number_of_adults: 1,
      number_of_children: 0,
      travel_style: "Contact Form",
      message: `Subject: ${sanitizedSubject}\n\n${sanitizedMessage}`,
      status: "NEW",
      source: "Contact Form",
      ip_hash: ipHash,
    });

    if (!firestoreResult.success || !firestoreResult.id) {
      return NextResponse.json(
        { error: "We could not save your message right now. Please contact us on WhatsApp or try again shortly." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your message has been sent successfully. We will reply within a few hours!",
      enquiryId: firestoreResult.id,
    });
  } catch (error: unknown) {
    console.error("Error in /api/contact:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while sending your message." },
      { status: 500 }
    );
  }
}
