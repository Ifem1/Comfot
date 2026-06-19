"use client"

import { useState } from "react"
import { useHotel, useRegisterHotel } from "@/hooks/useHotel"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { Plus, X, CheckCircle } from "lucide-react"
import { DEMO_HOTEL } from "@/lib/genlayer/config"
import { studioTxLink } from "@/lib/genlayer/config"

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
  const { address } = useAccount()
  const { data: hotel, isLoading } = useHotel()
  const registerHotel = useRegisterHotel()
  const qc = useQueryClient()

  const [name, setName] = useState("")
  const [category, setCategory] = useState("luxury")
  const [amenities, setAmenities] = useState<string[]>([])
  const [rooms, setRooms] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [txHash, setTxHash] = useState<string | null>(null)

  const loadDemo = () => {
    setName(DEMO_HOTEL.name)
    setCategory(DEMO_HOTEL.category)
    setAmenities([...DEMO_HOTEL.amenities])
    setRooms([...DEMO_HOTEL.room_types])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || rooms.length === 0) return
    setSubmitting(true)
    try {
      const hash = await registerHotel(name.trim(), category, amenities, rooms)
      setTxHash(hash)
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["hotel", address] })
        qc.invalidateQueries({ queryKey: ["hotel-stats", address] })
      }, 4000)
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

      {txHash && (
        <div className="glass-card rounded-xl p-5 border border-success/20">
          <p className="text-success text-sm font-medium mb-1">Transaction submitted</p>
          <a
            href={studioTxLink(txHash)}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text text-xs text-gold-dim hover:text-gold break-all"
          >
            {txHash}
          </a>
          <p className="text-ivory-dim text-xs mt-2">
            Validators are processing. Hotel profile will appear within a few seconds after consensus.
          </p>
        </div>
      )}

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
          <label className="label-dark">Category</label>
          <select
            className="input-dark"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            {["budget", "midscale", "upscale", "luxury", "ultra-luxury"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <TagInput label="Room Types" value={rooms} onChange={setRooms} />
        <TagInput label="Amenities" value={amenities} onChange={setAmenities} />

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
