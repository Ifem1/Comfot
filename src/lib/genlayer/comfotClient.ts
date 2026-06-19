/**
 * Comfot — GenLayer Contract Client
 *
 * All reads → JSON-RPC gen_getContractState (free, no gas)
 * All writes → wagmi sendTransaction with GenLayer-encoded calldata
 *
 * Contract: 0x28351D10CfEb51197ab4E76282d54E65cea033c9
 * Network : StudioNet (chainId 61999)
 */

import { GENLAYER_CONTRACT_ADDRESS, GENLAYER_RPC_URL } from "./config"
import type {
  Hotel, Guest, Recommendation, Validation,
  Escalation, PreferenceRule, HotelStats, GlobalStats,
} from "@/types/contract"

// ─────────────────────────────────────────────────────────────
// LOW-LEVEL RPC
// ─────────────────────────────────────────────────────────────

let _rpcId = 1

async function rpcRead<T = unknown>(method: string, args: unknown[] = []): Promise<T> {
  if (!GENLAYER_CONTRACT_ADDRESS) {
    throw new Error("NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS is not set")
  }

  const body = JSON.stringify({
    jsonrpc: "2.0",
    id: _rpcId++,
    method: "gen_getContractState",
    params: [
      {
        contract_address: GENLAYER_CONTRACT_ADDRESS,
        function_name: method,
        args,
        state_status: "accepted",
      },
    ],
  })

  const res = await fetch(GENLAYER_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
  })

  if (!res.ok) {
    throw new Error(`RPC HTTP ${res.status}: ${res.statusText}`)
  }

  const json = await res.json()

  if (json.error) {
    throw new Error(`RPC error: ${json.error.message || JSON.stringify(json.error)}`)
  }

  return json.result as T
}

/**
 * Encode a GenLayer contract write call as hex calldata.
 * GenLayer Python contracts accept JSON-encoded function calls.
 */
function encodeCalldata(functionName: string, args: unknown[]): `0x${string}` {
  const payload = JSON.stringify({ method: functionName, args })
  const hex = Array.from(new TextEncoder().encode(payload))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
  return `0x${hex}` as `0x${string}`
}

/**
 * Send a write transaction through the connected wagmi wallet.
 * Returns the transaction hash.
 */
export async function sendWrite(
  functionName: string,
  args: unknown[],
  sendTransaction: (params: { to: `0x${string}`; data: `0x${string}` }) => Promise<string>
): Promise<string> {
  const data = encodeCalldata(functionName, args)
  const hash = await sendTransaction({
    to: GENLAYER_CONTRACT_ADDRESS,
    data,
  })
  return hash
}

// ─────────────────────────────────────────────────────────────
// READ METHODS (free)
// ─────────────────────────────────────────────────────────────

export async function getContractVersion(): Promise<string> {
  return rpcRead<string>("get_contract_version")
}

export async function getHotel(hotelAddress: string): Promise<Hotel | null> {
  const result = await rpcRead<Hotel | Record<string, never>>("get_hotel", [hotelAddress])
  return result && Object.keys(result).length > 0 ? (result as Hotel) : null
}

export async function getGuest(guestId: string): Promise<Guest | null> {
  const result = await rpcRead<Guest | Record<string, never>>("get_guest", [guestId])
  return result && Object.keys(result).length > 0 ? (result as Guest) : null
}

export async function getGuestId(hotelAddress: string, guestRef: string): Promise<string> {
  return rpcRead<string>("get_guest_id", [hotelAddress, guestRef])
}

export async function getRecommendation(recId: string): Promise<Recommendation | null> {
  const result = await rpcRead<Recommendation | Record<string, never>>("get_recommendation", [recId])
  return result && Object.keys(result).length > 0 ? (result as Recommendation) : null
}

export async function getValidation(validationId: string): Promise<Validation | null> {
  const result = await rpcRead<Validation | Record<string, never>>("get_validation", [validationId])
  return result && Object.keys(result).length > 0 ? (result as Validation) : null
}

export async function getValidationForRecommendation(recId: string): Promise<Validation | null> {
  const result = await rpcRead<Validation | Record<string, never>>(
    "get_validation_for_recommendation",
    [recId]
  )
  return result && Object.keys(result).length > 0 ? (result as Validation) : null
}

export async function getEscalation(escalationId: string): Promise<Escalation | null> {
  const result = await rpcRead<Escalation | Record<string, never>>("get_escalation", [escalationId])
  return result && Object.keys(result).length > 0 ? (result as Escalation) : null
}

export async function getHotelGuestIds(hotelAddress: string): Promise<string[]> {
  return rpcRead<string[]>("get_hotel_guest_ids", [hotelAddress])
}

export async function getGuestRecommendationIds(guestId: string): Promise<string[]> {
  return rpcRead<string[]>("get_guest_recommendation_ids", [guestId])
}

export async function getGuestRecommendations(guestId: string): Promise<Recommendation[]> {
  return rpcRead<Recommendation[]>("get_guest_recommendations", [guestId])
}

export async function getHotelRecommendations(hotelAddress: string): Promise<Recommendation[]> {
  return rpcRead<Recommendation[]>("get_hotel_recommendations", [hotelAddress])
}

export async function getHotelRecommendationsByStatus(
  hotelAddress: string,
  status: string
): Promise<Recommendation[]> {
  return rpcRead<Recommendation[]>("get_hotel_recommendations_by_status", [hotelAddress, status])
}

export async function getHotelEscalations(hotelAddress: string): Promise<Escalation[]> {
  return rpcRead<Escalation[]>("get_hotel_escalations", [hotelAddress])
}

export async function getPendingEscalations(hotelAddress: string): Promise<Escalation[]> {
  return rpcRead<Escalation[]>("get_pending_escalations", [hotelAddress])
}

export async function getPreferenceRules(hotelAddress: string): Promise<PreferenceRule[]> {
  return rpcRead<PreferenceRule[]>("get_preference_rules", [hotelAddress])
}

export async function getHotelStats(hotelAddress: string): Promise<HotelStats | null> {
  const result = await rpcRead<HotelStats | Record<string, never>>("get_hotel_stats", [hotelAddress])
  return result && Object.keys(result).length > 0 ? (result as HotelStats) : null
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return rpcRead<GlobalStats>("get_global_stats")
}

// ─────────────────────────────────────────────────────────────
// WRITE METHOD HELPERS (return encoded args for sendWrite)
// ─────────────────────────────────────────────────────────────

export function encodeRegisterHotel(params: {
  name: string
  property_type: string
  description: string
  location: string
  amenities: string[]
  room_types: string[]
  packages: string[]
  star_rating: number
}) {
  return {
    fn: "register_hotel",
    args: [
      params.name,
      params.property_type,
      params.description,
      params.location,
      params.amenities,
      params.room_types,
      params.packages,
      params.star_rating,
    ],
  }
}

export function encodeDeactivateHotel() {
  return { fn: "deactivate_hotel", args: [] }
}

export function encodeSetPreferenceRule(params: {
  rule_id: string
  rule_type: string
  rule_value: string
  description: string
  active: boolean
}) {
  return {
    fn: "set_preference_rule",
    args: [
      params.rule_id,
      params.rule_type,
      params.rule_value,
      params.description,
      params.active,
    ],
  }
}

export function encodeDeletePreferenceRule(ruleId: string) {
  return { fn: "delete_preference_rule", args: [ruleId] }
}

export function encodeSubmitGuestProfile(params: {
  guest_ref: string
  loyalty_tier: string
  stay_count: number
  total_spend_band: string
  reviews: string[]
  conversation_log: string[]
  special_requests: string[]
  dietary_needs: string[]
  room_history: string[]
  language: string
}) {
  return {
    fn: "submit_guest_profile",
    args: [
      params.guest_ref,
      params.loyalty_tier,
      params.stay_count,
      params.total_spend_band,
      params.reviews,
      params.conversation_log,
      params.special_requests,
      params.dietary_needs,
      params.room_history,
      params.language,
    ],
  }
}

export function encodeRequestRecommendation(guestId: string) {
  return { fn: "request_recommendation", args: [guestId] }
}

export function encodeResolveEscalation(params: {
  escalation_id: string
  resolution: string
  resolution_note: string
}) {
  return {
    fn: "resolve_escalation",
    args: [params.escalation_id, params.resolution, params.resolution_note],
  }
}
