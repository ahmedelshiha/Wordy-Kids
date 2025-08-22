# Jungle Theme Overlays Project

This bundle adds animated, low-impact jungle overlays (fireflies, fog, glow, ripples) plus a theme manager.
It is framework-agnostic React + CSS and can be dropped into your app.

## Files
- `src/components/JungleThemeOverlay.tsx` – React overlay component that draws animated layers (firefly, fog, glow, ripples).
- `src/components/JungleAdventureThemeManager.ts` – tiny helper to set/get theme and apply CSS variables to `:root`.
- `src/pages/ThemeDemo.tsx` – simple demo page to preview themes.
- `src/styles/jungle-theme.css` – all animations, variables, and media-query fallbacks.
- `builderio_prompt.md` – copy-paste prompt for Builder.io to integrate.
- `public/textures/*` – transparent overlays (`firefly.png`, `fog.png`, `glow.png`, `ripples.png`) and base parchment texture if needed.

## Quick start
1) Copy `src/styles/jungle-theme.css` into your CSS pipeline (import it once).
2) Mount `<JungleThemeOverlay />` near the end of your page layout (inside the page root, not fixed to viewport if you want it to clip to containers).
3) Set the theme at startup:
```ts
import { JungleAdventureThemeManager as Themes } from "./components/JungleAdventureThemeManager";
Themes.applyTheme("parchment"); // or "jungle", "canopy", "river", "sunset"
```
4) Toggle overlays via props: `<JungleThemeOverlay fireflies fog glow ripples />`
5) Respect reduced motion automatically (handled in CSS).

## Notes
- Overlays use `pointer-events: none` and `mix-blend-mode` to stay subtle.
- Mobile optimizations: opacity + animation-speed reduced on small screens.
- If `prefers-reduced-motion: reduce` is set, overlays are disabled.