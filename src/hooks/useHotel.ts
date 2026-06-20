"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import {
  getHotel, getPreferenceRules, getHotelStats, writeContract,
} from "@/lib/genlayer/comfotClient"
import type { Hotel, HotelStats, PreferenceRule } from "@/types/contract"
import { useTxTracker } from "@/hooks/useTxPoller"

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

  return async (name: string, category: string, amenities: string[], rooms: string[]) => {
    const hash = await writeContract("register_hotel", [name, category, amenities, rooms])
    track(hash, "Register hotel", [
      ["hotel", address ?? ""],
      ["hotel-stats", address ?? ""],
    ])
    return hash
  }
}

export function useSetPreferenceRule() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (ruleType: string, ruleValue: string, priority: number) => {
    const hash = await writeContract("set_preference_rule", [ruleType, ruleValue, priority])
    track(hash, "Set preference rule", [["preference-rules", address ?? ""]])
    return hash
  }
}

export function useDeletePreferenceRule() {
  const { address } = useAccount()
  const { track } = useTxTracker()

  return async (ruleId: string) => {
    const hash = await writeContract("delete_preference_rule", [ruleId])
    track(hash, "Delete preference rule", [["preference-rules", address ?? ""]])
    return hash
  }
}
