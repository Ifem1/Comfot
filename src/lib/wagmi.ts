import { createConfig, http } from "wagmi"
import { injected } from "wagmi/connectors"
import { STUDIO_NET } from "@/lib/genlayer/config"

export const wagmiConfig = createConfig({
  chains: [STUDIO_NET],
  transports: {
    [STUDIO_NET.id]: http(STUDIO_NET.rpcUrls.default.http[0]),
  },
  connectors: [injected({ shimDisconnect: true })],
})
