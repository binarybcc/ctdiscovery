# CTDiscovery - Claude Tool Discovery System

## Project Overview

Multi-layer development environment discovery system with programmatic API, CLI, and VSCode integration.

## 📦 Version & Standards

**Current Version:** v2.1.0
**Version Location:** `package.json`
**Changelog:** `CHANGELOG.md` (root)

### Versioning Protocol

This project follows **Semantic Versioning (SemVer)**:
- PATCH (2.1.x): Bug fixes
- MINOR (2.x.0): New features, backwards compatible
- MAJOR (x.0.0): Breaking changes

**After ANY code changes, Claude MUST:**
1. Update version in `package.json`
2. Update `CHANGELOG.md` with changes
3. Create git tag: `git tag -a vX.Y.Z -m "Release vX.Y.Z: description"`

### Commit Message Format

All commits use **Conventional Commits**:
```
<type>(<scope>): <description>

feat(scanner): add Ruby project detection
fix(api): handle missing config files
docs(readme): update installation guide
```

### Branch Strategy

- `main` - Stable releases only
- `feature/*` - New features
- `fix/*` - Bug fixes

## Tech Stack

- **Language:** JavaScript (ES Modules)
- **Runtime:** Node.js
- **Naming Convention:** camelCase
- **File Naming:** kebab-case.js

## Architecture

```
src/
├── api/                 # Programmatic API
├── intelligence/        # Project detection & relevance scoring
├── processors/          # Output processors
├── scanners/            # Environment scanners
└── index.js             # Main entry point
```

### Key Components

- **Project Type Detector** - Auto-detects project type from config files
- **Relevance Scorer** - Multi-factor scoring (0-100) for tool relevance
- **Environment Scanner** - Discovers development tools and configs

## Development Commands

```bash
# Run the tool
node src/index.js

# Test detection
node test-detection.js
```

## Code Quality

- ES Modules (`import`/`export`)
- JSDoc comments for public APIs
- Type definitions in `index.d.ts`
