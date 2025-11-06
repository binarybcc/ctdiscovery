# Changelog

All notable changes to CTDiscovery will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.1.0] - 2025-11-06

### ✨ Major Feature: Intelligent Analysis Layer

Transforms CTDiscovery from an exhaustive tool inventory into a curated, context-aware analysis system.

#### Added

**Intelligence Layer Components**
- **Project Type Detector** (`src/intelligence/project-type-detector.js`)
  - Auto-detects project type from configuration files
  - Supports: JavaScript, TypeScript, PHP, Python, Rust, Go, Java, Ruby, Docker
  - Identifies frameworks, package managers, and build systems
  - Calculates confidence scores (0-100%)
  - Maps project types to relevant tool ecosystems

- **Relevance Scorer** (`src/intelligence/relevance-scorer.js`)
  - Multi-factor scoring system (0-100 points)
  - Ecosystem match: 0-40 points
  - Configuration status: 0-20 points
  - Active usage: 0-20 points
  - Capability match: 0-10 points
  - Industry standard: 0-10 points
  - Categorizes tools: critical, high, medium, low, irrelevant
  - Groups tools: active, available, noise

- **Usage Analyzer** (`src/intelligence/usage-analyzer.js`)
  - Analyzes actual usage patterns vs "just installed"
  - Checks config files, lock files, package scripts, tool directories
  - Determines patterns: active-development, configured, installed, dormant
  - Assesses configuration maturity: mature, configured, basic, installed-only

- **Intelligence Analyzer** (`src/intelligence/intelligence-analyzer.js`)
  - Main orchestrator combining all intelligence components
  - Generates smart summaries and maturity assessments (0-100 scale)
  - Provides actionable recommendations
  - Builds AI-optimized context for assistants
  - Supports 4 filtering modes: all, smart, project-optimized, ai-context

**Enhanced CLI** (`src/cli/cli.js`)
- New intelligence mode flags:
  - `--smart`: Intelligent filtering (relevant tools only)
  - `--all`: Complete inventory (all tools)
  - `--project-optimized`: Project-specific relevance only
  - `--ai-context`: Optimized for AI assistant consumption
- Beautiful colored output with project intelligence
- Maturity scoring and recommendations display
- Active vs available tool categorization

**Enhanced API**
- New `intelligentAnalyze()` method in CTDiscovery API
- `intelligenceMode` option in constructor
- Returns comprehensive intelligence object with:
  - Project intelligence (type, languages, frameworks, confidence)
  - Tools by relevance (active, available, filtered)
  - Smart summary with maturity score
  - Actionable recommendations
  - Optimization opportunities
  - AI-optimized context

**Enhanced JSON Formatter**
- Auto-detects intelligent analysis results
- Includes intelligence metadata in JSON output
- Project type detection with confidence scores
- Tools organized by relevance categories
- Maturity assessment and recommendations
- AI context with conversation starters

**TypeScript Definitions**
- Complete type definitions for intelligence layer
- `ProjectIntelligence`, `UsagePattern`, `ToolRelevance` interfaces
- `IntelligentAnalysisResult` extending `AnalysisResult`
- `Recommendation`, `OptimizationOpportunity`, `AIContext` types
- Intelligence analyzer class definitions

**Examples**
- `examples/intelligent-analysis.js`: Demonstrates all intelligence features
- Shows project detection, smart filtering, AI context, recommendations
- Compares different intelligence modes

**Tests**
- Comprehensive test suite: `src/test/intelligence.test.js`
- 19 tests covering all intelligence components
- ProjectTypeDetector, RelevanceScorer, UsageAnalyzer tests
- IntelligenceAnalyzer integration tests
- End-to-end intelligence pipeline testing
- **All 19 tests passing ✓**

**Documentation**
- Comprehensive Intelligence Layer section in README
- How it works (4-stage pipeline diagram)
- All 4 intelligence modes explained with use cases
- API usage examples
- Supported project types (8+ languages)
- Maturity assessment system (0-100 scale)
- JSON output structure documentation
- Real-world examples (React, Laravel, Django)

#### Fixed

**Critical Bug #1: Missing PHP Ecosystem Tools**
- System tool scanner had hardcoded list that completely omitted PHP tools
- **Added detection for**:
  - PHP tools: phpstan, psalm, phpcs, php-cs-fixer, rector, phpunit
  - JavaScript tools: eslint, prettier, typescript, tsc
  - Python tools: pytest, black, mypy, pylint, flake8
  - composer added to package-manager category
  - php added to language category
- Impact: PHP projects now get full ecosystem detection

**Critical Bug #2: False "Install" Recommendations**
- Intelligence layer incorrectly recommended installing already-installed tools
- **Root cause**: Only checked 'active' tools, missed 'available' and 'filtered' tools
- **Fixed**: Now checks ALL detected tools before recommending installation
- Impact: No more false recommendations like "Consider installing: composer" when composer is already installed

**Reported by**: @johncorbin testing on real PHP+JS hybrid project

#### Changed

**Enhanced Tool Detection**
- System scanner now detects 3x more tool categories
- Better support for hybrid projects (PHP+JS, Python+JS, etc.)
- Language-specific tool ecosystems properly recognized

**Improved Recommendations**
- Recommendations only for truly missing tools
- Better context-aware suggestions
- Separate recommendations by language for hybrid projects

#### Performance

- Intelligence layer adds minimal overhead (~50-200ms)
- All original scan performance maintained
- Smart filtering reduces output noise significantly

---

## [2.0.0] - 2025-11-05

### Major Release: Multi-Layer Architecture Transformation

This is a major architectural transformation that introduces a multi-layer integration system while maintaining full backward compatibility with v1.x CLI usage.

### Added

#### Core API (Layer 1)
- **Programmatic API**: New `CTDiscovery` class with clean API for importing and using in Node.js applications
- **Module Exports**: Granular exports for scanners, processors, formatters, and utilities
- **Processing Layer**: New processing components
  - `Deduplicator`: Intelligently removes duplicate tool entries
  - `OverlapDetector`: Detects tool conflicts and overlaps
  - `Enricher`: Adds metadata, capabilities, and documentation links
  - `Validator`: Validates tool entries for completeness
- **Output Layer**: Multiple format renderers
  - `JSONFormatter`: Machine-readable JSON output
  - `MarkdownFormatter`: Beautiful markdown reports
  - `TextFormatter`: Clean terminal-friendly text
  - `ContextGenerator`: AI-optimized context generation
- **API Methods**:
  - `scan()`: Scan development environment
  - `analyze()`: Analyze and process scan results
  - `format()`: Format results in multiple formats
  - `generateContext()`: Generate AI assistant context
  - `scanAndAnalyze()`: Combined scan and analysis
  - `run()`: Complete workflow in one call
- **Caching System**: Optional result caching with configurable TTL
- **Helper Functions**: `quickScan()` and `generateContext()` for simple use cases

#### TypeScript Support
- **Complete Type Definitions**: Comprehensive `index.d.ts` with all types, interfaces, and classes
- **Module Declarations**: Support for granular imports (`ctdiscovery/api`, `ctdiscovery/formatters`, etc.)
- **IDE Autocomplete**: Full IntelliSense support in VS Code and other TypeScript-aware editors

#### HTTP API Server (Layer 3)
- **REST API Server**: New HTTP API server for web dashboards and remote access
- **Endpoints**:
  - `GET /api/scan`: Scan environment with optional format parameter
  - `POST /api/analyze`: Analyze scan results
  - `POST /api/format`: Format analysis results
  - `GET /api/context`: Generate AI context
  - `GET /api/quick-scan`: Combined scan and analysis
  - `GET /health`: Health check endpoint
  - `GET /`: Web-based API documentation
- **CORS Support**: Configurable CORS headers for web integration
- **CLI Tool**: Start server with `node src/http/server.js [port] [host]`

#### VSCode Extension
- **Extension Scaffolding**: Complete VSCode extension structure
- **Views**:
  - Environment view: Platform, Node version, working directory
  - Tools tree view: Hierarchical display of discovered tools
  - Overlaps view: Tool conflicts and recommendations
  - Recommendations view: Smart extension and tool suggestions
- **Commands**:
  - Scan Environment
  - Refresh Environment Data
  - Generate AI Context
  - Sync Discovered Tools to Tasks
  - Show Extension Recommendations
- **Integration Bridge**: Connects extension to core CTDiscovery module
- **Task Generation**: Auto-generates VSCode tasks for discovered tools
- **Extension Recommendations**: Suggests relevant VSCode extensions based on detected tools
- **Auto-scan**: Optional automatic scanning on workspace open
- **Configuration**: Extensive settings for timeout, auto-refresh, context generation

#### Integration Examples
- **Basic Usage** (`examples/basic-usage.js`): Simple API demonstration
- **Custom Scanner** (`examples/custom-scanner.js`): Using individual scanners
- **Build Integration** (`examples/build-integration.js`): Webpack, Vite, Rollup, ESBuild plugins
- **Shell Script** (`examples/shell-script.sh`): CLI integration with JSON and jq
- **Pre-commit Hook** (`examples/pre-commit-hook.js`): Validate environment before commits
- **CI/CD Reporter** (`examples/ci-environment-report.js`): Generate reports for CI/CD pipelines
- **Project Setup Validator** (`examples/project-setup-validator.js`): Validate team member setups

#### Comprehensive Testing
- **API Tests** (`src/test/api.test.js`): 25 comprehensive tests for core API
- **Processor Tests** (`src/test/processors.test.js`): 16 tests for processing layer
- **Total Coverage**: 41 tests covering all major components
- **Node.js Test Runner**: Uses built-in Node.js test framework (no external dependencies)

#### Documentation
- **ARCHITECTURE.md**: Complete multi-layer architecture documentation
- **docs/API.md**: Comprehensive API reference with examples
- **docs/INTEGRATION_GUIDE.md**: Integration patterns and best practices
- **Updated README.md**: Complete rewrite showcasing multi-layer system
- **VSCode Extension README**: Detailed extension documentation

### Changed

#### Breaking Changes
**None!** The v2.0 release is fully backward compatible with v1.x CLI usage.

#### Internal Changes
- **Module Structure**: Reorganized into layers (API, processors, formatters)
- **Import Fixes**: Fixed all default/named export inconsistencies
- **Data Flow**: Normalized scan results structure (`status` → `tools`)
- **Error Handling**: Enhanced graceful error handling with fallbacks

### Improved

- **Performance**: Maintained sub-second scan times with new processing layers
- **Error Messages**: More descriptive error messages with context
- **Code Organization**: Clear separation of concerns across layers
- **Type Safety**: TypeScript definitions for better IDE support
- **Testing**: Comprehensive test coverage

### Fixed

- **Export Issues**: Fixed all import/export inconsistencies
- **Data Structure**: Normalized scan results format for API compatibility
- **Duplication Detection**: Updated to use correct `DuplicationDetector` methods
- **Cache Management**: Fixed cache clearing on configuration updates

## Migration Guide (v1.x → v2.0)

### CLI Usage (No Changes Required)
All v1.x CLI usage continues to work:
```bash
ctdiscovery
ctdiscovery --json
ctdiscovery --generate-context
```

### Programmatic Usage (New in v2.0)
```javascript
// New programmatic API
import { CTDiscovery } from 'ctdiscovery';

const ctd = new CTDiscovery();
const analysis = await ctd.scanAndAnalyze();
const markdown = await ctd.format(analysis, 'markdown');
```

### Module Imports
```javascript
// Import specific components
import {
  CTDiscovery,
  MCPScanner,
  Deduplicator,
  JSONFormatter
} from 'ctdiscovery';

// Or use granular imports
import { CTDiscovery } from 'ctdiscovery/api';
import { JSONFormatter } from 'ctdiscovery/formatters';
```

## [1.2.0] - Previous Release

See previous changelog entries for v1.x changes.

---

## Future Roadmap

### Planned for v2.1
- [ ] GitHub Action for CTDiscovery
- [ ] Docker container scanning
- [ ] Remote environment scanning
- [ ] Enhanced VSCode extension features

### Planned for v2.2
- [ ] Plugin marketplace
- [ ] Browser-based dashboard
- [ ] Real-time monitoring
- [ ] Team collaboration features

---

## Credits

**Development**: [@binarybcc](https://github.com/binarybcc)
**Architecture Design**: Multi-layer progressive enhancement pattern
**Testing**: Node.js built-in test runner
**Documentation**: Comprehensive guides and API references

---

For complete documentation, see:
- [README.md](README.md) - Getting started
- [ARCHITECTURE.md](ARCHITECTURE.md) - Architecture overview
- [docs/API.md](docs/API.md) - API reference
- [docs/INTEGRATION_GUIDE.md](docs/INTEGRATION_GUIDE.md) - Integration patterns
