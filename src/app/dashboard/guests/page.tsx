"use client"

import { useState, useEffect } from "react"
import { useGuests, useSubmitGuestProfile, useEraseGuestProfile } from "@/hooks/useGuests"
import { useHotel } from "@/hooks/useHotel"
import { useGuestPII } from "@/hooks/useGuestPII"
import { useAccount } from "wagmi"
import { Plus, X, Trash2, ChevronDown, ChevronRight, ShieldCheck } from "lucide-react"
import { DEMO_GUEST } from "@/lib/genlayer/config"
import type { Guest } from "@/types/contract"
import type { GuestPII } from "@/lib/supabase/types"
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

function GuestCard({ guest, hotelAddress, onEdit }: { guest: Guest; hotelAddress: string; onEdit: (g: Guest) => void }) {
  const [expanded, setExpanded] = useState(false)
  const [pii, setPii] = useState<GuestPII | null>(null)
  const [editingPII, setEditingPII] = useState(false)
  const [piiForm, setPiiForm] = useState({ full_name: "", email: "", phone: "", nationality: "", passport_number: "", date_of_birth: "", notes: "" })
  const [piiSaving, setPiiSaving] = useState(false)
  const eraseGuest = useEraseGuestProfile()
  const { fetchPII, savePII, deletePII } = useGuestPII()

  useEffect(() => {
    if (expanded && !pii) {
      fetchPII(guest.guest_id, hotelAddress).then((data) => {
        if (data) {
          setPii(data)
          setPiiForm({ full_name: data.full_name ?? "", email: data.email ?? "", phone: data.phone ?? "", nationality: data.nationality ?? "", passport_number: data.passport_number ?? "", date_of_birth: data.date_of_birth ?? "", notes: data.notes ?? "" })
        }
      })
    }
  }, [expanded, guest.guest_id, hotelAddress, fetchPII, pii])

  const handleSavePII = async () => {
    setPiiSaving(true)
    const result = await savePII({ guest_id: guest.guest_id, hotel_address: hotelAddress, guest_ref: guest.guest_ref, ...piiForm })
    if (result) { setPii(result); setEditingPII(false) }
    setPiiSaving(false)
  }

  const handleDeletePII = async () => {
    if (!confirm("Delete all off-chain PII for this guest?")) return
    await deletePII(guest.guest_id, hotelAddress)
    setPii(null)
    setPiiForm({ full_name: "", email: "", phone: "", nationality: "", passport_number: "", date_of_birth: "", notes: "" })
    setEditingPII(false)
  }

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
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(guest) }}
            className="text-xs text-ivory-faint hover:text-gold transition-colors px-2 py-0.5 rounded border border-border hover:border-gold/40"
          >
            Edit
          </button>
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

          {/* Off-chain PII section */}
          <div className="border-t border-border pt-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-gold" />
                <p className="mono-text text-gold text-xs">Secure Off-chain PII</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingPII((v) => !v)}
                className="text-xs text-ivory-dim hover:text-gold transition-colors"
              >
                {editingPII ? "Cancel" : pii ? "Edit" : "+ Add PII"}
              </button>
            </div>

            {!editingPII && pii && (
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                {pii.full_name && <p className="text-ivory-dim text-xs"><span className="text-ivory-faint">Name:</span> {pii.full_name}</p>}
                {pii.email && <p className="text-ivory-dim text-xs"><span className="text-ivory-faint">Email:</span> {pii.email}</p>}
                {pii.phone && <p className="text-ivory-dim text-xs"><span className="text-ivory-faint">Phone:</span> {pii.phone}</p>}
                {pii.nationality && <p className="text-ivory-dim text-xs"><span className="text-ivory-faint">Nationality:</span> {pii.nationality}</p>}
                {pii.passport_number && <p className="text-ivory-dim text-xs"><span className="text-ivory-faint">Passport:</span> {pii.passport_number}</p>}
                {pii.date_of_birth && <p className="text-ivory-dim text-xs"><span className="text-ivory-faint">DOB:</span> {pii.date_of_birth}</p>}
                {pii.notes && <p className="text-ivory-dim text-xs col-span-2"><span className="text-ivory-faint">Notes:</span> {pii.notes}</p>}
              </div>
            )}

            {editingPII && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {(["full_name", "email", "phone", "nationality", "passport_number", "date_of_birth"] as const).map((field) => (
                    <div key={field}>
                      <label className="label-dark capitalize">{field.replace("_", " ")}</label>
                      <input
                        className="input-dark"
                        type={field === "email" ? "email" : field === "date_of_birth" ? "date" : "text"}
                        value={piiForm[field]}
                        onChange={(e) => setPiiForm((f) => ({ ...f, [field]: e.target.value }))}
                      />
                    </div>
                  ))}
                </div>
                <div>
                  <label className="label-dark">Notes</label>
                  <textarea
                    className="input-dark resize-none"
                    rows={2}
                    value={piiForm.notes}
                    onChange={(e) => setPiiForm((f) => ({ ...f, notes: e.target.value }))}
                  />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={handleSavePII} disabled={piiSaving} className="btn-ghost text-xs flex-1 disabled:opacity-50">
                    {piiSaving ? "Saving…" : "Save PII"}
                  </button>
                  {pii && (
                    <button type="button" onClick={handleDeletePII} className="text-xs text-danger hover:text-danger/80 px-3">
                      Delete
                    </button>
                  )}
                </div>
                <p className="text-ivory-faint text-xs">PII is stored in Supabase — never written to the blockchain.</p>
              </div>
            )}
          </div>

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
  const { address } = useAccount()
  const { data: hotel } = useHotel()
  const { data: guests = [], isLoading } = useGuests()
  const submitGuest = useSubmitGuestProfile()

  const [showForm, setShowForm] = useState(false)
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [guestRef, setGuestRef] = useState("")
  const [name, setName] = useState("")
  const [loyaltyTier, setLoyaltyTier] = useState("gold")
  const [reviews, setReviews] = useState<string[]>([])
  const [requests, setRequests] = useState<string[]>([])
  const [dietary, setDietary] = useState<string[]>([])
  const [convos, setConvos] = useState<string[]>([])
  const [roomHistory, setRoomHistory] = useState<string[]>([])

  const resetForm = () => {
    setGuestRef(""); setName(""); setLoyaltyTier("gold")
    setReviews([]); setRequests([]); setDietary([]); setConvos([]); setRoomHistory([])
    setEditingGuest(null)
  }

  const loadGuest = (g: Guest) => {
    setGuestRef(g.guest_ref)
    setName(g.name)
    setLoyaltyTier(g.loyalty_tier)
    setReviews([...g.review_history])
    setRequests([...g.special_requests])
    setDietary([...g.dietary_needs])
    setConvos([...g.conversation_history])
    setRoomHistory([...g.room_history])
    setEditingGuest(g)
    setShowForm(true)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const loadDemo = () => {
    setGuestRef(DEMO_GUEST.guest_ref)
    setName(DEMO_GUEST.name)
    setLoyaltyTier(DEMO_GUEST.loyalty_tier)
    setReviews([...DEMO_GUEST.review_history])
    setRequests([...DEMO_GUEST.special_requests])
    setDietary([...DEMO_GUEST.dietary_needs])
    setConvos([...DEMO_GUEST.conversation_history])
    setRoomHistory([...DEMO_GUEST.room_history])
    setEditingGuest(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await submitGuest(guestRef, name, loyaltyTier, reviews, requests, dietary, convos, roomHistory)
      setShowForm(false)
      resetForm()
    } catch {
      // error already toasted in hook
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
        <button onClick={() => { resetForm(); setShowForm((v) => !v) }} className="btn-gold flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Guest
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-5 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <p className="text-ivory font-medium text-sm">
              {editingGuest ? `Editing: ${editingGuest.name}` : "Submit Guest Profile"}
            </p>
            <div className="flex gap-2">
              {!editingGuest && <button type="button" onClick={loadDemo} className="btn-ghost text-xs text-gold">Demo Data</button>}
              <button type="button" onClick={() => { setShowForm(false); resetForm() }}><X className="w-4 h-4 text-ivory-dim" /></button>
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
            {submitting ? "Submitting…" : editingGuest ? "Update Guest Profile" : "Submit Guest Profile"}
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
          {guests.map((guest) => <GuestCard key={guest.guest_id} guest={guest} hotelAddress={address ?? ""} onEdit={loadGuest} />)}
        </div>
      )}
    </div>
  )
}
