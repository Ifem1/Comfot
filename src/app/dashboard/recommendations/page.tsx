"use client"

import { useState } from "react"
import { useGuests } from "@/hooks/useGuests"
import { useHotelRecommendations, useRequestRecommendation, useValidationForRecommendation } from "@/hooks/useRecommendations"
import { useHotel } from "@/hooks/useHotel"
import { CheckCircle, XCircle, AlertCircle, Clock, Sparkles, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { studioTxLink } from "@/lib/genlayer/config"
import type { Recommendation, Validation } from "@/types/contract"

function VerdictBadge({ status }: { status: string }) {
  const map: Record<string, { cls: string; icon: React.ReactNode; label: string }> = {
    approved:  { cls: "verdict-approved",  icon: <CheckCircle className="w-3.5 h-3.5" />,  label: "APPROVED"  },
    rejected:  { cls: "verdict-rejected",  icon: <XCircle className="w-3.5 h-3.5" />,      label: "REJECTED"  },
    escalated: { cls: "verdict-escalated", icon: <AlertCircle className="w-3.5 h-3.5" />,  label: "ESCALATED" },
    pending:   { cls: "verdict-pending",   icon: <Clock className="w-3.5 h-3.5" />,        label: "PENDING"   },
  }
  const v = map[status] ?? map.pending
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded mono-text font-medium", v.cls)}>
      {v.icon} {v.label}
    </span>
  )
}

function ScoreBar({ label, score, weight }: { label: string; score: number; weight: number }) {
  const pct = Math.round(score)
  const color = pct >= 75 ? "bg-success" : pct >= 45 ? "bg-warning" : "bg-danger"
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-ivory-dim">{label}</span>
        <span className="mono-text text-ivory">{pct} <span className="text-ivory-faint">({weight}%)</span></span>
      </div>
      <div className="h-1.5 bg-card-hi rounded-full overflow-hidden">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function RecDossier({ rec }: { rec: Recommendation }) {
  const [expanded, setExpanded] = useState(false)
  const { data: validation } = useValidationForRecommendation(rec.rec_id)

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-start gap-4 px-5 py-4 hover:bg-card-hi transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <VerdictBadge status={rec.status} />
            <span className="text-ivory text-sm font-medium">{rec.suggested_room ?? "—"}</span>
          </div>
          <p className="text-ivory-dim text-xs mono-text">
            {rec.rec_id} · Guest: {rec.guest_id} · Score: {rec.alignment_score ?? "—"}
          </p>
        </div>
        {expanded ? <ChevronDown className="w-4 h-4 text-ivory-faint shrink-0 mt-0.5" /> : <ChevronRight className="w-4 h-4 text-ivory-faint shrink-0 mt-0.5" />}
      </button>

      {expanded && (
        <div className="px-5 pb-6 pt-1 border-t border-border space-y-6 animate-fade-in">

          {/* Room + packages */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <p className="mono-text text-gold mb-2">Suggested Room</p>
              <p className="text-ivory text-sm">{rec.suggested_room ?? "—"}</p>
              {rec.suggested_amenities?.length > 0 && (
                <>
                  <p className="mono-text text-gold mt-3 mb-1.5">Amenities</p>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.suggested_amenities.map((a) => (
                      <span key={a} className="bg-card-hi border border-border rounded px-2 py-0.5 text-xs text-ivory-dim">{a}</span>
                    ))}
                  </div>
                </>
              )}
            </div>
            <div>
              {rec.suggested_packages?.length > 0 && (
                <>
                  <p className="mono-text text-gold mb-1.5">Packages</p>
                  <ul className="space-y-1">
                    {rec.suggested_packages.map((p) => <li key={p} className="text-ivory-dim text-xs">• {p}</li>)}
                  </ul>
                </>
              )}
              {rec.upsell_opportunities?.length > 0 && (
                <>
                  <p className="mono-text text-gold mt-3 mb-1.5">Upsell Opportunities</p>
                  <ul className="space-y-1">
                    {rec.upsell_opportunities.map((u) => <li key={u} className="text-gold-dim text-xs">↑ {u}</li>)}
                  </ul>
                </>
              )}
            </div>
          </div>

          {/* Guest message */}
          {rec.guest_message && (
            <div className="bg-card-hi rounded-lg px-4 py-3 border-l-2 border-gold/30">
              <p className="mono-text text-gold mb-1.5">Guest Message</p>
              <p className="text-ivory-dim text-sm italic">&ldquo;{rec.guest_message}&rdquo;</p>
            </div>
          )}

          {/* Justification */}
          {rec.justification && (
            <div>
              <p className="mono-text text-gold mb-1.5">Justification</p>
              <p className="text-ivory-dim text-sm leading-relaxed">{rec.justification}</p>
            </div>
          )}

          {/* Preference tags */}
          {rec.preference_tags_used?.length > 0 && (
            <div>
              <p className="mono-text text-gold mb-1.5">Preference Tags Used</p>
              <div className="flex flex-wrap gap-1.5">
                {rec.preference_tags_used.map((t) => (
                  <span key={t} className="bg-gold/5 border border-gold/20 text-gold text-xs px-2 py-0.5 rounded mono-text">{t}</span>
                ))}
              </div>
            </div>
          )}

          {/* Dimension scores */}
          {rec.dimension_scores && (
            <div>
              <p className="mono-text text-gold mb-3">Dimension Scores</p>
              <div className="space-y-2.5">
                <ScoreBar label="Preference Alignment" score={Number(rec.dimension_scores.preference_alignment)} weight={40} />
                <ScoreBar label="Loyalty Appropriateness" score={Number(rec.dimension_scores.loyalty_appropriateness)} weight={20} />
                <ScoreBar label="Special Request Coverage" score={Number(rec.dimension_scores.special_request_coverage)} weight={20} />
                <ScoreBar label="Inventory Validity" score={Number(rec.dimension_scores.inventory_validity)} weight={10} />
                <ScoreBar label="Upsell Relevance" score={Number(rec.dimension_scores.upsell_relevance)} weight={10} />
              </div>
            </div>
          )}

          {/* Validator reasoning + flags */}
          {validation && (
            <div className="space-y-4 border-t border-border pt-4">
              <p className="mono-text text-gold">Validator Reasoning</p>
              {rec.validator_reasoning && (
                <p className="text-ivory-dim text-sm leading-relaxed">{rec.validator_reasoning}</p>
              )}
              {rec.validator_flags?.length > 0 && (
                <div>
                  <p className="mono-text text-warning mb-1.5">Validator Flags</p>
                  <ul className="space-y-1">
                    {rec.validator_flags.map((f) => <li key={f} className="text-warning text-xs">⚑ {f}</li>)}
                  </ul>
                </div>
              )}
              <div className="flex flex-wrap gap-4 text-xs mono-text text-ivory-dim">
                <span>Validation ID: {validation.validation_id}</span>
                <span>Validator Count: {validation.validator_count}</span>
                <span>Consensus Score: {validation.consensus_score}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function RecommendationsPage() {
  const { data: hotel } = useHotel()
  const { data: guests = [], isLoading: guestsLoading } = useGuests()
  const { data: allRecs = [], isLoading: recsLoading, refetch } = useHotelRecommendations()
  const requestRecommendation = useRequestRecommendation()

  const [selectedGuestId, setSelectedGuestId] = useState("")
  const [roomType, setRoomType] = useState("")
  const [checkIn, setCheckIn] = useState("")
  const [checkOut, setCheckOut] = useState("")
  const [context, setContext] = useState("")
  const [requesting, setRequesting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedGuestId) return
    setRequesting(true)
    try {
      const hash = await requestRecommendation(selectedGuestId, roomType, checkIn, checkOut, context)
      setTxHash(hash)
      setTimeout(() => refetch(), 5000)
    } finally {
      setRequesting(false)
    }
  }

  if (!hotel) {
    return (
      <div className="max-w-xl mx-auto pt-12 text-center">
        <p className="display-text text-2xl text-ivory mb-3">Hotel not registered</p>
        <p className="text-ivory-dim text-sm">Register your hotel first.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="mono-text text-gold mb-1">Recommendation Lab</p>
        <h1 className="display-text text-4xl font-light text-ivory">Validator Dossiers</h1>
        <p className="text-ivory-dim text-sm mt-1">
          GenLayer validators independently judge semantic alignment. Consensus decides the verdict.
        </p>
      </div>

      {/* Request form */}
      <form onSubmit={handleRequest} className="glass-card rounded-xl p-8 space-y-5">
        <p className="text-ivory font-medium text-sm mb-2">Request New Recommendation</p>

        <div>
          <label className="label-dark">Select Guest</label>
          <select
            className="input-dark"
            value={selectedGuestId}
            onChange={(e) => setSelectedGuestId(e.target.value)}
            required
          >
            <option value="">— Select a guest —</option>
            {guests.map((g) => (
              <option key={g.guest_id} value={g.guest_id}>
                {g.name} ({g.loyalty_tier}) · {g.guest_id}
              </option>
            ))}
          </select>
          {guestsLoading && <p className="text-ivory-faint text-xs mt-1">Loading guests…</p>}
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="label-dark">Room Type</label>
            <input className="input-dark" value={roomType} onChange={(e) => setRoomType(e.target.value)} placeholder="e.g. Deluxe Suite" />
          </div>
          <div>
            <label className="label-dark">Check-in</label>
            <input type="date" className="input-dark" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
          </div>
          <div>
            <label className="label-dark">Check-out</label>
            <input type="date" className="input-dark" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
          </div>
        </div>

        <div>
          <label className="label-dark">Special Context (optional)</label>
          <textarea
            className="input-dark h-20 resize-none"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g. Anniversary stay, VIP guest, attending conference"
          />
        </div>

        <button
          type="submit"
          disabled={requesting || !selectedGuestId}
          className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <Sparkles className="w-4 h-4" />
          {requesting ? "Requesting validator consensus…" : "Request Recommendation"}
        </button>
      </form>

      {txHash && (
        <div className="glass-card rounded-xl p-5 border border-success/20">
          <p className="text-success text-sm mb-1">Recommendation request submitted</p>
          <a href={studioTxLink(txHash)} target="_blank" rel="noopener noreferrer" className="mono-text text-xs text-gold-dim hover:text-gold break-all">{txHash}</a>
          <p className="text-ivory-dim text-xs mt-2">Validators are running consensus. The dossier will appear below once processed.</p>
        </div>
      )}

      {/* Dossier list */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <p className="mono-text text-gold">{allRecs.length} Recommendation{allRecs.length !== 1 ? "s" : ""}</p>
          <button onClick={() => refetch()} className="btn-ghost text-xs">Refresh</button>
        </div>

        {recsLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 shimmer-bg rounded-xl" />)}
          </div>
        ) : allRecs.length === 0 ? (
          <div className="glass-card rounded-xl p-12 text-center">
            <Sparkles className="w-8 h-8 text-gold/30 mx-auto mb-3" />
            <p className="display-text text-2xl text-ivory mb-2">No recommendations yet</p>
            <p className="text-ivory-dim text-sm">Select a guest above and request the first validator dossier.</p>
          </div>
        ) : (
          allRecs.map((rec) => <RecDossier key={rec.rec_id} rec={rec} />)
        )}
      </div>
    </div>
  )
}
