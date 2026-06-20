"use client"

import { useState } from "react"
import { useTxStore } from "@/store/useTxStore"
import { isSuccess, isDecided, type TxStatus } from "@/lib/genlayer/txPoller"
import { studioTxLink } from "@/lib/genlayer/config"
import { Activity, CheckCircle, XCircle, Loader2, Clock, ChevronDown, X } from "lucide-react"
import { cn } from "@/lib/utils"

const STATUS_LABEL: Record<TxStatus, string> = {
  pending:      "Pending",
  proposing:    "Proposing",
  committing:   "Committing",
  revealing:    "Revealing",
  accepted:     "Accepted",
  finalized:    "Finalized",
  canceled:     "Canceled",
  undetermined: "Undetermined",
  timeout:      "Timed out",
  error:        "Error",
}

function StatusIcon({ status }: { status: TxStatus }) {
  if (status === "finalized" || status === "accepted")
    return <CheckCircle className="w-3.5 h-3.5 text-success shrink-0" />
  if (status === "canceled" || status === "undetermined" || status === "error")
    return <XCircle className="w-3.5 h-3.5 text-danger shrink-0" />
  if (status === "timeout")
    return <Clock className="w-3.5 h-3.5 text-warning shrink-0" />
  return <Loader2 className="w-3.5 h-3.5 text-gold shrink-0 animate-spin" />
}

export function TxTray() {
  const { txs, dismissTx, clearDecided } = useTxStore()
  const [open, setOpen] = useState(false)

  const list = Object.values(txs).sort((a, b) => b.startedAt - a.startedAt)
  const inFlight = list.filter((t) => !isDecided(t.status))
  const hasAny = list.length > 0

  if (!hasAny) return null

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2 border rounded px-3 py-2 text-xs transition-colors",
          inFlight.length > 0
            ? "border-gold/30 bg-gold/5 text-gold hover:bg-gold/10"
            : "border-border bg-card text-ivory-dim hover:text-ivory"
        )}
      >
        {inFlight.length > 0
          ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
          : <Activity className="w-3.5 h-3.5" />}
        <span className="mono-text">
          {inFlight.length > 0 ? `${inFlight.length} in consensus` : `${list.length} tx`}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-10 w-80 bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border">
              <span className="text-xs font-medium text-ivory">Transactions</span>
              {list.some((t) => isDecided(t.status)) && (
                <button
                  onClick={clearDecided}
                  className="text-xs text-ivory-dim hover:text-ivory"
                >
                  Clear decided
                </button>
              )}
            </div>

            <div className="max-h-72 overflow-y-auto">
              {list.map((tx) => (
                <div
                  key={tx.hash}
                  className="flex items-start gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-card-hi transition-colors"
                >
                  <StatusIcon status={tx.status} />
                  <div className="flex-1 min-w-0">
                    <p className="text-ivory text-xs font-medium truncate">{tx.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className={cn(
                        "mono-text text-xs",
                        isSuccess(tx.status) ? "text-success" :
                        tx.status === "error" || tx.status === "canceled" ? "text-danger" :
                        tx.status === "timeout" ? "text-warning" : "text-gold-dim"
                      )}>
                        {STATUS_LABEL[tx.status]}
                      </span>
                      <a
                        href={studioTxLink(tx.hash)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono-text text-xs text-ivory-faint hover:text-gold truncate max-w-[100px]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {tx.hash.slice(0, 10)}…
                      </a>
                    </div>
                    {tx.error && (
                      <p className="text-danger text-xs mt-0.5 truncate">{tx.error}</p>
                    )}
                  </div>
                  {isDecided(tx.status) && (
                    <button
                      onClick={() => dismissTx(tx.hash)}
                      className="shrink-0 text-ivory-faint hover:text-ivory"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
