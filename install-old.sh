#!/bin/bash
set -e

# CTDiscovery One-Line Installer
# Usage: curl -fsSL https://raw.githubusercontent.com/binarybcc/ctdiscovery/main/install.sh | bash

echo "🔍 CTDiscovery Installer"
echo "========================================"

# Detect shell
if [ -n "$ZSH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.zshrc"
    SHELL_NAME="zsh"
elif [ -n "$BASH_VERSION" ]; then
    SHELL_CONFIG="$HOME/.bashrc"
    SHELL_NAME="bash"
else
    SHELL_CONFIG="$HOME/.profile"
    SHELL_NAME="profile"
fi

echo "📍 Detected shell: $SHELL_NAME"
echo "📍 Config file: $SHELL_CONFIG"

# Check if already installed
if [ -d "$HOME/ctdiscovery" ]; then
    echo "⚠️  CTDiscovery already exists at ~/ctdiscovery"
    read -p "🔄 Update existing installation? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        cd "$HOME/ctdiscovery"
        git pull origin main
        npm install
        echo "✅ CTDiscovery updated successfully!"
    else
        echo "❌ Installation cancelled"
        exit 1
    fi
else
    # Fresh installation
    echo "📥 Cloning CTDiscovery to ~/ctdiscovery..."
    git clone https://github.com/binarybcc/ctdiscovery.git "$HOME/ctdiscovery"
    
    echo "📦 Installing dependencies..."
    cd "$HOME/ctdiscovery"
    npm install
    
    # Make scripts executable
    chmod +x ctd ctdtools
    
    echo "✅ CTDiscovery installed successfully!"
fi

# Check if PATH already contains ctdiscovery
if echo "$PATH" | grep -q "$HOME/ctdiscovery"; then
    echo "✅ PATH already configured"
else
    echo "🔧 Adding CTDiscovery to PATH..."
    echo "" >> "$SHELL_CONFIG"
    echo "# CTDiscovery" >> "$SHELL_CONFIG"
    echo "export PATH=\"\$HOME/ctdiscovery:\$PATH\"" >> "$SHELL_CONFIG"
    echo "✅ Added to $SHELL_CONFIG"
fi

echo ""
echo "🎉 Installation Complete!"
echo "========================================"
echo "📋 To start using CTDiscovery:"
echo "   1. Restart your terminal OR run: source $SHELL_CONFIG"
echo "   2. Run 'ctd' from any directory"
echo "   3. Run 'ctdtools' for conversation starters"
echo ""
echo "📚 Documentation: https://github.com/binarybcc/ctdiscovery"
echo "🐛 Issues: https://github.com/binarybcc/ctdiscovery/issues"
echo ""
echo "Happy coding! 🚀"