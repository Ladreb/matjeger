import { randomBytes } from "node:crypto";
import { Role } from "@prisma/client";
import { db } from "@/lib/db";

const SESSION_COOKIE_NAME = "next-auth.session-token";
const SESSION_DAYS = 7;
const TEST_POSTAL_CODE = "0150";

export function isDevLoginRole(value: string): value is Role {
  return Object.hasOwn(Role, value);
}

export const DEV_LOGIN_ROLES = Object.values(Role);

// Vercel builds always run with NODE_ENV=production and the flag lives only in
// .env.development.local. The Host header can be faked, so the real protection is that
// `npm run dev` binds to 127.0.0.1. Next adds x-forwarded-* itself in dev, so those headers cannot be used to spot a tunnel.
export function isDevLoginAllowed(request: Request): boolean {
  const { hostname } = new URL(request.url);
  const crossSite = request.headers.get("sec-fetch-site") === "cross-site";

  return (
    process.env.NODE_ENV !== "production" &&
    process.env.ENABLE_DEV_TOOLS === "true" &&
    hostname === "localhost" &&
    !crossSite
  );
}

export async function createDevSession(role: Role) {
  const email = `dev-${role.toLowerCase()}@matjeger.invalid`;
  const user = await db.user.upsert({
    where: { email },
    update: { role },
    create: {
      name: `Dev ${role}`,
      email,
      role,
      postalCode: TEST_POSTAL_CODE,
    },
  });

  await db.session.deleteMany({ where: { userId: user.id } });
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  const sessionToken = randomBytes(32).toString("hex");
  await db.session.create({ data: { sessionToken, userId: user.id, expires } });

  return { cookieName: SESSION_COOKIE_NAME, sessionToken, expires };
}
