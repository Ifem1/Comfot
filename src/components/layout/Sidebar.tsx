"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import {
  LayoutDashboard, Users, Sparkles, AlertTriangle,
  ScrollText, BarChart3, SlidersHorizontal, Settings, X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAppStore } from "@/store/useAppStore"
import { useHotel } from "@/hooks/useHotel"
import { useAccount } from "wagmi"
import { unsplash, hotelImage } from "@/lib/images"

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
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-20 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-60 bg-panel border-r border-border z-30 flex flex-col transition-transform duration-200",
          "lg:translate-x-0 lg:static lg:z-auto",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Hotel cover image */}
        <AnimatePresence mode="wait">
          {hotel && (
            <motion.div
              key={hotel.name}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="relative h-28 w-full overflow-hidden shrink-0"
            >
              <Image
                src={unsplash(hotelImage(hotel.property_type), 480, 224)}
                alt={hotel.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-panel" />
              <div className="absolute bottom-0 left-0 right-0 px-4 pb-3">
                <p className="display-text text-lg font-light text-ivory leading-tight truncate">{hotel.name}</p>
                <p className="mono-text text-gold text-xs capitalize">{hotel.property_type} · {hotel.star_rating}★</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logo (shown when no hotel image) */}
        {!hotel && (
          <div className="px-5 h-16 flex items-center justify-between border-b border-border shrink-0">
            <Link href="/dashboard" className="min-w-0">
              <div className="display-text text-2xl font-light text-ivory hover:text-gold transition-colors leading-none">Comfot</div>
              {address && <div className="mono-text text-ivory-faint text-xs mt-0.5">Not registered</div>}
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ivory-dim hover:text-ivory shrink-0 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {hotel && (
          <div className="px-5 h-8 flex items-center justify-between shrink-0">
            <Link href="/dashboard">
              <span className="display-text text-base font-light text-ivory-faint hover:text-gold transition-colors">Comfot</span>
            </Link>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-ivory-dim hover:text-ivory">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto">
          {NAV.map((item, i) => {
            const active = pathname === item.href
            const Icon = item.icon
            return (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04, duration: 0.3 }}
              >
                <Link
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
              </motion.div>
            )
          })}
        </nav>

        {/* Status badge */}
        <div className="px-4 py-4 border-t border-border space-y-2 shrink-0">
          <div className="rounded px-3 py-2.5 flex items-center gap-2 bg-success/5 border border-success/10">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-glow-pulse" />
            <span className="mono-text text-success text-xs">StudioNet · Live</span>
          </div>
          {hotel && (
            <div className="rounded px-3 py-2 flex items-center gap-2 bg-gold/5 border border-gold/10">
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
              <span className="mono-text text-gold text-xs truncate capitalize">{hotel.property_type}</span>
            </div>
          )}
        </div>
      </aside>
    </>
  )
}
