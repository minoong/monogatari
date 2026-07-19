<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:stackflow-rules -->
# Stackflow Framework
Stackflow is a mobile-first stack navigator framework with a composable plugin system for JS/TS environments (React supported).

## Core Concepts
- Uses `@stackflow/config`, `@stackflow/core`, and `@stackflow/react`.
- **Config API**: `@stackflow/config` provides `defineConfig` for statically defining activities without React dependencies. 
  - Properties include: `activities` (array of objects with `name`), `transitionDuration` (number), `initialActivity` (function returning activity name).
  - You can extend `Config` and use `config.decorate("key", value)` to inject extra information required by plugins.
- **Features**: Screen stacking, transitions, iOS-style swipe back, parameter passing.
- **Server-Side Rendering (SSR)**: Supports `ReactDOMServer.renderToString`.

## Setup Example
```ts
import { defineConfig } from "@stackflow/config";
import { stackflow } from "@stackflow/react";

export const config = defineConfig({
  activities: [
    { name: "HomeActivity" },
    { name: "MyProfileActivity" }
  ],
  transitionDuration: 270,
  initialActivity: () => "HomeActivity",
});

const { Stack } = stackflow({
  config,
  components: { HomeActivity, MyProfileActivity },
  plugins: [],
});
```
<!-- END:stackflow-rules -->

<!-- BEGIN:project-rules -->
# Monogatari Project Rules

## Architecture

- `app/page.tsx` is the Next.js entry point; mobile navigation lives in Stackflow activities.
- Register or rename activities through `components/stackflow.ts` and update all `useFlow` callers together.
- Remote checklist state is owned by TanStack Query under the `['checklist']` query key.
- Supabase Realtime handlers must update or invalidate the same query cache rather than creating duplicate local item state.

## UI

- Prefer HeroUI v3 for new forms and accessible form controls. Consult `@heroui/react-mcp` before using or changing HeroUI component APIs.
- Do not add a HeroUI provider; v3 does not require one.
- Preserve the CSS import order in `app/globals.css`: `tailwindcss` first, then `@heroui/styles`.
- Reuse existing local UI primitives for app shells such as Drawer, Toast, and Dynamic Island unless a migration is explicitly in scope.
- Avoid adding another component library when HeroUI or an existing local primitive covers the requirement.

## Data and Safety

- Treat API route input as untrusted. Validate required fields, allowed enum values, arrays, and identifiers before writing to Supabase.
- Never expose a Supabase service-role key to client code or a `NEXT_PUBLIC_` variable.
- Preserve optimistic-update rollback behavior when changing checklist mutations.
- The nudge endpoint is a mock; do not describe it as a real push notification implementation.

## Verification

- Run `npm run lint` after TypeScript or React changes.
- Run `npm run build` for changes that affect routing, providers, dependencies, server/client boundaries, or production rendering.
- Do not claim checklist realtime behavior is verified unless it was tested against a configured Supabase project.

## Git

- Commit completed work after verification unless the user explicitly asks not to commit.
- Write commit subjects in Korean and keep each commit scoped to the completed task.
- Do not stage unrelated user changes or untracked artifacts.
<!-- END:project-rules -->
