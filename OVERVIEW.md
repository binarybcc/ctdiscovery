# CTDiscovery Overview

**CTDiscovery** is a non-destructive AI development environment scanner that solves the "AI awareness gap" - helping AI assistants understand your specific development setup for more targeted assistance.

## What It Does

CTDiscovery automatically scans your development environment and generates AI-ready context files in under 3 seconds. It detects:

- **Development tools** (git, node, python, docker, etc.)
- **MCP servers** (Claude Code, custom servers)
- **VS Code extensions** (with AI-relevance filtering)
- **System configuration** (platform, paths, versions)

## Files Created

### 1. `.ctdiscovery-context.md`
**Purpose**: Claude reference file for current conversation  
**Contains**: Structured list of available tools with versions and capabilities  
**Usage**: Automatically generated for Claude to understand your environment

```markdown
# CTDiscovery Tool Context
**Generated:** 2025-08-29T15:08:47.545Z
**Platform:** darwin

## Available Tools by Category
### System-tool
**🟢 AVAILABLE:**
  - git (2.50.1) - Distributed version control system
  - node (22.18.0) - JavaScript runtime environment
  ...
```

### 2. `.ctdiscovery-conversation-starter.txt`
**Purpose**: Copy-paste text for starting new Claude conversations  
**Contains**: Formatted tool list ready for Claude consumption  
**Usage**: Copy and paste into new Claude conversations to give instant context

```
Here are my currently available development tools:

🟢 ACTIVE TOOLS:
• git (2.50.1) • node (22.18.0) • docker (28.2.2) • VS Code (1.103.2)
• python (3.12.4) • npm (10.9.3) • brew (4.6.4) • claude (1.0.96)

Please provide tool-specific advice based on these available tools.
```

## Command Reference

| Command | Purpose | Output |
|---------|---------|--------|
| `npm run scan` | Full dashboard + generates both context files | Terminal dashboard + files |
| `npm run tools` | Shows conversation starter text | Copy-paste ready text |
| `npm run dashboard` | Clean status display only | Terminal dashboard only |
| `npm run watch` | Auto-refresh every 30s | Continuous monitoring |
| `npm start` | Detailed technical output | Full scan results |

## Typical Workflow

### 1. Initial Setup
```bash
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
npm install
```

### 2. Generate Tool Context
```bash
npm run scan
# Creates .ctdiscovery-context.md and .ctdiscovery-conversation-starter.txt
```

### 3. Start AI Conversation
Copy content from `.ctdiscovery-conversation-starter.txt` and paste into new Claude conversation for instant tool awareness.

### 4. Ongoing Monitoring
```bash
npm run watch    # Keep dashboard running
npm run tools    # Refresh conversation starter when tools change
```

## Architecture

**Non-destructive**: Never modifies your system - only reads and reports  
**Fast**: <3 second scan times with sequential processing  
**Extensible**: Plugin architecture for adding new scanner types  
**Safe**: Graceful error handling if tools are unavailable  

## Use Cases

- **Starting new projects**: Know exactly what tools are available
- **AI assistance**: Give Claude/AI accurate tool context for better advice
- **Team onboarding**: Quickly assess development environment setup
- **System auditing**: Regular monitoring of tool availability
- **Troubleshooting**: Identify missing or outdated development tools

## Integration with AI Assistants

CTDiscovery is specifically designed to work with Claude and other AI assistants:

1. **Context files** provide structured tool information
2. **Conversation starters** give instant tool awareness
3. **Regular updates** keep AI context current
4. **Tool-specific advice** becomes possible instead of generic suggestions

The generated files eliminate the "what tools do I have?" question and enable AI assistants to provide targeted, actionable advice from the first message.