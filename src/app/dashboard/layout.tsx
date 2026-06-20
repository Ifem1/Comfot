"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAccount } from "wagmi"
import { Sidebar } from "@/components/layout/Sidebar"
import { TopNav } from "@/components/layout/TopNav"
import { Loader2 } from "lucide-react"
import { useTxRecovery } from "@/hooks/useTxPoller"

function TxRecoveryMount() {
  useTxRecovery()
  return null
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isConnected, isConnecting } = useAccount()
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

  return (
    <div className="min-h-screen bg-espresso flex">
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
