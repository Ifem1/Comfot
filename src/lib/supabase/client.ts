import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/** Browser-safe client — uses anon key. */
export const supabase = createClient<Database>(url, anon)
