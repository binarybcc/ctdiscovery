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

---

## Quick Start

### Installation

#### Option 1: npm (Programmatic Use)
```bash
npm install ctdiscovery
```

#### Option 2: Global CLI
```bash
npm install -g ctdiscovery
ctdiscovery --help
```

#### Option 3: One-Line Install
```bash
curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash
```

### Basic Usage

#### As a Module (NEW!)

```javascript
import { CTDiscovery } from 'ctdiscovery';

// Create instance
const ctd = new CTDiscovery();

// Scan environment
const results = await ctd.scan();

// Analyze results
const analysis = await ctd.analyze(results);

// Format as markdown
const markdown = await ctd.format(analysis, 'markdown');
console.log(markdown);
```

#### As CLI

```bash
# Human-readable dashboard
ctdiscovery

# Machine-readable JSON
ctdiscovery --json

# Generate AI context
ctdiscovery --generate-context

# Show conversation starter
ctdiscovery --conversation-starter --show-starter
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
