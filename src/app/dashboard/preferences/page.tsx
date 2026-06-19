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
          <span className="mono-text text-ivory-faint text-xs">priority {rule.priority}</span>
        </div>
        <p className="text-ivory-dim text-sm mt-0.5">{rule.rule_value}</p>
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

  const [ruleType, setRuleType] = useState("room_preference")
  const [ruleValue, setRuleValue] = useState("")
  const [priority, setPriority] = useState(5)
  const [submitting, setSubmitting] = useState(false)

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!ruleValue.trim()) return
    setSubmitting(true)
    try {
      await setRule(ruleType, ruleValue.trim(), priority)
      setRuleValue("")
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
        <p className="mono-text text-gold mb-1">Rule Engine</p>
        <h1 className="display-text text-4xl font-light text-ivory">Preference Rules</h1>
        <p className="text-ivory-dim text-sm mt-1">
          Hotel-level rules that inform validator judgements on recommendation alignment.
        </p>
      </div>

      {/* Add form */}
      <form onSubmit={handleAdd} className="glass-card rounded-xl p-6 space-y-4">
        <p className="text-ivory text-sm font-medium">Add Preference Rule</p>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="label-dark">Rule Type</label>
            <select className="input-dark" value={ruleType} onChange={(e) => setRuleType(e.target.value)}>
              {RULE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="label-dark">Priority (1–10)</label>
            <input
              type="number"
              min={1}
              max={10}
              className="input-dark"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </div>
        </div>

        <div>
          <label className="label-dark">Rule Value</label>
          <textarea
            className="input-dark h-20 resize-none"
            value={ruleValue}
            onChange={(e) => setRuleValue(e.target.value)}
            placeholder='e.g. "Platinum guests must be offered a suite upgrade if available"'
            required
          />
        </div>

        <button type="submit" disabled={submitting || !ruleValue.trim()} className="btn-gold flex items-center gap-2 disabled:opacity-50">
          <Plus className="w-4 h-4" />
          {submitting ? "Saving…" : "Add Rule"}
        </button>
      </form>

      {/* Rules list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="mono-text text-gold">{rules.length} rule{rules.length !== 1 ? "s" : ""}</p>
          <button onClick={() => refetch()} className="btn-ghost text-xs">Refresh</button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-14 shimmer-bg rounded-xl" />)}
          </div>
        ) : rules.length === 0 ? (
          <div className="glass-card rounded-xl p-10 text-center">
            <p className="display-text text-xl text-ivory mb-2">No rules yet</p>
            <p className="text-ivory-dim text-sm">Add a preference rule to guide validator scoring.</p>
          </div>
        ) : (
          rules.map((rule) => <RuleRow key={rule.rule_id} rule={rule} onDelete={handleDelete} />)
        )}
      </div>
    </div>
  )
}
