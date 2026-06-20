"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
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
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (
    guestId: string,
    roomType: string,
    checkIn: string,
    checkOut: string,
    specialContext: string,
  ) => {
    const toastId = toast.loading("Requesting recommendation from validators…")
    try {
      const hash = await writeContract("request_recommendation", [
        guestId, roomType, checkIn, checkOut, specialContext,
      ])
      toast.success("Recommendation requested", {
        id: toastId,
        description: `Validators are running consensus. tx: ${hash.slice(0, 18)}…`,
      })
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["hotel-recs", address] })
        qc.invalidateQueries({ queryKey: ["guest-recs", guestId] })
      }, 5000)
      return hash
    } catch (e: unknown) {
      toast.error("Request failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useResolveEscalation() {
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (escalationId: string, decision: "approved" | "rejected", reviewerNote: string) => {
    const toastId = toast.loading("Resolving escalation…")
    try {
      const hash = await writeContract("resolve_escalation", [escalationId, decision, reviewerNote])
      toast.success(`Escalation ${decision}`, { id: toastId })
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["escalations-pending", address] })
        qc.invalidateQueries({ queryKey: ["hotel-recs", address] })
      }, 4000)
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}
