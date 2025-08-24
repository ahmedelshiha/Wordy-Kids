# Builder.io Cleanup & Organization SOP

## Overview

This document outlines the standardized backup structure, cleanup procedures, and maintenance guidelines for the Builder.io project. This system ensures clean, organized code and efficient project management.

## 🗂️ Backup Directory Structure

```
/backup
├── /old-components       # Retired React/Builder components
├── /unused-assets        # Images, icons, fonts not in use
├── /deprecated-pages     # Outdated/removed Builder pages
├── /legacy-scripts       # Obsolete scripts/utilities
├── /docs                 # Archived markdown and documentation
└── README.md             # This structure documentation
```

### Naming Convention

All archived files include timestamp suffix: `filename_YYYYMMDD.ext`

**Examples:**

- `header_20241215.tsx`
- `legacy-nav_20241215.js`
- `old-docs_20241215.md`

## ✅ Cleanup Checklist

### Completed Tasks

- [x] **Backup Structure Created**: Standardized directory structure with documentation
- [x] **Deprecated Files Archived**: Moved old components, backup files, and legacy scripts
  - `JungleAdventureNavV2.tsx` → `backup/old-components/`
  - `DesktopKidNav.backup.tsx` → `backup/old-components/`
  - `JungleParentMenuExample.tsx` → `backup/deprecated-pages/`
  - `legacyAchievementMigration.ts` → `backup/legacy-scripts/`
- [x] **Documentation Archived**: Moved 30+ summary and report markdown files
- [x] **Archive Index Created**: Comprehensive tracking of all archived documentation
- [x] **Automation Scripts Created**: Three automated cleanup scripts
- [x] **Package.json Updated**: Added cleanup script commands

### Manual Review Required

- [ ] **Asset Deduplication**: Run asset analyzer and remove duplicates
- [ ] **Dependency Cleanup**: Run dependency analyzer and remove unused packages
- [ ] **Code Comments**: Remove TODO comments and commented-out code
- [ ] **Naming Standardization**: Apply consistent naming conventions
- [ ] **Builder.io Models**: Audit and archive unused models/templates

## 🤖 Automation & Maintenance

### Available Scripts

Run these commands for automated cleanup analysis:

```bash
# Full cleanup analysis and automation
npm run cleanup:full

# Individual analysis tools
npm run cleanup:assets    # Analyze unused assets
npm run cleanup:deps      # Analyze unused dependencies
npm run cleanup:auto      # Run automated cleanup process
```

### Script Functions

#### 1. `cleanup-automation.js`

- Moves outdated files to backup directories
- Archives markdown files older than 6 months
- Compresses large backup directories
- Updates archive index automatically

#### 2. `analyze-unused-assets.js`

- Scans public/ directory for unused assets
- Identifies duplicate assets (PNG/WebP pairs)
- Generates removal commands
- Creates detailed usage report

#### 3. `analyze-dependencies.js`

- Checks package.json for unused dependencies
- Identifies dev dependencies used in production
- Generates uninstall commands
- Reports dependency usage statistics

### Scheduled Maintenance

**Weekly Cleanup (Automated):**

- [ ] Archive files older than 6 months
- [ ] Compress backup directories > 50MB
- [ ] Update archive index
- [ ] Generate usage reports

**Monthly Review (Manual):**

- [ ] Review and approve automated archive decisions
- [ ] Remove confirmed unused assets
- [ ] Update dependencies
- [ ] Audit Builder.io models and content

**Quarterly Deep Clean (Manual):**

- [ ] Compress old backup archives
- [ ] Review project structure
- [ ] Update naming conventions
- [ ] Documentation consolidation

## 📁 Current Project Structure

### Core Directories

```
client/                   # React SPA frontend
├── components/           # React components
│   ├── ui/              # Pre-built UI component library
│   ├── games/           # Game-related components
│   └── common/          # Shared components
├── pages/               # Route components
├── lib/                 # Utility libraries and services
├── hooks/               # Custom React hooks
├── contexts/            # React contexts
├── styles/              # CSS and styling files
└── data/                # Static data files

server/                  # Express API backend
├── routes/              # API route handlers
└── index.ts             # Main server setup

shared/                  # Types used by both client & server
└── api.ts               # Shared API interfaces

backup/                  # Archived files (NEW)
├── old-components/      # Deprecated React components
├── unused-assets/       # Unused static assets
├── deprecated-pages/    # Obsolete pages/routes
├── legacy-scripts/      # Old migration scripts
└── docs/                # Archived documentation
```

### File Organization Rules

**Components (`client/components/`):**

- Break large components into smaller, focused units
- Use PascalCase for component files
- Group related components in subdirectories
- Export from index.ts files for clean imports

**Assets (`public/`):**

- Use kebab-case for all static assets
- Prefer WebP over PNG for images
- Organize by type: `/images/`, `/sounds/`, `/icons/`
- Remove spaces and special characters from filenames

**Documentation:**

- Keep only current, relevant documentation in root
- Archive reports and summaries older than 6 months
- Use meaningful names that describe content
- Include creation/update dates

## 🛡️ Safety Guidelines

### Before Archiving Files

1. **Search for References**: Use grep to find all imports/usages
2. **Check Git History**: Review commit history for recent changes
3. **Test Functionality**: Ensure removal doesn't break features
4. **Backup First**: Always copy to backup before deletion

### Restoration Process

To restore archived files:

1. Copy file from backup directory
2. Remove timestamp suffix from filename
3. Update any changed import paths
4. Test integration with current codebase
5. Update documentation if needed

### Safe Commands

```bash
# Search for file usage before removal
grep -r "filename" client/ server/ --include="*.tsx" --include="*.ts"

# Safe file archival (copy then remove)
cp original.tsx backup/old-components/original_20241215.tsx
rm original.tsx

# Check for broken imports after cleanup
npm run typecheck
npm run build
```

## 📊 Monitoring & Metrics

### Success Metrics

- **Codebase Size**: Reduce unused code by 15-20%
- **Build Performance**: Faster builds due to fewer assets
- **Developer Experience**: Easier navigation and file discovery
- **Maintenance Overhead**: Reduced time spent on legacy code

### Regular Audits

**Asset Usage:**

- Track total asset size in public/ directory
- Monitor asset usage statistics
- Identify optimization opportunities

**Code Quality:**

- Count deprecated/TODO comments
- Track component reusability
- Monitor import complexity

**Documentation Health:**

- Ensure current docs are up-to-date
- Archive obsolete documentation
- Maintain clear README files

## 🚀 Implementation Status

### Phase 2 Completion: ✅ DONE

- [x] Standardized backup structure created
- [x] Cleanup checklist implemented
- [x] Automated scripts developed
- [x] Documentation and guidelines established
- [x] Package.json updated with cleanup commands
- [x] Archive index system implemented

### Next Steps

1. **Manual Review**: Run analysis scripts and review findings
2. **Asset Cleanup**: Remove confirmed unused assets
3. **Dependency Optimization**: Remove unused npm packages
4. **Builder.io Audit**: Review and archive unused models
5. **Team Training**: Share cleanup procedures with team

## 📞 Support & Troubleshooting

### Common Issues

**Script Permissions:**

```bash
chmod +x scripts/*.js
```

**Missing Dependencies:**
If cleanup scripts fail, ensure all required Node.js modules are available.

**Large Archive Files:**
Archives are automatically compressed when they exceed 50MB or 100 files.

### Getting Help

- Review backup/docs/archive-index.md for archived file locations
- Check cleanup logs in backup/cleanup-log.txt
- Use git history to track file movements and changes
- Consult this SOP for standard procedures

---

**Last Updated**: 2024-12-15  
**Version**: 2.0  
**Maintained By**: Development Team
