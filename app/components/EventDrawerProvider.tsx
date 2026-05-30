"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import type { EventRow } from "./types"
import { EventDetailDrawer } from "./EventDetailDrawer"

type EventDrawerContextValue = {
  open: (event: EventRow) => void
  close: () => void
  event: EventRow | null
  isOpen: boolean
}

const EventDrawerContext = createContext<EventDrawerContextValue | null>(null)

export function EventDrawerProvider({ children }: { children: ReactNode }) {
  const [event, setEvent] = useState<EventRow | null>(null)

  const close = useCallback(() => setEvent(null), [])
  const open = useCallback((next: EventRow) => setEvent(next), [])

  useEffect(() => {
    if (!event) return
    const handleKey = (keyboardEvent: KeyboardEvent) => {
      if (keyboardEvent.key === "Escape") close()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [event, close])

  useEffect(() => {
    if (!event) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [event])

  const value = useMemo(
    () => ({
      open,
      close,
      event,
      isOpen: event != null,
    }),
    [open, close, event]
  )

  return (
    <EventDrawerContext.Provider value={value}>
      {children}
      <EventDetailDrawer event={event} onClose={close} />
    </EventDrawerContext.Provider>
  )
}

export function useEventDrawer(): EventDrawerContextValue {
  const ctx = useContext(EventDrawerContext)
  if (!ctx) {
    throw new Error("useEventDrawer must be used within EventDrawerProvider")
  }
  return ctx
}

export function useEventDrawerOptional(): EventDrawerContextValue | null {
  return useContext(EventDrawerContext)
}
