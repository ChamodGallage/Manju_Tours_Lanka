import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import dotenv from "dotenv";
import path from "path";

// Support both root .env.local and backend .env
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), "../.env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export function getFirebaseConfig(): FirebaseConfig | null {
  const apiKey = process.env.FIREBASE_API_KEY || process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const authDomain = process.env.FIREBASE_AUTH_DOMAIN || process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN;
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storageBucket = process.env.FIREBASE_STORAGE_BUCKET || process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
  const messagingSenderId = process.env.FIREBASE_MESSAGING_SENDER_ID || process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID;
  const appId = process.env.FIREBASE_APP_ID || process.env.NEXT_PUBLIC_FIREBASE_APP_ID;

  if (!apiKey || !projectId || apiKey.includes("paste-") || projectId.includes("paste-")) {
    return null;
  }

  return {
    apiKey: apiKey.trim(),
    authDomain: (authDomain || "").trim(),
    projectId: projectId.trim(),
    storageBucket: (storageBucket || "").trim(),
    messagingSenderId: (messagingSenderId || "").trim(),
    appId: (appId || "").trim(),
  };
}

let app: FirebaseApp | null = null;
let firestore: Firestore | null = null;
let auth: Auth | null = null;

export function getBackendFirebaseApp(): FirebaseApp | null {
  if (app) return app;
  if (getApps().length > 0) {
    app = getApp();
    return app;
  }
  const config = getFirebaseConfig();
  if (!config) return null;
  app = initializeApp(config, "manju-backend");
  return app;
}

export function getBackendFirestore(): Firestore | null {
  if (firestore) return firestore;
  const currentApp = getBackendFirebaseApp();
  if (!currentApp) return null;
  firestore = getFirestore(currentApp);
  return firestore;
}

export function getBackendAuth(): Auth | null {
  if (auth) return auth;
  const currentApp = getBackendFirebaseApp();
  if (!currentApp) return null;
  auth = getAuth(currentApp);
  return auth;
}
