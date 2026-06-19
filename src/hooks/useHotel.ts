"use client"

import { useQuery } from "@tanstack/react-query"
import { useAccount, useSendTransaction } from "wagmi"
import { getHotel, getPreferenceRules, getHotelStats, sendWrite, encodeRegisterHotel, encodeSetPreferenceRule, encodeDeletePreferenceRule, encodeDeactivateHotel } from "@/lib/genlayer/comfotClient"
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
      const rules = await getPreferenceRules(address)
      return rules ?? []
    },
    enabled: !!address,
    staleTime: 20_000,
  })
}

export function useRegisterHotel() {
  const { sendTransactionAsync } = useSendTransaction()

  return async (name: string, category: string, amenities: string[], rooms: string[]) => {
    const toastId = toast.loading("Sending hotel registration…")
    try {
      const hash = await sendWrite("register_hotel", [name, category, amenities, rooms], sendTransactionAsync)
      toast.success("Registration submitted", { id: toastId, description: `tx: ${hash.slice(0, 18)}…` })
      return hash
    } catch (e: unknown) {
      toast.error("Registration failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useSetPreferenceRule() {
  const { sendTransactionAsync } = useSendTransaction()

  return async (ruleType: string, ruleValue: string, priority: number) => {
    const toastId = toast.loading("Setting preference rule…")
    try {
      const hash = await sendWrite("set_preference_rule", [ruleType, ruleValue, priority], sendTransactionAsync)
      toast.success("Rule saved", { id: toastId })
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}

export function useDeletePreferenceRule() {
  const { sendTransactionAsync } = useSendTransaction()

  return async (ruleId: string) => {
    const toastId = toast.loading("Deleting rule…")
    try {
      const hash = await sendWrite("delete_preference_rule", [ruleId], sendTransactionAsync)
      toast.success("Rule deleted", { id: toastId })
      return hash
    } catch (e: unknown) {
      toast.error("Failed", { id: toastId, description: e instanceof Error ? e.message : String(e) })
      throw e
    }
  }
}
