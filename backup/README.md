# Backup Directory Structure

This directory contains archived files organized by category with timestamp suffixes.

## Structure

- `/old-components` - Retired React/Builder components
- `/unused-assets` - Images, icons, fonts not in use  
- `/deprecated-pages` - Outdated/removed Builder pages
- `/legacy-scripts` - Obsolete scripts/utilities
- `/docs` - Archived markdown and documentation

## Naming Convention

All archived files include timestamp suffix: `filename_YYYYMMDD.ext`

Examples:
- `header_20231215.tsx`
- `legacy-nav_20231215.js`
- `old-docs_20231215.md`

## Compression Policy

Backup directories are compressed into zip/tar archives when:
- Not accessed for 30+ days
- Directory size exceeds 50MB
- Contains 100+ files

## Automated Cleanup

Weekly automated cleanup runs:
- Moves files matching deprecated patterns
- Archives markdown files older than 6 months
- Compresses large backup directories
- Updates this index

Last cleanup: Manual initialization
Next scheduled: TBD
