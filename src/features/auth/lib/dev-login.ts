import { randomBytes } from "node:crypto";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

const SESSION_COOKIE_NAME = "next-auth.session-token";
const SESSION_DAYS = 7;
const TEST_POSTAL_CODE = "0150";

export const DEV_LOGIN_ROLES: string[] = Object.values(Role);

// The flag lives only in .env.development.local, and Vercel builds always run with NODE_ENV=production.
export function isDevLoginAllowed(hostname: string): boolean {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_TOOLS === "true" &&
    hostname === "localhost"
  );
}

export async function createDevSession(role: Role) {
  const user = await db.user.upsert({
    where: { email: `dev-${role.toLowerCase()}@matjeger.invalid` },
    update: { role },
    create: {
      name: `Dev ${role}`,
      email: `dev-${role.toLowerCase()}@matjeger.invalid`,
      role,
      postalCode: TEST_POSTAL_CODE,
    },
  });

  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const sessionToken = randomBytes(32).toString("hex");
  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  return { cookieName: SESSION_COOKIE_NAME, sessionToken, expires };
}
