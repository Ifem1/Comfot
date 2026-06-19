export const GENLAYER_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || "") as `0x${string}`

export const GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"

export const GENLAYER_CHAIN_ID = Number(
  process.env.NEXT_PUBLIC_GENLAYER_CHAIN_ID || "61999"
)

// StudioNet link helpers
export function studioTxLink(hash: string): string {
  return `https://studio.genlayer.com/tx/${hash}`
}

export function studioContractLink(address: string): string {
  return `https://studio.genlayer.com/address/${address}`
}

export const STUDIO_NET = {
  id: 61999,
  name: "StudioNet",
  nativeCurrency: { name: "GEN", symbol: "GEN", decimals: 18 },
  rpcUrls: {
    default: { http: [GENLAYER_RPC_URL] },
    public: { http: [GENLAYER_RPC_URL] },
  },
} as const

// Demo data
export const DEMO_HOTEL = {
  name: "The Aurelia Lagos",
  category: "luxury",
  description:
    "A premium city hotel for executives, leisure travellers and high-value loyalty guests.",
  location: "Lagos, Nigeria",
  star_rating: 5,
  amenities: [
    "spa", "rooftop lounge", "fitness centre", "private dining",
    "airport transfer", "business centre", "quiet floor",
    "concierge", "pool", "executive lounge",
  ],
  room_types: [
    "standard", "deluxe", "executive_suite",
    "junior_suite", "accessible", "connecting", "penthouse",
  ],
  packages: [
    "romance weekend", "executive productivity",
    "wellness retreat", "family comfort", "late checkout bundle",
  ],
}

export const DEMO_GUEST = {
  guest_ref: "demo_guest_001",
  name: "Adaeze Okonkwo",
  loyalty_tier: "platinum",
  review_history: [
    "I loved the quiet upper-floor room during my last stay. The lounge access made it easy to work between meetings.",
    "The spa treatment was excellent, but I prefer appointments in the evening after work.",
  ],
  conversation_history: [
    "Guest asked if late checkout was possible because of an evening flight.",
    "Guest mentioned they prefer light meals and do not like loud bar areas.",
  ],
  special_requests: ["quiet room away from elevator", "late checkout", "evening spa slot"],
  dietary_needs: ["light meals", "no shellfish"],
  room_history: ["deluxe", "executive_suite"],
}
