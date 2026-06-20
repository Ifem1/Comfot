"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import {
  getHotel, getPreferenceRules, getHotelStats, writeContract,
} from "@/lib/genlayer/comfotClient"
import type { Hotel, HotelStats, PreferenceRule } from "@/types/contract"
import { useTxTracker } from "@/hooks/useTxPoller"
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
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (name: string, propertyType: string, description: string, location: string, amenities: string[], rooms: string[], packages: string[], starRating: number) => {
    try {
      const hash = await writeContract("register_hotel", [name, propertyType, description, location, amenities, rooms, packages, starRating])
      track(hash, "Register hotel", [
        ["hotel", address ?? ""],
        ["hotel-stats", address ?? ""],
      ])
      return hash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed"
      toast.error("Register hotel failed", { description: msg })
      throw e
    }
  }
}

export function useSetPreferenceRule() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (ruleType: string, ruleValue: string, priority: number) => {
    try {
      const hash = await writeContract("set_preference_rule", [ruleType, ruleValue, priority])
      track(hash, "Set preference rule", [["preference-rules", address ?? ""]])
      return hash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed"
      toast.error("Set preference rule failed", { description: msg })
      throw e
    }
  }
}

export function useDeletePreferenceRule() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (ruleId: string) => {
    try {
      const hash = await writeContract("delete_preference_rule", [ruleId])
      track(hash, "Delete preference rule", [["preference-rules", address ?? ""]])
      return hash
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Transaction failed"
      toast.error("Delete preference rule failed", { description: msg })
      throw e
    }
  }
}
