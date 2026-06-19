"use client"

import { useState } from "react"
import { useGuests, useSubmitGuestProfile, useEraseGuestProfile } from "@/hooks/useGuests"
import { useHotel } from "@/hooks/useHotel"
import { Plus, X, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import { DEMO_GUEST } from "@/lib/genlayer/config"
import { studioTxLink } from "@/lib/genlayer/config"
import type { Guest } from "@/types/contract"
import { cn } from "@/lib/utils"

function ArrayInput({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [input, setInput] = useState("")
  const add = () => {
    const t = input.trim()
    if (t) onChange([...value, t])
    setInput("")
  }
  return (
    <div>
      <label className="label-dark">{label}</label>
      <div className="flex gap-2 mb-2">
        <input
          className="input-dark flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder ?? "Type and press Enter"}
        />
        <button type="button" onClick={add} className="btn-ghost px-3">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="space-y-1">
        {value.map((v, i) => (
          <div key={i} className="flex items-start gap-2 bg-card-hi rounded px-3 py-1.5">
            <span className="text-ivory-dim text-xs flex-1 leading-relaxed">{v}</span>
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))}>
              <X className="w-3 h-3 text-ivory-faint hover:text-danger" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

function GuestCard({ guest }: { guest: Guest }) {
  const [expanded, setExpanded] = useState(false)
  const eraseGuest = useEraseGuestProfile()

  return (
    <div className="glass-card rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-card-hi transition-colors text-left"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-ivory font-medium text-sm">{guest.name}</span>
            <span className="mono-text text-gold-dim border border-border-gold rounded px-1.5 py-0 text-xs">{guest.loyalty_tier}</span>
          </div>
          <p className="text-ivory-dim text-xs mono-text">{guest.guest_ref} · {guest.guest_id}</p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-ivory-dim text-xs">{guest.stay_count ?? 0} stays</span>
          {expanded ? <ChevronDown className="w-4 h-4 text-ivory-faint" /> : <ChevronRight className="w-4 h-4 text-ivory-faint" />}
        </div>
      </button>

      {expanded && (
        <div className="px-5 pb-5 pt-1 border-t border-border space-y-4 animate-fade-in">
          {guest.special_requests?.length > 0 && (
            <div>
              <p className="mono-text text-gold mb-1.5">Special Requests</p>
              <ul className="space-y-1">
                {guest.special_requests.map((r, i) => <li key={i} className="text-ivory-dim text-xs">• {r}</li>)}
              </ul>
            </div>
          )}
          {guest.dietary_needs?.length > 0 && (
            <div>
              <p className="mono-text text-gold mb-1.5">Dietary Needs</p>
              <ul className="space-y-1">
                {guest.dietary_needs.map((d, i) => <li key={i} className="text-ivory-dim text-xs">• {d}</li>)}
              </ul>
            </div>
          )}
          {guest.review_history?.length > 0 && (
            <div>
              <p className="mono-text text-gold mb-1.5">Review History</p>
              <ul className="space-y-1">
                {guest.review_history.map((r, i) => <li key={i} className="text-ivory-dim text-xs italic">&ldquo;{r}&rdquo;</li>)}
              </ul>
            </div>
          )}
          <button
            onClick={() => eraseGuest(guest.guest_id)}
            className="flex items-center gap-2 text-xs text-danger hover:text-danger/80 mt-2"
          >
            <Trash2 className="w-3.5 h-3.5" /> Erase Profile (GDPR)
          </button>
        </div>
      )}
    </div>
  )
}

export default function GuestsPage() {
  const { data: hotel } = useHotel()
  const { data: guests = [], isLoading } = useGuests()
  const submitGuest = useSubmitGuestProfile()

  const [showForm, setShowForm] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const [guestRef, setGuestRef] = useState("")
  const [name, setName] = useState("")
  const [loyaltyTier, setLoyaltyTier] = useState("gold")
  const [reviews, setReviews] = useState<string[]>([])
  const [requests, setRequests] = useState<string[]>([])
  const [dietary, setDietary] = useState<string[]>([])
  const [convos, setConvos] = useState<string[]>([])
  const [roomHistory, setRoomHistory] = useState<string[]>([])

  const loadDemo = () => {
    setGuestRef(DEMO_GUEST.guest_ref)
    setName(DEMO_GUEST.name)
    setLoyaltyTier(DEMO_GUEST.loyalty_tier)
    setReviews([...DEMO_GUEST.review_history])
    setRequests([...DEMO_GUEST.special_requests])
    setDietary([...DEMO_GUEST.dietary_needs])
    setConvos([...DEMO_GUEST.conversation_history])
    setRoomHistory([...DEMO_GUEST.room_history])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const hash = await submitGuest(guestRef, name, loyaltyTier, reviews, requests, dietary, convos, roomHistory)
      setTxHash(hash)
      setShowForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  if (!hotel) {
    return (
      <div className="max-w-xl mx-auto pt-12 text-center">
        <p className="display-text text-2xl text-ivory mb-3">Hotel not registered</p>
        <p className="text-ivory-dim text-sm">Register your hotel in Settings before submitting guest profiles.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div className="flex items-end justify-between">
        <div>
          <p className="mono-text text-gold mb-1">Guest Management</p>
          <h1 className="display-text text-4xl font-light text-ivory">Guest Dossiers</h1>
        </div>
        <button onClick={() => setShowForm((v) => !v)} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Guest
        </button>
      </div>

      {txHash && (
        <div className="glass-card rounded-xl p-5 border border-success/20">
          <p className="text-success text-sm mb-1">Profile submitted on-chain</p>
          <a href={studioTxLink(txHash)} target="_blank" rel="noopener noreferrer" className="mono-text text-xs text-gold-dim hover:text-gold break-all">{txHash}</a>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-ivory font-medium text-sm">Submit Guest Profile</p>
            <div className="flex gap-2">
              <button type="button" onClick={loadDemo} className="btn-ghost text-xs text-gold">Demo Data</button>
              <button type="button" onClick={() => setShowForm(false)}><X className="w-4 h-4 text-ivory-dim" /></button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-dark">Guest Reference</label>
              <input className="input-dark" value={guestRef} onChange={(e) => setGuestRef(e.target.value)} placeholder="e.g. SMITH_J_001" required />
            </div>
            <div>
              <label className="label-dark">Guest Name</label>
              <input className="input-dark" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. James Smith" required />
            </div>
          </div>

          <div>
            <label className="label-dark">Loyalty Tier</label>
            <select className="input-dark" value={loyaltyTier} onChange={(e) => setLoyaltyTier(e.target.value)}>
              {["bronze", "silver", "gold", "platinum", "diamond"].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <ArrayInput label="Review History" value={reviews} onChange={setReviews} placeholder="Paste a guest review excerpt" />
          <ArrayInput label="Special Requests" value={requests} onChange={setRequests} placeholder="e.g. High floor, feather-free" />
          <ArrayInput label="Dietary Needs" value={dietary} onChange={setDietary} placeholder="e.g. Gluten-free, halal" />
          <ArrayInput label="Conversation History" value={convos} onChange={setConvos} placeholder="e.g. Guest called asking for late checkout" />
          <ArrayInput label="Room History" value={roomHistory} onChange={setRoomHistory} placeholder="e.g. Deluxe Suite, floor 12, 2024-03" />

          <button type="submit" disabled={submitting} className="btn-gold w-full disabled:opacity-50">
            {submitting ? "Submitting…" : "Submit Guest Profile"}
          </button>
        </form>
      )}

      {/* Guest list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="h-16 shimmer-bg rounded-xl" />)}
        </div>
      ) : guests.length === 0 ? (
        <div className="glass-card rounded-xl p-12 text-center">
          <p className="display-text text-2xl text-ivory mb-2">No guest profiles yet</p>
          <p className="text-ivory-dim text-sm">Submit your first guest profile to begin generating recommendations.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {guests.map((guest) => <GuestCard key={guest.guest_id} guest={guest} />)}
        </div>
      )}
    </div>
  )
}
