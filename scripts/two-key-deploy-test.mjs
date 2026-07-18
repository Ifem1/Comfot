import fs from "node:fs"
import { createClient, createAccount, chains } from "genlayer-js"

const RPC = process.env.NEXT_PUBLIC_GENLAYER_RPC_URL || "https://studio.genlayer.com/api"
const PK1 = process.env.TEST_PK1
const PK2 = process.env.TEST_PK2
const EXISTING_CONTRACT = process.env.TEST_CONTRACT_ADDRESS
const CHAIN = chains.studionet

if (!PK1 || !PK2) {
  console.error("TEST_PK1 and TEST_PK2 are required")
  process.exit(1)
}

const account1 = createAccount(PK1)
const account2 = createAccount(PK2)
const client = createClient({ chain: CHAIN, endpoint: RPC })

const code = fs.readFileSync("contracts/comfot_contract.py")

function log(message) {
  console.log(message)
}

async function wait(hash, label) {
  log(`${label} tx: ${hash}`)
  let lastError = null

  for (let attempt = 0; attempt < 180; attempt++) {
    try {
      const receipt = await client.getTransaction({ hash })
      const rawStatus = String(receipt.statusName || receipt.status_name || receipt.status || "").toUpperCase()
      const status = rawStatus === "5" ? "ACCEPTED" : rawStatus === "6" ? "FINALIZED" : rawStatus
      if (["ACCEPTED", "FINALIZED"].includes(status)) {
        const exec = receipt.txExecutionResult
        log(`${label} status: ${status}`)
        if (exec && exec.resultType && exec.resultType !== "SUCCESS") {
          throw new Error(`${label} execution failed: ${JSON.stringify(exec)}`)
        }
        return receipt
      }
      if (["CANCELED", "UNDETERMINED", "VALIDATORS_TIMEOUT", "LEADER_TIMEOUT"].includes(status)) {
        throw new Error(`${label} failed with status ${status}`)
      }
    } catch (error) {
      lastError = error
      process.stdout.write(".")
    }
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }

  throw new Error(`${label} timed out waiting for receipt: ${lastError?.message ?? "unknown error"}`)
}

async function write(account, address, functionName, args) {
  const hash = await client.writeContract({ account, address, functionName, args })
  await wait(hash, functionName)
  return hash
}

async function read(address, functionName, args = []) {
  return client.readContract({
    address,
    functionName,
    args,
    jsonSafeReturn: true,
  })
}

async function main() {
  log("Two-key Comfot deploy test")
  log(`Wallet 1: ${account1.address}`)
  log(`Wallet 2: ${account2.address}`)

  let contractAddress = EXISTING_CONTRACT

  if (!contractAddress) {
    const deployHash = await client.deployContract({ account: account1, code })
    const deployReceipt = await wait(deployHash, "deploy")
    contractAddress =
      deployReceipt.contractAddress ||
      deployReceipt.data?.contractAddress ||
      deployReceipt.data?.contract_address ||
      deployReceipt.txExecutionResult?.contractAddress ||
      deployReceipt.txExecutionResult?.contract_address ||
      deployReceipt.txExecutionResult?.result

    if (!contractAddress) {
      throw new Error(`Could not determine deployed contract address: ${JSON.stringify(deployReceipt)}`)
    }
  } else {
    log(`Contract: ${contractAddress} (existing)`)
  }

  log(`Contract: ${contractAddress}`)

  await write(account1, contractAddress, "register_hotel", [
    "Test Hotel Alpha",
    "business",
    "A quiet business hotel for workflow testing.",
    "Lagos",
    ["business centre", "gym", "airport shuttle", "high-speed wifi"],
    ["standard", "executive", "suite"],
    ["corporate stay"],
    4,
  ])

  await write(account2, contractAddress, "register_hotel", [
    "Test Hotel Beta",
    "boutique",
    "A boutique hotel for isolation testing.",
    "Abuja",
    ["spa", "rooftop bar", "concierge"],
    ["standard", "deluxe", "artist suite"],
    ["wellness weekend"],
    4,
  ])

  await write(account1, contractAddress, "submit_guest_profile", [
    "ALPHA_G001",
    "gold",
    5,
    "high",
    ["Loved the quiet executive room and fast wifi."],
    ["Guest needs airport pickup and early breakfast."],
    ["quiet room", "airport pickup"],
    ["no dairy"],
    ["executive"],
    "en",
  ])

  await write(account2, contractAddress, "submit_guest_profile", [
    "BETA_G001",
    "silver",
    2,
    "medium",
    ["Enjoyed the spa and rooftop bar."],
    ["Guest is visiting for a weekend retreat."],
    ["spa appointment"],
    ["vegetarian"],
    ["deluxe"],
    "en",
  ])

  const addr1 = account1.address.toLowerCase()
  const addr2 = account2.address.toLowerCase()
  const guestIds1 = await read(contractAddress, "get_hotel_guest_ids", [addr1])
  const guestIds2 = await read(contractAddress, "get_hotel_guest_ids", [addr2])
  log(`Wallet 1 guests: ${JSON.stringify(guestIds1)}`)
  log(`Wallet 2 guests: ${JSON.stringify(guestIds2)}`)

  if (guestIds1.length !== 1 || guestIds2.length !== 1) {
    throw new Error("Guest isolation failed: unexpected guest counts")
  }

  const guest1 = await read(contractAddress, "get_guest", [guestIds1[0]])
  const guest2 = await read(contractAddress, "get_guest", [guestIds2[0]])
  if (guest1.guest_ref !== "ALPHA_G001" || guest2.guest_ref !== "BETA_G001") {
    throw new Error("guest_ref mismatch")
  }

  let recs1 = await read(contractAddress, "get_hotel_recommendations", [addr1])
  let recs2 = await read(contractAddress, "get_hotel_recommendations", [addr2])

  if (recs1.length === 0) {
    await write(account1, contractAddress, "request_recommendation", [guestIds1[0]])
  } else {
    log("Wallet 1 recommendation already exists; skipping duplicate request")
  }

  if (recs2.length === 0) {
    await write(account2, contractAddress, "request_recommendation", [guestIds2[0]])
  } else {
    log("Wallet 2 recommendation already exists; skipping duplicate request")
  }

  recs1 = await read(contractAddress, "get_hotel_recommendations", [addr1])
  recs2 = await read(contractAddress, "get_hotel_recommendations", [addr2])
  log(`Wallet 1 recs: ${JSON.stringify(recs1.map((r) => ({ id: r.rec_id, ref: r.guest_ref, order: r.sort_order, status: r.status })))}`)
  log(`Wallet 2 recs: ${JSON.stringify(recs2.map((r) => ({ id: r.rec_id, ref: r.guest_ref, order: r.sort_order, status: r.status })))}`)

  if (recs1.length !== 1 || recs2.length !== 1) {
    throw new Error("Recommendation flow failed: unexpected recommendation counts")
  }
  if (recs1[0].guest_ref !== "ALPHA_G001" || recs2[0].guest_ref !== "BETA_G001") {
    throw new Error("Recommendation guest_ref mismatch")
  }
  if (!recs1[0].sort_order || !recs2[0].sort_order || recs2[0].sort_order <= recs1[0].sort_order) {
    throw new Error("Recommendation ordering data missing or incorrect")
  }

  console.log(JSON.stringify({
    contractAddress,
    wallet1: account1.address,
    wallet2: account2.address,
    guestIds1,
    guestIds2,
    recs1: recs1.map((r) => ({ rec_id: r.rec_id, guest_ref: r.guest_ref, sort_order: r.sort_order, status: r.status })),
    recs2: recs2.map((r) => ({ rec_id: r.rec_id, guest_ref: r.guest_ref, sort_order: r.sort_order, status: r.status })),
  }, null, 2))
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
