import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  adminSessionCookieOptions,
  createAdminSessionToken,
  verifyAdminSecret,
} from "@/app/lib/admin-auth";
import { checkRateLimit, clientIp } from "@/app/lib/rate-limit";

async function readSecret(request: Request): Promise<string> {
  const contentType = request.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      const body = (await request.json()) as { secret?: string };
      return body.secret?.trim() ?? "";
    } catch {
      return "";
    }
  }

  try {
    const form = await request.formData();
    return form.get("secret")?.toString().trim() ?? "";
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  const rate = checkRateLimit(`admin:login:${clientIp(request)}`, 8, 15 * 60_000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: "Demasiados intentos. Prueba más tarde." },
      { status: 429, headers: { "Retry-After": String(rate.retryAfterSec) } }
    );
  }

  const secret = await readSecret(request);
  if (!verifyAdminSecret(secret)) {
    const loginUrl = new URL("/admin/login", request.url);
    loginUrl.searchParams.set("error", "1");
    return NextResponse.redirect(loginUrl, { status: 303 });
  }

  const token = createAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: "Admin no configurado en el servidor" },
      { status: 503 }
    );
  }

  const response = NextResponse.redirect(new URL("/admin", request.url), {
    status: 303,
  });
  response.cookies.set(ADMIN_COOKIE, token, adminSessionCookieOptions());
  return response;
}
