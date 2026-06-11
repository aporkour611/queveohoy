import { createServerClient } from "@supabase/ssr"
import { NextResponse, type NextRequest } from "next/server"
import { edgePublicApiRateLimit } from "@/app/lib/edge-rate-limit"
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "@/app/lib/supabase-config"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname.startsWith("/api/")) {
    const rate = await edgePublicApiRateLimit(request)
    if (!rate.ok) {
      return NextResponse.json(
        { error: "Rate limit exceeded", retryAfterSec: rate.retryAfterSec },
        {
          status: 429,
          headers: {
            "Retry-After": String(rate.retryAfterSec),
            "Cache-Control": "no-store",
          },
        }
      )
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    resolveSupabaseUrl(),
    resolveSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  await supabase.auth.getUser()

  return supabaseResponse
}

export const config = {
  matcher: ["/api/:path*", "/cuenta/:path*", "/auth/:path*"],
}
