import { PrismaClient } from "@prisma/client";
import { destinationsSeed, experiencesSeed, toursSeed, reviewsSeed } from "../src/lib/data/seed-dataset";

const prisma = new PrismaClient();

export { destinationsSeed, experiencesSeed, toursSeed, reviewsSeed };

export async function runSeed() {
  console.log("Seeding Manju Tours Lanka database...");

  // Seed Destinations
  for (const dest of destinationsSeed) {
    const destData = {
      slug: dest.slug,
      name: dest.name,
      tagline: dest.tagline,
      region: dest.region,
      heroImage: typeof dest.heroImage === "object" && dest.heroImage !== null && "src" in dest.heroImage
        ? (dest.heroImage as { src: string }).src
        : String(dest.heroImage),
      heroImageMetadata: dest.heroImage as object,
      galleryImages: dest.galleryImages as object,
      summary: dest.summary,
      content: dest.content,
      highlights: dest.highlights as object,
      bestTimeToVisit: dest.bestTimeToVisit,
      idealDuration: dest.idealDuration,
      latitude: dest.latitude ?? null,
      longitude: dest.longitude ?? null,
      isFeatured: dest.isFeatured ?? false,
      displayOrder: dest.displayOrder ?? 0,
    };

    await prisma.destination.upsert({
      where: { slug: dest.slug },
      update: destData,
      create: destData,
    });
  }
  console.log(`Seeded ${destinationsSeed.length} destinations.`);

  // Seed Experiences
  for (const exp of experiencesSeed) {
    const expData = {
      slug: exp.slug,
      title: exp.title,
      category: exp.category,
      heroImage: typeof exp.heroImage === "object" && exp.heroImage !== null && "src" in exp.heroImage
        ? (exp.heroImage as { src: string }).src
        : String(exp.heroImage),
      heroImageMetadata: exp.heroImage as object,
      galleryImages: (exp as typeof exp & { galleryImages?: object }).galleryImages ?? [],
      summary: exp.summary,
      description: exp.description,
      duration: exp.duration,
      location: exp.location,
      isFeatured: exp.isFeatured ?? false,
    };

    await prisma.experience.upsert({
      where: { slug: exp.slug },
      update: expData,
      create: expData,
    });
  }
  console.log(`Seeded ${experiencesSeed.length} experiences.`);

  // Seed Tours
  for (const tour of toursSeed) {
    const tourData = {
      slug: tour.slug,
      title: tour.title,
      tagline: tour.tagline,
      durationDays: tour.durationDays,
      durationNights: tour.durationNights,
      travelStyle: tour.travelStyle,
      overview: tour.overview,
      highlights: tour.highlights as object,
      inclusions: tour.inclusions as object,
      exclusions: tour.exclusions as object,
      itinerary: tour.itinerary as object,
      startingPrice: tour.startingPrice ?? null,
      heroImage: typeof tour.heroImage === "object" && tour.heroImage !== null && "src" in tour.heroImage
        ? (tour.heroImage as { src: string }).src
        : String(tour.heroImage),
      heroImageMetadata: tour.heroImage as object,
      galleryImages: tour.galleryImages as object,
      isFeatured: tour.isFeatured ?? false,
      displayOrder: tour.displayOrder ?? 0,
    };

    await prisma.tour.upsert({
      where: { slug: tour.slug },
      update: tourData,
      create: tourData,
    });
  }
  console.log(`Seeded ${toursSeed.length} tours.`);

  // Seed Reviews
  for (const rev of reviewsSeed) {
    await prisma.review.create({
      data: {
        authorName: rev.authorName,
        authorCountry: rev.authorCountry,
        rating: rev.rating,
        reviewDate: rev.reviewDate,
        travelMonth: rev.travelMonth,
        title: rev.title,
        comment: rev.comment,
        source: rev.source,
        isFeatured: rev.isFeatured ?? false,
        isVerified: true,
      },
    });
  }
  console.log(`Seeded ${reviewsSeed.length} reviews.`);

  console.log("Database seed completed successfully!");
}

// Only execute when run directly from CLI
if (require.main === module || process.argv[1]?.includes("seed")) {
  runSeed()
    .catch((e) => {
      console.error("Error during seed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
