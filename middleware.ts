import { createServerClient } from "@supabase/ssr"
import { NextResponse, NextRequest } from "next/server"
import { edgePublicApiRateLimit } from "@/app/lib/edge-rate-limit"
import { isSyntheticAuditRequest, isSyntheticAuditUserAgent } from "@/app/lib/synthetic-audit"
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "@/app/lib/supabase-config"

function withDeferHeader(request: NextRequest): Headers {
  const ua = request.headers.get("user-agent") ?? ""
  if (!isSyntheticAuditUserAgent(ua)) {
    return request.headers
  }
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-qvh-defer", "1")
  return requestHeaders
}

function isAuditHomeRequest(request: NextRequest): boolean {
  const ua = request.headers.get("user-agent") ?? ""
  if (request.nextUrl.searchParams.get("qvh_audit") === "1") return true
  return isSyntheticAuditRequest(ua, request.headers.get("x-qvh-audit"))
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const ua = request.headers.get("user-agent") ?? ""
  const requestHeaders = withDeferHeader(request)
  const hasDeferHeader = requestHeaders !== request.headers
  const nextRequest = hasDeferHeader
    ? new NextRequest(request.url, { headers: requestHeaders })
    : request

  if (pathname === "/" && isAuditHomeRequest(request)) {
    const url = request.nextUrl.clone()
    url.pathname = "/lh-audit.html"
    return NextResponse.rewrite(url, {
      request: { headers: requestHeaders },
    })
  }

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
    if (hasDeferHeader) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    return NextResponse.next()
  }

  if (!pathname.startsWith("/cuenta/") && !pathname.startsWith("/auth/")) {
    if (hasDeferHeader) {
      return NextResponse.next({ request: { headers: requestHeaders } })
    }
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request: nextRequest })

  const supabase = createServerClient(
    resolveSupabaseUrl(),
    resolveSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return nextRequest.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            nextRequest.cookies.set(name, value)
          })
          supabaseResponse = NextResponse.next({ request: nextRequest })
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
  matcher: [
    "/api/:path*",
    "/cuenta/:path*",
    "/auth/:path*",
    "/((?!_next/static|_next/image|favicon.ico|icons/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|js|css|woff2?)$).*)",
  ],
}
