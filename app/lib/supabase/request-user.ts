import { createClient, type User } from "@supabase/supabase-js"
import { createServerClient } from "./server-auth"
import {
  resolveSupabasePublishableKey,
  resolveSupabaseUrl,
} from "../supabase-config"

/** Usuario desde cookies (web) o Bearer JWT (app móvil). */
export async function resolveRequestUser(request: Request): Promise<User | null> {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) return user

  const auth = request.headers.get("authorization")
  if (!auth?.startsWith("Bearer ")) return null

  const token = auth.slice("Bearer ".length).trim()
  if (!token) return null

  const client = createClient(
    resolveSupabaseUrl(),
    resolveSupabasePublishableKey()
  )
  const {
    data: { user: mobileUser },
  } = await client.auth.getUser(token)

  return mobileUser
}
