export interface GuestPII {
  id: string
  guest_id: string
  hotel_address: string
  guest_ref: string
  full_name: string | null
  email: string | null
  phone: string | null
  nationality: string | null
  passport_number: string | null
  date_of_birth: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface HotelContact {
  id: string
  hotel_address: string
  hotel_name: string | null
  contact_email: string | null
  notify_escalations: boolean
  notify_finalized: boolean
  created_at: string
  updated_at: string
}

export interface NotificationRecord {
  id: string
  hotel_address: string
  type: "escalation" | "finalized" | "rejected"
  subject: string
  body: string
  rec_id: string | null
  escalation_id: string | null
  tx_hash: string | null
  sent_at: string
  delivered: boolean
  error: string | null
}

export interface Database {
  public: {
    Tables: {
      guest_pii: {
        Row: GuestPII
        Insert: Omit<GuestPII, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<GuestPII, "id" | "created_at">>
      }
      hotel_contacts: {
        Row: HotelContact
        Insert: Omit<HotelContact, "id" | "created_at" | "updated_at">
        Update: Partial<Omit<HotelContact, "id" | "created_at">>
      }
      notifications: {
        Row: NotificationRecord
        Insert: Omit<NotificationRecord, "id" | "sent_at">
        Update: Partial<Omit<NotificationRecord, "id">>
      }
    }
  }
}
