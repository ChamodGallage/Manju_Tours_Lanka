import { Request, Response } from "express";
import { getPublicSupabaseClient, getAdminSupabaseClient } from "../config/supabase.js";
import { ENV } from "../config/env.js";

export const healthController = {
  async check(_req: Request, res: Response) {
    let dbStatus = "not_configured";
    const client = getAdminSupabaseClient() || getPublicSupabaseClient();

    if (client) {
      try {
        const { error } = await client.from("site_settings").select("id").limit(1);
        dbStatus = error ? `connected_with_warning: ${error.message}` : "healthy";
      } catch (err) {
        dbStatus = `offline: ${err instanceof Error ? err.message : String(err)}`;
      }
    }

    return res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: ENV.NODE_ENV,
      database: {
        provider: "Supabase",
        url: ENV.SUPABASE_URL || "not_configured",
        status: dbStatus,
      },
    });
  },
};
