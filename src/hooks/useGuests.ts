"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount, useSendTransaction } from "wagmi"
import { getHotelGuestIds, getGuest, sendWrite } from "@/lib/genlayer/comfotClient"
import type { Guest } from "@/types/contract"
import { toast } from "sonner"

export function useGuestIds() {
  const { address } = useAccount()
  return useQuery<string[]>({
    queryKey: ["guest-ids", address],
    queryFn: async () => {
      if (!address) return []
      const ids = await getHotelGuestIds(address)
      return ids ?? []
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
  const { sendTransactionAsync } = useSendTransaction()
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
      const hash = await sendWrite("submit_guest_profile", [
        guestRef, name, loyaltyTier,
        reviewHistory, specialRequests, dietaryNeeds,
        conversationHistory, roomHistory,
      ], sendTransactionAsync)
      toast.success("Guest profile submitted", { id: toastId, description: `tx: ${hash.slice(0, 18)}…` })
      qc.invalidateQueries({ queryKey: ["guest-ids", address] })
      qc.invalidateQueries({ queryKey: ["guests", address] })
      return hash
    } catch (e: unknown) {
      toast.error("Submission failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useEraseGuestProfile() {
  const { sendTransactionAsync } = useSendTransaction()
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (guestId: string) => {
    const toastId = toast.loading("Erasing guest profile…")
    try {
      const hash = await sendWrite("erase_guest_profile", [guestId], sendTransactionAsync)
      toast.success("Guest profile erased", { id: toastId })
      qc.invalidateQueries({ queryKey: ["guest-ids", address] })
      qc.invalidateQueries({ queryKey: ["guests", address] })
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}
