import { Request, Response, NextFunction } from "express";
import { getAdminSupabaseClient, getPublicSupabaseClient } from "../config/supabase.js";
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
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authentication required. Bearer token missing." });
    }

    const token = authHeader.split(" ")[1];
    const client = getPublicSupabaseClient() || getAdminSupabaseClient();
    
    if (!client) {
      // If Supabase not yet configured, fail safely
      logger.warn("Supabase client is not configured for auth verification");
      return res.status(503).json({ error: "Authentication service unavailable." });
    }

    const { data: { user }, error } = await client.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: "Invalid or expired session token." });
    }

    // Verify admin role
    const metadataRole = user.app_metadata?.role;
    let isAdmin = metadataRole === "admin";

    if (!isAdmin) {
      const adminClient = getAdminSupabaseClient();
      if (adminClient) {
        const { data: adminRow, error: adminErr } = await adminClient
          .from("admins")
          .select("id, role")
          .eq("id", user.id)
          .eq("role", "admin")
          .maybeSingle();

        if (!adminErr && adminRow) {
          isAdmin = true;
        }
      }
    }

    if (!isAdmin) {
      logger.warn(`User ${user.id} (${user.email}) attempted admin access without admin role.`);
      return res.status(403).json({ error: "Administrator access required." });
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: "admin",
    };

    return next();
  } catch (err) {
    logger.error("Authentication error in requireAdmin:", err);
    return res.status(500).json({ error: "Internal authentication verification failure." });
  }
}
