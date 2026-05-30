import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "@/app/lib/supabase-config"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const nextPath = searchParams.get("next") ?? "/cuenta"

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      resolveSupabaseUrl(),
      resolveSupabasePublishableKey(),
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (error) {
      return NextResponse.redirect(`${origin}/cuenta/login?error=auth`)
    }
  }

  const safeNext = nextPath.startsWith("/") ? nextPath : "/cuenta"
  return NextResponse.redirect(`${origin}${safeNext}`)
}
