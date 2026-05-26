import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminCookieValid } from "@/app/lib/admin-auth";

export async function GET() {
  const jar = await cookies();
  const cookie = jar.get(ADMIN_COOKIE)?.value;
  return NextResponse.json({ admin: isAdminCookieValid(cookie) });
}
