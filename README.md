# Fusion Starter - Cleaned & Organized

A production-ready full-stack React application template with integrated Express server, featuring React Router 6 SPA mode, TypeScript, Vitest, and modern tooling.

## 📁 Current Project Structure (Post-Cleanup)

```
📦 Root
├── 🔧 backup/                    # Organized backup system (NEW)
│   ├── old-components/          # Retired React components
│   ├── unused-assets/           # Unused images, icons, fonts
│   ├── deprecated-pages/        # Outdated page components
│   ├── legacy-scripts/          # Obsolete scripts and utilities
│   └── docs/                    # Archived documentation (6+ months)
│       └── archive-index.md     # Archive tracking log
��
├── 📱 client/                    # React SPA frontend
│   ├── components/              # Active UI components
│   │   ├── ui/                  # Pre-built UI component library
│   │   ├── games/               # Game-specific components
│   │   ├── common/              # Shared components
│   │   └── *.tsx                # Feature components
│   ├── pages/                   # Active route components
│   ├── hooks/                   # Custom React hooks
│   ├── lib/                     # Utility libraries
│   ├── contexts/                # React context providers
│   ├── styles/                  # CSS files and styling
│   ├── App.tsx                  # Main app with routing
│   └── global.css               # TailwindCSS theming
│
├── 🖥️  server/                   # Express API backend
│   ├── routes/                  # API handlers
│   │   ├── admin.ts             # Admin endpoints
│   │   └── word-progress.ts     # Learning progress API
│   └── index.ts                 # Main server setup
│
├── 🔗 shared/                    # Types used by both client & server
│   ├── api.ts                   # API interface definitions
│   └── adventure.ts             # Adventure-specific types
│
├── 🛠️  scripts/                  # Maintenance scripts
│   ├── cleanup-console-logs.js  # Debug log cleanup utility
│   ├── scan-emojis.js          # Emoji validation
│   └── check-map-conflicts.js  # Map conflict prevention
│
└── 📄 Configuration Files
    ├── package.json             # Dependencies (cleaned)
    ├── tailwind.config.ts       # Styling configuration
    ├── vite.config.ts           # Build configuration
    └── tsconfig.json            # TypeScript configuration
```

## 🧹 Cleanup & Organization Standards

### File Naming Conventions

- **Components**: PascalCase (`EnhancedWordCard.tsx`)
- **Pages**: PascalCase (`AdminPage.tsx`)
- **Hooks**: camelCase with `use-` prefix (`use-voice-settings.ts`)
- **Utilities**: camelCase (`audioService.ts`)
- **Types**: camelCase (`api.ts`)
- **Assets**: kebab-case (`jungle-background.webp`)
- **Archived Files**: Original name + `_YYYYMMDD` timestamp

### Component Organization

- **UI Components**: `client/components/ui/` - Reusable design system components
- **Feature Components**: `client/components/` - Business logic components
- **Game Components**: `client/components/games/` - Game-specific components
- **Page Components**: `client/pages/` - Route-level components

### Asset Management

- **Optimized Images**: Keep WebP format, archive PNG/JPG duplicates
- **Icons**: Consolidated in single iconset, removed duplicates
- **Sounds**: Organized by category in `public/sounds/`

### Dependency Management

- **Runtime Dependencies**: Only essential packages for production
- **Development Dependencies**: Build tools, UI libraries, type definitions
- **Removed Unused**: `zod`, `date-fns`, `globals`, `@hookform/resolvers`, `tsx`
- **Relocated Types**: `@types/*` packages moved to devDependencies

## 🚀 Development Commands

```bash
npm run dev        # Start development server (port 8080)
npm run build      # Production build
npm run start      # Start production server
npm run typecheck  # TypeScript validation
npm test          # Run Vitest tests
npm run format.fix # Format code with Prettier
```

## 🔧 Maintenance Scripts

```bash
# Cleanup console.log statements
node scripts/cleanup-console-logs.js

# Validate emoji usage
npm run lint:emojis

# Check for map conflicts
npm run check:map-conflicts

# Full pre-commit validation
npm run precommit
```

## 📋 Component Consolidation Strategy

### Identified for Future Consolidation:

1. **WordCard Family** → Create `CoreWordCard` with mode variants
2. **Navigation Components** → Extract `BaseNav` with theme wrappers
3. **Achievement UI** → Unified `AchievementPresenter` with display variants
4. **Settings Panels** → Shared `SettingsPanel` with configurable sections
5. **Dashboard Components** → Common `DashboardCard` primitives

### Recommended Approach:

- Keep existing components as thin wrappers during transition
- Extract shared logic into custom hooks
- Maintain backward compatibility during refactoring
- Use composition over inheritance for variants

## 📦 Backup System

### Archive Policy:

- **Documentation**: Archive reports/summaries older than 6 months
- **Components**: Move deprecated/unused components to backup
- **Assets**: Archive duplicate or unused media files
- **Scripts**: Archive one-time migration and fix scripts

### Archive Index:

All archived files are tracked in `backup/docs/archive-index.md` with:

- Original file path and name
- Archive date and new location
- Reason for archival
- Restoration instructions if needed

## 🎯 Quality Standards

### Code Quality:

- ✅ TypeScript strict mode enabled
- ✅ ESLint + Prettier formatting
- ✅ No unused imports or dependencies
- ✅ Consistent naming conventions
- ✅ Error boundaries for fault tolerance

### Performance:

- ✅ Optimized assets (WebP images)
- ✅ Tree-shaking enabled
- ✅ Component lazy loading where appropriate
- ✅ Minimal bundle size

### Maintainability:

- ✅ Clear folder structure
- ✅ Documented conventions
- ✅ Automated cleanup scripts
- ✅ Backup system for safe archival

## 🚀 Deployment

This starter supports multiple deployment options:

- **Netlify**: Use [Connect to Netlify](#open-mcp-popover) MCP integration
- **Vercel**: Use [Connect to Vercel](#open-mcp-popover) MCP integration
- **Standard**: `npm run build` + `npm start`
- **Binary**: Self-contained executables

## 📚 Additional Resources

- **Original Structure**: See `AGENTS.md` for detailed tech stack information
- **Change History**: Check `backup/docs/archive-index.md` for moved files
- **MCP Integrations**: [Connect MCPs](#open-mcp-popover) for databases, hosting, etc.

---

_Last updated: January 2025 - Post Builder.io Cleanup & Organization_
