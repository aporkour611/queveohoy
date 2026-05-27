import { NextResponse } from "next/server";
import { isCronAuthorized } from "../../../lib/admin-auth";
import { runPushCron } from "../../../lib/push-cron";

export const maxDuration = 60;

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPushCron();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Push cron error:", error);
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
