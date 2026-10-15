import dotenv from "dotenv";
import path from "path";
import { applicationDefault, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

// Load local credentials while allowing deployed environments to use ADC.
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const APP_NAME = "manju-tours-backend";

export function getFirebaseProjectId(): string {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    process.env.GOOGLE_CLOUD_PROJECT ||
    process.env.GCLOUD_PROJECT ||
    ""
  ).trim();
}

export function getFirebaseConfig(): { projectId: string } | null {
  const projectId = getFirebaseProjectId();
  return projectId ? { projectId } : null;
}

export function getBackendFirebaseApp(): App | null {
  const projectId = getFirebaseProjectId();
  if (!projectId) return null;

  const existing = getApps().find((candidate) => candidate.name === APP_NAME);
  if (existing) return existing;

  return initializeApp(
    {
      credential: applicationDefault(),
      projectId,
    },
    APP_NAME
  );
}

export function getBackendFirestore(): Firestore | null {
  const app = getBackendFirebaseApp();
  return app ? getFirestore(app) : null;
}

export function getBackendAuth(): Auth | null {
  const app = getBackendFirebaseApp();
  return app ? getAuth(app) : null;
}
