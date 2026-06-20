import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

// GET /api/guest-pii?guest_id=guest_1&hotel_address=0x...
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const guest_id = searchParams.get("guest_id")
  const hotel_address = searchParams.get("hotel_address")?.toLowerCase()

  if (!guest_id || !hotel_address) {
    return NextResponse.json({ error: "guest_id and hotel_address required" }, { status: 400 })
  }

  const db = getServerSupabase()
  const { data, error } = await db
    .from("guest_pii")
    .select("*")
    .eq("guest_id", guest_id)
    .eq("hotel_address", hotel_address)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// POST /api/guest-pii — upsert PII record
export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    guest_id, hotel_address, guest_ref,
    full_name, email, phone, nationality,
    passport_number, date_of_birth, notes,
  } = body

  if (!guest_id || !hotel_address || !guest_ref) {
    return NextResponse.json({ error: "guest_id, hotel_address, guest_ref required" }, { status: 400 })
  }

  const db = getServerSupabase()
  const { data, error } = await db
    .from("guest_pii")
    .upsert(
      {
        guest_id,
        hotel_address: hotel_address.toLowerCase(),
        guest_ref,
        full_name: full_name || null,
        email: email || null,
        phone: phone || null,
        nationality: nationality || null,
        passport_number: passport_number || null,
        date_of_birth: date_of_birth || null,
        notes: notes || null,
      },
      { onConflict: "guest_id,hotel_address" }
    )
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

// DELETE /api/guest-pii?guest_id=...&hotel_address=...
export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const guest_id = searchParams.get("guest_id")
  const hotel_address = searchParams.get("hotel_address")?.toLowerCase()

  if (!guest_id || !hotel_address) {
    return NextResponse.json({ error: "guest_id and hotel_address required" }, { status: 400 })
  }

  const db = getServerSupabase()
  const { error } = await db
    .from("guest_pii")
    .delete()
    .eq("guest_id", guest_id)
    .eq("hotel_address", hotel_address)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
