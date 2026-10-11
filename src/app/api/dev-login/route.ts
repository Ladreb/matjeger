import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  createDevSession,
  DEV_LOGIN_ROLES,
  isDevLoginAllowed,
  isDevLoginRole,
} from "@/features/auth/lib/dev-login";

export async function GET(request: Request) {
  if (!isDevLoginAllowed(request)) {
    return new NextResponse(null, { status: 404 });
  }

  const url = new URL(request.url);
  const role = url.searchParams.get("role") ?? Role.USER;
  if (!isDevLoginRole(role)) {
    return NextResponse.json(
      { error: `role must be one of ${DEV_LOGIN_ROLES.join(", ")}` },
      { status: 400 },
    );
  }

  const requested = new URL(url.searchParams.get("next") ?? "/", url.origin);
  const target =
    requested.origin === url.origin ? requested : new URL("/", url.origin);

  const { cookieName, sessionToken, expires } = await createDevSession(role);
  const response = NextResponse.redirect(target);
  response.cookies.set(cookieName, sessionToken, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    expires,
  });
  return response;
}
