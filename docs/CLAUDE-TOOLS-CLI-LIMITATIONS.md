# Claude Tools CLI - Limitations Guide
## Understanding Technical Constraints & Workarounds

> **⚠️ Important**: This implementation provides functional equivalence to the GitHub request but cannot access Claude Code's internal systems due to technical barriers.

---

## 📋 **Table of Contents**

1. [Critical Limitations](#critical-limitations)
2. [Technical Barriers](#technical-barriers) 
3. [Data Source Differences](#data-source-differences)
4. [Behavioral Differences](#behavioral-differences)
5. [Workarounds & Alternatives](#workarounds--alternatives)
6. [When NOT to Use](#when-not-to-use)
7. [Future Improvements](#future-improvements)

---

## 🚨 **Critical Limitations**

### **❌ No Access to Claude Code's Internal State**

**What this means:**
- We cannot access Claude Code's live MCP connections
- We cannot see Claude Code's runtime permission states
- We cannot use Claude Code's internal data structures
- We cannot provide real-time change notifications

**Impact:**
- Tool lists may differ from what Claude Code actually sees
- Permission states may not match Claude Code's runtime permissions
- Data format differs from Claude Code's internal format

### **❌ Static Scanning vs. Live State**

**What this means:**
- We scan your system at a point in time
- We cannot monitor live changes to tool availability
- We cannot see active MCP sessions that Claude Code maintains

**Impact:**
- Requires manual re-scanning to detect changes
- May show tools as available when Claude Code cannot access them
- Cannot provide `list_changed` notifications for tools watch

---

## 🔧 **Technical Barriers**

### **1. Internal MCP Manager Access**

#### **GitHub Requirement:**
> *"Source-of-truth should be the internal MCP manager that holds active server connections and tool registries (post-permission resolution)."*

#### **Our Limitation:**
```
❌ CANNOT ACCESS: Claude Code's internal MCP manager
✅ OUR APPROACH: External MCP detection via settings analysis

Why: Claude Code's internal systems are not exposed to external tools
Impact: May show different MCP servers than Claude Code's active session
```

#### **What We Do Instead:**
- Parse Claude Code settings files (`~/.claude/settings.local.json`)
- Detect MCP server configurations from external files
- Validate MCP server availability through external checks

#### **Difference in Practice:**
```bash
# What Claude Code might see internally
claude_internal_mcp_manager.get_active_servers()
# → [server1: connected, server2: failed_auth, server3: permission_denied]

# What we detect externally  
node src/cli.js --mcp-servers --format json
# → [server1: active, server2: active, server3: active]  # Based on config only
```

### **2. System Message Structs**

#### **GitHub Requirement:**
> *"Reuse any existing structs used to build system messages, but ensure they reflect the live, current set of tools."*

#### **Our Limitation:**
```
❌ CANNOT ACCESS: Claude Code's internal data structures
✅ OUR APPROACH: CTDiscovery-native data structures

Why: Internal structs are not exposed to external applications  
Impact: JSON schema differs from Claude Code's internal format
```

#### **Format Comparison:**
```json
// Claude Code Internal (hypothetical)
{
  "tools": {
    "mcp_servers": {
      "github": {
        "status": "connected",
        "permissions": ["read_repos", "write_issues"],
        "session_id": "abc123"
      }
    }
  }
}

// Our External Format
{
  "version": 1,
  "tools": [
    {
      "name": "github__search_repositories", 
      "status": "active",
      "category": "mcp-server",
      "metadata": {
        "configPath": "~/.claude/settings.local.json"
      }
    }
  ]
}
```

### **3. Permission Resolution**

#### **GitHub Requirement:**
> *"Tool registries (post-permission resolution)"*

#### **Our Limitation:**
```
❌ CANNOT ACCESS: Claude Code's runtime permission states
✅ OUR APPROACH: Detection-based availability checking

Why: Permission resolution happens inside Claude Code's runtime
Impact: May show tools as available when permissions would deny access
```

#### **Permission State Differences:**
```bash
# What Claude Code knows internally
internal_permission_resolver.check("github", "read_repos") 
# → false (user denied permission)

# What we can detect
node src/cli.js --tools-inspect github --format json
# → {"status": "active"} (config exists, appears available)
```

### **4. Live Change Monitoring**

#### **GitHub Requirement:**
> *"Consider emitting list_changed notifications to power tools watch as a follow-up."*

#### **Our Limitation:**
```
❌ CANNOT PROVIDE: Real-time change notifications
✅ OUR APPROACH: Static point-in-time scanning

Why: No access to Claude Code's event system
Impact: Must manually re-scan to detect changes
```

---

## 📊 **Data Source Differences**

### **MCP Server Detection**

| Aspect | Claude Code (Internal) | Our Implementation |
|--------|----------------------|-------------------|
| **Data Source** | Internal MCP manager | Settings file parsing |
| **Connection State** | Live connection status | Config-based detection |
| **Permission State** | Runtime permissions | External validation |
| **Session Info** | Active sessions | Configuration only |
| **Error Details** | Runtime errors | Detection errors |

### **Tool Availability**

| Aspect | Claude Code (Internal) | Our Implementation |
|--------|----------------------|-------------------|
| **System Tools** | Permission-aware | Command availability |
| **VSCode Extensions** | Live extension state | Extension registry |
| **MCP Tools** | Post-permission tools | Pre-permission tools |
| **Status Resolution** | Runtime resolution | External validation |

---

## 🔄 **Behavioral Differences**

### **1. Tool Discovery Scope**

**Claude Code (Expected):**
```bash
# Might show only tools Claude Code can actually access
claude tools list
# → git, docker (but not python - permission denied)
```

**Our Implementation:**
```bash  
# Shows tools detected in environment
node src/cli.js --tools-list --filter git,docker,python
# → git, docker, python (all detected, may not all be accessible to Claude)
```

### **2. MCP Server States**

**Claude Code (Expected):**
```bash
# Live connection states
claude mcp servers
# → github: connected, memory: auth_failed, context7: permission_denied
```

**Our Implementation:**
```bash
# Configuration-based states  
node src/cli.js --mcp-servers
# → github: active, memory: active, context7: active
```

### **3. Error Reporting**

**Claude Code (Expected):**
- Runtime permission errors
- Connection failures  
- Authentication issues
- Protocol errors

**Our Implementation:**
- Configuration not found
- Tool not installed
- External validation failures
- Scanning timeouts

---

## 🛠️ **Workarounds & Alternatives**

### **1. Validate Against Claude Code**

```bash
# Our detection
node src/cli.js --tools-list --format json > our-tools.json

# Compare with Claude Code behavior
# (Manual verification in Claude Code session)
echo "Verify these tools are actually available in Claude Code:"
jq -r '.tools[].name' our-tools.json
```

### **2. Permission-Aware Filtering**

```bash
# Use our detection as starting point, then validate manually
DETECTED_TOOLS=$(node src/cli.js --tools-list --filter mcp --format json | jq -r '.tools[].name')

echo "Detected MCP tools - verify permissions in Claude Code:"
echo "$DETECTED_TOOLS"
```

### **3. Cross-Reference with Claude Settings**

```bash
# Check what we detected against actual Claude settings
node src/cli.js --mcp-servers --format json > detected-mcp.json

echo "Compare with your Claude settings:"
if [ -f ~/.claude/settings.local.json ]; then
  jq '.mcp' ~/.claude/settings.local.json
else
  echo "Claude settings not found at expected location"
fi
```

### **4. Status Verification Scripts**

```bash
#!/bin/bash
# Verify tool actually works (basic validation)
verify_tool() {
  local tool=$1
  case $tool in
    "git")
      git --version >/dev/null 2>&1 && echo "✅ $tool works" || echo "❌ $tool failed"
      ;;
    "docker")
      docker --version >/dev/null 2>&1 && echo "✅ $tool works" || echo "❌ $tool failed"
      ;;
    "node")
      node --version >/dev/null 2>&1 && echo "✅ $tool works" || echo "❌ $tool failed"
      ;;
  esac
}

# Test tools we detected
TOOLS=$(node src/cli.js --tools-list --filter system-tool --format json | jq -r '.tools[].name')
for tool in $TOOLS; do
  verify_tool "$tool"
done
```

---

## 🚫 **When NOT to Use**

### **❌ Don't Use When You Need:**

#### **1. Exact Claude Code Compatibility**
```bash
# DON'T: Expect identical tool lists
node src/cli.js --tools-list
# This may show different tools than Claude Code actually has access to
```

#### **2. Real-Time Permission Validation**  
```bash
# DON'T: Assume tool availability = Claude Code accessibility
STATUS=$(node src/cli.js --tools-inspect github --format json | jq -r '.tool.status')
# This doesn't guarantee Claude Code can actually use GitHub tools
```

#### **3. Live Change Monitoring**
```bash  
# DON'T: Expect automatic updates
node src/cli.js --tools-list > snapshot1.json
# ... time passes, Claude Code settings change ...
# snapshot1.json won't automatically update
```

#### **4. Claude Code Integration**
```bash
# DON'T: Try to pass our data directly to Claude Code
node src/cli.js --tools-list --format json | claude-code-command
# Data format may not be compatible
```

### **✅ DO Use When You Need:**

#### **1. Environment Auditing**
```bash
# Good: Check what development tools are available
node src/cli.js --tools-list --format table
```

#### **2. Development Setup Validation**
```bash
# Good: Verify development environment setup
node src/cli.js --tools-inspect docker --format json
```

#### **3. MCP Configuration Overview**
```bash
# Good: See what MCP servers are configured
node src/cli.js --mcp-servers --format table
```

#### **4. Automation & CI/CD**
```bash
# Good: Generate environment reports
node src/cli.js --tools-list --format json > environment-report.json
```

---

## 🔮 **Future Improvements**

### **Potential Enhancements** (if Claude Code provides APIs)

#### **1. Claude Code Integration API**
```bash  
# Hypothetical future capability
node src/cli.js --tools-list --source claude-code-api
# Could access internal state if Claude Code exposes APIs
```

#### **2. Permission Validation**
```bash
# Hypothetical future capability  
node src/cli.js --tools-list --validate-permissions
# Could check actual Claude Code permissions if API available
```

#### **3. Real-Time Monitoring**
```bash
# Hypothetical future capability
node src/cli.js --tools-watch
# Could provide live updates if Claude Code supports webhooks
```

### **Current Roadmap Limitations**

**What we CANNOT add without Claude Code changes:**
- Access to internal MCP manager
- Live permission resolution
- Real-time change notifications  
- Claude Code's internal data structures

**What we COULD add with current architecture:**
- Better external validation
- More comprehensive tool detection
- Enhanced error reporting
- Improved caching and performance

---

## 📞 **Getting Help**

### **Understanding Differences**
1. **Run both tools**: Compare our output with Claude Code's actual behavior
2. **Check settings**: Verify Claude settings match our detection
3. **Manual validation**: Test tool functionality outside Claude Code

### **Reporting Issues**
When reporting issues, please specify:
- What our tool shows
- What Claude Code actually sees/does
- Your environment (OS, Claude Code version)
- Relevant configuration files

### **Best Practices**
1. **Use as starting point**: Our tool gives you a baseline
2. **Verify in Claude Code**: Always confirm functionality in actual Claude Code session  
3. **Update regularly**: Re-scan when you change configurations
4. **Cross-reference**: Compare with Claude Code's actual behavior

---

*Remember: This tool provides functional equivalence, not identical behavior. Use it as a comprehensive environment scanner that happens to support Claude Code-style commands.*