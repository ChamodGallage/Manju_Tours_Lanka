import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { TourEnquirySchema } from "@/lib/validations/enquiry";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { insertFirestoreInquiry } from "@/lib/firebase/enquiries";

export async function POST(req: NextRequest) {
  try {
    // 1. IP identification for rate limiting
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous-ip";
    const rateLimit = checkRateLimit(`enquiry_${ip}`, 10, 60);

    if (!rateLimit.success) {
      return NextResponse.json(
        { error: "Too many enquiries sent. Please wait a minute or contact us directly on WhatsApp." },
        { status: 429 }
      );
    }

    // 2. Parse & Validate request body
    const body = await req.json();

    // Check honeypot
    if (body.botField && body.botField.length > 0) {
      return NextResponse.json({ success: true, message: "Enquiry received." });
    }

    const parseResult = TourEnquirySchema.safeParse(body);
    if (!parseResult.success) {
      const firstError = parseResult.error.issues?.[0]?.message || "Invalid input data";
      return NextResponse.json({ error: firstError }, { status: 400 });
    }

    const validData = parseResult.data;

    // 3. Sanitize text fields
    const sanitizedName = sanitizeString(validData.name);
    const sanitizedEmail = sanitizeString(validData.email);
    const sanitizedPhone = sanitizeString(validData.phone);
    const sanitizedCountry = sanitizeString(validData.country);
    const sanitizedMessage = sanitizeString(validData.message);

    // Save to the public-create, admin-managed Firestore inquiries collection.
    const firestoreResult = await insertFirestoreInquiry({
      tour_id: validData.tourId || null,
      tour_title: validData.tourTitle || null,
      name: sanitizedName,
      email: sanitizedEmail,
      phone: sanitizedPhone,
      country: sanitizedCountry,
      travel_start_date: validData.travelStartDate || null,
      travel_end_date: validData.travelEndDate || null,
      flexible_month: validData.flexibleMonth || null,
      number_of_adults: validData.numberOfAdults,
      number_of_children: validData.numberOfChildren,
      travel_style: validData.travelStyle || "Private Chauffeur",
      message: sanitizedMessage,
      status: "NEW",
      source: validData.tourTitle ? `Tour: ${validData.tourTitle}` : "Website Tour Enquiry",
      ip_hash: createHash("sha256").update(ip).digest("hex"),
    });

    if (!firestoreResult.success || !firestoreResult.id) {
      return NextResponse.json(
        { error: "We could not save your enquiry right now. Please contact us on WhatsApp or try again shortly." },
        { status: 503 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry was submitted successfully. We will be in touch shortly!",
      enquiryId: firestoreResult.id,
    });
  } catch (error: unknown) {
    console.error("Error in /api/enquiry:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your enquiry." },
      { status: 500 }
    );
  }
}
