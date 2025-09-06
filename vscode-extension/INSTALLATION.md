# 📦 CTDiscovery VSCode Extension Installation Guide

## 🚀 Quick Installation (Recommended)

### Method 1: Install from VSIX File (Ready to Use)

The extension has been packaged and is ready for installation:

```bash
# Navigate to the extension directory
cd /Users/user/Development/work/ClaudeToolDiscovery/vscode-extension/

# Install the packaged extension
code --install-extension ctdiscovery-vscode-1.2.0.vsix
```

✅ **DONE!** The extension is now installed and ready to use.

---

## 🔧 Alternative Installation Methods

### Method 2: Development Mode

For development and testing:

```bash
# Open VSCode in the extension directory
code /Users/user/Development/work/ClaudeToolDiscovery/vscode-extension/

# Press F5 to launch Extension Development Host
# This opens a new VSCode window with the extension loaded
```

### Method 3: Manual Packaging

If you need to rebuild the package:

```bash
# Install VSCode Extension Manager (if not already installed)
npm install -g @vscode/vsce

# Navigate to extension directory
cd vscode-extension/

# Ensure dependencies are installed
npm install

# Compile TypeScript
npm run compile

# Package the extension
vsce package

# Install the generated .vsix file
code --install-extension ctdiscovery-vscode-1.2.0.vsix
```

---

## ✅ Verification Steps

### 1. Check Extension is Installed
```bash
code --list-extensions | grep ctdiscovery
# Should output: binarybcc.ctdiscovery-vscode
```

### 2. Test Extension Features

**In VSCode:**

1. **Open Command Palette:** `Cmd+Shift+P` (Mac) or `Ctrl+Shift+P` (Windows/Linux)
2. **Search for:** `CTDiscovery`
3. **Available Commands:**
   - `CTDiscovery: Scan Development Environment`
   - `CTDiscovery: Open Dashboard`
   - `CTDiscovery: Generate AI Context`

4. **Check Activity Bar:** Look for the CTDiscovery icon (search icon) on the left sidebar
5. **Check Status Bar:** Should show "CTDiscovery: X tools" in the bottom status bar

### 3. Test Dashboard
- Run `CTDiscovery: Open Dashboard` command
- Should open a beautiful webview with:
  - Tool statistics
  - Categorized tool displays
  - Refresh functionality

---

## 🔧 Prerequisites

### Required:
- **CTDiscovery CLI** must be globally installed:
  ```bash
  # CTDiscovery should be available as a command
  ctdiscovery --help
  ```

- **VSCode** version 1.85.0 or higher

### Optional Configuration:
```json
// In VSCode settings.json
{
  "ctdiscovery.autoScan": true,           // Auto-scan on startup (default: true)
  "ctdiscovery.scanInterval": 300000      // Refresh interval in ms (default: 5 minutes)
}
```

---

## 🐛 Troubleshooting

### Extension Not Showing Up
```bash
# Restart VSCode completely
# Check if extension is installed
code --list-extensions | grep ctdiscovery

# If not found, reinstall
code --install-extension ctdiscovery-vscode-1.2.0.vsix
```

### Commands Not Available
- Open Command Palette (`Cmd+Shift+P`)
- Type "Developer: Reload Window"
- Wait a few seconds for extension to activate

### CTDiscovery CLI Not Found
```bash
# Ensure CTDiscovery is globally available
which ctdiscovery

# If not found, the extension will show error messages
# Install CTDiscovery CLI first
```

### Status Bar Not Updating
- Run `CTDiscovery: Scan Development Environment` manually
- Check Developer Console for errors: `Cmd+Shift+I` → Console tab

---

## 📁 Extension Structure

```
vscode-extension/
├── ctdiscovery-vscode-1.2.0.vsix    # ← Install this file
├── dist/                             # Compiled JavaScript
├── src/                              # TypeScript source
├── package.json                      # Extension manifest
└── README.md                         # Documentation
```

---

## 🎯 Features Summary

✅ **Activity Bar Panel** - CTDiscovery tree view  
✅ **Status Bar Integration** - Tool count display  
✅ **Three Commands** - Scan, Dashboard, Context Generation  
✅ **Enhanced Dashboard** - Beautiful webview interface  
✅ **Auto-scan** - Configurable startup scanning  
✅ **CLI Integration** - Uses CTDiscovery v1.2.0 engine  

**🎉 Ready to use!** The extension integrates seamlessly with your existing CTDiscovery setup and VSCode workflow.