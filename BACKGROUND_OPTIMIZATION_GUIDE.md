# Background Image Optimization Guide

## Exact Dimensions by Device Type

### 📱 Mobile (≤768px)

- **Primary Size**: 750 x 1334px (iPhone 6/7/8 Plus @2x)
- **Secondary Size**: 828 x 1792px (iPhone 11 @2x)
- **Safe Zone**: Account for 44px top and 34px bottom safe areas
- **Orientation**: Portrait (9:16 ratio)
- **File Size**: 150-300KB

### 📟 Tablet (769px-1024px)

- **iPad Portrait**: 1536 x 2048px (@2x)
- **iPad Landscape**: 2048 x 1536px (@2x)
- **Android Tablets**: 1600 x 2560px (10" tablet)
- **Safe Zone**: Account for various screen ratios
- **File Size**: 300-500KB

### 🖥️ Desktop (≥1025px)

- **Standard HD**: 1920 x 1080px
- **QHD/1440p**: 2560 x 1440px ⭐ **RECOMMENDED**
- **4K/UHD**: 3840 x 2160px (for high-end displays)
- **Ultra-wide**: 3440 x 1440px (21:9 ratio)
- **File Size**: 400-800KB

## Best File Format Strategy

### 1. WebP (Current Implementation) ✅

```
Quality: 85-90%
Size Reduction: 25-35% vs JPEG
Browser Support: 96%+ modern browsers
Alpha Channel: Supported
```

### 2. Modern Format Stack (Recommended Upgrade)

```html
<picture>
  <source srcset="bg_desktop.avif" type="image/avif" />
  <source srcset="bg_desktop.webp" type="image/webp" />
  <img src="bg_desktop.jpg" alt="Background" />
</picture>
```

### 3. File Size Targets

- **Mobile WebP**: 150-300KB
- **Tablet WebP**: 300-500KB
- **Desktop WebP**: 400-800KB
- **4K Desktop**: 800KB-1.2MB max

## Compression Settings

### WebP Optimization

```bash
# Command line example
cwebp -q 85 -m 6 -mt -af input.jpg -o output.webp
```

### Quality Guidelines

- **Photography**: 80-90% quality
- **Graphics/Illustrations**: 75-85% quality
- **Text-heavy images**: 90-95% quality

## Performance Considerations

### Loading Strategy

1. **Preload critical images** (above-the-fold)
2. **Lazy load** non-critical backgrounds
3. **Use appropriate sizes** per breakpoint
4. **Enable compression** at server level

### CSS Background Properties

```css
.bg-responsive-dashboard {
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: scroll; /* Mobile */
  /* background-attachment: fixed; Desktop only */
}
```

## Image Content Guidelines

### Mobile Background Design

- **Focus area**: Center-top (users scroll down)
- **Important elements**: Keep within 80% center area
- **Text readability**: Avoid busy patterns in center
- **Safe zones**: 20px margins on all sides

### Desktop Background Design

- **Focus area**: Center of screen
- **Important elements**: Can use full width
- **Text overlay**: Provide sufficient contrast
- **Multiple monitors**: Consider edge bleeding

## Testing Checklist

### File Size Validation

- [ ] Mobile background < 300KB
- [ ] Tablet background < 500KB
- [ ] Desktop background < 800KB

### Visual Quality Check

- [ ] No compression artifacts
- [ ] Crisp text overlay readability
- [ ] Consistent color reproduction
- [ ] Proper aspect ratio scaling

### Performance Testing

- [ ] Load time < 2 seconds on 3G
- [ ] No layout shift during load
- [ ] Smooth scrolling performance
- [ ] Memory usage optimization

## Implementation Example

```css
/* Optimized responsive backgrounds */
.bg-responsive-dashboard {
  background-image: url("/images/bg_desktop.webp");
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  transition: background-image 0.3s ease;
}

@media (max-width: 768px) {
  .bg-responsive-dashboard {
    background-image: url("/images/bg_mobile.webp");
    background-position: center top;
    background-attachment: scroll;
  }
}

@media (min-width: 769px) and (max-width: 1024px) {
  .bg-responsive-dashboard {
    background-image: url("/images/bg_tablet.webp");
    background-attachment: scroll;
  }
}

/* High DPI displays */
@media (-webkit-min-device-pixel-ratio: 2) {
  .bg-responsive-dashboard {
    background-image: url("/images/bg_desktop@2x.webp");
  }
}
```
