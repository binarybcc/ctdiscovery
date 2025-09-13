# Claude Tool Discovery - User Guide

**Version**: v2.0.0  
**Branch**: `feature/claude-tools-cli-simple`  
**Last Updated**: 2025-09-12

## Overview

Claude Tool Discovery (CTDiscovery) is a comprehensive command-line tool that provides complete visibility into your Claude Code MCP (Model Context Protocol) environment. It discovers individual MCP tools, analyzes server health, and provides advanced filtering and inspection capabilities.

## Key Features

- **Individual Tool Discovery**: Lists every available MCP tool, not just servers
- **Real-time Data**: Integrates directly with Claude Code's MCP manager
- **Advanced Filtering**: Filter by server, search terms, permissions, and status
- **Multiple Output Formats**: JSON, table, CSV, markdown, and human-readable formats
- **Tool Inspection**: Detailed parameter and metadata analysis
- **Server Health Monitoring**: Connection status and configuration analysis

## Quick Start

### Prerequisites

- Claude Code CLI installed and configured
- Node.js 16+ installed
- At least one MCP server configured in Claude Code

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery

# Switch to the enhanced branch
git checkout feature/claude-tools-cli-simple

# Install dependencies
npm install
```

### Basic Usage

```bash
# List all available MCP tools
node src/cli.js --claude-tools-list

# List tools from a specific server
node src/cli.js --claude-tools-list --server github

# Search for specific tools
node src/cli.js --claude-tools-list --search "memory"

# Get detailed information about a specific tool
node src/cli.js --claude-tools-inspect get_issue

# Export tools to JSON format
node src/cli.js --claude-tools-list --format json > tools.json
```

## Command Reference

### Claude Tools List

**Purpose**: Discover and list individual MCP tools with advanced filtering

**Syntax**: 
```bash
node src/cli.js --claude-tools-list [options]
```

**Options**:
- `--server <name>`: Filter tools by MCP server name
- `--search <term>`: Search tools by name or description
- `--permissions <perm>`: Filter by permission requirements
- `--status <status>`: Filter by tool status (active, error, etc.)
- `--format <format>`: Output format (json, table, csv, markdown, human)

**Examples**:
```bash
# List all GitHub tools in table format
node src/cli.js --claude-tools-list --server github --format table

# Search for memory-related tools
node src/cli.js --claude-tools-list --search "memory" --format json

# Find tools requiring read permissions
node src/cli.js --claude-tools-list --permissions "read" --format human
```

### Claude Tools Inspect

**Purpose**: Get detailed information about a specific MCP tool

**Syntax**:
```bash
node src/cli.js --claude-tools-inspect <tool-name> [options]
```

**Options**:
- `--format <format>`: Output format (json, markdown, human)
- `--include-examples`: Include usage examples
- `--include-schema`: Include parameter schema details

**Examples**:
```bash
# Inspect GitHub's get_issue tool
node src/cli.js --claude-tools-inspect get_issue

# Get detailed schema information
node src/cli.js --claude-tools-inspect search_nodes --format json --include-schema

# Export tool documentation
node src/cli.js --claude-tools-inspect create_entities --format markdown > tool-docs.md
```

### MCP Servers (Original)

**Purpose**: List and analyze MCP server connections

**Syntax**:
```bash
node src/cli.js --mcp-servers [options]
```

**Options**:
- `--format <format>`: Output format (json, table, human)
- `--health-check`: Include connection health analysis

**Examples**:
```bash
# List all MCP servers
node src/cli.js --mcp-servers

# Export server information
node src/cli.js --mcp-servers --format json --health-check
```

## Output Formats

### JSON Format

Perfect for programmatic processing and integration with other tools.

```bash
node src/cli.js --claude-tools-list --format json
```

**Sample Output**:
```json
{
  "version": 1,
  "tools": [
    {
      "name": "mcp__github__get_issue",
      "displayName": "get_issue",
      "server": "github",
      "type": "mcp-tool",
      "status": "active",
      "metadata": {
        "description": "Get detailed information about a GitHub issue",
        "parameters": {
          "required": ["owner", "repo", "issue_number"],
          "optional": ["include_comments"]
        }
      }
    }
  ],
  "metadata": {
    "total": 20,
    "scanDuration": 8175,
    "byServer": {
      "github": 7,
      "memory": 3
    }
  }
}
```

### Table Format

Clean, organized display for terminal viewing.

```bash
node src/cli.js --claude-tools-list --format table
```

**Sample Output**:
```
┌─────────────────────────────┬──────────────┬─────────┬────────┬─────────────────────────────┐
│ Tool Name                   │ Server       │ Status  │ Type   │ Description                 │
├─────────────────────────────┼──────────────┼─────────┼────────┼─────────────────────────────┤
│ get_issue                   │ github       │ active  │ mcp    │ Get GitHub issue details    │
│ search_nodes                │ memory       │ active  │ mcp    │ Search memory nodes         │
│ sequentialthinking          │ thinking     │ active  │ mcp    │ Sequential reasoning tool   │
└─────────────────────────────┴──────────────┴─────────┴────────┴─────────────────────────────┘
```

### Human-Readable Format

Grouped by server with detailed information.

```bash
node src/cli.js --claude-tools-list --format human
```

**Sample Output**:
```
🔧 MCP Tool Discovery Results
═══════════════════════════════

📊 Summary: 20 tools found across 5 servers

🏠 GitHub Server (7 tools)
  ✅ get_issue - Get detailed information about a GitHub issue
  ✅ search_issues - Search GitHub issues with filters
  ✅ create_pull_request - Create new pull requests

🧠 Memory Server (3 tools)  
  ✅ search_nodes - Search through memory graph nodes
  ✅ create_entities - Create new memory entities
  ✅ add_observations - Add observations to entities
```

## Filtering and Search

### Server Filtering

Filter tools by their parent MCP server:

```bash
# Show only GitHub tools
node src/cli.js --claude-tools-list --server github

# Show only memory tools  
node src/cli.js --claude-tools-list --server memory

# Case-insensitive partial matching
node src/cli.js --claude-tools-list --server git  # matches "github"
```

### Text Search

Search across tool names, display names, and descriptions:

```bash
# Find all issue-related tools
node src/cli.js --claude-tools-list --search issue

# Search for memory functionality
node src/cli.js --claude-tools-list --search "memory"

# Find creation tools
node src/cli.js --claude-tools-list --search create
```

### Permission Filtering

Filter tools by their permission requirements:

```bash
# Find tools requiring read permissions
node src/cli.js --claude-tools-list --permissions read

# Find tools requiring write access
node src/cli.js --claude-tools-list --permissions write
```

### Status Filtering

Filter tools by their operational status:

```bash
# Show only active tools
node src/cli.js --claude-tools-list --status active

# Show tools with errors
node src/cli.js --claude-tools-list --status error
```

### Combined Filtering

Combine multiple filters for precise results:

```bash
# Active GitHub tools only
node src/cli.js --claude-tools-list --server github --status active

# Search for memory tools in JSON format
node src/cli.js --claude-tools-list --search memory --format json

# GitHub issue tools with read permissions
node src/cli.js --claude-tools-list --server github --search issue --permissions read
```

## Tool Inspection

### Basic Inspection

Get detailed information about any discovered tool:

```bash
# Inspect a specific tool
node src/cli.js --claude-tools-inspect get_issue
```

**Sample Output**:
```
🔍 Tool Inspection: get_issue
════════════════════════════════

📋 Basic Information
  Name: mcp__github__get_issue
  Display Name: get_issue
  Server: github
  Type: mcp-tool
  Status: ✅ active

📝 Description
  Get detailed information about a GitHub issue

⚙️ Parameters
  Required:
    • owner (string) - Repository owner
    • repo (string) - Repository name  
    • issue_number (number) - Issue number
  
  Optional:
    • include_comments (boolean) - Include issue comments
    • comment_limit (number) - Maximum comments to return

🔐 Permissions
  • read:repo - Repository read access required

💡 Usage Examples
  • Get issue #6574 from anthropics/claude-code repository
  • Retrieve issue details with comments for analysis
```

### Advanced Inspection

Include additional details and schema information:

```bash
# Get full schema details
node src/cli.js --claude-tools-inspect get_issue --include-schema --format json

# Export tool documentation
node src/cli.js --claude-tools-inspect search_nodes --format markdown > search-nodes-docs.md
```

## Workflow Integration

### CI/CD Integration

```bash
# Generate tools inventory for CI
node src/cli.js --claude-tools-list --format json > .github/tools-inventory.json

# Validate all tools are active
node src/cli.js --claude-tools-list --status error --format json | jq '.tools | length'
```

### Development Workflows

```bash
# Quick tool availability check
node src/cli.js --claude-tools-list --format table | head -20

# Debug MCP issues
node src/cli.js --mcp-servers --health-check --format human

# Find tools for specific tasks
node src/cli.js --claude-tools-list --search "create" --format human
```

### Documentation Generation

```bash
# Generate comprehensive tool documentation
for tool in $(node src/cli.js --claude-tools-list --format json | jq -r '.tools[].displayName'); do
  node src/cli.js --claude-tools-inspect "$tool" --format markdown > "docs/tools/$tool.md"
done
```

## Performance Optimization

### Fast Discovery

For quick results, the tool uses intelligent fallback strategies:

1. **Config File Parsing** (8.2s) - Primary method, fastest
2. **MCP Server Analysis** (15-30s) - Secondary method  
3. **Debug Output Parsing** (30-60s) - Fallback method

### Caching

Results are cached during scan sessions to avoid repeated expensive operations.

### Resource Management

- Timeout protection prevents hanging operations
- Memory-efficient processing for large tool sets
- Parallel scanning where possible

## Troubleshooting

### Common Issues

**No tools found**:
```bash
# Check if Claude Code is installed and accessible
claude --version

# Verify MCP servers are configured
claude mcp list

# Check configuration files exist
ls ~/.claude/settings.json
```

**Permission errors**:
```bash
# Ensure Claude Code CLI has proper permissions
claude mcp list

# Check if config files are readable
cat ~/.claude/settings.json | jq '.permissions.allow'
```

**Timeout errors**:
```bash
# Use faster config-based discovery
node src/cli.js --claude-tools-list --format json

# Check MCP server health
node src/cli.js --mcp-servers --health-check
```

### Debug Mode

For detailed troubleshooting information:

```bash
# Enable verbose output (if available)
DEBUG=* node src/cli.js --claude-tools-list

# Check tool discovery methods
node src/cli.js --claude-tools-list --format json | jq '.metadata'
```

### Getting Help

If you encounter issues:

1. Check the [Technical Specification](TECHNICAL-SPECIFICATION.md) for implementation details
2. Review the [API Reference](API-REFERENCE.md) for detailed method documentation  
3. See the [Troubleshooting Guide](TROUBLESHOOTING.md) for specific solutions
4. File issues at: https://github.com/your-org/ClaudeToolDiscovery/issues

## Best Practices

### Regular Tool Audits

```bash
# Weekly tool availability check
node src/cli.js --claude-tools-list --format table > weekly-audit.txt

# Monthly comprehensive analysis
node src/cli.js --claude-tools-list --format json > monthly-tools.json
node src/cli.js --mcp-servers --health-check --format json > monthly-servers.json
```

### Integration Testing

```bash
# Test tool discovery in CI/CD
if [ $(node src/cli.js --claude-tools-list --format json | jq '.tools | length') -eq 0 ]; then
  echo "ERROR: No MCP tools discovered"
  exit 1
fi
```

### Documentation Maintenance

```bash
# Keep tool documentation current
node src/cli.js --claude-tools-list --format json > docs/current-tools.json
```

## Advanced Usage

### Custom Output Processing

```bash
# Get tool count by server
node src/cli.js --claude-tools-list --format json | jq '.metadata.byServer'

# List only tool names
node src/cli.js --claude-tools-list --format json | jq -r '.tools[].displayName'

# Find tools with specific parameters
node src/cli.js --claude-tools-list --format json | jq '.tools[] | select(.metadata.parameters.required | contains(["owner"]))'
```

### Automation Scripts

```bash
#!/bin/bash
# Tool health monitoring script

echo "🔍 Checking MCP tool health..."

# Get tool count
TOOL_COUNT=$(node src/cli.js --claude-tools-list --format json | jq '.tools | length')
echo "📊 Total tools: $TOOL_COUNT"

# Check for errors
ERROR_COUNT=$(node src/cli.js --claude-tools-list --status error --format json | jq '.tools | length')
if [ $ERROR_COUNT -gt 0 ]; then
  echo "⚠️  Warning: $ERROR_COUNT tools have errors"
  node src/cli.js --claude-tools-list --status error --format table
fi

# Server health check
echo "🏥 Server health status:"
node src/cli.js --mcp-servers --health-check --format table
```

---

## Next Steps

- Explore the [API Reference](API-REFERENCE.md) for programmatic usage
- Review [Architecture Documentation](ARCHITECTURE.md) for implementation details
- Check [Examples and Tutorials](EXAMPLES.md) for advanced use cases
- See [Troubleshooting Guide](TROUBLESHOOTING.md) for issue resolution

For questions or support, please refer to our documentation or file an issue on GitHub.