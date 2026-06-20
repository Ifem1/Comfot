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

  return async (
    guestId: string,
    roomType: string,
    checkIn: string,
    checkOut: string,
    specialContext: string,
  ) => {
    const hash = await writeContract("request_recommendation", [
      guestId, roomType, checkIn, checkOut, specialContext,
    ])
    track(hash, "Request recommendation", [
      ["hotel-recs", address ?? ""],
      ["guest-recs", guestId],
      ["hotel-stats", address ?? ""],
    ])
    return hash
  }
}

export function useResolveEscalation() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (escalationId: string, decision: "approved" | "rejected", reviewerNote: string) => {
    const hash = await writeContract("resolve_escalation", [escalationId, decision, reviewerNote])
    track(hash, `Escalation ${decision}`, [
      ["escalations-pending", address ?? ""],
      ["hotel-recs", address ?? ""],
    ])
    return hash
  }
}
