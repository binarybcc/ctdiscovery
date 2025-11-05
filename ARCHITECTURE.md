# CTDiscovery Multi-Layer Architecture

## Overview

CTDiscovery is designed as a progressive, multi-layer integration system that enables environment discovery across different consumption patterns—from CLI usage to programmatic integration and IDE extensions.

## Architecture Principles

1. **Progressive Enhancement**: Each layer builds on the previous, but layers are optional
2. **Clean Separation**: Clear boundaries between layers with well-defined interfaces
3. **Zero Dependencies**: Core module remains dependency-free for maximum portability
4. **Fast Execution**: Optimized for sub-second scans with timeout management
5. **Cross-Platform**: Consistent behavior across macOS, Windows, and Linux

## Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Layer 3: Integration Extensions (Optional)                 │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ VSCode Extension│  │  HTTP API    │  │  Future Tools  │ │
│  └─────────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 2: Enhanced CLI (Machine + Human)                    │
│  ┌─────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │  JSON Output    │  │ Structured   │  │  Interactive   │ │
│  │  Mode           │  │ Data         │  │  Mode          │ │
│  └─────────────────┘  └──────────────┘  └────────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Layer 1: Core Module (Pure Node.js)                        │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Programmatic API                            ││
│  │  scan(), analyze(), format(), configure()               ││
│  └─────────────────────────────────────────────────────────┘│
│                              ↓                               │
│  ┌─────────────────────────────────────────────────────────┐│
│  │              Internal Layers                             ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ 1. Discovery Layer (Scanners)                     │  ││
│  │  │    • MCP Scanner                                  │  ││
│  │  │    • VSCode Scanner                               │  ││
│  │  │    • System Tool Scanner                          │  ││
│  │  │    • Plugin Interface                             │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  │                        ↓                                 ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ 2. Processing Layer                               │  ││
│  │  │    • Deduplication                                │  ││
│  │  │    • Overlap Detection                            │  ││
│  │  │    • Analysis & Enrichment                        │  ││
│  │  │    • Validation                                   │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  │                        ↓                                 ││
│  │  ┌───────────────────────────────────────────────────┐  ││
│  │  │ 3. Output Layer                                   │  ││
│  │  │    • Format Renderers (JSON, Markdown, Text)      │  ││
│  │  │    • Context Generators                           │  ││
│  │  │    • Report Builders                              │  ││
│  │  └───────────────────────────────────────────────────┘  ││
│  └─────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│  Foundation: Utilities & Infrastructure                     │
│  • Configuration Management                                 │
│  • Error Handling Strategies                                │
│  • Platform Detection                                       │
│  • Sequential Timeout Management                            │
└─────────────────────────────────────────────────────────────┘
```

## Layer 1: Core Module

### Purpose
Provide a clean, importable Node.js module that other tools can use programmatically.

### API Design

```javascript
// Main entry point: src/index.js
import { CTDiscovery } from 'ctdiscovery';

// Create instance
const ctd = new CTDiscovery(options);

// Scan environment
const results = await ctd.scan();

// Analyze results
const analysis = await ctd.analyze(results);

// Format output
const markdown = await ctd.format(analysis, 'markdown');
const json = await ctd.format(analysis, 'json');
```

### Module Exports

```javascript
export {
  // Main API
  CTDiscovery,

  // Individual scanners for advanced use
  MCPScanner,
  VSCodeScanner,
  SystemToolScanner,

  // Utilities
  ConfigManager,
  OverlapDetector,

  // Constants
  TOOL_STATUSES,
  TOOL_CATEGORIES,

  // Types (for TypeScript support)
  ScanResult,
  ScanOptions,
  AnalysisResult
}
```

### Core API Methods

#### `scan(options)`
```javascript
/**
 * Scan the development environment
 * @param {Object} options - Scan configuration
 * @param {boolean} options.includeVSCode - Include VSCode scan
 * @param {boolean} options.includeMCP - Include MCP scan
 * @param {boolean} options.includeSystemTools - Include system tools
 * @param {number} options.timeout - Total scan timeout in ms
 * @returns {Promise<ScanResults>} Raw scan results
 */
```

#### `analyze(scanResults)`
```javascript
/**
 * Analyze scan results (dedupe, detect overlaps, enrich)
 * @param {ScanResults} scanResults - Raw scan results
 * @returns {Promise<AnalysisResult>} Processed analysis
 */
```

#### `format(analysisResult, format)`
```javascript
/**
 * Format analysis for output
 * @param {AnalysisResult} analysisResult - Analysis to format
 * @param {string} format - Output format (json|markdown|text)
 * @returns {Promise<string>} Formatted output
 */
```

#### `generateContext(analysisResult, options)`
```javascript
/**
 * Generate AI assistant context
 * @param {AnalysisResult} analysisResult - Analysis result
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Context markdown
 */
```

### Data Structures

#### ScanResults
```javascript
{
  timestamp: string,          // ISO timestamp
  scanDuration: number,        // ms
  environment: {
    platform: string,          // darwin|win32|linux
    nodeVersion: string,       // Node.js version
    workingDirectory: string   // Current directory
  },
  tools: {
    mcp: ScanResult,
    vscode: ScanResult,
    systemTools: ScanResult,
    claudeCode: Object
  },
  metrics: {
    performance: Object,
    degradation: Array
  }
}
```

#### ScanResult (per scanner)
```javascript
{
  status: 'success'|'partial'|'failed',
  data: Array<Tool>,
  method: {
    name: string,
    status: string,
    duration: number,
    platform: string
  },
  overlaps: Array<Overlap>,
  errors: Array<Error>,
  warnings: Array<string>
}
```

#### Tool
```javascript
{
  name: string,
  type: string,              // TOOL_CATEGORIES constant
  status: string,            // TOOL_STATUSES constant
  source: string,            // Detection source
  metadata: {
    version?: string,
    path?: string,
    capabilities?: Array<string>,
    ...                      // Scanner-specific metadata
  },
  validation: {
    validated: boolean,
    validatedAt?: string,
    issues?: Array<string>
  }
}
```

## Layer 2: Enhanced CLI

### Purpose
Serve both human users (readable output) and machine consumption (JSON, scripting).

### CLI Design

```bash
# Human-readable output (default)
ctdiscovery

# Machine-readable JSON
ctdiscovery --json

# Specific scanners only
ctdiscovery --scanners=mcp,vscode

# Output to file
ctdiscovery --output=results.json --format=json

# Generate specific artifacts
ctdiscovery --generate-context --context-file=.claude/context.md

# Stream mode for monitoring
ctdiscovery --watch --interval=30

# Quiet mode (exit codes only)
ctdiscovery --quiet
```

### Enhanced Output Formats

#### JSON Output Schema
```json
{
  "version": "2.0.0",
  "timestamp": "2025-11-05T12:00:00Z",
  "environment": { ... },
  "scan": {
    "duration": 245,
    "status": "success",
    "results": { ... }
  },
  "analysis": {
    "tools": [],
    "overlaps": [],
    "recommendations": []
  },
  "context": {
    "markdown": "...",
    "conversationStarter": "..."
  }
}
```

#### Exit Codes
```
0  - Success, no issues
1  - Partial success, some scanners failed
2  - Complete failure
10 - Configuration error
20 - Permission error
```

## Layer 3: VSCode Extension

### Purpose
Bring environment intelligence directly into the editor.

### Extension Architecture

```
ctdiscovery-vscode/
├── package.json               # Extension manifest
├── src/
│   ├── extension.js           # Entry point
│   ├── views/
│   │   ├── sidebar-provider.js       # Environment sidebar
│   │   ├── tool-tree-provider.js     # Tool tree view
│   │   └── recommendations-view.js   # Recommendations
│   ├── commands/
│   │   ├── scan-environment.js       # Trigger scan
│   │   ├── generate-context.js       # Generate AI context
│   │   └── sync-tasks.js             # Sync to VSCode tasks
│   ├── integration/
│   │   └── ctdiscovery-bridge.js     # Import core module
│   └── config/
│       └── extension-settings.js     # Extension config
└── resources/
    ├── icons/                 # Tool icons
    └── templates/             # Task templates
```

### Key Features

#### 1. Environment Sidebar
- Live view of discovered tools
- Status indicators (active/available/missing)
- Quick actions (open config, view docs)
- Refresh on file changes

#### 2. VSCode Task Integration
```json
// Auto-generated tasks.json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "npm: install",
      "type": "shell",
      "command": "npm install",
      "group": "build",
      "discovered": true,
      "discoveredBy": "ctdiscovery"
    }
  ]
}
```

#### 3. Command Palette Integration
- `CTDiscovery: Scan Environment`
- `CTDiscovery: Generate AI Context`
- `CTDiscovery: Show Discovered Tools`
- `CTDiscovery: Sync to Tasks`
- `CTDiscovery: Show Recommendations`

#### 4. Extension Recommendations
```javascript
// Based on discovered tools, suggest relevant extensions
{
  "recommendations": [
    "ms-python.python",           // Python detected
    "dbaeumer.vscode-eslint",     // Node.js detected
    "ms-azuretools.vscode-docker" // Docker detected
  ]
}
```

#### 5. AI Context Provider
- Automatic context generation on workspace open
- Update `.claude/context.md` on changes
- Integrate with Claude Code extension

### Extension Bridge

```javascript
// How VSCode extension uses core module
import { CTDiscovery } from 'ctdiscovery';

export class CTDiscoveryBridge {
  constructor() {
    this.ctd = new CTDiscovery({
      timeout: 5000,
      verbose: false
    });
  }

  async scanWorkspace(workspacePath) {
    const results = await this.ctd.scan();
    const analysis = await this.ctd.analyze(results);
    return this.transformForVSCode(analysis);
  }

  transformForVSCode(analysis) {
    // Transform to VSCode-friendly format
    return {
      treeItems: this.buildTreeItems(analysis),
      tasks: this.buildTasks(analysis),
      recommendations: this.buildRecommendations(analysis)
    };
  }
}
```

## Integration Patterns

### Pattern 1: Direct Module Import

```javascript
// Another Node.js tool using CTDiscovery
import { CTDiscovery } from 'ctdiscovery';

async function analyzeProject() {
  const ctd = new CTDiscovery({ includeVSCode: false });
  const results = await ctd.scan();
  const analysis = await ctd.analyze(results);

  // Use analysis data
  const hasDocker = analysis.tools.some(t => t.name === 'docker');
  const nodeVersion = analysis.environment.nodeVersion;

  return { hasDocker, nodeVersion };
}
```

### Pattern 2: CLI Integration (JSON)

```bash
#!/bin/bash
# Shell script consuming JSON output

RESULTS=$(ctdiscovery --json --quiet)
HAS_GIT=$(echo "$RESULTS" | jq -r '.analysis.tools[] | select(.name=="git") | .status')

if [ "$HAS_GIT" == "active" ]; then
  echo "Git is available"
fi
```

### Pattern 3: VSCode Extension

```javascript
// VSCode extension using core module
import * as vscode from 'vscode';
import { CTDiscovery } from 'ctdiscovery';

export function activate(context) {
  const ctd = new CTDiscovery();

  // Register command
  const scanCmd = vscode.commands.registerCommand(
    'ctdiscovery.scan',
    async () => {
      const results = await ctd.scan();
      const markdown = await ctd.format(results, 'markdown');
      // Display in webview
    }
  );

  context.subscriptions.push(scanCmd);
}
```

### Pattern 4: Build Tool Integration

```javascript
// Webpack plugin
import { CTDiscovery } from 'ctdiscovery';

class CTDiscoveryPlugin {
  apply(compiler) {
    compiler.hooks.beforeRun.tapPromise('CTDiscovery', async () => {
      const ctd = new CTDiscovery({ timeout: 2000 });
      const results = await ctd.scan();

      // Inject discovered tools into build process
      compiler.options.externals = this.getExternals(results);
    });
  }
}
```

## File Structure (Refactored)

```
ctdiscovery/
├── src/
│   ├── index.js                      # Main API entry point
│   ├── ctdiscovery.js                # Core class
│   │
│   ├── api/                          # Public API layer
│   │   ├── scanner-api.js            # Scan operations
│   │   ├── analyzer-api.js           # Analysis operations
│   │   └── formatter-api.js          # Formatting operations
│   │
│   ├── cli/                          # CLI layer (separate from core)
│   │   ├── cli.js                    # Basic CLI
│   │   ├── enhanced-cli.js           # Advanced CLI
│   │   ├── option-parser.js          # Argument parsing
│   │   └── output-renderer.js        # CLI-specific rendering
│   │
│   ├── scanners/                     # Discovery layer
│   │   ├── environment-scanner.js
│   │   ├── mcp-scanner.js
│   │   ├── vscode-scanner.js
│   │   └── system-tool-scanner.js
│   │
│   ├── processors/                   # Processing layer (NEW)
│   │   ├── deduplicator.js          # Remove duplicates
│   │   ├── overlap-detector.js      # Find conflicts
│   │   ├── enricher.js              # Add metadata
│   │   └── validator.js             # Validate results
│   │
│   ├── formatters/                   # Output layer (NEW)
│   │   ├── json-formatter.js
│   │   ├── markdown-formatter.js
│   │   ├── text-formatter.js
│   │   └── context-generator.js
│   │
│   ├── utils/                        # Utilities
│   ├── config/                       # Configuration
│   └── interfaces/                   # Plugin interfaces
│
├── examples/                         # Integration examples (NEW)
│   ├── basic-usage.js
│   ├── custom-scanner.js
│   ├── build-integration.js
│   └── shell-script.sh
│
├── extensions/                       # VSCode extension (NEW)
│   └── vscode/
│       ├── package.json
│       └── src/
│
├── docs/                             # Documentation (NEW)
│   ├── api/
│   │   ├── core-api.md
│   │   ├── scanner-api.md
│   │   └── formatter-api.md
│   ├── guides/
│   │   ├── integration-guide.md
│   │   ├── custom-scanners.md
│   │   └── vscode-extension.md
│   └── examples/
│
├── package.json
├── README.md
└── ARCHITECTURE.md                   # This file
```

## Migration Strategy

### Phase 1: Core Module Refactoring
1. Create `src/index.js` as main API entry point
2. Implement `CTDiscovery` class with public API
3. Move existing scanners to discovery layer
4. Create new processing layer
5. Separate CLI from core module

### Phase 2: CLI Enhancement
1. Refactor CLI to use core module API
2. Add JSON output mode
3. Implement machine-readable formats
4. Add streaming/watch mode

### Phase 3: VSCode Extension
1. Create extension scaffolding
2. Implement sidebar view
3. Add command palette integration
4. Implement task sync
5. Add AI context provider

### Phase 4: Documentation & Examples
1. API documentation
2. Integration examples
3. Migration guides
4. Best practices

## Performance Considerations

- **Fast by Default**: Sub-second scans for typical environments
- **Timeout Management**: Hard limits prevent hanging
- **Lazy Loading**: Only load scanners when needed
- **Caching**: Cache results between operations
- **Streaming**: Support streaming for watch mode

## Backward Compatibility

- Existing CLI usage patterns remain unchanged
- Old scripts continue to work
- New features are opt-in
- Clear migration path for advanced features

## Security Considerations

- No arbitrary code execution
- Read-only operations only
- Respect file permissions
- No network calls (local scanning only)
- No data collection or telemetry

## Testing Strategy

- Unit tests for each layer
- Integration tests for API
- CLI tests with fixtures
- VSCode extension tests
- Cross-platform CI/CD

## Future Extensibility

- HTTP API server (optional daemon)
- Browser-based dashboard
- GitHub Action integration
- Docker container scanning
- Remote environment scanning
- Plugin marketplace

---

## Summary

This architecture transforms CTDiscovery from a CLI tool into a flexible, multi-layer integration platform while maintaining:

- **Simplicity**: Core module has zero dependencies
- **Performance**: Fast scans with timeout management
- **Extensibility**: Clear plugin interfaces
- **Usability**: Multiple consumption patterns
- **Maintainability**: Clean separation of concerns

Each layer builds on the previous, enabling progressive adoption and diverse integration patterns.
