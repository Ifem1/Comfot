"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { getHotelGuestIds, getGuest, writeContract } from "@/lib/genlayer/comfotClient"
import type { Guest } from "@/types/contract"
import { useTxTracker } from "@/hooks/useTxPoller"
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

// Contract signature:
// submit_guest_profile(guest_ref, loyalty_tier, stay_count, total_spend_band,
//                      reviews, conversation_log, special_requests,
//                      dietary_needs, room_history, language)
export function useSubmitGuestProfile() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (
    guestRef: string,
    loyaltyTier: string,
    stayCount: number,
    totalSpendBand: string,
    reviews: string[],
    conversationLog: string[],
    specialRequests: string[],
    dietaryNeeds: string[],
    roomHistory: string[],
    language: string,
  ) => {
    try {
      const hash = await writeContract("submit_guest_profile", [
        guestRef, loyaltyTier, stayCount, totalSpendBand,
        reviews, conversationLog, specialRequests,
        dietaryNeeds, roomHistory, language,
      ])
      track(hash, `Submit guest: ${guestRef}`, [
        ["guest-ids", address ?? ""],
        ["guests", address ?? ""],
      ])
      return hash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed"
      toast.error("Submit guest failed", { description: msg })
      throw e
    }
  }
}

export function useEraseGuestProfile() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (guestId: string) => {
    try {
      const hash = await writeContract("erase_guest_profile", [guestId])
      track(hash, "Erase guest profile", [
        ["guest-ids", address ?? ""],
        ["guests", address ?? ""],
      ])
      return hash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed"
      toast.error("Erase guest failed", { description: msg })
      throw e
    }
  }
}
