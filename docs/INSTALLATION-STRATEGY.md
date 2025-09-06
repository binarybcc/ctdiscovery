# CTDiscovery Installation Strategy Improvements

## Current Problems

### 1. Path-Dependent Aliases
```bash
# ❌ CURRENT: Breaks when repo moves
alias ctd="npm --prefix /Users/user/specific/path run scan --silent"

# ✅ IMPROVED: Path-independent 
alias ctd="ctdiscovery scan"
```

### 2. Multiple Conflicting Commands
- Global `ctdiscovery` command (npm install)
- Local `ctd` aliases (git clone + aliases)
- PATH-based scripts (install.sh adds to PATH)

### 3. Update Issues
- Users can't easily update
- Aliases point to old locations
- Mixed installation methods

## Recommended Solution

### Option A: Pure NPM Package (Recommended)
```bash
# Install globally via npm
npm install -g @binarybcc/ctdiscovery

# Simple aliases that never break
alias ctd="ctdiscovery scan"
alias ctdtools="ctdiscovery tools"
```

**Pros:**
- ✅ Easy updates: `npm update -g @binarybcc/ctdiscovery`
- ✅ Path-independent
- ✅ Version management via npm
- ✅ Works from any directory

### Option B: Smart Local Installation
```bash
#!/bin/bash
# Improved install.sh with path resolution

# Install to standard location
INSTALL_DIR="$HOME/.ctdiscovery"
git clone https://github.com/binarybcc/ctdiscovery.git "$INSTALL_DIR"

# Create smart wrapper script
cat > "$HOME/.local/bin/ctdiscovery" << 'EOF'
#!/bin/bash
# CTDiscovery wrapper - auto-finds installation
SCRIPT_DIR="$HOME/.ctdiscovery"
if [ -f "$SCRIPT_DIR/package.json" ]; then
  npm --prefix "$SCRIPT_DIR" run scan --silent "$@"
else
  echo "❌ CTDiscovery not found. Run installer again."
  exit 1
fi
EOF
chmod +x "$HOME/.local/bin/ctdiscovery"

# Simple aliases
echo 'alias ctd="ctdiscovery"' >> ~/.zshrc
echo 'alias ctdtools="ctdiscovery tools"' >> ~/.zshrc
```

**Pros:**
- ✅ Path-independent aliases
- ✅ Auto-detects installation
- ✅ Easy updates with `cd ~/.ctdiscovery && git pull`
- ✅ Falls back gracefully

### Option C: Hybrid Approach
```bash
# Try global first, fallback to local
alias ctd='command -v ctdiscovery >/dev/null && ctdiscovery scan || npm --prefix ~/.ctdiscovery run scan --silent'
```

## Implementation Plan

1. **Publish to NPM** as `@binarybcc/ctdiscovery`
2. **Update install.sh** to prefer npm global install
3. **Add update command**: `ctdiscovery update` 
4. **Graceful migration** for existing users

## Migration Strategy

```bash
# In updated install.sh
if [ -f ~/.zshrc ] && grep -q "npm --prefix.*ctdiscovery" ~/.zshrc; then
  echo "🔄 Migrating from old installation..."
  
  # Remove old aliases
  sed -i.bak '/ctd.*npm --prefix/d' ~/.zshrc
  
  # Install globally
  npm install -g @binarybcc/ctdiscovery
  
  # Add new aliases
  echo 'alias ctd="ctdiscovery scan"' >> ~/.zshrc
  echo 'alias ctdtools="ctdiscovery tools"' >> ~/.zshrc
  
  echo "✅ Migration complete! Restart terminal or run: source ~/.zshrc"
fi
```