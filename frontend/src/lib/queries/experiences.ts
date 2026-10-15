import { collection, doc, getDoc, getDocs, orderBy, query, where } from "firebase/firestore";
import { getFirebaseFirestore } from "@/lib/firebase/client";
import { mockExperiences } from "../data/mock-data";

export type ExperienceItem = (typeof mockExperiences)[number] & {
  isPublished?: boolean;
  displayOrder?: number;
};

export async function getAllExperiences(): Promise<ExperienceItem[]> {
  const db = getFirebaseFirestore();
  if (db) {
    try {
      const snapshot = await getDocs(
        query(collection(db, "experiences"), where("isPublished", "==", true), orderBy("displayOrder", "asc"))
      );
      if (!snapshot.empty) {
        return snapshot.docs.map((experience) => ({
          ...experience.data(),
          id: experience.id,
        })) as ExperienceItem[];
      }
    } catch (error) {
      console.warn("Firestore experiences query notice, using static seed data:", error);
    }
  }
  return mockExperiences;
}

export async function getFeaturedExperiences(): Promise<ExperienceItem[]> {
  const db = getFirebaseFirestore();
  if (db) {
    try {
      const snapshot = await getDocs(
        query(
          collection(db, "experiences"),
          where("isPublished", "==", true),
          where("isFeatured", "==", true),
          orderBy("displayOrder", "asc")
        )
      );
      if (!snapshot.empty) {
        return snapshot.docs.map((experience) => ({
          ...experience.data(),
          id: experience.id,
        })) as ExperienceItem[];
      }
    } catch (error) {
      console.warn("Firestore featured experiences query notice, using static seed data:", error);
    }
  }
  return mockExperiences.filter((experience) => experience.isFeatured);
}

export async function getExperienceBySlug(slug: string): Promise<ExperienceItem | null> {
  const db = getFirebaseFirestore();
  if (db) {
    try {
      const byId = await getDoc(doc(db, "experiences", slug));
      if (byId.exists()) {
        const experience = { ...byId.data(), id: byId.id } as ExperienceItem;
        if (experience.isPublished) return experience;
      }

      const snapshot = await getDocs(
        query(collection(db, "experiences"), where("slug", "==", slug), where("isPublished", "==", true))
      );
      if (!snapshot.empty) {
        return { ...snapshot.docs[0].data(), id: snapshot.docs[0].id } as ExperienceItem;
      }
    } catch (error) {
      console.warn(`Firestore experience lookup for '${slug}' notice, using static seed data:`, error);
    }
  }
  return mockExperiences.find((experience) => experience.slug === slug) || null;
}
