import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { TourEnquirySchema } from "@/lib/validations/enquiry";
import { checkRateLimit } from "@/lib/rate-limit";
import { sanitizeString } from "@/lib/sanitize";
import { insertTourEnquiry } from "@/lib/supabase/enquiries";
import prisma from "@/lib/db";

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

    // 4. Save to Supabase tour_enquiries table
    let savedEnquiryId: string | null = null;
    const supabaseResult = await insertTourEnquiry({
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

    if (supabaseResult.success && supabaseResult.id) {
      savedEnquiryId = supabaseResult.id;
    }

    // Use Prisma only as a fallback if Supabase did not save the record.
    if (!savedEnquiryId) {
      try {
        const prismaSaved = await prisma.tourEnquiry.create({
        data: {
          tourId: validData.tourId || null,
          name: sanitizedName,
          email: sanitizedEmail,
          phone: sanitizedPhone,
          country: sanitizedCountry,
          travelStartDate: validData.travelStartDate || null,
          travelEndDate: validData.travelEndDate || null,
          flexibleMonth: validData.flexibleMonth || null,
          numberOfAdults: validData.numberOfAdults,
          numberOfChildren: validData.numberOfChildren,
          travelStyle: validData.travelStyle || "Custom",
          message: sanitizedMessage,
          status: "NEW",
          source: validData.tourTitle ? `Tour: ${validData.tourTitle}` : "Website Tour Enquiry",
          ipHash: createHash("sha256").update(ip).digest("hex"),
        },
      });
        savedEnquiryId = prismaSaved.id;
      } catch {
        return NextResponse.json({ error: "We could not save your enquiry right now. Please contact us on WhatsApp or try again shortly." }, { status: 503 });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Your enquiry was submitted successfully. We will be in touch shortly!",
      enquiryId: savedEnquiryId,
    });
  } catch (error: unknown) {
    console.error("Error in /api/enquiry:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while processing your enquiry." },
      { status: 500 }
    );
  }
}
