---
title: "Worked Example: Cloudflare Workers"
description: Deploying a TanStack Start app to Cloudflare Workers with @cloudflare/vite-plugin, wrangler.jsonc, and per-request env access.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

Source: [Cloudflare's own TanStack Start framework guide](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/). This chapter is the applied version of that guide plus the [deployment model overview](../../08-deployment/01-deployment-model-overview/)'s Shape 1.

## Setup

Two dev dependencies:

```bash
bun add -D @cloudflare/vite-plugin wrangler
```

Plugin order in `vite.config.ts` matters — `cloudflare()` goes first:

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import { cloudflare } from '@cloudflare/vite-plugin'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    cloudflare({ viteEnvironment: { name: 'ssr' } }),
    tanstackStart(),
    viteReact(),
  ],
})
```

`viteEnvironment: { name: 'ssr' }` tells the Cloudflare plugin which Vite environment (from Vite's environments API) is the one that needs to run under `workerd` semantics — that's Start's SSR environment, not the client one.

## `wrangler.jsonc`

```jsonc
{
  "name": "my-start-app",
  "main": "@tanstack/react-start/server-entry",
  "compatibility_date": "2026-07-01",
  "compatibility_flags": ["nodejs_compat"],
  "observability": { "enabled": true },
}
```

`main` points at Start's own server-entry module — you don't hand-write a Worker entry point for the standard case. If you need Queues, Cron Triggers, Durable Objects, or Workflows alongside your app, swap `main` for your own `src/server.ts` and import/re-export Start's handler from there; the Cloudflare guide covers that path for anyone going beyond a plain web app.

```json
// package.json
{
  "scripts": {
    "dev": "vite dev",
    "build": "vite build",
    "deploy": "npm run build && wrangler deploy",
    "cf-typegen": "wrangler types"
  }
}
```

Run `cf-typegen` after adding any binding (KV, R2, D1, AI) — it generates the `Env` type `wrangler.jsonc` describes, so `env` reads are typed. For an existing project already configured this way, `npx wrangler deploy` alone is often enough — Wrangler auto-detects the framework and fills in defaults.

## Env reads have to be per-request here — not optional

This is the sharpest edge of the Workers runtime specifically, so it's worth stating plainly rather than just linking past it: a Worker isolate is **reused across requests**. Anything read once at module scope and cached in a variable stays cached for every request that isolate handles afterward, potentially mixing state across unrelated requests. [Caching and env vars](../../05-advanced-config/02-caching-and-env-vars/) covers why this matters in general; on Cloudflare specifically, it's not a theoretical footgun — it's the default behavior if you get it wrong.

```ts
// cloudflare:workers — the binding for env access inside server code
import { env } from 'cloudflare:workers'

// Wrong — read once, reused (and stale) for every subsequent request on this isolate
const apiKey = env.THIRD_PARTY_API_KEY
export const callThirdParty = createServerFn().handler(async () => {
  return fetch('https://api.example.com', { headers: { Authorization: apiKey } })
})

// Right — read inside the handler, fresh every call
export const callThirdParty = createServerFn().handler(async () => {
  const apiKey = env.THIRD_PARTY_API_KEY
  return fetch('https://api.example.com', { headers: { Authorization: apiKey } })
})
```

In practice this rarely bites you with static secrets (`env.THIRD_PARTY_API_KEY` is the same value every request anyway) — it bites you with anything derived from the request or from per-tenant config that you're tempted to memoize "for performance." Don't memoize it at module scope on Workers.

:::caution
`import { env } from 'cloudflare:workers'` only resolves inside the Workers runtime. Code that imports it needs to actually run through the `cloudflare()` Vite environment (server functions, loaders) — don't import it into a module that's also reachable from the client bundle.
:::

## Prerendering, if you want it

`tanstackStart({ prerender: { enabled: true } })` prerenders eligible routes at build time (requires `@tanstack/react-start` v1.138.0+). It uses your local env during the build; if a prerendered route needs production-only bindings, enable [remote bindings](https://developers.cloudflare.com/workers/framework-guides/web-apps/tanstack-start/) so the build can reach them.
