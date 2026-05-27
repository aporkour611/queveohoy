import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminSessionCookieOptions } from "@/app/lib/admin-auth";

export async function POST(request: Request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });
  response.cookies.set(ADMIN_COOKIE, "", { ...adminSessionCookieOptions(), maxAge: 0 });
  return response;
}
