"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, Users, Sparkles, AlertTriangle,
  ScrollText, BarChart3, SlidersHorizontal, Settings, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { useHotel } from "@/hooks/useHotel"
import { useAccount } from "wagmi"

const NAV = [
  { href: "/dashboard",                  label: "Hotel Console",      icon: LayoutDashboard },
  { href: "/dashboard/guests",           label: "Guest Dossiers",     icon: Users },
  { href: "/dashboard/recommendations",  label: "Recommendation Lab", icon: Sparkles },
  { href: "/dashboard/validations",      label: "Escalation Desk",    icon: AlertTriangle },
  { href: "/dashboard/audit",            label: "History",            icon: ScrollText },
  { href: "/dashboard/analytics",        label: "Analytics",          icon: BarChart3 },
  { href: "/dashboard/preferences",      label: "Preference Rules",   icon: SlidersHorizontal },
  { href: "/dashboard/settings",         label: "Hotel Settings",     icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, setSidebarOpen } = useAppStore()
  const { address } = useAccount()
  const { data: hotel } = useHotel()

  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-panel border-r border-border z-30 flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo + hotel identity */}
        <div className="px-5 h-16 flex items-center justify-between border-b border-border">
          <Link href="/dashboard" className="min-w-0">
            <div className="display-text text-2xl font-light text-ivory hover:text-gold transition-colors leading-none">
              Comfot
            </div>
            {hotel ? (
              <div className="text-ivory-faint text-xs truncate mt-0.5 max-w-[160px]" title={hotel.name}>
                {hotel.name}
              </div>
            ) : address ? (
              <div className="mono-text text-ivory-faint text-xs mt-0.5">Not registered</div>
            ) : null}
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-ivory-dim hover:text-ivory shrink-0 ml-2"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map((item) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors",
                  active
                    ? "bg-gold/10 text-gold border border-gold/20"
                    : "text-ivory-dim hover:text-ivory hover:bg-card"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", active ? "text-gold" : "text-ivory-faint")} />
                <span className={active ? "font-medium" : ""}>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Status badge */}
        <div className="px-4 py-4 border-t border-border space-y-2">
          <div className="rounded px-3 py-2.5 flex items-center gap-2 bg-success/5 border border-success/10">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
            <span className="mono-text text-success text-xs">StudioNet · Live</span>
          </div>
          {hotel && (
            <div className="rounded px-3 py-2 flex items-center gap-2 bg-gold/5 border border-gold/10">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="mono-text text-gold text-xs truncate">{hotel.category}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
