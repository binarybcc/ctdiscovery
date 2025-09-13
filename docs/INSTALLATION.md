# Claude Tool Discovery - Installation Guide

**Version**: v2.0.0  
**Branch**: `feature/claude-tools-cli-simple`  
**Last Updated**: 2025-09-12

## Prerequisites

Before installing Claude Tool Discovery, ensure your system meets these requirements:

### System Requirements

- **Operating System**: macOS, Linux, or Windows with WSL
- **Node.js**: Version 16.0 or higher
- **Claude Code CLI**: Latest version installed and configured
- **Git**: For repository cloning and version control

### Claude Code Setup

Claude Tool Discovery requires Claude Code CLI to be properly installed and configured:

1. **Install Claude Code CLI**:
   ```bash
   # Follow Claude Code installation instructions
   # Verify installation
   claude --version
   ```

2. **Configure MCP Servers**:
   ```bash
   # List configured servers
   claude mcp list
   
   # Ensure at least one server is connected
   # Example output should show servers like:
   # github: ✓ Connected
   # memory: ✓ Connected
   ```

3. **Verify Permissions**:
   ```bash
   # Check that ~/.claude/settings.json exists and contains permissions
   cat ~/.claude/settings.json | grep -A 10 permissions
   ```

## Installation Methods

### Method 1: Direct Repository Clone (Recommended)

This method gives you the latest features and allows easy updates:

```bash
# Clone the repository
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery

# Switch to the enhanced branch
git checkout feature/claude-tools-cli-simple

# Install dependencies
npm install

# Verify installation
node src/cli.js --claude-tools-list --format table
```

### Method 2: Download Release Archive

For stable releases without Git dependency:

```bash
# Download latest release
curl -LO https://github.com/your-org/ClaudeToolDiscovery/archive/refs/heads/feature/claude-tools-cli-simple.zip

# Extract archive
unzip claude-tools-cli-simple.zip
cd ClaudeToolDiscovery-feature-claude-tools-cli-simple

# Install dependencies
npm install

# Test installation
node src/cli.js --help
```

### Method 3: Global Installation (Advanced)

Install as a global command-line tool:

```bash
# Clone and install globally
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery
git checkout feature/claude-tools-cli-simple
npm install
npm link

# Create global command (optional)
echo '#!/bin/bash' > /usr/local/bin/ctdiscovery
echo 'node /path/to/ClaudeToolDiscovery/src/cli.js "$@"' >> /usr/local/bin/ctdiscovery
chmod +x /usr/local/bin/ctdiscovery

# Test global installation
ctdiscovery --claude-tools-list
```

## Verification

After installation, verify everything is working correctly:

### Basic Functionality Test

```bash
# Test help command
node src/cli.js --help

# Test Claude Code integration
node src/cli.js --mcp-servers

# Test enhanced tool discovery
node src/cli.js --claude-tools-list --format table

# Test tool inspection
node src/cli.js --claude-tools-inspect get_issue
```

### Expected Output

A successful installation should produce output similar to:

```bash
$ node src/cli.js --claude-tools-list --format table

┌─────────────────────────────┬──────────────┬─────────┬────────┬─────────────────────────────┐
│ Tool Name                   │ Server       │ Status  │ Type   │ Description                 │
├─────────────────────────────┼──────────────┼─────────┼────────┼─────────────────────────────┤
│ get_issue                   │ github       │ active  │ mcp    │ Get GitHub issue details    │
│ search_nodes                │ memory       │ active  │ mcp    │ Search memory nodes         │
│ sequentialthinking          │ thinking     │ active  │ mcp    │ Sequential reasoning tool   │
└─────────────────────────────┴──────────────┴─────────┴────────┴─────────────────────────────┘

🔧 Tool Discovery Summary: 20 tools found across 5 servers
```

### Diagnostic Commands

If you encounter issues, run these diagnostic commands:

```bash
# Check Node.js version
node --version  # Should be 16+

# Check Claude Code installation
claude --version
claude mcp list

# Check Claude Tool Discovery installation
node src/cli.js --version  # If implemented
ls -la src/scanners/claude-tool-discovery.js

# Check dependencies
npm list
```

## Configuration

### Environment Configuration

Claude Tool Discovery inherits configuration from Claude Code but can be customized:

#### Claude Code Configuration Paths

The tool automatically detects and uses these configuration files:

- `~/.claude/settings.json` (Global configuration)
- `~/.claude/settings.local.json` (Local overrides)
- `./claude/settings.local.json` (Project-specific)

#### Custom Configuration (Optional)

Create a project-specific configuration file:

```bash
# Create project configuration directory
mkdir -p .claude

# Create local settings
cat > .claude/settings.local.json << EOF
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

### Performance Tuning

For optimal performance, consider these configuration options:

#### Timeout Settings

Adjust command timeouts for your environment:

```javascript
// In src/scanners/claude-tool-discovery.js (if customizing)
const timeout = process.env.CTD_TIMEOUT || 5000;  // 5 second default
```

#### Discovery Method Priority

Configure discovery method preferences:

```bash
# Environment variables (optional)
export CTD_CONFIG_FIRST=true     # Prioritize config file parsing
export CTD_SKIP_DEBUG=true       # Skip debug output parsing
export CTD_CACHE_RESULTS=true    # Enable result caching
```

## Platform-Specific Instructions

### macOS

```bash
# Install Xcode Command Line Tools (if not installed)
xcode-select --install

# Install Node.js via Homebrew (recommended)
brew install node

# Install Claude Code CLI
# Follow Claude Code installation instructions

# Clone and install CTDiscovery
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery
git checkout feature/claude-tools-cli-simple
npm install
```

### Linux (Ubuntu/Debian)

```bash
# Update package manager
sudo apt update

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Git (if not installed)
sudo apt-get install git

# Install Claude Code CLI
# Follow Claude Code installation instructions

# Clone and install CTDiscovery
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery
git checkout feature/claude-tools-cli-simple
npm install
```

### Windows (WSL)

```bash
# In WSL terminal
# Install Node.js via NodeSource
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install Claude Code CLI in WSL
# Follow Claude Code installation instructions

# Clone and install CTDiscovery
git clone https://github.com/your-org/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery
git checkout feature/claude-tools-cli-simple
npm install

# Add to PATH (optional)
echo 'export PATH=$PATH:/path/to/ClaudeToolDiscovery' >> ~/.bashrc
source ~/.bashrc
```

## Docker Installation

For containerized environments:

### Dockerfile

```dockerfile
FROM node:18-alpine

# Install Git and basic tools
RUN apk add --no-cache git bash

# Install Claude Code CLI
# (Add Claude Code installation steps)

# Clone and install CTDiscovery
WORKDIR /app
RUN git clone https://github.com/your-org/ClaudeToolDiscovery.git .
RUN git checkout feature/claude-tools-cli-simple
RUN npm install

# Create entrypoint
COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["--help"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  claude-tool-discovery:
    build: .
    volumes:
      - ~/.claude:/root/.claude:ro  # Mount Claude configuration
      - .:/workspace                # Mount current directory
    working_dir: /workspace
    command: node src/cli.js --claude-tools-list --format json
```

### Usage

```bash
# Build container
docker build -t claude-tool-discovery .

# Run tool discovery
docker run --rm -v ~/.claude:/root/.claude:ro claude-tool-discovery --claude-tools-list

# Interactive mode
docker run --rm -it -v ~/.claude:/root/.claude:ro claude-tool-discovery bash
```

## Development Installation

For contributors and developers:

### Development Setup

```bash
# Fork and clone the repository
git clone https://github.com/your-username/ClaudeToolDiscovery.git
cd ClaudeToolDiscovery

# Switch to development branch
git checkout feature/claude-tools-cli-simple

# Install dependencies including dev dependencies
npm install

# Install development tools
npm install -g nodemon prettier eslint

# Set up pre-commit hooks
npm run setup-hooks  # If available
```

### Testing Setup

```bash
# Install test dependencies
npm install --save-dev jest @types/jest

# Run tests
npm test

# Run with coverage
npm run test:coverage

# Run linting
npm run lint
```

### Development Environment Variables

```bash
# Create .env file for development
cat > .env << EOF
NODE_ENV=development
DEBUG=claude-tool-discovery:*
CTD_TIMEOUT=10000
CTD_CONFIG_FIRST=true
EOF
```

## Troubleshooting Installation

### Common Issues

#### Node.js Version Conflicts

```bash
# Check Node.js version
node --version

# If using older version, update:
# Using nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

#### Claude Code CLI Not Found

```bash
# Verify Claude Code installation
which claude
claude --version

# If not found, reinstall Claude Code CLI
# Follow official Claude Code installation guide

# Check PATH
echo $PATH
```

#### Permission Errors

```bash
# Fix npm permissions (Linux/macOS)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Alternative: use nvm instead of system Node.js
```

#### Git Clone Issues

```bash
# If GitHub access issues
git clone https://github.com/your-org/ClaudeToolDiscovery.git

# Try HTTPS instead of SSH
git remote set-url origin https://github.com/your-org/ClaudeToolDiscovery.git

# Or download zip instead
curl -LO https://github.com/your-org/ClaudeToolDiscovery/archive/refs/heads/feature/claude-tools-cli-simple.zip
```

#### MCP Server Connection Issues

```bash
# Check MCP server configuration
claude mcp list

# Restart Claude Code if needed
# Check ~/.claude/settings.json for proper MCP configuration

# Test with minimal configuration
cat > ~/.claude/settings.json << EOF
{
  "permissions": {
    "allow": ["mcp__github__get_issue"]
  }
}
EOF
```

### Debug Mode

Enable debug mode for detailed troubleshooting:

```bash
# Enable debug output
DEBUG=* node src/cli.js --claude-tools-list

# Or specific debug namespace
DEBUG=claude-tool-discovery:* node src/cli.js --claude-tools-list

# Check all file paths
ls -la ~/.claude/
ls -la src/scanners/
```

### Getting Help

If installation issues persist:

1. **Check System Requirements**: Verify all prerequisites are met
2. **Review Error Messages**: Look for specific error codes or messages
3. **Check Documentation**: Review [Troubleshooting Guide](TROUBLESHOOTING.md)
4. **File an Issue**: Create a GitHub issue with:
   - Operating system and version
   - Node.js version (`node --version`)
   - Claude Code version (`claude --version`)
   - Complete error output
   - Installation method attempted

## Next Steps

After successful installation:

1. **Read the User Guide**: [USER-GUIDE.md](USER-GUIDE.md) for usage instructions
2. **Explore Examples**: [EXAMPLES.md](EXAMPLES.md) for practical use cases
3. **Check API Reference**: [API-REFERENCE.md](API-REFERENCE.md) for programmatic usage
4. **Review Architecture**: [TECHNICAL-SPECIFICATION.md](TECHNICAL-SPECIFICATION.md) for implementation details

## Uninstallation

To remove Claude Tool Discovery:

### Local Installation

```bash
# Remove the cloned directory
rm -rf ClaudeToolDiscovery

# Remove any custom configurations (optional)
rm -rf .claude/settings.local.json
```

### Global Installation

```bash
# Remove global npm link
npm unlink

# Remove global command
sudo rm /usr/local/bin/ctdiscovery

# Remove the installation directory
rm -rf ClaudeToolDiscovery
```

### Docker Installation

```bash
# Remove Docker images
docker rmi claude-tool-discovery

# Remove containers
docker container prune
```

---

**Support**: For installation assistance, please refer to our [Troubleshooting Guide](TROUBLESHOOTING.md) or file an issue on GitHub.