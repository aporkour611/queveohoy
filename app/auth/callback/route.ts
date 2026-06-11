import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import {
  buildOAuthLoginRedirectPath,
} from "@/app/lib/oauth-callback-errors"
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "@/app/lib/supabase-config"
import { sanitizeInternalRedirectPath } from "@/app/lib/safe-redirect"

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const nextPath = searchParams.get("next") ?? "/cuenta"
  const provider = searchParams.get("provider")
  const oauthError = searchParams.get("error")
  const errorDescription = searchParams.get("error_description")

  if (oauthError && !code) {
    return NextResponse.redirect(
      `${origin}${buildOAuthLoginRedirectPath(origin, {
        error: oauthError,
        provider,
        detail: errorDescription,
        next: nextPath,
      })}`
    )
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}${buildOAuthLoginRedirectPath(origin, {
        error: "missing_code",
        provider,
        next: nextPath,
      })}`
    )
  }

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
    return NextResponse.redirect(
      `${origin}${buildOAuthLoginRedirectPath(origin, {
        error: "exchange_failed",
        provider,
        detail: error.message,
        next: nextPath,
      })}`
    )
  }

  const safeNext = sanitizeInternalRedirectPath(nextPath, "/cuenta")
  return NextResponse.redirect(`${origin}${safeNext}`)
}
