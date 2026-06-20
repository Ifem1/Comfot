"use client"

import { useState } from "react"
import { usePreferenceRules, useSetPreferenceRule, useDeletePreferenceRule } from "@/hooks/useHotel"
import { useQueryClient } from "@tanstack/react-query"
import { useAccount } from "wagmi"
import { Plus, Trash2 } from "lucide-react"
import type { PreferenceRule } from "@/types/contract"

const RULE_TYPES = [
  "room_preference",
  "amenity_preference",
  "dietary_rule",
  "special_request_rule",
  "loyalty_upgrade",
  "upsell_trigger",
  "exclusion_rule",
]

function RuleRow({ rule, onDelete }: { rule: PreferenceRule; onDelete: (id: string) => void }) {
  return (
    <div className="glass-card rounded-xl px-5 py-4 flex items-center gap-4">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="mono-text text-gold border border-gold/20 bg-gold/5 rounded px-2 py-0.5 text-xs">{rule.rule_type}</span>
          {rule.active !== false && <span className="text-success text-xs mono-text">active</span>}
          {rule.active === false && <span className="text-ivory-faint text-xs mono-text">inactive</span>}
        </div>
        <p className="text-ivory text-sm mt-0.5">{rule.rule_value}</p>
        {rule.description && <p className="text-ivory-dim text-xs mt-0.5">{rule.description}</p>}
        <p className="mono-text text-ivory-faint text-xs mt-0.5">{rule.rule_id}</p>
      </div>
      <button
        onClick={() => onDelete(rule.rule_id)}
        className="shrink-0 text-ivory-faint hover:text-danger transition-colors"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  )
}

export default function PreferencesPage() {
  const { address } = useAccount()
  const { data: rules = [], isLoading, refetch } = usePreferenceRules()
  const setRule = useSetPreferenceRule()
  const deleteRule = useDeletePreferenceRule()
  const qc = useQueryClient()

  const [ruleType, setRuleType]       = useState("room_preference")
  const [ruleValue, setRuleValue]     = useState("")
  const [description, setDescription] = useState("")
  const [submitting, setSubmitting]   = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleValue.trim()) return
    setSubmitting(true)
    // rule_id is a slug derived from type + value; contract deduplicates by rule_id
    const ruleId = `${ruleType}_${Date.now()}`
    try {
      await setRule(ruleId, ruleType, ruleValue.trim(), description.trim(), true)
      setRuleValue(""); setDescription("")
      setTimeout(() => {
        qc.invalidateQueries({ queryKey: ["preference-rules", address] })
      }, 3000)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (ruleId: string) => {
    await deleteRule(ruleId)
    setTimeout(() => {
      qc.invalidateQueries({ queryKey: ["preference-rules", address] })
    }, 3000)
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fade-in">
      <div>
        <p className="mono-text text-gold mb-1">Hotel Intelligence</p>
        <h1 className="display-text text-4xl font-light text-ivory">Preference Rules</h1>
        <p className="text-ivory-dim text-sm mt-1">
          Rules stored on-chain. Validators weight them when generating recommendations.
        </p>
      </div>

      <form onSubmit={handleAdd} className="glass-card rounded-xl p-8 space-y-4">
        <p className="text-ivory font-medium text-sm mb-2">Add New Rule</p>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label-dark">Rule Type</label>
            <select className="input-dark" value={ruleType} onChange={(e) => setRuleType(e.target.value)}>
              {RULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-dark">Rule Value</label>
            <input className="input-dark" value={ruleValue} onChange={(e) => setRuleValue(e.target.value)}
              placeholder="e.g. Always offer ocean-view rooms to platinum guests" required />
          </div>
        </div>

        <div>
          <label className="label-dark">Description (optional)</label>
          <input className="input-dark" value={description} onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief note for hotel staff" />
        </div>

        <button type="submit" disabled={submitting || !ruleValue.trim()} className="btn-gold w-full disabled:opacity-50 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" /> {submitting ? "Submitting…" : "Add Rule"}
        </button>
      </form>

      {isLoading ? (
        <div className="space-y-3">{[1, 2].map((i) => <div key={i} className="h-14 shimmer-bg rounded-xl" />)}</div>
      ) : rules.length === 0 ? (
        <div className="glass-card rounded-xl p-10 text-center">
          <p className="display-text text-xl text-ivory mb-2">No rules yet</p>
          <p className="text-ivory-dim text-sm">Add rules to guide how validators personalise recommendations for your guests.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-1">
            <p className="mono-text text-gold">{rules.length} rule{rules.length !== 1 ? "s" : ""}</p>
            <button onClick={() => refetch()} className="btn-ghost text-xs">Refresh</button>
          </div>
          {rules.map((rule) => <RuleRow key={rule.rule_id} rule={rule} onDelete={handleDelete} />)}
        </div>
      )}
    </div>
  )
}
