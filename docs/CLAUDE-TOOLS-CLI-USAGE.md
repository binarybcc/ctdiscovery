# Claude Tools CLI - Usage Guide
## Complete Command Reference

> **📋 Comprehensive documentation for all Claude Tools CLI commands and options**

---

## 📖 **Table of Contents**

1. [Command Overview](#command-overview)
2. [Tools Commands](#tools-commands)
3. [MCP Server Commands](#mcp-server-commands)
4. [Output Formats](#output-formats)
5. [Filtering & Search](#filtering--search)
6. [Examples by Use Case](#examples-by-use-case)
7. [Integration Patterns](#integration-patterns)
8. [Performance Tips](#performance-tips)

---

## 🎯 **Command Overview**

### **Available Commands**
| Command | Purpose | Example |
|---------|---------|---------|
| `--tools-list` | List all available tools | `ctd --tools-list` |
| `--tools-inspect TOOL` | Inspect specific tool | `ctd --tools-inspect git` |
| `--mcp-servers` | List MCP servers | `ctd --mcp-servers` |
| `--mcp-inspect SERVER` | Inspect MCP server | `ctd --mcp-inspect github` |

### **Global Options**
| Option | Description | Default |
|--------|-------------|---------|
| `--format FORMAT` | Output format: human, json, table | human |
| `--filter PATTERN` | Filter by name/description | none |
| `--status STATUS` | Filter by status | none |
| `--quiet` | Suppress scanning output | false |

---

## 🔧 **Tools Commands**

### **--tools-list**

Lists all detected tools across categories (MCP servers, VSCode extensions, system tools).

#### **Basic Usage**
```bash
# Default human-readable format
node src/cli.js --tools-list

# Table format with columns
node src/cli.js --tools-list --format table

# Machine-readable JSON
node src/cli.js --tools-list --format json
```

#### **With Filtering**
```bash
# Filter by name pattern (case-insensitive)
node src/cli.js --tools-list --filter git
node src/cli.js --tools-list --filter python

# Filter by status
node src/cli.js --tools-list --status active
node src/cli.js --tools-list --status available

# Combined filters
node src/cli.js --tools-list --filter python --status active --format table
```

#### **Example Output**

**Human Format:**
```
Found 55 tools:

● ruv-swarm - mcp-server
● claude-flow - mcp-server
● GitLens — Git supercharged - vscode
● git (2.51.0) - system-tool
● node (22.17.0) - system-tool
```

**Table Format:**
```
Name                        | Category    | Version | Status
------------------------------------------------------------
ruv-swarm                   | mcp-server  |         | ● active
GitLens — Git supercharged  | vscode      |         | ● active
git                         | system-tool | 2.51.0  | ● available

Total: 3 tools
```

**JSON Format:**
```json
{
  "version": 1,
  "tools": [
    {
      "name": "git",
      "type": "system-tool",
      "status": "available",
      "category": "system-tool",
      "source": "ctdiscovery",
      "metadata": {
        "version": "2.51.0",
        "path": "/usr/bin/git"
      }
    }
  ]
}
```

---

### **--tools-inspect TOOL**

Provides detailed information about a specific tool.

#### **Basic Usage**
```bash
# Inspect tool by exact name
node src/cli.js --tools-inspect git

# Partial name matching (finds first match)
node src/cli.js --tools-inspect github

# JSON format for programmatic use
node src/cli.js --tools-inspect git --format json
```

#### **Example Output**

**Human Format:**
```
🔍 git - Detailed Information
══════════════════════════════════════════════════
Status: ● available
Category: system-tool
Version: 2.51.0
Description: Version control system

Metadata:
{
  "version": "2.51.0",
  "path": "/usr/bin/git",
  "configPath": "~/.gitconfig"
}
```

**JSON Format:**
```json
{
  "version": 1,
  "tool": {
    "name": "git",
    "status": "available",
    "category": "system-tool",
    "metadata": {
      "version": "2.51.0",
      "path": "/usr/bin/git",
      "validation": {
        "functional": true,
        "accessible": true,
        "configured": true
      }
    }
  }
}
```

#### **Error Handling**
```bash
# Tool not found
$ node src/cli.js --tools-inspect nonexistent
❌ Tool 'nonexistent' not found

Available tools: git, node, python, docker, ...
```

---

## 🌐 **MCP Server Commands**

### **--mcp-servers**

Lists all detected MCP (Model Context Protocol) servers.

#### **Basic Usage**
```bash
# Default list format
node src/cli.js --mcp-servers

# Table format
node src/cli.js --mcp-servers --format table

# JSON format
node src/cli.js --mcp-servers --format json
```

#### **Example Output**

**Human Format:**
```
Found 15 MCP servers:

● ruv-swarm - active
● claude-flow - active
● github__search_repositories - active
● memory__create_entities - active
```

**Table Format:**
```
Name                             | Type       | Status
---------------------------------------------------------
ruv-swarm                        | mcp-server | ● active
claude-flow                      | mcp-server | ● active
github__search_repositories      | mcp-server | ● active
memory__create_entities          | mcp-server | ● active

Total: 4 servers
```

---

### **--mcp-inspect SERVER**

Provides detailed information about a specific MCP server.

#### **Basic Usage**
```bash
# Inspect server by name (partial matching)
node src/cli.js --mcp-inspect github

# Exact server name
node src/cli.js --mcp-inspect github__search_repositories

# JSON format
node src/cli.js --mcp-inspect memory --format json
```

#### **Example Output**

**Human Format:**
```
🔍 github__search_repositories - MCP Server Details
══════════════════════════════════════════════════
Status: ● active
Type: mcp-server

Server Details:
{
  "configPath": "/Users/user/.claude/settings.local.json",
  "method": "permissions"
}
```

**JSON Format:**
```json
{
  "version": 1,
  "server": {
    "name": "github__search_repositories",
    "status": "active",
    "category": "mcp-server",
    "metadata": {
      "configPath": "/Users/user/.claude/settings.local.json",
      "method": "permissions"
    }
  }
}
```

---

## 📊 **Output Formats**

### **Human Format (Default)**
- **User-friendly**: Easy to read and understand
- **Status icons**: Visual indicators for tool states
- **Hierarchical**: Organized by categories
- **Best for**: Interactive use, quick overviews

```bash
node src/cli.js --tools-list
# or
node src/cli.js --tools-list --format human
```

### **JSON Format**
- **Machine-readable**: Structured data for scripts
- **Versioned**: `{"version": 1, ...}` for API evolution
- **Complete metadata**: All available information
- **Best for**: Automation, integration, data processing

```bash
node src/cli.js --tools-list --format json
```

### **Table Format**
- **Professional**: Clean columnar layout
- **Scannable**: Easy to compare tools
- **Totals**: Summary counts included
- **Best for**: Reports, documentation, analysis

```bash
node src/cli.js --tools-list --format table
```

---

## 🔍 **Filtering & Search**

### **Name/Description Filtering**
```bash
# Filter by tool name (case-insensitive)
node src/cli.js --tools-list --filter git
node src/cli.js --tools-list --filter PYTHON

# Filter by description content
node src/cli.js --tools-list --filter "version control"
node src/cli.js --tools-list --filter javascript
```

### **Status Filtering**
```bash
# Show only active tools
node src/cli.js --tools-list --status active

# Show only available tools  
node src/cli.js --tools-list --status available

# Show missing/problematic tools
node src/cli.js --tools-list --status missing
node src/cli.js --tools-list --status error
```

### **Combined Filtering**
```bash
# Active Python tools only
node src/cli.js --tools-list --filter python --status active

# Available Git-related tools in table format
node src/cli.js --tools-list --filter git --status available --format table
```

### **Advanced Filtering with jq**
```bash
# JSON + jq for complex filtering
node src/cli.js --tools-list --format json | jq '.tools[] | select(.category=="vscode")'

# Get just tool names
node src/cli.js --tools-list --format json | jq -r '.tools[].name'

# Tools with versions
node src/cli.js --tools-list --format json | jq '.tools[] | select(.metadata.version != null)'
```

---

## 🎯 **Examples by Use Case**

### **Development Environment Audit**

#### **Quick Overview**
```bash
# See all tools at a glance
node src/cli.js --tools-list --format table
```

#### **Check Specific Development Stack**
```bash
# Python development setup
node src/cli.js --tools-list --filter python --format table

# Node.js ecosystem
node src/cli.js --tools-list --filter node --format table

# Git and version control
node src/cli.js --tools-list --filter git --format table
```

#### **AI/ML Tools Assessment**
```bash
# All MCP servers (AI integrations)
node src/cli.js --mcp-servers --format table

# Specific AI services
node src/cli.js --mcp-inspect github
node src/cli.js --mcp-inspect memory
node src/cli.js --mcp-inspect context7
```

### **CI/CD Integration**

#### **Tool Inventory Generation**
```bash
#!/bin/bash
# Generate tool inventory report
echo "# Development Environment Report" > env-report.md
echo "Generated: $(date)" >> env-report.md
echo "" >> env-report.md

echo "## Tool Inventory" >> env-report.md
node src/cli.js --tools-list --format json > tools.json
echo "\`\`\`" >> env-report.md
jq -r '.tools[] | "\(.name) - \(.status)"' tools.json >> env-report.md
echo "\`\`\`" >> env-report.md
```

#### **Dependency Validation**
```bash
#!/bin/bash
# Check required tools are available
required_tools=("git" "node" "docker" "python")

for tool in "${required_tools[@]}"; do
  status=$(node src/cli.js --tools-inspect "$tool" --format json --quiet 2>/dev/null | jq -r '.tool.status')
  if [ "$status" != "available" ] && [ "$status" != "active" ]; then
    echo "❌ Required tool '$tool' is not available (status: $status)"
    exit 1
  else
    echo "✅ $tool is $status"
  fi
done
```

#### **Environment Comparison**
```bash
# Compare environments
node src/cli.js --tools-list --format json > production-tools.json
# ... on different machine ...
node src/cli.js --tools-list --format json > staging-tools.json

# Use jq to compare (external tool)
diff <(jq '.tools[].name' production-tools.json) <(jq '.tools[].name' staging-tools.json)
```

### **Troubleshooting**

#### **Find Missing Tools**
```bash
# Show tools with issues
node src/cli.js --tools-list --status missing --format table
node src/cli.js --tools-list --status error --format table
```

#### **Diagnose Specific Issues**
```bash
# Get detailed information about problematic tool
node src/cli.js --tools-inspect problematic-tool --format json

# Check MCP server configuration
node src/cli.js --mcp-inspect failing-server --format json
```

#### **Environment Comparison**
```bash
# Compare what's available vs. what's expected
node src/cli.js --tools-list --filter docker
node src/cli.js --tools-inspect docker --format json | jq '.tool.metadata'
```

### **Documentation Generation**

#### **Automated Environment Documentation**
```bash
#!/bin/bash
# Generate environment documentation
{
  echo "# Development Environment"
  echo "Last updated: $(date)"
  echo ""
  
  echo "## Available Tools"
  node src/cli.js --tools-list --format table --quiet 2>/dev/null
  echo ""
  
  echo "## MCP Servers"  
  node src/cli.js --mcp-servers --format table --quiet 2>/dev/null
  echo ""
  
  echo "## System Tools"
  node src/cli.js --tools-list --filter system-tool --status available --format table --quiet 2>/dev/null
  
} > environment-docs.md
```

---

## 🔌 **Integration Patterns**

### **Shell Scripts**
```bash
#!/bin/bash
# Tool availability checker
check_tool() {
  local tool=$1
  local status=$(node src/cli.js --tools-inspect "$tool" --format json --quiet 2>/dev/null | jq -r '.tool.status // "missing"')
  echo "$tool: $status"
}

check_tool "git"
check_tool "docker" 
check_tool "node"
```

### **Makefiles**
```makefile
# Makefile integration
.PHONY: check-env
check-env:
	@echo "Checking development environment..."
	@node src/cli.js --tools-list --status active --quiet > /dev/null 2>&1 || (echo "❌ Environment scan failed" && exit 1)
	@echo "✅ Environment check passed"

.PHONY: env-report
env-report:
	@echo "Generating environment report..."
	@node src/cli.js --tools-list --format json --quiet > tools-inventory.json
	@echo "Report saved to tools-inventory.json"
```

### **Docker Integration**
```dockerfile
# Dockerfile health check
FROM node:18
COPY . /app
WORKDIR /app

# Verify development tools during build
RUN node src/cli.js --tools-inspect node --format json | jq -e '.tool.status == "available"'
```

### **GitHub Actions**
```yaml
name: Environment Validation
on: [push, pull_request]

jobs:
  validate-env:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
      
      - name: Validate environment
        run: |
          node src/cli.js --tools-list --format json > environment.json
          # Upload as artifact for analysis
      
      - name: Check required tools
        run: |
          tools=("git" "node" "npm")
          for tool in "${tools[@]}"; do
            status=$(node src/cli.js --tools-inspect "$tool" --format json | jq -r '.tool.status')
            if [[ "$status" != "available" ]]; then
              echo "::error::Tool $tool is not available (status: $status)"
              exit 1
            fi
          done
```

---

## ⚡ **Performance Tips**

### **Faster Execution**
```bash
# Use --quiet to suppress scanning output
node src/cli.js --tools-list --format json --quiet

# Filter early to reduce processing
node src/cli.js --tools-list --filter git --quiet

# Use specific commands instead of full scans
node src/cli.js --tools-inspect git  # faster than full list + filter
```

### **Caching Results**
```bash
#!/bin/bash
# Cache results for repeated use
CACHE_FILE="/tmp/ctd-tools-cache.json"
CACHE_MAX_AGE=300  # 5 minutes

if [ -f "$CACHE_FILE" ] && [ $(($(date +%s) - $(stat -f %m "$CACHE_FILE"))) -lt $CACHE_MAX_AGE ]; then
  # Use cached results
  cat "$CACHE_FILE"
else
  # Generate fresh results
  node src/cli.js --tools-list --format json --quiet > "$CACHE_FILE"
  cat "$CACHE_FILE"
fi
```

### **Parallel Processing**
```bash
#!/bin/bash
# Run multiple checks in parallel
{
  node src/cli.js --tools-inspect git --format json > git-info.json &
  node src/cli.js --tools-inspect docker --format json > docker-info.json &
  node src/cli.js --mcp-servers --format json > mcp-info.json &
  wait
}
```

---

## 📋 **Command Reference Summary**

### **Complete Command Syntax**
```bash
node src/cli.js [COMMAND] [TOOL/SERVER] [OPTIONS]

Commands:
  --tools-list                    List all available tools
  --tools-inspect TOOL            Inspect specific tool details
  --mcp-servers                   List MCP servers  
  --mcp-inspect SERVER            Inspect MCP server details

Options:
  --format FORMAT                 Output format: human|json|table (default: human)
  --filter PATTERN                Filter by name/description (case-insensitive)
  --status STATUS                 Filter by status: active|available|missing|error
  --quiet                         Suppress scanning output, show results only
  --help                          Show help information

Examples:
  node src/cli.js --tools-list --format table
  node src/cli.js --tools-inspect git --format json
  node src/cli.js --mcp-servers --format table
  node src/cli.js --tools-list --filter python --status active
```

---

*For troubleshooting and limitations, see [CLAUDE-TOOLS-CLI-LIMITATIONS.md](./CLAUDE-TOOLS-CLI-LIMITATIONS.md)*