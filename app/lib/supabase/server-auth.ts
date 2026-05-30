import { createServerClient as createSupabaseServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config"

export async function createServerClient() {
  const cookieStore = await cookies()

  return createSupabaseServerClient(
    resolveSupabaseUrl(),
    resolveSupabasePublishableKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          } catch {
            // Server Components may run where cookies are read-only.
          }
        },
      },
    }
  )
}
