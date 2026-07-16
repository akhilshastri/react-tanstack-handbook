# TanStack Start Handbook — Plan

**Audience:** intermediate-to-advanced React developers who already know React and have used a meta-framework (Next.js/Remix) or TanStack Router/Query before. Not a "what is React" book.

**Writing style:** plain, simple English. Specific and to the point — no padding, no marketing language, no restating the obvious.

**Content standard (applies to every chapter):** each concept is explained with (1) a runnable code example and (2) a diagram (mermaid — architecture, request-lifecycle, or data-flow) showing how the pieces connect. No chapter ships with prose only.

**Stability standard:** every chapter opens with a version-pinned callout — `Verified against @tanstack/react-start vX.Y — <date>`. Anything experimental/unofficial gets an explicit "verify before you build on this" banner instead of being presented as settled.

Research backing this plan: three research passes (TanStack Start core/RSC/deployment; Query/DB/Zustand/Jotai; Form/Table/real-time/RSC-streaming-internals), all source-cited against official docs, npm, and maintainer blogs as of 2026-07-16. Adversarially reviewed once by a devil's-advocate pass — see "Changes from devil review" below.

---

## Structure

### Part 0 — Orientation & Reality Check
- 0.1 Why TanStack Start — philosophy vs Next.js/Remix (isomorphic-first, Vite-native, router-owns-everything). Diagram: architecture comparison.
- 0.2 Version snapshot & stability legend. Covers the Vinxi→native-Vite-plugin migration and the deprecated `create-start` CLI → unified `@tanstack/cli`, since stale tutorials using the old patterns are widespread.
- 0.3 Prerequisite skill self-check: Vite plugin model, TanStack Router fundamentals, React 19 (Suspense/streaming/transitions), HTTP caching basics, TS generics comfort.

### Part 1 — Setup & Project Architecture
- 1.1 Scaffolding with the unified CLI; Vite plugin setup and plugin ordering. Code example: minimal `vite.config.ts`.
- 1.2 File-based routing conventions and project structure for larger apps. Diagram: folder tree → route tree.
- 1.3 **Coming from Next.js/Remix/plain TanStack Router** — concept-mapping chapter. Diagram: side-by-side data-fetching/rendering-lifecycle comparison.

### Part 2 — Rendering Model
- 2.1 SSR & streaming SSR. Diagram: request/response streaming timeline.
- 2.2 Loaders, `beforeLoad`, deferred data. Code example: deferred promise + `Await`.
- 2.3 Selective SSR (`ssr: true` / `'data-only'` / `false`) decision matrix. Diagram: decision tree.
- 2.4 Pending/error boundaries and hydration mechanics.

### Part 3 — Server Functions, Forms, Middleware & Security
- 3.1 `createServerFn` anatomy: validator, middleware, handler. Code example.
- 3.2 Calling conventions and the RPC compile boundary. Diagram: client bundle vs. server bundle split.
- 3.3 Middleware system: request vs. function middleware, global registration via `start.ts`.
- 3.4 Security baseline: CSRF, input validation, server-derived sessions, server routes for public/cross-origin APIs.
- 3.5 **Forms**: `@tanstack/react-form-start` (official, v1 stable). One `formOptions` schema shared by client and server. Server-side validation via `createServerValidate` inside a `createServerFn`. Works without JS — native `<form action>` + progressive enhancement, errors rehydrated with `mergeForm()`. Code example: a signup form that validates the same way with and without JS enabled.

### Part 4 — State & Data Integration
- 4.1 TanStack Query + Start — the one **officially supported** integration (`setupRouterSsrQueryIntegration`), streaming dehydration/hydration, `staleTime` conventions. Load-bearing chapter. Diagram + code example.
- 4.2 TanStack DB — collections, live queries, optimistic mutations, the `query-db-collection` bridge. Flagged clearly: **beta, no SSR support yet** — client-only in a Start app today. Covers the actual sync backends (Electric/Postgres, Query/REST-poll, TrailBase, RxDB, PowerSync) and their real latency (Electric ≈ under 2 seconds) — good for app/domain data, **not** built for sub-second feeds.
- 4.3 Decision framework: when you need client UI state at all vs. Query/DB alone.
- 4.4 Zustand vs. Jotai for Start — per-request isolation patterns for both (neither has official Start docs; both adapted from their Next.js SSR guides, flagged as community/inferred). Side-by-side comparison table + recommendation (Jotai edges ahead: official `jotai-tanstack-query` bridge, purpose-built `useHydrateAtoms`; Zustand viable with disciplined per-request factory, simpler mental model).
- 4.5 The singleton-leak bug class — why module-level stores bleed across requests, worse under streaming/edge. Diagram: request isolation vs. leaked module state.

### Part 5 — Advanced Configuration & Tuning
- 5.1 Prerendering/SSG and SPA mode. Code example configs.
- 5.2 Caching headers; env vars (`VITE_`/`PUBLIC_` prefixes, per-request reads on edge runtimes, secret-leak pitfalls).
- 5.3 Code splitting and custom server entry points.
- 5.4 ISR — noted as unsettled (still on a `v0` docs path), not treated as a stable feature.

### Part 6 — Architecture Patterns by App Shape *(new)*
Recipes that combine Parts 1–5 for real app shapes. Each one says plainly: what to render where, which state tool to reach for, and what to avoid.

- 6.1 **The shell pattern — SSR shell, CSR content.** Render the frame (nav, header, layout) on the server so it's fast and indexable. Render the part that's interactive or changes too often to be worth pre-rendering purely on the client. In Start: parent/layout route stays `ssr: true`, the content route is `ssr: false` or `'data-only'`. Experimental variant: stream the shell as RSC with a client-fillable slot for the CSR region (cross-reference Appendix A). Diagram: shell (SSR) wrapping a hydration boundary around a CSR region. Code example: a `__root` layout wrapping a `/dashboard/live` route set to `ssr: false`.

- 6.2 **CMS pattern.** Most pages barely change — build them once instead of rendering on every request, and only rebuild when content actually changes. Prerender/SSG for content pages (`prerender.pages` for per-route control + sitemap). Preview mode: a signed cookie flips a single route to `ssr: true` so editors see unpublished drafts live. Revalidation: a CMS publish webhook hits a server route that busts the cache (ISR path — flag as unsettled). Diagram: CMS → webhook → cache purge/rebuild → CDN → visitor.

- 6.3 **Trading / real-time pattern.** Prices change every second, so server-rendering them is pointless — they're stale before the HTML arrives. Shell (account info, layout) stays server-rendered; live prices are `ssr: false`, client-only. **Flag clearly: Start has no native WebSocket support** (its srvx/h3v2 server can't do the WS upgrade in dev/preview as of this research — documented gap, not an oversight on our part). The supported pattern is a server route returning a `ReadableStream` (SSE-style), or running prices through a separate WebSocket service the client connects to directly. TanStack DB's synced collections assume ~2-second consistency — fine for positions/order history, wrong tool for tick-by-tick prices. Diagram: exchange feed → SSE server route → client-only price widget, kept separate from the SSR'd account shell.

- 6.4 **ERP / data-dense pattern.** Mostly big forms and big tables behind a login, with real business rules. First-paint speed matters less than correctness and consistency. Forms: `@tanstack/react-form-start` (3.5) with server + client sharing one schema. Tables: TanStack Table's manual row model — loader reads page/sort/filter from URL search params, fetches exactly that slice, Table just renders it (no special adapter exists, this is the whole pattern). Multi-step operations (e.g. "ship order" touching inventory + order + invoice) use TanStack DB staged transactions for rollback-on-failure, or a single server function wrapping a DB transaction if client-side reactivity isn't needed. Permissions checked twice: `beforeLoad` (route-level) and server-function middleware (data-level) — a hidden button is not security. Diagram: request → auth middleware → server function → transaction (commit/rollback) → optimistic UI update.

### Part 7 — Testing & Performance
- 7.1 Testing server functions and loaders.
- 7.2 Performance tuning: bundle analysis, streaming waterfalls, prefetch strategy.

### Part 8 — Deployment Stack
- 8.1 Deployment model overview: host-specific Vite plugin vs. Nitro preset. Diagram: decision matrix by app shape (edge-latency-sensitive vs. long-running server vs. SSG-heavy).
- 8.2 Worked example: Cloudflare Workers (Vite-plugin host, edge runtime, env-var gotchas).
- 8.3 Worked example: Node/Docker via Nitro preset (long-running server — the right default for the ERP pattern above).
- 8.4 Config-delta reference: Vercel, Netlify, Bun, Railway.

### Part 9 — Appendices (experimental & unofficial territory, deliberately quarantined)
- **A. React Server Components** — kept out of the core spine since it's experimental and isn't a prerequisite for anything else.
  - A.1 RSC in Start today: philosophy vs. Next.js, enabling it (`rsc: { enabled: true }`, React 19+/Vite 7+/`@vitejs/plugin-rsc`), the API surface (`renderServerComponent`, `createCompositeComponent`), documented limitations.
  - A.2 **How the streaming actually works, in plain terms.** The server turns a component into a stream of bytes ("Flight") instead of one JSON blob. The client reads that stream piece by piece and turns each piece into real UI as it arrives — no waiting for the whole response. Concrete trace: `renderToReadableStream` (server: makes the stream) → `createFromReadableStream` / `createFromFetch` (client: reads it). For progressive delivery, a server function can be an async generator that `yield`s one piece at a time, so the client updates as each piece lands instead of getting one big blob at the end. Diagram: a byte stream with three chunks arriving at different times, each turning into a rendered UI piece as it lands.
  - A.3 **Why RSC is considered React's direction, with sources.** Per TanStack's own blog ("React Server Components Your Way," April 2026): RSC moves expensive rendering work (markdown parsing, formatting, heavy logic) off the client entirely — the server does it once and ships the *result* as UI, not as data plus the code to render that data. Measured effect cited in that post: ~153KB gzip removed from the client bundle on their docs pages. Contrast with Next.js: TanStack treats RSC as a stream you fetch/cache/compose yourself, not a framework-owned server tree — same underlying React primitive, different philosophy.
- B. TanStack DB deep dive — expand once SSR support lands.
- C. Skill mastery checklist (the 10-skill list from research: Vite depth, Router mastery, React 19, streaming/Suspense, HTTP caching, RPC mental model, edge-runtime awareness, TS generics, Nitro/preset literacy, Query integration) and notes on staying current given the framework's pace.
- D. Capstone build-along — an optional closing chapter that references patterns from earlier chapters (including Part 6) rather than a shared growing codebase, per the "standalone snippets" decision below.

---

## Changes from devil review
1. Added the Next.js/Remix migration chapter early (Part 1.3) instead of burying it as a late recap — it's the actual entry point for the stated audience.
2. Demoted React Server Components from a core Part to a clearly-marked optional appendix — it's experimental and isn't a prerequisite for anything downstream.
3. Kept both Zustand and Jotai (per original scope) but reframed as a single comparative chapter with explicit "community-inferred, no official Start docs" flagging, rather than two standalone authoritative-sounding chapters.
4. Cut scope roughly in half: Rsbuild reduced to a mention, Appwrite dropped, ISR demoted to a flagged note, deployment trimmed from a 6-provider tour to a decision matrix + 2 worked examples.
5. Reordered so Testing precedes Deployment, and Security lives beside Server Functions instead of in a disconnected late "hardening" part.

## Decisions
- **Deliverable format**: Starlight (Astro-based docs site), built to static HTML. Gives navigable chapters, search, and syntax-highlighted code out of the box.
- **Code examples**: standalone, self-contained snippets per chapter — no single running capstone app. Each chapter's example stands alone; Part 9.D's "capstone" is an optional closing chapter that references patterns from earlier chapters rather than a growing shared codebase.

## Changes from this update (app-shape patterns + RSC streaming)
- Added Part 6, four pattern-recipe chapters (shell/CSR, CMS, trading, ERP), each composing primitives from Parts 1–5 rather than introducing new API surface — kept deliberately to 4 chapters, not a sprawling "patterns cookbook," to avoid re-inflating scope after the earlier trim.
- Added 3.5 (Forms via `@tanstack/react-form-start`, official and v1-stable) — a real gap in the original plan, needed by the CMS/ERP patterns.
- Added a real-time/WebSocket research finding that changes how Part 6.3 must be written: **Start has no native WebSocket support today** (a server-architecture gap, not a missing doc) — the trading pattern chapter states this plainly rather than implying it's supported.
- Added TanStack Table's actual integration story to 6.4: there is no dedicated adapter — it's the manual/server-side row model plus a normal loader. Documented as-is rather than invented.
- Expanded Appendix A with A.2 (streaming mechanics trace) and A.3 (sourced "why RSC matters" framing) per your request — kept inside the appendix, not promoted to the core spine, since it's still experimental.

## Next steps (not started — plan/topics only per current scope)
1. Scaffold the Starlight site (Astro + Starlight, content collections per Part).
2. Set up a mermaid diagram renderer (Starlight supports remark/rehype plugins for mermaid).
3. Write chapters part-by-part, each with a version-pinned callout, a standalone code snippet, and a diagram.
