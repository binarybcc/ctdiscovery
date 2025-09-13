# Claude Tool Discovery - Examples and Tutorials

**Version**: v2.0.0  
**Branch**: `feature/claude-tools-cli-simple`  
**Last Updated**: 2025-09-12

## Overview

This document provides comprehensive examples and tutorials for using Claude Tool Discovery in various scenarios. From basic tool enumeration to advanced integration workflows, these examples will help you master the tool's capabilities.

## Table of Contents

1. [Basic Examples](#basic-examples)
2. [Advanced Filtering](#advanced-filtering)
3. [Output Format Examples](#output-format-examples)
4. [Tool Inspection](#tool-inspection)
5. [Integration Workflows](#integration-workflows)
6. [Automation Scripts](#automation-scripts)
7. [CI/CD Integration](#cicd-integration)
8. [Troubleshooting Examples](#troubleshooting-examples)

## Basic Examples

### Example 1: First-Time Tool Discovery

Discover what MCP tools are available in your environment:

```bash
# List all available tools
node src/cli.js --claude-tools-list

# Expected output:
🔧 MCP Tool Discovery Results
═══════════════════════════════

📊 Summary: 20 tools found across 5 servers

🏠 GitHub Server (7 tools)
  ✅ get_issue - Get detailed information about a GitHub issue
  ✅ search_issues - Search GitHub issues with filters
  ✅ create_pull_request - Create new pull requests
  ✅ get_pull_request - Get pull request details
  ✅ list_commits - List repository commits
  ✅ create_issue - Create new GitHub issues
  ✅ update_issue - Update existing issues

🧠 Memory Server (3 tools)
  ✅ search_nodes - Search through memory graph nodes
  ✅ create_entities - Create new memory entities
  ✅ add_observations - Add observations to entities

🤖 Sequential Thinking Server (1 tool)
  ✅ sequentialthinking - Multi-step reasoning tool

📚 Context7 Server (2 tools)
  ✅ resolve-library-id - Resolve library identifiers
  ✅ get-library-docs - Get library documentation

🌊 Flow Nexus Server (7 tools)
  ✅ swarm_init - Initialize AI swarms
  ✅ agent_spawn - Create specialized agents
  ✅ task_orchestrate - Orchestrate complex tasks
  ✅ memory_usage - Manage persistent memory
  ✅ neural_train - Train neural patterns
  ✅ performance_report - Generate performance reports
  ✅ github_repo_analyze - Analyze GitHub repositories
```

### Example 2: Quick Server Overview

Get a quick overview of your MCP servers:

```bash
# List MCP servers
node src/cli.js --mcp-servers

# Expected output:
🔧 MCP Server Discovery Results
═══════════════════════════════

📊 Summary: 5 servers found

🏠 Servers:
  ✅ github - GitHub integration server (Connected)
  ✅ memory - Memory management server (Connected)
  ✅ sequential-thinking - Sequential reasoning server (Connected)
  ✅ context7 - Documentation library server (Connected)
  ✅ claude-flow - AI orchestration server (Connected)

📈 Health Status: All servers operational
```

### Example 3: Tool Count by Server

See how many tools each server provides:

```bash
# Get tool summary
node src/cli.js --claude-tools-list --format json | jq '.metadata.byServer'

# Expected output:
{
  "github": 7,
  "memory": 3,
  "sequential-thinking": 1,
  "context7": 2,
  "claude-flow": 7
}
```

## Advanced Filtering

### Example 4: Server-Specific Tool Discovery

Focus on tools from a specific server:

```bash
# GitHub tools only
node src/cli.js --claude-tools-list --server github --format table

# Expected output:
┌─────────────────────────────┬──────────────┬─────────┬────────┬─────────────────────────────┐
│ Tool Name                   │ Server       │ Status  │ Type   │ Description                 │
├─────────────────────────────┼──────────────┼─────────┼────────┼─────────────────────────────┤
│ get_issue                   │ github       │ active  │ mcp    │ Get GitHub issue details    │
│ search_issues               │ github       │ active  │ mcp    │ Search GitHub issues        │
│ create_pull_request         │ github       │ active  │ mcp    │ Create new pull requests    │
│ get_pull_request           │ github       │ active  │ mcp    │ Get pull request details    │
│ list_commits               │ github       │ active  │ mcp    │ List repository commits     │
│ create_issue               │ github       │ active  │ mcp    │ Create new GitHub issues    │
│ update_issue               │ github       │ active  │ mcp    │ Update existing issues      │
└─────────────────────────────┴──────────────┴─────────┴────────┴─────────────────────────────┘
```

### Example 5: Search for Specific Functionality

Find tools related to specific tasks:

```bash
# Search for memory-related tools
node src/cli.js --claude-tools-list --search "memory"

# Expected output:
🔧 MCP Tool Discovery Results (Filtered)
═══════════════════════════════════════

📊 Summary: 3 tools found (filtered by search: "memory")

🧠 Memory Server (3 tools)
  ✅ search_nodes - Search through memory graph nodes
  ✅ create_entities - Create new memory entities
  ✅ add_observations - Add observations to entities

🌊 Flow Nexus Server (1 tool)
  ✅ memory_usage - Manage persistent memory

# Search for creation tools
node src/cli.js --claude-tools-list --search "create" --format table

# Search for issue-related tools
node src/cli.js --claude-tools-list --search "issue" --server github
```

### Example 6: Complex Multi-Filter Queries

Combine multiple filters for precise results:

```bash
# Active GitHub tools related to issues
node src/cli.js --claude-tools-list --server github --search "issue" --status active --format json

# Memory tools with write permissions
node src/cli.js --claude-tools-list --server memory --permissions "write" --format table

# All creation tools across servers
node src/cli.js --claude-tools-list --search "create" --format human
```

## Output Format Examples

### Example 7: JSON Export for Processing

Export tool data for programmatic processing:

```bash
# Export all tools to JSON
node src/cli.js --claude-tools-list --format json > tools-inventory.json

# Process with jq to extract specific information
cat tools-inventory.json | jq '.tools[] | select(.server == "github") | .name'

# Get tool descriptions
cat tools-inventory.json | jq '.tools[] | {name: .displayName, description: .metadata.description}'

# Count tools by status
cat tools-inventory.json | jq '.tools | group_by(.status) | map({status: .[0].status, count: length})'
```

**Sample JSON Output**:
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
      "source": "config-file",
      "metadata": {
        "serverName": "github",
        "toolName": "get_issue",
        "fullToolId": "mcp__github__get_issue",
        "description": "Get detailed information about a GitHub issue",
        "parameters": {
          "required": ["owner", "repo", "issue_number"],
          "optional": ["include_comments", "comment_limit"]
        },
        "permissions": ["read:repo"],
        "usageExamples": [
          "Get issue #6574 from anthropics/claude-code repository"
        ],
        "discoveryMethod": "config-parsing",
        "sourceOfTruth": "claude-config-file"
      }
    }
  ],
  "metadata": {
    "total": 20,
    "scanStatus": "success",
    "scanDuration": 8175,
    "sourceOfTruth": "claude-tool-discovery",
    "filtersApplied": {
      "server": null,
      "search": null,
      "permissions": null,
      "status": null
    },
    "byServer": {
      "github": 7,
      "memory": 3,
      "sequential-thinking": 1,
      "context7": 2,
      "claude-flow": 7
    }
  }
}
```

### Example 8: CSV Export for Spreadsheets

Export to CSV for analysis in spreadsheet applications:

```bash
# Export to CSV
node src/cli.js --claude-tools-list --format csv > tools.csv

# View CSV content
cat tools.csv
```

**Sample CSV Output**:
```csv
Name,Display Name,Server,Type,Status,Description
mcp__github__get_issue,get_issue,github,mcp-tool,active,"Get detailed information about a GitHub issue"
mcp__github__search_issues,search_issues,github,mcp-tool,active,"Search GitHub issues with filters"
mcp__memory__search_nodes,search_nodes,memory,mcp-tool,active,"Search through memory graph nodes"
```

### Example 9: Markdown Documentation

Generate documentation in Markdown format:

```bash
# Export to markdown
node src/cli.js --claude-tools-list --format markdown > TOOLS.md

# Export server-specific documentation
node src/cli.js --claude-tools-list --server github --format markdown > GITHUB-TOOLS.md
```

**Sample Markdown Output**:
```markdown
# MCP Tools Inventory

**Generated**: 2025-09-12  
**Total Tools**: 20  
**Servers**: 5  

## GitHub Server (7 tools)

### get_issue
- **Status**: ✅ Active
- **Description**: Get detailed information about a GitHub issue
- **Required Parameters**: owner, repo, issue_number
- **Permissions**: read:repo

### search_issues  
- **Status**: ✅ Active
- **Description**: Search GitHub issues with filters
- **Required Parameters**: query
- **Optional Parameters**: limit, offset
```

## Tool Inspection

### Example 10: Detailed Tool Analysis

Get comprehensive information about specific tools:

```bash
# Inspect GitHub's get_issue tool
node src/cli.js --claude-tools-inspect get_issue

# Expected output:
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

🔧 Technical Details
  Source: config-file
  Discovery Method: config-parsing
  Enhanced At: 2025-09-12T10:30:00Z
```

### Example 11: Tool Inspection in Different Formats

Export tool documentation in various formats:

```bash
# JSON format for API integration
node src/cli.js --claude-tools-inspect search_nodes --format json

# Markdown format for documentation
node src/cli.js --claude-tools-inspect create_entities --format markdown > create-entities-docs.md

# Human-readable format for quick reference
node src/cli.js --claude-tools-inspect memory_usage --format human
```

### Example 12: Batch Tool Inspection

Inspect multiple tools systematically:

```bash
# Get all GitHub tool names
GITHUB_TOOLS=$(node src/cli.js --claude-tools-list --server github --format json | jq -r '.tools[].displayName')

# Inspect each tool
for tool in $GITHUB_TOOLS; do
  echo "=== Inspecting $tool ==="
  node src/cli.js --claude-tools-inspect "$tool" --format human
  echo
done
```

## Integration Workflows

### Example 13: Development Environment Assessment

Assess your development environment's MCP capabilities:

```bash
#!/bin/bash
# dev-environment-assessment.sh

echo "🔍 Development Environment MCP Assessment"
echo "========================================"
echo

# Check Claude Code installation
echo "1. Claude Code CLI Status:"
if command -v claude &> /dev/null; then
  echo "  ✅ Claude Code CLI: $(claude --version)"
else
  echo "  ❌ Claude Code CLI: Not found"
  exit 1
fi
echo

# Check MCP servers
echo "2. MCP Server Health:"
node src/cli.js --mcp-servers --format table
echo

# Tool inventory
echo "3. Tool Inventory:"
TOOL_COUNT=$(node src/cli.js --claude-tools-list --format json | jq '.metadata.total')
echo "  📊 Total tools available: $TOOL_COUNT"
echo

# By server breakdown
echo "4. Tools by Server:"
node src/cli.js --claude-tools-list --format json | jq -r '.metadata.byServer | to_entries[] | "  \(.key): \(.value) tools"'
echo

# Check for essential tools
echo "5. Essential Tool Check:"
ESSENTIAL_TOOLS=("get_issue" "search_nodes" "sequentialthinking")
for tool in "${ESSENTIAL_TOOLS[@]}"; do
  if node src/cli.js --claude-tools-list --format json | jq -e ".tools[] | select(.displayName == \"$tool\")" > /dev/null; then
    echo "  ✅ $tool: Available"
  else
    echo "  ❌ $tool: Missing"
  fi
done
```

### Example 14: Project Setup Validation

Validate MCP tools for a specific project type:

```bash
#!/bin/bash
# validate-project-tools.sh

PROJECT_TYPE=$1
if [ -z "$PROJECT_TYPE" ]; then
  echo "Usage: $0 <project-type>"
  echo "Project types: web-dev, data-science, documentation"
  exit 1
fi

echo "🚀 Validating MCP tools for $PROJECT_TYPE project"
echo "================================================"

case $PROJECT_TYPE in
  "web-dev")
    REQUIRED_TOOLS=("get_issue" "create_pull_request" "search_issues")
    RECOMMENDED_SERVERS=("github" "memory")
    ;;
  "data-science")
    REQUIRED_TOOLS=("sequentialthinking" "memory_usage" "create_entities")
    RECOMMENDED_SERVERS=("sequential-thinking" "memory" "claude-flow")
    ;;
  "documentation")
    REQUIRED_TOOLS=("get-library-docs" "resolve-library-id" "create_entities")
    RECOMMENDED_SERVERS=("context7" "memory")
    ;;
  *)
    echo "❌ Unknown project type: $PROJECT_TYPE"
    exit 1
    ;;
esac

# Check required tools
echo "📋 Required tools check:"
for tool in "${REQUIRED_TOOLS[@]}"; do
  if node src/cli.js --claude-tools-list --format json | jq -e ".tools[] | select(.displayName == \"$tool\")" > /dev/null; then
    echo "  ✅ $tool"
  else
    echo "  ❌ $tool (MISSING)"
  fi
done

# Check recommended servers
echo
echo "🏠 Recommended servers check:"
for server in "${RECOMMENDED_SERVERS[@]}"; do
  if node src/cli.js --mcp-servers --format json | jq -e ".servers[] | select(.name == \"$server\" and .status == \"Connected\")" > /dev/null 2>&1; then
    echo "  ✅ $server"
  else
    echo "  ⚠️  $server (not connected or missing)"
  fi
done
```

### Example 15: Tool Usage Analytics

Track and analyze tool usage patterns:

```bash
#!/bin/bash
# tool-usage-analytics.sh

ANALYTICS_DIR="./analytics"
mkdir -p "$ANALYTICS_DIR"

echo "📊 Generating MCP Tool Usage Analytics"
echo "====================================="

# Current tool inventory
echo "📋 Creating current inventory..."
node src/cli.js --claude-tools-list --format json > "$ANALYTICS_DIR/current-tools.json"

# Tool count trends
echo "📈 Tool count by server:"
node src/cli.js --claude-tools-list --format json | jq '.metadata.byServer' > "$ANALYTICS_DIR/tools-by-server.json"

# Server health report
echo "🏥 Server health analysis:"
node src/cli.js --mcp-servers --format json > "$ANALYTICS_DIR/server-health.json"

# Generate summary report
cat > "$ANALYTICS_DIR/summary-report.md" << EOF
# MCP Environment Summary Report

**Generated**: $(date)
**Total Tools**: $(jq '.metadata.total' "$ANALYTICS_DIR/current-tools.json")
**Active Servers**: $(jq '.servers | length' "$ANALYTICS_DIR/server-health.json" 2>/dev/null || echo "N/A")

## Tool Distribution

$(jq -r '.metadata.byServer | to_entries[] | "- **\(.key)**: \(.value) tools"' "$ANALYTICS_DIR/current-tools.json")

## Server Status

$(jq -r '.servers[]? | "- **\(.name)**: \(.status)"' "$ANALYTICS_DIR/server-health.json" 2>/dev/null || echo "Server data not available")

## Tool Details

$(jq -r '.tools[] | "### \(.displayName) (\(.server))\n\(.metadata.description // "No description")\n"' "$ANALYTICS_DIR/current-tools.json")
EOF

echo "✅ Analytics generated in $ANALYTICS_DIR/"
echo "📄 View summary: cat $ANALYTICS_DIR/summary-report.md"
```

## Automation Scripts

### Example 16: Daily Tool Health Monitor

Automated daily monitoring script:

```bash
#!/bin/bash
# daily-tool-monitor.sh

LOG_DIR="./logs"
mkdir -p "$LOG_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
LOG_FILE="$LOG_DIR/tool-health-$TIMESTAMP.log"

echo "🔍 Daily MCP Tool Health Monitor - $(date)" | tee "$LOG_FILE"
echo "=========================================" | tee -a "$LOG_FILE"

# Function to log with timestamp
log() {
  echo "$(date +'%H:%M:%S') $1" | tee -a "$LOG_FILE"
}

# Check Claude Code CLI
log "📋 Checking Claude Code CLI..."
if claude --version &> /dev/null; then
  log "✅ Claude Code CLI: Available"
else
  log "❌ Claude Code CLI: Not available"
  exit 1
fi

# Check MCP servers
log "🏠 Checking MCP servers..."
SERVER_COUNT=$(node src/cli.js --mcp-servers --format json 2>/dev/null | jq '.servers | length' 2>/dev/null || echo 0)
log "📊 Active servers: $SERVER_COUNT"

if [ "$SERVER_COUNT" -eq 0 ]; then
  log "⚠️  Warning: No MCP servers detected"
fi

# Check tool discovery
log "🔧 Running tool discovery..."
TOOL_RESULT=$(node src/cli.js --claude-tools-list --format json 2>/dev/null)
if [ $? -eq 0 ]; then
  TOOL_COUNT=$(echo "$TOOL_RESULT" | jq '.metadata.total' 2>/dev/null || echo 0)
  SCAN_DURATION=$(echo "$TOOL_RESULT" | jq '.metadata.scanDuration' 2>/dev/null || echo 0)
  log "✅ Tool discovery: $TOOL_COUNT tools found in ${SCAN_DURATION}ms"
  
  # Check for errors
  ERROR_COUNT=$(echo "$TOOL_RESULT" | jq '.tools[] | select(.status == "error") | length' 2>/dev/null || echo 0)
  if [ "$ERROR_COUNT" -gt 0 ]; then
    log "⚠️  Warning: $ERROR_COUNT tools have errors"
  fi
else
  log "❌ Tool discovery failed"
fi

# Archive old logs (keep last 7 days)
find "$LOG_DIR" -name "tool-health-*.log" -mtime +7 -delete

log "✅ Health check completed"
log "📄 Log saved to: $LOG_FILE"
```

### Example 17: Tool Configuration Backup

Backup and restore tool configurations:

```bash
#!/bin/bash
# tool-config-backup.sh

BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="mcp-config-$TIMESTAMP"

echo "💾 Creating MCP configuration backup: $BACKUP_NAME"
echo "================================================="

# Create backup directory
BACKUP_PATH="$BACKUP_DIR/$BACKUP_NAME"
mkdir -p "$BACKUP_PATH"

# Backup Claude configuration
echo "📋 Backing up Claude configurations..."
if [ -f "$HOME/.claude/settings.json" ]; then
  cp "$HOME/.claude/settings.json" "$BACKUP_PATH/settings.json"
  echo "  ✅ Global settings backed up"
fi

if [ -f "$HOME/.claude/settings.local.json" ]; then
  cp "$HOME/.claude/settings.local.json" "$BACKUP_PATH/settings.local.json"
  echo "  ✅ Local settings backed up"
fi

# Backup current tool inventory
echo "🔧 Backing up tool inventory..."
node src/cli.js --claude-tools-list --format json > "$BACKUP_PATH/tools-inventory.json"
node src/cli.js --mcp-servers --format json > "$BACKUP_PATH/servers-status.json" 2>/dev/null

# Create backup manifest
cat > "$BACKUP_PATH/manifest.json" << EOF
{
  "backup_name": "$BACKUP_NAME",
  "timestamp": "$(date -Iseconds)",
  "tool_count": $(jq '.metadata.total' "$BACKUP_PATH/tools-inventory.json" 2>/dev/null || echo 0),
  "server_count": $(jq '.servers | length' "$BACKUP_PATH/servers-status.json" 2>/dev/null || echo 0),
  "files": [
    "settings.json",
    "settings.local.json",
    "tools-inventory.json",
    "servers-status.json",
    "manifest.json"
  ]
}
EOF

# Create archive
echo "📦 Creating archive..."
tar -czf "$BACKUP_DIR/$BACKUP_NAME.tar.gz" -C "$BACKUP_DIR" "$BACKUP_NAME"
rm -rf "$BACKUP_PATH"

echo "✅ Backup completed: $BACKUP_DIR/$BACKUP_NAME.tar.gz"

# List recent backups
echo
echo "📚 Recent backups:"
ls -lah "$BACKUP_DIR"/*.tar.gz | tail -5
```

## CI/CD Integration

### Example 18: GitHub Actions Integration

GitHub Actions workflow for tool validation:

```yaml
# .github/workflows/mcp-tool-validation.yml
name: MCP Tool Validation

on:
  push:
    branches: [ main, feature/* ]
  pull_request:
    branches: [ main ]
  schedule:
    - cron: '0 8 * * *'  # Daily at 8 AM

jobs:
  validate-tools:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout repository
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm install
      
    - name: Setup Claude Code CLI
      run: |
        # Install Claude Code CLI (replace with actual installation)
        curl -fsSL https://claude.ai/install.sh | bash
        echo "$HOME/.claude/bin" >> $GITHUB_PATH
        
    - name: Configure MCP servers
      run: |
        mkdir -p ~/.claude
        cat > ~/.claude/settings.json << EOF
        {
          "permissions": {
            "allow": [
              "mcp__github__get_issue",
              "mcp__github__search_issues",
              "mcp__memory__search_nodes"
            ]
          }
        }
        EOF
        
    - name: Validate tool discovery
      run: |
        node src/cli.js --claude-tools-list --format json > tools.json
        
        # Validate minimum tool count
        TOOL_COUNT=$(jq '.metadata.total' tools.json)
        if [ "$TOOL_COUNT" -lt 3 ]; then
          echo "❌ Expected at least 3 tools, found $TOOL_COUNT"
          exit 1
        fi
        
        echo "✅ Tool discovery successful: $TOOL_COUNT tools found"
        
    - name: Validate specific tools
      run: |
        # Check for critical tools
        CRITICAL_TOOLS=("get_issue" "search_nodes")
        for tool in "${CRITICAL_TOOLS[@]}"; do
          if ! jq -e ".tools[] | select(.displayName == \"$tool\")" tools.json > /dev/null; then
            echo "❌ Critical tool missing: $tool"
            exit 1
          fi
          echo "✅ Critical tool found: $tool"
        done
        
    - name: Generate tool report
      run: |
        echo "# MCP Tool Validation Report" > tool-report.md
        echo "**Generated**: $(date)" >> tool-report.md
        echo "**Commit**: ${{ github.sha }}" >> tool-report.md
        echo "" >> tool-report.md
        
        # Add summary
        TOOL_COUNT=$(jq '.metadata.total' tools.json)
        echo "## Summary" >> tool-report.md
        echo "- **Total Tools**: $TOOL_COUNT" >> tool-report.md
        echo "- **Scan Duration**: $(jq '.metadata.scanDuration' tools.json)ms" >> tool-report.md
        echo "" >> tool-report.md
        
        # Add tool list
        echo "## Available Tools" >> tool-report.md
        jq -r '.tools[] | "- **\(.displayName)** (\(.server)): \(.metadata.description // "No description")"' tools.json >> tool-report.md
        
    - name: Upload artifacts
      uses: actions/upload-artifact@v3
      with:
        name: tool-validation-report
        path: |
          tools.json
          tool-report.md
          
    - name: Comment PR (if applicable)
      if: github.event_name == 'pull_request'
      uses: actions/github-script@v6
      with:
        script: |
          const fs = require('fs');
          const report = fs.readFileSync('tool-report.md', 'utf8');
          
          github.rest.issues.createComment({
            issue_number: context.issue.number,
            owner: context.repo.owner,
            repo: context.repo.repo,
            body: `## MCP Tool Validation Results\n\n${report}`
          });
```

### Example 19: Docker Integration for Testing

Dockerfile for testing tool discovery in isolation:

```dockerfile
# Dockerfile.testing
FROM node:18-alpine

# Install required tools
RUN apk add --no-cache git bash curl jq

# Create working directory
WORKDIR /app

# Copy application
COPY . .

# Install dependencies
RUN npm install

# Create test configuration
RUN mkdir -p ~/.claude && \
    echo '{"permissions":{"allow":["mcp__github__get_issue","mcp__memory__search_nodes"]}}' > ~/.claude/settings.json

# Install Claude Code CLI (mock for testing)
RUN mkdir -p /usr/local/bin && \
    cat > /usr/local/bin/claude << 'EOF' && \
#!/bin/bash
case "$1" in
  "--version")
    echo "Claude Code CLI v1.0.0"
    ;;
  "mcp")
    case "$2" in
      "list")
        echo "github: ✓ Connected"
        echo "memory: ✓ Connected"
        ;;
      "get")
        echo "Status: Connected"
        echo "Type: MCP Server"
        ;;
    esac
    ;;
esac
EOF
chmod +x /usr/local/bin/claude

# Test script
RUN cat > test-tools.sh << 'EOF' && \
#!/bin/bash
set -e

echo "🧪 Testing MCP Tool Discovery"
echo "============================="

# Test basic discovery
echo "1. Testing basic tool discovery..."
node src/cli.js --claude-tools-list --format json > test-results.json

# Validate results
TOOL_COUNT=$(jq '.metadata.total' test-results.json)
echo "   Found $TOOL_COUNT tools"

if [ "$TOOL_COUNT" -lt 2 ]; then
  echo "   ❌ Expected at least 2 tools"
  exit 1
fi

# Test formatting
echo "2. Testing output formats..."
node src/cli.js --claude-tools-list --format table > /dev/null
node src/cli.js --claude-tools-list --format csv > /dev/null
node src/cli.js --claude-tools-list --format human > /dev/null

# Test filtering
echo "3. Testing filtering..."
node src/cli.js --claude-tools-list --server github --format json > github-tools.json
GITHUB_COUNT=$(jq '.metadata.total' github-tools.json)
echo "   Found $GITHUB_COUNT GitHub tools"

echo "✅ All tests passed!"
EOF
chmod +x test-tools.sh

# Default command
CMD ["./test-tools.sh"]
```

**Usage**:
```bash
# Build test image
docker build -f Dockerfile.testing -t claude-tool-discovery-test .

# Run tests
docker run --rm claude-tool-discovery-test

# Interactive testing
docker run --rm -it claude-tool-discovery-test bash
```

## Troubleshooting Examples

### Example 20: Diagnostic Script

Comprehensive diagnostic script for troubleshooting:

```bash
#!/bin/bash
# diagnose-issues.sh

echo "🔍 Claude Tool Discovery Diagnostic Script"
echo "=========================================="
echo

# Function to check command availability
check_command() {
  if command -v "$1" &> /dev/null; then
    echo "  ✅ $1: Available"
    if [ "$1" = "claude" ]; then
      echo "     Version: $(claude --version 2>/dev/null || echo 'Unknown')"
    elif [ "$1" = "node" ]; then
      echo "     Version: $(node --version)"
    fi
  else
    echo "  ❌ $1: Not found"
    return 1
  fi
}

# 1. Check prerequisites
echo "1. Prerequisites Check:"
check_command "node"
check_command "npm"
check_command "git"
check_command "claude"
echo

# 2. Check Node.js version
echo "2. Node.js Version Check:"
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -ge 16 ]; then
  echo "  ✅ Node.js version: $NODE_VERSION (>= 16)"
else
  echo "  ❌ Node.js version: $NODE_VERSION (< 16)"
  echo "     Please upgrade to Node.js 16 or higher"
fi
echo

# 3. Check Claude configuration
echo "3. Claude Configuration Check:"
if [ -f "$HOME/.claude/settings.json" ]; then
  echo "  ✅ Global settings file exists"
  if jq empty "$HOME/.claude/settings.json" 2>/dev/null; then
    echo "  ✅ Global settings file is valid JSON"
    PERMISSION_COUNT=$(jq '.permissions.allow | length' "$HOME/.claude/settings.json" 2>/dev/null || echo 0)
    echo "     Permissions configured: $PERMISSION_COUNT"
  else
    echo "  ❌ Global settings file is invalid JSON"
  fi
else
  echo "  ⚠️  Global settings file not found"
fi

if [ -f "$HOME/.claude/settings.local.json" ]; then
  echo "  ✅ Local settings file exists"
fi
echo

# 4. Check MCP servers
echo "4. MCP Server Check:"
if command -v claude &> /dev/null; then
  MCP_OUTPUT=$(claude mcp list 2>&1)
  if [ $? -eq 0 ]; then
    echo "  ✅ MCP command accessible"
    echo "$MCP_OUTPUT" | while read -r line; do
      if [[ "$line" == *"Connected"* ]]; then
        echo "  ✅ $line"
      elif [[ "$line" == *":"* ]] && [[ "$line" != *"Checking"* ]]; then
        echo "  ⚠️  $line"
      fi
    done
  else
    echo "  ❌ MCP command failed"
    echo "     Error: $MCP_OUTPUT"
  fi
else
  echo "  ❌ Claude CLI not available"
fi
echo

# 5. Check project structure
echo "5. Project Structure Check:"
if [ -f "src/cli.js" ]; then
  echo "  ✅ Main CLI file exists"
else
  echo "  ❌ Main CLI file missing (src/cli.js)"
fi

if [ -f "src/scanners/claude-tool-discovery.js" ]; then
  echo "  ✅ Tool discovery scanner exists"
else
  echo "  ❌ Tool discovery scanner missing"
fi

if [ -f "package.json" ]; then
  echo "  ✅ Package.json exists"
  if npm list --depth=0 &> /dev/null; then
    echo "  ✅ Dependencies installed"
  else
    echo "  ⚠️  Dependencies may need installation"
    echo "     Run: npm install"
  fi
else
  echo "  ❌ Package.json missing"
fi
echo

# 6. Test basic functionality
echo "6. Functionality Test:"
if [ -f "src/cli.js" ]; then
  echo "  Testing help command..."
  if node src/cli.js --help &> /dev/null; then
    echo "  ✅ Help command works"
  else
    echo "  ❌ Help command failed"
  fi
  
  echo "  Testing tool discovery..."
  DISCOVERY_OUTPUT=$(node src/cli.js --claude-tools-list --format json 2>&1)
  if [ $? -eq 0 ]; then
    TOOL_COUNT=$(echo "$DISCOVERY_OUTPUT" | jq '.metadata.total' 2>/dev/null || echo 0)
    echo "  ✅ Tool discovery works ($TOOL_COUNT tools found)"
  else
    echo "  ❌ Tool discovery failed"
    echo "     Error: $DISCOVERY_OUTPUT"
  fi
else
  echo "  ❌ Cannot test - CLI file missing"
fi
echo

# 7. Generate diagnostic report
echo "7. Generating Diagnostic Report:"
REPORT_FILE="diagnostic-report-$(date +%Y%m%d_%H%M%S).txt"
{
  echo "Claude Tool Discovery Diagnostic Report"
  echo "Generated: $(date)"
  echo "======================================"
  echo
  echo "System Information:"
  echo "- OS: $(uname -s) $(uname -r)"
  echo "- Node.js: $(node --version 2>/dev/null || echo 'Not available')"
  echo "- NPM: $(npm --version 2>/dev/null || echo 'Not available')"
  echo "- Claude CLI: $(claude --version 2>/dev/null || echo 'Not available')"
  echo
  echo "File Structure:"
  find . -name "*.js" -type f | head -10
  echo
  echo "Dependencies:"
  npm list --depth=0 2>/dev/null || echo "Dependencies not available"
} > "$REPORT_FILE"

echo "  📄 Report saved to: $REPORT_FILE"
echo

echo "🎯 Diagnostic Complete!"
echo "If issues persist, please share the diagnostic report when filing an issue."
```

### Example 21: Permission Recovery Script

Script to recover from permission-related issues:

```bash
#!/bin/bash
# permission-recovery.sh

echo "🔧 Claude Tool Discovery Permission Recovery"
echo "==========================================="
echo

# Backup existing configurations
echo "📋 Backing up existing configurations..."
BACKUP_DIR="./config-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

if [ -f "$HOME/.claude/settings.json" ]; then
  cp "$HOME/.claude/settings.json" "$BACKUP_DIR/"
  echo "  ✅ Global settings backed up"
fi

if [ -f "$HOME/.claude/settings.local.json" ]; then
  cp "$HOME/.claude/settings.local.json" "$BACKUP_DIR/"
  echo "  ✅ Local settings backed up"
fi

# Create minimal working configuration
echo "🔨 Creating minimal working configuration..."
mkdir -p "$HOME/.claude"

cat > "$HOME/.claude/settings.local.json" << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__github__get_issue",
      "mcp__github__search_issues",
      "mcp__github__create_issue",
      "mcp__memory__search_nodes",
      "mcp__memory__create_entities",
      "mcp__memory__add_observations",
      "mcp__sequential-thinking__sequentialthinking",
      "mcp__context7__resolve-library-id",
      "mcp__context7__get-library-docs",
      "mcp__claude-flow__swarm_init",
      "mcp__claude-flow__agent_spawn",
      "mcp__claude-flow__task_orchestrate"
    ]
  }
}
EOF

echo "  ✅ Minimal configuration created"

# Test configuration
echo "🧪 Testing new configuration..."
sleep 2

TOOL_COUNT=$(node src/cli.js --claude-tools-list --format json 2>/dev/null | jq '.metadata.total' 2>/dev/null || echo 0)

if [ "$TOOL_COUNT" -gt 0 ]; then
  echo "  ✅ Configuration working: $TOOL_COUNT tools discovered"
  echo
  echo "🎉 Recovery successful!"
  echo "   Backup saved to: $BACKUP_DIR"
  echo "   You can now customize permissions as needed"
else
  echo "  ❌ Configuration still not working"
  echo
  echo "🔄 Restoring original configuration..."
  
  if [ -f "$BACKUP_DIR/settings.json" ]; then
    cp "$BACKUP_DIR/settings.json" "$HOME/.claude/"
  fi
  
  if [ -f "$BACKUP_DIR/settings.local.json" ]; then
    cp "$BACKUP_DIR/settings.local.json" "$HOME/.claude/"
  fi
  
  echo "   Original configuration restored"
  echo "   Please check Claude Code installation and MCP server configuration"
fi
```

## Performance Benchmarking

### Example 22: Performance Testing Script

Benchmark tool discovery performance:

```bash
#!/bin/bash
# performance-benchmark.sh

echo "⚡ Claude Tool Discovery Performance Benchmark"
echo "============================================="
echo

ITERATIONS=5
RESULTS_FILE="benchmark-results-$(date +%Y%m%d_%H%M%S).json"

echo "📊 Running $ITERATIONS iterations..."
echo

{
  echo "{"
  echo "  \"benchmark_info\": {"
  echo "    \"timestamp\": \"$(date -Iseconds)\","
  echo "    \"iterations\": $ITERATIONS,"
  echo "    \"system\": \"$(uname -s) $(uname -r)\","
  echo "    \"node_version\": \"$(node --version)\""
  echo "  },"
  echo "  \"results\": ["
} > "$RESULTS_FILE"

total_time=0
total_tools=0

for i in $(seq 1 $ITERATIONS); do
  echo "🔄 Iteration $i/$ITERATIONS..."
  
  start_time=$(date +%s%N)
  result=$(node src/cli.js --claude-tools-list --format json 2>/dev/null)
  end_time=$(date +%s%N)
  
  duration_ns=$((end_time - start_time))
  duration_ms=$((duration_ns / 1000000))
  
  if [ $? -eq 0 ] && [ -n "$result" ]; then
    tool_count=$(echo "$result" | jq '.metadata.total' 2>/dev/null || echo 0)
    scan_duration=$(echo "$result" | jq '.metadata.scanDuration' 2>/dev/null || echo 0)
    
    echo "   ⏱️  Duration: ${duration_ms}ms (scan: ${scan_duration}ms)"
    echo "   🔧 Tools: $tool_count"
    
    total_time=$((total_time + duration_ms))
    total_tools=$((total_tools + tool_count))
    
    # Add to results file
    {
      echo "    {"
      echo "      \"iteration\": $i,"
      echo "      \"total_duration_ms\": $duration_ms,"
      echo "      \"scan_duration_ms\": $scan_duration,"
      echo "      \"tool_count\": $tool_count,"
      echo "      \"tools_per_second\": $(echo "scale=2; $tool_count * 1000 / $duration_ms" | bc 2>/dev/null || echo 0)"
      if [ $i -lt $ITERATIONS ]; then
        echo "    },"
      else
        echo "    }"
      fi
    } >> "$RESULTS_FILE"
  else
    echo "   ❌ Failed"
    {
      echo "    {"
      echo "      \"iteration\": $i,"
      echo "      \"failed\": true"
      if [ $i -lt $ITERATIONS ]; then
        echo "    },"
      else
        echo "    }"
      fi
    } >> "$RESULTS_FILE"
  fi
  
  echo
done

# Calculate averages
avg_time=$((total_time / ITERATIONS))
avg_tools=$((total_tools / ITERATIONS))

{
  echo "  ],"
  echo "  \"summary\": {"
  echo "    \"average_duration_ms\": $avg_time,"
  echo "    \"average_tool_count\": $avg_tools,"
  echo "    \"total_duration_ms\": $total_time,"
  echo "    \"average_tools_per_second\": $(echo "scale=2; $avg_tools * 1000 / $avg_time" | bc 2>/dev/null || echo 0)"
  echo "  }"
  echo "}"
} >> "$RESULTS_FILE"

echo "📈 Benchmark Summary:"
echo "   Average Duration: ${avg_time}ms"
echo "   Average Tools Found: $avg_tools"
echo "   Average Tools/Second: $(echo "scale=2; $avg_tools * 1000 / $avg_time" | bc 2>/dev/null || echo 0)"
echo
echo "📄 Detailed results saved to: $RESULTS_FILE"

# Generate performance report
cat > "performance-report.md" << EOF
# Performance Benchmark Report

**Generated**: $(date)
**Iterations**: $ITERATIONS

## Summary

- **Average Duration**: ${avg_time}ms
- **Average Tools Found**: $avg_tools
- **Average Throughput**: $(echo "scale=2; $avg_tools * 1000 / $avg_time" | bc 2>/dev/null || echo 0) tools/second

## System Information

- **OS**: $(uname -s) $(uname -r)
- **Node.js**: $(node --version)
- **Claude CLI**: $(claude --version 2>/dev/null || echo 'Not available')

## Performance Analysis

$(if [ $avg_time -lt 10000 ]; then
  echo "✅ **Excellent**: Tool discovery is very fast (<10s)"
elif [ $avg_time -lt 30000 ]; then
  echo "✅ **Good**: Tool discovery is reasonably fast (<30s)"
elif [ $avg_time -lt 60000 ]; then
  echo "⚠️ **Acceptable**: Tool discovery is slow but functional (<60s)"
else
  echo "❌ **Poor**: Tool discovery is very slow (>60s)"
fi)

## Recommendations

$(if [ $avg_time -gt 30000 ]; then
  echo "- Consider optimizing Claude Code configuration"
  echo "- Check MCP server connection health"
  echo "- Review system resource usage during scans"
else
  echo "- Performance is within acceptable range"
  echo "- Consider caching results for frequent queries"
fi)

EOF

echo "📊 Performance report generated: performance-report.md"
```

---

## Conclusion

These examples demonstrate the full range of capabilities available in Claude Tool Discovery v2.0. From basic tool enumeration to advanced automation workflows, the tool provides comprehensive visibility and control over your MCP environment.

### Next Steps

- **Explore Advanced Features**: Try the filtering and search capabilities
- **Integrate into Workflows**: Adapt the automation scripts for your environment
- **Monitor Performance**: Use the benchmarking tools to optimize your setup
- **Contribute Examples**: Share your own use cases and integration patterns

### Additional Resources

- [User Guide](USER-GUIDE.md) - Complete usage instructions
- [API Reference](API-REFERENCE.md) - Programmatic interface documentation
- [Technical Specification](TECHNICAL-SPECIFICATION.md) - Implementation details
- [Troubleshooting Guide](TROUBLESHOOTING.md) - Problem resolution

For questions or additional examples, please file an issue on GitHub or contribute to the documentation.