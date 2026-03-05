# Responsive approach

How we handle breakpoints, layout, and mobile vs desktop in the app.

## Breakpoints

- **md = 768px**, **lg = 1024px** (Tailwind defaults).
- Custom CSS media queries use **767px** ("below md") and **1023px** ("below lg") so they align with Tailwind's `max-md` and `max-lg`.
- **Single source of truth:** [src/lib/constants.ts](src/lib/constants.ts) exports `BREAKPOINT_MD`, `BREAKPOINT_LG`, `MEDIA_MOBILE`, and `MEDIA_BELOW_LG`. Use these for any JS or `matchMedia`; keep globals.css media queries in sync (768/767 and 1024/1023).

## Approach

- **Prefer mobile-first:** Base classes define the mobile layout; use `md:` and `lg:` to layer on larger-screen styles. Use `max-md:` / `max-lg:` only when it simplifies a specific case.
- **Tailwind:** Responsive modifiers (`sm:`, `md:`, `lg:`) handle most layout and typography. No need for custom hooks for styling.

## Shell

- **Top bar:** Hidden below lg (1024px) via `max-lg:hidden` and a CSS fallback so the main app bar does not show on tablet/mobile.
- **Bottom nav:** Always present; fixed to the bottom with safe-area insets on mobile.
- **Main content:** Padding is reduced on small viewports (e.g. `px-2` on mobile, `md:px-5` on desktop).

## Container queries

- **Match screen:** `.match-teams-row` has `container-type: inline-size`; `.match-team-name` uses `clamp(..., cqw, ...)` so team names scale with the row width.
- **Hub:** Team Identity card (`.hub-identity-card`) and Division Snapshot card (`.hub-division-card`) use `container-type: inline-size` and `@container` so their layout can respond to the **card** width, not only the viewport. The viewport-based `.hub-stats-grid` media query remains as a fallback.

## When to use useIsMobile

Use **Tailwind responsive classes** for layout, visibility, and styling. Use **`useIsMobile()`** (from [src/hooks/use-mobile.tsx](src/hooks/use-mobile.tsx)) only when the **component tree or content** must change by breakpoint—for example:

- Rendering a simple list on mobile and a full data grid on desktop.
- Changing nav structure (e.g. different menu items or layout).

Prefer CSS/Tailwind for layout and styling; reserve the hook for structural or content differences.
