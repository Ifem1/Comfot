"use client"

import { motion } from "framer-motion"
import { useMemo } from "react"

function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 10000
  return x - Math.floor(x)
}

export function SparkleBackground() {
  const particles = useMemo(() => {
    return Array.from({ length: 60 }, (_, i) => ({
      id: i,
      x: seededRandom(i * 3)     * 100,
      y: seededRandom(i * 3 + 1) * 100,
      size: seededRandom(i * 3 + 2) * 2.5 + 0.5,
      duration: seededRandom(i * 7) * 4 + 3,
      delay: seededRandom(i * 11) * 5,
      opacity: seededRandom(i * 13) * 0.35 + 0.05,
      isStar: i % 7 === 0,
    }))
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
          animate={{
            opacity: [p.opacity, p.opacity * 3, p.opacity],
            scale:   [1, 1.4, 1],
            y:       [0, -8, 0],
          }}
          transition={{
            duration: p.duration,
            delay:    p.delay,
            repeat:   Infinity,
            ease:     "easeInOut",
          }}
        >
          {p.isStar ? (
            <svg width={p.size * 3} height={p.size * 3} viewBox="0 0 12 12" fill="none">
              <path
                d="M6 0 L6.8 4.5 L11 6 L6.8 7.5 L6 12 L5.2 7.5 L1 6 L5.2 4.5 Z"
                fill="#C9A84C"
                fillOpacity={p.opacity * 2.5}
              />
            </svg>
          ) : (
            <div
              className="rounded-full bg-gold"
              style={{ width: p.size, height: p.size, opacity: p.opacity }}
            />
          )}
        </motion.div>
      ))}
    </div>
  )
}
