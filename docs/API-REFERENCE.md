# Claude Tool Discovery - API Reference

**Version**: v2.0.0  
**Branch**: `feature/claude-tools-cli-simple`  
**Last Updated**: 2025-09-12

## Overview

This document provides comprehensive API reference documentation for Claude Tool Discovery's programmatic interfaces, including class methods, data structures, and integration patterns.

## Core Classes

### ClaudeToolDiscovery

Enhanced scanner that discovers individual MCP tools from all available sources.

**File**: `src/scanners/claude-tool-discovery.js`

#### Constructor

```javascript
const scanner = new ClaudeToolDiscovery();
```

**Properties**:
- `name`: "Claude Tool Discovery"
- `category`: "mcp-tool"
- `platform`: Current platform (darwin, win32, linux)
- `version`: "2.0.0"

#### Methods

##### `async validate()`

Validates that Claude Code CLI is available and accessible.

**Returns**: `Promise<ValidationResult>`

```javascript
{
  functional: boolean,     // Whether Claude CLI is available
  accessible: boolean,     // Whether Claude CLI is executable
  configured: boolean,     // Whether Claude CLI is properly configured
  duration: number,        // Validation time in milliseconds
  error?: string,          // Error message if validation failed
  requirements: string[]   // List of requirements for functionality
}
```

**Example**:
```javascript
const validation = await scanner.validate();
if (!validation.functional) {
  console.error(`Validation failed: ${validation.error}`);
}
```

##### `getCapabilities()`

Returns list of scanner capabilities.

**Returns**: `string[]`

```javascript
[
  'Discover individual MCP tools from all servers',
  'Extract tool parameters and descriptions',
  'Parse tool permissions and requirements',
  'Provide detailed tool inspection',
  'Support advanced filtering and search',
  'Real-time tool availability monitoring'
]
```

##### `async scan()`

Main discovery method that orchestrates tool detection from multiple sources.

**Returns**: `Promise<ScanResult>`

```javascript
{
  status: string,          // SCAN_STATUSES constant
  data: Tool[],           // Array of discovered tools
  method: {
    name: string,         // Scanner name
    status: string,       // Scan status
    duration: number,     // Scan time in milliseconds
    platform: string,    // Platform identifier
    sourceOfTruth: string // Data source identifier
  },
  overlaps: any[],        // Overlapping discoveries
  errors: string[],       // Error messages
  warnings: string[]      // Warning messages
}
```

**Example**:
```javascript
const results = await scanner.scan();
console.log(`Found ${results.data.length} tools in ${results.method.duration}ms`);
```

##### `filterTools(tools, filters)`

Applies filtering criteria to tool list.

**Parameters**:
- `tools`: `Tool[]` - Array of tools to filter
- `filters`: `FilterOptions` - Filtering criteria

**Returns**: `Tool[]`

**FilterOptions Schema**:
```javascript
{
  server?: string,        // Filter by server name (case-insensitive)
  search?: string,        // Search tool names and descriptions
  permissions?: string,   // Filter by permission requirements
  status?: string        // Filter by tool status
}
```

**Example**:
```javascript
const githubTools = scanner.filterTools(allTools, { server: 'github' });
const searchTools = scanner.filterTools(allTools, { search: 'memory' });
const activeTools = scanner.filterTools(allTools, { status: 'active' });
```

##### `async getSummary()`

Generates statistical summary of discovered tools.

**Returns**: `Promise<ToolSummary>`

```javascript
{
  total: number,          // Total tool count
  byServer: {             // Tools grouped by server
    [serverName]: number
  },
  byStatus: {             // Tools grouped by status
    [status]: number
  },
  byType: {               // Tools grouped by type
    [type]: number
  }
}
```

**Example**:
```javascript
const summary = await scanner.getSummary();
console.log(`Total: ${summary.total}, GitHub: ${summary.byServer.github}`);
```

#### Private Methods

##### `async _getToolsFromPermissions()`

Extracts tools from Claude's permission system using config files and debug output.

**Returns**: `Promise<Tool[]>`

**Discovery Strategy**:
1. Parse Claude configuration files (`~/.claude/settings.json`)
2. Fallback to debug output parsing with timeout protection
3. Return combined results

##### `async _getToolsFromMCPServers()`

Analyzes MCP server capabilities to infer available tools.

**Returns**: `Promise<Tool[]>`

**Process**:
1. Execute `claude mcp list` to get server connections
2. For each connected server, run `claude mcp get <name>`
3. Infer tools based on server type and configuration
4. Return inferred tool objects

##### `async _getToolsFromConfig()`

Directly parses Claude configuration files for tool permissions.

**Returns**: `Promise<Tool[]>`

**Configuration Paths**:
- `~/.claude/settings.json`
- `~/.claude/settings.local.json`
- `./claude/settings.local.json` (project-specific)

**Permission Pattern**: `mcp__<server>__<tool>`

##### `_mergeAndDeduplicateTools(permissionTools, mcpTools)`

Intelligently merges tools from different discovery sources.

**Parameters**:
- `permissionTools`: `Tool[]` - Tools from permission analysis
- `mcpTools`: `Tool[]` - Tools from server analysis

**Returns**: `Tool[]`

**Merge Strategy**:
1. Permission tools take priority (definite availability)
2. MCP server tools fill gaps
3. Metadata is merged from both sources
4. Duplicates are resolved by tool name

##### `async _enhanceToolMetadata(tool)`

Enhances tool objects with additional metadata and inferred details.

**Parameters**:
- `tool`: `Tool` - Basic tool object

**Returns**: `Promise<Tool>`

**Enhancements**:
- Parameter inference based on tool name patterns
- Description generation
- Permission analysis
- Usage example generation

### ClaudeMCPManager

Original scanner for MCP server discovery and health analysis.

**File**: `src/scanners/claude-mcp-manager.js`

#### Key Methods

##### `async scan()`

Discovers MCP servers and their connection status.

**Returns**: `Promise<ScanResult>`

##### `async _getServerList()`

Executes `claude mcp list` to get server connections.

**Returns**: `Promise<string>`

##### `_parseServerListLine(line)`

Parses individual server status lines.

**Parameters**:
- `line`: `string` - Raw server status line

**Returns**: `ServerInfo | null`

```javascript
{
  name: string,           // Server name
  connected: boolean,     // Connection status
  status: string,         // Status description
  rawLine: string        // Original line for reference
}
```

## Data Structures

### Tool Object Schema

Complete tool object structure returned by discovery methods:

```javascript
{
  // Basic identification
  name: string,              // Full tool identifier (mcp__server__tool)
  displayName: string,       // Human-readable name (tool part only)
  server: string,           // Parent MCP server name
  type: string,             // Tool category (mcp-tool)
  status: string,           // Operational status (active, error, etc.)
  source: string,           // Discovery method used
  
  // Enhanced metadata
  category?: string,         // Tool category
  sourceOfTruth?: boolean,   // Whether this is authoritative data
  
  metadata: {
    // Core identification
    serverName: string,      // Parent server name
    toolName: string,        // Tool name without prefixes
    fullToolId: string,      // Complete tool identifier
    
    // Discovery information
    discoveryMethod: string, // How this tool was found
    sourceOfTruth: string,   // Data source type
    configPath?: string,     // Config file path (if applicable)
    
    // Tool details
    description?: string,    // Tool description
    parameters?: {
      required: string[],    // Required parameter names
      optional: string[]     // Optional parameter names
    },
    permissions?: string[],  // Required permissions
    usageExamples?: string[], // Example use cases
    
    // Server analysis (if available)
    serverStatus?: string,   // Server connection status
    serverType?: string,     // Server type/category
    inferredFromServer?: boolean, // Whether tool was inferred
    serverAnalysis?: object, // Additional server metadata
    
    // Enhancement metadata
    enhancedAt?: string,     // Enhancement timestamp
    parametersDiscovered?: boolean,
    permissionsDiscovered?: boolean,
    usageExamplesGenerated?: boolean
  }
}
```

### ScanResult Schema

Standard result structure for all scan operations:

```javascript
{
  status: string,           // Success/failure status
  data: Tool[],            // Discovered tools/servers
  method: {
    name: string,          // Scanner name
    status: string,        // Scan status
    duration: number,      // Execution time (ms)
    platform: string,     // Platform identifier
    sourceOfTruth: string  // Data source description
  },
  overlaps: any[],         // Overlapping discoveries
  errors: string[],        // Error messages
  warnings: string[]       // Warning messages
}
```

### JSON Output Schema

Standardized JSON output format for CLI commands:

```javascript
{
  version: number,         // Schema version (currently 1)
  tools: Tool[],          // Array of tool objects
  metadata: {
    total: number,         // Total tool count
    scanStatus: string,    // Overall scan status
    scanDuration: number,  // Total scan time (ms)
    sourceOfTruth: string, // Primary data source
    filtersApplied: {      // Applied filter criteria
      server: string | null,
      search: string | null,
      permissions: string | null,
      status: string | null
    },
    byServer: {            // Tool count by server
      [serverName]: number
    }
  }
}
```

## Constants and Enums

### TOOL_STATUSES

Available tool status values:

```javascript
{
  ACTIVE: 'active',        // Tool is operational
  ERROR: 'error',          // Tool has errors
  INACTIVE: 'inactive',    // Tool is disabled
  UNKNOWN: 'unknown'       // Status cannot be determined
}
```

### TOOL_CATEGORIES

Tool category classifications:

```javascript
{
  MCP_TOOL: 'mcp-tool',    // MCP protocol tool
  SYSTEM_TOOL: 'system',   // System utility
  DEV_TOOL: 'development', // Development tool
  UNKNOWN: 'unknown'       // Unclassified tool
}
```

### SCAN_STATUSES

Scan operation status values:

```javascript
{
  SUCCESS: 'success',      // Scan completed successfully
  FAILED: 'failed',        // Scan failed
  PARTIAL: 'partial',      // Scan partially completed
  TIMEOUT: 'timeout'       // Scan timed out
}
```

## Error Handling

### Common Error Types

#### ValidationError

Thrown when Claude Code CLI is not available or configured:

```javascript
{
  name: 'ValidationError',
  message: 'Claude Code CLI not found or not executable',
  code: 'CLAUDE_CLI_MISSING'
}
```

#### TimeoutError

Thrown when operations exceed timeout limits:

```javascript
{
  name: 'TimeoutError', 
  message: 'Command timed out after 5000ms: claude mcp list',
  code: 'OPERATION_TIMEOUT'
}
```

#### ConfigurationError

Thrown when configuration files are invalid or inaccessible:

```javascript
{
  name: 'ConfigurationError',
  message: 'Cannot read Claude configuration file',
  code: 'CONFIG_ACCESS_ERROR'
}
```

### Error Recovery Strategies

The API implements graceful degradation with multiple fallback mechanisms:

1. **Config File Primary**: Fast permission parsing (8s typical)
2. **Server Analysis Secondary**: MCP server capability analysis (15-30s)
3. **Debug Output Fallback**: Debug command parsing (30-60s)
4. **Graceful Failure**: Return empty results with clear error messages

## Integration Patterns

### Basic Tool Discovery

```javascript
import { ClaudeToolDiscovery } from './src/scanners/claude-tool-discovery.js';

async function discoverTools() {
  const scanner = new ClaudeToolDiscovery();
  
  // Validate environment
  const validation = await scanner.validate();
  if (!validation.functional) {
    throw new Error(`Environment validation failed: ${validation.error}`);
  }
  
  // Discover tools
  const results = await scanner.scan();
  if (results.status !== 'success') {
    console.warn(`Scan completed with status: ${results.status}`);
    console.warn(`Errors: ${results.errors.join(', ')}`);
  }
  
  return results.data;
}
```

### Filtered Discovery

```javascript
async function getGitHubTools() {
  const scanner = new ClaudeToolDiscovery();
  const results = await scanner.scan();
  
  return scanner.filterTools(results.data, {
    server: 'github',
    status: 'active'
  });
}
```

### Tool Inspection

```javascript
async function inspectTool(toolName) {
  const scanner = new ClaudeToolDiscovery();
  const results = await scanner.scan();
  
  const tool = results.data.find(t => 
    t.displayName === toolName || t.name === toolName
  );
  
  if (!tool) {
    throw new Error(`Tool not found: ${toolName}`);
  }
  
  return tool;
}
```

### Statistical Analysis

```javascript
async function analyzeToolEnvironment() {
  const scanner = new ClaudeToolDiscovery();
  const summary = await scanner.getSummary();
  
  return {
    totalTools: summary.total,
    serverCount: Object.keys(summary.byServer).length,
    largestServer: Object.entries(summary.byServer)
      .sort(([,a], [,b]) => b - a)[0],
    activePercentage: (summary.byStatus.active || 0) / summary.total * 100
  };
}
```

### Custom Output Processing

```javascript
async function exportToolsToCustomFormat() {
  const scanner = new ClaudeToolDiscovery();
  const results = await scanner.scan();
  
  // Transform to custom format
  const customFormat = results.data.map(tool => ({
    id: tool.name,
    title: tool.displayName,
    provider: tool.server,
    available: tool.status === 'active',
    description: tool.metadata?.description || 'No description available',
    requiredParams: tool.metadata?.parameters?.required || [],
    permissions: tool.metadata?.permissions || []
  }));
  
  return customFormat;
}
```

## Performance Considerations

### Optimization Strategies

1. **Config-First Approach**: Prioritize fast config file parsing
2. **Timeout Management**: Prevent hanging on slow operations
3. **Caching**: Results cached during scan session
4. **Parallel Processing**: Multiple discovery methods run concurrently where possible

### Memory Usage

- Typical memory usage: 15-50MB depending on tool count
- Tool objects: ~2KB each on average
- Metadata enhancement adds ~1KB per tool

### Execution Time

| Operation | Typical Duration | Factors |
|-----------|------------------|---------|
| Config parsing | 1-8s | File size, permission count |
| Server analysis | 15-30s | Server count, network latency |
| Debug parsing | 30-60s | Debug output volume |
| Filtering | <100ms | Tool count, filter complexity |
| Enhancement | 1-5s | Tool count, inference complexity |

### Scalability Limits

- **Tool Count**: Tested up to 200+ tools
- **Server Count**: Tested up to 20+ servers  
- **Memory**: Linear growth with tool count
- **Performance**: Sub-linear degradation with scale

## Testing and Validation

### Unit Test Patterns

```javascript
import { ClaudeToolDiscovery } from '../src/scanners/claude-tool-discovery.js';

describe('ClaudeToolDiscovery', () => {
  let scanner;
  
  beforeEach(() => {
    scanner = new ClaudeToolDiscovery();
  });
  
  test('should validate Claude CLI availability', async () => {
    const validation = await scanner.validate();
    expect(validation).toHaveProperty('functional');
    expect(validation).toHaveProperty('duration');
  });
  
  test('should discover tools from config', async () => {
    const tools = await scanner._getToolsFromConfig();
    expect(Array.isArray(tools)).toBe(true);
    tools.forEach(tool => {
      expect(tool).toHaveProperty('name');
      expect(tool).toHaveProperty('server');
      expect(tool.name).toMatch(/^mcp__\w+__\w+$/);
    });
  });
  
  test('should filter tools correctly', () => {
    const tools = [
      { name: 'mcp__github__get_issue', server: 'github', status: 'active' },
      { name: 'mcp__memory__search_nodes', server: 'memory', status: 'active' }
    ];
    
    const filtered = scanner.filterTools(tools, { server: 'github' });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].server).toBe('github');
  });
});
```

### Integration Test Examples

```javascript
describe('Integration Tests', () => {
  test('should complete full scan workflow', async () => {
    const scanner = new ClaudeToolDiscovery();
    
    // Validate environment
    const validation = await scanner.validate();
    expect(validation.functional).toBe(true);
    
    // Perform scan
    const results = await scanner.scan();
    expect(results.status).toBe('success');
    expect(results.data.length).toBeGreaterThan(0);
    
    // Test filtering
    const githubTools = scanner.filterTools(results.data, { server: 'github' });
    expect(githubTools.length).toBeGreaterThanOrEqual(0);
    
    // Test summary
    const summary = await scanner.getSummary();
    expect(summary.total).toBe(results.data.length);
  });
});
```

## Migration Guide

### From v1.x to v2.0

**Breaking Changes**:
1. Tool objects now include enhanced metadata structure
2. New filtering API with object-based parameters
3. Updated JSON output schema with version field

**Migration Steps**:

```javascript
// v1.x (deprecated)
const tools = await scanner.getToolList();
const filtered = tools.filter(t => t.server === 'github');

// v2.0 (current)
const results = await scanner.scan();
const filtered = scanner.filterTools(results.data, { server: 'github' });
```

**New Features**:
- Individual tool discovery (vs server-only in v1.x)
- Advanced filtering and search capabilities
- Multiple output formats
- Enhanced metadata and tool inspection
- Improved error handling and fallback strategies

---

## Support and Resources

- **Technical Specification**: [TECHNICAL-SPECIFICATION.md](TECHNICAL-SPECIFICATION.md)
- **User Guide**: [USER-GUIDE.md](USER-GUIDE.md)
- **Examples**: [EXAMPLES.md](EXAMPLES.md)
- **Troubleshooting**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **GitHub Issues**: https://github.com/your-org/ClaudeToolDiscovery/issues

For questions about API usage or integration patterns, please refer to the documentation or file an issue with specific code examples.