# CTDiscovery API Documentation

Complete API reference for the CTDiscovery programmatic interface.

## Table of Contents

- [Installation](#installation)
- [Quick Start](#quick-start)
- [Core API](#core-api)
  - [CTDiscovery Class](#ctdiscovery-class)
  - [Methods](#methods)
- [Scanners](#scanners)
- [Processors](#processors)
- [Formatters](#formatters)
- [Data Structures](#data-structures)
- [Constants](#constants)
- [Error Handling](#error-handling)
- [Advanced Usage](#advanced-usage)

---

## Installation

```bash
npm install ctdiscovery
```

## Quick Start

```javascript
import { CTDiscovery } from 'ctdiscovery';

// Create instance
const ctd = new CTDiscovery();

// Scan environment
const results = await ctd.scan();

// Analyze results
const analysis = await ctd.analyze(results);

// Format output
const markdown = await ctd.format(analysis, 'markdown');
console.log(markdown);
```

---

## Core API

### CTDiscovery Class

Main entry point for the CTDiscovery API.

#### Constructor

```javascript
new CTDiscovery(options)
```

**Parameters:**

- `options` (Object, optional) - Configuration options
  - `timeout` (number) - Total scan timeout in milliseconds (default: 3000)
  - `includeMCP` (boolean) - Include MCP scanner (default: true)
  - `includeVSCode` (boolean) - Include VSCode scanner (default: true)
  - `includeSystemTools` (boolean) - Include system tools scanner (default: true)
  - `verbose` (boolean) - Enable verbose logging (default: false)
  - `enableCache` (boolean) - Enable result caching (default: true)
  - `cacheTTL` (number) - Cache TTL in milliseconds (default: 60000)

**Example:**

```javascript
const ctd = new CTDiscovery({
  timeout: 5000,
  includeMCP: true,
  includeVSCode: false,
  verbose: true
});
```

---

### Methods

#### scan(options)

Scan the development environment.

```javascript
const results = await ctd.scan(options);
```

**Parameters:**

- `options` (Object, optional) - Scan-specific options (merged with constructor options)

**Returns:** `Promise<ScanResults>`

**Example:**

```javascript
const results = await ctd.scan({
  includeMCP: false,  // Override constructor option
  timeout: 10000      // Override timeout
});
```

---

#### analyze(scanResults, options)

Analyze scan results through deduplication, overlap detection, enrichment, and validation.

```javascript
const analysis = await ctd.analyze(scanResults, options);
```

**Parameters:**

- `scanResults` (ScanResults) - Results from `scan()`
- `options` (Object, optional) - Analysis options

**Returns:** `Promise<AnalysisResult>`

**Example:**

```javascript
const scanResults = await ctd.scan();
const analysis = await ctd.analyze(scanResults);

console.log(`Found ${analysis.summary.totalTools} tools`);
console.log(`Active: ${analysis.summary.byStatus.active}`);
console.log(`Overlaps: ${analysis.summary.overlapCount}`);
```

---

#### format(analysisResult, format, options)

Format analysis result for output.

```javascript
const output = await ctd.format(analysisResult, format, options);
```

**Parameters:**

- `analysisResult` (AnalysisResult) - Results from `analyze()`
- `format` (string) - Output format: `'json'`, `'markdown'`, `'text'`
- `options` (Object, optional) - Format-specific options

**Returns:** `Promise<string>`

**Example:**

```javascript
// JSON output
const json = await ctd.format(analysis, 'json', {
  pretty: true,
  indent: 2
});

// Markdown output
const markdown = await ctd.format(analysis, 'markdown', {
  includeHeader: true,
  includeTableOfContents: true
});

// Text output
const text = await ctd.format(analysis, 'text', {
  width: 80
});
```

---

#### generateContext(analysisResult, options)

Generate AI assistant context.

```javascript
const context = await ctd.generateContext(analysisResult, options);
```

**Parameters:**

- `analysisResult` (AnalysisResult) - Results from `analyze()`
- `options` (Object, optional) - Generation options
  - `includeConversationStarter` (boolean) - Include conversation starter (default: true)
  - `includeRecommendations` (boolean) - Include recommendations (default: true)
  - `aiRelevanceThreshold` (number) - Minimum AI relevance score (default: 0)

**Returns:** `Promise<ContextObject>`

**ContextObject Structure:**

```javascript
{
  markdown: string,              // Markdown context
  conversationStarter: string,   // Ready-to-use conversation opener
  recommendations: string[],     // Tool recommendations
  metadata: {
    generatedAt: string,         // ISO timestamp
    toolCount: number,           // Relevant tool count
    totalToolCount: number       // Total tool count
  }
}
```

**Example:**

```javascript
const context = await ctd.generateContext(analysis, {
  includeConversationStarter: true,
  aiRelevanceThreshold: 50  // Only highly relevant tools
});

console.log(context.conversationStarter);
// Output: "I scanned your environment and found: Git, Node.js, Docker..."
```

---

#### scanAndAnalyze(options)

Convenience method combining `scan()` and `analyze()`.

```javascript
const analysis = await ctd.scanAndAnalyze(options);
```

**Returns:** `Promise<AnalysisResult>`

**Example:**

```javascript
const analysis = await ctd.scanAndAnalyze({ timeout: 5000 });
```

---

#### run(format, options)

Complete workflow: scan, analyze, and format in one call.

```javascript
const output = await ctd.run(format, options);
```

**Parameters:**

- `format` (string, optional) - Output format (default: 'json')
- `options` (Object, optional) - Options for all stages

**Returns:** `Promise<string>`

**Example:**

```javascript
// One-liner for markdown report
const markdown = await ctd.run('markdown');

// One-liner for JSON output
const json = await ctd.run('json', { pretty: true });
```

---

#### clearCache()

Clear cached scan results.

```javascript
ctd.clearCache();
```

---

#### getConfig()

Get current configuration.

```javascript
const config = ctd.getConfig();
console.log(config.timeout);  // 3000
```

**Returns:** `Object` - Current configuration

---

#### updateConfig(updates)

Update configuration.

```javascript
ctd.updateConfig({ timeout: 10000 });
```

**Parameters:**

- `updates` (Object) - Configuration updates

**Note:** Clears cache when configuration changes.

---

## Scanners

Individual scanners can be used directly for advanced use cases.

### MCPScanner

Scans for MCP (Model Context Protocol) servers.

```javascript
import { MCPScanner } from 'ctdiscovery';

const scanner = new MCPScanner();
const results = await scanner.scan();

console.log(`Found ${results.data.length} MCP servers`);
```

### VSCodeScanner

Scans for VSCode extensions.

```javascript
import { VSCodeScanner } from 'ctdiscovery';

const scanner = new VSCodeScanner();
const results = await scanner.scan();

console.log(`Found ${results.data.length} extensions`);
```

### SystemToolScanner

Scans for system tools (git, npm, docker, etc.).

```javascript
import { SystemToolScanner } from 'ctdiscovery';

const scanner = new SystemToolScanner();
const results = await scanner.scan();

console.log(`Found ${results.data.length} system tools`);
```

### EnvironmentScanner

Orchestrates all scanners.

```javascript
import { EnvironmentScanner } from 'ctdiscovery';

const scanner = new EnvironmentScanner();
const results = await scanner.scan();

console.log('MCP servers:', results.tools.mcp.data.length);
console.log('VSCode extensions:', results.tools.vscode.data.length);
console.log('System tools:', results.tools.systemTools.data.length);
```

---

## Processors

Process and enrich scan results.

### Deduplicator

Remove duplicate tool entries.

```javascript
import { Deduplicator } from 'ctdiscovery';

const deduplicator = new Deduplicator();
const uniqueTools = await deduplicator.deduplicate(tools);
```

### OverlapDetector

Detect tool conflicts and overlaps.

```javascript
import { OverlapDetector } from 'ctdiscovery';

const detector = new OverlapDetector();
const overlaps = await detector.detect(tools);

for (const overlap of overlaps) {
  console.log(`${overlap.type}: ${overlap.tools.join(', ')}`);
  console.log(`Recommendation: ${overlap.recommendation}`);
}
```

### Enricher

Add metadata and capabilities to tools.

```javascript
import { Enricher } from 'ctdiscovery';

const enricher = new Enricher();
const enrichedTools = await enricher.enrich(tools, environment);

// Tools now have:
// - capabilities
// - categories
// - platformCompatibility
// - aiRelevance score
// - documentation links
// - usage examples
```

### Validator

Validate tool entries.

```javascript
import { Validator } from 'ctdiscovery';

const validator = new Validator({ strict: true });
const validation = await validator.validate(tools);

if (!validation.valid) {
  console.log('Validation errors:', validation.issues);
}
```

---

## Formatters

Format analysis results for output.

### JSONFormatter

```javascript
import { JSONFormatter } from 'ctdiscovery';

const formatter = new JSONFormatter();
const json = await formatter.format(analysis, {
  pretty: true,
  indent: 2,
  includeMetadata: true
});
```

### MarkdownFormatter

```javascript
import { MarkdownFormatter } from 'ctdiscovery';

const formatter = new MarkdownFormatter();
const markdown = await formatter.format(analysis, {
  includeHeader: true,
  includeTableOfContents: true
});
```

### TextFormatter

```javascript
import { TextFormatter } from 'ctdiscovery';

const formatter = new TextFormatter();
const text = await formatter.format(analysis, {
  width: 80
});
```

### ContextGenerator

```javascript
import { ContextGenerator } from 'ctdiscovery';

const generator = new ContextGenerator();
const context = await generator.generate(analysis, {
  includeConversationStarter: true,
  includeRecommendations: true
});
```

---

## Data Structures

### ScanResults

```typescript
interface ScanResults {
  timestamp: string;           // ISO timestamp
  scanDuration: number;        // Scan duration in ms
  environment: {
    platform: string;          // 'darwin' | 'win32' | 'linux'
    nodeVersion: string;       // Node.js version
    workingDirectory: string;  // Current directory
  };
  tools: {
    mcp: ScanResult;
    vscode: ScanResult;
    systemTools: ScanResult;
    claudeCode?: object;
  };
  metrics: {
    performance: object;
    degradation: any[];
  };
}
```

### ScanResult

```typescript
interface ScanResult {
  status: 'success' | 'partial' | 'failed';
  data: Tool[];
  method: {
    name: string;
    status: string;
    duration: number;
    platform: string;
  };
  overlaps: Overlap[];
  errors: Error[];
  warnings: string[];
}
```

### Tool

```typescript
interface Tool {
  name: string;
  type: string;                // TOOL_CATEGORIES constant
  status: string;              // TOOL_STATUSES constant
  source: string;              // Detection source
  metadata: {
    version?: string;
    path?: string;
    capabilities?: string[];
    documentation?: string;
    examples?: string[];
    [key: string]: any;
  };
  validation: {
    validated: boolean;
    validatedAt?: string;
    issues?: string[];
  };
  category?: string;
  aiRelevance?: number;        // 0-100 score
  platformCompatibility?: string[];
}
```

### AnalysisResult

```typescript
interface AnalysisResult {
  version: string;
  timestamp: string;
  environment: object;
  scanDuration: number;
  tools: Tool[];
  overlaps: Overlap[];
  validation: ValidationResult;
  metrics: object;
  summary: {
    totalTools: number;
    byStatus: Record<string, number>;
    byCategory: Record<string, number>;
    overlapCount: number;
    validationIssues: number;
  };
}
```

### Overlap

```typescript
interface Overlap {
  type: string;
  tools: string[];
  reason: string;
  severity: 'error' | 'warning' | 'info';
  recommendation: string;
}
```

---

## Constants

```javascript
import { TOOL_STATUSES, TOOL_CATEGORIES, OUTPUT_FORMATS } from 'ctdiscovery';

// Tool status
TOOL_STATUSES.ACTIVE      // 'active'
TOOL_STATUSES.AVAILABLE   // 'available'
TOOL_STATUSES.DETECTED    // 'detected'
TOOL_STATUSES.MISSING     // 'missing'
TOOL_STATUSES.ERROR       // 'error'

// Tool categories
TOOL_CATEGORIES.MCP_SERVER         // 'mcp-server'
TOOL_CATEGORIES.VSCODE_EXTENSION   // 'vscode-extension'
TOOL_CATEGORIES.SYSTEM_TOOL        // 'system-tool'
TOOL_CATEGORIES.LANGUAGE           // 'language'
TOOL_CATEGORIES.PACKAGE_MANAGER    // 'package-manager'
TOOL_CATEGORIES.VERSION_CONTROL    // 'version-control'

// Output formats
OUTPUT_FORMATS.JSON       // 'json'
OUTPUT_FORMATS.MARKDOWN   // 'markdown'
OUTPUT_FORMATS.TEXT       // 'text'
```

---

## Error Handling

CTDiscovery uses graceful error handling with fallbacks.

```javascript
try {
  const analysis = await ctd.scanAndAnalyze();
} catch (error) {
  if (error.message.includes('timeout')) {
    console.error('Scan timed out. Try increasing timeout.');
  } else if (error.message.includes('permission')) {
    console.error('Permission denied. Check file permissions.');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

**Common Error Types:**

- **Timeout Errors**: Scan exceeded timeout limit
- **Permission Errors**: Cannot access required files/directories
- **Validation Errors**: Invalid input or configuration
- **Scanner Errors**: Individual scanner failures (handled gracefully)

---

## Advanced Usage

### Custom Scanner Configuration

```javascript
const ctd = new CTDiscovery({
  includeMCP: true,
  includeVSCode: true,
  includeSystemTools: true,
  timeout: 10000,
  verbose: true
});
```

### Filtering Results

```javascript
const analysis = await ctd.scanAndAnalyze();

// Filter active tools only
const activeTools = analysis.tools.filter(t => t.status === 'active');

// Filter by category
const languages = analysis.tools.filter(t => t.category === 'language');

// Filter by AI relevance
const aiRelevant = analysis.tools.filter(t => t.aiRelevance > 50);
```

### Caching Strategy

```javascript
// Enable caching with custom TTL
const ctd = new CTDiscovery({
  enableCache: true,
  cacheTTL: 300000  // 5 minutes
});

// First scan (not cached)
await ctd.scan();

// Second scan within TTL (uses cache)
await ctd.scan();

// Clear cache manually
ctd.clearCache();

// Next scan will be fresh
await ctd.scan();
```

### Batch Processing

```javascript
// Process multiple workspaces
const workspaces = ['./project1', './project2', './project3'];

for (const workspace of workspaces) {
  process.chdir(workspace);

  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  console.log(`${workspace}: ${analysis.summary.totalTools} tools`);
}
```

### Custom Output Pipeline

```javascript
const ctd = new CTDiscovery();

// Scan and analyze
const analysis = await ctd.scanAndAnalyze();

// Generate multiple formats
const json = await ctd.format(analysis, 'json');
const markdown = await ctd.format(analysis, 'markdown');
const text = await ctd.format(analysis, 'text');

// Generate AI context
const context = await ctd.generateContext(analysis);

// Write to files
import { writeFileSync } from 'fs';
writeFileSync('environment.json', json);
writeFileSync('environment.md', markdown);
writeFileSync('.claude/context.md', context.markdown);
```

---

## Helper Functions

### quickScan()

Quick scan without creating an instance.

```javascript
import { quickScan } from 'ctdiscovery';

const analysis = await quickScan({ timeout: 5000 });
console.log(analysis);
```

### generateContext()

Quick context generation.

```javascript
import { generateContext } from 'ctdiscovery';

const markdown = await generateContext({
  includeConversationStarter: true
});
console.log(markdown);
```

---

## TypeScript Support

CTDiscovery is written in JavaScript but provides JSDoc comments for TypeScript type inference.

```typescript
import { CTDiscovery, type AnalysisResult } from 'ctdiscovery';

const ctd = new CTDiscovery();
const analysis: AnalysisResult = await ctd.scanAndAnalyze();
```

---

## Best Practices

1. **Set Appropriate Timeouts**: Adjust timeout based on environment size
2. **Use Caching**: Enable caching for repeated scans
3. **Filter Results**: Filter tools by status or relevance for targeted analysis
4. **Handle Errors Gracefully**: Wrap scans in try-catch blocks
5. **Clear Cache**: Clear cache when environment changes significantly
6. **Use Specific Scanners**: Use individual scanners for targeted discovery

---

## See Also

- [Architecture Documentation](../ARCHITECTURE.md)
- [Integration Examples](../examples/)
- [VSCode Extension Guide](../extensions/vscode/README.md)
- [Main README](../README.md)
