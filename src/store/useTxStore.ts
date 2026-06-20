import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { PendingTx, TxStatus } from "@/lib/genlayer/txPoller"

interface TxStore {
  txs: Record<string, PendingTx>   // keyed by hash
  addTx: (tx: PendingTx) => void
  updateStatus: (hash: string, status: TxStatus, error?: string) => void
  finalizeTx: (hash: string, status: TxStatus) => void
  dismissTx: (hash: string) => void
  clearDecided: () => void
}

export const useTxStore = create<TxStore>()(
  persist(
    (set) => ({
      txs: {},

      addTx: (tx) =>
        set((s) => ({ txs: { ...s.txs, [tx.hash]: tx } })),

      updateStatus: (hash, status, error) =>
        set((s) => ({
          txs: {
            ...s.txs,
            [hash]: { ...s.txs[hash], status, ...(error ? { error } : {}) },
          },
        })),

      finalizeTx: (hash, status) =>
        set((s) => ({
          txs: {
            ...s.txs,
            [hash]: { ...s.txs[hash], status, finalizedAt: Date.now() },
          },
        })),

      dismissTx: (hash) =>
        set((s) => {
          const next = { ...s.txs }
          delete next[hash]
          return { txs: next }
        }),

      clearDecided: () =>
        set((s) => {
          const next: Record<string, PendingTx> = {}
          for (const [k, v] of Object.entries(s.txs)) {
            if (!["finalized", "accepted", "canceled", "undetermined", "timeout", "error"].includes(v.status)) {
              next[k] = v
            }
          }
          return { txs: next }
        }),
    }),
    {
      name: "comfot-txs",
      // only persist the last 20 txs to avoid bloating localStorage
      partialize: (s) => ({
        txs: Object.fromEntries(Object.entries(s.txs).slice(-20)),
      }),
    }
  )
)
