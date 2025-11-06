# CTDiscovery - Multi-Layer Development Environment Discovery

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Version: 2.0.0](https://img.shields.io/badge/Version-2.0.0-blue.svg)](https://github.com/binarybcc/ctdiscovery/releases)
[![Node: >=16.0.0](https://img.shields.io/badge/Node-%3E%3D16.0.0-green.svg)](https://nodejs.org)

**Transform your development environment discovery into a powerful, multi-layer integration system.**

From simple CLI usage to programmatic API and VSCode integration—CTDiscovery adapts to your workflow.

```
┌─────────────────────────────────────────────┐
│  Layer 3: Extensions                        │
│  • VSCode Extension                         │
│  • HTTP API (Future)                        │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Layer 2: Enhanced CLI                      │
│  • Human-readable output                    │
│  • Machine-readable JSON                    │
│  • Shell script integration                 │
└─────────────────┬───────────────────────────┘
                  │
┌─────────────────▼───────────────────────────┐
│  Layer 1: Core Module (NEW!)                │
│  • Programmatic API                         │
│  • Zero dependencies                        │
│  • Import and use anywhere                  │
└─────────────────────────────────────────────┘
```

**Platform Support:**
- ✅ **macOS** - Fully tested and supported
- ✅ **Windows** - Complete VSCode ecosystem detection
- ✅ **Linux** - Universal support across ALL distributions

---

## What's New in v2.0

🎉 **Major Architecture Transformation**

- **🔌 Programmatic API**: Import CTDiscovery as a module in your Node.js applications
- **📦 Clean Module Exports**: Use individual scanners, processors, and formatters
- **🎨 Multiple Output Formats**: JSON, Markdown, Text, AI Context
- **🔧 VSCode Extension**: Environment intelligence directly in your editor
- **📚 Comprehensive Documentation**: Complete API reference and integration guides
- **🛠️ Build Tool Integration**: Webpack, Vite, Rollup, ESBuild plugins
- **🤖 Enhanced AI Context**: Smarter conversation starters and recommendations

### ✨ NEW: Intelligent Analysis Layer

**CTDiscovery now provides smart, context-aware analysis instead of overwhelming tool lists!**

```bash
# Before: 21 tools (overwhelming)
ctdiscovery --all

# After: Only relevant tools (smart filtering)
ctdiscovery --smart
# → Detects project type
# → Filters irrelevant tools
# → Shows only what matters
# → Provides recommendations
```

**Key Features:**
- 🎯 **Project Type Detection**: Auto-detects JavaScript, Python, PHP, Rust, Go, Java, Ruby
- 🔍 **Usage Intelligence**: Distinguishes "installed" vs "actively used"
- 🎨 **Smart Filtering**: Hides irrelevant tools based on your project
- 🤖 **AI-Optimized**: Generates perfect context for AI assistants
- 💡 **Actionable Recommendations**: Suggests improvements and optimizations
- 📊 **Maturity Assessment**: Evaluates your development environment (0-100)

**Intelligence Modes:**
- `--smart` - Intelligent filtering (default for JSON)
- `--all` - Complete inventory (all tools)
- `--project-optimized` - Project-specific tools only
- `--ai-context` - Optimized for AI consumption

---

## Quick Start

### Installation

#### 🍎 macOS (Recommended)

**Using Homebrew:**
```bash
# Coming soon - for now use npm
npm install -g ctdiscovery
```

**Using npm (Current Method):**
```bash
# Install globally
npm install -g ctdiscovery

# Or install in your project
cd your-project
npm install ctdiscovery
```

**Verify Installation:**
```bash
ctdiscovery --version
ctdiscovery --help
```

#### 🪟 Windows

```bash
npm install -g ctdiscovery
```

#### 🐧 Linux

```bash
npm install -g ctdiscovery
```

#### Option: One-Line Install (All Platforms)
```bash
curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash
```

### Basic Usage

#### As a Module (NEW!)

```javascript
import { CTDiscovery } from 'ctdiscovery';

// Create instance with intelligent mode
const ctd = new CTDiscovery({ intelligenceMode: 'smart' });

// Scan environment
const results = await ctd.scan();

// Analyze results
const analysis = await ctd.analyze(results);

// Apply intelligent analysis (NEW!)
const intelligence = await ctd.intelligentAnalyze(analysis);
console.log(intelligence.projectIntelligence);  // Project type detected
console.log(intelligence.summary);              // Smart summary
console.log(intelligence.recommendations);      // Actionable advice

// Format as markdown
const markdown = await ctd.format(intelligence, 'markdown');
console.log(markdown);
```

#### As CLI

**New Intelligence Commands:**
```bash
# Smart mode - Only relevant tools (NEW!)
ctdiscovery --smart

# Smart JSON output with intelligence (NEW!)
ctdiscovery --json --smart

# Project-optimized filtering (NEW!)
ctdiscovery --project-optimized

# AI-optimized context (NEW!)
ctdiscovery --ai-context
```

**Classic Commands:**
```bash
# Human-readable dashboard
ctdiscovery

# Complete tool inventory
ctdiscovery --all

# Machine-readable JSON
ctdiscovery --json

# Generate AI context
ctdiscovery --generate-context
```

**Example Output (Smart Mode):**
```bash
$ ctdiscovery --smart

📁 PROJECT INTELLIGENCE
────────────────────────────────────────────────────────────
Type: javascript
Languages: javascript
Frameworks: react, nextjs
Confidence: 95%

📊 SUMMARY
────────────────────────────────────────────────────────────
Modern React/Next.js development environment with TypeScript
Maturity: configured (68/100)
Active Tools: 8 of 32
Filtered: 24

✅ ACTIVE & RELEVANT
────────────────────────────────────────────────────────────
1. node (v22.0.0) - JavaScript runtime
2. npm (v10.5.0) - Package manager
3. git (v2.43.0) - Version control
4. eslint - Linting configured
5. prettier - Code formatting active

💡 RECOMMENDATIONS
────────────────────────────────────────────────────────────
🔴 Consider upgrading: typescript to latest
🟡 Optimize: Remove 24 unused tools
🟢 Well configured: React, Next.js, ESLint
```

---

## Integration Patterns

### Pattern 1: Direct Import

Perfect for Node.js applications, build tools, and test frameworks:

```javascript
import { CTDiscovery } from 'ctdiscovery';

const ctd = new CTDiscovery({ timeout: 5000 });
const analysis = await ctd.scanAndAnalyze();

// Check if Docker is available
const hasDocker = analysis.tools.some(t => t.name === 'docker');

// Get Node.js version
const nodeVersion = analysis.environment.nodeVersion;
```

### Pattern 2: Shell Scripts

Perfect for CI/CD pipelines and automation:

```bash
#!/bin/bash

RESULTS=$(ctdiscovery --json --quiet)
HAS_GIT=$(echo "$RESULTS" | jq -r '.tools[] | select(.name=="git") | .status')

if [ "$HAS_GIT" == "active" ]; then
  echo "Git is available"
fi
```

### Pattern 3: Build Tools

Integrate with Webpack, Vite, Rollup, or ESBuild:

```javascript
// webpack.config.js
import { CTDiscoveryWebpackPlugin } from 'ctdiscovery/build-plugins';

export default {
  plugins: [
    new CTDiscoveryWebpackPlugin({
      outputPath: 'dist/environment',
      generateContext: true
    })
  ]
};
```

### Pattern 4: VSCode Extension

Install the CTDiscovery extension for VSCode:

```bash
cd extensions/vscode
npm install
npm run package
code --install-extension ctdiscovery-vscode-*.vsix
```

Features:
- 🔍 Automatic environment scanning
- 📊 Visual sidebar with discovered tools
- ⚙️ Auto-generate VSCode tasks
- 🤖 AI context generation
- 💡 Smart extension recommendations

---

## Core Features

### 🎯 **Complete Environment Detection**

**MCP Servers:**
- Active Claude Code MCP configurations
- System-wide npm-installed MCP packages
- Project-local MCP dependencies
- Version and status information

**VSCode Ecosystem:**
- VSCode, VSCode Insiders, VSCodium
- Installed extensions with capabilities
- Workspace and global settings
- AI-relevant extension flagging

**System Tools:**
- Version control (git, gh, hub)
- Languages (node, python, go, rust, java)
- Package managers (npm, yarn, pnpm, pip, cargo)
- Build tools (docker, make, webpack, vite)
- AI assistants (Claude Code, Copilot)

### 🔄 **Smart Processing**

- **Deduplication**: Intelligent merging of tool entries
- **Overlap Detection**: Find conflicting tools and dependencies
- **Enrichment**: Add capabilities, metadata, and documentation
- **Validation**: Ensure data quality and completeness

### 📊 **Multiple Output Formats**

- **JSON**: Machine-readable for scripts and pipelines
- **Markdown**: Beautiful reports for documentation
- **Text**: Clean terminal output
- **AI Context**: Optimized for Claude and other AI assistants

### ⚡ **Performance**

- Sub-second scans for typical environments
- Intelligent timeout management
- Graceful degradation on errors
- Optional result caching

---

## API Reference

### Main API

```javascript
import { CTDiscovery } from 'ctdiscovery';

const ctd = new CTDiscovery({
  timeout: 5000,
  includeMCP: true,
  includeVSCode: true,
  includeSystemTools: true,
  verbose: false,
  enableCache: true
});

// Scan environment
const results = await ctd.scan();

// Analyze results
const analysis = await ctd.analyze(results);

// Format output
const json = await ctd.format(analysis, 'json');
const markdown = await ctd.format(analysis, 'markdown');

// Generate AI context
const context = await ctd.generateContext(analysis);

// Convenience methods
const analysis2 = await ctd.scanAndAnalyze();
const markdown2 = await ctd.run('markdown');
```

### Individual Scanners

```javascript
import {
  MCPScanner,
  VSCodeScanner,
  SystemToolScanner
} from 'ctdiscovery';

// Use specific scanners
const mcpScanner = new MCPScanner();
const mcpResults = await mcpScanner.scan();

const vscodeScanner = new VSCodeScanner();
const vscodeResults = await vscodeScanner.scan();
```

### Processors

```javascript
import {
  Deduplicator,
  OverlapDetector,
  Enricher,
  Validator
} from 'ctdiscovery';

// Custom processing pipeline
const deduplicator = new Deduplicator();
const uniqueTools = await deduplicator.deduplicate(tools);

const detector = new OverlapDetector();
const overlaps = await detector.detect(uniqueTools);
```

### Formatters

```javascript
import {
  JSONFormatter,
  MarkdownFormatter,
  TextFormatter,
  ContextGenerator
} from 'ctdiscovery';

// Use formatters directly
const jsonFormatter = new JSONFormatter();
const json = await jsonFormatter.format(analysis, { pretty: true });

const mdFormatter = new MarkdownFormatter();
const markdown = await mdFormatter.format(analysis);
```

---

## CLI Commands

```bash
# Basic scanning
ctdiscovery                    # Interactive dashboard
ctdiscovery --json             # JSON output
ctdiscovery --json --output=file.json  # Save to file

# Context generation
ctdiscovery --generate-context
ctdiscovery --conversation-starter --show-starter

# Filtering
ctdiscovery --scanners=mcp,vscode     # Specific scanners only
ctdiscovery --quiet                   # Minimal output

# Watch mode
ctdiscovery --watch --interval=30     # Auto-refresh

# Configuration
ctdiscovery --timeout=10000          # Custom timeout
ctdiscovery --verbose                # Verbose output
```

---

## Integration Examples

### Example 1: Check Dependencies

```javascript
import { CTDiscovery } from 'ctdiscovery';

async function checkDependencies() {
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  const required = ['git', 'node', 'docker'];
  const missing = [];

  for (const dep of required) {
    const found = analysis.tools.some(t =>
      t.name === dep && t.status === 'active'
    );

    if (!found) missing.push(dep);
  }

  if (missing.length > 0) {
    throw new Error(`Missing: ${missing.join(', ')}`);
  }
}
```

### Example 2: Generate Project Documentation

```javascript
import { CTDiscovery } from 'ctdiscovery';
import { writeFileSync } from 'fs';

async function generateDocs() {
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  // Generate markdown report
  const markdown = await ctd.format(analysis, 'markdown');
  writeFileSync('docs/ENVIRONMENT.md', markdown);

  // Generate AI context
  const context = await ctd.generateContext(analysis);
  writeFileSync('.claude/context.md', context.markdown);
}
```

### Example 3: CI/CD Integration

```yaml
# .github/workflows/build.yml
- name: Scan Environment
  run: |
    npm install -g ctdiscovery
    ctdiscovery --json --output=environment.json

- name: Check Required Tools
  run: |
    HAS_GIT=$(cat environment.json | jq -r 'any(.tools[]; .name=="git")')
    if [ "$HAS_GIT" != "true" ]; then exit 1; fi
```

### Example 4: Build Plugin

```javascript
// webpack.config.js
import { CTDiscovery } from 'ctdiscovery';

export default {
  plugins: [
    {
      apply: (compiler) => {
        compiler.hooks.beforeRun.tapPromise('CTDiscovery', async () => {
          const ctd = new CTDiscovery();
          const analysis = await ctd.scanAndAnalyze();
          console.log(`Found ${analysis.summary.totalTools} tools`);
        });
      }
    }
  ]
};
```

---

## VSCode Extension

The CTDiscovery VSCode extension brings environment intelligence directly into your editor.

### Features

- **🔍 Automatic Scanning**: Scans on workspace open
- **📊 Sidebar View**: Visual tree of discovered tools
- **⚙️ Task Generation**: Auto-create VSCode tasks
- **🤖 AI Context**: Generate Claude Code context files
- **💡 Recommendations**: Suggest relevant extensions
- **🔄 Auto-Refresh**: Keep data up-to-date

### Installation

```bash
cd extensions/vscode
npm install
npm run package
code --install-extension ctdiscovery-vscode-*.vsix
```

### Usage

1. Open workspace in VSCode
2. Click CTDiscovery icon in Activity Bar
3. View discovered tools in sidebar
4. Use commands from Command Palette:
   - `CTDiscovery: Scan Environment`
   - `CTDiscovery: Generate AI Context`
   - `CTDiscovery: Sync to Tasks`

---

## Documentation

### Core Documentation
- **[Architecture](ARCHITECTURE.md)** - Multi-layer system design
- **[API Reference](docs/API.md)** - Complete API documentation
- **[Integration Guide](docs/INTEGRATION_GUIDE.md)** - Integration patterns

### Examples
- **[Basic Usage](examples/basic-usage.js)** - Simple examples
- **[Custom Scanners](examples/custom-scanner.js)** - Advanced scanner usage
- **[Build Integration](examples/build-integration.js)** - Build tool plugins
- **[Shell Scripts](examples/shell-script.sh)** - CLI integration

### Extensions
- **[VSCode Extension](extensions/vscode/README.md)** - Extension guide

---

## Performance

- **Fast**: Sub-second scans for typical environments
- **Timeout Management**: Configurable timeouts with fallbacks
- **Caching**: Optional result caching (TTL-based)
- **Graceful Degradation**: Partial results on scanner failures
- **Zero Dependencies**: Core module has no external dependencies

---

## Use Cases

### For Developers
- Understand your development environment
- Document available tools and configurations
- Verify required dependencies before building

### For AI Assistants
- Generate rich context for Claude Code
- Provide conversation starters
- Detect available capabilities

### For Build Tools
- Verify environment before building
- Generate environment-specific configurations
- Create build reports

### For CI/CD
- Validate environment in pipelines
- Generate artifact reports
- Check tool compatibility

### For Teams
- Share environment snapshots
- Standardize tool configurations
- Detect environment inconsistencies

---

## Intelligence Layer

### Overview

The Intelligence Layer transforms CTDiscovery from an exhaustive tool inventory into a curated, context-aware analysis system. Instead of showing you "here are 50 tools," it tells you "here are the 5 tools that matter for your React project."

### How It Works

```
┌──────────────────────────────────────────────────────┐
│  1. Project Type Detection                           │
│     Analyzes: package.json, composer.json, etc.      │
│     Detects: JavaScript, Python, PHP, Rust, Go...    │
└─────────────────┬────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│  2. Usage Analysis                                    │
│     Checks: Config files, lock files, scripts        │
│     Determines: active, configured, dormant          │
└─────────────────┬────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│  3. Relevance Scoring (0-100)                        │
│     • Ecosystem match (0-40 pts)                     │
│     • Configuration status (0-20 pts)                │
│     • Active usage (0-20 pts)                        │
│     • Capability match (0-10 pts)                    │
│     • Industry standard (0-10 pts)                   │
└─────────────────┬────────────────────────────────────┘
                  │
┌─────────────────▼────────────────────────────────────┐
│  4. Intelligent Summary                              │
│     • Maturity assessment (0-100)                    │
│     • Recommendations                                │
│     • Optimization opportunities                     │
│     • AI-optimized context                           │
└──────────────────────────────────────────────────────┘
```

### Intelligence Modes

#### `--smart` (Recommended)
Filters out irrelevant tools while keeping everything important.

```bash
ctdiscovery --smart
```

**What it does:**
- Detects your project type (JavaScript, Python, etc.)
- Hides tools not relevant to your ecosystem
- Shows only active or available tools
- Provides maturity score and recommendations

**Best for:** Daily development, quick environment checks

#### `--all` (Complete Inventory)
Shows every tool detected, no filtering.

```bash
ctdiscovery --all
```

**Best for:** Debugging, comprehensive audits, documentation

#### `--project-optimized`
Only shows tools directly related to your project type.

```bash
ctdiscovery --project-optimized
```

**Best for:** Focused analysis, CI/CD checks, team standards

#### `--ai-context`
Generates minimal, AI-optimized output.

```bash
ctdiscovery --ai-context
```

**Best for:** AI assistants, chatbots, automated analysis

### API Usage

```javascript
import { CTDiscovery } from 'ctdiscovery';

// Enable intelligent mode
const ctd = new CTDiscovery({ intelligenceMode: 'smart' });

// Scan and analyze
const scanResults = await ctd.scan();
const analysis = await ctd.analyze(scanResults);

// Apply intelligence
const intelligence = await ctd.intelligentAnalyze(analysis);

// Access intelligent data
console.log(intelligence.projectIntelligence);
// {
//   type: 'javascript',
//   languages: ['javascript'],
//   frameworks: ['react', 'nextjs'],
//   packageManagers: ['npm'],
//   confidence: 95
// }

console.log(intelligence.summary);
// {
//   description: 'Modern React/Next.js development environment',
//   maturity: 'configured',
//   maturityScore: 68,
//   active: 8,
//   filtered: 24
// }

console.log(intelligence.recommendations);
// [
//   { type: 'upgrade', priority: 'high', action: 'Upgrade TypeScript' },
//   { type: 'remove', priority: 'low', action: 'Remove 24 unused tools' }
// ]
```

### Supported Project Types

| Type | Detection Files | Example Frameworks |
|------|----------------|-------------------|
| **JavaScript** | package.json, package-lock.json | React, Vue, Next.js, Express |
| **TypeScript** | tsconfig.json | Angular, NestJS |
| **Python** | requirements.txt, setup.py, pyproject.toml | Django, Flask, FastAPI |
| **PHP** | composer.json | Laravel, Symfony |
| **Rust** | Cargo.toml | Actix, Rocket |
| **Go** | go.mod | Gin, Echo |
| **Java** | pom.xml, build.gradle | Spring Boot |
| **Ruby** | Gemfile | Rails, Sinatra |

### Maturity Levels

The intelligence layer assesses your environment maturity on a 0-100 scale:

| Score | Level | Description |
|-------|-------|-------------|
| **80-100** | Mature | Production-ready, well-configured, best practices |
| **60-79** | Configured | Good setup, actively used, room for optimization |
| **40-59** | Basic | Essential tools present, minimal configuration |
| **0-39** | Minimal | Few tools, little configuration, needs setup |

### JSON Output Structure

When using `--json --smart`, you get:

```json
{
  "version": "2.0.0",
  "timestamp": "2025-11-06T13:00:00.000Z",
  "intelligence": {
    "mode": "smart",
    "projectType": {
      "type": "javascript",
      "confidence": 90
    },
    "toolsByRelevance": {
      "active": 0,
      "available": 4,
      "filtered": 17
    },
    "summary": {
      "description": "Basic javascript development environment",
      "maturity": "basic",
      "maturityScore": 27
    },
    "recommendations": [
      {
        "type": "install",
        "priority": "high",
        "action": "Consider installing: eslint"
      }
    ],
    "aiContext": {
      "conversationStarter": "I'm working on a JavaScript project...",
      "focusAreas": ["npm workflow"]
    }
  },
  "tools": [ /* filtered tools */ ]
}
```

### Examples

#### Example 1: React Project
```bash
$ cd my-react-app
$ ctdiscovery --smart

📁 PROJECT: React + TypeScript (95% confidence)
✅ 12 active tools | 8 filtered
🎯 Maturity: 72/100 (configured)
💡 Tip: Enable React strict mode
```

#### Example 2: Laravel Project
```bash
$ cd my-laravel-app
$ ctdiscovery --smart

📁 PROJECT: PHP Laravel (98% confidence)
✅ 9 active tools | 15 filtered
🎯 Maturity: 81/100 (mature)
💡 Well configured! Consider PHPStan level 8
```

#### Example 3: Python Django
```bash
$ cd my-django-app
$ ctdiscovery --project-optimized

📁 PROJECT: Python Django (92% confidence)
✅ 7 active tools | 21 filtered
🎯 Maturity: 65/100 (configured)
💡 Add Black formatter, Mypy type checking
```

---

## Migration from v1.x

CTDiscovery v2.0 is fully backward compatible with v1.x CLI usage. However, v2.0 adds powerful new programmatic capabilities.

### What's Changed

- **Main Entry**: `src/index.js` (was `src/cli.js` for programmatic use)
- **New Exports**: Granular exports for scanners, processors, formatters
- **Enhanced API**: New methods for scan, analyze, format workflow

### Upgrading

```bash
# Update to v2.0
npm install ctdiscovery@latest

# Old CLI usage still works
ctdiscovery

# New programmatic usage
import { CTDiscovery } from 'ctdiscovery';
```

---

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development Setup

```bash
# Clone repository
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery

# Install dependencies
npm install

# Run tests
npm test

# Build VSCode extension
cd extensions/vscode
npm install
npm run compile
```

---

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

## Links

- **GitHub**: https://github.com/binarybcc/ctdiscovery
- **Issues**: https://github.com/binarybcc/ctdiscovery/issues
- **Author**: [@binarybcc](https://github.com/binarybcc)

---

## Roadmap

- [ ] TypeScript type definitions
- [ ] HTTP API server (Layer 3)
- [ ] Browser-based dashboard
- [ ] GitHub Action
- [ ] Docker container scanning
- [ ] Plugin marketplace
- [ ] Remote environment scanning

---

**Made with ❤️ for developers using AI assistants like Claude Code**
