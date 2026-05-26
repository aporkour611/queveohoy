import { NextResponse } from "next/server";
import { fetchUfcCronEvents } from "@/app/lib/thesportsdb-ufc";

export async function GET() {
  try {
    const events = await fetchUfcCronEvents();
    return NextResponse.json({ ok: true, events });
  } catch (error) {
    return NextResponse.json(
      { ok: false, events: [], error: String(error) },
      { status: 500 }
    );
  }
}
