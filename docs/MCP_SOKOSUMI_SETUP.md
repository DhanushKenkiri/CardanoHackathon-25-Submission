# MCP Orchestrator + Sokosumi Deployment Guide

This document connects the two new workspaces that were added for Masumi monetization:

1. `mcp_agent_orchestrator/` – production-grade FastAPI MCP server
2. `sokosumi_agent_deployment/` – Kubernetes + registry artifacts for Sokosumi testnet

It mirrors the "From Zero to Hero" and "List Agent on Sokosumi" flows so you can go from code to revenue without mocks.

## 1. Build and run the MCP server locally

```bash
cd mcp_agent_orchestrator
uv venv --python 3.12
source .venv/bin/activate
uv pip install -e .
cp .env.example .env  # fill values from Masumi + Sokosumi dashboards
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Smoke tests:

```bash
curl http://localhost:8000/input_schema
curl http://localhost:8000/availability
curl -X POST http://localhost:8000/start_job -H "Content-Type: application/json" -d '{"identifier_from_purchaser": "deadbeef", "input_data": {"text": "roadside occupancy"}}'
```

Set the payment webhook from the Masumi Payment Service UI to `https://<public-host>/payment/webhook` so that completed purchases trigger orchestration.

## 2. Register/verify with Masumi + Sokosumi

1. Submit the [Tally onboarding form](https://tally.so/r/nPLBaV) to get a Sokosumi API key.
2. Use the Masumi payment service endpoints (`/payment-source/`, `/registry/`, `/api-key/`) to obtain `SELLER_VKEY`, `AGENT_IDENTIFIER`, and `PAYMENT_API_KEY`.
3. Update both `.env` files with the same identifiers to keep MCP and deployment in sync.
4. Run `python -m scripts/register_agent.py` (or call the Masumi `/registry` API) and confirm the response before continuing.

## 3. Build an image that the Sokosumi scheduler can pull

```bash
cd sokosumi_agent_deployment
cp .env.example .env
# edit registry + namespace + webhook fields
source .env
./deploy.sh
```

The script produces `dist/agent_manifest.rendered.yaml`. This manifest:
- references the container built from `mcp_agent_orchestrator`
- injects only real secrets (no mocks)
- exposes `/docs`, `/availability`, and `/payment/webhook` publicly

## 4. Apply the manifest to the Sokosumi testnet cluster

```bash
kubectl apply -n "$K8S_NAMESPACE" -f dist/agent_manifest.rendered.yaml
kubectl rollout status deployment/masumi-mcp-orchestrator -n "$K8S_NAMESPACE"
```

After rollout:
1. `curl https://<PUBLIC_BASE_URL>/health`
2. Create a paid job using the sample request shown in `mcp_agent_orchestrator/README.md`
3. Complete the purchase with `curl -X POST $PAYMENT_SERVICE_URL/purchase ...`
4. Watch the Sokosumi dashboard: the agent should move to **Live** state and the collaboration feed should show the heartbeat.

## 5. Collaboration checklist

- [x] MCP server exposes MIP-003 endpoints
- [x] Payment webhook transitions jobs to the `running` state and executes real OpenAI prompts
- [x] Sokosumi client registers capabilities and emits job events
- [x] Deployment manifest references live URLs & secrets

Refer back to this file whenever you need to retest the monetization path end-to-end.
