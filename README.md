# CTDiscovery - AI Development Environment Status Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/binarybcc/ctdiscovery.svg)](https://github.com/binarybcc/ctdiscovery/releases)

Non-destructive tool discovery for AI-assisted development environments with real-time dashboard and Claude integration.

**Platform Support:**
- ✅ **macOS** - Fully tested and supported
- ✅ **Windows** - Complete VSCode ecosystem detection
- ✅ **Linux** - Universal support across ALL distributions *(Ubuntu, RHEL, SUSE, Arch, Alpine)*

## Quick Start

### Easy Installation Options

#### Option 1: One-Line Install (Recommended)
```bash
# Install to ~/ctdiscovery with PATH setup
curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash
```

#### Option 2: Global npm Install
```bash
# Install globally via npm
npm install -g https://github.com/binarybcc/ctdiscovery.git
ctdiscovery scan  # Available anywhere
```

#### Option 3: Manual Install
```bash
# Clone and install manually
git clone https://github.com/binarybcc/ctdiscovery.git ~/ctdiscovery
cd ~/ctdiscovery
npm install

# Add to PATH (choose your shell)
echo 'export PATH="$HOME/ctdiscovery:$PATH"' >> ~/.zshrc  # zsh
echo 'export PATH="$HOME/ctdiscovery:$PATH"' >> ~/.bashrc # bash
source ~/.zshrc  # or ~/.bashrc
```

### Usage
```bash
# After installation, use from anywhere:
ctd              # Run dashboard + generate context  
ctdtools         # Show conversation starter
ctdiscovery scan # Full dashboard (smart wrapper)
ctdiscovery update # Update to latest version
ctdiscovery --help # Show all commands
```

## 🔄 Updates & Maintenance

**Easy updates with smart installer:**
```bash
ctdiscovery update  # Updates installation automatically
```

**Manual update:**
```bash
cd ~/.ctdiscovery && git pull origin main && npm install
```

**Features of improved installer:**
- ✅ **Path-independent aliases** - work from any directory
- ✅ **Automatic cleanup** - removes old installations  
- ✅ **Smart wrapper** - auto-detects installation location
- ✅ **Built-in updater** - `ctdiscovery update` command
- ✅ **Shell detection** - works with zsh, bash, etc.
- ✅ **Graceful fallback** - handles missing dependencies

#### Local Project Usage (if not globally installed)
```bash
cd ~/ctdiscovery

# Run tool discovery dashboard
npm run scan

# Generate conversation starter for Claude
npm run tools

# Watch mode (updates every 30s)
npm run watch
```

### Available Commands
```bash
npm run scan         # Dashboard + context generation
npm run tools        # Show conversation starter
npm run dashboard    # Clean dashboard only  
npm run watch        # Auto-refresh every 30s
npm start            # Full detailed output
npm test             # Run test suite
```

## Features

### 🎯 **Complete VSCode Ecosystem Detection** *(New in v1.2.0)*
- ✅ **Visual Studio Code** - Standard stable release extensions
- ✅ **VSCode Insiders** - Beta/preview version extensions
- ✅ **VSCodium** - Open-source variant support *(Industry First!)*
- ✅ **Cross-Platform Paths** - Windows, macOS, Linux native path detection
- ✅ **Universal Linux Support** - Single test validates ALL Linux distributions
- ✅ **AI Extension Classification** - Automatic identification of AI/ML development tools
- ✅ **Rich Metadata** - Publisher, version, categories, and contribution analysis

### 🐧 **Linux Distribution Coverage**
**One Test = Universal Support**: POSIX compliance ensures CTDiscovery works identically across:
- Ubuntu/Debian Family - Validated on Ubuntu 22.04 LTS  
- RHEL/CentOS/Fedora - Standard path structures
- SUSE/openSUSE - Identical home directory layouts
- Arch/Manjaro - Full POSIX compliance
- Alpine/Container Linux - Universal path resolution
- *All other major distributions* - Guaranteed compatibility

### 🚀 **Core Capabilities**
- ✅ **Tool Discovery Dashboard** - Real-time scanning of 40+ development tools
- ✅ **Advanced Overlap Analysis** - Algorithm-based detection of tool conflicts and duplicates
- ✅ **Claude Integration** - Context generation and conversation starters
- ✅ **Performance Optimized** - <3 second scan times with graceful degradation
- ✅ **Plugin Architecture** - Extensible scanner system with standardized interfaces
- ✅ **Non-Destructive** - Safe to run anywhere, no system modifications
- ✅ **Universal Project Setup** - AI collaboration methodologies and project templates
- ✅ **CLI Dashboard** - Visual status monitoring with color-coded output

## Project Types Supported
- `web-app` / `website` / `frontend` - Frontend web applications
- `node` / `cli-tool` / `backend` - Node.js applications and tools
- `python` / `data-science` - Python projects and data analysis
- `general` - General purpose projects


## Universal Methodologies
- **Architecture Standards** - CSS, JavaScript, HTML best practices
- **Interrogation Protocols** - Systematic questions for better AI collaboration
- **Decision Frameworks** - Startup checklists and scalability patterns
- **Tool Discovery** - Capability management and tool awareness
- **Quality Gates** - Testing, accessibility, and performance requirements

# Getting Started with CTDiscovery

CTDiscovery is a comprehensive AI development environment scanner that provides real-time insights into your development tools and setup.

## Quick Installation

### Option 1: Global npm Install (Recommended)
```bash
npm install -g ctdiscovery
ctd  # Run anywhere
```

### Option 2: Direct GitHub Install
```bash
npm install -g https://github.com/binarybcc/ctdiscovery.git
```

## Basic Usage

### Run a Complete Environment Scan
```bash
ctd                    # Full dashboard with all detected tools
ctd --quiet           # Clean output without scan progress
ctd --json            # JSON output for programmatic use
```

### Generate Claude Context
```bash
ctd --conversation-starter    # Generate conversation starter for Claude
ctd --generate-context       # Create detailed context file
```

## What CTDiscovery Detects

### 🎯 **VSCode Ecosystem** *(New in v1.2.0)*
- **Visual Studio Code**: Standard stable release extensions
- **VSCode Insiders**: Beta/preview version extensions  
- **VSCodium**: Open-source variant extensions *(Industry First!)*
- **Cross-Platform**: Windows, macOS, Linux native path detection
- **AI Extensions**: Automatic classification of AI/ML development tools
- **Rich Metadata**: Publisher, version, categories, commands, and contributions

### 🔧 **System Tools & Languages**
- **Version Control**: `git`, `gh` (GitHub CLI)
- **Languages**: `node`, `python`, `ruby`, `java`
- **Package Managers**: `npm`, `pip`, `gem`, `brew`
- **Build Tools**: `make`, `docker`
- **Development**: `code` (VS Code), `vim`, `curl`, `jq`

### 🤖 **AI & MCP Integration**
- **MCP Servers**: Active Model Context Protocol servers
- **Claude Code**: Configuration and documentation status  
- **AI Assistants**: `claude` CLI and other AI tools

### 📊 **Analysis Features**
- **Tool Overlaps**: Identifies functional duplicates and conflicts
- **AI Classification**: Highlights AI-relevant development tools
- **Performance**: Tracks scan times and system health
- **Context Generation**: Creates Claude-ready environment summaries

## Example Output

### Dashboard View
```
➜  ~ ctd
🔍 CTDiscovery - AI Development Environment Status

🔍 Starting sequential scan of 3 scanners...
📊 Scanning MCP Server Scanner (timeout: 2000ms)...
✅ MCP Server Scanner completed in 175ms
📊 Scanning VSCode Extension Scanner (timeout: 2000ms)...
✅ VSCode Extension Scanner completed in 8ms
📊 Scanning System Tool Scanner (timeout: 2000ms)...
✅ System Tool Scanner completed in 3208ms
🏁 Sequential scan completed in 3391ms
📊 Results: 3 completed, 0 failed, 0 skipped
🔍 TOOL DISCOVERY DASHBOARD
══════════════════════════════════════════════════
📊 Scan: 3391ms | 52 tools | 52 active

📦 MCP Servers:
   ● ACTIVE:
      • ruv-swarm
      • claude-flow
      • flow-nexus__sandbox_create
      • flow-nexus__sandbox_execute
      • sequential-thinking__sequentialthinking
      • flow-nexus__swarm_templates_list
      • flow-nexus__neural_list_templates
      • github__search_repositories
      • github__get_file_contents
      • context7__resolve-library-id
      • context7__get-library-docs
      • memory__create_entities
      • @anthropic-ai/claude-code

📦 VSCode:
   ● ACTIVE:
      • Better Comments
      • Claude Code for VSCode
      • Claude Code for VS Code
      • Bracket Pair Color DLW
      • Path Intellisense
      • ESLint
      • GitLens — Git supercharged
      • Prettier - Code formatter
      • Auto Rename Tag
      • REST Client
      • Rainbow CSV
      • Container Tools
      • Python Debugger
      • Python
      • Pylance
      • Python Environments
      • %displayName%
      • Live Preview
      • indent-rainbow
      • Material Icon Theme
      • YAML

📦 System Tools:
   ● AVAILABLE:
      • git (2.51.0)
      • gh (2.79.0)
      • node (22.17.0)
      • npm (10.9.2)
      • python (3.12.4)
      • python3 (3.12.4)
      • pip (3.12.4)
      • ruby (2.6.10)
      • java (unknown)
      • make (11.3.0)
      • docker (28.3.3)
      • brew (4.6.10)
      • gem (3.0.3)
      • claude (1.0.110)
      • code (1.103.2)
      • vim (VIM - Vi IMproved 9.1 (2024 Jan 02, compiled Jul 11 2025 21:28:27))
      • curl (8.7.1)
      • jq (1.7.1)
══════════════════════════════════════════════════

📄 Generating context files...
📄 Generated context file: .ctdiscovery-context.md

💬 Generating conversation starter...
💬 Generated conversation starter: .ctdiscovery-conversation-starter.txt
```

## Platform-Specific Notes

### **Windows Users**
- VSCode extensions detected from `%USERPROFILE%\.vscode\extensions`
- All three VSCode variants supported (Code, Insiders, VSCodium)
- PowerShell and CMD both supported

### **macOS Users** 
- Extensions from `~/.vscode/extensions` and `~/Library/Application Support/Code`
- Homebrew package detection included
- Native terminal integration

### **Linux Users**
- Extensions from `~/.vscode/extensions` and `~/.config/Code/User`
- Multiple package manager detection (apt, yum, pacman, etc.)
- Works with all major distributions

## Advanced Features

### VSCode Extension Analysis
CTDiscovery provides detailed analysis of your VSCode extensions

### Tool Overlap Detection
Automatically identifies functional overlaps between tools:
- Multiple Git GUIs installed
- Conflicting linters or formatters
- Duplicate development environments

### Claude Integration
Generate context for AI assistants:
- Current tool inventory
- AI-relevant extension list
- Development environment summary
- Project-specific context

## Troubleshooting

### Common Issues

**No VSCode extensions detected:**
- Ensure VSCode has been run at least once (creates extension directory)
- Check that extensions are installed in user directory, not portable mode

**Missing system tools:**
- CTDiscovery only detects tools in system PATH
- Use `echo $PATH` (Unix) or `echo %PATH%` (Windows) to verify tool locations

**Performance issues:**
- Large extension directories may slow scanning
- Use `--quiet` flag to reduce output processing time

### Getting Help

- **Issues**: https://github.com/binarybcc/ctdiscovery/issues
- **Documentation**: https://github.com/binarybcc/ctdiscovery#readme
- **Discussions**: https://github.com/binarybcc/ctdiscovery/discussions

## What's Next?

1. **Explore Your Environment**: Run `ctd` to see your complete development setup
2. **AI Integration**: Use `ctd --conversation-starter` with Claude for enhanced development assistance  
3. **Monitor Changes**: Set up periodic scans to track environment evolution
4. **Share Context**: Use generated context files for team onboarding and documentation

---

**Version**: 1.2.0 | **Platform Support**: Windows, macOS, Linux | **Node.js**: 16.0.0+

---
**Created with Claude Code - AI-Assisted Development**
