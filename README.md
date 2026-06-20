# Comfot — Personalized Comfort for Every Stay

> A GenLayer-native intelligent contract that turns guest signals into validated, consensus-backed room and service recommendations.

**Live Demo:** [comfot.vercel.app](https://comfot.vercel.app)  
**Contract:** [`0x32dDA1D6f10D1F91Ba057c734986c3b58F7dB043`](https://studio.genlayer.com/contracts/0x32dDA1D6f10D1F91Ba057c734986c3b58F7dB043) on StudioNet  
**Network:** GenLayer StudioNet (chainId 61999)

---

## What It Does

Hotels collect signals about their guests — reviews, special requests, dietary needs, loyalty tier, conversation history. Turning those signals into a consistent, fair, personalised service recommendation is a judgment call that varies by staff member and shift.

Comfot puts that judgment on-chain. A hotel registers on the contract, submits anonymised guest profiles, and triggers a recommendation request. GenLayer validators independently run three AI prompts and reach consensus on the output. The result — a specific room, amenities, packages, upsell opportunities, and a pre-arrival guest message — is stored on-chain and is auditable.

No raw personal data is ever written to the blockchain. Guest PII (name, email, passport) is stored separately in Supabase, accessible only to the hotel that owns it.

---

## Why GenLayer

The recommendation engine requires a judgment call, not a computation. Any two hotel managers given the same guest profile might make different choices. That is exactly the problem GenLayer solves:

- Multiple validators each independently run the AI inference
- `gl.eq_principle.prompt_comparative` defines what "agreement" means for each step
- Consensus produces a result that no single party can manipulate

This is not a use-case where a deterministic smart contract would work. The non-determinism is the feature.

---

## How It Works

Each recommendation request triggers a three-stage AI pipeline inside the intelligent contract:

```
Guest Profile + Hotel Rules
        │
        ▼
┌─────────────────────┐
│  Profile Synthesizer │  gl.nondet.exec_prompt()
│                     │  → preference tags + comfort summary
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Recommendation      │  gl.nondet.exec_prompt()
│ Engine              │  → room, amenities, packages, upsells,
│                     │    guest message
└─────────────────────┘
        │
        ▼
┌─────────────────────┐
│ Alignment Validator │  gl.nondet.exec_prompt()
│                     │  → 5-dimension score, decision:
│                     │    approve / reject / escalate
└─────────────────────┘
        │
        ▼
  GenLayer Consensus
  (validators must agree at each stage via eq_principle)
        │
        ▼
  Result stored on-chain
```

Each stage runs across all validators independently. Consensus is required at every step before the next stage runs.

---

## Contract Functions

### Write (transactions)

| Function | Args | Description |
|---|---|---|
| `register_hotel` | name, property_type, description, location, amenities, room_types, packages, star_rating | Register a hotel wallet |
| `submit_guest_profile` | guest_ref, loyalty_tier, stay_count, total_spend_band, reviews, conversation_log, special_requests, dietary_needs, room_history, language | Submit or update an anonymised guest profile |
| `set_preference_rule` | rule_id, rule_type, rule_value, description, active | Add or update a hotel preference rule |
| `delete_preference_rule` | rule_id | Remove a preference rule |
| `request_recommendation` | guest_id | Trigger the AI recommendation pipeline |
| `resolve_escalation` | escalation_id, resolution, resolution_note | Human review of an escalated recommendation |
| `erase_guest_profile` | guest_id | GDPR erasure — wipes all guest data on-chain |

### Read (view)

`get_hotel`, `get_guest`, `get_hotel_recommendations`, `get_hotel_guest_ids`, `get_preference_rules`, `get_hotel_stats`, `get_pending_escalations`, `get_validation_for_recommendation`

---

## Data Architecture

```
On-chain (GenLayer)                Off-chain (Supabase — server only)
─────────────────────────────      ──────────────────────────────────
Hotel profile                      guest_pii      (name, email, passport,
Guest profile (anonymised)           phone, nationality — per hotel)
Preference rules                   hotel_contacts (notification prefs,
Recommendations                      contact email)
Validator decisions                notifications  (email log, delivery status)
Escalation records
```

The Supabase service role key is never exposed to the browser. All off-chain reads and writes go through Next.js API routes (`/api/guest-pii`, `/api/hotel-contact`, `/api/notify`).

---

## Tech Stack

| Layer | Tech |
|---|---|
| Intelligent contract | Python, GenLayer SDK (`py-genlayer`) |
| Blockchain | GenLayer StudioNet |
| Frontend | Next.js 14 (App Router), TypeScript |
| Wallet | wagmi v2, RainbowKit, MetaMask |
| Chain client | genlayer-js v1.1.8 |
| Off-chain storage | Supabase (Postgres) |
| Email | Brevo (transactional) |
| Styling | Tailwind CSS |
| Deployment | Vercel |

---

## Contract Architecture Notes

**Address handling:** All wallet addresses are stored as lowercase strings (`str(gl.message.sender_address).lower()`). This is consistent across all 8 write methods and all read-path lookups, preventing checksum mismatches between Python and EVM clients.

**Serialisation:** All contract state is JSON-serialised with `default=str` to handle GenLayer `Address` objects that are not natively JSON-serialisable.

**Privacy:** `guest_ref` is a hotel-internal identifier (e.g. `SMITH_J_001`). No guest names, emails, or identity fields are ever written to chain. The lookup key is `hotel_address::guest_ref.lower()`, scoped per hotel so the same ref at two hotels are independent records.

**Data isolation:** `hotel_guest_index` maps each hotel address to its own guest ID list. A guest submitted by Hotel A is never visible in Hotel B's guest list, regardless of the guest_ref value.

---

## Running Locally

```bash
git clone https://github.com/Ifem1/Comfot.git
cd Comfot
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key   # server only, never exposed to browser
BREVO_API_KEY=your_brevo_key
BREVO_FROM_EMAIL=noreply@yourdomain.com
BREVO_FROM_NAME=Comfot
```

```bash
npm run dev
```

Connect MetaMask to GenLayer StudioNet (chainId 61999, RPC `https://studio.genlayer.com/api`). The app will prompt you to switch networks automatically.

---

## End-to-End Smoke Test

```bash
node scripts/smoke-test.mjs
```

The script registers 5 hotels in parallel, submits 13 guest profiles across them, verifies data isolation (each hotel only reads its own guests), and requests recommendations. All phases run against the live contract on StudioNet.

---

## Supabase Schema

```sql
-- Run in Supabase SQL editor
create table public.guest_pii ( ... );
create table public.hotel_contacts ( ... );
create table public.notifications ( ... );

grant all on public.guest_pii to service_role;
grant all on public.hotel_contacts to service_role;
grant all on public.notifications to service_role;
```

Full schema in [`supabase/schema.sql`](supabase/schema.sql).

---

## Folder Structure

```
src/
  app/
    api/              Next.js API routes (server only — Supabase service role)
    dashboard/        Hotel dashboard pages
      guests/         Guest profile management
      recommendations/ Validator dossiers + escalation resolution
      preferences/    Hotel preference rules
      settings/       Hotel registration
  hooks/              React hooks (useHotel, useGuests, useRecommendations)
  lib/
    genlayer/         Contract client, tx poller, config
    supabase/         Server client, types
  types/              TypeScript interfaces (Guest, Recommendation, Hotel...)
contracts/
  comfot_contract.py  GenLayer intelligent contract
scripts/
  smoke-test.mjs      End-to-end test script
```

---

## License

MIT
