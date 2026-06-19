"use client"

import { useState } from "react"
import { useHotelRecommendations, useHotelRecommendationsByStatus } from "@/hooks/useRecommendations"
import { CheckCircle, XCircle, AlertCircle, Clock, Filter } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Recommendation } from "@/types/contract"

const STATUS_OPTIONS = ["all", "approved", "rejected", "escalated", "pending"]

function StatusIcon({ status }: { status: string }) {
  if (status === "approved")  return <CheckCircle className="w-3.5 h-3.5 text-success" />
  if (status === "rejected")  return <XCircle className="w-3.5 h-3.5 text-danger" />
  if (status === "escalated") return <AlertCircle className="w-3.5 h-3.5 text-warning" />
  return <Clock className="w-3.5 h-3.5 text-gold" />
}

function RecRow({ rec }: { rec: Recommendation }) {
  const scoreColor =
    Number(rec.alignment_score) >= 75 ? "text-success" :
    Number(rec.alignment_score) >= 45 ? "text-warning" : "text-danger"

  return (
    <div className="glass-card rounded-xl px-5 py-4 flex items-start gap-4">
      <StatusIcon status={rec.status} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-0.5">
          <span className="text-ivory text-sm font-medium">{rec.suggested_room ?? "—"}</span>
          <span className="mono-text text-gold-dim border border-border-gold rounded px-1.5 text-xs">{rec.status}</span>
        </div>
        <p className="text-ivory-dim text-xs mono-text">{rec.rec_id} · Guest: {rec.guest_id}</p>
        {rec.justification && (
          <p className="text-ivory-faint text-xs mt-1 truncate max-w-md">{rec.justification}</p>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className={cn("mono-text font-medium", scoreColor)}>{rec.alignment_score ?? "—"}</p>
        <p className="text-ivory-faint text-xs">score</p>
      </div>
    </div>
  )
}

export default function AuditPage() {
  const [filter, setFilter] = useState("all")
  const { data: allRecs = [], isLoading: allLoading, refetch } = useHotelRecommendations()

  const displayed = filter === "all" ? allRecs : allRecs.filter((r) => r.status === filter)

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-text text-gold mb-1">Immutable Record</p>
          <h1 className="display-text text-4xl font-light text-ivory">Recommendation History</h1>
          <p className="text-ivory-dim text-sm mt-1">Every recommendation verdict stored on-chain via GenLayer.</p>
        </div>
        <button onClick={() => refetch()} className="btn-ghost text-xs">Refresh</button>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 flex-wrap">
        <Filter className="w-3.5 h-3.5 text-ivory-dim mr-1" />
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={cn(
              "mono-text px-3 py-1.5 rounded text-xs transition-colors capitalize",
              filter === s
                ? "bg-gold/10 text-gold border border-gold/20"
                : "text-ivory-dim hover:text-ivory hover:bg-card"
            )}
          >
            {s}
          </button>
        ))}
      </div>

      {allLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => <div key={i} className="h-16 shimmer-bg rounded-xl" />)}
        </div>
      ) : displayed.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="display-text text-2xl text-ivory mb-2">No records</p>
          <p className="text-ivory-dim text-sm">No recommendations match this filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map((rec) => <RecRow key={rec.rec_id} rec={rec} />)}
        </div>
      )}
    </div>
  )
}
