"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getHotelGuestIds, getGuest, writeContract } from "@/lib/genlayer/comfotClient"
import type { Guest } from "@/types/contract"
import { toast } from "sonner"

export function useGuestIds() {
  const { address } = useAccount()
  return useQuery<string[]>({
    queryKey: ["guest-ids", address],
    queryFn: async () => {
      if (!address) return []
      return getHotelGuestIds(address)
    },
    enabled: !!address,
    staleTime: 15_000,
  })
}

export function useGuest(guestId: string | null) {
  return useQuery<Guest | null>({
    queryKey: ["guest", guestId],
    queryFn: () => (guestId ? getGuest(guestId) : null),
    enabled: !!guestId,
    staleTime: 20_000,
  })
}

export function useGuests() {
  const { address } = useAccount()
  const { data: ids = [] } = useGuestIds()

  return useQuery<Guest[]>({
    queryKey: ["guests", address, ids],
    queryFn: async () => {
      const results = await Promise.all(ids.map((id) => getGuest(id)))
      return results.filter((g): g is Guest => g !== null)
    },
    enabled: ids.length > 0,
    staleTime: 15_000,
  })
}

export function useSubmitGuestProfile() {
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (
    guestRef: string,
    name: string,
    loyaltyTier: string,
    reviewHistory: string[],
    specialRequests: string[],
    dietaryNeeds: string[],
    conversationHistory: string[],
    roomHistory: string[],
  ) => {
    const toastId = toast.loading("Submitting guest profile…")
    try {
      const hash = await writeContract("submit_guest_profile", [
        guestRef, name, loyaltyTier,
        reviewHistory, specialRequests, dietaryNeeds,
        conversationHistory, roomHistory,
      ])
      toast.success("Guest profile submitted", { id: toastId, description: `tx: ${hash.slice(0, 18)}…` })
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["guest-ids", address] })
        qc.invalidateQueries({ queryKey: ["guests", address] })
      }, 4000)
      return hash
    } catch (e: unknown) {
      toast.error("Submission failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useEraseGuestProfile() {
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (guestId: string) => {
    const toastId = toast.loading("Erasing guest profile…")
    try {
      const hash = await writeContract("erase_guest_profile", [guestId])
      toast.success("Guest profile erased", { id: toastId })
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["guest-ids", address] })
        qc.invalidateQueries({ queryKey: ["guests", address] })
      }, 4000)
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}
