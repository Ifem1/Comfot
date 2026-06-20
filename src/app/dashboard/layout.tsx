"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount, useDisconnect, useSwitchChain } from "wagmi"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { Loader2, AlertTriangle } from "lucide-react"
import { useTxRecovery } from "@/hooks/useTxPoller"
import { GENLAYER_CHAIN_ID } from "@/lib/genlayer/config"
import { SparkleBackground } from "@/components/ui/SparkleBackground"

function TxRecoveryMount() {
  useTxRecovery()
  return null
}

function WrongNetworkOverlay() {
  const { switchChain, isPending } = useSwitchChain()
  const { disconnect } = useDisconnect()

  return (
    <div className="min-h-screen bg-espresso flex items-center justify-center px-6">
      <div className="max-w-md w-full glass-card rounded-2xl p-10 text-center space-y-6 border border-warning/20">
        <div className="w-14 h-14 rounded-full bg-warning/10 border border-warning/20 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-warning" />
        </div>
        <div>
          <p className="display-text text-3xl font-light text-ivory mb-3">Wrong Network</p>
          <p className="text-ivory-dim text-sm leading-relaxed">
            Comfot runs on <span className="text-gold mono-text">StudioNet</span> (chain ID {GENLAYER_CHAIN_ID}).
            Your wallet is connected to a different network.
          </p>
        </div>
        <button
          onClick={() => switchChain({ chainId: GENLAYER_CHAIN_ID })}
          disabled={isPending}
          className="btn-gold w-full disabled:opacity-50"
        >
          {isPending ? "Switching…" : "Switch to StudioNet"}
        </button>
        <p className="text-ivory-faint text-xs">
          If StudioNet is not in your wallet, add it manually: RPC{" "}
          <span className="mono-text">https://studio.genlayer.com/api</span>
        </p>
      </div>
    </div>
  )
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting, chain } = useAccount()
  const router = useRouter()

  useEffect(() => {
    if (!isConnecting && !isConnected) {
      router.push("/connect")
    }
  }, [isConnected, isConnecting, router])

  if (isConnecting) {
    return (
      <div className="min-h-screen bg-espresso flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-gold" />
      </div>
    )
  }

  if (!isConnected) return null

  if (chain?.id !== GENLAYER_CHAIN_ID) {
    return <WrongNetworkOverlay />
  }

  return (
    <div className="min-h-screen bg-espresso flex relative">
      <SparkleBackground />
      <TxRecoveryMount />
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
