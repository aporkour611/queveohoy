import { runCronJob } from "@/app/lib/cron/run-cron"

export const dynamic = "force-dynamic"
export const maxDuration = 10

export async function GET(request: Request) {
  return runCronJob(request)
}
