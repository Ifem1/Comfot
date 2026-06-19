import { clsx, type ClassValue } from "clsx"
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

export function statusToVariant(
  status: string
): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "approved": return "default"
    case "rejected": return "destructive"
    case "escalated": return "secondary"
    default: return "outline"
  }
}
