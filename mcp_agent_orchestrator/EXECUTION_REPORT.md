# MCP Server Execution Report

This report documents how to execute and verify the Masumi MCP Agent Orchestrator against **real** infrastructure. Follow these steps every time you deploy or update the service to ensure it remains production-grade.

## Environment Alignment

1. Copy `.env.example` to `.env` and fill **real** values pulled from:
   - Masumi Payment Service (`/payment-source/`, `/registry/`, `/api-key/`)
   - Sokosumi dashboard credentials returned after the [Tally form](https://tally.so/r/nPLBaV)
   - OpenAI platform for LLM orchestration
2. Confirm the `SELLER_VKEY` matches the wallet registered on Masumi (network = `Preprod` or `Mainnet`).
3. Keep the `.env` synced with the deployment variables under `../sokosumi_agent_deployment` to avoid drift.

## Local Execution Checklist

```bash
uv venv --python 3.12
source .venv/bin/activate
uv pip install -e .
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Verify live endpoints:

1. `curl http://localhost:8000/health` → returns `{ "status": "ok", ... }` when payment + Sokosumi nodes are reachable.
2. `curl http://localhost:8000/availability` → should be `available: true` only if Sokosumi reports the agent live.
3. `curl -X POST http://localhost:8000/start_job ...` → returns `job_id` and moves the job into `awaiting_payment`.
4. Trigger a **real** purchase via Masumi:
   ```bash
   curl -X POST "$PAYMENT_SERVICE_URL/purchase" \
     -H "token: $PAYMENT_API_KEY" \
     -H 'Content-Type: application/json' \
     -d '{"agent_identifier":"'$AGENT_IDENTIFIER'"}'
   ```
5. Confirm the payment webhook hits `/payment/webhook`, the job transitions to `running`, and OpenAI generates output.
6. `curl http://localhost:8000/status?job_id=<id>` → returns `completed` with `result.summary` populated.

## Integration with Sokosumi

- Watch the Sokosumi dashboard for the heartbeat emitted in `app/sokosumi_client.py`. Status should change to **Processing** then **Completed** for each job.
- `notify_job_event` posts directly to `/agents/job-event`; verify the log stream or dashboard feed reflects the new job result.
- If `availability` goes `false`, fix the upstream node instead of bypassing with mocks—this server never fakes responses.

## Observability + Fail-safes

- Set `LOG_LEVEL=INFO` (or `DEBUG`) and tail the container logs for real-time traces.
- Configure `SENTRY_DSN` before production deployment to capture runtime errors.
- Redis (optional) is used for persistence; if unset, in-memory storage is used only for local dev. Use a managed Redis instance in production to avoid data loss.

## Sign-off

The MCP server is considered production-ready when:

- [ ] Health + availability endpoints succeed against live Masumi/Sokosumi infrastructure.
- [ ] Real payment triggers job execution without manual intervention.
- [ ] Sokosumi dashboard shows the agent as Live with fresh heartbeats.
- [ ] Logs/Sentry show no errors during the end-to-end paid job run.

Only mark deployments complete when every box above is checked—this ensures there are **zero mocks** in the workflow.
