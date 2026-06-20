"use client"

import { useAccount, useDisconnect } from "wagmi"
import { Menu, LogOut, Copy, Check, ExternalLink, Home } from "lucide-react"
import { useState } from "react"
import Link from "next/link"
import { formatAddress } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { GENLAYER_CONTRACT_ADDRESS, studioContractLink } from "@/lib/genlayer/config"
import { TxTray } from "@/components/TxTray"

export function TopNav({ title }: { title?: string }) {
  const { address } = useAccount()
  const { disconnect } = useDisconnect()
  const { setSidebarOpen } = useAppStore()
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const router = useRouter()

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    toast.success("Address copied")
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDisconnect = () => {
    disconnect()
    router.push("/connect")
  }

  return (
    <header className="h-16 border-b border-border bg-panel/80 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden text-ivory-dim hover:text-ivory"
        >
          <Menu className="w-5 h-5" />
        </button>
        {title && (
          <h1 className="display-text text-2xl font-light text-ivory">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Link href="/" className="hidden md:flex items-center gap-1.5 text-ivory-faint hover:text-gold transition-colors text-xs mono-text">
          <Home className="w-3.5 h-3.5" /> Home
        </Link>
        <TxTray />
        <a
          href={studioContractLink(GENLAYER_CONTRACT_ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="hidden md:flex items-center gap-1.5 mono-text text-gold-dim hover:text-gold transition-colors"
        >
          {GENLAYER_CONTRACT_ADDRESS.slice(0, 8)}…
          <ExternalLink className="w-3 h-3" />
        </a>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 bg-card border border-border hover:border-gold-dim rounded px-3 py-2 text-sm text-ivory-dim hover:text-ivory transition-colors"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
            <span className="mono-text">{address ? formatAddress(address) : "Connected"}</span>
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-11 w-52 bg-card rounded-xl border border-border py-1 z-50 shadow-2xl">
                <button
                  onClick={copyAddress}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-ivory-dim hover:text-ivory hover:bg-card-hi transition-colors"
                >
                  {copied
                    ? <Check className="w-4 h-4 text-success" />
                    : <Copy className="w-4 h-4" />}
                  Copy address
                </button>
                <div className="border-t border-border my-1" />
                <button
                  onClick={handleDisconnect}
                  className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-danger hover:bg-danger/5 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Disconnect
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
