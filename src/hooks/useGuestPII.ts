import { useCallback, useState } from "react"
import type { GuestPII } from "@/lib/supabase/types"

interface PIIPayload {
  guest_id: string
  hotel_address: string
  guest_ref: string
  full_name?: string
  email?: string
  phone?: string
  nationality?: string
  passport_number?: string
  date_of_birth?: string
  notes?: string
}

export function useGuestPII() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchPII = useCallback(async (guest_id: string, hotel_address: string): Promise<GuestPII | null> => {
    setError(null)
    try {
      const res = await fetch(`/api/guest-pii?guest_id=${encodeURIComponent(guest_id)}&hotel_address=${encodeURIComponent(hotel_address)}`)
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to fetch PII")
      return json.data ?? null
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
      return null
    }
  }, [])

  const savePII = useCallback(async (payload: PIIPayload): Promise<GuestPII | null> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/guest-pii", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to save PII")
      return json.data ?? null
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const deletePII = useCallback(async (guest_id: string, hotel_address: string): Promise<boolean> => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/guest-pii?guest_id=${encodeURIComponent(guest_id)}&hotel_address=${encodeURIComponent(hotel_address)}`, {
        method: "DELETE",
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error ?? "Failed to delete PII")
      return true
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Unknown error")
      return false
    } finally {
      setLoading(false)
    }
  }, [])

  return { fetchPII, savePII, deletePII, loading, error }
}
