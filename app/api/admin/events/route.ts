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

export async function GET(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const limit = Math.min(
    100,
    Math.max(1, Number.parseInt(url.searchParams.get("limit") ?? "40", 10) || 40)
  );
  const date = url.searchParams.get("date")?.trim();
  const sport = url.searchParams.get("sport")?.trim();

  let query = createSupabaseAdmin()
    .from("events")
    .select("id, title, date, time, sport, platform, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (date) {
    query = query.eq("date", date);
  }
  if (sport) {
    query = query.eq("sport", sport);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ events: data ?? [] });
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

export async function DELETE(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const url = new URL(request.url);
  const id = Number.parseInt(url.searchParams.get("id") ?? "", 10);
  if (!Number.isFinite(id) || id <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const { error } = await createSupabaseAdmin()
    .from("events")
    .delete()
    .eq("id", id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id });
}

type PatchBody = {
  id?: number;
  title?: string;
  time?: string;
  sport?: string;
  platform?: string;
  date?: string;
};

export async function PATCH(request: Request) {
  if (!isAdminRequest(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: PatchBody;
  try {
    body = (await request.json()) as PatchBody;
  } catch {
    return NextResponse.json({ error: "JSON inválido" }, { status: 400 });
  }

  const id = body.id;
  if (!Number.isFinite(id) || !id || id <= 0) {
    return NextResponse.json({ error: "ID inválido" }, { status: 400 });
  }

  const updates: Record<string, string> = {};
  if (body.title !== undefined) {
    const title = body.title.trim();
    if (!title) {
      return NextResponse.json({ error: "Título vacío" }, { status: 400 });
    }
    updates.title = title;
  }
  if (body.time !== undefined) updates.time = body.time.trim();
  if (body.sport !== undefined) updates.sport = body.sport.trim();
  if (body.platform !== undefined) updates.platform = body.platform.trim();
  if (body.date !== undefined) updates.date = body.date.trim();

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: "Sin campos para actualizar" }, { status: 400 });
  }

  const { data, error } = await createSupabaseAdmin()
    .from("events")
    .update(updates)
    .eq("id", id)
    .select("id, title, date, time, sport, platform, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, event: data });
}
