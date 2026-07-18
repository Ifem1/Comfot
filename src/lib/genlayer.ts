// genlayer-js SDK — https://www.npmjs.com/package/genlayer-js
import { GENLAYER_CONTRACT_ADDRESS, GENLAYER_RPC_URL } from "./constants"

interface ReadParams {
  address: string
  method: string
  args?: unknown[]
}

interface WriteParams {
  address: string
  method: string
  args?: unknown[]
}

async function rpc(body: object): Promise<unknown> {
  const res = await fetch(GENLAYER_RPC_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: 1, ...body }),
  })
  const json = await res.json()
  if (json.error) throw new Error(json.error.message)
  return json.result
}

export async function readContract<T = unknown>(method: string, args: unknown[] = []): Promise<T> {
  if (!GENLAYER_CONTRACT_ADDRESS) throw new Error("GENLAYER_CONTRACT_ADDRESS not set — deploy contract first.")
  return rpc({
    method: "gen_getContractState",
    params: { address: GENLAYER_CONTRACT_ADDRESS, fn: method, args },
  }) as Promise<T>
}

export async function writeContract(method: string, args: unknown[] = []): Promise<string> {
  if (!GENLAYER_CONTRACT_ADDRESS) throw new Error("GENLAYER_CONTRACT_ADDRESS not set — deploy contract first.")
  return rpc({
    method: "eth_sendTransaction",
    params: [{ to: GENLAYER_CONTRACT_ADDRESS, data: JSON.stringify({ fn: method, args }) }],
  }) as Promise<string>
}
