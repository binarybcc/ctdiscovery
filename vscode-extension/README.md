# CTDiscovery VSCode Extension

Visual Studio Code extension that brings CTDiscovery's comprehensive AI development environment scanning directly into your editor.

## Features

### 🔍 **Environment Scanning**
- **Real-time scanning** of your development environment
- **Activity Bar Integration** with dedicated CTDiscovery panel
- **Tree View Display** showing all detected tools and extensions
- **Auto-refresh** capability with configurable intervals

### 🎯 **Complete VSCode Ecosystem Detection**
- **Visual Studio Code** extensions (stable)
- **VSCode Insiders** extensions (beta/preview)  
- **VSCodium** extensions (open-source variant)
- **System Tools** detection (git, node, python, etc.)
- **MCP Servers** discovery and status

### 🤖 **AI Integration**
- **Generate AI Context** for Claude and other AI assistants
- **Conversation Starters** for development discussions
- **Dashboard View** with comprehensive environment overview

### ⚙️ **Configuration**
- **Auto-scan on startup** (configurable)
- **Periodic refresh** with customizable intervals
- **Workspace-aware** scanning

## Commands

- `CTDiscovery: Scan Development Environment` - Perform environment scan
- `CTDiscovery: Open Dashboard` - Open comprehensive dashboard view
- `CTDiscovery: Generate AI Context` - Create context file for AI assistants

## Requirements

- **CTDiscovery CLI** must be installed globally or locally
- **VS Code** version 1.85.0 or higher
- **Node.js** environment

## Installation Options

### Option 1: Install CTDiscovery CLI First
```bash
npm install -g ctdiscovery
```

### Option 2: Use Local Installation
The extension will attempt to find CTDiscovery in common locations including local workspace installations.

## Extension Settings

- `ctdiscovery.autoScan`: Enable/disable automatic scanning on startup (default: `true`)
- `ctdiscovery.scanInterval`: Auto-refresh interval in milliseconds (default: `300000` = 5 minutes)

## Usage

1. **Install** the extension
2. **Open** a workspace or folder
3. **Click** the CTDiscovery icon in the Activity Bar
4. **View** your development environment status in real-time
5. **Use** commands from Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`)

## Architecture

This extension leverages the proven **CTDiscovery v1.2.0** core engine with:
- ✅ **Universal Linux support** across all distributions
- ✅ **Complete VSCode ecosystem detection** 
- ✅ **Industry-first VSCodium support**
- ✅ **Cross-platform compatibility** (Windows, macOS, Linux)
- ✅ **Performance optimized** scanning (<3 second scans)

## Development

### Prerequisites
```bash
npm install
```

### Build
```bash
npm run compile
```

### Development Mode
```bash
npm run watch
```

### Testing
Press `F5` to open a new Extension Development Host window for testing.

## Repository

Part of the CTDiscovery project: https://github.com/binarybcc/ctdiscovery

## License

MIT - see [LICENSE](../LICENSE) file for details.

---

**Built with the power of CTDiscovery v1.2.0 engine** 🚀