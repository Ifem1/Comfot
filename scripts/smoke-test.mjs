/**
 * Comfot — Full End-to-End Smoke Test
 * Registers 5 hotels, submits guests, requests recommendations,
 * verifies data isolation between wallets.
 *
 * Usage: node scripts/smoke-test.mjs
 */

import { createWalletClient, encodeFunctionData } from "viem"
import { http } from "viem"
import { privateKeyToAccount } from "viem/accounts"
import { createClient, abi as glAbi, chains } from "genlayer-js"

// ─── Config ───────────────────────────────────────────────────
const RPC      = "https://studio.genlayer.com/api"
const CONTRACT = "0x700dfAD70aa52455B66C4Cd0bd1772fBbE1379e4"
const CHAIN    = chains.studionet
const POLL_MS  = 5000
const TIMEOUT  = 600_000   // 10 min per tx

const ADD_TX_ABI = [{
  type: "function", name: "addTransaction", stateMutability: "nonpayable",
  inputs: [
    { name: "_sender",                   type: "address" },
    { name: "_recipient",                type: "address" },
    { name: "_numOfInitialValidators",   type: "uint256" },
    { name: "_maxRotations",             type: "uint256" },
    { name: "_txData",                   type: "bytes"   },
  ],
  outputs: [],
}]

// ─── Hotel & guest fixtures ────────────────────────────────────
// Contract: submit_guest_profile(guest_ref, loyalty_tier, stay_count,
//   total_spend_band, reviews, conversation_log, special_requests,
//   dietary_needs, room_history, language)
// NOTE: no "name" field — privacy by design
const HOTELS = [
  {
    pk:       "0xf06ed44349851fa5c66d56628b7070ffbec068079bedb0b5188f706b2f2bb7e1",
    name:     "The Meridian Palace",
    type:     "luxury",
    desc:     "Flagship luxury hotel on Lagos Island with panoramic ocean views.",
    location: "Lagos Island, Nigeria",
    amenities:["spa","pool","concierge","fine dining","gym","executive lounge","valet"],
    rooms:    ["standard","deluxe","junior suite","penthouse"],
    packages: ["honeymoon escape","business elite","wellness retreat"],
    stars:    5,
    guests: [
      { ref:"MERIDIAN_G001", tier:"platinum", stayCount:12, spendBand:"very_high",
        reviews:["Loved the penthouse, impeccable service","Concierge was exceptional"],
        convos:["Prefers evening check-in","Requested extra champagne on arrival"],
        requests:["top floor","extra pillows","champagne on arrival"],
        dietary:["vegan"], rooms:["penthouse","junior suite"], language:"en" },
      { ref:"MERIDIAN_G002", tier:"gold", stayCount:6, spendBand:"high",
        reviews:["Pool area was excellent","Spa service outstanding"],
        convos:["Travelling with spouse","Interested in spa packages"],
        requests:["pool view room","king bed"],
        dietary:["no pork"], rooms:["deluxe","junior suite"], language:"en" },
      { ref:"MERIDIAN_G003", tier:"silver", stayCount:3, spendBand:"medium",
        reviews:["Good service, clean room"],
        convos:["Business travel only","Early riser, needs 6am breakfast"],
        requests:["quiet room away from lift"],
        dietary:[], rooms:["standard","deluxe"], language:"en" },
    ],
  },
  {
    pk:       "0x871c535b224d6d9556b3a9ae2db1b047e05dbaf050f1e77d5267753ad2ddee18",
    name:     "Baobab Boutique",
    type:     "boutique",
    desc:     "Intimate 24-room boutique hotel celebrating West African art and design.",
    location: "Ikoyi, Lagos",
    amenities:["rooftop bar","art gallery","yoga studio","organic café"],
    rooms:    ["standard","deluxe","artist suite"],
    packages: ["art retreat","wellness weekend","creative residency"],
    stars:    4,
    guests: [
      { ref:"BAOBAB_G001", tier:"gold", stayCount:8, spendBand:"high",
        reviews:["The art installations were stunning","Artist suite is inspiring"],
        convos:["Artist, needs desk space and good lighting","Requests quiet hours after 10pm"],
        requests:["art suite if available","quiet floor"],
        dietary:["gluten free"], rooms:["artist suite","deluxe"], language:"en" },
      { ref:"BAOBAB_G002", tier:"silver", stayCount:2, spendBand:"medium",
        reviews:["Rooftop bar is a highlight","Room was cosy and stylish"],
        convos:["Celebrating anniversary","First time staying boutique"],
        requests:["rooftop view room","flowers in room"],
        dietary:[], rooms:["deluxe","standard"], language:"en" },
      { ref:"BAOBAB_G003", tier:"bronze", stayCount:1, spendBand:"low",
        reviews:["Good value for the area"],
        convos:["First visit to Lagos","Budget conscious traveller"],
        requests:["early check-in"],
        dietary:["vegetarian"], rooms:["standard"], language:"fr" },
    ],
  },
  {
    pk:       "0x9daa10ca8c554c908b477c4e79440738006b6a61783c19721d5361644d9cdccb",
    name:     "Lekki Business Inn",
    type:     "business",
    desc:     "Corporate-focused property 5 minutes from Lekki financial district.",
    location: "Lekki Phase 1, Lagos",
    amenities:["business centre","conference room","high-speed wifi","gym","airport shuttle"],
    rooms:    ["standard","executive","corner suite"],
    packages: ["corporate stay","weekly rate","long stay"],
    stars:    4,
    guests: [
      { ref:"LEKKI_G001", tier:"gold", stayCount:20, spendBand:"high",
        reviews:["Fast wifi, great for remote work","Excellent conference facilities"],
        convos:["Monthly business visitor","Needs reliable early-morning transport"],
        requests:["high floor corner room","extra monitors","airport transfer"],
        dietary:["no dairy"], rooms:["corner suite","executive"], language:"en" },
      { ref:"LEKKI_G002", tier:"platinum", stayCount:35, spendBand:"very_high",
        reviews:["Excellent conference facilities","Staff very discreet and professional"],
        convos:["VP level, needs privacy","Prefers no housekeeping during meetings"],
        requests:["quiet floor","king bed","do not disturb during day"],
        dietary:["halal"], rooms:["corner suite"], language:"en" },
      { ref:"LEKKI_G003", tier:"silver", stayCount:10, spendBand:"medium",
        reviews:["Clean, functional"],
        convos:["Weekly commuter","Always checks out early Friday"],
        requests:["early check-out"],
        dietary:[], rooms:["standard","executive"], language:"en" },
    ],
  },
  {
    pk:       "0x0722af04563d490a78f5f19411270de14497f9e218450d968e196e54411086f8",
    name:     "Eko Budget Lodge",
    type:     "budget",
    desc:     "Clean, affordable lodging for the value-conscious traveller.",
    location: "Surulere, Lagos",
    amenities:["wifi","parking","breakfast included","24hr reception"],
    rooms:    ["single","double","twin"],
    packages: ["bed and breakfast","extended stay"],
    stars:    2,
    guests: [
      { ref:"EKO_G001", tier:"bronze", stayCount:4, spendBand:"low",
        reviews:["Good price for the location","Parking was convenient"],
        convos:["Drives own car, needs parking","Returns monthly for work"],
        requests:["ground floor","parking space"],
        dietary:[], rooms:["double","twin"], language:"en" },
      { ref:"EKO_G002", tier:"bronze", stayCount:2, spendBand:"low",
        reviews:["Very clean, friendly staff"],
        convos:["Sharing room with colleague","Budget very tight"],
        requests:["twin beds for two guests"],
        dietary:["no seafood"], rooms:["twin","double"], language:"yo" },
    ],
  },
  {
    pk:       "0xbc8904bf959ac00125846b7b9f7a5ca64cc89765df4be4dfcd553e57ad7f6ee6",
    name:     "Victoria Crown Resort",
    type:     "resort",
    desc:     "Beachfront resort with private beach access and full leisure facilities.",
    location: "Victoria Island, Lagos",
    amenities:["private beach","pool","water sports","spa","beach restaurant","kids club","gym"],
    rooms:    ["standard","ocean view","beach villa","penthouse"],
    packages: ["beach escape","family fun","romantic getaway","water sports bundle"],
    stars:    5,
    guests: [
      { ref:"VICTORIA_G001", tier:"platinum", stayCount:5, spendBand:"very_high",
        reviews:["Private beach was stunning, world class spa","Best honeymoon experience"],
        convos:["Honeymoon stay","Requested private beach dinner"],
        requests:["ocean view","couples massage","rose petal turndown"],
        dietary:["pescatarian"], rooms:["beach villa","ocean view"], language:"en" },
      { ref:"VICTORIA_G002", tier:"gold", stayCount:3, spendBand:"high",
        reviews:["Kids loved the club, great family vibes","Safe and well-managed property"],
        convos:["Travelling with 2 children aged 5 and 8","Needs connecting rooms"],
        requests:["family connecting rooms","cots","kids menu"],
        dietary:["no nuts"], rooms:["standard","ocean view"], language:"en" },
      { ref:"VICTORIA_G003", tier:"silver", stayCount:2, spendBand:"medium",
        reviews:["Water sports were great fun"],
        convos:["Adventure traveller","Wants full water sports package"],
        requests:["water sports access","early wake-up call"],
        dietary:[], rooms:["standard"], language:"en" },
    ],
  },
]

// ─── Helpers ───────────────────────────────────────────────────
const glClient = createClient({ chain: CHAIN, endpoint: RPC })

function log(msg)       { console.log(msg) }
function ok(msg)        { console.log(`  ✓ ${msg}`) }
function fail(msg)      { console.log(`  ✗ ${msg}`) }
function section(title) { console.log(`\n${"─".repeat(60)}\n  ${title}\n${"─".repeat(60)}`) }

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)) }

async function sendTx(pk, functionName, args) {
  const account = privateKeyToAccount(pk)

  const calldataObj = glAbi.calldata.makeCalldataObject(functionName, args, undefined)
  const encoded     = glAbi.calldata.encode(calldataObj)
  const txData      = glAbi.transactions.serialize([encoded, false])

  const callData = encodeFunctionData({
    abi: ADD_TX_ABI,
    functionName: "addTransaction",
    args: [
      account.address,
      CONTRACT,
      BigInt(CHAIN.defaultNumberOfInitialValidators ?? 5),
      BigInt(CHAIN.defaultConsensusMaxRotations   ?? 3),
      txData,
    ],
  })

  const walletClient = createWalletClient({ account, transport: http(RPC) })

  const hash = await walletClient.sendTransaction({
    to:    CHAIN.consensusMainContract.address,
    data:  callData,
    value: 0n,
    chainId: CHAIN.id,
  })
  return { hash, address: account.address.toLowerCase() }
}

async function waitFinalized(hash) {
  const deadline = Date.now() + TIMEOUT
  while (Date.now() < deadline) {
    try {
      const tx     = await glClient.getTransaction({ hash })
      const status = (tx.statusName || tx.status || "").toUpperCase()
      if (["FINALIZED","ACCEPTED"].includes(status)) return "ok"
      if (["CANCELED","UNDETERMINED","VALIDATORS_TIMEOUT"].includes(status)) return "failed:" + status
    } catch { /* transient */ }
    process.stdout.write(".")
    await sleep(POLL_MS)
  }
  return "timeout"
}

async function read(fn, args = []) {
  try {
    return await glClient.readContract({ address: CONTRACT, functionName: fn, args, jsonSafeReturn: true })
  } catch { return null }
}

// ─── Main ─────────────────────────────────────────────────────
async function main() {
  log("\n╔══════════════════════════════════════════════════╗")
  log(  "║       Comfot — Full E2E Smoke Test               ║")
  log(  "╚══════════════════════════════════════════════════╝")
  log(`  Contract : ${CONTRACT}`)
  log(`  Network  : StudioNet (${RPC})`)
  log(`  Hotels   : ${HOTELS.length}`)

  const results = []

  // ── Phase 1: Register all hotels in parallel ──────────────
  section("Phase 1 — Register Hotels (parallel)")
  const regTxs = await Promise.all(HOTELS.map(async (h, i) => {
    log(`  Submitting registration for "${h.name}"...`)
    const { hash, address } = await sendTx(h.pk, "register_hotel", [
      h.name, h.type, h.desc, h.location,
      h.amenities, h.rooms, h.packages, h.stars,
    ])
    log(`  [${i+1}] ${h.name} → ${hash}`)
    return { hotel: h, hash, address }
  }))

  log("\n  Waiting for all hotel registrations to finalize...")
  for (const r of regTxs) {
    process.stdout.write(`  ${r.hotel.name}: `)
    const status = await waitFinalized(r.hash)
    process.stdout.write(` ${status}\n`)
    results.push({ ...r, regStatus: status })
  }

  // ── Phase 2: Verify hotel reads ───────────────────────────
  section("Phase 2 — Verify Hotel Registration")
  for (const r of results) {
    const data = await read("get_hotel", [r.address])
    if (data && data.name) {
      ok(`${data.name} | type=${data.property_type} | stars=${data.star_rating} | addr=${r.address}`)
    } else {
      fail(`${r.hotel.name} — not found on chain (addr=${r.address})`)
    }
  }

  // ── Phase 3: Submit guests for each hotel ─────────────────
  // Contract: submit_guest_profile(guest_ref, loyalty_tier, stay_count,
  //   total_spend_band, reviews, conversation_log, special_requests,
  //   dietary_needs, room_history, language)
  section("Phase 3 — Submit Guest Profiles (per hotel)")
  for (const r of results) {
    log(`\n  ${r.hotel.name}`)
    for (const g of r.hotel.guests) {
      try {
        const { hash } = await sendTx(r.hotel.pk, "submit_guest_profile", [
          g.ref, g.tier, g.stayCount, g.spendBand,
          g.reviews, g.convos, g.requests,
          g.dietary, g.rooms, g.language,
        ])
        process.stdout.write(`    ${g.ref}: `)
        const status = await waitFinalized(hash)
        process.stdout.write(` ${status}\n`)
      } catch(e) {
        fail(`${g.ref}: ${e.message}`)
      }
    }
  }

  // ── Phase 4: Verify guest isolation ───────────────────────
  section("Phase 4 — Verify Guest Isolation")
  for (const r of results) {
    const ids = await read("get_hotel_guest_ids", [r.address]) ?? []
    log(`\n  ${r.hotel.name} (${r.address})`)
    log(`  Guest IDs on chain: ${ids.length} (expected ${r.hotel.guests.length})`)
    if (ids.length === r.hotel.guests.length) {
      ok(`Correct guest count: ${ids.length}`)
    } else {
      fail(`Guest count mismatch: got ${ids.length}, expected ${r.hotel.guests.length}`)
    }
    for (const id of ids) {
      const guest = await read("get_guest", [id])
      if (guest && guest.hotel_address === r.address) {
        ok(`${guest.guest_ref} → correctly scoped to this hotel`)
      } else if (guest) {
        fail(`${guest.guest_ref} → hotel_address mismatch! got ${guest.hotel_address}`)
      } else {
        fail(`guest ${id} → could not read`)
      }
    }
  }

  // ── Phase 5: Request one recommendation per hotel ─────────
  // Contract: request_recommendation(guest_id) — just 1 arg
  section("Phase 5 — Request Recommendations")
  for (const r of results) {
    const ids = await read("get_hotel_guest_ids", [r.address]) ?? []
    if (ids.length === 0) { fail(`${r.hotel.name}: no guests, skipping`); continue }

    const firstId = ids[0]
    const guest   = await read("get_guest", [firstId])
    if (!guest)   { fail(`${r.hotel.name}: guest read failed`); continue }

    log(`\n  ${r.hotel.name} → requesting recommendation for ${guest.guest_ref ?? firstId}`)
    try {
      const { hash } = await sendTx(r.hotel.pk, "request_recommendation", [firstId])
      process.stdout.write(`    Submitted: `)
      const status = await waitFinalized(hash)
      process.stdout.write(` ${status}\n`)
    } catch(e) {
      fail(`${r.hotel.name}: ${e.message}`)
    }
  }

  // ── Phase 6: Read recommendations & verify isolation ──────
  section("Phase 6 — Verify Recommendations & Final Isolation Check")
  for (const r of results) {
    const recs = await read("get_hotel_recommendations", [r.address]) ?? []
    log(`\n  ${r.hotel.name}`)
    log(`  Recommendations: ${recs.length}`)
    for (const rec of recs) {
      if (rec.hotel_address && rec.hotel_address !== r.address) {
        fail(`Cross-hotel leak! rec.hotel_address=${rec.hotel_address} ≠ ${r.address}`)
      } else {
        ok(`Rec ${rec.rec_id} → status=${rec.status} suggested_room=${rec.suggested_room ?? "pending"}`)
      }
    }
  }

  // ── Summary ───────────────────────────────────────────────
  section("Summary")
  for (const r of results) {
    const hotel = await read("get_hotel", [r.address])
    const ids   = await read("get_hotel_guest_ids", [r.address]) ?? []
    const recs  = await read("get_hotel_recommendations", [r.address]) ?? []
    log(`  ${hotel?.name ?? r.hotel.name}`)
    log(`    wallet  : ${r.address}`)
    log(`    guests  : ${ids.length}`)
    log(`    recs    : ${recs.length}`)
    log(`    reg tx  : ${r.regStatus}`)
  }

  log("\n╔══════════════════════════════════════════════════╗")
  log(  "║  Smoke test complete.                            ║")
  log(  "╚══════════════════════════════════════════════════╝\n")
}

main().catch(e => { console.error("\nFATAL:", e.message); process.exit(1) })
