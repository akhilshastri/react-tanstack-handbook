---
title: Loaders & Deferred Data
description: The loader/beforeLoad shape, and how to stream slow data in behind fast data instead of blocking the whole route on it.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

## Loader shape and `beforeLoad`, quickly

If you've used TanStack Router, this is unchanged — Start doesn't add a second data-loading API on top of it. Two things worth restating because they trip people up specifically in a Start context:

**Loaders are isomorphic, not server-only.** A route's `loader` runs on the server during the initial SSR request, and runs again in the browser on every subsequent client-side navigation to that route. If you write `process.env.SECRET` directly inside a loader, it leaks to the client bundle — the fix is to call a `createServerFn()` from the loader, not to put server-only logic in the loader body itself.

```tsx
// ❌ process.env read happens in isomorphic code — leaks to the client bundle
export const Route = createFileRoute('/users')({
  loader: () => fetch(`/api/users?key=${process.env.API_KEY}`),
})

// ✅ the secret only ever exists inside the server function
const getUsers = createServerFn().handler(() => {
  return fetch(`/api/users?key=${process.env.API_KEY}`)
})

export const Route = createFileRoute('/users')({
  loader: () => getUsers(),
})
```

**`beforeLoad` runs before `loader`, and is where route context gets built.** It's the natural place for auth checks and for injecting values (a resolved user, a tenant ID) that the loader — and every child route's loader — can then read from `context`:

```tsx
// src/routes/_authed.tsx
export const Route = createFileRoute('/_authed')({
  beforeLoad: async ({ context }) => {
    const user = await context.getUser()
    if (!user) throw redirect({ to: '/login' })
    return { user } // merged into context for this route and its children
  },
})
```

Whether `beforeLoad`/`loader` actually execute on the server for a given route is controlled by that route's `ssr` setting — see [2.3](../03-selective-ssr/) for the full breakdown.

## The problem deferred data solves

Router loaders run in parallel and the route waits for all of them before rendering. That's the right default almost all the time — but occasionally one piece of data on a page is much slower than the rest (an analytics rollup, a third-party API call), and blocking the entire route on it means fast data sits waiting behind slow data for no good reason.

The fix: **return a promise from the loader without awaiting it.** Await only the data you need immediately; let the slow promise ride along unresolved.

```tsx
// src/routes/dashboard.tsx
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

const getAccountSummary = createServerFn().handler(() => getFastSummary())
const getUsageAnalytics = createServerFn().handler(() => computeSlowAnalytics())

export const Route = createFileRoute('/dashboard')({
  loader: async () => {
    // slow — kicked off but not awaited
    const analyticsPromise = getUsageAnalytics()

    // fast — awaited, blocks the route until it resolves
    const summary = await getAccountSummary()

    return {
      summary,
      analyticsPromise,
    }
  },
  component: DashboardPage,
})
```

## Consuming the deferred promise with `Await`

The component reads the fast data straight off `useLoaderData()` as usual. The slow promise goes through the `Await` component, wrapped in `Suspense`:

```tsx
import { Await } from '@tanstack/react-router'
import { Suspense } from 'react'

function DashboardPage() {
  const { summary, analyticsPromise } = Route.useLoaderData()

  return (
    <div>
      <AccountSummary data={summary} />

      <Suspense fallback={<AnalyticsSkeleton />}>
        <Await promise={analyticsPromise}>
          {(analytics) => <UsageChart data={analytics} />}
        </Await>
      </Suspense>
    </div>
  )
}
```

`Await` suspends on the promise, triggering the nearest `Suspense` boundary until it resolves. If the promise rejects, `Await` throws the (serialized) error instead, to be caught by the nearest error boundary — not silently swallowed. [2.4](../04-boundaries-and-hydration/) covers how that boundary scoping works.

:::tip
React 19's `use()` hook does the same job as `Await` and works fine here too — `const analytics = use(analyticsPromise)` inside a component rendered under a `Suspense` boundary. `Await` is the TanStack Router-native option and is what the framework's own docs lead with; reach for `use()` if you'd rather keep one fewer import and are comfortable with its stricter rules around conditional calls.
:::

## What this looks like over the wire

This isn't purely a client-side Suspense trick — it's a real streaming pattern that spans server and client:

1. **Server**: all awaited loader data resolves, the route starts rendering. Deferred promises rendered through `Await` suspend their boundary, letting the server stream HTML up to that point.
2. **Client**: receives the initial HTML immediately. The `Await` boundaries are showing their `Suspense` fallback, waiting on data that hasn't arrived yet.
3. **Server**: as each deferred promise resolves, its result (or error) is serialized and streamed down as an inline script tag, in the same response.
4. **Client**: the waiting `Await` boundaries resolve with the streamed data and render the real content — or throw to the nearest error boundary if the server-side promise rejected.

The net effect: fast data is in the initial HTML, slow data arrives progressively in the same request, and nothing about the deferred-data code changes between "SSR" and "client-side navigation" — the same loader and the same `Await` usage work in both.

:::note
Using an external data library instead (TanStack Query, for example) changes this slightly — you `queryClient.prefetchQuery()` the slow one without awaiting, `ensureQueryData()` the fast one, and consume both with the library's own hooks under `Suspense` rather than `Await`. [4.1](../../04-state-and-data/01-tanstack-query/) covers that integration.
:::
