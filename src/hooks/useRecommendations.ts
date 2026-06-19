"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount, useSendTransaction } from "wagmi"
import {
  getGuestRecommendations,
  getHotelRecommendations,
  getHotelRecommendationsByStatus,
  getHotelEscalations,
  getPendingEscalations,
  getValidationForRecommendation,
  getEscalation,
  sendWrite,
} from "@/lib/genlayer/comfotClient"
import type { Recommendation, Validation, Escalation } from "@/types/contract"
import { toast } from "sonner"

export function useGuestRecommendations(guestId: string | null) {
  return useQuery<Recommendation[]>({
    queryKey: ["guest-recs", guestId],
    queryFn: async () => {
      if (!guestId) return []
      const recs = await getGuestRecommendations(guestId)
      return recs ?? []
    },
    enabled: !!guestId,
    staleTime: 15_000,
  })
}

export function useHotelRecommendations() {
  const { address } = useAccount()
  return useQuery<Recommendation[]>({
    queryKey: ["hotel-recs", address],
    queryFn: async () => {
      if (!address) return []
      const recs = await getHotelRecommendations(address)
      return recs ?? []
    },
    enabled: !!address,
    staleTime: 15_000,
  })
}

export function useHotelRecommendationsByStatus(status: string) {
  const { address } = useAccount()
  return useQuery<Recommendation[]>({
    queryKey: ["hotel-recs-status", address, status],
    queryFn: async () => {
      if (!address) return []
      const recs = await getHotelRecommendationsByStatus(address, status)
      return recs ?? []
    },
    enabled: !!address,
    staleTime: 15_000,
  })
}

export function usePendingEscalations() {
  const { address } = useAccount()
  return useQuery<Escalation[]>({
    queryKey: ["escalations-pending", address],
    queryFn: async () => {
      if (!address) return []
      const esc = await getPendingEscalations(address)
      return esc ?? []
    },
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
  const { sendTransactionAsync } = useSendTransaction()
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (guestId: string, roomType: string, checkIn: string, checkOut: string, specialContext: string) => {
    const toastId = toast.loading("Requesting recommendation from validators…")
    try {
      const hash = await sendWrite("request_recommendation", [
        guestId, roomType, checkIn, checkOut, specialContext,
      ], sendTransactionAsync)
      toast.success("Recommendation requested", { id: toastId, description: `Validators are running consensus. tx: ${hash.slice(0, 18)}…` })
      qc.invalidateQueries({ queryKey: ["hotel-recs", address] })
      qc.invalidateQueries({ queryKey: ["guest-recs", guestId] })
      return hash
    } catch (e: unknown) {
      toast.error("Request failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useResolveEscalation() {
  const { sendTransactionAsync } = useSendTransaction()
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (escalationId: string, decision: "approved" | "rejected", reviewerNote: string) => {
    const toastId = toast.loading(`Resolving escalation…`)
    try {
      const hash = await sendWrite("resolve_escalation", [escalationId, decision, reviewerNote], sendTransactionAsync)
      toast.success(`Escalation ${decision}`, { id: toastId })
      qc.invalidateQueries({ queryKey: ["escalations-pending", address] })
      qc.invalidateQueries({ queryKey: ["hotel-recs", address] })
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}
