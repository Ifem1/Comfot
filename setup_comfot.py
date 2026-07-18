"""
Comfot — Project Bootstrap Script
Run from: C:\\Users\\DELL\\Desktop\\GEN PJS\\Comfot
Command:  python setup_comfot.py
"""

import os
import subprocess
import sys

ROOT = os.path.dirname(os.path.abspath(__file__))

def w(path, content):
    """Write file, creating parent directories as needed."""
    full = os.path.join(ROOT, path)
    os.makedirs(os.path.dirname(full), exist_ok=True)
    with open(full, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"  created  {path}")

def run(cmd, cwd=None):
    print(f"\n$ {cmd}")
    result = subprocess.run(cmd, shell=True, cwd=cwd or ROOT)
    if result.returncode != 0:
        print(f"ERROR: command failed with code {result.returncode}")
        sys.exit(result.returncode)

print("\n=== Comfot Bootstrap ===\n")

# ─────────────────────────────────────────────
# 1. package.json
# ─────────────────────────────────────────────
w("package.json", """{
  "name": "comfot",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "type-check": "tsc --noEmit",
    "format": "prettier --write ."
  },
  "dependencies": {
    "next": "14.2.5",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@genlayer/js-sdk": "latest",
    "wagmi": "^2.12.7",
    "viem": "^2.19.3",
    "zustand": "^4.5.4",
    "@tanstack/react-query": "^5.51.23",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.4.0",
    "lucide-react": "^0.408.0",
    "recharts": "^2.12.7",
    "framer-motion": "^11.3.19",
    "date-fns": "^3.6.0",
    "@radix-ui/react-dialog": "^1.1.1",
    "@radix-ui/react-dropdown-menu": "^2.1.1",
    "@radix-ui/react-tabs": "^1.1.0",
    "@radix-ui/react-tooltip": "^1.1.2",
    "@radix-ui/react-progress": "^1.1.0",
    "@radix-ui/react-select": "^2.1.1",
    "@radix-ui/react-badge": "^1.0.1",
    "@radix-ui/react-avatar": "^1.1.0",
    "@radix-ui/react-separator": "^1.1.0",
    "sonner": "^1.5.0"
  },
  "devDependencies": {
    "typescript": "^5.5.3",
    "@types/react": "^18.3.3",
    "@types/react-dom": "^18.3.0",
    "@types/node": "^20.14.11",
    "tailwindcss": "^3.4.6",
    "autoprefixer": "^10.4.19",
    "postcss": "^8.4.39",
    "eslint": "^8.57.0",
    "eslint-config-next": "14.2.5",
    "prettier": "^3.3.3",
    "prettier-plugin-tailwindcss": "^0.6.5"
  }
}
""")

# ─────────────────────────────────────────────
# 2. tsconfig.json
# ─────────────────────────────────────────────
w("tsconfig.json", """{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
""")

# ─────────────────────────────────────────────
# 3. next.config.js
# ─────────────────────────────────────────────
w("next.config.js", """/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ]
  },
}

module.exports = nextConfig
""")

# ─────────────────────────────────────────────
# 4. tailwind.config.ts
# ─────────────────────────────────────────────
w("tailwind.config.ts", """import type { Config } from "tailwindcss"

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-cal-sans)", "var(--font-inter)", "sans-serif"],
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-in": {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(0)" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-in": "slide-in 0.2s ease-out",
      },
    },
  },
  plugins: [],
}

export default config
""")

# ─────────────────────────────────────────────
# 5. postcss.config.js
# ─────────────────────────────────────────────
w("postcss.config.js", """module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
""")

# ─────────────────────────────────────────────
# 6. .eslintrc.json
# ─────────────────────────────────────────────
w(".eslintrc.json", """{
  "extends": ["next/core-web-vitals"],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["warn"],
    "@typescript-eslint/no-explicit-any": ["warn"]
  }
}
""")

# ─────────────────────────────────────────────
# 7. .prettierrc
# ─────────────────────────────────────────────
w(".prettierrc", """{
  "semi": false,
  "singleQuote": false,
  "trailingComma": "es5",
  "tabWidth": 2,
  "printWidth": 100,
  "plugins": ["prettier-plugin-tailwindcss"]
}
""")

# ─────────────────────────────────────────────
# 8. .gitignore
# ─────────────────────────────────────────────
w(".gitignore", """# Dependencies
node_modules/
.pnp
.pnp.js

# Next.js
.next/
out/
build/

# Environment
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Python
__pycache__/
*.pyc
*.pyo
""")

# ─────────────────────────────────────────────
# 9. .env.example
# ─────────────────────────────────────────────
w(".env.example", """# Genlayer
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=           # paste after StudioNet deploy
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Comfot
""")

# ─────────────────────────────────────────────
# 10. .env.local (safe placeholder — gitignored)
# ─────────────────────────────────────────────
w(".env.local", """NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=
NEXT_PUBLIC_GENLAYER_RPC_URL=https://studio.genlayer.com/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_NAME=Comfot
""")

# ─────────────────────────────────────────────
# 11. vercel.json
# ─────────────────────────────────────────────
w("vercel.json", """{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "regions": ["sin1", "iad1"],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    }
  ]
}
""")

# ─────────────────────────────────────────────
# 12. src/app/globals.css
# ─────────────────────────────────────────────
w("src/app/globals.css", """@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 199 89% 48%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 199 89% 48%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 199 89% 48%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 199 89% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer utilities {
  .scrollbar-hide {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
  .scrollbar-hide::-webkit-scrollbar {
    display: none;
  }
}
""")

# ─────────────────────────────────────────────
# 13. src/lib/utils.ts
# ─────────────────────────────────────────────
w("src/lib/utils.ts", """import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatAddress(address: string): string {
  if (!address) return ""
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function formatTimestamp(ts: number): string {
  return new Date(ts * 1000).toLocaleString()
}

export function scoreToColor(score: number): string {
  if (score >= 80) return "text-emerald-600"
  if (score >= 60) return "text-amber-500"
  return "text-red-500"
}

export function scoreToLabel(score: number): string {
  if (score >= 80) return "Excellent"
  if (score >= 60) return "Good"
  if (score >= 40) return "Fair"
  return "Poor"
}

export function statusToVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved": return "default"
    case "rejected": return "destructive"
    case "escalated": return "secondary"
    default: return "outline"
  }
}
""")

# ─────────────────────────────────────────────
# 14. src/lib/constants.ts
# ─────────────────────────────────────────────
w("src/lib/constants.ts", """export const GENLAYER_CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS || ""
export const GENLAYER_RPC_URL = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"
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
""")

# ─────────────────────────────────────────────
# 15. src/lib/genlayer.ts
# ─────────────────────────────────────────────
w("src/lib/genlayer.ts", """import { GENLAYER_CONTRACT_ADDRESS, GENLAYER_RPC_URL } from "./constants"

// Genlayer JS SDK client
// The SDK exposes a JSON-RPC interface to StudioNet
let client: GenLayerClient | null = null

interface GenLayerClient {
  readContract: (params: ReadParams) => Promise<unknown>
  writeContract: (params: WriteParams) => Promise<string>
}

interface ReadParams {
  address: string
  method: string
  args?: unknown[]
}

interface WriteParams {
  address: string
  method: string
  args?: unknown[]
  value?: bigint
}

function getClient(): GenLayerClient {
  if (!client) {
    // Dynamic import to support SSR
    // Replace with actual SDK instantiation once address is set
    client = {
      async readContract({ address, method, args = [] }: ReadParams) {
        const res = await fetch(GENLAYER_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_call",
            params: [{ to: address, data: encodeCall(method, args) }, "latest"],
            id: 1,
          }),
        })
        const json = await res.json()
        if (json.error) throw new Error(json.error.message)
        return json.result
      },
      async writeContract({ address, method, args = [] }: WriteParams) {
        const res = await fetch(GENLAYER_RPC_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            jsonrpc: "2.0",
            method: "eth_sendTransaction",
            params: [{ to: address, data: encodeCall(method, args) }],
            id: 1,
          }),
        })
        const json = await res.json()
        if (json.error) throw new Error(json.error.message)
        return json.result as string
      },
    }
  }
  return client
}

function encodeCall(method: string, args: unknown[]): string {
  // Placeholder — real ABI encoding handled by Genlayer SDK
  return JSON.stringify({ method, args })
}

export async function readContract<T = unknown>(method: string, args: unknown[] = []): Promise<T> {
  if (!GENLAYER_CONTRACT_ADDRESS) throw new Error("Contract address not set. Deploy contract first.")
  const c = getClient()
  return c.readContract({ address: GENLAYER_CONTRACT_ADDRESS, method, args }) as Promise<T>
}

export async function writeContract(method: string, args: unknown[] = []): Promise<string> {
  if (!GENLAYER_CONTRACT_ADDRESS) throw new Error("Contract address not set. Deploy contract first.")
  const c = getClient()
  return c.writeContract({ address: GENLAYER_CONTRACT_ADDRESS, method, args })
}
""")

# ─────────────────────────────────────────────
# 16. src/lib/wagmi.ts
# ─────────────────────────────────────────────
w("src/lib/wagmi.ts", """import { createConfig, http } from "wagmi"
import { mainnet, sepolia } from "wagmi/chains"
import { injected } from "wagmi/connectors"

// No WalletConnect — uses window.ethereum (MetaMask / any browser wallet)
export const wagmiConfig = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected({ shimDisconnect: true }),
  ],
})
""")

# ─────────────────────────────────────────────
# 17. src/types/contract.ts
# ─────────────────────────────────────────────
w("src/types/contract.ts", """export type LoyaltyTier = "bronze" | "silver" | "gold" | "platinum"
export type PropertyType = "luxury" | "boutique" | "resort" | "business" | "lifestyle"
export type RecommendationStatus = "pending" | "approved" | "rejected" | "escalated"
export type ConsensusResult = "pass" | "fail" | "escalate"
export type VoteDecision = "approve" | "reject" | "escalate"
export type EventType =
  | "hotel_registered"
  | "guest_submitted"
  | "recommendation_requested"
  | "vote_cast"
  | "consensus_finalized"
  | "escalation_raised"
  | "escalation_resolved"

export interface Hotel {
  address: string
  name: string
  property_type: PropertyType
  amenities: string[]
  room_types: string[]
  packages: string[]
  registered_at: number
  active: boolean
}

export interface Guest {
  guest_id: string
  hotel_address: string
  loyalty_tier: LoyaltyTier
  stay_count: number
  reviews: string[]
  conversation_log: string[]
  special_requests: string[]
  preference_tags: string[]
  comfot_score: number
  created_at: number
  updated_at: number
}

export interface Vote {
  validator_id: string
  decision: VoteDecision
  score: number
  reasoning: string
  submitted_at: number
}

export interface Validation {
  validation_id: string
  rec_id: string
  validator_votes: Vote[]
  consensus_result: ConsensusResult
  consensus_score: number
  created_at: number
  finalized_at: number
}

export interface Recommendation {
  rec_id: string
  hotel_address: string
  guest_id: string
  suggested_room: string
  suggested_amenities: string[]
  suggested_packages: string[]
  justification: string
  alignment_score: number
  status: RecommendationStatus
  submitted_at: number
  finalized_at: number
}

export interface AuditEntry {
  entry_id: string
  event_type: EventType
  actor: string
  entity_id: string
  details: string
  timestamp: number
}

export interface ValidatorReputation {
  validator_id: string
  total_votes: number
  consensus_matches: number
  accuracy_rate: number
  last_active: number
}

export interface Escalation {
  escalation_id: string
  rec_id: string
  reason: string
  raised_at: number
  resolved: boolean
  resolution: string
  resolved_by: string
  resolved_at: number
}
""")

# ─────────────────────────────────────────────
# 18. src/store/useAppStore.ts
# ─────────────────────────────────────────────
w("src/store/useAppStore.ts", """import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Hotel } from "@/types/contract"

interface AppState {
  hotel: Hotel | null
  setHotel: (hotel: Hotel | null) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      hotel: null,
      setHotel: (hotel) => set({ hotel }),
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
    }),
    { name: "comfot-app" }
  )
)
""")

# ─────────────────────────────────────────────
# 19. src/config/site.ts
# ─────────────────────────────────────────────
w("src/config/site.ts", """export const siteConfig = {
  name: "Comfot",
  tagline: "Personalized Comfort for Every Stay",
  description:
    "A decentralized guest experience personalization platform. AI-powered preference interpretation validated by consensus for hotels that care about every guest.",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ogImage: "/og-image.png",
  links: {
    genlayer: "https://genlayer.com",
    docs: "https://docs.genlayer.com",
  },
}
""")

# ─────────────────────────────────────────────
# 20. CI/CD
# ─────────────────────────────────────────────
w(".github/workflows/ci.yml", """name: CI

on:
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run lint
      - run: npm run type-check
      - run: npm run build
""")

w(".github/workflows/deploy.yml", """name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
          cache: "npm"
      - run: npm ci
      - run: npm run build
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: "--prod"
""")

# ─────────────────────────────────────────────
# 21. contracts/ stubs (full contract in Sprint 3)
# ─────────────────────────────────────────────
os.makedirs(os.path.join(ROOT, "contracts", "tests"), exist_ok=True)
w("contracts/.gitkeep", "")
w("contracts/tests/.gitkeep", "")

# ─────────────────────────────────────────────
# 22. docs/
# ─────────────────────────────────────────────
w("docs/architecture.md", """# Comfot Architecture

See full architecture in the project README and planning session.

Stack: Next.js 14 + WalletConnect + Genlayer Intelligent Contract (StudioNet)
""")

w("docs/contract.md", """# Comfot Intelligent Contract

Contract: comfot_contract.py
Network: StudioNet
Token: GEN

Deploy: python contracts/deploy.py
""")

w("docs/deployment.md", """# Deployment Guide

1. Deploy contract: python contracts/deploy.py
2. Copy contract address
3. Add to .env.local: NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
4. Add to Vercel env vars
5. Push to main → auto-deploy via GitHub Actions
""")

# ─────────────────────────────────────────────
# 23. public/ placeholder
# ─────────────────────────────────────────────
os.makedirs(os.path.join(ROOT, "public"), exist_ok=True)

# ─────────────────────────────────────────────
# 24. Install dependencies
# ─────────────────────────────────────────────
print("\n=== Installing dependencies (this takes ~60 seconds) ===\n")
run("npm install")

print("\n")
print("=" * 55)
print("  Comfot bootstrap complete!")
print("=" * 55)
print()
print("  Next steps:")
print("  1. Run: npm run dev")
print("     App will be at: http://localhost:3000")
print("  2. Make sure MetaMask is installed in your browser")
print("     https://metamask.io  (no signup needed for the app)")
print("  3. No API keys or accounts needed — wallet connects directly")
print()
print("  Sprint 2 script (pages + layout) is next.")
print("=" * 55)
