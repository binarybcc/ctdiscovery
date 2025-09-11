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

## System Structure
```
your-projects-root/
├── CLAUDE-UNIVERSAL-CONFIG.md       # Universal AI collaboration standards
├── PROJECT-STARTUP-CHECKLIST.md    # Architecture decision frameworks
├── TOOL-INVENTORY-TEMPLATE.md       # Tool discovery system
├── .claude/settings.local.json     # Universal Claude permissions
├── init-project.sh                 # Project creation script
├── README.md                       # This documentation
├── project-1/
│   ├── CLAUDE.md                    # Project-specific context
│   ├── .claude/settings.local.json # Project permissions
│   ├── README.md                    # Project documentation
│   └── .gitignore                   # Project-appropriate ignores
└── project-2/
    ├── CLAUDE.md
    ├── .claude/settings.local.json
    ├── README.md
    └── .gitignore
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
🔍 TOOL DISCOVERY DASHBOARD
══════════════════════════════════════════════════
📊 Scan: 2383ms | 44 tools | 44 active

📦 MCP Servers:
   ● ACTIVE:
      • claude-flow
      • @anthropic-ai/claude-code
      • sequential-thinking

📦 VSCode:
   ● ACTIVE:
      • Claude Code for VSCode
      • GitLens — Git supercharged
      • Python
      • ESLint
      • Prettier - Code formatter
      [... 17 more extensions]

📦 System Tools:
   ● AVAILABLE:
      • git (2.50.1)
      • node (22.17.0)
      • python (3.12.4)
      • docker (28.3.3)
      [... 14 more tools]
══════════════════════════════════════════════════
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
CTDiscovery provides detailed analysis of your VSCode extensions:

```bash
ctd --json | jq '.status.vscode.data[] | select(.aiRelevant == true)'
# Shows only AI-relevant extensions with full metadata
```

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
## Contributing
To add new project types or improve methodologies:
1. Update the relevant universal files
2. Test with `./init-project.sh new-type test-project`
3. Verify all generated files and folder structure
4. Update documentation

---
**Created with Claude Code - AI-Assisted Development**
