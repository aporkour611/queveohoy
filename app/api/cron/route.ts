import { runCronJob } from "@/app/lib/cron/run-cron"

export async function GET(request: Request) {
  return runCronJob(request)
}
