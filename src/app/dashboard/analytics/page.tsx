"use client"

import { useHotelStats } from "@/hooks/useHotel"
import { useHotelRecommendations } from "@/hooks/useRecommendations"
import { CheckCircle, XCircle, AlertCircle, Clock, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

function StatTile({ label, value, sub, color }: { label: string; value: string | number; sub?: string; color?: string }) {
  return (
    <div className="glass-card rounded-xl p-5">
      <p className="text-ivory-dim text-xs mb-3">{label}</p>
      <p className={cn("display-text text-4xl font-light", color ?? "text-ivory")}>{value}</p>
      {sub && <p className="text-ivory-faint text-xs mt-1 mono-text">{sub}</p>}
    </div>
  )
}

export default function AnalyticsPage() {
  const { data: stats, isLoading } = useHotelStats()
  const { data: recs = [] } = useHotelRecommendations()

  const approved  = recs.filter((r) => r.status === "approved").length
  const rejected  = recs.filter((r) => r.status === "rejected").length
  const escalated = recs.filter((r) => r.status === "escalated").length
  const pending   = recs.filter((r) => r.status === "pending").length
  const total     = recs.length

  const scores = recs
    .map((r) => Number(r.alignment_score))
    .filter((s) => !isNaN(s) && s > 0)
  const avgScore = scores.length > 0
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0

  const DIMENSION_LABELS = [
    { key: "preference_alignment",     label: "Preference Alignment",     weight: 40 },
    { key: "loyalty_appropriateness",  label: "Loyalty Appropriateness",  weight: 20 },
    { key: "special_request_coverage", label: "Special Request Coverage", weight: 20 },
    { key: "inventory_validity",       label: "Inventory Validity",       weight: 10 },
    { key: "upsell_relevance",         label: "Upsell Relevance",         weight: 10 },
  ]

  const dimAverages = DIMENSION_LABELS.map(({ key, label, weight }) => {
    const vals = recs
      .map((r) => Number((r.dimension_scores as Record<string, unknown>)?.[key] ?? 0))
      .filter((v) => v > 0)
    const avg = vals.length > 0 ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0
    return { key, label, weight, avg }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="mono-text text-gold mb-1">Performance</p>
        <h1 className="display-text text-4xl font-light text-ivory">Analytics</h1>
        <p className="text-ivory-dim text-sm mt-1">
          Aggregated validator consensus data from your hotel's recommendation history.
        </p>
      </div>

      {/* Top stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatTile label="Total Guests" value={stats?.total_guests ?? "—"} color="text-gold" />
        <StatTile label="Total Recommendations" value={stats?.total_recommendations ?? "—"} />
        <StatTile label="Avg Alignment Score" value={avgScore || "—"} sub="across all recs" color={avgScore >= 75 ? "text-success" : avgScore >= 45 ? "text-warning" : "text-danger"} />
        <StatTile label="Pending Escalations" value={stats?.pending_escalations ?? escalated} color="text-warning" />
      </div>

      {/* Verdict breakdown */}
      {total > 0 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <p className="mono-text text-gold mb-2">Verdict Breakdown</p>
          {[
            { label: "Approved", count: approved, icon: <CheckCircle className="w-4 h-4 text-success" />, color: "bg-success" },
            { label: "Escalated", count: escalated, icon: <AlertCircle className="w-4 h-4 text-warning" />, color: "bg-warning" },
            { label: "Rejected", count: rejected, icon: <XCircle className="w-4 h-4 text-danger" />, color: "bg-danger" },
            { label: "Pending", count: pending, icon: <Clock className="w-4 h-4 text-gold" />, color: "bg-gold" },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-ivory-dim">{item.label}</span>
                </div>
                <span className="mono-text text-ivory">{item.count} / {total} ({total > 0 ? Math.round((item.count / total) * 100) : 0}%)</span>
              </div>
              <div className="h-1.5 bg-card-hi rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full transition-all", item.color)}
                  style={{ width: `${total > 0 ? (item.count / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dimension averages */}
      {recs.length > 0 && (
        <div className="glass-card rounded-xl p-6 space-y-4">
          <p className="mono-text text-gold mb-2">Average Dimension Scores</p>
          {dimAverages.map((d) => (
            <div key={d.key}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-ivory-dim">{d.label} <span className="text-ivory-faint">({d.weight}% weight)</span></span>
                <span className={cn("mono-text font-medium",
                  d.avg >= 75 ? "text-success" : d.avg >= 45 ? "text-warning" : d.avg > 0 ? "text-danger" : "text-ivory-faint"
                )}>{d.avg || "—"}</span>
              </div>
              <div className="h-1.5 bg-card-hi rounded-full overflow-hidden">
                <div
                  className={cn("h-full rounded-full",
                    d.avg >= 75 ? "bg-success" : d.avg >= 45 ? "bg-warning" : d.avg > 0 ? "bg-danger" : "bg-card-hi"
                  )}
                  style={{ width: `${d.avg}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {recs.length === 0 && !isLoading && (
        <div className="glass-card rounded-xl p-12 text-center">
          <TrendingUp className="w-8 h-8 text-gold/20 mx-auto mb-3" />
          <p className="display-text text-2xl text-ivory mb-2">No data yet</p>
          <p className="text-ivory-dim text-sm">Analytics populate once recommendations have been validated.</p>
        </div>
      )}
    </div>
  )
}
