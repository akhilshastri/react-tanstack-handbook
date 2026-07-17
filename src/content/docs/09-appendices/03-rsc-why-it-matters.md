---
title: "Appendix A.3 — Why RSC Is Considered React's Direction"
description: TanStack's own stated case for React Server Components, sourced from their April 2026 blog post, and how it contrasts with Next.js's approach.
---

> **Verified against** `@tanstack/react-start` v1.168.x — July 2026.

:::danger[Experimental]
Part of the RSC appendix — see [A.1](../../09-appendices/01-rsc-in-start-today/) for the full experimental-status banner. This chapter is framing and sourcing, not new API surface.
:::

This chapter exists to answer a question the previous two don't: not "how does RSC work in Start," but "why does the TanStack team think it's worth the current rough edges." Everything below is sourced directly from TanStack's own blog post, [React Server Components Your Way](https://tanstack.com/blog/react-server-components) (April 2026), which announced RSC support and explained the reasoning. Quotes are verbatim from that post.

## The core argument: ship the result, not the recipe

The post's central claim: "RSCs are a necessary primitive for moving heavy or expensive rendering logic off the client and onto the server." That's a specific, narrower claim than "RSC makes everything faster" — it's about a particular category of work: parsing, formatting, and rendering that's expensive to run in a browser but cheap to run once on a server and ship as a finished result.

The practical target is content that's "static or infrequently changing" — markdown parsing, syntax highlighting, anything where the client would otherwise have to download the library *and* the raw data *and* do the work itself, when the server could just do the work once and send the already-rendered UI.

## The numbers, as published

TanStack applied this to their own docs and blog, and published the before/after:

- Blog post pages: "dropped about **153 KB gzipped** from the client JS graph."
- Docs pages: "dropped about **153 KB gzipped**."
- Docs example pages: "dropped about **40 KB gzipped**."

For the `/blog/react-server-components` post itself specifically, the measured Lighthouse impact: performance score 52 → 74, Total Blocking Time 1,200ms → 260ms, transfer size 1,101 KiB → 785 KiB.

The post is explicit that this isn't a universal result: "RSCs are not a universal coupon code for performance." Pages that are already interaction-heavy rather than content-heavy don't see the same gain — you're not going to shrink a bundle by server-rendering something the client was always going to need to hydrate and manipulate anyway. The win is specific to the "expensive one-time rendering work" category, not a blanket claim about RSC everywhere.

## The contrast with Next.js

The post states the philosophical difference directly: "Next.js App Router is server-first: your component tree lives on the server by default, and you opt into client interactivity with `'use client'`. TanStack Start is isomorphic-first: your tree lives wherever makes sense."

Same underlying primitive — both are built on React's Flight protocol, the actual streaming format traced in [Appendix A.2](../../09-appendices/02-rsc-streaming-mechanics/). The difference is who owns the default. Next.js's App Router makes the server-owned tree the framework's organizing principle, and every component participates in it unless explicitly opted out. Start's position is that RSC output "can be fetched, cached, and rendered where it makes sense instead of owning the whole tree" — it's a value your route reaches for the same way it'd reach for any other cached, streamed data, not a mode the whole application lives inside.

This is the same isomorphic-first stance the rest of the book attributes to Start generally (see [Why TanStack Start](../../00-orientation/01-why-tanstack-start/)) — RSC turned out to fit that stance rather than forcing an exception to it. Whether that's the right trade-off for a given app depends on how much of it is genuinely content-heavy-and-expensive versus interaction-heavy — which is exactly the distinction the measured numbers above are drawing.
