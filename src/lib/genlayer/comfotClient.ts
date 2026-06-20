/**
 * Comfot — GenLayer Contract Client (genlayer-js v1.1.8)
 *
 * Reads  → client.readContract()  (free, no gas, no wallet needed)
 * Writes → client.writeContract() (requires connected wallet via provider)
 *
 * Contract: 0x28351D10CfEb51197ab4E76282d54E65cea033c9
 * Network : StudioNet (chainId 61999)
 */

import { createClient, abi as glAbi, chains } from "genlayer-js"
import type { CalldataEncodable } from "genlayer-js/types"
import { GENLAYER_CONTRACT_ADDRESS, STUDIO_NET } from "./config"

// Use the SDK's built-in studionet chain (has isStudio:true + consensusMainContract ABI
// needed for getTransaction status polling to work correctly)
const CHAIN = chains.studionet ?? STUDIO_NET
import type {
  Hotel, Guest, Recommendation, Validation,
  Escalation, PreferenceRule, HotelStats, GlobalStats,
} from "@/types/contract"

// ─────────────────────────────────────────────────────────────
// CLIENT FACTORY
// A read-only client is always available (no wallet).
// A write client is created on-demand with the injected provider.
// ─────────────────────────────────────────────────────────────

let _readClient: ReturnType<typeof createClient> | null = null

function getReadClient() {
  if (!_readClient) {
    _readClient = createClient({
      chain: CHAIN,
      endpoint: CHAIN.rpcUrls.default.http[0],
    })
  }
  return _readClient
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────

function nonEmpty<T extends object>(val: T | null | undefined): T | null {
  if (!val) return null
  if (typeof val === "object" && Object.keys(val).length === 0) return null
  return val
}

async function read<T = CalldataEncodable>(
  functionName: string,
  args: CalldataEncodable[] = []
): Promise<T> {
  const client = getReadClient()
  const result = await client.readContract({
    address: GENLAYER_CONTRACT_ADDRESS,
    functionName,
    args,
    jsonSafeReturn: true,
  })
  return result as T
}

// ─────────────────────────────────────────────────────────────
// WRITE — encode via genlayer-js abi utilities, send via MetaMask
// Bypasses client.writeContract() which fails on StudioNet (BigInt
// conversion bug in SDK gas/nonce handling with injected provider).
// ─────────────────────────────────────────────────────────────

export async function writeContract(
  functionName: string,
  args: CalldataEncodable[] = []
): Promise<string> {
  if (typeof window === "undefined" || !window.ethereum) {
    throw new Error("No injected wallet found. Please install MetaMask.")
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const provider = window.ethereum as any
  const accounts: string[] = await provider.request({ method: "eth_requestAccounts" })
  if (!accounts || accounts.length === 0) {
    throw new Error("No wallet account connected. Please connect MetaMask first.")
  }

  // Encode calldata using genlayer-js ABI utilities
  const calldataObj = glAbi.calldata.makeCalldataObject(functionName, args, undefined)
  const encoded = glAbi.calldata.encode(calldataObj)
  const data = glAbi.transactions.serializeOne(encoded)

  // Send via MetaMask → StudioNet RPC endpoint
  const txHash: string = await provider.request({
    method: "eth_sendTransaction",
    params: [{
      from: accounts[0],
      to: GENLAYER_CONTRACT_ADDRESS,
      data,
      value: "0x0",
    }],
  })
  return txHash
}

// ─────────────────────────────────────────────────────────────
// READ METHODS
// ─────────────────────────────────────────────────────────────

export async function getHotel(hotelAddress: string): Promise<Hotel | null> {
  const result = await read<Hotel>("get_hotel", [hotelAddress])
  return nonEmpty(result)
}

export async function getGuest(guestId: string): Promise<Guest | null> {
  const result = await read<Guest>("get_guest", [guestId])
  return nonEmpty(result)
}

export async function getGuestId(hotelAddress: string, guestRef: string): Promise<string> {
  return read<string>("get_guest_id", [hotelAddress, guestRef])
}

export async function getRecommendation(recId: string): Promise<Recommendation | null> {
  const result = await read<Recommendation>("get_recommendation", [recId])
  return nonEmpty(result)
}

export async function getValidation(validationId: string): Promise<Validation | null> {
  const result = await read<Validation>("get_validation", [validationId])
  return nonEmpty(result)
}

export async function getValidationForRecommendation(recId: string): Promise<Validation | null> {
  const result = await read<Validation>("get_validation_for_recommendation", [recId])
  return nonEmpty(result)
}

export async function getEscalation(escalationId: string): Promise<Escalation | null> {
  const result = await read<Escalation>("get_escalation", [escalationId])
  return nonEmpty(result)
}

export async function getHotelGuestIds(hotelAddress: string): Promise<string[]> {
  const result = await read<string[]>("get_hotel_guest_ids", [hotelAddress])
  return result ?? []
}

export async function getGuestRecommendationIds(guestId: string): Promise<string[]> {
  const result = await read<string[]>("get_guest_recommendation_ids", [guestId])
  return result ?? []
}

export async function getGuestRecommendations(guestId: string): Promise<Recommendation[]> {
  const result = await read<Recommendation[]>("get_guest_recommendations", [guestId])
  return result ?? []
}

export async function getHotelRecommendations(hotelAddress: string): Promise<Recommendation[]> {
  const result = await read<Recommendation[]>("get_hotel_recommendations", [hotelAddress])
  return result ?? []
}

export async function getHotelRecommendationsByStatus(
  hotelAddress: string,
  status: string
): Promise<Recommendation[]> {
  const result = await read<Recommendation[]>("get_hotel_recommendations_by_status", [hotelAddress, status])
  return result ?? []
}

export async function getHotelEscalations(hotelAddress: string): Promise<Escalation[]> {
  const result = await read<Escalation[]>("get_hotel_escalations", [hotelAddress])
  return result ?? []
}

export async function getPendingEscalations(hotelAddress: string): Promise<Escalation[]> {
  const result = await read<Escalation[]>("get_pending_escalations", [hotelAddress])
  return result ?? []
}

export async function getPreferenceRules(hotelAddress: string): Promise<PreferenceRule[]> {
  const result = await read<PreferenceRule[]>("get_preference_rules", [hotelAddress])
  return result ?? []
}

export async function getHotelStats(hotelAddress: string): Promise<HotelStats | null> {
  const result = await read<HotelStats>("get_hotel_stats", [hotelAddress])
  return nonEmpty(result)
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return read<GlobalStats>("get_global_stats")
}
