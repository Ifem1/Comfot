"use client"

import { useEffect, useCallback, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { pollTransaction, isSuccess, type TxStatus, type PendingTx } from "@/lib/genlayer/txPoller"
import { useTxStore } from "@/store/useTxStore"
import { studioTxLink } from "@/lib/genlayer/config"

const STATUS_LABELS: Record<TxStatus, string> = {
  pending:      "Waiting for validators…",
  proposing:    "Leader proposing…",
  committing:   "Validators committing…",
  revealing:    "Validators revealing votes…",
  accepted:     "Accepted — finalizing…",
  finalized:    "Finalized ✓",
  canceled:     "Transaction canceled",
  undetermined: "Consensus undetermined",
  timeout:      "Validators timed out",
  error:        "Error",
}

export interface TxTrackOptions {
  invalidateKeys?: string[][]
  /** Called after tx finalizes for client-side cache refreshes or other side-effects */
  onFinalized?: (status: TxStatus) => void
}

/**
 * Call this once per write action to submit a tx to the polling system.
 * Returns a `track(hash, label, options)` function.
 */
export function useTxTracker() {
  const { addTx, updateStatus, finalizeTx } = useTxStore()
  const qc = useQueryClient()

  const track = useCallback((
    hash: string,
    label: string,
    invalidateKeys: string[][] | TxTrackOptions = [],
  ) => {
    // support both old array form and new options object form
    const opts: TxTrackOptions = Array.isArray(invalidateKeys)
      ? { invalidateKeys }
      : invalidateKeys
    const tx: PendingTx = {
      hash,
      label,
      status: "pending",
      startedAt: Date.now(),
      invalidateKeys: opts.invalidateKeys ?? [],
    }
    addTx(tx)

    const toastId = toast.loading(`${label} — waiting for validators…`, {
      description: `${hash.slice(0, 20)}… · view on Studio`,
      duration: Infinity,
    })

    const cancel = pollTransaction(hash, {
      onStatusChange: (status) => {
        updateStatus(hash, status)
        toast.loading(`${label} — ${STATUS_LABELS[status]}`, {
          id: toastId,
          duration: Infinity,
        })
      },
      onFinalized: (status) => {
        finalizeTx(hash, status)
        if (isSuccess(status)) {
          toast.success(`${label} — confirmed`, {
            id: toastId,
            duration: 6000,
            description: `Finalized · ${studioTxLink(hash)}`,
          })
          for (const key of opts.invalidateKeys ?? []) {
            qc.invalidateQueries({ queryKey: key })
          }
        } else {
          toast.error(`${label} — ${STATUS_LABELS[status]}`, {
            id: toastId,
            duration: 8000,
          })
        }
        opts.onFinalized?.(status)
      },
      onError: (err) => {
        updateStatus(hash, "error", err)
        toast.error(`${label} — polling error`, {
          id: toastId,
          description: err,
          duration: 8000,
        })
      },
    })

    return cancel
  }, [addTx, updateStatus, finalizeTx, qc])

  return { track }
}

/**
 * Resumes polling for any in-flight txs from a previous session.
 * Mount this once in the dashboard layout.
 */
export function useTxRecovery() {
  const { txs, updateStatus, finalizeTx } = useTxStore()
  const qc = useQueryClient()
  const recovered = useRef<Set<string>>(new Set())

  useEffect(() => {
    for (const tx of Object.values(txs)) {
      if (recovered.current.has(tx.hash)) continue
      if (["finalized", "accepted", "canceled", "undetermined", "timeout", "error"].includes(tx.status)) continue

      // tx was in-flight when the page was closed — resume polling silently
      recovered.current.add(tx.hash)

      const toastId = toast.loading(`${tx.label} — resuming…`, { duration: Infinity })

      pollTransaction(tx.hash, {
        onStatusChange: (status) => {
          updateStatus(tx.hash, status)
          toast.loading(`${tx.label} — ${STATUS_LABELS[status]}`, { id: toastId, duration: Infinity })
        },
        onFinalized: (status) => {
          finalizeTx(tx.hash, status)
          if (isSuccess(status)) {
            toast.success(`${tx.label} — confirmed`, { id: toastId, duration: 6000 })
            for (const key of tx.invalidateKeys ?? []) {
              qc.invalidateQueries({ queryKey: key })
            }
          } else {
            toast.error(`${tx.label} — ${STATUS_LABELS[status]}`, { id: toastId, duration: 6000 })
          }
        },
        onError: (err) => {
          updateStatus(tx.hash, "error", err)
          toast.error(`${tx.label} — ${err}`, { id: toastId, duration: 6000 })
        },
      })
    }
  }, []) // run once on mount
}
