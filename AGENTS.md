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
