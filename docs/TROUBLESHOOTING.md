# Claude Tool Discovery - Troubleshooting Guide

**Version**: v2.0.0  
**Branch**: `feature/claude-tools-cli-simple`  
**Last Updated**: 2025-09-12

## Overview

This guide provides comprehensive troubleshooting information for Claude Tool Discovery, covering common issues, diagnostic procedures, and resolution strategies. Use this guide to quickly identify and resolve problems with tool discovery, server connections, and system integration.

## Quick Diagnostic Checklist

Before diving into specific issues, run this quick diagnostic checklist:

```bash
# 1. Check Claude Code CLI
claude --version

# 2. Check MCP servers
claude mcp list

# 3. Check basic functionality
node src/cli.js --help

# 4. Test tool discovery
node src/cli.js --claude-tools-list --format table

# 5. Check configuration files
ls -la ~/.claude/settings*.json
```

If any of these steps fail, jump to the relevant section below.

## Common Issues and Solutions

### 1. No Tools Found

**Symptoms**:
- `--claude-tools-list` returns empty results
- "0 tools found" in output
- No MCP tools available for discovery

**Diagnostic Commands**:
```bash
# Check if Claude Code is properly installed
claude --version

# Check MCP server status
claude mcp list

# Check configuration files
cat ~/.claude/settings.json | jq '.permissions.allow'

# Test with verbose output
DEBUG=* node src/cli.js --claude-tools-list --format json
```

**Common Causes and Solutions**:

#### Cause 1: Claude Code Not Installed
```bash
# Check installation
which claude
# If not found, install Claude Code CLI

# Verify after installation
claude --version
```

#### Cause 2: No MCP Servers Configured
```bash
# Check server list
claude mcp list

# If empty, configure MCP servers in Claude Code
# Follow Claude Code documentation for MCP setup
```

#### Cause 3: Empty Permission Configuration
```bash
# Check permissions
cat ~/.claude/settings.json

# If missing or empty, create minimal config:
mkdir -p ~/.claude
cat > ~/.claude/settings.local.json << 'EOF'
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
```

#### Cause 4: Corrupted Configuration Files
```bash
# Test JSON validity
jq empty ~/.claude/settings.json

# If invalid, backup and recreate
cp ~/.claude/settings.json ~/.claude/settings.json.backup
# Recreate with valid JSON structure
```

### 2. Command Not Found Errors

**Symptoms**:
- `claude: command not found`
- `node: command not found`
- `src/cli.js: No such file or directory`

**Solutions**:

#### Missing Claude Code CLI
```bash
# Check if Claude Code is in PATH
echo $PATH | grep claude

# If not found, reinstall Claude Code CLI
# Follow installation instructions from Claude Code documentation

# Add to PATH if needed
echo 'export PATH=$PATH:/path/to/claude' >> ~/.bashrc
source ~/.bashrc
```

#### Missing Node.js
```bash
# Install Node.js (version 16+)
# Using nvm (recommended):
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Using package manager:
# macOS: brew install node
# Ubuntu: sudo apt install nodejs npm
```

#### Wrong Directory
```bash
# Ensure you're in the correct directory
pwd
ls -la src/cli.js

# If not found, navigate to the correct location
cd /path/to/ClaudeToolDiscovery
git checkout feature/claude-tools-cli-simple
```

### 3. Permission Denied Errors

**Symptoms**:
- `Permission denied` when accessing config files
- `EACCES` errors during execution
- Cannot read `~/.claude/` directory

**Solutions**:

#### File Permission Issues
```bash
# Check file permissions
ls -la ~/.claude/

# Fix permissions if needed
chmod 644 ~/.claude/settings*.json
chmod 755 ~/.claude/

# For directory access issues
sudo chown -R $(whoami) ~/.claude/
```

#### Node.js Permission Issues
```bash
# Fix npm permissions (if using system Node.js)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Recommended: Use nvm instead of system Node.js
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### 4. Timeout Errors

**Symptoms**:
- `Command timed out after 5000ms`
- Long delays with no output
- Hanging execution

**Diagnostic Steps**:
```bash
# Test Claude CLI responsiveness
time claude --version
time claude mcp list

# Test with increased timeout
node -e "
const { execSync } = require('child_process');
try {
  const output = execSync('claude mcp list', { timeout: 30000, encoding: 'utf8' });
  console.log('Success:', output);
} catch (error) {
  console.log('Error:', error.message);
}
"
```

**Solutions**:

#### Slow Claude Code Response
```bash
# Restart Claude Code (if applicable)
# Check system resources
top | grep claude

# Clear any locks or temporary files
rm -rf ~/.claude/tmp/
rm -rf ~/.claude/cache/
```

#### Network/Connection Issues
```bash
# Test network connectivity
ping github.com

# Check for proxy/firewall issues
echo $http_proxy
echo $https_proxy

# Test with minimal configuration
cat > ~/.claude/test-settings.json << 'EOF'
{
  "permissions": {
    "allow": ["mcp__github__get_issue"]
  }
}
EOF
```

#### System Resource Issues
```bash
# Check available memory
free -h

# Check CPU usage
top

# Check disk space
df -h

# Clean up if needed
# Clear Node.js cache
npm cache clean --force
```

### 5. JSON Parsing Errors

**Symptoms**:
- `SyntaxError: Unexpected token`
- `Invalid JSON in config file`
- `Cannot parse response`

**Diagnostic Commands**:
```bash
# Test configuration file validity
jq empty ~/.claude/settings.json
jq empty ~/.claude/settings.local.json

# Test JSON output
node src/cli.js --claude-tools-list --format json | jq empty
```

**Solutions**:

#### Corrupted Configuration Files
```bash
# Backup current config
cp ~/.claude/settings.json ~/.claude/settings.json.backup

# Validate and fix JSON
cat ~/.claude/settings.json | jq . > ~/.claude/settings.json.tmp
mv ~/.claude/settings.json.tmp ~/.claude/settings.json

# If completely corrupted, recreate minimal config
cat > ~/.claude/settings.json << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__github__get_issue",
      "mcp__memory__search_nodes"
    ]
  }
}
EOF
```

#### Invalid Command Output
```bash
# Test Claude CLI output
claude mcp list | cat -v  # Show hidden characters

# If output contains non-JSON content, file a bug report
# Use config-based discovery as workaround
```

### 6. Module/Dependency Errors

**Symptoms**:
- `Cannot find module`
- `Module not found`
- Import/require errors

**Solutions**:

#### Missing Dependencies
```bash
# Install dependencies
npm install

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for peer dependency issues
npm ls
```

#### Node.js Version Compatibility
```bash
# Check Node.js version
node --version

# Must be 16.0 or higher
# Upgrade if needed using nvm
nvm install 18
nvm use 18
```

#### ES Module Issues
```bash
# Ensure you're using Node.js 16+ with ES module support
# Check package.json for "type": "module"

# If using CommonJS, convert imports:
# From: import { something } from './module.js'
# To: const { something } = require('./module.js')
```

## Advanced Troubleshooting

### Debug Mode

Enable comprehensive debugging for detailed troubleshooting:

```bash
# Enable all debug output
DEBUG=* node src/cli.js --claude-tools-list

# Enable specific debug categories
DEBUG=claude-tool-discovery:* node src/cli.js --claude-tools-list

# Save debug output to file
DEBUG=* node src/cli.js --claude-tools-list 2> debug.log
```

### Manual Testing

Test individual components separately:

```bash
# Test config file parsing
node -e "
const fs = require('fs');
const path = require('path');
const os = require('os');

const configPath = path.join(os.homedir(), '.claude', 'settings.json');
try {
  const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log('Config valid:', config.permissions?.allow?.length || 0, 'permissions');
} catch (error) {
  console.log('Config error:', error.message);
}
"

# Test Claude CLI integration
node -e "
const { execSync } = require('child_process');
try {
  const output = execSync('claude mcp list', { encoding: 'utf8', timeout: 10000 });
  console.log('MCP list success');
  console.log(output);
} catch (error) {
  console.log('MCP list error:', error.message);
}
"
```

### Performance Debugging

Identify performance bottlenecks:

```bash
# Time each operation
time node src/cli.js --claude-tools-list --format json > /dev/null

# Profile memory usage
node --inspect-brk src/cli.js --claude-tools-list
# Then open Chrome DevTools: chrome://inspect

# Test with minimal scope
node src/cli.js --claude-tools-list --server github --format json
```

## Environment-Specific Issues

### macOS Issues

#### Gatekeeper/Security Issues
```bash
# If getting security warnings about unsigned binaries
sudo spctl --master-disable  # Temporary disable (not recommended)

# Or allow specific applications
sudo spctl --add /path/to/claude
```

#### Homebrew Path Issues
```bash
# Check if Homebrew paths are correct
echo $PATH | grep brew

# Add Homebrew to PATH if needed
echo 'export PATH="/opt/homebrew/bin:$PATH"' >> ~/.zshrc
source ~/.zshrc
```

### Linux Issues

#### Missing Build Tools
```bash
# Install build essentials (Ubuntu/Debian)
sudo apt update
sudo apt install build-essential

# Install curl and other basics
sudo apt install curl git
```

#### Permission Issues with /usr/local
```bash
# Fix npm global installation permissions
mkdir ~/.npm-global
npm config set prefix '~/.npm-global'
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.bashrc
source ~/.bashrc
```

### Windows (WSL) Issues

#### WSL Path Issues
```bash
# Check if Windows PATH is interfering
echo $PATH | grep -i windows

# Clean PATH if needed
export PATH="/usr/local/bin:/usr/bin:/bin"
```

#### File System Permission Issues
```bash
# Check WSL file system mounting
mount | grep drvfs

# Fix permissions on WSL files
sudo chmod -R 755 ~/.claude/
```

## Recovery Procedures

### Complete Reset

If all else fails, perform a complete reset:

```bash
# 1. Backup current state
mkdir ~/ctd-backup-$(date +%Y%m%d)
cp -r ~/.claude ~/ctd-backup-$(date +%Y%m%d)/
cp -r ClaudeToolDiscovery ~/ctd-backup-$(date +%Y%m%d)/

# 2. Clean slate installation
rm -rf ClaudeToolDiscovery
rm -rf ~/.claude/settings*.json

# 3. Fresh installation
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery
git checkout feature/claude-tools-cli-simple
npm install

# 4. Minimal configuration
mkdir -p ~/.claude
cat > ~/.claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "mcp__github__get_issue",
      "mcp__memory__search_nodes"
    ]
  }
}
EOF

# 5. Test basic functionality
node src/cli.js --claude-tools-list
```

### Configuration Recovery

Restore working configuration from backup:

```bash
# Locate backup files
find ~ -name "settings.json.backup" -o -name "settings.json.*"

# Test backup validity
jq empty ~/path/to/backup/settings.json

# Restore if valid
cp ~/path/to/backup/settings.json ~/.claude/settings.json

# Test restored configuration
node src/cli.js --claude-tools-list --format table
```

## Diagnostic Scripts

### Comprehensive System Check

Save as `system-check.sh`:

```bash
#!/bin/bash
echo "🔍 Claude Tool Discovery System Check"
echo "====================================="

# Check prerequisites
echo "📋 Prerequisites:"
for cmd in node npm git claude jq; do
  if command -v "$cmd" &> /dev/null; then
    echo "  ✅ $cmd: $(command -v "$cmd")"
    if [ "$cmd" = "node" ]; then
      echo "     Version: $(node --version)"
    fi
  else
    echo "  ❌ $cmd: Not found"
  fi
done

# Check Node.js version
echo -e "\n🔍 Node.js Version Check:"
NODE_VERSION=$(node --version | sed 's/v//')
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d. -f1)
if [ "$NODE_MAJOR" -ge 16 ]; then
  echo "  ✅ Node.js $NODE_VERSION (>= 16.0 required)"
else
  echo "  ❌ Node.js $NODE_VERSION (< 16.0, upgrade required)"
fi

# Check Claude configuration
echo -e "\n⚙️  Claude Configuration:"
if [ -f "$HOME/.claude/settings.json" ]; then
  echo "  ✅ Global settings exist"
  if jq empty "$HOME/.claude/settings.json" 2>/dev/null; then
    echo "  ✅ Global settings valid JSON"
    PERMS=$(jq '.permissions.allow | length' "$HOME/.claude/settings.json" 2>/dev/null || echo 0)
    echo "     Permissions: $PERMS"
  else
    echo "  ❌ Global settings invalid JSON"
  fi
else
  echo "  ⚠️  Global settings missing"
fi

# Check MCP servers
echo -e "\n🏠 MCP Servers:"
if command -v claude &> /dev/null; then
  if claude mcp list &> /dev/null; then
    echo "  ✅ MCP command working"
    claude mcp list | while read -r line; do
      if [[ "$line" == *"Connected"* ]]; then
        echo "  ✅ $line"
      elif [[ "$line" == *":"* ]] && [[ "$line" != *"Checking"* ]]; then
        echo "  ⚠️  $line"
      fi
    done
  else
    echo "  ❌ MCP command failed"
  fi
else
  echo "  ❌ Claude CLI not available"
fi

# Test tool discovery
echo -e "\n🔧 Tool Discovery Test:"
if [ -f "src/cli.js" ]; then
  if RESULT=$(node src/cli.js --claude-tools-list --format json 2>&1); then
    TOOL_COUNT=$(echo "$RESULT" | jq '.metadata.total' 2>/dev/null || echo 0)
    echo "  ✅ Discovery working: $TOOL_COUNT tools found"
  else
    echo "  ❌ Discovery failed:"
    echo "$RESULT" | head -3 | sed 's/^/     /'
  fi
else
  echo "  ❌ src/cli.js not found"
fi

echo -e "\n✅ System check complete!"
```

### Performance Test Script

Save as `performance-test.sh`:

```bash
#!/bin/bash
echo "⚡ Performance Test"
echo "=================="

ITERATIONS=3
echo "Running $ITERATIONS iterations..."

for i in $(seq 1 $ITERATIONS); do
  echo "Iteration $i:"
  
  start_time=$(date +%s%N)
  result=$(node src/cli.js --claude-tools-list --format json 2>/dev/null)
  end_time=$(date +%s%N)
  
  duration_ms=$(( (end_time - start_time) / 1000000 ))
  
  if [ $? -eq 0 ]; then
    tool_count=$(echo "$result" | jq '.metadata.total' 2>/dev/null || echo 0)
    echo "  ✅ ${duration_ms}ms - $tool_count tools"
  else
    echo "  ❌ Failed"
  fi
done
```

## Getting Help

### Information to Gather

When seeking help, please gather this information:

```bash
# System information
uname -a
node --version
npm --version
claude --version

# Configuration state
ls -la ~/.claude/
jq empty ~/.claude/settings.json 2>&1

# Error output
node src/cli.js --claude-tools-list 2>&1

# MCP server status
claude mcp list 2>&1
```

### Useful Debug Commands

```bash
# Comprehensive debug output
DEBUG=* node src/cli.js --claude-tools-list 2> debug.log

# Network debugging
curl -v https://api.github.com/user  # If using GitHub integration

# File system debugging
strace -e openat node src/cli.js --claude-tools-list 2>&1 | grep claude
```

### Support Channels

1. **Documentation**: Check [User Guide](USER-GUIDE.md) and [API Reference](API-REFERENCE.md)
2. **GitHub Issues**: https://github.com/your-org/ClaudeToolDiscovery/issues
3. **Technical Specification**: [TECHNICAL-SPECIFICATION.md](TECHNICAL-SPECIFICATION.md)

### Issue Report Template

When filing issues, use this template:

```markdown
## Issue Description
Brief description of the problem

## Environment
- OS: [macOS/Linux/Windows WSL]
- Node.js version: [output of `node --version`]
- Claude Code version: [output of `claude --version`]
- CTDiscovery version: v2.0.0

## Steps to Reproduce
1. Step 1
2. Step 2
3. Step 3

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Error Output
```
Paste complete error output here
```

## Diagnostic Output
```
Paste output of diagnostic commands here
```

## Additional Context
Any other relevant information
```

## Prevention Tips

### Regular Maintenance

```bash
# Weekly health check
node src/cli.js --claude-tools-list --format table > weekly-check.txt

# Monthly dependency update
npm outdated
npm update

# Configuration backup
cp ~/.claude/settings.json ~/.claude/settings.json.backup-$(date +%Y%m%d)
```

### Best Practices

1. **Keep Dependencies Updated**: Regular `npm update`
2. **Monitor Performance**: Track discovery times
3. **Backup Configurations**: Regular config file backups
4. **Test After Changes**: Verify functionality after any changes
5. **Use Version Control**: Track configuration changes

---

## FAQ

### Q: Tool discovery is very slow (>30 seconds)

**A**: This usually indicates the system is falling back to debug output parsing. Check:
1. Configuration files exist and are valid JSON
2. MCP servers are properly connected
3. Permissions are correctly configured

### Q: Getting "No tools found" but MCP servers are connected

**A**: Check permission configuration:
```bash
cat ~/.claude/settings.json | jq '.permissions.allow'
```
Ensure MCP tool patterns are present (e.g., `mcp__github__get_issue`).

### Q: Can I use this with older versions of Claude Code?

**A**: The tool is designed for current Claude Code versions. Older versions may have different CLI interfaces. Check compatibility by testing `claude mcp list`.

### Q: Is it safe to run this tool?

**A**: Yes, the tool only reads configuration files and executes read-only Claude CLI commands. It makes no modifications to your system.

### Q: Can I customize the discovery process?

**A**: Yes, see the [API Reference](API-REFERENCE.md) for programmatic usage and customization options.

---

**Last Updated**: 2025-09-12  
**Next Review**: 2025-12-12