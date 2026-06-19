import Link from "next/link"
import { ArrowRight, CheckCircle, XCircle, AlertCircle, Zap, Shield, Eye } from "lucide-react"
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
              className="mono-text text-gold-dim hover:text-gold transition-colors hidden md:block"
            >
              {GENLAYER_CONTRACT_ADDRESS.slice(0, 10)}…
            </a>
            <Link href="/connect" className="btn-gold text-sm">
              Launch Console
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-32 px-6 bg-hero-gradient">
        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 border border-gold/20 bg-gold/5 text-gold text-xs font-medium px-4 py-2 rounded-full mb-8 mono-text">
            <span className="w-1.5 h-1.5 rounded-full bg-gold animate-glow-pulse" />
            GenLayer Intelligent Contract · StudioNet · Live
          </div>

          <h1 className="display-text text-6xl md:text-8xl font-light text-ivory leading-none mb-6">
            Personalized Comfort<br />
            <span className="italic text-gold">for Every Stay</span>
          </h1>

          <p className="text-ivory-dim text-lg md:text-xl max-w-2xl mx-auto mb-4 leading-relaxed">
            Comfot uses GenLayer validator consensus to turn guest reviews,
            loyalty history and conversation signals into validated room,
            amenity and package recommendations.
          </p>

          <p className="text-ivory-faint text-sm font-medium mb-12 mono-text">
            "Personalized comfort should not be guessed. It should be validated."
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/connect"
              className="btn-gold inline-flex items-center gap-2 text-base px-8 py-3.5"
            >
              Launch Hotel Console <ArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="https://docs.genlayer.com"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-outline inline-flex items-center gap-2 text-base px-8 py-3.5"
            >
              How GenLayer Powers It
            </a>
          </div>
        </div>
      </section>

      {/* Why personalization is subjective */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">The Problem</p>
            <h2 className="display-text text-4xl md:text-5xl font-light text-ivory">
              Guest comfort is inherently subjective
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="glass-card rounded-2xl p-8">
              <p className="text-ivory-dim text-sm mono-text mb-4">Guest A says:</p>
              <p className="display-text text-2xl text-ivory italic mb-6">
                "I prefer a quiet room."
              </p>
              <p className="text-ivory-dim text-sm leading-relaxed">
                Means: High floor, executive suite, away from elevator.
                Business centre access. Late checkout. No bar noise.
                Feather-free pillow menu.
              </p>
            </div>
            <div className="glass-card rounded-2xl p-8">
              <p className="text-ivory-dim text-sm mono-text mb-4">Guest B says:</p>
              <p className="display-text text-2xl text-ivory italic mb-6">
                "I prefer a quiet room."
              </p>
              <p className="text-ivory-dim text-sm leading-relaxed">
                Means: Spa package, wellness retreat, low-touch service,
                garden suite, private dining, evening aromatherapy.
                No business centre. No lounge.
              </p>
            </div>
          </div>

          <p className="text-center text-ivory-dim mt-10 max-w-2xl mx-auto">
            The same phrase. Completely different needs. A keyword match fails both guests.
            A deterministic rule engine fails both guests. <span className="text-gold">GenLayer validators judge semantic alignment.</span>
          </p>
        </div>
      </section>

      {/* Why normal engines fail */}
      <section className="py-24 px-6 bg-panel">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">The Gap</p>
            <h2 className="display-text text-4xl md:text-5xl font-light text-ivory">
              Why normal recommendation<br className="hidden md:block" /> engines fall short
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                title: "Rule-based systems",
                flaw: "Cannot handle nuance. \"Spa user\" + \"early riser\" = different spa slots, different packages, different room floors. Rules cannot capture this.",
              },
              {
                title: "Keyword matching",
                flaw: "\"Quiet\" is not a feature. It's a feeling. No keyword maps cleanly to the right room, amenity, or pre-arrival message.",
              },
              {
                title: "Single AI model",
                flaw: "One model, one interpretation. No independent verification. No consensus. No ability to judge whether the output is actually aligned.",
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

      {/* How GenLayer validates */}
      <section className="py-24 px-6 border-t border-border">
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
                title: "Non-deterministic LLM",
                desc: "The contract runs LLM inference on guest reviews, loyalty data and conversation history to extract preference tags.",
              },
              {
                icon: <Shield className="w-5 h-5 text-gold" />,
                title: "Multi-validator Consensus",
                desc: "Independent GenLayer validators each judge semantic alignment. Consensus decides: approved, rejected, or escalated.",
              },
              {
                icon: <Eye className="w-5 h-5 text-gold" />,
                title: "On-chain Verdict",
                desc: "Every decision — with full reasoning, dimension scores, and validator flags — is stored immutably on StudioNet.",
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

      {/* Architecture */}
      <section className="py-24 px-6 bg-panel">
        <div className="max-w-4xl mx-auto text-center">
          <p className="mono-text text-gold mb-3">Architecture</p>
          <h2 className="display-text text-4xl font-light text-ivory mb-8">Backendless by design</h2>
          <p className="text-ivory-dim mb-12">
            No database. No API server. No backend logic. The GenLayer Intelligent Contract
            is the source of truth — storing hotel profiles, guest signals, recommendations,
            validation results and escalation state.
          </p>

          <div className="glass-card rounded-2xl p-8 text-left font-mono text-sm space-y-2">
            {[
              ["Frontend (Next.js)", "ivory-dim"],
              ["     ↓", "border"],
              ["Connected Wallet (injected)", "ivory-dim"],
              ["     ↓", "border"],
              ["GenLayer JS SDK / RPC", "gold-dim"],
              ["     ↓", "border"],
              ["ComfotContract.py · StudioNet · 0x28351D…", "gold"],
              ["     ↓", "border"],
              ["Validator 1 → LLM inference → vote", "ivory-dim"],
              ["Validator 2 → LLM inference → vote", "ivory-dim"],
              ["Validator N → LLM inference → vote", "ivory-dim"],
              ["     ↓", "border"],
              ["eq_principle consensus → APPROVED / REJECTED / ESCALATED", "success"],
            ].map(([line, color], i) => (
              <div key={i} className={`text-${color}`}>{line}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Verdict types */}
      <section className="py-24 px-6 border-t border-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="mono-text text-gold mb-3">Outcomes</p>
            <h2 className="display-text text-4xl font-light text-ivory">
              Three possible verdicts
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-card rounded-xl p-6 border border-success/20">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="mono-text text-success font-medium">APPROVED</span>
              </div>
              <p className="text-ivory-dim text-sm">
                Alignment score ≥ 75. Validators agree the recommendation
                meaningfully matches the guest's documented needs. Safe to send.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-warning/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-warning" />
                <span className="mono-text text-warning font-medium">ESCALATED</span>
              </div>
              <p className="text-ivory-dim text-sm">
                Score 45–74. Evidence is thin or alignment is uncertain.
                A human reviewer at the hotel must approve or reject.
              </p>
            </div>
            <div className="glass-card rounded-xl p-6 border border-danger/20">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-danger" />
                <span className="mono-text text-danger font-medium">REJECTED</span>
              </div>
              <p className="text-ivory-dim text-sm">
                Score &lt; 45 or the recommendation directly contradicts a
                documented guest need. Do not use this recommendation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 bg-panel border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="display-text text-4xl md:text-5xl font-light text-ivory mb-6">
            Ready to validate comfort?
          </h2>
          <p className="text-ivory-dim mb-10">
            Connect your wallet and register your hotel on StudioNet.
            No database. No backend. Just GenLayer.
          </p>
          <Link
            href="/connect"
            className="btn-gold inline-flex items-center gap-2 text-base px-10 py-4"
          >
            Open Hotel Console <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-ivory-dim text-xs">
          <span className="display-text text-lg text-ivory">Comfot</span>
          <span>Personalized Comfort for Every Stay</span>
          <a
            href={studioContractLink(GENLAYER_CONTRACT_ADDRESS)}
            target="_blank"
            rel="noopener noreferrer"
            className="mono-text hover:text-gold transition-colors"
          >
            {GENLAYER_CONTRACT_ADDRESS}
          </a>
        </div>
      </footer>
    </div>
  )
}
