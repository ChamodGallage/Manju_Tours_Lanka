import { Request, Response } from "express";
import { getBackendFirestore, getFirebaseConfig } from "../config/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { ENV } from "../config/env.js";

export const healthController = {
  async check(_req: Request, res: Response) {
    let dbStatus = "ready";
    const db = getBackendFirestore();
    const config = getFirebaseConfig();

    if (db) {
      try {
        await getDoc(doc(db, "siteSettings", "default"));
        dbStatus = "healthy";
      } catch (err) {
        dbStatus = `connected_with_notice: ${err instanceof Error ? err.message : String(err)}`;
      }
    } else {
      dbStatus = "fallback_runtime";
    }

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: ENV.NODE_ENV,
      database: {
        provider: "Firebase Cloud Firestore",
        projectId: config?.projectId || "configured_via_env",
        status: dbStatus,
      },
    });
  },
};
