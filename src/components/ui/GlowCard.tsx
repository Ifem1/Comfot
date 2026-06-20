"use client"

import { motion } from "framer-motion"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface GlowCardProps {
  children: React.ReactNode
  className?: string
  glowColor?: string // tailwind colour string e.g. "gold" | "success" | "danger" | "warning"
}

export function GlowCard({ children, className = "", glowColor = "gold" }: GlowCardProps) {
  const [clicked, setClicked] = useState(false)

  const glowMap: Record<string, string> = {
    gold:    "0 0 24px 4px rgba(201,168,76,0.35)",
    success: "0 0 24px 4px rgba(74,222,128,0.25)",
    danger:  "0 0 24px 4px rgba(239,68,68,0.25)",
    warning: "0 0 24px 4px rgba(251,191,36,0.25)",
  }

  const clickGlowMap: Record<string, string> = {
    gold:    "0 0 40px 10px rgba(201,168,76,0.55)",
    success: "0 0 40px 10px rgba(74,222,128,0.45)",
    danger:  "0 0 40px 10px rgba(239,68,68,0.45)",
    warning: "0 0 40px 10px rgba(251,191,36,0.45)",
  }

  const handleClick = () => {
    setClicked(true)
    setTimeout(() => setClicked(false), 600)
  }

  return (
    <motion.div
      onClick={handleClick}
      whileHover={{
        y: -6,
        boxShadow: glowMap[glowColor] ?? glowMap.gold,
        transition: { duration: 0.2 },
      }}
      animate={clicked ? {
        boxShadow: [clickGlowMap[glowColor], glowMap[glowColor], "none"],
        transition: { duration: 0.5 },
      } : {}}
      className={cn("cursor-pointer", className)}
    >
      {children}
    </motion.div>
  )
}
