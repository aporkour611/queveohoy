import { NextResponse } from "next/server";
import { isAdminRequest } from "@/app/lib/admin-auth";
import { createSupabaseAdmin } from "@/app/lib/supabase-admin";

type AdminEventInput = {
  title?: string;
  time?: string;
  category?: string;
  platform?: string;
  date?: string;
  sport?: string;
};

function normalizeEvents(body: unknown): AdminEventInput[] {
  if (Array.isArray(body)) return body as AdminEventInput[];
  if (body && typeof body === "object") return [body as AdminEventInput];
  return [];
}

export async function POST(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const rows = normalizeEvents(body)
    .map((row) => ({
      title: row.title?.trim(),
      time: row.time?.trim(),
      sport: (row.sport ?? row.category)?.trim(),
      platform: row.platform?.trim(),
      date: row.date?.trim(),
    }))
    .filter((row) => row.title);

  if (!rows.length) {
    return NextResponse.json({ error: "Sin eventos válidos" }, { status: 400 });
  }

  const { data, error } = await createSupabaseAdmin()
    .from("events")
    .insert(rows)
    .select("id");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, count: data?.length ?? rows.length });
}
