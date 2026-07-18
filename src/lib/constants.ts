export const GENLAYER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || ""
export const GENLAYER_RPC_URL =
  process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "Comfot"
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

export const LOYALTY_TIERS = ["bronze", "silver", "gold", "platinum"] as const
export const PROPERTY_TYPES = ["luxury", "boutique", "resort", "business", "lifestyle"] as const
export const CONSENSUS_THRESHOLD = 0.66

export const NAV_LINKS = [
  { href: "/dashboard", label: "Overview", icon: "LayoutDashboard" },
  { href: "/dashboard/guests", label: "Guests", icon: "Users" },
  { href: "/dashboard/recommendations", label: "Recommendations", icon: "Sparkles" },
  { href: "/dashboard/validations", label: "Validations", icon: "ShieldCheck" },
  { href: "/dashboard/audit", label: "Audit Trail", icon: "ScrollText" },
  { href: "/dashboard/analytics", label: "Analytics", icon: "BarChart3" },
  { href: "/dashboard/preferences", label: "Preferences", icon: "SlidersHorizontal" },
  { href: "/dashboard/settings", label: "Settings", icon: "Settings" },
]
