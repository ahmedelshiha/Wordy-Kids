# Interactive Dashboard Image Size Guide

## Word Card Images (Primary Content)

### Standard Word Card Image

- **Exact Dimensions**: `400 x 300px` (4:3 ratio)
- **Mobile Version**: `300 x 225px`
- **Display Height**: 256px (fixed by CSS)
- **File Format**: WebP (preferred) or JPEG
- **Quality**: 80-85%
- **Max File Size**: 50-150KB
- **Optimization**: Use `object-cover` for consistent display

### High-DPI (Retina) Version

- **Dimensions**: `800 x 600px` (@2x)
- **Mobile Version**: `600 x 450px`
- **File Size**: 100-250KB
- **Usage**: For crisp display on high-resolution screens

## Card Component Specifications

### Interactive Word Card

```css
.word-image-container {
  width: 100%;
  height: 256px; /* Fixed height */
  object-fit: cover;
  border-radius: 16px;
}
```

### Responsive Breakpoints

```css
/* Mobile (≤768px) */
.word-card-mobile {
  height: 200px;
  width: 100%;
}

/* Tablet (769px-1024px) */
.word-card-tablet {
  height: 240px;
  width: 100%;
}

/* Desktop (≥1025px) */
.word-card-desktop {
  height: 256px;
  width: 100%;
}
```

## Image Content Guidelines

### Subject Matter

- **Clear focal point**: Object should fill 60-80% of frame
- **Clean background**: Minimal distractions
- **High contrast**: Good separation from background
- **Child-friendly**: Appropriate for educational content

### Technical Requirements

- **Aspect Ratio**: 4:3 (width:height)
- **Resolution**: Minimum 72 DPI
- **Color Space**: sRGB
- **Format**: WebP (90%+ browser support)
- **Fallback**: JPEG (universal support)

## Performance Optimization

### Loading Strategy

```html
<img
  src="word-image-400x300.webp"
  srcset="word-image-400x300.webp 1x, word-image-800x600.webp 2x"
  alt="Educational word illustration"
  loading="lazy"
  decoding="async"
/>
```

### File Size Targets

- **Standard Quality**: 50-100KB
- **High Quality**: 100-150KB
- **Maximum Allowed**: 200KB

## Dashboard Icon Assets

### Achievement Icons

- **Size**: `32x32px` or `48x48px`
- **Format**: SVG (vector) or PNG
- **Style**: Colorful, kid-friendly
- **Examples**: Trophy, star, medal, badge

### Category Icons

- **Size**: `24x24px` - `32x32px`
- **Format**: SVG preferred
- **Style**: Outlined or filled
- **Categories**: Animals, food, colors, numbers, etc.

### UI Element Icons

- **Size**: `16x16px` - `24x24px`
- **Format**: SVG icons (Lucide React)
- **Examples**: Play button, volume, settings

## Background Patterns (Current Implementation)

### CSS Gradients (No images needed)

```css
/* Jungle theme gradients */
background-image:
  radial-gradient(
    circle at 25% 25%,
    rgba(76, 175, 80, 0.2) 0%,
    transparent 40%
  ),
  radial-gradient(
    circle at 75% 75%,
    rgba(255, 193, 7, 0.15) 0%,
    transparent 40%
  ),
  linear-gradient(
    45deg,
    transparent 30%,
    rgba(76, 175, 80, 0.05) 50%,
    transparent 70%
  );
```

### SVG Patterns (Inline, no files needed)

- Geometric patterns using data URIs
- Jungle leaf patterns
- Educational symbols

## Image Naming Convention

### Word Images

```
Format: [category]-[word]-[size].webp
Examples:
- animals-elephant-400x300.webp
- food-apple-400x300.webp
- colors-red-400x300.webp
```

### Retina Versions

```
Format: [category]-[word]-[size]@2x.webp
Examples:
- animals-elephant-800x600@2x.webp
- food-apple-800x600@2x.webp
```

## Quality Control Checklist

### Image Requirements

- [ ] Correct aspect ratio (4:3)
- [ ] Appropriate file size (<150KB)
- [ ] Clear, educational content
- [ ] Good contrast and lighting
- [ ] Child-appropriate subject matter

### Technical Validation

- [ ] WebP format with JPEG fallback
- [ ] Lazy loading implemented
- [ ] Alt text provided
- [ ] Responsive sizing
- [ ] Error handling for missing images

## Implementation Example

```typescript
interface WordCardImage {
  url: string;
  alt: string;
  width: 400;
  height: 300;
  format: "webp" | "jpeg";
  size: number; // bytes
}

const wordImage: WordCardImage = {
  url: "/images/words/animals/elephant-400x300.webp",
  alt: "Large gray elephant in natural habitat",
  width: 400,
  height: 300,
  format: "webp",
  size: 125000, // 125KB
};
```
