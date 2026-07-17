---
title: Coming from Next.js, Remix, or Plain TanStack Router
description: A direct concept mapping for developers who already know Next.js App Router, Remix/React Router v7, or TanStack Router without Start.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

If you know one of these three already, this chapter is the fastest path into Start — faster than reading the setup chapters first. Come back to [1.1](../01-scaffolding-and-vite-plugin/) and [1.2](../02-file-based-routing-and-project-structure/) once you know where your existing mental model transfers directly and where it doesn't.

## The one thing to unlearn if you're coming from Next.js App Router

Next's App Router defaults to React Server Components: your components run on the server unless you write `'use client'`, and that split is the architecture. Start does not work this way by default. Every component in a default Start app is what Next would call a client component — it can be server-rendered to HTML (that's what SSR is), but it also hydrates and can re-render in the browser. There's no server/client component split baked into the default rendering path.

Start does have React Server Components — [Appendix A](../../09-appendices/01-rsc-in-start-today/) covers them — but they're an experimental, opt-in feature you reach for deliberately, not the default rendering model. If you build a Start app the way you'd build a Next.js app and never touch the RSC guide, you have not accidentally skipped RSC-by-default; that's just how Start renders everything.

What Start defaults to instead is regular SSR-with-hydration, per route, with fine-grained control over how much of that happens on the server (`ssr: true` / `'data-only'` / `false` — [2.3](../../02-rendering-model/03-selective-ssr/)). That's architecturally closer to what Remix and plain React Router v7 do than to Next's App Router.

## Concept mapping: Next.js App Router → Start

| Next.js App Router | TanStack Start | Notes |
|---|---|---|
| Server Components by default | Regular components, rendered server-side by default via SSR | Not the same mechanism — see above |
| `'use client'` | Not needed — nothing opts in/out of being a "client component" | Use `ssr` (per-route) or `<ClientOnly>` (per-component) to control *where* rendering happens instead |
| `app/layout.tsx` | `src/routes/__root.tsx` | Root is always matched, always rendered |
| `app/page.tsx` | `src/routes/index.tsx`, exporting `Route = createFileRoute('/')({ component })` | |
| `app/posts/[slug]/page.tsx` | `src/routes/posts/$slug.tsx` | `$` instead of `[]` |
| `app/posts/[...slug]/page.tsx` | `src/routes/posts/$.tsx` | splat route, `params._splat` |
| `loading.tsx` | `pendingComponent` on the route | See [2.4](../../02-rendering-model/04-boundaries-and-hydration/) |
| `error.tsx` | `errorComponent` on the route | Same chapter |
| Async Server Component doing `await fetch(...)` | Route `loader` | Loaders run isomorphically — server on initial load, client on subsequent navigation |
| Server Actions (`'use server'`) | `createServerFn()` | Start's version: configurable GET/POST, built-in input validation, composable client *and* server middleware |
| `app/api/x/route.ts` | `server.handlers` on a file route, or a dedicated server route file | |
| `middleware.ts` (single file, Edge Runtime, no DB/filesystem access) | Request middleware registered in `src/start.ts`, plus per-server-function middleware | Start's middleware runs in your normal server runtime — no Edge-only restriction baked into the model |
| `revalidatePath` / fetch cache | Router's per-route `staleTime`/`gcTime`, or the official TanStack Query integration ([4.1](../../04-state-and-data/01-tanstack-query/)) | |

A concrete before/after, adapted from Start's own migration guide:

```tsx
// Next.js — src/app/posts/[slug]/page.tsx
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  return <div>My Post: {slug}</div>
}
```

```tsx
// Start — src/routes/posts/$slug.tsx
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/posts/$slug')({
  component: Page,
})

function Page() {
  const { slug } = Route.useParams()
  return <div>My Post: {slug}</div>
}
```

And a Server Action becoming a server function:

```tsx
// Next.js
'use server'
export async function createPost(title: string) {
  return db.post.create({ data: { title } })
}
```

```tsx
// Start
import { createServerFn } from '@tanstack/react-start'

export const createPost = createServerFn({ method: 'POST' })
  .validator((title: string) => title)
  .handler(async ({ data: title }) => {
    return db.post.create({ data: { title } })
  })
```

## Concept mapping: Remix / React Router v7 Framework Mode → Start

This mapping is much shorter, because the underlying shape is closer. React Router v7's Framework Mode is Remix's direct successor — same loader/action model, Vite-based build — and that model is architecturally the closest thing to Start's loaders/server functions of any framework in this comparison. Both frameworks put the router in charge of data loading (as opposed to Next's "fetch inside whatever component needs it"), and both keep reads (loaders) and writes (actions/server functions) as distinct, framework-blessed concepts rather than folding everything into one Server Component tree.

| Remix / React Router v7 | TanStack Start | Notes |
|---|---|---|
| `loader` export, one per route | Route `loader` option | Same idea: server-rendered read, tied to a route |
| `useLoaderData()` | `Route.useLoaderData()` | |
| `action` export, one per route, handles all mutations for that route | `createServerFn()`, called from wherever you need it | Start decouples mutations from routes — a server function isn't pinned to one route and can be called from a loader, an event handler, or another server function |
| `<Form method="post">` posting to the route's `action` | Progressive-enhancement forms via `@tanstack/react-form-start`, calling a server function | Covered in [3.5](../../03-server-functions-forms-security/05-forms/) |
| Single `loader`/`action` per route file | Server functions carry their own composable middleware and input validation | Remix's actions don't have a built-in middleware chain; Start's do — see [3.3](../../03-server-functions-forms-security/03-middleware/) |
| Nested routes drive layout | Same nested-route model, same mental model | This part genuinely doesn't change |

The practical difference once you're past the initial mapping: Remix ties exactly one loader and one action to exactly one route. Start's server functions are ordinary values — you import them, call them from more than one place, compose them with middleware, and validate their input with a schema, independent of which route (if any) happens to use them.

## Data-fetching and rendering lifecycle, side by side

```mermaid
sequenceDiagram
    participant B as Browser
    participant N as Next.js App Router
    participant R as Remix / React Router v7
    participant S as TanStack Start

    Note over B,N: Next.js — RSC-first
    B->>N: GET /posts/123
    N->>N: Render Server Components (async, data fetched inline)
    N-->>B: RSC payload + HTML for Server Components
    B->>B: Hydrate only Client Components

    Note over B,R: Remix / RR7 — loader-first
    B->>R: GET /posts/123
    R->>R: Run route loader on server
    R-->>B: HTML + serialized loader JSON
    B->>B: Hydrate whole tree, loader data passed in as props

    Note over B,S: TanStack Start — router-owned, per-route
    B->>S: GET /posts/123
    S->>S: beforeLoad + loader run server-side (per route's ssr option)
    S->>S: Render matched route component(s) to HTML
    S-->>B: Streamed HTML + dehydrated loader data
    B->>B: Hydrate; loader re-runs client-side on future navigations
```

The Start row is the one to internalize: `beforeLoad`/`loader` execution and component rendering are each controlled per route, streamed as they resolve, and — unlike Remix, where the loader only ever runs server-side — the same loader function runs again on the client for subsequent client-side navigations. [2.1](../../02-rendering-model/01-ssr-and-streaming/) and [2.2](../../02-rendering-model/02-loaders-and-deferred-data/) go through this in detail.

## What doesn't map cleanly

- **Next's automatic image/font optimization** (`next/image`, `next/font`) has no Start equivalent. The migration guide points to [Unpic](https://unpic.pics/) for images and Fontsource/CSS-first `@font-face` for fonts — you own this instead of getting it for free.
- **Next's `<Form>` with `useActionState`** and **React Router's `<Form>` API** both have first-party form primitives baked into routing. Start has no router-level `<Form>` component; forms go through `@tanstack/react-form-start` instead ([3.5](../../03-server-functions-forms-security/05-forms/)).
- **A single `middleware.ts` file** doesn't exist. Start's middleware is composable and layered (request-level and function-level, each with client and server phases) rather than one interception point — more powerful, but there's no single file to go looking for.
