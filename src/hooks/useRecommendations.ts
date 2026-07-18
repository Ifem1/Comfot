"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import {
  getGuestRecommendations,
  getHotelRecommendations,
  getHotelRecommendationsByStatus,
  getPendingEscalations,
  getValidationForRecommendation,
  writeContract,
} from "@/lib/genlayer/comfotClient"
import type { Recommendation, Validation, Escalation } from "@/types/contract"
import { useTxTracker } from "@/hooks/useTxPoller"
import { toast } from "sonner"

export function useGuestRecommendations(guestId: string | null) {
  return useQuery<Recommendation[]>({
    queryKey: ["guest-recs", guestId],
    queryFn: () => (guestId ? getGuestRecommendations(guestId) : []),
    enabled: !!guestId,
    staleTime: 15_000,
  })
}

export function useHotelRecommendations() {
  const { address } = useAccount()
  return useQuery<Recommendation[]>({
    queryKey: ["hotel-recs", address],
    queryFn: () => (address ? getHotelRecommendations(address) : []),
    enabled: !!address,
    staleTime: 15_000,
  })
}

export function useHotelRecommendationsByStatus(status: string) {
  const { address } = useAccount()
  return useQuery<Recommendation[]>({
    queryKey: ["hotel-recs-status", address, status],
    queryFn: () => (address ? getHotelRecommendationsByStatus(address, status) : []),
    enabled: !!address,
    staleTime: 15_000,
  })
}

export function usePendingEscalations() {
  const { address } = useAccount()
  return useQuery<Escalation[]>({
    queryKey: ["escalations-pending", address],
    queryFn: () => (address ? getPendingEscalations(address) : []),
    enabled: !!address,
    staleTime: 10_000,
    refetchInterval: 30_000,
  })
}

export function useValidationForRecommendation(recId: string | null) {
  return useQuery<Validation | null>({
    queryKey: ["validation", recId],
    queryFn: () => (recId ? getValidationForRecommendation(recId) : null),
    enabled: !!recId,
    staleTime: 30_000,
  })
}

export function useRequestRecommendation() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  // Contract takes only guest_id — all context is pulled from the stored guest profile
  return async (guestId: string) => {
    const hash = await writeContract("request_recommendation", [guestId])
    track(hash, "Request recommendation", {
      invalidateKeys: [
        ["hotel-recs", address ?? ""],
        ["guest-recs", guestId],
        ["hotel-stats", address ?? ""],
      ],
    })
    return hash
  }
}

export function useResolveEscalation() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  // Contract: resolve_escalation(escalation_id, resolution, resolution_note)
  return async (escalationId: string, resolution: "approved" | "rejected", resolutionNote: string) => {
    try {
      const hash = await writeContract("resolve_escalation", [escalationId, resolution, resolutionNote])
      track(hash, `Escalation ${resolution}`, [
        ["escalations-pending", address ?? ""],
        ["hotel-recs", address ?? ""],
      ])
      return hash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed"
      toast.error(`Escalation ${resolution} failed`, { description: msg })
      throw e
    }
  }
}
