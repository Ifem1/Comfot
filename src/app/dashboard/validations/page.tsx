"use client"

import { useState } from "react"
import { usePendingEscalations, useResolveEscalation } from "@/hooks/useRecommendations"
import { AlertCircle, CheckCircle, XCircle } from "lucide-react"
import { studioTxLink } from "@/lib/genlayer/config"
import type { Escalation } from "@/types/contract"

function EscalationCard({ esc }: { esc: Escalation }) {
  const resolve = useResolveEscalation()
  const [note, setNote] = useState("")
  const [resolving, setResolving] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handle = async (decision: "approved" | "rejected") => {
    setResolving(true)
    try {
      const hash = await resolve(esc.escalation_id, decision, note)
      setTxHash(hash)
    } finally {
      setResolving(false)
    }
  }

  return (
    <div className="glass-card rounded-xl p-6 border border-warning/10 space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <AlertCircle className="w-4 h-4 text-warning" />
            <span className="mono-text text-warning font-medium">ESCALATED</span>
          </div>
          <p className="text-ivory text-sm font-medium">{esc.escalation_id}</p>
          <p className="text-ivory-dim text-xs mono-text">Rec: {esc.rec_id} · Guest: {esc.guest_id}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="mono-text text-gold text-lg">{esc.alignment_score ?? "—"}</p>
          <p className="text-ivory-dim text-xs">alignment score</p>
        </div>
      </div>

      {esc.escalation_reason && (
        <div className="bg-card-hi rounded px-4 py-3">
          <p className="text-ivory-dim text-xs leading-relaxed">{esc.escalation_reason}</p>
        </div>
      )}

      {txHash ? (
        <div className="border-t border-border pt-4">
          <p className="text-success text-xs mb-1">Resolution submitted</p>
          <a href={studioTxLink(txHash)} target="_blank" rel="noopener noreferrer" className="mono-text text-xs text-gold-dim hover:text-gold break-all">{txHash}</a>
        </div>
      ) : (
        <div className="border-t border-border pt-4 space-y-3">
          <div>
            <label className="label-dark">Reviewer Note</label>
            <textarea
              className="input-dark h-16 resize-none"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add context for this decision…"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => handle("approved")}
              disabled={resolving}
              className="flex-1 flex items-center justify-center gap-2 bg-success/10 border border-success/20 text-success rounded px-4 py-2.5 text-sm hover:bg-success/20 transition-colors disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" /> Approve
            </button>
            <button
              onClick={() => handle("rejected")}
              disabled={resolving}
              className="flex-1 flex items-center justify-center gap-2 bg-danger/10 border border-danger/20 text-danger rounded px-4 py-2.5 text-sm hover:bg-danger/20 transition-colors disabled:opacity-50"
            >
              <XCircle className="w-4 h-4" /> Reject
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ValidationsPage() {
  const { data: escalations = [], isLoading, refetch } = usePendingEscalations()

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-text text-gold mb-1">Human Review Queue</p>
          <h1 className="display-text text-4xl font-light text-ivory">Escalation Desk</h1>
          <p className="text-ivory-dim text-sm mt-1">
            Recommendations where validators could not reach confident consensus (score 45–74).
          </p>
        </div>
        <button onClick={() => refetch()} className="btn-ghost text-xs">Refresh</button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-40 shimmer-bg rounded-xl" />)}
        </div>
      ) : escalations.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <CheckCircle className="w-8 h-8 text-success/30 mx-auto mb-3" />
          <p className="display-text text-2xl text-ivory mb-2">No pending escalations</p>
          <p className="text-ivory-dim text-sm">All recommendations have reached validator consensus.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {escalations.map((esc) => (
            <EscalationCard key={esc.escalation_id} esc={esc} />
          ))}
        </div>
      )}
    </div>
  )
}
