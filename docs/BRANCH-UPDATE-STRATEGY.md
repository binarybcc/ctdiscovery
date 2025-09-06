# Branch Update Strategy for Improved Installation System

## 🎯 Branches to Update (v1.2.0)

### **Priority 1: Main Branches**
1. **`main`** - Primary branch that needs all improvements
2. **`feature/vscode-extension`** - VSCode extension work
3. **`feature/vscode-extension-fresh`** - ✅ Already updated (source branch)

### **Priority 2: Development Branches**  
4. **`debug/vscode-scanner-investigation`** - VSCode debugging work
5. **`v1.1.0-claude-integration`** - May need selective updates

### **Skip These:**
- `feature/vscode-extension-v1.1-archived` - Archived, no updates needed
- `origin/*` - Remote tracking branches

## 🔄 Update Strategy

### **Approach: Cherry-Pick Key Commits**
We'll cherry-pick the specific commits with our improvements rather than merging entire branches to avoid conflicts:

**Key Commits to Cherry-Pick:**
- `a2eff95` - 🔧 Implement improved installation system with smart wrapper  
- `15df601` - 🔧 Fix Claude doctor issues and rebuild VSCode extension

### **Files That Need Updates:**
```
install.sh                           # New smart installer
docs/INSTALLATION-STRATEGY.md       # New documentation  
README.md                           # Updated instructions
vscode-extension/package.json       # Auto-scan disabled
vscode-extension/src/extension.ts   # Auto-scan fixes
```

## 📋 Execution Plan

1. **Update `main` branch:**
   ```bash
   git checkout main
   git cherry-pick a2eff95  # Installation improvements
   git cherry-pick 15df601  # VSCode fixes
   ```

2. **Update `feature/vscode-extension` branch:**
   ```bash
   git checkout feature/vscode-extension
   git cherry-pick a2eff95  # Installation improvements
   git cherry-pick 15df601  # VSCode fixes  
   ```

3. **Update `debug/vscode-scanner-investigation` branch:**
   ```bash
   git checkout debug/vscode-scanner-investigation
   git cherry-pick a2eff95  # Installation improvements only
   ```

4. **Push all updates:**
   ```bash
   git push origin main
   git push origin feature/vscode-extension
   git push origin debug/vscode-scanner-investigation
   ```

## ⚠️ Conflict Resolution

If conflicts occur during cherry-pick:
1. **Accept our version** for installation files (`install.sh`, `README.md`)
2. **Merge carefully** for VSCode extension files
3. **Skip** if the target branch has conflicting newer changes

## ✅ Success Criteria

Each updated branch should have:
- ✅ Smart installer (`install.sh`) with wrapper functionality
- ✅ Path-independent aliases
- ✅ Update command (`ctdiscovery update`)  
- ✅ Auto-scan disabled by default in VSCode extension
- ✅ Updated README with new installation instructions