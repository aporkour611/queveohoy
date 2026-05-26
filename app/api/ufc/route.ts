import { NextResponse } from "next/server";
import { fetchUpcomingUfcEvents } from "@/app/lib/thesportsdb-ufc";

export async function GET() {
  try {
    const events = await fetchUpcomingUfcEvents();
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    return NextResponse.json(
      { ok: false, events: [], error: String(error) },
      { status: 500 }
    );
  }
}
