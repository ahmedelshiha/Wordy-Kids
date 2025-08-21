# JungleKidNav Configuration Guide

## 🌟 Overview

The JungleKidNav component is a fully configurable, immersive jungle-themed navigation system designed for Builder.io integration. It provides a child-friendly interface with dynamic animal guides, performance optimization, and accessibility features.

## 🎯 Builder.io Component Registration

### Required Configuration

To register JungleKidNav in Builder.io, configure the following component inputs:

```typescript
{
  name: 'JungleKidNav',
  component: JungleKidNav,
  inputs: [
    // Core Navigation
    {
      name: 'activeTab',
      type: 'string',
      defaultValue: 'dashboard',
      enum: ['dashboard', 'learn', 'games', 'achievements', 'library']
    },
    {
      name: 'userRole',
      type: 'string',
      defaultValue: 'child',
      enum: ['child', 'parent']
    },

    // Theme Configuration
    {
      name: 'theme',
      type: 'string',
      defaultValue: 'jungle',
      enum: ['jungle', 'simple'],
      helperText: 'jungle = immersive jungle theme, simple = minimal theme'
    },
    {
      name: 'performanceMode',
      type: 'string',
      defaultValue: 'auto',
      enum: ['auto', 'high', 'low'],
      helperText: 'auto = device-optimized, high = all effects, low = minimal effects'
    },

    // Animal Guides (JSON Configuration)
    {
      name: 'animalGuides',
      type: 'object',
      defaultValue: {
        monkey: { name: 'Coco', icon: '🐵', sound: 'monkey.mp3' },
        parrot: { name: 'Polly', icon: '🦜', sound: 'parrot.mp3' },
        tiger: { name: 'Stripe', icon: '🐅', sound: 'tiger.mp3' },
        elephant: { name: 'Jumbo', icon: '🐘', sound: 'elephant.mp3' }
      },
      helperText: 'Configure animal guide characters'
    },

    // Visual Effects
    {
      name: 'effects',
      type: 'object',
      defaultValue: {
        vines: true,
        canopy: true,
        fireflies: true,
        particles: true,
        soundEffects: true
      },
      helperText: 'Toggle visual and audio effects'
    },

    // Menu Items Override
    {
      name: 'menuItems',
      type: 'list',
      subFields: [
        { name: 'label', type: 'string' },
        { name: 'link', type: 'string' },
        { name: 'icon', type: 'string' },
        { name: 'animal', type: 'string' }
      ],
      helperText: 'Override default navigation items'
    },

    // Accessibility & Performance
    {
      name: 'enableSounds',
      type: 'boolean',
      defaultValue: true
    },
    {
      name: 'animations',
      type: 'boolean',
      defaultValue: true
    },
    {
      name: 'reducedMotion',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Respect user motion preferences'
    },
    {
      name: 'autoOptimize',
      type: 'boolean',
      defaultValue: true,
      helperText: 'Automatically optimize for device capabilities'
    }
  ]
}
```

## 🎨 Theme Configuration

### Jungle Theme (Default)

- **Visual**: Immersive jungle backgrounds, animated vines, floating particles
- **Audio**: Nature sounds, animal guide voices
- **Animations**: Smooth transitions, hover effects, loading animations
- **Performance**: Auto-optimized based on device capabilities

### Simple Theme

- **Visual**: Clean, minimal interface with basic colors
- **Audio**: Subtle click sounds only
- **Animations**: Reduced motion, essential transitions only
- **Performance**: Optimized for low-power devices

## 🦁 Animal Guides System

Animal guides provide contextual help and entertainment throughout the navigation experience.

### Default Animal Guides

```json
{
  "monkey": {
    "name": "Coco",
    "icon": "🐵",
    "personality": "playful",
    "helpTopics": ["games", "activities"],
    "sound": "monkey.mp3"
  },
  "parrot": {
    "name": "Polly",
    "icon": "🦜",
    "personality": "wise",
    "helpTopics": ["learning", "reading"],
    "sound": "parrot.mp3"
  },
  "tiger": {
    "name": "Stripe",
    "icon": "🐅",
    "personality": "brave",
    "helpTopics": ["challenges", "achievements"],
    "sound": "tiger.mp3"
  },
  "elephant": {
    "name": "Jumbo",
    "icon": "🐘",
    "personality": "gentle",
    "helpTopics": ["progress", "help"],
    "sound": "elephant.mp3"
  }
}
```

### Adding Custom Animal Guides

```typescript
const customAnimalGuides = {
  lion: {
    name: 'Leo',
    icon: '🦁',
    personality: 'leader',
    helpTopics: ['navigation', 'exploration'],
    sound: 'lion.mp3'
  },
  toucan: {
    name: 'Beaky',
    icon: '🦜',
    personality: 'curious',
    helpTopics: ['discovery', 'search'],
    sound: 'toucan.mp3'
  }
};

<JungleKidNav animalGuides={customAnimalGuides} />
```

## ⚡ Performance Configuration

### Auto Performance Mode (Recommended)

Automatically detects device capabilities and optimizes accordingly:

- **High-end devices**: Full jungle theme with all effects
- **Mid-range devices**: Jungle theme with reduced particles
- **Low-end devices**: Simple theme with minimal animations
- **Mobile devices**: Touch-optimized with battery-saving mode

### Manual Performance Modes

```typescript
// High Performance - All effects enabled
<JungleKidNav performanceMode="high" />

// Low Performance - Minimal effects
<JungleKidNav performanceMode="low" />

// Custom Performance Settings
<JungleKidNav
  autoOptimize={false}
  animations={false}
  enableParticles={false}
  reducedMotion={true}
/>
```

## 🎵 Audio Configuration

### Sound Categories

1. **UI Sounds**: Button clicks, hover effects, transitions
2. **Animal Sounds**: Guide character voices and sounds
3. **Ambient Sounds**: Background jungle atmosphere
4. **Achievement Sounds**: Success celebrations, level-ups

### Audio Controls

```typescript
// Disable all sounds
<JungleKidNav enableSounds={false} />

// Custom sound configuration
<JungleKidNav
  effects={{
    vines: true,
    canopy: true,
    fireflies: true,
    particles: true,
    soundEffects: false // Disable only sound effects
  }}
/>
```

## 📱 Responsive Behavior

### Breakpoints

- **Mobile**: < 768px - Collapsed navigation with bottom tabs
- **Tablet**: 768px - 1024px - Sidebar with touch-friendly controls
- **Desktop**: > 1024px - Full sidebar with all features

### Mobile Optimizations

- Touch-friendly button sizes (minimum 44px)
- Swipe gestures for navigation
- Reduced animations to preserve battery
- Simplified visual effects

## ♿ Accessibility Features

### Built-in Accessibility

- **ARIA labels**: Comprehensive screen reader support
- **Keyboard navigation**: Full keyboard accessibility
- **High contrast**: Automatic contrast adjustments
- **Reduced motion**: Respects `prefers-reduced-motion`
- **Focus management**: Clear focus indicators
- **Alternative text**: All visual elements have text alternatives

### Accessibility Configuration

```typescript
<JungleKidNav
  reducedMotion={true}        // Respect motion preferences
  animations={false}          // Disable animations
  enableSounds={false}        // Disable sounds for hearing impaired
  theme="simple"             // Use high-contrast simple theme
/>
```

## 🔧 Advanced Configuration

### Custom Menu Items

```typescript
const customMenuItems = [
  {
    label: 'Art Studio',
    link: '/art',
    icon: '🎨',
    animal: 'parrot'
  },
  {
    label: 'Music Room',
    link: '/music',
    icon: '🎵',
    animal: 'monkey'
  },
  {
    label: 'Science Lab',
    link: '/science',
    icon: '🔬',
    animal: 'elephant'
  }
];

<JungleKidNav menuItems={customMenuItems} />
```

### Event Handlers

```typescript
<JungleKidNav
  onTabChange={(tab) => console.log('Tab changed:', tab)}
  onRoleChange={(role) => console.log('Role changed:', role)}
  onSettingsClick={() => openSettings()}
  onAdminClick={() => openAdminPanel()}
/>
```

## 🚀 Migration from DesktopKidNav

### Automatic Migration

The JungleKidNav component is fully backward compatible with DesktopKidNav props:

```typescript
// Old DesktopKidNav usage (deprecated)
<DesktopKidNav activeTab={tab} onTabChange={setTab} />

// New JungleKidNav usage (enhanced)
<JungleKidNav
  activeTab={tab}
  onTabChange={setTab}
  theme="jungle"              // New: Choose theme
  performanceMode="auto"      // New: Performance optimization
  animalGuides={customGuides} // New: Animal guide system
/>
```

### Migration Checklist

1. ✅ Replace all `DesktopKidNav` imports with `JungleKidNav`
2. ✅ Update component usage in Builder.io content
3. ✅ Test across all device types (mobile, tablet, desktop)
4. ✅ Verify accessibility compliance
5. ✅ Run migration safeguard script: `npm run check:nav-migration`

## 🛡️ Testing & Validation

### Automated Tests

```bash
# Run migration safeguard check
npm run check:nav-migration

# Verify Builder.io registration
npm run verify:builderio

# Run accessibility tests
npm run test:a11y
```

### Manual Testing Checklist

- [ ] Navigation works on all screen sizes
- [ ] Animal guides respond correctly
- [ ] Performance mode switches work
- [ ] Accessibility features function properly
- [ ] Sound controls work as expected
- [ ] Theme switching is smooth
- [ ] Parent gate protection works
- [ ] All animations respect reduced motion preferences

## 📋 Builder.io Content Management

### Updating Existing Content

1. **Search for DesktopKidNav**: Use Builder.io content search to find all references
2. **Replace Component**: Change component type from DesktopKidNav to JungleKidNav
3. **Configure Props**: Set theme, performance mode, and animal guides
4. **Test Changes**: Preview in Builder.io visual editor
5. **Publish Updates**: Deploy updated content

### Content Entry Migration Script

```javascript
// Example Builder.io content update script
const updateContentEntries = async () => {
  const entries = await builder.getAll("page", {
    query: {
      "data.blocks.component.name": "DesktopKidNav",
    },
  });

  for (const entry of entries) {
    // Update component name and add new props
    entry.data.blocks = entry.data.blocks.map((block) => {
      if (block.component?.name === "DesktopKidNav") {
        return {
          ...block,
          component: {
            name: "JungleKidNav",
            options: {
              ...block.component.options,
              theme: "jungle",
              performanceMode: "auto",
              animalGuides: defaultAnimalGuides,
            },
          },
        };
      }
      return block;
    });

    await builder.patch(entry.id, entry);
  }
};
```

## 🎯 Best Practices

### Performance

- Use `autoOptimize={true}` for automatic device optimization
- Test on various devices and network conditions
- Monitor Core Web Vitals impact
- Use simple theme for low-power devices

### User Experience

- Keep animal guide interactions brief and helpful
- Ensure navigation is intuitive across age groups
- Test with actual children for usability feedback
- Provide clear visual feedback for all interactions

### Accessibility

- Always respect `prefers-reduced-motion`
- Provide alternative text for all visual elements
- Test with screen readers
- Ensure keyboard navigation works completely

### Maintenance

- Run migration safeguard script before each deployment
- Keep animal guide content age-appropriate
- Update sound files for better quality
- Monitor performance metrics regularly

## 🔗 Related Documentation

- [Migration Summary](./JUNGLE_KIDNAV_MIGRATION_SUMMARY.md)
- [Performance Optimization](./BACKGROUND_OPTIMIZATION_GUIDE.md)
- [Accessibility Guidelines](./ACCESSIBILITY_GUIDELINES.md)
- [Builder.io Integration](./BUILDERIO_INTEGRATION_GUIDE.md)

---

_For support or questions about JungleKidNav configuration, refer to the project documentation or contact the development team._
