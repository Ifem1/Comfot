# Review Response

Reviewer: Joaquin  
Review date: July 17, 2026 18:06  
Status: Addressed

## Requested Changes

> Please align the contract address variable across the active client, setup example, README, and deploy tools. Also make the contract and client agree on guest_ref and recommendation ordering data, then update the affected workflow tests so a fresh setup can complete the guest and recommendation flows.

## What Changed

### 1. Contract Address Variable Alignment

Aligned the app and setup/deploy documentation around one public frontend variable:

```env
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS
```

Updated:

- `src/lib/genlayer/config.ts`
- `src/lib/constants.ts`
- `src/lib/genlayer.ts`
- `.env.example`
- `README.md`
- `setup_comfot.py`
- `contracts/deploy.py`
- `contracts/verify.py`

The old `NEXT_PUBLIC_CONTRACT_ADDRESS` name has been removed from the active setup path.

### 2. Contract and Client Agreement on `guest_ref`

The contract now persists `guest_ref` in the records the frontend needs to display and verify guest/recommendation flows:

- Guest records
- Recommendation records
- Validation records
- Escalation records

Updated:

- `contracts/comfot_contract.py`
- `src/types/contract.ts`
- `src/app/dashboard/guests/page.tsx`
- `src/app/dashboard/recommendations/page.tsx`

The frontend can now reliably display internal guest references from contract state instead of relying on removed off-chain storage.

### 3. Recommendation Ordering Data

The contract now writes deterministic `sort_order` values for recommendation, validation, and escalation records.

The contract read methods return recommendation and escalation records newest-first, and the frontend client also normalizes ordering with a fallback to ID suffix ordering.

Updated:

- `contracts/comfot_contract.py`
- `src/lib/genlayer/comfotClient.ts`
- `src/types/contract.ts`

### 4. Workflow Tests Updated

The old tests expected outdated IDs and removed method names. They were replaced with focused workflow tests that cover:

- Fresh hotel registration
- Guest profile submission
- Case-insensitive `guest_ref` lookup
- Updating an existing guest reference without duplicating the hotel index
- Recommendation request flow
- `guest_ref` on recommendation and validation records
- Newest-first recommendation ordering
- Hotel stats after recommendations

Updated:

- `contracts/tests/test_contract.py`

### 5. Supabase Removed From Active App

Comfot now runs as frontend plus GenLayer contract only. Supabase API routes, hooks, client files, schema, package dependency, and UI surfaces were removed.

Removed:

- `src/app/api/guest-pii/route.ts`
- `src/app/api/hotel-contact/route.ts`
- `src/app/api/notify/route.ts`
- `src/hooks/useGuestPII.ts`
- `src/hooks/useHotelContact.ts`
- `src/lib/supabase/*`
- `supabase/schema.sql`
- `@supabase/supabase-js`

## Validation

Ran and passed:

```bash
genvm-lint check contracts/comfot_contract.py --json
python -m pytest contracts/tests/ -v
npm run type-check
npm run lint
npm run build
```

Contract workflow tests:

```text
8 passed
```

## Fresh StudioNet Deployment Test

A fresh contract was deployed and tested with two generated throwaway wallets using local signing through `genlayer-js`.

Fresh contract address:

```text
0x4f1286357B9d36E3541eCdad00b65060487721Ef
```

Two-wallet workflow verified:

- Wallet 1 registered a hotel and submitted `ALPHA_G001`
- Wallet 2 registered a separate hotel and submitted `BETA_G001`
- Guest isolation passed
- Recommendation flow passed for both wallets
- `guest_ref` and `sort_order` were present and correct:

```text
rec_1 -> guest_ref: ALPHA_G001, sort_order: 1, status: approved
rec_2 -> guest_ref: BETA_G001, sort_order: 2, status: approved
```

## Production

Vercel production environment was updated:

```env
NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x4f1286357B9d36E3541eCdad00b65060487721Ef
```

Production deployment:

```text
https://comfot.vercel.app
```

## Notes

The active frontend now reads contract data from `src/lib/genlayer/comfotClient.ts`, using the address exposed by `src/lib/genlayer/config.ts`. This is the deployed production path.
