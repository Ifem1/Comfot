import { create } from "zustand"
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
