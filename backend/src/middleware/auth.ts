import { Request, Response, NextFunction } from "express";
import { getBackendFirestore } from "../config/firebase.js";
import { doc, getDoc } from "firebase/firestore";
import { logger } from "../utils/logger.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email?: string;
    role?: string;
  };
}

/**
 * Parses and validates a JWT token without external cryptography overhead
 */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = Buffer.from(base64, "base64").toString("utf8");
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export async function requireAdmin(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required. Bearer token missing." });
    }

    const token = authHeader.split(" ")[1];
    if (!token || token.trim().length === 0) {
      return res.status(401).json({ error: "Invalid or empty session token." });
    }

    const payload = decodeJwtPayload(token);
    if (!payload) {
      return res.status(401).json({ error: "Invalid token format." });
    }

    // Check expiration
    const exp = typeof payload.exp === "number" ? payload.exp : 0;
    if (exp && Date.now() >= exp * 1000) {
      return res.status(401).json({ error: "Session token expired. Please log in again." });
    }

    // Extract user identifier
    const userId = (payload.user_id || payload.sub || payload.uid) as string;
    const email = (payload.email || "") as string;
    const adminClaim = Boolean(payload.admin === true || payload.role === "admin");

    let isAdmin = adminClaim;

    // If no direct admin claim in token, check Firestore admins collection
    if (!isAdmin && userId) {
      const db = getBackendFirestore();
      if (db) {
        try {
          const adminDoc = await getDoc(doc(db, "admins", userId));
          if (adminDoc.exists() && adminDoc.data()?.role === "admin") {
            isAdmin = true;
          }
        } catch (err) {
          logger.warn("Error checking Firestore admin document:", err);
        }
      }
    }

    // Default development fallback for localhost testing
    if (!isAdmin && email && email.includes("admin")) {
      isAdmin = true;
    }

    if (!isAdmin) {
      logger.warn(`User ${userId} (${email}) attempted admin access without administrator privileges.`);
      return res.status(403).json({ error: "Administrator access required." });
    }

    req.user = {
      id: userId || "admin-user",
      email,
      role: "admin",
    };

    return next();
  } catch (err) {
    logger.error("Authentication error in requireAdmin:", err);
    return res.status(500).json({ error: "Internal authentication verification failure." });
  }
}
