"""
Comfot — StudioNet Deployment Script
=====================================
Deploys comfot_contract.py to Genlayer StudioNet.

Prerequisites:
  pip install genlayer-py   (or use Genlayer Studio UI)

Usage:
  python contracts/deploy.py

After deploy:
  Copy the printed contract address into .env.local:
  NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
"""

import json
import os
import sys

CONTRACT_FILE = os.path.join(os.path.dirname(__file__), "comfot_contract.py")
STUDIO_RPC    = "https://studio.genlayer.com/api"


def deploy_via_rpc():
    """
    Deploy using Genlayer JSON-RPC (no extra dependencies needed).
    Requires your deployer private key as env var: DEPLOYER_PRIVATE_KEY
    """
    try:
        import urllib.request
        import urllib.error
    except ImportError:
        print("ERROR: urllib not available")
        sys.exit(1)

    private_key = os.environ.get("DEPLOYER_PRIVATE_KEY", "")
    if not private_key:
        print("\nNOTE: DEPLOYER_PRIVATE_KEY not set.")
        print("You can deploy via the Genlayer Studio UI instead:")
        print_studio_instructions()
        return

    with open(CONTRACT_FILE, "r") as f:
        source_code = f.read()

    payload = json.dumps({
        "jsonrpc": "2.0",
        "method": "gen_deployContract",
        "params": {
            "source_code": source_code,
            "constructor_args": [],
            "private_key": private_key,
        },
        "id": 1,
    }).encode("utf-8")

    req = urllib.request.Request(
        STUDIO_RPC,
        data=payload,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as resp:
            result = json.loads(resp.read())
    except urllib.error.URLError as e:
        print(f"ERROR: Could not reach Genlayer Studio: {e}")
        print_studio_instructions()
        return

    if "error" in result:
        print(f"Deploy failed: {result['error']}")
        print_studio_instructions()
        return

    address = result.get("result", {}).get("contract_address", "")
    if address:
        print("\n" + "="*55)
        print("  CONTRACT DEPLOYED SUCCESSFULLY")
        print("="*55)
        print(f"\n  Address: {address}")
        print(f"  Network: StudioNet")
        print(f"\n  Add to .env.local:")
        print(f"  NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS={address}")
        print("\n" + "="*55)

        # Auto-write to .env.local
        env_path = os.path.join(os.path.dirname(__file__), "..", ".env.local")
        try:
            with open(env_path, "r") as f:
                content = f.read()
            content = content.replace(
                "NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=",
                f"NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS={address}"
            )
            with open(env_path, "w") as f:
                f.write(content)
            print("  .env.local updated automatically.")
        except Exception:
            print("  (Could not auto-update .env.local — update it manually)")
    else:
        print("Deploy completed but no address returned.")
        print(f"Full response: {json.dumps(result, indent=2)}")


def print_studio_instructions():
    print("\n" + "="*55)
    print("  DEPLOY VIA GENLAYER STUDIO UI")
    print("="*55)
    print("""
1. Open https://studio.genlayer.com
2. Connect your wallet
3. Click 'Deploy Contract'
4. Upload: contracts/comfot_contract.py
5. Leave constructor args empty
6. Click Deploy
7. Copy the contract address
8. Paste into .env.local:
   NEXT_PUBLIC_GENLAYER_CONTRACT_ADDRESS=0x...
9. Restart dev server: npm run dev
""")


if __name__ == "__main__":
    print("\nComfot — Genlayer StudioNet Deployment")
    print(f"Contract: {CONTRACT_FILE}")
    print(f"Network:  StudioNet ({STUDIO_RPC})")

    deploy_via_rpc()
