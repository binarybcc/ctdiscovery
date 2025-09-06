# CTDiscovery Branch Structure & Navigation Guide

## 🌳 Repository Organization

CTDiscovery is organized into **specialized branches** to support different use cases and user preferences:

### 📋 Branch Overview

| Branch | Purpose | Users | Interface | Status |
|--------|---------|-------|-----------|--------|
| [`main`](../../tree/main) | **CLI Tool** | Terminal users, automation, CI/CD | Command-line interface | ✅ Production Ready |
| [`feature/vscode-extension`](../../tree/feature/vscode-extension) | **VSCode Extension** | VSCode users, GUI preference | Visual IDE integration | 🚧 Active Development |

## 🎯 Choose Your Branch

### 🖥️ **Main Branch** - CLI Tool
**Perfect for:**
- Developers who prefer command-line interfaces
- Automation and scripting scenarios  
- CI/CD pipeline integration
- Lightweight, fast scanning
- Cross-platform terminal usage

**Features:**
- Terminal-based dashboard with color output
- Real-time scanning from any directory
- Universal shell compatibility (bash, zsh, PowerShell)
- Minimal dependencies and fast startup
- Perfect for remote development and SSH

```bash
git checkout main
npm install
npm run scan  # Run CLI dashboard
```

### 🎨 **Feature/VSCode-Extension Branch** - GUI Tool
**Perfect for:**
- VSCode users who want integrated tooling
- Visual interface preference
- Real-time project monitoring
- Rich formatting and interactive elements
- IDE-integrated workflow

**Features:**
- Sidebar dashboard panel
- Status bar indicators
- Auto-refresh on file changes
- Settings integration
- Rich HTML/CSS formatting

```bash
git checkout feature/vscode-extension
cd vscode-extension
npm install
npm run compile  # Build extension
```

## 🚀 Quick Navigation

### For CLI Users
```bash
# Clone and use CLI tool
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
git checkout main  # CLI version (default)
npm install
npm run scan
```

### For VSCode Extension Users  
```bash
# Clone and use VSCode extension
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
git checkout feature/vscode-extension
cd vscode-extension
npm install
code .  # Open in VSCode for development
```

## 📁 Directory Structure by Branch

### Main Branch (CLI)
```
ctdiscovery/
├── README.md                 # CLI-focused documentation
├── BRANCH-STRUCTURE.md       # This guide
├── package.json              # CLI dependencies
├── src/                      # CLI source code
│   ├── scanners/            # Tool detection logic
│   ├── dashboard/           # Terminal output formatting
│   └── cli.js               # Main CLI entry point
├── tools/                   # Generated context files
└── tests/                   # CLI test suite
```

### VSCode Extension Branch
```
ctdiscovery/
├── README.md                 # Extension-focused documentation  
├── vscode-extension/         # Extension-specific directory
│   ├── package.json         # Extension manifest & dependencies
│   ├── src/
│   │   ├── extension.ts     # Extension entry point
│   │   ├── services/        # Extension services
│   │   └── webviews/        # Dashboard UI components
│   ├── media/               # Extension assets
│   └── README.md            # Extension installation guide
├── src/                     # Shared scanner logic
└── tools/                   # Generated context files
```

## 🔄 Development Workflow

### Working with CLI (Main Branch)
```bash
# Stay on main for CLI development
git checkout main
git pull origin main

# Make changes to CLI functionality
# Test with: npm run scan

# Commit and push CLI improvements
git add .
git commit -m "feat: improve CLI performance"
git push origin main
```

### Working with VSCode Extension
```bash
# Switch to extension branch
git checkout feature/vscode-extension
git pull origin feature/vscode-extension

# Work in vscode-extension directory
cd vscode-extension
npm run compile

# Test extension in VSCode
# F5 to launch Extension Development Host

# Commit extension changes
git add .
git commit -m "feat: add dashboard sidebar"
git push origin feature/vscode-extension
```

### Syncing Improvements Between Branches
```bash
# Bring CLI improvements to extension branch
git checkout feature/vscode-extension
git merge main  # Merge CLI scanner improvements

# When extension is stable, merge to main
git checkout main  
git merge feature/vscode-extension  # Bring extension to main
```

## 📦 Installation Instructions by Use Case

### I Want the CLI Tool
```bash
# Option 1: One-line installer
curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash

# Option 2: Manual install
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
git checkout main
npm install -g .
```

### I Want the VSCode Extension
```bash
# Development installation
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
git checkout feature/vscode-extension
cd vscode-extension
npm install
npm run compile

# Install extension in VSCode
# Press F5 or: code --install-extension ./ctdiscovery-vscode-*.vsix
```

### I Want Both
```bash
# Clone repository
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery

# Install CLI version globally
git checkout main
npm install -g .

# Set up VSCode extension for development
git checkout feature/vscode-extension
cd vscode-extension
npm install
npm run compile
```

## 🤝 Contributing Guidelines

### CLI Improvements (Main Branch)
- Focus on terminal interface enhancements
- Improve scanner performance and accuracy
- Add new tool detection capabilities
- Enhance cross-platform compatibility
- Update CLI documentation

### VSCode Extension Features (Extension Branch)
- Improve visual dashboard components
- Add IDE integration features
- Enhance user experience elements
- Create extension settings and preferences
- Update extension documentation

### Shared Improvements (Both Branches)
- Core scanner logic improvements
- Tool detection accuracy enhancements
- Platform compatibility fixes
- Performance optimizations
- Bug fixes in shared utilities

## 📞 Support & Issues

### CLI-Related Issues
- Report in: [GitHub Issues](https://github.com/binarybcc/ctdiscovery/issues)
- Label: `cli`, `main-branch`
- Include: Terminal type, OS version, command output

### VSCode Extension Issues  
- Report in: [GitHub Issues](https://github.com/binarybcc/ctdiscovery/issues)
- Label: `vscode-extension`, `extension-branch`
- Include: VSCode version, extension logs, screenshots

## 🎯 Future Roadmap

### Main Branch (CLI)
- [ ] Enhanced cross-platform support
- [ ] Improved performance optimizations
- [ ] Additional scanner types
- [ ] Better terminal output formatting
- [ ] CLI configuration file support

### Extension Branch (VSCode)
- [ ] Marketplace publication
- [ ] Auto-refresh improvements
- [ ] Advanced settings panel
- [ ] Integration with other extensions
- [ ] Custom dashboard themes

---

**Need help deciding?** 
- **Prefer terminals and automation?** → Use `main` branch (CLI)
- **Prefer visual interfaces in VSCode?** → Use `feature/vscode-extension` branch
- **Want to try both?** → Follow the "I Want Both" installation guide above