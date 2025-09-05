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