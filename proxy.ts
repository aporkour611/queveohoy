import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import {
  ADMIN_COOKIE,
  getAdminSecret,
  isAdminCookieValid,
} from "@/app/lib/admin-auth";

export async function proxy(request: NextRequest) {
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

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
