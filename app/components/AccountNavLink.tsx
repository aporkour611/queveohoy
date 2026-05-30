"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { createBrowserClient, isSupabaseConfigured } from "@/app/lib/supabase/browser-client"

export const AccountNavLink = () => {
  const [loggedIn, setLoggedIn] = useState<boolean | null>(() =>
    isSupabaseConfigured() ? null : false
  )

  useEffect(() => {
    const supabase = createBrowserClient()
    if (!supabase) return

    let cancelled = false

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) setLoggedIn(Boolean(session))
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) setLoggedIn(Boolean(session))
    })

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [])

  if (loggedIn === null) return null

  return (
    <Link href={loggedIn ? "/cuenta" : "/cuenta/login"}>
      {loggedIn ? "Mi cuenta" : "Iniciar sesión"}
    </Link>
  )
}
