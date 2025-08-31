# Portable Claude Code Project Initialization System

## Concept
A single script that can be dropped into ANY folder to create a complete AI-assisted development environment with:
- Universal methodology files
- Project initialization system
- Proper Claude Code integration
- Git/GitHub setup automation

## System Components

### **1. Bootstrap Script: `claude-init.sh`**
```bash
#!/bin/bash
# Claude Code Project System Bootstrap
# Drop this file anywhere and run to create complete AI dev environment

set -e

echo "🤖 Claude Code Project System Setup"
echo "=================================="

# Get current directory
ROOT_DIR="$(pwd)"
echo "📁 Setting up in: $ROOT_DIR"

# Create universal files directory structure
echo "📋 Creating universal methodology files..."

# Create CLAUDE-UNIVERSAL-CONFIG.md
cat > CLAUDE-UNIVERSAL-CONFIG.md << 'EOF'
# Claude Universal Configuration
**AI collaboration standards for all projects**

## Architecture Standards
[... full content from your CLAUDE-PROJECT-CONFIG.md ...]

## Interrogation Protocol
### Claude Must Ask Before Solutions:
- [ ] "What assumptions am I making about [scale/users/performance/browsers]?"
- [ ] "Should I show you 2-3 different approaches with tradeoffs?"
- [ ] "What technical debt does this create?"
- [ ] "How do we test this works correctly?"
- [ ] "What security risks does this introduce?"

## Usage
Reference this file from project-specific CLAUDE.md files:
`See ../CLAUDE-UNIVERSAL-CONFIG.md for methodology standards`
EOF

# Create PROJECT-STARTUP-CHECKLIST.md  
cat > PROJECT-STARTUP-CHECKLIST.md << 'EOF'
# Project Startup Checklist
[... full content from your existing checklist ...]
EOF

# Create TOOL-INVENTORY-TEMPLATE.md
cat > TOOL-INVENTORY-TEMPLATE.md << 'EOF'
# Tool Inventory Template
[... content from TOOL-INVENTORY.md ...]
EOF

# Create universal Claude settings
mkdir -p .claude
cat > .claude/settings.local.json << 'EOF'
{
  "permissions": {
    "allow": [
      "Bash(git:*)",
      "Bash(node:*)",
      "Bash(npm:*)",
      "Bash(open:*)",
      "Bash(osascript:*)",
      "Bash(mkdir:*)",
      "Bash(mv:*)",
      "Bash(cp:*)",
      "Bash(rm:*)"
    ],
    "deny": []
  }
}
EOF

# Create project initialization script
cat > init-project.sh << 'EOF'
#!/bin/bash
# Project Initialization Script
# Usage: ./init-project.sh [project-type] [project-name]

PROJECT_TYPE=${1:-"general"}
PROJECT_NAME=${2:-"new-project"}

echo "🚀 Initializing new project: $PROJECT_NAME"
echo "📊 Project type: $PROJECT_TYPE"

# Create project directory
mkdir -p "$PROJECT_NAME"
cd "$PROJECT_NAME"

# Create project-specific CLAUDE.md
cat > CLAUDE.md << EOL
# CLAUDE.md - $PROJECT_NAME

## Universal Methodologies
Reference these files in parent directory:
- \`../CLAUDE-UNIVERSAL-CONFIG.md\` - Interrogation protocols & architecture standards  
- \`../PROJECT-STARTUP-CHECKLIST.md\` - Startup decisions & best practices
- \`../TOOL-INVENTORY-TEMPLATE.md\` - Tool discovery system

## Project Context
**Type:** $PROJECT_TYPE
**Purpose:** [Brief description of project goals]
**Timeline:** [Short/Medium/Long-term]

## Project-Specific Constraints
- Browser support: [Modern/Legacy/Mobile-first]
- Performance: [Critical/Normal/Not critical]  
- Team size: [Solo/Small/Large] → [Expected growth]
- Maintenance: [Long-term/Short-term/Handoff]
- Accessibility: [WCAG level required]

## Interrogation Protocol Active
- [ ] Claude must ask context check questions before solutions
- [ ] Claude must provide 2-3 alternatives with tradeoffs
- [ ] Claude must identify technical debt for each approach
- [ ] User must validate assumptions before implementation

## Next Steps
1. Update project context above
2. Run startup checklist decisions
3. Initialize git repository  
4. Set up development environment
EOL

# Create project-specific Claude settings
mkdir -p .claude
cat > .claude/settings.local.json << EOL
{
  "permissions": {
    "allow": [
      "Bash(npm run:*)",
      "Bash(open *.html)",
      "Bash(git:*)"
    ],
    "deny": []
  }
}
EOL

# Create basic README
cat > README.md << EOL
# $PROJECT_NAME

Brief description of the project.

## Setup
1. Review \`CLAUDE.md\` for AI collaboration guidelines
2. Check \`../PROJECT-STARTUP-CHECKLIST.md\` for architecture decisions
3. Install dependencies: \`npm install\` (if applicable)

## Development
- This project uses AI-assisted development patterns
- Reference universal methodologies in parent directory
- Follow interrogation protocols for major decisions

## Generated
🤖 Created with Claude Code project initialization system
EOL

# Initialize git if not already in a repo
if [ ! -d .git ] && [ ! -d ../.git ]; then
    git init
    echo "📚 Git repository initialized"
fi

# Create appropriate .gitignore based on project type
case $PROJECT_TYPE in
    "web-app"|"website")
        cat > .gitignore << EOL
node_modules/
dist/
build/
.env
.env.local
.DS_Store
*.log
EOL
        ;;
    "node"|"cli-tool")
        cat > .gitignore << EOL
node_modules/
dist/
.env
.DS_Store
*.log
coverage/
EOL
        ;;
    *)
        cat > .gitignore << EOL
.DS_Store
*.log
.env
.env.local
EOL
        ;;
esac

echo "✅ Project '$PROJECT_NAME' initialized successfully!"
echo "📂 Location: $(pwd)"
echo ""
echo "Next steps:"
echo "1. cd $PROJECT_NAME"  
echo "2. Edit CLAUDE.md with project-specific details"
echo "3. Reference ../PROJECT-STARTUP-CHECKLIST.md for architecture decisions"
echo "4. Start development with AI collaboration protocols active"
EOF

chmod +x init-project.sh

# Create usage documentation
cat > README.md << 'EOF'
# Claude Code Project System

Complete AI-assisted development environment with universal methodologies and project initialization.

## Quick Start

### 1. Bootstrap System (One Time)
Drop `claude-init.sh` into any directory and run:
```bash
chmod +x claude-init.sh
./claude-init.sh
```

### 2. Initialize New Projects
```bash
./init-project.sh web-app my-website
./init-project.sh cli-tool my-automation  
./init-project.sh client-project acme-corp
```

### 3. Start Development
```bash
cd my-website
# CLAUDE.md contains project-specific context
# Universal methodologies available in parent directory
```

## System Structure
```
your-projects-root/
├── CLAUDE-UNIVERSAL-CONFIG.md       # Universal AI collaboration standards
├── PROJECT-STARTUP-CHECKLIST.md    # Architecture decision frameworks
├── TOOL-INVENTORY-TEMPLATE.md       # Tool discovery system
├── .claude/settings.local.json     # Universal Claude permissions
├── init-project.sh                 # Project creation script
├── project-1/
│   ├── CLAUDE.md                    # Project-specific context
│   └── .claude/settings.local.json # Project permissions
└── project-2/
    ├── CLAUDE.md
    └── .claude/settings.local.json
```

## Features
- ✅ Universal AI collaboration methodologies
- ✅ Systematic interrogation protocols  
- ✅ Project startup checklists and decision frameworks
- ✅ Automated project initialization
- ✅ Proper Git and Claude Code integration
- ✅ Tool discovery and capability management
- ✅ Portable - works in any directory

## Generated Files
Each new project gets:
- `CLAUDE.md` - Project context and AI collaboration guidelines
- `.claude/settings.local.json` - Project-specific permissions
- `README.md` - Basic project documentation
- `.gitignore` - Appropriate to project type
- Git initialization (if not already in repo)

🤖 This system embodies systematic AI-developer collaboration practices developed through real project experience.
EOF

echo ""
echo "✅ Claude Code Project System Setup Complete!"
echo ""
echo "📋 Universal Files Created:"
echo "   - CLAUDE-UNIVERSAL-CONFIG.md"
echo "   - PROJECT-STARTUP-CHECKLIST.md" 
echo "   - TOOL-INVENTORY-TEMPLATE.md"
echo "   - .claude/settings.local.json"
echo ""
echo "🚀 Project Initialization:"
echo "   ./init-project.sh [type] [name]"
echo ""
echo "📚 Documentation:"
echo "   README.md - Full usage instructions"
echo ""
echo "🎯 Next: Create your first project:"
echo "   ./init-project.sh web-app my-first-project"

EOF

chmod +x claude-init.sh

echo "Created portable system bootstrap script!"
echo ""
echo "To package for distribution:"
echo "1. Save claude-init.sh"  
echo "2. Drop it in any folder"
echo "3. Run: chmod +x claude-init.sh && ./claude-init.sh"
echo "4. Complete AI development environment ready!"
```

## Distribution

### **Single File Distribution**
- Someone downloads `claude-init.sh`
- Runs it in their desired projects folder
- Gets complete AI collaboration environment
- Can immediately start creating properly configured projects

### **GitHub Repository**
- Create repo with the bootstrap script
- Include documentation and examples
- Others can clone or download single script
- Completely self-contained setup

### **Package Managers** (Future)
- npm package: `npx claude-project-init`
- pip package: `pip install claude-project-init`
- Homebrew: `brew install claude-project-init`

## Key Benefits
- ✅ **Truly Portable**: Single script creates everything
- ✅ **Zero Dependencies**: Just bash and Claude Code  
- ✅ **Instant Setup**: From zero to AI-assisted development in seconds
- ✅ **Universal Methodologies**: Works for any project type
- ✅ **Self-Documenting**: Includes all necessary documentation
- ✅ **Version Controlled**: Each aspect can be tracked and updated

This could become a standard tool for developers adopting AI-assisted development practices!