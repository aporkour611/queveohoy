import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminSecret,
  isAdminCookieValid,
} from "@/app/lib/admin-auth";
import { updateSession } from "@/app/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const secret = getAdminSecret();
  const adminKey = request.nextUrl.searchParams.get("admin");

  if (adminKey && secret && adminKey === secret) {
    const url = request.nextUrl.clone();
    url.searchParams.delete("admin");
    const response = NextResponse.redirect(url);
    response.cookies.set(ADMIN_COOKIE, secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  }

  if (request.nextUrl.pathname.startsWith("/admin")) {
    const cookie = request.cookies.get(ADMIN_COOKIE)?.value;
    if (!isAdminCookieValid(cookie)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/cuenta/:path*",
    "/entrar",
    "/registro",
    "/auth/:path*",
    "/agenda/:path*",
    "/api/:path*",
    "/partidos-hoy",
    "/futbol",
    "/champions",
    "/laliga",
    "/premier-league",
    "/formula-1",
    "/motogp",
    "/ufc",
    "/baloncesto",
    "/series",
    "/cookies",
    "/privacidad",
  ],
};
