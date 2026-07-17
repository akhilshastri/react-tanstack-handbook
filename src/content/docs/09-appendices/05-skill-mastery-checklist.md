---
title: "Appendix C — Skill Mastery Checklist"
description: A self-assessment checklist for the skills this book builds, each linked to the chapters that cover it.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

This isn't a test — it's a map. Use it to find the gaps: if a line doesn't feel solid, the linked chapters are where to go fix that, in the order listed. [Prerequisite skills](../../00-orientation/03-prerequisite-skills/) covers the baseline this whole book assumes; this checklist is the finish line, not the start line.

## Vite depth

- [ ] Understand why plugin *order* matters (`tanstackStart()` before `viteReact()`, host plugins before `tanstackStart()`) and can debug a build that breaks when it's wrong. → [Scaffolding and the Vite plugin](../../01-setup-and-architecture/01-scaffolding-and-vite-plugin/), [Cloudflare Workers](../../08-deployment/02-cloudflare-workers/)
- [ ] Know what Vite's environments API is for, and why SSR-targeting plugins (like `@cloudflare/vite-plugin`) need to be told which environment to attach to. → [Cloudflare Workers](../../08-deployment/02-cloudflare-workers/)
- [ ] Can read a bundle analyzer report and identify server-only code that leaked into the client bundle. → [Performance tuning](../../07-testing-and-performance/02-performance-tuning/)

## TanStack Router mastery

- [ ] Comfortable with file-based routing conventions, nested layouts, and how a folder tree becomes a route tree. → [File-based routing and project structure](../../01-setup-and-architecture/02-file-based-routing-and-project-structure/)
- [ ] Know the difference between `loader`, `beforeLoad`, and route `context`, and when each runs. → [Loaders and deferred data](../../02-rendering-model/02-loaders-and-deferred-data/)
- [ ] Can configure preload strategy (`defaultPreload`, per-`Link` `preload`) and reason about its cost. → [Performance tuning](../../07-testing-and-performance/02-performance-tuning/)

## React 19 fundamentals

- [ ] Suspense, `use()`, and transitions — not just syntax, but what they change about request/response timing. → [Prerequisite skills](../../00-orientation/03-prerequisite-skills/), [SSR and streaming](../../02-rendering-model/01-ssr-and-streaming/)
- [ ] Understand the Flight protocol at a conceptual level — what "a stream of React elements, not JSON" actually means. → [RSC streaming mechanics](../../09-appendices/02-rsc-streaming-mechanics/)

## Streaming SSR & Suspense boundary placement

- [ ] Know how Start streams a response and why boundary *placement* (not just presence) determines what the user sees first. → [SSR and streaming](../../02-rendering-model/01-ssr-and-streaming/), [Boundaries and hydration](../../02-rendering-model/04-boundaries-and-hydration/)
- [ ] Can choose `ssr: true` / `'data-only'` / `false` per route deliberately, not by default. → [Selective SSR](../../02-rendering-model/03-selective-ssr/)

## HTTP / caching fluency

- [ ] Comfortable with `Cache-Control`, `stale-while-revalidate`, and what a CDN actually does with those headers. → [Caching and env vars](../../05-advanced-config/02-caching-and-env-vars/)
- [ ] Know when prerendering/ISR is the right cache strategy versus per-request SSR. → [Prerendering and SPA mode](../../05-advanced-config/01-prerendering-and-spa-mode/), [ISR](../../05-advanced-config/04-isr/), [CMS pattern](../../06-patterns/02-cms-pattern/)

## The RPC / server-function mental model

- [ ] Understand `createServerFn`'s validator → middleware → handler pipeline, and that the handler never ships to the client. → [Server function anatomy](../../03-server-functions-forms-security/01-server-fn-anatomy/)
- [ ] Know what the RPC compile boundary actually strips, and why a shared module can leak server code into the client bundle anyway. → [The RPC compile boundary](../../03-server-functions-forms-security/02-rpc-compile-boundary/)
- [ ] Can test a server function's handler logic without standing up a real HTTP request. → [Testing server functions and loaders](../../07-testing-and-performance/01-testing-server-functions-and-loaders/)

## Edge-runtime awareness

- [ ] Know why module-scope state (including cached `env` reads) is dangerous on a runtime that reuses isolates across requests. → [Caching and env vars](../../05-advanced-config/02-caching-and-env-vars/), [The singleton-leak bug class](../../04-state-and-data/05-singleton-leak-bug-class/)
- [ ] Can apply that discipline concretely on a specific host (not just in the abstract). → [Cloudflare Workers](../../08-deployment/02-cloudflare-workers/)

## TypeScript generics (end-to-end inference)

- [ ] Can predict a server function's inferred `data` type from its validator without running the code. → [Prerequisite skills](../../00-orientation/03-prerequisite-skills/), [Server function anatomy](../../03-server-functions-forms-security/01-server-fn-anatomy/)
- [ ] Comfortable reading a broken-inference error and finding where the chain actually breaks, rather than widening a type to make it go away.

## Nitro / deployment-preset literacy

- [ ] Know the difference between a host-specific Vite plugin and a Nitro preset, and which shape a given host uses. → [Deployment model overview](../../08-deployment/01-deployment-model-overview/)
- [ ] Can stand up both a long-running Node/Docker deployment and an edge deployment from the same app. → [Node, Docker, and Nitro](../../08-deployment/03-node-docker-nitro/), [Cloudflare Workers](../../08-deployment/02-cloudflare-workers/)
- [ ] Know where to look for a host not covered in depth (Vercel, Netlify, Bun, Railway). → [Config-delta reference](../../08-deployment/04-config-delta-reference/)

## TanStack Query integration patterns

- [ ] Understand streaming dehydration/hydration via the official Router-Query integration, and Start's `staleTime` conventions. → [TanStack Query](../../04-state-and-data/01-tanstack-query/)
- [ ] Know when reaching for Query alone is enough, versus needing DB or client UI state on top of it. → [Decision framework](../../04-state-and-data/03-decision-framework/)
- [ ] Can reason about `defaultPreloadStaleTime` and Query's `staleTime` as two layers answering related questions. → [Performance tuning](../../07-testing-and-performance/02-performance-tuning/)

:::tip
This framework moves fast enough that "mastery" has a shelf life. Re-check [the version and stability legend](../../00-orientation/02-version-and-stability/) periodically — a 🔴 pattern you learned here might have gained official docs by the time you next need it, and a 🟢 API might have shifted.
:::
