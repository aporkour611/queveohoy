import { getCronSecret, isAdminRequest } from "@/app/lib/admin-auth";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const secret = getCronSecret();
  if (!secret) {
    return NextResponse.json(
      { error: "CRON_SECRET no configurado" },
      { status: 503 }
    );
  }

  const origin = new URL(request.url).origin;

  try {
    const res = await fetch(`${origin}/api/cron`, {
      method: "GET",
      headers: { Authorization: `Bearer ${secret}` },
      cache: "no-store",
    });

    const data = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!res.ok) {
      return NextResponse.json(
        { error: "Cron falló", status: res.status, ...(data ?? {}) },
        { status: res.status }
      );
    }

    return NextResponse.json(data ?? { ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
