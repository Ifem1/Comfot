import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

/**
 * Server-only client — uses the service role key.
 * Never import this in client components or pages.
 * Only used in Next.js API routes (src/app/api/...).
 */
export function getServerSupabase() {
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false },
  })
}
