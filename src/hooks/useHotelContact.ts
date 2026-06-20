import { useCallback, useState } from "react"
import type { HotelContact } from "@/lib/supabase/types"

interface ContactPayload {
  hotel_address: string
  hotel_name?: string
  contact_email?: string
  notify_escalations?: boolean
  notify_finalized?: boolean
}

export function useHotelContact() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchContact = useCallback(async (hotel_address: string): Promise<HotelContact | null> => {
    setError(null)
    try {
      const res = await fetch(`/api/hotel-contact?hotel_address=${encodeURIComponent(hotel_address)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch contact")
      return json.data ?? null
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
      return null
    }
  }, [])

  const saveContact = useCallback(async (payload: ContactPayload): Promise<HotelContact | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/hotel-contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save contact")
      return json.data ?? null
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchContact, saveContact, loading, error }
}
