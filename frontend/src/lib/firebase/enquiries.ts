import { addDoc, collection } from "firebase/firestore";
import type { TourEnquiryInsert } from "@/types/database.types";
import { getFirebaseFirestore } from "./client";

export async function insertFirestoreInquiry(enquiry: TourEnquiryInsert) {
  const db = getFirebaseFirestore();
  if (!db) {
    return { success: false as const, error: "Firebase is not configured." };
  }

  try {
    const timestamp = new Date().toISOString();
    const reference = await addDoc(collection(db, "inquiries"), {
      ...enquiry,
      created_at: timestamp,
      updated_at: timestamp,
    });
    return { success: true as const, id: reference.id };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to save inquiry to Firestore.";
    console.error("Firestore inquiry insert error:", message);
    return { success: false as const, error: message };
  }
}
