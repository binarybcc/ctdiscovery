# Branch Protection & Isolation Strategy
## Keeping Special Edition Separate from Main CTDiscovery

> **🛡️ Purpose**: Ensure this Claude Tools CLI special edition doesn't interfere with main CTDiscovery development and can be safely maintained in isolation.

---

## 📋 **Table of Contents**

1. [Branch Strategy](#branch-strategy)
2. [File Organization](#file-organization)
3. [Code Isolation](#code-isolation)
4. [Documentation Separation](#documentation-separation)
5. [Testing Isolation](#testing-isolation)
6. [Git Workflow Protection](#git-workflow-protection)
7. [Future Maintenance](#future-maintenance)

---

## 🌲 **Branch Strategy**

### **Current Branch Structure**
```
main                           ← Core CTDiscovery (clean)
├── feature/enhancement-*      ← Regular CTDiscovery features  
├── feature/bug-fix-*         ← Regular bug fixes
└── feature/claude-tools-cli-simple  ← THIS SPECIAL EDITION
    ├── Enhanced CLI with Claude Tools commands
    ├── Extended argument parsing  
    ├── New output formats (table, versioned JSON)
    ├── Claude Tools CLI documentation
    └── Isolated test suites
```

### **Branch Protection Rules**

#### **✅ Safe to Merge INTO This Branch**
- Updates from main (via rebase/merge)
- Bug fixes that don't affect core functionality
- Documentation improvements
- Test enhancements

#### **❌ NEVER Merge FROM This Branch To Main**
- Claude Tools CLI commands (`--tools-list`, `--tools-inspect`, etc.)
- Extended argument parsing for Claude Tools options
- New display methods (`displayToolsTable`, `displayMcpServersTable`)
- Versioned JSON output format
- Claude Tools CLI documentation

#### **🔄 Selective Cherry-Pick Only**
- General bug fixes in scanners (evaluate case-by-case)
- Performance improvements in core scanning (if beneficial)
- Security patches (always safe to backport)

---

## 📁 **File Organization**

### **Files Modified in This Branch**
```
src/cli.js                     ← EXTENDED (not replaced)
├── Added Claude Tools CLI argument parsing
├── Added new command handlers  
├── Added new display methods
└── Extended help text

src/test/
├── claude-tools-cli.test.js           ← NEW (Claude Tools unit tests)
└── claude-tools-integration.test.js   ← NEW (Claude Tools integration tests)

docs/
├── RELEASE-NOTES-CLAUDE-TOOLS-CLI.md        ← NEW
├── CLAUDE-TOOLS-CLI-GETTING-STARTED.md      ← NEW  
├── CLAUDE-TOOLS-CLI-USAGE.md                ← NEW
├── CLAUDE-TOOLS-CLI-LIMITATIONS.md          ← NEW
└── CLAUDE-TOOLS-CLI-BRANCH-PROTECTION.md    ← NEW (this file)
```

### **Files NOT Modified**
```
src/scanners/              ← Unchanged (core scanning logic)
src/display/              ← Unchanged (original display system)
src/generators/           ← Unchanged (context generators)
src/utils/                ← Unchanged (utility functions)
package.json              ← Only version bump, no new dependencies
README.md                 ← Unchanged (main project documentation)
.gitignore                ← Only additions, no core changes
```

### **Clean Separation Strategy**

#### **✅ Extension Pattern Used**
```javascript
// In src/cli.js - we EXTENDED existing functionality
class CTDiscovery {
  // ... existing methods unchanged ...
  
  // NEW: Added Claude Tools CLI handlers
  async handleToolsList(options) { /* new */ }
  async handleToolsInspect(toolName, options) { /* new */ }
  async handleMcpServers(options) { /* new */ }
  async handleMcpInspect(serverName, options) { /* new */ }
  
  // NEW: Added display methods
  displayToolsTable(tools) { /* new */ }
  displayMcpServersTable(servers) { /* new */ }
}
```

#### **❌ Avoided Modification Pattern**
```javascript
// We DID NOT modify existing methods like:
run() { 
  // Original CTDiscovery logic unchanged
  // Added new conditional branches only
}

displayDiscoveryDashboard() { /* unchanged */ }
calculateSummaryStats() { /* unchanged */ }
extractAllTools() { /* unchanged - was new utility */ }
```

---

## 🧩 **Code Isolation**

### **Isolation Boundaries**

#### **1. Command Routing Isolation**
```javascript
// In src/cli.js run() method
async run(options = {}) {
  // NEW: Claude Tools CLI routing (isolated block)
  if (options.toolsList) {
    return await this.handleToolsList(options);
  }
  if (options.toolsInspect) {
    return await this.handleToolsInspect(options.toolsInspect, options);
  }
  // ... other Claude Tools commands ...
  
  // EXISTING: Original CTDiscovery logic (unchanged)
  console.log('🔍 CTDiscovery - AI Development Environment Status\n');
  // ... rest of original logic ...
}
```

#### **2. Argument Parsing Isolation**  
```javascript
// Isolated Claude Tools options
const claudeToolsOptions = {
  toolsList: args.includes('--tools-list'),
  toolsInspect: getArgValue(args, '--tools-inspect'),
  mcpServers: args.includes('--mcp-servers'),
  mcpInspect: getArgValue(args, '--mcp-inspect'),
  format: getArgValue(args, '--format') || 'human',
  filter: getArgValue(args, '--filter'),
  status: getArgValue(args, '--status')
};

// Original CTDiscovery options (unchanged)
const options = {
  dev: args.includes('--dev'),
  verbose: args.includes('--verbose'),
  json: args.includes('--json'),
  // ... other original options ...
  ...claudeToolsOptions  // Clean merge
};
```

#### **3. Method Namespace Isolation**
```javascript
// Original CTDiscovery methods (unchanged)
displayDiscoveryDashboard()
calculateSummaryStats()  
formatCategoryName()
getCategoryStatus()
getStatusIcon()
getStatusColor()

// NEW: Claude Tools CLI methods (isolated namespace)
handleToolsList()
handleToolsInspect() 
handleMcpServers()
handleMcpInspect()
displayToolsTable()
displayMcpServersTable()
extractAllTools()  // Utility for Claude Tools
applyFilters()     // Utility for Claude Tools
```

### **Dependencies Isolation**

#### **✅ No New Dependencies Added**
- Uses only existing CTDiscovery infrastructure
- Leverages existing scanner classes unchanged
- Reuses existing error handling and utilities

#### **✅ Clean Import Strategy**
```javascript
// All imports unchanged from main CTDiscovery
import { EnvironmentScanner } from './scanners/environment-scanner.js';
import { StatusDisplay } from './display/status-display.js';
import { ContextGenerator } from './generators/context-generator.js';
// No new imports added
```

---

## 📚 **Documentation Separation**

### **Documentation Strategy**

#### **✅ Isolated Documentation**
```
docs/CLAUDE-TOOLS-CLI-*        ← Special edition docs
├── Completely separate from main CTDiscovery docs
├── Self-contained explanations
├── Clear "special edition" branding
└── No modifications to existing docs

README.md                      ← Main CTDiscovery (unchanged)
OVERVIEW.md                    ← Main CTDiscovery (unchanged) 
docs/existing-docs.md          ← Main CTDiscovery (unchanged)
```

#### **✅ Cross-References Only**
- Special edition docs reference main CTDiscovery capabilities
- No modifications to main documentation
- Clear separation of concerns

#### **✅ Version Documentation**
```markdown
# In all Claude Tools CLI docs:
> **🎯 Purpose**: Special edition of CTDiscovery implementing Claude Code 
> tool inspection CLI commands. This is NOT the main CTDiscovery project.
```

---

## 🧪 **Testing Isolation**

### **Test Suite Separation**

#### **✅ Isolated Test Files**
```
src/test/
├── environment-scanner.test.js        ← Original (unchanged)
├── existing-test-files.test.js        ← Original (unchanged)  
├── claude-tools-cli.test.js           ← NEW (isolated)
└── claude-tools-integration.test.js   ← NEW (isolated)
```

#### **✅ Test Execution Isolation**
```bash
# Run only Claude Tools CLI tests
node --test src/test/claude-tools-cli.test.js
node --test src/test/claude-tools-integration.test.js

# Run original CTDiscovery tests (unchanged)
node --test src/test/environment-scanner.test.js

# Run all tests (both isolated suites)
node --test src/test/*.test.js
```

#### **✅ Test Data Isolation**
```javascript
// Claude Tools tests create own mock data
const mockScanResults = {
  status: {
    mcpServers: { data: [/* test data */] },
    vscodeExtensions: { data: [/* test data */] }
  }
};

// No interference with existing test data
```

---

## 🔒 **Git Workflow Protection**

### **Branch Management**

#### **✅ Safe Operations**
```bash
# Safe: Update this branch from main
git checkout feature/claude-tools-cli-simple
git rebase main

# Safe: Create new features off this branch
git checkout -b feature/claude-tools-enhancement

# Safe: Cherry-pick specific commits
git cherry-pick <commit-hash>
```

#### **❌ Dangerous Operations**  
```bash
# DANGEROUS: Never merge special edition TO main
git checkout main
git merge feature/claude-tools-cli-simple  # ❌ DON'T DO THIS

# DANGEROUS: Never push special edition changes to main branch
git checkout main
git push origin main  # If it contains special edition code
```

### **Protected Files Strategy**

#### **Files Safe to Merge to Main** (after careful review)
- Bug fixes in `src/scanners/`
- Performance improvements in `src/utils/`
- Security patches anywhere
- General improvements to error handling

#### **Files NEVER to Merge to Main**
- Modified `src/cli.js` (contains Claude Tools CLI commands)
- Any `docs/CLAUDE-TOOLS-CLI-*` files
- Any `src/test/claude-tools-*` files  
- Package.json changes related to Claude Tools CLI

### **Commit Message Strategy**
```bash
# Good: Clear special edition identification
git commit -m "Claude Tools CLI: Add table formatting support"
git commit -m "[Special Edition] Fix MCP server detection in tools command"

# Good: General improvements (potentially backportable)
git commit -m "Fix scanner timeout handling (applicable to main)"
git commit -m "Improve error messages in environment scanner"
```

---

## 🔮 **Future Maintenance**

### **Keeping Branch Current**

#### **Regular Sync Strategy**
```bash
# Monthly sync with main (or as needed)
git checkout feature/claude-tools-cli-simple
git fetch origin
git rebase origin/main

# Resolve any conflicts carefully
# Test Claude Tools CLI functionality after rebase
npm test src/test/claude-tools-*.test.js
```

#### **Selective Updates**
```bash
# Cherry-pick beneficial changes from main
git log origin/main --oneline | grep -E "(scanner|error|performance)"
git cherry-pick <beneficial-commit-hash>
```

### **Long-term Isolation Strategy**

#### **✅ Sustainable Approach**
1. **Keep core CTDiscovery unchanged** - minimal modifications to existing code
2. **Additive enhancements only** - extend functionality, don't replace
3. **Clear documentation** - maintain "special edition" identity
4. **Isolated testing** - separate test suites for validation
5. **Regular synchronization** - stay current with main branch improvements

#### **✅ Future-Proofing**
```javascript
// Extensible pattern that won't conflict with main development
class CTDiscovery {
  constructor() {
    // Original initialization unchanged
    this.scanner = new EnvironmentScanner();
    this.display = new StatusDisplay();
    
    // Special edition: Could add feature flags in future
    this.features = {
      claudeToolsCli: true  // Feature flag for special edition
    };
  }
  
  async run(options = {}) {
    // Feature-flag protected Claude Tools CLI
    if (this.features.claudeToolsCli && this.isClaudeToolsCommand(options)) {
      return await this.handleClaudeToolsCommands(options);
    }
    
    // Original CTDiscovery logic unchanged
    // ...
  }
}
```

### **Branch Evolution Path**

#### **Acceptable Evolution:**
- Add new Claude Tools CLI commands (`--tools-export`, `--tools-validate`)  
- Enhance table formatting (colors, sorting, pagination)
- Add more output formats (`--format yaml`, `--format csv`)
- Improve filtering capabilities
- Add caching and performance optimizations

#### **Unacceptable Evolution:**
- Modify core scanning logic in incompatible ways
- Change main CTDiscovery user interface  
- Add dependencies that affect main project
- Merge incompatible architectural changes

---

## 📞 **Emergency Procedures**

### **If Accidentally Merged to Main**
```bash
# Immediate rollback procedure
git checkout main
git log --oneline -10  # Find the merge commit
git revert -m 1 <merge-commit-hash>  # Revert the merge
git push origin main

# Rebuild special edition branch
git checkout -b feature/claude-tools-cli-simple-recovery
# Re-implement special edition features from backup/documentation
```

### **If Main Changes Break Special Edition**
```bash
# Incremental fix approach
git checkout feature/claude-tools-cli-simple  
git rebase origin/main  # This will show conflicts

# Fix conflicts carefully:
# 1. Preserve Claude Tools CLI functionality
# 2. Adapt to main branch changes
# 3. Test thoroughly
npm test src/test/claude-tools-*.test.js
```

### **Branch Corruption Recovery**  
```bash
# Rebuild from clean main + special edition patches
git checkout main
git checkout -b feature/claude-tools-cli-simple-rebuild
git apply special-edition-patches.patch  # If patches were saved
# Or re-implement from documentation
```

---

## ✅ **Verification Checklist**

### **Pre-Merge to This Branch**
- [ ] Changes don't modify core CTDiscovery behavior
- [ ] Claude Tools CLI tests still pass
- [ ] Original CTDiscovery functionality unchanged
- [ ] Documentation clearly indicates special edition
- [ ] No new dependencies introduced

### **Regular Health Check**
- [ ] Branch can rebase cleanly from main
- [ ] All tests pass (both original and Claude Tools)
- [ ] Claude Tools CLI commands work as documented
- [ ] No interference with main CTDiscovery functionality
- [ ] Documentation stays current and accurate

### **Before Any Main Branch Integration**
- [ ] Feature is generally beneficial (not Claude Tools specific)
- [ ] No Claude Tools CLI code included
- [ ] Thoroughly tested in main branch context
- [ ] Documented as separate from special edition
- [ ] Approved by project maintainers

---

*This branch protection strategy ensures the Claude Tools CLI special edition can evolve safely while preserving the integrity of the main CTDiscovery project.*