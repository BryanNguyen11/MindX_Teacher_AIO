Project Guidelines

These rules align code and UI across the app. Prefer clarity, consistency, and accessibility. Keep this file short and opinionated—update it as the system evolves.

General
- Use responsive layout first. Prefer flex and grid; avoid absolute positioning unless anchoring overlays/portals.
- Co-locate logic: small, focused components; extract hooks into `src/components/utils` if reusable; avoid “god” components.
- Keep files small (<250–300 LOC). Split by responsibility before crossing that boundary.
- Type everything. Use explicit prop and function types; avoid `any`.
- Naming: use kebab-case for files (`color-picker.tsx`), PascalCase for React components, camelCase for vars/functions.
- Accessibility: all interactive elements must be accessible via keyboard and have ARIA labels when not obvious.
- Animations: use Motion or CSS transitions; keep them subtle and under 300ms unless progress/loader.
- Images: always include `alt` text. Use `ImageWithFallback` for external images.

Design system (Tailwind v4 + Radix + shadcn/ui)
- Base font-size is 14px. Don’t override on html/body—use utilities and tokens.
- Use tokens from `src/styles/globals.css` via Tailwind CSS variables: `bg-background`, `text-foreground`, `border-border`, etc.
- Use shadcn/ui primitives in `src/components/ui/*` before creating custom ones. Extend via `className`, not forking.
- Spacing scale: use Tailwind spacing utilities; avoid raw pixels unless necessary for hairlines (1px) or shaders.
- Color: never hardcode hex in components; rely on CSS variables (`var(--primary)` via `text-primary`, `bg-primary`).
- Radius: use `rounded-sm|md|lg|xl` which map to `--radius` tokens.
- Dark mode: rely on `.dark` class tokens already defined. Don’t duplicate color logic in components.
- Icons: use `lucide-react`. Size via `size` prop or Tailwind `w-4 h-4`.

React patterns
- State: prefer controlled inputs; lift state when shared across siblings. For forms, use `react-hook-form`.
- Side effects: isolate in `useEffect` with minimal deps; clean up listeners/timeouts.
- Performance: memoize expensive renders with `React.memo` and memoize callbacks with `useCallback` when passing to deep children.
- Avoid prop drilling: compose via context only for truly shared state (theme, auth, layout), otherwise pass locally.

Components
- Export a single default component per file. Export types as named exports.
- Props
  - Required props first, optional after. Provide sensible defaults.
  - Accept `className` and merge with `tailwind-merge` when combining internal classes.
  - Don’t expose visual booleans like `isRed`; prefer variant props and `cva` from `class-variance-authority`.
- Events: use onX naming and forward original event objects.
- Accessibility: Focus rings must be visible. Use `data-state` attributes from Radix for styling states.

CSS and Tailwind
- Use utilities for layout/spacing/typography. Create minimal component-level CSS only when utilities fall short.
- Prefer semantic stacking: padding on the container, margin on the child when pushing away siblings.
- Avoid `!important`. If needed, refactor.
- Avoid inline styles except for dynamic CSS variables or canvas/webgl shaders.

Files and folders
- UI primitives live under `src/components/ui/` and should remain generic.
- App-specific components live under `src/components/`.
- Keep shared helpers in `src/components/utils/` or a domain-specific folder.

Accessibility checklist
- All buttons have discernible text (or `aria-label`) and correct role.
- Inputs have associated labels or `aria-labelledby`.
- Keyboard navigation works: Tab/Shift+Tab reach interactive elements in logical order.
- Color contrast meets WCAG AA; don’t rely solely on color to convey meaning.

Commit hygiene
- One change per commit. Use present tense imperative: “Add color preset picker”, “Fix shader precision on iOS”.
- Include a brief rationale if the change isn’t obvious.

Button variants (quick reference)
- Primary: `bg-primary text-primary-foreground` for main actions. One per view.
- Secondary: `bg-secondary text-secondary-foreground` for supporting actions.
- Ghost: minimal emphasis, usually text or icon only.
- Destructive: `bg-destructive text-destructive-foreground` for irreversible actions.

When to create a new component
- Repeated markup ≥ 2 times, or the logic exceeds ~60–80 LOC.
- Different screens share a pattern that varies by props.

Do not
- Hardcode theme colors.
- Overuse absolute positioning for layout.
- Add dependencies without discussing tradeoffs in PR description.

Changelog
- 2025-10-28: Initial project-wide guidelines authored and adopted.
