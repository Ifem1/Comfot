"use client"

import { useQuery, useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import {
  getHotel, getPreferenceRules, getHotelStats, writeContract,
} from "@/lib/genlayer/comfotClient"
import type { Hotel, HotelStats, PreferenceRule } from "@/types/contract"
import { toast } from "sonner"

export function useHotel() {
  const { address } = useAccount()
  return useQuery<Hotel | null>({
    queryKey: ["hotel", address],
    queryFn: () => (address ? getHotel(address) : null),
    enabled: !!address,
    staleTime: 20_000,
  })
}

export function useHotelStats() {
  const { address } = useAccount()
  return useQuery<HotelStats | null>({
    queryKey: ["hotel-stats", address],
    queryFn: () => (address ? getHotelStats(address) : null),
    enabled: !!address,
    staleTime: 20_000,
  })
}

export function usePreferenceRules() {
  const { address } = useAccount()
  return useQuery<PreferenceRule[]>({
    queryKey: ["preference-rules", address],
    queryFn: async () => {
      if (!address) return []
      return getPreferenceRules(address)
    },
    enabled: !!address,
    staleTime: 20_000,
  })
}

export function useRegisterHotel() {
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (name: string, category: string, amenities: string[], rooms: string[]) => {
    const toastId = toast.loading("Sending hotel registration…")
    try {
      const hash = await writeContract("register_hotel", [name, category, amenities, rooms])
      toast.success("Registration submitted", { id: toastId, description: `tx: ${hash.slice(0, 18)}…` })
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["hotel", address] })
        qc.invalidateQueries({ queryKey: ["hotel-stats", address] })
      }, 4000)
      return hash
    } catch (e: unknown) {
      toast.error("Registration failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useSetPreferenceRule() {
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (ruleType: string, ruleValue: string, priority: number) => {
    const toastId = toast.loading("Setting preference rule…")
    try {
      const hash = await writeContract("set_preference_rule", [ruleType, ruleValue, priority])
      toast.success("Rule saved", { id: toastId })
      setTimeout(() => qc.invalidateQueries({ queryKey: ["preference-rules", address] }), 3000)
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useDeletePreferenceRule() {
  const qc = useQueryClient()
  const { address } = useAccount()

  return async (ruleId: string) => {
    const toastId = toast.loading("Deleting rule…")
    try {
      const hash = await writeContract("delete_preference_rule", [ruleId])
      toast.success("Rule deleted", { id: toastId })
      setTimeout(() => qc.invalidateQueries({ queryKey: ["preference-rules", address] }), 3000)
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}
