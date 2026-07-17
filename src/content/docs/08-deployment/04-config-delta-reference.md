---
title: Config-Delta Reference
description: Quick-reference deployment config for Vercel, Netlify, Bun, and Railway — deltas from the two worked examples, not full walkthroughs.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

The [Cloudflare](../../08-deployment/02-cloudflare-workers/) and [Node/Docker](../../08-deployment/03-node-docker-nitro/) chapters are full walkthroughs because they're the two shapes worth understanding deeply — an edge Vite-plugin host, and a plain long-running Nitro server. Everything else is a small delta from one of those two. This page is that delta, not another full tour.

| Host | Shape | Plugin config | Notes |
|---|---|---|---|
| **Vercel** | Nitro preset | `nitro({ preset: 'vercel' })` in `vite.config.ts`'s plugins array | Auto-detected — deploying via Vercel's Git integration or CLI applies the `vercel` preset without you setting it explicitly. Migrating an existing Cloudflare app? Vercel publishes a [dedicated migration guide](https://vercel.com/kb/guide/migrate-a-tanstack-start-app-from-cloudflare-to-vercel): drop `@cloudflare/vite-plugin` and `wrangler.jsonc`, add `nitro/vite`, and replace any `import { env } from 'cloudflare:workers'` reads with `process.env` (see [caching and env vars](../../05-advanced-config/02-caching-and-env-vars/) for the per-request-read discipline that still applies either way). |
| **Netlify** | Host-specific Vite plugin | `plugins: [tanstackStart(), netlify(), viteReact()]` using `@netlify/vite-plugin-tanstack-start` | Same shape as Cloudflare — a dedicated plugin, no Nitro preset involved. Deploy via `netlify deploy` or Git-connected CI. Manual fallback: `netlify.toml` with `command = "vite build"` and `publish = "dist/client"`. |
| **Bun** (self-hosted / Bun-native host) | Nitro preset | `nitro({ preset: 'bun' })` | Requires React 19+ (already the book's baseline). Produces output you run with `bun run .output/server/index.mjs` — distinct from just running Node output under Bun (see the [Node/Docker chapter](../../08-deployment/03-node-docker-nitro/) for that alternative). |
| **Railway** | Nitro preset (generic) | `nitro()` — no preset needed | Railway detects a Node-shaped build and runs it directly; Nitro's default output is already a standalone Node server. Connect the repo, Railway handles build/deploy/preview environments automatically. This is functionally the [Node/Docker](../../08-deployment/03-node-docker-nitro/) shape with Railway managing the container instead of you. |

For anything not in this table, start from whichever worked example matches the shape (host-specific plugin vs. Nitro) and adjust the preset — the [deployment model overview](../../08-deployment/01-deployment-model-overview/)'s decision tree is the thing to re-check, not this table.
