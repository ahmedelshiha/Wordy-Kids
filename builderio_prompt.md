# Builder.io Integration Prompt – Jungle Theming & Overlays

You are implementing **Jungle Theme & Animated Overlays** for the navigation and main pages.

## Deliverables
1) A **React component** `JungleThemeOverlay` that renders 3–4 animated overlay layers (fireflies, fog, glow, ripples). Use absolute positioning and `pointer-events:none`. Respect `prefers-reduced-motion` using CSS.
2) A **theme manager** `JungleAdventureThemeManager` that toggles 5 themes by adding a class to `document.documentElement`: `jng-theme-parchment`, `jng-theme-jungle`, `jng-theme-canopy`, `jng-theme-river`, `jng-theme-sunset`. Persist the choice in `localStorage` key `jungleTheme`.
3) CSS file `jungle-theme.css` that defines:
   - CSS variables and gradients for all themes.
   - Keyframes: `jng-firefly`, `jng-fog`, `jng-glow`, `jng-ripples`.
   - Mobile and reduced-motion fallbacks.
4) Demo: A small page that mounts the overlay and allows theme/overlay toggles.

## Constraints
- No heavy JS animation libraries; pure CSS animations.
- Overlays must be subtle, <30% opacity combined on mobile.
- All layers must degrade gracefully with `prefers-reduced-motion: reduce`.

## Assets
Load these transparent PNGs from `/public/textures/`:
- `firefly.png`, `fog.png`, `glow.png`, `ripples.png`
- Optional base: `parchment.png`

## Acceptance Criteria
- Setting a theme immediately changes the page background.
- Toggling overlays shows/hides corresponding animated layer.
- On mobile, opacity is reduced and CPU stays cool.
- With reduced motion enabled, layers stop animating.

Use the files provided in this package as references or drop-in code.