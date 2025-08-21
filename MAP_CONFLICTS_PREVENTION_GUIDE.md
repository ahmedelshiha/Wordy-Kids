# 🛡️ Map Conflicts Prevention Guide

## 🚨 Problem Context

The JavaScript `Map` constructor is a built-in global object. When importing icons from `lucide-react` without aliasing, this creates identifier conflicts causing:

- `SyntaxError: Identifier 'Map' has already been declared`
- Runtime failures and blank white screens
- Build compilation errors

## ✅ Resolution Applied

### 1. Duplicate Import Fixed

- **File**: `client/components/JungleAdventureParentDashboard.tsx`
- **Issue**: Two `Map` imports in same lucide-react import statement (lines 55 & 72)
- **Fix**: Removed duplicate import on line 72

### 2. Aliasing Enforced

All Map imports from lucide-react now use proper aliasing:

```typescript
// ✅ CORRECT
import { Map as MapIcon } from "lucide-react";

// ❌ NEVER DO THIS
import { Map } from "lucide-react";
```

### 3. Automated Verification

- **Script**: `scripts/check-map-conflicts.js`
- **Integration**: Pre-commit hook in `package.json`
- **Command**: `npm run check:map-conflicts`

## 🛡️ Mandatory Future-Proof Safeguards

### Reserved Names Policy

**NEVER** use these as component names, variables, or direct imports:

- `Map`, `Set`, `Date`, `Error`, `Promise`, `Symbol`
- `String`, `Number`, `Boolean`, `Array`, `Object`, `RegExp`

### Icon Import Rules

```typescript
// ✅ ALWAYS alias lucide-react icons with descriptive names
import {
  Map as MapIcon,
  Settings as SettingsIcon,
  User as UserIcon
} from "lucide-react";

// ✅ Use in JSX
<MapIcon className="w-4 h-4" />
```

### Component Naming Standards

```typescript
// ✅ Descriptive, unique names
export const JungleAdventureMap = () => { ... };
export const QuestNavigationMap = () => { ... };
export const AchievementsSystemMap = () => { ... };

// ❌ Generic/reserved names
export const Map = () => { ... };
export const Set = () => { ... };
```

## 🔧 Automated Safeguards

### Pre-commit Hook Integration

The `check:map-conflicts` script runs automatically before every commit:

```json
{
  "scripts": {
    "precommit": "npm run lint:emojis && npm run check:map-conflicts && npm run typecheck"
  }
}
```

### Script Capabilities

The `scripts/check-map-conflicts.js` detects:

- Bare Map imports from lucide-react
- Variable declarations using reserved names
- Function/class declarations with reserved names
- Provides specific line numbers and fix suggestions

### Manual Verification

```bash
# Check for conflicts
npm run check:map-conflicts

# Full development verification
npm run precommit
```

## 📋 Pull Request Checklist

Before merging any component changes:

- [ ] ✅ `npm run check:map-conflicts` passes
- [ ] ✅ All lucide-react icons use aliases
- [ ] ✅ Component names are descriptive and unique
- [ ] ✅ No reserved JavaScript names used as identifiers
- [ ] ✅ TypeScript compilation succeeds

## 🚨 Emergency Fix Protocol

If Map conflicts occur again:

1. **Immediate Fix**:

   ```bash
   npm run check:map-conflicts
   ```

2. **Locate Issues**: Script will show exact files and line numbers

3. **Apply Aliases**:

   ```typescript
   // Change this:
   import { Map } from "lucide-react";

   // To this:
   import { Map as MapIcon } from "lucide-react";
   ```

4. **Verify Fix**:
   ```bash
   npm run typecheck
   npm run dev
   ```

## 🎯 Builder.io Integration Notes

For automated code generation:

- Enforce aliasing rules in component templates
- Validate generated imports against reserved names list
- Run conflict checks in CI/CD pipeline
- Prevent merging if conflicts detected

---

**Last Updated**: After critical Map conflict resolution
**Status**: ✅ All conflicts resolved, safeguards active
