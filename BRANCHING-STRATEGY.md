# CTDiscovery Branching Strategy

## 🌳 Active Development Branches

### **`main`** - Production CLI Version
- ✅ **Stable CLI tool** with dashboard and overlap analysis
- 🎯 **Focus:** Core CLI improvements, Phase 2 path-based detection, cross-platform CLI support
- 📦 **Ready for:** npm publication, distribution, production use

**Current Status:**
- 21 tools detected with deduplication
- Advanced overlap analysis with context warnings
- Performance optimized (<3 seconds)
- Production-ready MVP

**Upcoming Features:**
- Phase 2: Path-based system vs user detection
- Windows/Linux CLI testing
- Enhanced overlap rules
- Performance optimizations

### **`feature/vscode-extension`** - VS Code Extension Development  
- 🚀 **New development:** VS Code extension with GUI dashboard
- 🎯 **Focus:** Extension API integration, webview dashboard, VS Code marketplace preparation
- 📦 **Ready for:** VS Code marketplace publication, IDE integration

**Development Roadmap:**
1. **Week 1:** Basic extension scaffold + command integration
2. **Week 2:** Status bar indicator + output panel
3. **Week 3:** Sidebar webview dashboard
4. **Week 4:** Auto-refresh + settings integration

**Architecture:**
- Reuse existing scanner classes from main branch
- VS Code extension API wrapper
- HTML/CSS dashboard in webview
- Settings integration for customization

## 🔄 Parallel Development Strategy

### **Independent Development**
```bash
# Work on CLI improvements
git checkout main
git pull origin main
# Make CLI changes, commit, push

# Work on VS Code extension  
git checkout feature/vscode-extension
git pull origin feature/vscode-extension
# Make extension changes, commit, push
```

### **Sync Strategy**
```bash
# Merge main improvements into extension branch
git checkout feature/vscode-extension
git merge main  # Bring CLI improvements to extension

# When extension is ready, merge back
git checkout main
git merge feature/vscode-extension  # Bring extension to main
```

## 📋 Development Coordination

### **Main Branch Tasks:**
- [ ] Phase 2 path-based detection
- [ ] Windows/Linux CLI testing  
- [ ] Enhanced overlap analysis rules
- [ ] npm publication process
- [ ] Performance optimizations
- [ ] Additional scanner types

### **Extension Branch Tasks:**
- [ ] VS Code extension scaffold
- [ ] Import existing scanner classes
- [ ] Command palette integration
- [ ] Status bar indicator
- [ ] Sidebar dashboard webview
- [ ] Auto-refresh on file changes
- [ ] Settings panel integration
- [ ] Marketplace preparation

## 🚀 Release Strategy

### **Main Branch Releases:**
- `v1.0.0` - Current CLI with overlap analysis
- `v1.1.0` - Phase 2 path-based detection
- `v1.2.0` - Cross-platform support
- `v2.0.0` - Major feature additions

### **Extension Branch Releases:**
- `v0.1.0` - Basic extension MVP
- `v0.2.0` - Dashboard webview
- `v0.3.0` - Auto-refresh + settings
- `v1.0.0` - Full-featured extension ready for marketplace

## 🤝 Integration Points

### **Shared Code:**
- Scanner classes (reused in extension)
- Overlap analysis logic  
- Tool detection utilities
- Platform detection

### **Branch-Specific Code:**
- **Main:** CLI-specific output formatting, command-line args
- **Extension:** VS Code API integration, webview HTML, extension manifest

This strategy allows **parallel development** while maintaining **code reuse** and **independent release cycles**.