# NEW PROJECT: Claude Tool Discovery System

## Project Concept
Create a standalone system for AI-developer collaboration that manages:
- Tool inventory and discovery
- Capability acknowledgment between human and AI
- Systematic interrogation protocols
- Project startup checklists and best practices

## Separate from Current Website
- ✅ This is NOT part of Direct Connect Mobile website
- ✅ Will be its own repository with git/GitHub
- ✅ Could be used across multiple projects/developers
- ✅ Potential open-source tool for AI collaboration

## New Session Requirements

### Location
- Create new folder (suggest: `/Users/johncorbin/Desktop/projs/claude-tool-discovery/`)
- Initialize git repository
- Set up GitHub repository
- Separate from current website project

### Universal Files Architecture
**BETTER APPROACH**: Move universal files to root Projects folder

**Proposed Structure:**
```
/Users/johncorbin/Desktop/projs/
├── CLAUDE-UNIVERSAL-CONFIG.md          # Universal AI collaboration standards
├── PROJECT-STARTUP-CHECKLIST.md       # Universal project best practices  
├── TOOL-INVENTORY-TEMPLATE.md          # Template for project tool discovery
├── .claude/
│   └── settings.local.json             # Universal Claude permissions
├── directconnectredesign/              # Website project
│   ├── CLAUDE.md                       # Project-specific context
│   └── .claude/
│       └── settings.local.json         # Project-specific permissions
├── claude-tool-discovery/              # New tool discovery project
│   ├── CLAUDE.md                       # Project-specific context
│   └── .claude/
│       └── settings.local.json         # Project-specific permissions
└── other-projects/
    ├── CLAUDE.md
    └── .claude/settings.local.json
```

**How Claude Code Will Find Universal Files:**
- When in `/projs/any-project/`, Claude can read `../CLAUDE-UNIVERSAL-CONFIG.md`
- VS Code workspace can include parent directory for easy access
- Project-specific `CLAUDE.md` can reference universal files

**Benefits:**
- ✅ Single source of truth for methodologies
- ✅ No duplication across projects  
- ✅ Updates propagate to all projects
- ✅ New projects inherit best practices automatically

**Commands to set up:**
```bash
# Move files to root
mv /Users/johncorbin/Desktop/projs/directconnectredesign/PROJECT-STARTUP-CHECKLIST.md /Users/johncorbin/Desktop/projs/
mv /Users/johncorbin/Desktop/projs/directconnectredesign/CLAUDE-PROJECT-CONFIG.md /Users/johncorbin/Desktop/projs/CLAUDE-UNIVERSAL-CONFIG.md
mv /Users/johncorbin/Desktop/projs/directconnectredesign/TOOL-INVENTORY.md /Users/johncorbin/Desktop/projs/TOOL-INVENTORY-TEMPLATE.md

# Create universal Claude settings
mkdir -p /Users/johncorbin/Desktop/projs/.claude/
# Copy relevant universal permissions to root level
```

### Project Goals
1. **Tool Discovery Engine**: Automated detection of available development tools
2. **Capability Mapping**: Track what tools are available vs. what tasks need them
3. **Communication Protocol**: Standard formats for human-AI tool discussions
4. **Integration System**: How this plugs into any development project

### Technology Stack
- Language: TBD (Node.js for CLI tools? Python for automation?)
- Version Control: Git + GitHub
- Distribution: npm package? pip package? standalone scripts?
- Documentation: Markdown + potentially web interface

### Session Startup Checklist for New Project
1. Create new directory structure
2. Initialize git repository
3. Set up basic project files (README, package.json, etc.)
4. Apply our interrogation protocol to THIS project's architecture decisions
5. Use this as a test case for our own methodologies

## Notes for Claude in New Session
- Reference this note file to understand context
- This project came from need for better AI-developer collaboration tools
- Originated from Direct Connect Mobile project lessons learned
- Focus on creating reusable system, not website-specific tools

## Key Insight
We learned that ad-hoc AI collaboration creates problems. This project aims to solve that systematically for any developer working with AI assistants.

---
**Status**: Ready to start as new project in new session
**Next Action**: Create new folder, initialize repository, begin proper project setup