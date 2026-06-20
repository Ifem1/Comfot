import Link from "next/link"
import {
  ArrowRight, CheckCircle, XCircle, AlertCircle,
  Zap, Shield, Eye, Users, Sparkles, Hotel,
  ChevronRight,
} from "lucide-react"
import { GENLAYER_CONTRACT_ADDRESS, studioContractLink } from "@/lib/genlayer/config"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-espresso text-ivory">

      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-espresso/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="display-text text-2xl font-light tracking-wide text-ivory">
            Comfot
          </div>
          <div className="flex items-center gap-6">
            <a
              href={studioContractLink(GENLAYER_CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-text text-xs text-gold-dim hover:text-gold transition-colors hidden md:flex items-center gap-1.5"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
              Contract on StudioNet
            </a>
            <Link href="/connect" className="btn-gold text-sm px-5 py-2">
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6 bg-hero-gradient">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-gold/20 bg-gold/5 text-gold text-xs font-medium px-4 py-2 rounded-full mb-10 mono-text">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-glow-pulse" />
            Intelligent Contract · GenLayer StudioNet · Validator Consensus
          </div>

          <h1 className="display-text text-6xl md:text-8xl font-light text-ivory leading-none mb-6">
            Personalized Comfort<br />
            <span className="italic text-gold">for Every Stay</span>
          </h1>

          <p className="text-ivory-dim text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
            Comfot turns guest reviews, loyalty history and conversation signals
            into room, amenity and package recommendations — validated by an
            independent network of GenLayer AI validators, not a single model.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link
              href="/connect"
              className="btn-gold inline-flex items-center gap-2 text-base px-8 py-3.5"
            >
              Open Hotel Console <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2 text-base px-8 py-3.5"
            >
              How GenLayer Works
            </a>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 max-w-xl mx-auto">
            {[
              { value: "5", label: "Dimension scores per rec" },
              { value: "3", label: "Possible verdicts" },
              { value: "0", label: "Backend servers" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="display-text text-4xl text-gold font-light">{s.value}</p>
                <p className="text-ivory-faint text-xs mt-1 leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Problem */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">The Problem</p>
            <h2 className="display-text text-4xl md:text-5xl font-light text-ivory">
              Guest comfort is inherently subjective
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-10">
            {[
              {
                label: "Guest A says:",
                quote: "I prefer a quiet room.",
                meaning: "High floor, executive suite, away from elevator. Business centre access. Late checkout. No bar noise. Feather-free pillow menu.",
              },
              {
                label: "Guest B says:",
                quote: "I prefer a quiet room.",
                meaning: "Spa package, wellness retreat, low-touch service, garden suite, private dining, evening aromatherapy. No business centre. No lounge.",
              },
            ].map((g) => (
              <div key={g.label} className="glass-card rounded-2xl p-8">
                <p className="text-ivory-dim text-sm mono-text mb-4">{g.label}</p>
                <p className="display-text text-2xl text-ivory italic mb-5">&ldquo;{g.quote}&rdquo;</p>
                <p className="text-ivory-dim text-sm leading-relaxed">{g.meaning}</p>
              </div>
            ))}
          </div>

          <p className="text-center text-ivory-dim max-w-2xl mx-auto">
            The same phrase. Completely different needs. Keyword matching fails both guests.
            A rule engine fails both guests.{" "}
            <span className="text-gold">GenLayer validators judge semantic alignment.</span>
          </p>
        </div>
      </section>

      {/* How it works — workflow */}
      <section className="py-24 px-6 bg-panel border-t border-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">How It Works</p>
            <h2 className="display-text text-4xl md:text-5xl font-light text-ivory">
              From guest signal to validated verdict
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                step: "01",
                icon: <Hotel className="w-5 h-5 text-gold" />,
                title: "Register your hotel",
                desc: "Connect your wallet on StudioNet. Register your hotel — room types, amenities, category — directly on-chain. No database.",
              },
              {
                step: "02",
                icon: <Users className="w-5 h-5 text-gold" />,
                title: "Submit guest profiles",
                desc: "Upload loyalty tier, review excerpts, special requests, dietary needs, and conversation history. Profiles are stored on the intelligent contract.",
              },
              {
                step: "03",
                icon: <Sparkles className="w-5 h-5 text-gold" />,
                title: "Request a recommendation",
                desc: "Select a guest, room type, and dates. The contract runs LLM inference over all guest signals to generate a room, amenity, and package recommendation with full justification.",
              },
              {
                step: "04",
                icon: <Shield className="w-5 h-5 text-gold" />,
                title: "Validator consensus decides",
                desc: "Multiple independent GenLayer validators each run their own LLM inference and vote. The eq_principle mechanism compares outputs and produces a consensus verdict: APPROVED, REJECTED, or ESCALATED.",
              },
              {
                step: "05",
                icon: <CheckCircle className="w-5 h-5 text-gold" />,
                title: "Act on the verdict",
                desc: "Approved? Send the recommendation to your team. Escalated? Review and decide in the dashboard. All scores, reasoning, and flags are stored immutably on-chain.",
              },
            ].map((item, i) => (
              <div key={item.step} className="flex gap-6 items-start">
                <div className="flex-shrink-0 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center">
                    {item.icon}
                  </div>
                  {i < 4 && <div className="w-px h-full min-h-[2rem] bg-border mt-2" />}
                </div>
                <div className="glass-card rounded-xl px-6 py-5 flex-1 mb-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="mono-text text-gold-dim text-xs">{item.step}</span>
                    <h3 className="text-ivory font-medium">{item.title}</h3>
                  </div>
                  <p className="text-ivory-dim text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why normal engines fail */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">The Gap</p>
            <h2 className="display-text text-4xl md:text-5xl font-light text-ivory">
              Why existing solutions fall short
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Rule-based systems",
                flaw: "Cannot handle nuance. Spa user + early riser = different slots, different packages, different floors. Rules cannot capture this.",
              },
              {
                title: "Keyword matching",
                flaw: "Quiet is not a feature. It is a feeling. No keyword maps cleanly to the right room, amenity, or pre-arrival message.",
              },
              {
                title: "Single AI model",
                flaw: "One model, one interpretation. No independent verification. No consensus. No way to know whether the output is actually aligned with the guest.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-xl p-6 border border-danger/10">
                <XCircle className="w-5 h-5 text-danger mb-4" />
                <h3 className="text-ivory font-medium mb-3">{item.title}</h3>
                <p className="text-ivory-dim text-sm leading-relaxed">{item.flaw}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GenLayer advantage */}
      <section className="py-24 px-6 bg-panel border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">The Solution</p>
            <h2 className="display-text text-4xl md:text-5xl font-light text-ivory">
              GenLayer validates semantic alignment
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Zap className="w-5 h-5 text-gold" />,
                title: "Non-deterministic inference",
                desc: "The contract runs LLM inference on reviews, loyalty data, and conversation history to extract granular preference tags and generate a full recommendation with justification.",
              },
              {
                icon: <Shield className="w-5 h-5 text-gold" />,
                title: "Multi-validator consensus",
                desc: "Independent GenLayer validators each judge semantic alignment. The eq_principle mechanism compares their outputs. Consensus decides — not a single model.",
              },
              {
                icon: <Eye className="w-5 h-5 text-gold" />,
                title: "Immutable on-chain verdict",
                desc: "Every decision — with dimension scores, validator flags, alignment score, and full reasoning — is stored permanently on StudioNet. Auditable. Transparent.",
              },
            ].map((item) => (
              <div key={item.title} className="glass-card rounded-xl p-6 border border-gold/10">
                <div className="w-10 h-10 rounded-lg bg-gold/10 flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-ivory font-medium mb-3">{item.title}</h3>
                <p className="text-ivory-dim text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Three verdicts */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">Outcomes</p>
            <h2 className="display-text text-4xl font-light text-ivory">
              Three possible verdicts
            </h2>
            <p className="text-ivory-dim text-sm mt-3 max-w-lg mx-auto">
              Every recommendation goes through consensus. There are only three outcomes — no silent defaults, no hallucinated certainty.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 border border-success/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="mono-text text-success font-medium">APPROVED</span>
              </div>
              <p className="text-ivory-dim text-sm leading-relaxed mb-4">
                Alignment score ≥ 75. Validators agree the recommendation meaningfully
                matches the guest&apos;s documented needs. Safe to action.
              </p>
              <p className="mono-text text-xs text-ivory-faint">Score ≥ 75 · consensus achieved</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-warning/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="mono-text text-warning font-medium">ESCALATED</span>
              </div>
              <p className="text-ivory-dim text-sm leading-relaxed mb-4">
                Score 45–74. Evidence is thin or alignment is uncertain.
                A human reviewer at the hotel must approve or reject before use.
              </p>
              <p className="mono-text text-xs text-ivory-faint">Score 45–74 · human review</p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-danger/20">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-danger" />
                <span className="mono-text text-danger font-medium">REJECTED</span>
              </div>
              <p className="text-ivory-dim text-sm leading-relaxed mb-4">
                Score &lt; 45 or the recommendation directly contradicts a documented
                guest need. Do not use — re-submit after updating the guest profile.
              </p>
              <p className="mono-text text-xs text-ivory-faint">Score &lt; 45 · do not use</p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="py-24 px-6 bg-panel border-t border-border">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p className="mono-text text-gold mb-3">Architecture</p>
            <h2 className="display-text text-4xl font-light text-ivory mb-4">Backendless by design</h2>
            <p className="text-ivory-dim text-sm max-w-lg mx-auto">
              No database. No API server. No backend logic. The GenLayer Intelligent Contract
              is the single source of truth.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-8 font-mono text-sm space-y-1.5">
            {[
              { text: "MetaMask Wallet (injected provider)",           color: "text-ivory-dim" },
              { text: "  ↓  wagmi v2 · genlayer-js v1.1.8",          color: "text-ivory-faint" },
              { text: "Next.js 14 Frontend · Vercel",                 color: "text-ivory-dim" },
              { text: "  ↓  writeContract / readContract",            color: "text-ivory-faint" },
              { text: "ComfotContract.py · StudioNet · 0x28351D…",   color: "text-gold" },
              { text: "  ↓  validator consensus",                     color: "text-ivory-faint" },
              { text: "  Validator 1  →  LLM inference  →  vote ✓",  color: "text-ivory-dim" },
              { text: "  Validator 2  →  LLM inference  →  vote ✓",  color: "text-ivory-dim" },
              { text: "  Validator N  →  LLM inference  →  vote …",  color: "text-ivory-dim" },
              { text: "  ↓  eq_principle comparison",                 color: "text-ivory-faint" },
              { text: "  APPROVED  /  ESCALATED  /  REJECTED",       color: "text-success" },
              { text: "  ↓  stored immutably on StudioNet",          color: "text-ivory-faint" },
              { text: "Supabase (off-chain PII only — never on-chain)", color: "text-ivory-faint" },
            ].map((row, i) => (
              <div key={i} className={row.color}>{row.text}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features grid */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">Console Features</p>
            <h2 className="display-text text-4xl font-light text-ivory">
              Everything a hotel operator needs
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { title: "Guest Dossiers", desc: "Submit and edit guest profiles with review history, special requests, dietary needs, conversation logs, and off-chain PII stored securely in Supabase." },
              { title: "Recommendation Lab", desc: "Request validator-consensus recommendations per guest. View dimension scores, justification, amenity suggestions, packages, and upsell opportunities." },
              { title: "Escalation Desk", desc: "When consensus is uncertain, escalated recommendations queue here. Approve or reject with a reviewer note — logged on-chain." },
              { title: "Validation Records", desc: "Full audit trail of every validator consensus round: count, scores, flags, and the comparison result that produced the verdict." },
              { title: "Preference Rules", desc: "Add hotel-wide preference rules that the contract factors into every recommendation — loyalty bonuses, blackout dates, category defaults." },
              { title: "Notification Alerts", desc: "Email alerts via Brevo when recommendations are escalated, finalized, or rejected. Configurable per hotel with per-event toggles." },
            ].map((f) => (
              <div key={f.title} className="glass-card rounded-xl p-6">
                <div className="flex items-center gap-2 mb-3">
                  <ChevronRight className="w-4 h-4 text-gold shrink-0" />
                  <h3 className="text-ivory font-medium text-sm">{f.title}</h3>
                </div>
                <p className="text-ivory-dim text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-28 px-6 bg-panel border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="mono-text text-gold mb-4">Ready?</p>
          <h2 className="display-text text-5xl md:text-6xl font-light text-ivory mb-6">
            Validate comfort.<br />
            <span className="italic text-gold">Not guess it.</span>
          </h2>
          <p className="text-ivory-dim mb-10 leading-relaxed">
            Connect your MetaMask wallet and register your hotel on StudioNet.
            No signup. No backend. No database. Just GenLayer.
          </p>
          <Link
            href="/connect"
            className="btn-gold inline-flex items-center gap-2 text-base px-10 py-4"
          >
            Open Hotel Console <ArrowRight className="w-4 h-4" />
          </Link>
          <p className="text-ivory-faint text-xs mt-6 mono-text">
            Requires MetaMask · StudioNet (chain ID 61999) · GEN for gas
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-ivory-dim text-xs">
          <div className="flex items-center gap-4">
            <span className="display-text text-lg text-ivory">Comfot</span>
            <span className="text-ivory-faint">Personalized Comfort for Every Stay</span>
          </div>
          <div className="flex items-center gap-6">
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-gold transition-colors"
            >
              GenLayer Docs
            </a>
            <a
              href={studioContractLink(GENLAYER_CONTRACT_ADDRESS)}
              target="_blank"
              rel="noopener noreferrer"
              className="mono-text hover:text-gold transition-colors"
            >
              {GENLAYER_CONTRACT_ADDRESS.slice(0, 14)}…
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}
