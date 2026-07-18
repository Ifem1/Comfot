"use client"

import { useState } from "react"
import { useHotel, useRegisterHotel } from "@/hooks/useHotel"
import { Plus, X, CheckCircle } from "lucide-react"
import { DEMO_HOTEL } from "@/lib/genlayer/config"

function TagInput({ label, value, onChange }: { label: string; value: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("")
  const add = () => {
    const t = input.trim()
    if (t && !value.includes(t)) onChange([...value, t])
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
          placeholder="Type and press Enter"
        />
        <button type="button" onClick={add} className="btn-ghost px-3">
          <Plus className="w-4 h-4" />
        </button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 bg-card-hi border border-border rounded px-2 py-0.5 text-xs text-ivory-dim">
            {v}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== v))}>
              <X className="w-3 h-3 hover:text-danger" />
            </button>
          </span>
        ))}
      </div>
    </div>
  )
}

export default function SettingsPage() {
  const { data: hotel, isLoading } = useHotel()
  const registerHotel = useRegisterHotel()

  const [name, setName] = useState("")
  const [propertyType, setPropertyType] = useState("luxury")
  const [description, setDescription] = useState("")
  const [location, setLocation] = useState("")
  const [amenities, setAmenities] = useState<string[]>([])
  const [rooms, setRooms] = useState<string[]>([])
  const [packages, setPackages] = useState<string[]>([])
  const [starRating, setStarRating] = useState(4)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const loadDemo = () => {
    setName(DEMO_HOTEL.name)
    setPropertyType(DEMO_HOTEL.category)
    setDescription(DEMO_HOTEL.description)
    setLocation(DEMO_HOTEL.location)
    setAmenities([...DEMO_HOTEL.amenities])
    setRooms([...DEMO_HOTEL.room_types])
    setPackages([...DEMO_HOTEL.packages])
    setStarRating(DEMO_HOTEL.star_rating)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || rooms.length === 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      await registerHotel(name.trim(), propertyType, description.trim(), location.trim(), amenities, rooms, packages, starRating)
    } catch (e: unknown) {
      setSubmitError(e instanceof Error ? e.message : "Transaction failed — check MetaMask")
    } finally {
      setSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto pt-8">
        <div className="h-8 w-48 shimmer-bg rounded mb-4" />
        <div className="h-64 shimmer-bg rounded-xl" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="mono-text text-gold mb-1">Configuration</p>
        <h1 className="display-text text-4xl font-light text-ivory">Hotel Settings</h1>
        {hotel && (
          <div className="flex items-center gap-2 mt-2 text-success text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Currently registered as: <strong>{hotel.name}</strong></span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="glass-card rounded-xl p-8 space-y-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-ivory text-sm font-medium">
            {hotel ? "Re-register / Update Hotel" : "Register Hotel on StudioNet"}
          </p>
          <button type="button" onClick={loadDemo} className="btn-ghost text-xs text-gold">
            Load Demo Data
          </button>
        </div>

        <div>
          <label className="label-dark">Hotel Name</label>
          <input
            className="input-dark"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. The Grand Meridian"
            required
          />
        </div>

        <div>
          <label className="label-dark">Property Type</label>
          <select
            className="input-dark"
            value={propertyType}
            onChange={(e) => setPropertyType(e.target.value)}
          >
            {["luxury", "boutique", "resort", "business", "lifestyle", "budget", "extended_stay", "hostel"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label-dark">Description</label>
          <textarea
            className="input-dark resize-none"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A brief description of your hotel and its character"
          />
        </div>

        <div>
          <label className="label-dark">Location</label>
          <input
            className="input-dark"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="e.g. Lagos, Nigeria"
          />
        </div>

        <div>
          <label className="label-dark">Star Rating</label>
          <select
            className="input-dark"
            value={starRating}
            onChange={(e) => setStarRating(Number(e.target.value))}
          >
            {[1, 2, 3, 4, 5].map((s) => (
              <option key={s} value={s}>{s} star{s > 1 ? "s" : ""}</option>
            ))}
          </select>
        </div>

        <TagInput label="Room Types" value={rooms} onChange={setRooms} />
        <TagInput label="Amenities" value={amenities} onChange={setAmenities} />
        <TagInput label="Packages (optional)" value={packages} onChange={setPackages} />

        {submitError && (
          <div className="rounded-lg bg-danger/10 border border-danger/30 px-4 py-3 text-danger text-xs leading-relaxed">
            {submitError}
          </div>
        )}

        <button
          type="submit"
          disabled={submitting || !name.trim() || rooms.length === 0}
          className="btn-gold w-full disabled:opacity-50"
        >
          {submitting ? "Submitting transaction…" : hotel ? "Update Registration" : "Register Hotel"}
        </button>
      </form>
    </div>
  )
}
