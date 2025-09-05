# CTDiscovery - AI Development Environment Status Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/binarybcc/ctdiscovery.svg)](https://github.com/binarybcc/ctdiscovery/releases)

Non-destructive tool discovery for AI-assisted development environments with real-time dashboard and Claude integration.

**Platform Support:**
- ✅ **macOS** - Fully tested and supported
- ✅ **Windows** - Complete VSCode ecosystem detection
- ✅ **Linux** - Complete VSCode ecosystem detection

## Quick Start

### Easy Installation Options

#### Option 1: One-Line Install (Recommended)
```bash
# Install to ~/ctdiscovery with PATH setup
curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash
```

#### Option 2: Global npm Install
```bash
# Install globally via npm
npm install -g https://github.com/binarybcc/ctdiscovery.git
ctdiscovery scan  # Available anywhere
```

#### Option 3: Manual Install
```bash
# Clone and install manually
git clone https://github.com/binarybcc/ctdiscovery.git ~/ctdiscovery
cd ~/ctdiscovery
npm install

# Add to PATH (choose your shell)
echo 'export PATH="$HOME/ctdiscovery:$PATH"' >> ~/.zshrc  # zsh
echo 'export PATH="$HOME/ctdiscovery:$PATH"' >> ~/.bashrc # bash
source ~/.zshrc  # or ~/.bashrc
```

### Usage
```bash
# After installation, use from anywhere:
ctd          # Run dashboard + generate context
ctdtools     # Show conversation starter
ctdiscovery scan    # Full dashboard (if globally installed)
ctdiscovery tools   # Generate tools context (if globally installed)
```

#### Local Project Usage (if not globally installed)
```bash
cd ~/ctdiscovery

# Run tool discovery dashboard
npm run scan

# Generate conversation starter for Claude
npm run tools

# Watch mode (updates every 30s)
npm run watch
```

### Available Commands
```bash
npm run scan         # Dashboard + context generation
npm run tools        # Show conversation starter
npm run dashboard    # Clean dashboard only  
npm run watch        # Auto-refresh every 30s
npm start            # Full detailed output
npm test             # Run test suite
```

## System Structure
```
your-projects-root/
├── CLAUDE-UNIVERSAL-CONFIG.md       # Universal AI collaboration standards
├── PROJECT-STARTUP-CHECKLIST.md    # Architecture decision frameworks
├── TOOL-INVENTORY-TEMPLATE.md       # Tool discovery system
├── .claude/settings.local.json     # Universal Claude permissions
├── init-project.sh                 # Project creation script
├── README.md                       # This documentation
├── project-1/
│   ├── CLAUDE.md                    # Project-specific context
│   ├── .claude/settings.local.json # Project permissions
│   ├── README.md                    # Project documentation
│   └── .gitignore                   # Project-appropriate ignores
└── project-2/
    ├── CLAUDE.md
    ├── .claude/settings.local.json
    ├── README.md
    └── .gitignore
```

## Features

### 🎯 **Complete VSCode Ecosystem Detection** *(New in v1.2.0)*
- ✅ **Visual Studio Code** - Standard stable release extensions
- ✅ **VSCode Insiders** - Beta/preview version extensions
- ✅ **VSCodium** - Open-source variant support *(Industry First!)*
- ✅ **Cross-Platform Paths** - Windows, macOS, Linux native path detection
- ✅ **AI Extension Classification** - Automatic identification of AI/ML development tools
- ✅ **Rich Metadata** - Publisher, version, categories, and contribution analysis

### 🚀 **Core Capabilities**
- ✅ **Tool Discovery Dashboard** - Real-time scanning of 40+ development tools
- ✅ **Advanced Overlap Analysis** - Algorithm-based detection of tool conflicts and duplicates
- ✅ **Claude Integration** - Context generation and conversation starters
- ✅ **Performance Optimized** - <3 second scan times with graceful degradation
- ✅ **Plugin Architecture** - Extensible scanner system with standardized interfaces
- ✅ **Non-Destructive** - Safe to run anywhere, no system modifications
- ✅ **Universal Project Setup** - AI collaboration methodologies and project templates
- ✅ **CLI Dashboard** - Visual status monitoring with color-coded output

## Project Types Supported
- `web-app` / `website` / `frontend` - Frontend web applications
- `node` / `cli-tool` / `backend` - Node.js applications and tools
- `python` / `data-science` - Python projects and data analysis
- `general` - General purpose projects

## Generated Files Per Project
Each new project gets:
- `CLAUDE.md` - Project context and AI collaboration guidelines
- `.claude/settings.local.json` - Project-specific Claude permissions
- `README.md` - Basic project documentation with AI collaboration notes
- `.gitignore` - Appropriate ignore patterns for project type
- Git initialization with proper initial commit

## Universal Methodologies
- **Architecture Standards** - CSS, JavaScript, HTML best practices
- **Interrogation Protocols** - Systematic questions for better AI collaboration
- **Decision Frameworks** - Startup checklists and scalability patterns
- **Tool Discovery** - Capability management and tool awareness
- **Quality Gates** - Testing, accessibility, and performance requirements

## Distribution
This entire system is contained in a single `claude-init.sh` script that can be:
- Downloaded and run in any directory
- Shared with team members
- Version controlled and updated
- Extended with additional project types

🤖 This system embodies systematic AI-developer collaboration practices developed through real project experience.

## Contributing
To add new project types or improve methodologies:
1. Update the relevant universal files
2. Test with `./init-project.sh new-type test-project`
3. Verify all generated files and folder structure
4. Update documentation

---
**Created with Claude Code - AI-Assisted Development**
