import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

// GET /api/hotel-contact?hotel_address=0x...
export async function GET(req: NextRequest) {
  const hotel_address = new URL(req.url).searchParams.get("hotel_address")?.toLowerCase()
  if (!hotel_address) return NextResponse.json({ error: "hotel_address required" }, { status: 400 })

  const db = getServerSupabase()
  const { data, error } = await db
    .from("hotel_contacts")
    .select("*")
    .eq("hotel_address", hotel_address)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/hotel-contact — upsert contact prefs
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    hotel_address, hotel_name, contact_email,
    notify_escalations, notify_finalized,
  } = body

  if (!hotel_address) return NextResponse.json({ error: "hotel_address required" }, { status: 400 })

  const db = getServerSupabase()
  const { data, error } = await db
    .from("hotel_contacts")
    .upsert(
      {
        hotel_address: hotel_address.toLowerCase(),
        hotel_name: hotel_name || null,
        contact_email: contact_email || null,
        notify_escalations: notify_escalations ?? true,
        notify_finalized: notify_finalized ?? false,
      },
      { onConflict: "hotel_address" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
