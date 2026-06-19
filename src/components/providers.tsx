"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider } from "wagmi"
import { wagmiConfig } from "@/lib/wagmi"
import { useState } from "react"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }))

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1A1815",
              color: "#F2EDE4",
              border: "1px solid #252220",
              fontFamily: "var(--font-inter)",
              fontSize: "13px",
            },
          }}
        />
      </QueryClientProvider>
    </WagmiProvider>
  )
}
