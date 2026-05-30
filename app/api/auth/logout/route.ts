import { createServerClient } from "@/app/lib/supabase/server-auth"
import { siteUrl } from "@/app/lib/seo"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/cuenta/login", siteUrl), {
    status: 303,
  })
}
