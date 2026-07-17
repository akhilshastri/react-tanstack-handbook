---
title: "Appendix B — TanStack DB Deep Dive"
description: A quick-reference companion to the main TanStack DB chapter, covering the current collection types. Expand once SSR support lands.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

:::note
This is deliberately a short chapter, not a stub. TanStack DB is still 🟡 beta and has **no SSR support today** — in a Start app, it's a client-only tool (see [TanStack DB](../../04-state-and-data/02-tanstack-db/) for the full derivation of what that means for loaders and hydration). Once SSR support lands, this appendix is the place that gets expanded into a real deep dive rather than a reference table.
:::

For the concepts — collections, live queries, optimistic mutations, and the `query-db-collection` bridge to TanStack Query — go to [TanStack DB](../../04-state-and-data/02-tanstack-db/). This page exists as a quick lookup for which collection type maps to which package, so you're not re-deriving that from the main chapter every time.

## Collection types

| Collection | Package | What it syncs against |
|---|---|---|
| **Query** | `@tanstack/query-db-collection` | Any REST/GraphQL endpoint, via TanStack Query underneath — poll-based, not push. The bridge collection type; usually the first one you reach for. |
| **Electric** | `@tanstack/electric-db-collection` | Postgres, via ElectricSQL's sync engine — real push-based sync, sub-2-second consistency in practice. |
| **TrailBase** | `@tanstack/trailbase-db-collection` | A TrailBase backend (SQLite-based sync backend). |
| **RxDB** | `@tanstack/rxdb-db-collection` | RxDB's own local-first database, for apps already built on it. |
| **PowerSync** | `@tanstack/powersync-db-collection` | PowerSync's sync engine, SQLite-based local-first sync. |
| **Local** | `@tanstack/db` (core, no separate package) | In-memory or `localStorage`-backed collections with no external sync target — useful for pure client state that still wants DB's query/mutation ergonomics. |

None of these ship a different mental model — a collection is a collection regardless of what's behind it, and the live-query and optimistic-mutation API surface is the same across all of them. The difference is entirely in setup (the options object each factory takes) and in how fast/how consistent the sync actually is, which matters a lot for deciding what kind of data belongs in DB at all — see the [decision framework](../../04-state-and-data/03-decision-framework/) for that call, and the [trading/real-time pattern](../../06-patterns/03-trading-realtime-pattern/) for a concrete case where DB's sync latency (fine for positions, wrong for tick-by-tick prices) is the deciding factor.

## Why this stays thin for now

Every collection type above is client-side sync — none of them currently have a story for participating in Start's SSR loader/hydration cycle the way TanStack Query does via the official integration. That's not a gap in this book; it's the actual current state of TanStack DB. Once that changes, this appendix grows into the place with SSR-specific patterns, hydration guidance, and per-collection setup depth. Until then, the main chapter plus this table is the honest scope.
