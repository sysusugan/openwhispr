---
name: openwhispr-cli
description: Use the local OpenWhispr CLI against the desktop app's loopback bridge.
---

# OpenWhispr Local CLI

Use this skill when a task should operate on the user's local OpenWhispr desktop
data through the CLI. The CLI is a local client for the desktop loopback bridge.
It should not require a hosted account.

## Preconditions

1. OpenWhispr desktop is running.
2. The bridge file exists at `~/.openwhispr/cli-bridge.json`.
3. The CLI is installed and available on `PATH`.

Check the CLI:

```sh
openwhispr --version
openwhispr --help
```

Check the local bridge directly when diagnosing CLI issues:

```sh
bridge="${HOME}/.openwhispr/cli-bridge.json"
port="$(jq -r .port "$bridge")"
token="$(jq -r .token "$bridge")"
curl -sS -H "Authorization: Bearer ${token}" "http://127.0.0.1:${port}/v1/health"
```

## Local Workflows

Prefer CLI commands for common local workflows when the installed CLI supports
them:

```sh
openwhispr --local notes list
openwhispr --local notes search "meeting"
openwhispr --local transcriptions list
```

If the installed CLI does not expose a command for the needed operation, use the
local API bridge directly via the `openwhispr-api` skill pattern.

## Design Rules

- Keep all data local to the desktop app and local bridge.
- Do not introduce login, hosted sync, payment, telemetry, or remote account flows.
- For MCP use cases, wrap the local CLI or local bridge rather than calling a
  hosted OpenWhispr endpoint.
- Preserve user data ownership: read from local SQLite-backed APIs and write
  through the desktop app bridge so normal UI refresh and vector indexing still run.
