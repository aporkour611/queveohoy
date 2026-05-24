import { NextResponse } from "next/server";

export async function GET() {
  const res = await fetch(
    "https://api.football-data.org/v4/competitions/PD/matches?dateFrom=2026-05-24&dateTo=2026-05-30",
    { headers: { "X-Auth-Token": process.env.FOOTBALL_DATA_API_KEY! } }
  );
  const data = await res.json();
  return NextResponse.json(data);
}