/**
 * Transaction Poller — genlayer-js v1.1.8
 *
 * GenLayer write transactions go through multi-validator consensus.
 * A tx hash is returned immediately but the result isn't final until
 * the status reaches FINALIZED (or ACCEPTED). This module polls
 * getTransaction() until a decided state is reached, then calls back.
 *
 * Lifecycle:
 *   PENDING → PROPOSING → COMMITTING → REVEALING → ACCEPTED → FINALIZED
 *   (or CANCELED / UNDETERMINED on failure)
 */

import { createClient, chains } from "genlayer-js"
import { STUDIO_NET } from "./config"

const CHAIN = chains.studionet ?? STUDIO_NET
import type { TransactionStatus } from "genlayer-js/types"

export type TxStatus =
  | "pending"
  | "proposing"
  | "committing"
  | "revealing"
  | "accepted"
  | "finalized"
  | "canceled"
  | "undetermined"
  | "timeout"
  | "error"

export interface PendingTx {
  hash: string
  label: string                    // human-readable description e.g. "Register hotel"
  status: TxStatus
  startedAt: number                // Date.now()
  finalizedAt?: number
  error?: string
  /** query keys to invalidate when finalized */
  invalidateKeys?: string[][]
}

// ─────────────────────────────────────────────────────────────
// Status mapping from SDK TransactionStatus enum
// ─────────────────────────────────────────────────────────────

const DECIDED: Set<string> = new Set([
  "FINALIZED", "ACCEPTED", "CANCELED", "UNDETERMINED",
  "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT",
])

function sdkStatusToLocal(s: string | undefined): TxStatus {
  switch (s?.toUpperCase()) {
    case "PENDING":           return "pending"
    case "PROPOSING":         return "proposing"
    case "COMMITTING":        return "committing"
    case "REVEALING":         return "revealing"
    case "APPEAL_COMMITTING": return "committing"
    case "APPEAL_REVEALING":  return "revealing"
    case "READY_TO_FINALIZE": return "accepted"
    case "ACCEPTED":          return "accepted"
    case "FINALIZED":         return "finalized"
    case "CANCELED":          return "canceled"
    case "UNDETERMINED":      return "undetermined"
    case "VALIDATORS_TIMEOUT":
    case "LEADER_TIMEOUT":    return "timeout"
    default:                  return "pending"
  }
}

export function isDecided(status: TxStatus): boolean {
  return ["finalized", "accepted", "canceled", "undetermined", "timeout", "error"].includes(status)
}

export function isSuccess(status: TxStatus): boolean {
  return status === "finalized" || status === "accepted"
}

// ─────────────────────────────────────────────────────────────
// Poller — call this once per tx hash
// ─────────────────────────────────────────────────────────────

const POLL_INTERVAL_MS = 3000
const MAX_RETRIES = 200  // 3s × 200 = 10 min — GenLayer consensus can take several minutes

let _client: ReturnType<typeof createClient> | null = null
function getClient() {
  if (!_client) {
    _client = createClient({
      chain: CHAIN,
      endpoint: CHAIN.rpcUrls.default.http[0],
    })
  }
  return _client
}

export interface PollCallbacks {
  onStatusChange: (status: TxStatus) => void
  onFinalized: (status: TxStatus) => void
  onError: (err: string) => void
}

export function pollTransaction(
  hash: string,
  callbacks: PollCallbacks
): () => void {
  let retries = 0
  let stopped = false
  let timer: ReturnType<typeof setTimeout>

  const tick = async () => {
    if (stopped) return
    try {
      const client = getClient()
      const tx = await client.getTransaction({ hash: hash as `0x${string}` & { length: 66 } })
      const rawStatus = typeof tx.status === "number"
        ? (tx.statusName as string | undefined)
        : (tx.status as string | undefined)

      const localStatus = sdkStatusToLocal(rawStatus)
      callbacks.onStatusChange(localStatus)

      if (isDecided(localStatus)) {
        callbacks.onFinalized(localStatus)
        return
      }
    } catch (err) {
      // transient RPC errors are expected during consensus — only give up after max retries
      if (retries >= MAX_RETRIES) {
        callbacks.onError(err instanceof Error ? err.message : "Polling timed out")
        return
      }
    }

    retries++
    if (retries >= MAX_RETRIES) {
      callbacks.onFinalized("timeout")
      return
    }

    if (!stopped) {
      timer = setTimeout(tick, POLL_INTERVAL_MS)
    }
  }

  // start immediately
  timer = setTimeout(tick, 1000)

  // return a cancel function
  return () => {
    stopped = true
    clearTimeout(timer)
  }
}
