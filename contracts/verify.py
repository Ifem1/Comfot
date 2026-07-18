"""
Comfot — Post-Deploy Verification Script
Usage: python contracts/verify.py <GENLAYER_CONTRACT_ADDRESS>
"""

import sys
import json
import urllib.request

STUDIO_RPC = "https://studio.genlayer.com/api"


def call(address: str, method: str, args: list = []):
    payload = json.dumps({
        "jsonrpc": "2.0",
        "method": "gen_getContractState",
        "params": {"address": address, "fn": method, "args": args},
        "id": 1,
    }).encode()
    req = urllib.request.Request(
        STUDIO_RPC, data=payload,
        headers={"Content-Type": "application/json"}, method="POST"
    )
    with urllib.request.urlopen(req, timeout=15) as r:
        return json.loads(r.read())


def verify(address: str):
    print(f"\nVerifying contract at {address}...")
    checks = [
        ("get_contract_version", [], "Contract is responsive"),
        ("get_global_stats", [], "Global stats are readable"),
    ]
    for method, args, label in checks:
        try:
            result = call(address, method, args)
            if "error" in result:
                print(f"  FAIL  {label}: {result['error']}")
            else:
                print(f"  PASS  {label}")
        except Exception as e:
            print(f"  FAIL  {label}: {e}")

    print("\nVerification complete.")
    print(f"Add to .env.local: NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS={address}\n")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python contracts/verify.py <GENLAYER_CONTRACT_ADDRESS>")
        sys.exit(1)
    verify(sys.argv[1])
