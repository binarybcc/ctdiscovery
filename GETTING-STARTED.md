# 🚀 Getting Started with ClaudeToolDiscovery

*Get up and running in under 2 minutes*

## Quick Install & First Run

### Option 1: Global Install (Recommended)
```bash
npm install -g https://github.com/binarybcc/ctdiscovery.git
ctd scan
```

### Option 2: One-Line Install Script  
```bash
curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash
ctd scan
```

That's it! You'll see a dashboard showing all tools Claude can access in your environment.

## What You'll See

After running `ctd`, you'll get:

```
🔍 CTDiscovery - AI Development Environment Status

📊 Scan: 2307ms | 23 tools | 23 active

📦 MCP Servers:
   ● ACTIVE:
      • ruv-swarm
      • claude-flow
      • @anthropic-ai/claude-code

📦 System Tools:
   ● AVAILABLE:
      • git (2.50.1)
      • gh (2.76.2)
      • node (22.17.0)
      • python (3.12.4)
      • docker (28.3.3)
      • [... and more]

💬 Generated conversation starter: .ctdiscovery-conversation-starter.txt
📄 Generated context file: .ctdiscovery-context.md
```

## Essential Commands

```bash
# Run the tool (that's it!)
ctd

# Alternative: show just conversation starter
ctdtools

# Help and options
ctd --help
```

## What This Solves

**Before CTD:**
- "Tool not available" errors with no context
- Guessing what Claude can access
- Inconsistent AI coding sessions
- Environment uncertainty

**After CTD:**
- Know exactly what's available
- Quick environment overview
- Consistent AI workflow setup
- Clear tool visibility

## Next Steps

1. **Run the scan** - See what you discover!
2. **Check the conversation starter** - `ctd tools` gives you ready-to-paste context for Claude
3. **Share with your team** - Standardize everyone's environment knowledge
4. **Report issues** - Help improve CTD for everyone

## Common Use Cases

### For Individual Developers
```bash
# Before starting an AI coding session
ctd

# Copy the generated conversation starter
cat .ctdiscovery-conversation-starter.txt
# [Paste into Claude conversation]
```

### For Environment Documentation
```bash
# Document your current setup
ctd > my-environment.txt
# Keep for reference or troubleshooting
```

### For Debugging "Tool Not Available"
```bash
# When Claude says a tool isn't available
ctd | grep [tool-name]
# Verify if tool is actually accessible
```

## Troubleshooting

### Installation Issues
```bash
# If global install fails, try local:
git clone https://github.com/binarybcc/ctdiscovery.git
cd ctdiscovery
npm install
npm run scan
```

### Permission Errors
```bash
# On macOS, if permission denied:
sudo npm install -g https://github.com/binarybcc/ctdiscovery.git
```

### No Tools Found
- Verify you're in a development environment
- Check that Node.js 16+ is installed
- Try running with `--verbose` flag for debug info

## Platform Support

- ✅ **macOS** - Fully tested and supported
- 🧪 **Windows** - Architecture ready, community testing welcome
- 🧪 **Linux** - Architecture ready, community testing welcome

## Get Help

- **GitHub Issues**: [Report bugs or request features](https://github.com/binarybcc/ctdiscovery/issues)
- **Discussions**: Share discoveries and get help from the community
- **Documentation**: See README.md for technical details

---

**Ready to discover what Claude can really access?** Run `ctd scan` now! 🔍