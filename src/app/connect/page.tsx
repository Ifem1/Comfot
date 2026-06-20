"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useConnect, useDisconnect, useSwitchChain } from "wagmi"
import { toast } from "sonner"
import { ArrowRight, Wifi, WifiOff, ExternalLink, AlertTriangle } from "lucide-react"
import { GENLAYER_CONTRACT_ADDRESS, GENLAYER_CHAIN_ID, studioContractLink } from "@/lib/genlayer/config"

export default function ConnectPage() {
  const router = useRouter()
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  useEffect(() => {
    if (isConnected) {
      const timer = setTimeout(() => router.push("/dashboard"), 800)
      return () => clearTimeout(timer)
    }
  }, [isConnected, router])

  const handleConnect = () => {
    const injected = connectors.find((c) => c.id === "injected")
    if (!injected) {
      toast.error("No injected wallet found. Please install MetaMask.")
      return
    }
    connect({ connector: injected, chainId: GENLAYER_CHAIN_ID })
  }

  const wrongChain = isConnected && chain?.id !== GENLAYER_CHAIN_ID

  return (
    <div className="min-h-screen bg-espresso text-ivory flex flex-col">
      {/* Top bar */}
      <nav className="border-b border-border/50 px-8 h-16 flex items-center justify-between">
        <a href="/" className="display-text text-2xl font-light text-ivory hover:text-gold transition-colors">
          Comfot
        </a>
        <a
          href={studioContractLink(GENLAYER_CONTRACT_ADDRESS)}
          target="_blank"
          rel="noopener noreferrer"
          className="mono-text text-xs text-gold-dim hover:text-gold transition-colors flex items-center gap-1"
        >
          Contract <ExternalLink className="w-3 h-3" />
        </a>
      </nav>

      {/* Main */}
      <div className="flex flex-1 items-center justify-center px-6 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-10">
            <div className="display-text text-5xl font-light text-ivory mb-3">
              Hotel Console
            </div>
            <p className="text-ivory-dim text-sm leading-relaxed">
              Connect your wallet to manage your hotel, submit guest profiles
              and validate comfort recommendations on StudioNet.
            </p>
          </div>

          {/* Status */}
          {isConnected ? (
            <div className="glass-card rounded-xl p-6 mb-6 border border-success/20">
              <div className="flex items-center gap-2 text-success text-sm mb-3">
                <Wifi className="w-4 h-4" />
                <span className="font-medium">Wallet Connected</span>
              </div>
              <p className="mono-text text-ivory text-xs break-all mb-1">{address}</p>
              <p className="mono-text text-ivory-dim text-xs">
                Chain: {chain?.name ?? "Unknown"} ({chain?.id})
              </p>
              {wrongChain && (
                <div className="mt-3 space-y-2">
                  <div className="flex items-center gap-1.5 text-warning text-xs">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    Wrong network — switch to StudioNet (chain ID {GENLAYER_CHAIN_ID})
                  </div>
                  <button
                    onClick={() => switchChain({ chainId: GENLAYER_CHAIN_ID })}
                    disabled={isSwitching}
                    className="w-full text-xs px-3 py-2 rounded bg-warning/10 border border-warning/30 text-warning hover:bg-warning/20 transition-colors disabled:opacity-50"
                  >
                    {isSwitching ? "Switching…" : "Switch to StudioNet"}
                  </button>
                </div>
              )}
              <p className="text-ivory-dim text-xs mt-4 animate-fade-in">
                Redirecting to console…
              </p>
            </div>
          ) : (
            <div className="glass-card rounded-xl p-6 mb-6 border border-border">
              <div className="flex items-center gap-2 text-ivory-dim text-sm mb-3">
                <WifiOff className="w-4 h-4" />
                <span>No wallet connected</span>
              </div>
              <p className="text-ivory-dim text-xs">
                MetaMask or any window.ethereum-compatible wallet is required.
              </p>
            </div>
          )}

          {/* Action */}
          {isConnected ? (
            <div className="flex gap-3">
              <button
                onClick={() => router.push("/dashboard")}
                className="btn-gold flex-1 flex items-center justify-center gap-2"
              >
                Go to Console <ArrowRight className="w-4 h-4" />
              </button>
              <button
                onClick={() => disconnect()}
                className="btn-outline px-4"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isPending}
              className="btn-gold w-full flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isPending ? "Connecting…" : "Connect Wallet"}
              {!isPending && <ArrowRight className="w-4 h-4" />}
            </button>
          )}

          {/* Network info */}
          <div className="mt-10 glass-card rounded-xl p-5 space-y-3">
            <p className="mono-text text-xs text-gold mb-3">Network Details</p>
            {[
              ["Network", "StudioNet"],
              ["Chain ID", String(GENLAYER_CHAIN_ID)],
              ["RPC", "https://studio.genlayer.com/api"],
              ["Contract", GENLAYER_CONTRACT_ADDRESS],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-start gap-4">
                <span className="text-ivory-dim text-xs">{label}</span>
                <span className="mono-text text-xs text-ivory text-right break-all max-w-[200px]">{value}</span>
              </div>
            ))}
          </div>

          <p className="text-center text-ivory-faint text-xs mt-6">
            No signup. No backend. Just your wallet.
          </p>
        </div>
      </div>
    </div>
  )
}
