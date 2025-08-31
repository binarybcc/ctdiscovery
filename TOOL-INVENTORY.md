# Tool Inventory & Discovery System

**🔄 AUTOMATED BY CTDISCOVERY - Run `npm run scan` to update**

**Purpose**: Track available tools, discover new capabilities, and maintain awareness of our development arsenal.

## Quick Tool Status Commands

```bash
# Get conversation starter for Claude
npm run tools              # Shows tools in copy-paste format

# Update tool context files  
npm run scan              # Generates .ctdiscovery-context.md

# Quick context generation
npm run context           # Just creates context file

# Full scan with display
npm start                 # Traditional scan output
```

## Current Tool Inventory

### **System Tools (Always Available)**
- ✅ **File Operations**: Read, Write, Edit, MultiEdit, Glob, Grep, LS
- ✅ **Shell Access**: Bash commands with extensive permissions
- ✅ **macOS Integration**: osascript (AppleScript), open commands
- ✅ **Web Access**: WebFetch, WebSearch for research

### **Development Environment**
- ✅ **VS Code Integration**: `mcp__ide__getDiagnostics`, `mcp__ide__executeCode`
- ✅ **Node.js Ecosystem**: npm, npx, node commands
- ✅ **Python Support**: python3 execution, Jupyter notebook support
- ✅ **Browser Automation**: Puppeteer MCP for testing and screenshots

### **Documentation & Research**
- ✅ **Context7**: `mcp__context7__resolve-library-id`, `mcp__context7__get-library-docs`
- ✅ **Firecrawl**: `mcp__firecrawl__firecrawl_scrape`, `mcp__firecrawl__firecrawl_search`
- ✅ **Library Documentation**: Up-to-date docs for any framework/library

### **Project-Specific Permissions**
- ✅ **Edwards Group Domains**: All company websites accessible
- ✅ **Local Development**: File manipulation, server startup, testing
- ✅ **Build Tools**: npm scripts, bundlers, testing frameworks

## Tool Discovery Protocol - AUTOMATED

### **Automated Discovery System**
CTDiscovery automatically scans for:
- ✅ MCP Servers (context7, firecrawl, etc.)
- ✅ VS Code Extensions with AI relevance detection
- ✅ System Development Tools (git, node, python, docker, etc.)
- ✅ Claude Code Configuration and Permissions

### **Claude's Updated Responsibilities**
```
When I encounter a task, I should:
1. Check: Reference .ctdiscovery-context.md for current tools
2. Ask: "Should I refresh tool awareness?" (every 10-15 messages)
3. Suggest: "Run 'npm run tools' for current status"
4. Reference: Use tool context for capability-aware suggestions
```

### **User's Discovery Process**
```
When you install new tools:
1. Add them to this inventory with ✅ or 🆕 status
2. Update .claude/settings.local.json if needed
3. Tell me about the tool's capabilities
4. Ask me to test/explore the tool
```

## Tool Status Tracking

### **Legend**
- ✅ **Confirmed Available**: Tool tested and working
- 🆕 **Recently Added**: New tool, needs exploration  
- ❓ **Unconfirmed**: Might be available, needs checking
- ❌ **Not Available**: Confirmed not installed/accessible
- 🔄 **Needs Update**: Tool available but outdated

### **Discovered Tools (Need Confirmation)**
- ❓ **Docker/OrbStack**: Container management
- ❓ **Git**: Version control (likely available)
- ❓ **Homebrew**: Package management (brew commands work)
- ❓ **VS Code Extensions**: Additional language support, linting
- ❓ **Additional MCPs**: Other Model Context Protocol servers

### **Tool Exploration Queue**
- [ ] Run MCP discovery commands
- [ ] Test container tool availability  
- [ ] Explore VS Code extension capabilities
- [ ] Check for additional development frameworks
- [ ] Verify build tool availability

## Automated Discovery Script

### **Claude Should Run This Periodically**
```bash
#!/bin/bash
# Tool Discovery Script - Run when starting new projects

echo "=== MCP SERVERS ==="
claude code mcp list --verbose 2>/dev/null || echo "Could not list MCP servers"

echo -e "\n=== DEVELOPMENT TOOLS ==="
for tool in git node npm python3 php ruby go rust; do
    if which $tool >/dev/null 2>&1; then
        version=$(${tool} --version 2>/dev/null | head -n1)
        echo "✅ $tool: $version"
    else
        echo "❌ $tool: not found"
    fi
done

echo -e "\n=== BUILD TOOLS ==="
for tool in webpack vite gulp grunt parcel rollup; do
    if which $tool >/dev/null 2>&1; then
        echo "✅ $tool: available"
    else
        echo "❌ $tool: not found"
    fi
done

echo -e "\n=== CONTAINER TOOLS ==="
for tool in docker orbstack podman; do
    if which $tool >/dev/null 2>&1; then
        echo "✅ $tool: available"
    else
        echo "❌ $tool: not found"
    fi
done

echo -e "\n=== TESTING FRAMEWORKS ==="
for tool in jest cypress playwright mocha vitest; do
    if which $tool >/dev/null 2>&1; then
        echo "✅ $tool: available"
    else
        echo "❌ $tool: not found"
    fi
done

echo -e "\n=== VS CODE EXTENSIONS ==="
if which code >/dev/null 2>&1; then
    echo "✅ VS Code CLI available"
    echo "Extensions count: $(code --list-extensions 2>/dev/null | wc -l)"
else
    echo "❌ VS Code CLI not available"
fi
```

## Communication Protocol

### **When I Discover New Tools**
```
Format: "🔍 TOOL DISCOVERY: Found [tool-name]
- Capability: [what it does]
- Status: [available/needs-setup/permission-needed]
- Potential Use: [how it could help our projects]
- Action Needed: [what you should do]"
```

### **When You Add New Tools**  
```
Format: "🆕 NEW TOOL: [tool-name]
- Purpose: [why you installed it]
- Capabilities: [what it can do]
- Integration: [how I should use it]
- Permissions: [what access I need]"
```

## Tool Update Monitoring

### **I Should Periodically Check:**
- [ ] Are there newer versions of tools we use?
- [ ] Have new MCP servers become available?
- [ ] Are there VS Code extensions that could improve our workflow?
- [ ] Have development frameworks introduced new features?

### **Update Notification Format**
```
"📦 UPDATE AVAILABLE: [tool-name]
- Current: [current version]
- Available: [new version] 
- Benefits: [what's new/improved]
- Recommendation: [should we update?]"
```

---

## Next Actions

1. **Claude**: Run tool discovery script to populate confirmed tools
2. **User**: Review and confirm/correct the discoveries
3. **Both**: Establish regular tool inventory updates
4. **Claude**: Include tool awareness in interrogation protocol

**Goal**: Maintain complete awareness of our development capabilities and continuously improve our toolset.