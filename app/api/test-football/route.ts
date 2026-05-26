import { NextResponse } from "next/server";
import { isCronAuthorized } from "@/app/lib/admin-auth";

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const res = await fetch(
    "https://api.football-data.org/v4/competitions/PD/matches?dateFrom=2026-05-24&dateTo=2026-05-30",
    { headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}
