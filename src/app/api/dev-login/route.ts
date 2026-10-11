import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createDevSession,
  DEV_LOGIN_ROLES,
  isDevLoginAllowed,
} from "@/features/auth/lib/dev-login";

export async function GET(request: Request) {
  const url = new URL(request.url);
  if (!isDevLoginAllowed(url.hostname)) {
    return new NextResponse(null, { status: 404 });
  }

  const role = url.searchParams.get("role") ?? Role.USER;
  if (!DEV_LOGIN_ROLES.includes(role)) {
    return NextResponse.json(
      { error: `role must be one of ${DEV_LOGIN_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const next = url.searchParams.get("next") ?? "/";
  const target = next.startsWith("/") && !next.startsWith("//") ? next : "/";

  const { cookieName, sessionToken, expires } = await createDevSession(
    role as Role,
  );
  const response = NextResponse.redirect(new URL(target, url));
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
  return response;
}
