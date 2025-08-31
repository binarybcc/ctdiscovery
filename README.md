# CTDiscovery - AI Development Environment Status Dashboard

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub release](https://img.shields.io/github/release/binarybcc/ctdiscovery.svg)](https://github.com/binarybcc/ctdiscovery/releases)

Non-destructive tool discovery for AI-assisted development environments with real-time dashboard and Claude integration.

**Platform Support:**
- ✅ **macOS** - Fully tested and supported
- 🏗️ **Windows** - Architecture ready, testing needed
- 🏗️ **Linux** - Architecture ready, testing needed

## Quick Start

### Installation & Usage
```bash
# Clone and install
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
npm install

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
- ✅ **Tool Discovery Dashboard** - Real-time scanning of 20+ development tools
- ✅ **Claude Integration** - Context generation and conversation starters
- ✅ **Performance Optimized** - <3 second scan times with graceful degradation
- ✅ **Plugin Architecture** - Extensible scanner system with standardized interfaces
- ✅ **Non-Destructive** - Safe to run anywhere, no system modifications
- ✅ **Universal Project Setup** - AI collaboration methodologies and project templates
- ✅ **CLI Dashboard** - Visual status monitoring with color-coded output
- ✅ **Cross-Platform Ready** - Architecture supports macOS, Windows, Linux

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
