"use client"

import { useAccount } from "wagmi"
import { formatAddress } from "@/lib/utils"
import { Users, Sparkles, AlertTriangle, TrendingUp, ArrowRight, ExternalLink, CheckCircle } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import Image from "next/image"
import { useHotel, useHotelStats } from "@/hooks/useHotel"
import { GENLAYER_CONTRACT_ADDRESS, studioContractLink } from "@/lib/genlayer/config"
import { cn } from "@/lib/utils"
import { unsplash, hotelImage } from "@/lib/images"

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } } }
const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.08 } } }

export default function DashboardPage() {
  const { address } = useAccount()
  const { data: hotel, isLoading: hotelLoading } = useHotel()
  const { data: stats } = useHotelStats()

  const statCards = [
    { label: "Total Guests",        value: stats?.total_guests ?? "—",       icon: Users,          href: "/dashboard/guests",          color: "text-gold" },
    { label: "Recommendations",     value: stats?.total_recommendations ?? "—", icon: Sparkles,    href: "/dashboard/recommendations", color: "text-ivory" },
    { label: "Pending Escalations", value: stats?.pending_escalations ?? "—", icon: AlertTriangle, href: "/dashboard/validations",     color: "text-warning" },
    { label: "Avg Alignment Score", value: stats?.avg_alignment_score != null ? `${Math.round(Number(stats.avg_alignment_score))}` : "—", icon: TrendingUp, href: "/dashboard/analytics", color: "text-success" },
  ]

  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Hotel hero banner */}
      {hotel && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden h-48"
        >
          <Image
            src={unsplash(hotelImage(hotel.property_type), 1200, 400)}
            alt={hotel.name}
            fill
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/90 via-espresso/60 to-transparent" />
          <div className="absolute inset-0 flex flex-col justify-end p-8">
            <p className="mono-text text-gold text-xs mb-1">Hotel Console</p>
            <h1 className="display-text text-4xl font-light text-ivory mb-1">{hotel.name}</h1>
            <p className="text-ivory-dim text-sm mono-text">{address ? formatAddress(address) : "—"}</p>
          </div>
          <div className="absolute top-5 right-5">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded border border-success/30 bg-espresso/70 backdrop-blur text-success text-xs mono-text">
              <CheckCircle className="w-3.5 h-3.5" /> Registered
            </span>
          </div>
        </motion.div>
      )}

      {/* Header (no hotel) */}
      {!hotel && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="mono-text text-gold mb-1">Hotel Console</p>
            <h1 className="display-text text-4xl font-light text-ivory">
              {hotelLoading ? "Loading…" : "Not Registered"}
            </h1>
            <p className="text-ivory-dim text-sm mt-1 mono-text">{address ? formatAddress(address) : "—"}</p>
          </div>
          {!hotelLoading && <Link href="/dashboard/settings" className="btn-gold text-sm">Register Hotel</Link>}
        </motion.div>
      )}

      {/* Stats */}
      <motion.div variants={stagger} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((s) => {
          const Icon = s.icon
          return (
            <motion.div key={s.label} variants={fadeUp}>
              <motion.div whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                <Link href={s.href} className="glass-card rounded-xl p-5 hover:border-gold/20 transition-all group block">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-card-hi flex items-center justify-center">
                      <Icon className={cn("w-4 h-4", s.color)} />
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-ivory-faint group-hover:text-gold transition-colors" />
                  </div>
                  <p className="display-text text-3xl text-ivory mb-1">{s.value}</p>
                  <p className="text-ivory-dim text-xs">{s.label}</p>
                </Link>
              </motion.div>
            </motion.div>
          )
        })}
      </motion.div>

      {/* Hotel details */}
      {hotel && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card rounded-xl p-6">
          <p className="mono-text text-gold mb-4">Hotel Profile</p>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              {[
                ["Property Type", hotel.property_type],
                ["Star Rating",   hotel.star_rating ? `${hotel.star_rating} ★` : "—"],
                ["Location",      hotel.location || "—"],
              ].map(([label, val]) => (
                <div key={label} className="flex justify-between">
                  <span className="text-ivory-dim text-xs">{label}</span>
                  <span className="text-ivory text-xs mono-text">{val}</span>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-ivory-dim text-xs mb-1.5">Room Types</p>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.room_types?.map((r) => (
                    <span key={r} className="mono-text text-gold-dim border border-border-gold rounded px-2 py-0.5 text-xs">{r}</span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-ivory-dim text-xs mb-1.5">Amenities</p>
                <div className="flex flex-wrap gap-1.5">
                  {hotel.amenities?.slice(0, 5).map((a) => (
                    <span key={a} className="mono-text text-ivory-dim border border-border rounded px-2 py-0.5 text-xs">{a}</span>
                  ))}
                  {(hotel.amenities?.length ?? 0) > 5 && (
                    <span className="mono-text text-ivory-faint text-xs">+{hotel.amenities!.length - 5} more</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick actions */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="glass-card rounded-xl p-6">
        <p className="mono-text text-gold mb-4">Quick Actions</p>
        <div className="space-y-2">
          {[
            { step: "1", label: hotel ? "Update hotel settings" : "Register your hotel", href: "/dashboard/settings" },
            { step: "2", label: "Submit a guest profile",          href: "/dashboard/guests" },
            { step: "3", label: "Request a recommendation",        href: "/dashboard/recommendations" },
            { step: "4", label: "Review pending escalations",      href: "/dashboard/validations" },
          ].map((item) => (
            <motion.div key={item.step} whileHover={{ x: 4, transition: { duration: 0.15 } }}>
              <Link href={item.href} className="flex items-center gap-4 px-4 py-3 rounded hover:bg-card-hi transition-colors group">
                <span className="w-6 h-6 rounded-full border border-gold/20 bg-gold/5 flex items-center justify-center shrink-0 mono-text text-gold text-xs">{item.step}</span>
                <span className="text-sm text-ivory-dim group-hover:text-ivory transition-colors">{item.label}</span>
                <ArrowRight className="w-3.5 h-3.5 text-ivory-faint ml-auto group-hover:text-gold transition-colors" />
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Contract badge */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="glass-card rounded-xl p-6 border border-gold/10">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-ivory text-sm font-medium mb-1">GenLayer Intelligent Contract</p>
            <p className="text-ivory-dim text-xs">All recommendations are validated by independent GenLayer validators via multi-consensus on StudioNet. Every verdict is immutable and on-chain.</p>
          </div>
          <a href={studioContractLink(GENLAYER_CONTRACT_ADDRESS)} target="_blank" rel="noopener noreferrer" className="btn-outline shrink-0 inline-flex items-center gap-2 text-xs">
            View on Studio <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </motion.div>
    </div>
  )
}
