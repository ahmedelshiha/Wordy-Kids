# Jungle Theme Textures

This directory contains the texture files used by the JungleThemeOverlay component.

## Required Files:

- `firefly.png` - Glowing firefly dots for magical floating effect
- `fog.png` - Semi-transparent fog layers for atmospheric depth
- `glow.png` - Soft glow effects for ambient lighting
- `ripples.png` - Water ripple effects for subtle movement
- `parchment.png` - Base parchment texture for theme backgrounds

## Specifications:

- Size: 512x512px recommended for optimal tiling
- Format: PNG with transparency support
- Compression: Optimized for web (≤300KB each)
- Color: Subtle, low-contrast overlays

## Usage:

These textures are referenced in `client/styles/jungle-theme.css` and applied as CSS background images with various blend modes and animations.

## Fallback:

If texture files are missing, the overlays will gracefully degrade to solid color animations.
