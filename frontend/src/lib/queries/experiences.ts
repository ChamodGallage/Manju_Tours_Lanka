import prisma from "../db";
import { mockExperiences } from "../data/mock-data";

export async function getAllExperiences() {
  try {
    const experiences = await prisma.experience.findMany({
      orderBy: { createdAt: "asc" },
    });
    if (experiences.length > 0) return experiences;
  } catch (err) {
    console.warn("Database unavailable, falling back to static seed data for experiences:", err);
  }
  return mockExperiences;
}

export async function getFeaturedExperiences() {
  try {
    const experiences = await prisma.experience.findMany({
      where: { isFeatured: true },
    });
    if (experiences.length > 0) return experiences;
  } catch (err) {
    console.warn("Database unavailable, falling back to static seed data for featured experiences:", err);
  }
  return mockExperiences.filter((e) => e.isFeatured);
}

export async function getExperienceBySlug(slug: string) {
  try {
    const experience = await prisma.experience.findUnique({
      where: { slug },
    });
    if (experience) return experience;
  } catch (err) {
    console.warn(`Database unavailable, falling back to static seed data for experience ${slug}:`, err);
  }
  return mockExperiences.find((e) => e.slug === slug) || null;
}
