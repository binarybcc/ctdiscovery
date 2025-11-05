# CTDiscovery for VSCode

Development environment intelligence directly in your editor.

## Features

- **🔍 Automatic Environment Scanning**: Detects installed tools, languages, and frameworks
- **📊 Environment Dashboard**: Visual sidebar showing all discovered tools
- **⚙️ Task Integration**: Automatically generates VSCode tasks for discovered tools
- **🤖 AI Context Generation**: Creates Claude Code context files automatically
- **💡 Smart Recommendations**: Suggests relevant VSCode extensions based on your tools
- **🔄 Auto-Refresh**: Keeps environment data up-to-date
- **⚠️ Overlap Detection**: Identifies conflicting or duplicate tools

## Installation

### From VSIX (Local Development)
1. Clone the CTDiscovery repository
2. Navigate to `extensions/vscode`
3. Run `npm install`
4. Run `npm run package`
5. Install the generated `.vsix` file in VSCode

### From Marketplace (Coming Soon)
Search for "CTDiscovery" in the VSCode Extensions marketplace.

## Usage

### Quick Start

1. **Open a workspace** in VSCode
2. **Open the CTDiscovery sidebar** (click the CTDiscovery icon in the activity bar)
3. **Click "Scan Environment"** or wait for the automatic scan
4. **View discovered tools** in the sidebar tree view

### Commands

Access commands via the Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`):

- `CTDiscovery: Scan Environment` - Scan for tools and frameworks
- `CTDiscovery: Refresh Environment Data` - Refresh the current scan
- `CTDiscovery: Generate AI Context` - Generate context for AI assistants
- `CTDiscovery: Sync Discovered Tools to Tasks` - Create VSCode tasks
- `CTDiscovery: Show Extension Recommendations` - View recommended extensions

### Views

The extension provides four sidebar views:

#### 1. Environment View
Shows your development environment details:
- Platform (macOS, Windows, Linux)
- Node.js version
- Working directory

#### 2. Discovered Tools View
Tree view of all detected tools, organized by category:
- 🟢 Active tools (currently running/configured)
- 🔵 Available tools (installed but not active)
- 🟡 Detected tools (found but status unknown)

#### 3. Overlaps & Issues View
Displays tool conflicts and overlaps:
- Multiple package managers
- Conflicting container tools
- Duplicate functionality

#### 4. Recommendations View
Smart recommendations for:
- VSCode extensions that match your tools
- Missing tools for your workflow
- Configuration improvements

### Configuration

Configure the extension via Settings (`Cmd+,` / `Ctrl+,`):

```json
{
  // Automatically scan on workspace open
  "ctdiscovery.autoScan": true,

  // Auto-refresh interval in seconds (0 = disabled)
  "ctdiscovery.scanInterval": 0,

  // Scan timeout in milliseconds
  "ctdiscovery.timeout": 5000,

  // Auto-update AI context on changes
  "ctdiscovery.generateContextOnChange": false,

  // Output path for AI context file
  "ctdiscovery.contextOutputPath": ".claude/context.md",

  // Show notifications for scan results
  "ctdiscovery.showNotifications": true,

  // Automatically sync tasks.json
  "ctdiscovery.syncTasksAutomatically": false
}
```

## Integration with Claude Code

CTDiscovery works seamlessly with Claude Code:

1. **Automatic Context Generation**: Run `CTDiscovery: Generate AI Context` to create a `.claude/context.md` file
2. **MCP Server Detection**: Automatically detects configured MCP servers
3. **Tool Awareness**: Claude Code can see all available tools in your environment

## Task Generation

CTDiscovery can automatically generate VSCode tasks for discovered tools:

1. Run `CTDiscovery: Sync Discovered Tools to Tasks`
2. Tasks are added to `.vscode/tasks.json`
3. Access tasks via `Terminal > Run Task...`

Generated tasks include:
- `npm: install`, `npm: test`, `npm: build` (for Node.js projects)
- `Docker: Build`, `Docker: Run` (for Docker)
- `make: build` (for Make)
- And more...

## Extension Recommendations

Based on detected tools, CTDiscovery recommends relevant extensions:

| Detected Tool | Recommended Extension |
|---------------|----------------------|
| Python | Python (ms-python.python) |
| Docker | Docker (ms-azuretools.vscode-docker) |
| Node.js | ESLint (dbaeumer.vscode-eslint) |
| Git | GitLens (eamodio.gitlens) |
| Rust | rust-analyzer (rust-lang.rust-analyzer) |
| Go | Go (golang.go) |

## Status Bar

The status bar shows:
- **Scanning**: 🔄 Scanning...
- **Success**: ✓ CTDiscovery (X tools)
- **Error**: ❌ CTDiscovery

Click the status bar item to refresh the scan.

## Development

### Building from Source

```bash
cd extensions/vscode
npm install
npm run compile
```

### Running in Development

1. Open the `extensions/vscode` folder in VSCode
2. Press `F5` to launch Extension Development Host
3. Test the extension in the new window

### Packaging

```bash
npm run package
```

This creates a `.vsix` file that can be installed in VSCode.

## Troubleshooting

### Scan Takes Too Long
- Increase the timeout: `"ctdiscovery.timeout": 10000`
- Disable auto-scan: `"ctdiscovery.autoScan": false`

### No Tools Detected
- Check if tools are in your PATH
- Try running `ctdiscovery` from the terminal
- Check VSCode output panel for errors

### Extension Not Loading
- Check the VSCode Developer Tools (Help > Toggle Developer Tools)
- Look for errors in the Console
- Reload the window (Developer: Reload Window)

## Contributing

Contributions are welcome! See the main [CTDiscovery repository](https://github.com/yourusername/ctdiscovery) for guidelines.

## License

MIT License - see LICENSE file for details

## Links

- [CTDiscovery on GitHub](https://github.com/yourusername/ctdiscovery)
- [Report Issues](https://github.com/yourusername/ctdiscovery/issues)
- [Documentation](https://github.com/yourusername/ctdiscovery#readme)
