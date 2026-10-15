import type { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined = globalForPrisma.prisma;

function getPrisma(): PrismaClient {
  if (!prismaInstance) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { PrismaClient: ClientClass } = require("@prisma/client");
      prismaInstance = new ClientClass({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
      if (process.env.NODE_ENV !== "production") {
        globalForPrisma.prisma = prismaInstance;
      }
    } catch (err) {
      throw new Error(`Database client unavailable: ${(err as Error).message}`);
    }
  }
  return prismaInstance as PrismaClient;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const value = (client as unknown as Record<string, unknown>)[prop as string];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});

export default prisma;
