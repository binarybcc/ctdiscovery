# Claude Tools CLI - Getting Started
## CTDiscovery Special Edition

> **🎯 Purpose**: Functional implementation of Claude Code tool inspection CLI commands using CTDiscovery's environment scanning infrastructure.

---

## 🚀 **Quick Start**

### **Installation**

#### **Option 1: Direct Usage (Recommended)**
```bash
# Clone this specific branch
git clone -b feature/claude-tools-cli-simple https://github.com/binarybcc/ctdiscovery.git claude-tools-cli
cd claude-tools-cli

# Install dependencies
npm install

# Test the CLI
node src/cli.js --tools-list --format table
```

#### **Option 2: NPM Link (For Development)**
```bash
# In the project directory
npm link

# Now you can use 'ctdiscovery' or 'ctd' globally
ctd --tools-list --format json
```

#### **Option 3: Direct Node Execution**
```bash
# No installation needed
node src/cli.js --tools-list
```

---

## 📝 **Basic Commands**

### **List All Tools**
```bash
# Basic list (human-readable)
node src/cli.js --tools-list

# Table format
node src/cli.js --tools-list --format table

# JSON format (versioned)
node src/cli.js --tools-list --format json

# Filter by name pattern
node src/cli.js --tools-list --filter git

# Filter by status
node src/cli.js --tools-list --status active
```

### **Inspect Individual Tools**
```bash
# Basic inspection
node src/cli.js --tools-inspect git

# JSON format
node src/cli.js --tools-inspect git --format json

# Partial name matching
node src/cli.js --tools-inspect github
```

### **MCP Server Commands**
```bash
# List MCP servers
node src/cli.js --mcp-servers

# Table format
node src/cli.js --mcp-servers --format table

# Inspect specific server
node src/cli.js --mcp-inspect github

# JSON server details
node src/cli.js --mcp-inspect memory --format json
```

---

## 🎯 **Example Workflows**

### **Development Environment Audit**
```bash
# 1. Get comprehensive tool overview
node src/cli.js --tools-list --format table

# 2. Check AI/ML tools availability
node src/cli.js --tools-list --filter python

# 3. Verify version control setup
node src/cli.js --tools-inspect git --format json

# 4. List available AI integrations
node src/cli.js --mcp-servers --format table
```

### **CI/CD Integration**
```bash
# Generate machine-readable tool inventory
node src/cli.js --tools-list --format json > tools-inventory.json

# Check Docker availability for containers
node src/cli.js --tools-inspect docker --format json | jq '.tool.status'

# Verify Node.js environment
node src/cli.js --tools-inspect node --format json | jq '.tool.metadata.version'
```

### **Troubleshooting**
```bash
# Find all VSCode extensions
node src/cli.js --tools-list --filter vscode --format table

# Check MCP server configuration
node src/cli.js --mcp-inspect claude-flow

# List only active tools
node src/cli.js --tools-list --status active
```

---

## 📊 **Understanding the Output**

### **Tool Status Icons**
| Icon | Status | Meaning |
|------|--------|---------|
| ● | active | Tool is active and ready to use |
| ● | available | Tool is installed and available |
| ○ | missing | Tool is not found/installed |
| ✖ | error | Tool has configuration errors |
| ? | unknown | Tool status could not be determined |

### **Tool Categories**
| Category | Description | Examples |
|----------|-------------|----------|
| `mcp-server` | Model Context Protocol servers | github, memory, context7 |
| `vscode` | VSCode extensions | GitLens, ESLint, Prettier |
| `system-tool` | Command-line tools | git, node, python, docker |

### **JSON Schema**
```json
{
  "version": 1,
  "tools": [
    {
      "name": "git",
      "status": "available",
      "category": "system-tool",
      "source": "ctdiscovery",
      "metadata": {
        "version": "2.51.0",
        "path": "/usr/bin/git",
        "configPath": "~/.gitconfig"
      },
      "validation": {
        "functional": true,
        "accessible": true,
        "configured": true
      }
    }
  ]
}
```

---

## ⚙️ **Command Options**

### **Global Options**
```bash
--quiet          # Suppress scanning output (shows results only)
--dev            # Development mode with additional debugging
--verbose        # Detailed information output
```

### **Format Options**
```bash
--format human   # Default: User-friendly list (default)
--format json    # Versioned JSON output  
--format table   # Professional table format
```

### **Filter Options**
```bash
--filter PATTERN    # Filter by name or description (case-insensitive)
--status STATUS     # Filter by status: active, available, missing, error
```

---

## 🔧 **Advanced Usage**

### **Combining Multiple Filters**
```bash
# Active Python tools only
node src/cli.js --tools-list --filter python --status active --format table

# All GitHub-related MCP servers
node src/cli.js --mcp-servers --format table | grep -i github

# JSON output for specific tool categories
node src/cli.js --tools-list --format json | jq '.tools[] | select(.category=="vscode")'
```

### **Shell Integration**
```bash
# Create aliases for convenience
alias ctd-tools="node src/cli.js --tools-list"
alias ctd-inspect="node src/cli.js --tools-inspect"
alias ctd-mcp="node src/cli.js --mcp-servers"

# Use in scripts
#!/bin/bash
DOCKER_STATUS=$(node src/cli.js --tools-inspect docker --format json | jq -r '.tool.status')
if [ "$DOCKER_STATUS" != "available" ]; then
    echo "Docker not available, skipping container tests"
    exit 1
fi
```

### **Performance Optimization**
```bash
# Use quiet mode for faster results in scripts
node src/cli.js --tools-list --format json --quiet

# Filter early to reduce processing
node src/cli.js --tools-list --filter git --quiet
```

---

## 🚨 **Important Notes**

### **This is NOT Claude Code**
- This CLI mimics Claude Code's requested tool inspection functionality
- Uses CTDiscovery's scanning infrastructure, not Claude Code's internal systems
- May show different tools/states than Claude Code's actual environment
- Designed as a functional equivalent, not a replacement

### **Limitations**
- **No Live Permissions**: Cannot access Claude Code's runtime permission states
- **External Detection**: Uses settings file analysis, not internal MCP connections
- **Static Snapshots**: Point-in-time scanning, not real-time monitoring
- **Different Data Structures**: CTDiscovery format, not Claude Code's internal structs

### **When to Use vs. Not Use**
#### **✅ Use When:**
- You need tool inventory for development environment
- Want to check what AI tools are available
- Need machine-readable tool information
- Troubleshooting development setup

#### **❌ Don't Use When:**
- You need Claude Code's actual runtime tool state
- Require real-time permission resolution
- Need Claude Code's internal data format exactly
- Want live change monitoring

---

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Scanner Takes Too Long**
```bash
# Use timeout flags (if scanning hangs)
# This is handled automatically, but you can use --quiet for faster results
node src/cli.js --tools-list --quiet
```

#### **Tool Not Found**
```bash
# Check exact tool name
node src/cli.js --tools-list --filter partial-name

# Try different name variations  
node src/cli.js --tools-inspect github  # Instead of 'git'
```

#### **No MCP Servers Found**
```bash
# Check if Claude settings file exists
ls -la ~/.claude/settings.local.json

# Manual verification
node src/cli.js --tools-list --filter mcp
```

#### **JSON Parsing Errors**
```bash
# Use --quiet to get clean JSON
node src/cli.js --tools-list --format json --quiet 2>/dev/null
```

### **Getting Help**
```bash
# Built-in help
node src/cli.js --help

# Test specific functionality
node src/cli.js --tools-list --filter git --format table
```

---

## 📚 **Next Steps**

1. **Read the [Usage Guide](./CLAUDE-TOOLS-CLI-USAGE.md)** for comprehensive command reference
2. **Check [Limitations Guide](./CLAUDE-TOOLS-CLI-LIMITATIONS.md)** to understand constraints
3. **Review [Branch Protection](./CLAUDE-TOOLS-CLI-BRANCH-PROTECTION.md)** for project isolation

---

*Ready to explore your development environment? Start with `node src/cli.js --tools-list --format table` to see what's available!*