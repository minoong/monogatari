<!-- BEGIN:cult-ui-rules -->
# Cult UI Rule
If you need to create or use a button without specific user instructions, ALWAYS use the `neumorph-button` from `cult-ui` as the default button.
(Documentation: https://www.cult-ui.com/docs/components/neumorph-button)
You can install it using: `npx shadcn@latest add https://cult-ui.com/r/neumorph-button.json` if it is not already installed.
<!-- END:cult-ui-rules -->

<!-- BEGIN:ui-components-memory -->
# UI Component Preferences
- When implementing grid layouts, consider using Cult UI's `tweet-grid` (https://www.cult-ui.com/docs/components/tweet-grid).
- For additional UI components, consider exploring Skiper UI (https://skiper-ui.com/components).
<!-- END:ui-components-memory -->

<!-- BEGIN:ai-harness-engineering -->
# AI Harness & Workflow Hooks

## 1. Development Verification Hook
Whenever you (the AI agent) implement a new feature or modify code, you MUST execute the following verification steps BEFORE considering the task complete or creating a commit:
- Run `npm run lint` to check for styling or logic issues.
- Run `npx tsc --noEmit` to verify type safety.
- Run `npm run build` (if applicable and requested) to ensure the build does not break.
Do not proceed with committing or concluding the task until these checks pass.

## 2. Project Memory (Bugs & Tasks)
To maintain project continuity and remember future tasks or bugs:
- If a bug is discovered but not immediately fixed, record it in `BUGS.md` in the project root.
- If future tasks or architectural improvements are discussed, record them in `TASKS.md` in the project root.
- ALWAYS check `TASKS.md` and `BUGS.md` (if they exist) to align your current work with the project roadmap.
<!-- END:ai-harness-engineering -->

<!-- BEGIN:stackflow-architecture -->
# Stackflow Architecture & Harness
When working on navigation and layout in this application, you MUST strictly adhere to the Stackflow architecture:
1. **AppScreen Wrapper**: Every Activity component must be wrapped in `<AppScreen>` from `@stackflow/plugin-basic-ui`. Set the `appBar` property (e.g., `appBar={{ title: "..." }}`) if a header is needed.
2. **Navigation Methods**:
   - `push("ActivityName", { params })`: Use to slide a new screen onto the stack (with native iOS-style transition and back button).
   - `replace("ActivityName", { params }, { animate: false })`: Use for root-level bottom navigation tab switching to avoid weird slide-in animations.
3. **Config Driven**: New activities MUST be statically registered in `stackflow.config.ts` (using `defineConfig`) and exposed via the components map in `stackflow.ts`.
4. **Link Component**: For static links, prefer `<Link activityName="..." />` from `@stackflow/link` if history-sync is enabled.
<!-- END:stackflow-architecture -->

<!-- BEGIN:ui-consistency -->
# UI Consistency & Layout Rules
1. **Base Card UI**: Always use the shadcn/ui Card component (`https://ui.shadcn.com/docs/components/card`) as the default card container to maintain visual consistency across the app.
2. **Responsive Grids**: When implementing grid layouts, explicitly define responsive row and column structures that adapt to mobile environments and web design guidelines, prioritizing readability and functional consistency.
<!-- END:ui-consistency -->

<!-- BEGIN:interaction-animation-gotchas -->
# Interaction & Animation Gotchas (iOS & GSAP)
1. **iOS Safari Click/Blur Bug**: When implementing conditionally rendered elements (like a clear button that appears on `isFocused`), using `onClick` will fail on iOS Safari. The input's `blur` event fires first, unmounting the button before `click` can execute. 
   - **Solution**: Bind the primary action to `onPointerDown={(e) => { e.preventDefault(); ... }}` instead.
2. **GSAP Flip & Layout Jitter**: Never conditionally mount elements (or dynamically change padding/margins) INSIDE a container that is currently targeted by `GSAP Flip`. This changes the intrinsic layout size instantly and conflicts with libraries like `@number-flow/react`, causing severe visual jitter.
   - **Solution**: Keep Flip targets stable in size. Place elements like clear buttons entirely OUTSIDE the Flip target using `position: absolute`, ensuring they overlay without affecting flex calculations.
<!-- END:interaction-animation-gotchas -->
