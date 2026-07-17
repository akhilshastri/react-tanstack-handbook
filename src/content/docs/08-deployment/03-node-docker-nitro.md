---
title: "Worked Example: Node, Docker, and Nitro"
description: Deploying a TanStack Start app as a long-running Node server via the nitro/vite plugin — the right default for data-dense apps that need a persistent process.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

Cloudflare Workers ([previous chapter](../../08-deployment/02-cloudflare-workers/)) is a great fit for latency-sensitive, mostly-stateless apps. It's the wrong fit the moment you need a genuinely long-running process — a persistent DB connection pool, background jobs, in-memory caching between requests, or anything that assumes the process stays alive rather than getting recycled per-isolate. That's what this chapter is for: a plain Node server, in Docker, via Nitro.

This is also the default deployment shape for the [ERP pattern](../../06-patterns/04-erp-pattern/) — data-dense, behind a login, correctness-over-first-paint-speed. Nothing about that pattern needs edge latency; it needs a stable, predictable server.

## Setup

```bash
bun add -D nitro
```

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import { nitro } from 'nitro/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [tanstackStart(), nitro(), viteReact()],
})
```

With no `preset` specified, Nitro's default production output already targets a standalone Node server (preset `node_server`) — this is the right default for most Node/Docker deployments and you often don't need to name it explicitly. If you want to be explicit, or you're troubleshooting a preset-detection issue:

```ts
nitro({ preset: 'node_server' })
```

## Build and run

```bash
bun run build          # -> .output/server/index.mjs
node .output/server/index.mjs
```

The server listens on `http://localhost:3000` by default (configurable via `PORT`). No `wrangler`-equivalent CLI, no host-specific deploy step — it's a Node process like any other, which is exactly the point.

## Dockerfile

A standard multi-stage build works with no Start-specific ceremony, since the build output is just a Node entry point:

```dockerfile
FROM oven/bun:1 AS build
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build

FROM node:22-slim AS runner
WORKDIR /app
COPY --from=build /app/.output ./.output
ENV NODE_ENV=production
EXPOSE 3000
CMD ["node", ".output/server/index.mjs"]
```

Building with Bun and running the output with plain Node is deliberate here — Nitro's `node_server` output is a standard Node entry point, so the runtime container doesn't need Bun installed at all. If you'd rather run it under Bun too, swap the final stage for `oven/bun:1` and `CMD ["bun", ".output/server/index.mjs"]` — see the [config-delta reference](../../08-deployment/04-config-delta-reference/) for the dedicated `bun` preset, which is a different thing (it targets Bun's native APIs, not just "run this JS with Bun").

## Why this over Nitro's other presets

Nitro can target serverless functions, edge runtimes, and static output from the same codebase — that's the whole point of the abstraction. For the ERP shape specifically, none of that flexibility is what you want: you want one process, running continuously, with predictable memory and connection lifecycle. `node_server` (bare metal, a VM, or a container orchestrator like Docker/Kubernetes/Railway) gives you that directly, without an edge runtime's per-isolate constraints to design around.
