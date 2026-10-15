import { destinationsSeed, experiencesSeed, toursSeed, reviewsSeed } from "./seed-dataset";

export const mockDestinations = destinationsSeed.map((d, index) => ({
  ...d,
  id: `dest-${index + 1}`,
  latitude: d.latitude ?? null,
  longitude: d.longitude ?? null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
}));

export const mockExperiences = experiencesSeed.map((e, index) => ({
  ...e,
  id: `exp-${index + 1}`,
  destinationId: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
}));

export const mockTours = toursSeed.map((t, index) => ({
  ...t,
  id: `tour-${index + 1}`,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
}));

export const mockReviews = reviewsSeed.map((r, index) => ({
  ...r,
  id: `rev-${index + 1}`,
  tourId: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
}));
