/**
 * POST /api/notify
 * Called by the frontend after a tx finalizes with a notable outcome:
 *   - recommendation escalated → email hotel staff
 *   - recommendation rejected  → email hotel staff (if opted in)
 *   - recommendation finalized → email hotel staff (if opted in)
 *
 * We don't send email directly here (no email provider wired yet).
 * We log the notification to Supabase and mark delivered=false.
 * When you add Resend / SendGrid, swap the TODO block below.
 */

import { NextRequest, NextResponse } from "next/server"
import { getServerSupabase } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  const body = await req.json()
  const {
    hotel_address,
    type,            // 'escalation' | 'finalized' | 'rejected'
    rec_id,
    escalation_id,
    tx_hash,
    guest_name,
    alignment_score,
    suggested_room,
  } = body

  if (!hotel_address || !type) {
    return NextResponse.json({ error: "hotel_address and type required" }, { status: 400 })
  }

  const db = getServerSupabase()

  // 1. Check hotel contact prefs
  const { data: contact } = await db
    .from("hotel_contacts")
    .select("contact_email, notify_escalations, notify_finalized")
    .eq("hotel_address", hotel_address.toLowerCase())
    .maybeSingle()

  const shouldSend =
    (type === "escalation" && contact?.notify_escalations) ||
    (type === "finalized" && contact?.notify_finalized) ||
    (type === "rejected" && contact?.notify_escalations)

  // 2. Build notification content
  const subjects: Record<string, string> = {
    escalation: `[Comfot] Human review required — ${guest_name ?? rec_id}`,
    finalized:  `[Comfot] Recommendation finalized — ${guest_name ?? rec_id}`,
    rejected:   `[Comfot] Recommendation rejected — ${guest_name ?? rec_id}`,
  }

  const bodies: Record<string, string> = {
    escalation: `A recommendation for ${guest_name ?? "a guest"} has been escalated for human review.\n\nAlignment score: ${alignment_score ?? "—"}\nSuggested room: ${suggested_room ?? "—"}\nRecommendation ID: ${rec_id ?? "—"}\n\nPlease log in to Comfot to review and resolve.`,
    finalized:  `A recommendation for ${guest_name ?? "a guest"} has been finalized by validator consensus.\n\nAlignment score: ${alignment_score ?? "—"}\nSuggested room: ${suggested_room ?? "—"}\nRecommendation ID: ${rec_id ?? "—"}`,
    rejected:   `A recommendation for ${guest_name ?? "a guest"} was rejected by validator consensus.\n\nAlignment score: ${alignment_score ?? "—"}\nRecommendation ID: ${rec_id ?? "—"}\n\nYou may re-submit a new recommendation after updating the guest profile.`,
  }

  // 3. Log to notifications table
  const { data: notif, error: insertErr } = await db
    .from("notifications")
    .insert({
      hotel_address: hotel_address.toLowerCase(),
      type,
      subject: subjects[type] ?? `[Comfot] ${type}`,
      body: bodies[type] ?? "",
      rec_id: rec_id ?? null,
      escalation_id: escalation_id ?? null,
      tx_hash: tx_hash ?? null,
      delivered: false,
      error: null,
    })
    .select()
    .single()

  if (insertErr) {
    return NextResponse.json({ error: insertErr.message }, { status: 500 })
  }

  // 4. Send email via Brevo
  if (shouldSend && contact?.contact_email) {
    const brevoKey = process.env.BREVO_API_KEY
    const fromEmail = process.env.BREVO_FROM_EMAIL ?? "onwukweify19@gmail.com"
    const fromName = process.env.BREVO_FROM_NAME ?? "Comfot"

    if (brevoKey) {
      try {
        const emailRes = await fetch("https://api.brevo.com/v3/smtp/email", {
          method: "POST",
          headers: {
            "accept": "application/json",
            "api-key": brevoKey,
            "content-type": "application/json",
          },
          body: JSON.stringify({
            sender: { name: fromName, email: fromEmail },
            to: [{ email: contact.contact_email }],
            subject: notif.subject,
            textContent: notif.body,
            htmlContent: `<pre style="font-family:sans-serif;white-space:pre-wrap">${notif.body}</pre>`,
          }),
        })

        if (emailRes.ok) {
          await db.from("notifications").update({ delivered: true }).eq("id", notif.id)
        } else {
          const errText = await emailRes.text()
          await db.from("notifications").update({ error: errText }).eq("id", notif.id)
        }
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "email send failed"
        await db.from("notifications").update({ error: msg }).eq("id", notif.id)
      }
    }
  }

  return NextResponse.json({
    logged: true,
    notification_id: notif.id,
    sent: shouldSend && !!contact?.contact_email,
    email: contact?.contact_email ?? null,
  })
}
