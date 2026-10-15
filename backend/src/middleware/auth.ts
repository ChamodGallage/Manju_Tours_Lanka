import { Request, Response, NextFunction } from "express";
import { getBackendAuth, getBackendFirestore } from "../config/firebase.js";
import { doc, getDoc } from "../config/firestore.js";
import { logger } from "../utils/logger.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Authentication required. Bearer token missing." });
  }

  const token = authHeader.slice("Bearer ".length).trim();
  if (!token) {
    return res.status(401).json({ error: "Invalid or empty session token." });
  }

  const auth = getBackendAuth();
  const db = getBackendFirestore();
  if (!auth || !db) {
    return res.status(503).json({ error: "Firebase authentication is not configured on the server." });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    let isAdmin = decoded.admin === true || decoded.role === "admin";

    if (!isAdmin) {
      const adminDoc = await getDoc(doc(db, "admins", decoded.uid));
      isAdmin = adminDoc.exists() && adminDoc.data()?.role === "admin";
    }

    if (!isAdmin) {
      logger.warn(`User ${decoded.uid} (${decoded.email || "unknown email"}) attempted admin access without privileges.`);
      return res.status(403).json({ error: "Administrator access required." });
    }

    req.user = {
      id: decoded.uid,
      email: decoded.email,
      role: "admin",
    };
    return next();
  } catch (err) {
    logger.warn("Firebase ID token verification failed:", err);
    return res.status(401).json({ error: "Invalid or expired authentication token." });
  }
}
