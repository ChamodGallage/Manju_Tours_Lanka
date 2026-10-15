import { mockExperiences } from "../data/mock-data";

export type ExperienceItem = (typeof mockExperiences)[0];

export async function getAllExperiences(): Promise<ExperienceItem[]> {
  return mockExperiences;
}

export async function getFeaturedExperiences(): Promise<ExperienceItem[]> {
  return mockExperiences.filter((e) => e.isFeatured);
}

export async function getExperienceBySlug(slug: string): Promise<ExperienceItem | null> {
  return mockExperiences.find((e) => e.slug === slug) || null;
}
