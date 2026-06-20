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
import { encodeFunctionData } from "viem"
import type { CalldataEncodable } from "genlayer-js/types"
import { GENLAYER_CONTRACT_ADDRESS, STUDIO_NET } from "./config"

// Use the SDK's built-in studionet chain (has isStudio:true + consensusMainContract ABI
// needed for getTransaction status polling to work correctly)
const CHAIN = chains.studionet ?? STUDIO_NET

// ABI for GenLayer's consensus contract addTransaction function
const ADD_TRANSACTION_ABI = [
  {
    type: "function" as const,
    name: "addTransaction",
    stateMutability: "nonpayable" as const,
    inputs: [
      { name: "_sender", type: "address" as const },
      { name: "_recipient", type: "address" as const },
      { name: "_numOfInitialValidators", type: "uint256" as const },
      { name: "_maxRotations", type: "uint256" as const },
      { name: "_txData", type: "bytes" as const },
    ],
    outputs: [],
  },
]
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

// Contract stores all addresses lowercase — normalise before querying
function addr(a: string): string {
  return a.toLowerCase()
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
// WRITE — replicates SDK writeContract flow without _sendTransaction
// which has a BigInt nonce bug when using injected providers.
//
// GenLayer intelligent contract calls go to the consensus contract
// (not directly to the intelligent contract address). The call is:
//   consensusContract.addTransaction(sender, recipient, validators, rotations, txData)
// where txData = genlayer-js-encoded [calldata, leaderOnly=false].
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
  const from = accounts[0] as `0x${string}`

  // Step 1: encode the intelligent contract calldata in GenLayer format
  const calldataObj = glAbi.calldata.makeCalldataObject(functionName, args, undefined)
  const encoded = glAbi.calldata.encode(calldataObj)
  const txData = glAbi.transactions.serialize([encoded, false]) // [calldata, leaderOnly=false]

  // Step 2: encode the addTransaction call targeting the consensus contract
  const consensusAddress = CHAIN.consensusMainContract!.address as `0x${string}`
  const callData = encodeFunctionData({
    abi: ADD_TRANSACTION_ABI,
    functionName: "addTransaction",
    args: [
      from,
      GENLAYER_CONTRACT_ADDRESS,
      BigInt(CHAIN.defaultNumberOfInitialValidators ?? 5),
      BigInt(CHAIN.defaultConsensusMaxRotations ?? 3),
      txData as `0x${string}`,
    ],
  })

  // Step 3: send to the consensus contract via MetaMask
  const txHash: string = await provider.request({
    method: "eth_sendTransaction",
    params: [{
      from,
      to: consensusAddress,
      data: callData,
      value: "0x0",
    }],
  })
  return txHash
}

// ─────────────────────────────────────────────────────────────
// READ METHODS
// ─────────────────────────────────────────────────────────────

export async function getHotel(hotelAddress: string): Promise<Hotel | null> {
  const result = await read<Hotel>("get_hotel", [addr(hotelAddress)])
  return nonEmpty(result)
}

export async function getGuest(guestId: string): Promise<Guest | null> {
  const result = await read<Guest>("get_guest", [guestId])
  return nonEmpty(result)
}

export async function getGuestId(hotelAddress: string, guestRef: string): Promise<string> {
  return read<string>("get_guest_id", [addr(hotelAddress), guestRef])
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
  const result = await read<string[]>("get_hotel_guest_ids", [addr(hotelAddress)])
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
  const result = await read<Recommendation[]>("get_hotel_recommendations", [addr(hotelAddress)])
  return result ?? []
}

export async function getHotelRecommendationsByStatus(
  hotelAddress: string,
  status: string
): Promise<Recommendation[]> {
  const result = await read<Recommendation[]>("get_hotel_recommendations_by_status", [addr(hotelAddress), status])
  return result ?? []
}

export async function getHotelEscalations(hotelAddress: string): Promise<Escalation[]> {
  const result = await read<Escalation[]>("get_hotel_escalations", [addr(hotelAddress)])
  return result ?? []
}

export async function getPendingEscalations(hotelAddress: string): Promise<Escalation[]> {
  const result = await read<Escalation[]>("get_pending_escalations", [addr(hotelAddress)])
  return result ?? []
}

export async function getPreferenceRules(hotelAddress: string): Promise<PreferenceRule[]> {
  const result = await read<PreferenceRule[]>("get_preference_rules", [addr(hotelAddress)])
  return result ?? []
}

export async function getHotelStats(hotelAddress: string): Promise<HotelStats | null> {
  const result = await read<HotelStats>("get_hotel_stats", [addr(hotelAddress)])
  return nonEmpty(result)
}

export async function getGlobalStats(): Promise<GlobalStats> {
  return read<GlobalStats>("get_global_stats")
}
