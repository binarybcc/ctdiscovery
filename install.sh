#!/bin/bash
set -e

# CTDiscovery Improved Installer
# Supports multiple installation methods with automatic fallback

echo "🔍 CTDiscovery Improved Installer"
echo "========================================"

# Detect shell and config file
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

# Function to clean old installations
cleanup_old_installations() {
    echo "🧹 Cleaning up old installations..."
    
    # Remove old path-dependent aliases
    if [ -f "$SHELL_CONFIG" ]; then
        # Backup config
        cp "$SHELL_CONFIG" "$SHELL_CONFIG.ctd-backup-$(date +%Y%m%d-%H%M%S)"
        
        # Remove old aliases (path-dependent ones)
        sed -i.tmp '/alias ctd.*npm --prefix.*run scan/d' "$SHELL_CONFIG"
        sed -i.tmp '/alias ctdtools.*npm --prefix.*run tools/d' "$SHELL_CONFIG"
        rm -f "$SHELL_CONFIG.tmp"
        
        echo "✅ Removed old path-dependent aliases"
    fi
}

# Function for NPM global installation (preferred)
install_via_npm() {
    echo "📦 Installing CTDiscovery globally via NPM..."
    
    # Check if npm is available
    if ! command -v npm >/dev/null 2>&1; then
        echo "❌ NPM not found. Falling back to local installation."
        return 1
    fi
    
    # Try global install (this might fail if package not published yet)
    if npm install -g @binarybcc/ctdiscovery 2>/dev/null; then
        echo "✅ Global NPM installation successful!"
        
        # Add simple path-independent aliases
        echo "" >> "$SHELL_CONFIG"
        echo "# CTDiscovery (NPM Global)" >> "$SHELL_CONFIG"
        echo 'alias ctd="ctdiscovery scan"' >> "$SHELL_CONFIG"
        echo 'alias ctdtools="ctdiscovery tools"' >> "$SHELL_CONFIG"
        
        return 0
    else
        echo "⚠️  NPM package not available. Using local installation."
        return 1
    fi
}

# Function for local installation with smart wrapper
install_locally() {
    echo "📥 Installing CTDiscovery locally..."
    
    INSTALL_DIR="$HOME/.ctdiscovery"
    
    # Remove old installation if exists
    if [ -d "$INSTALL_DIR" ]; then
        echo "🔄 Updating existing local installation..."
        cd "$INSTALL_DIR"
        git pull origin main
        npm install
    else
        echo "📥 Cloning CTDiscovery repository..."
        git clone https://github.com/binarybcc/ctdiscovery.git "$INSTALL_DIR"
        cd "$INSTALL_DIR"
        npm install
    fi
    
    # Create smart wrapper script in user's local bin
    mkdir -p "$HOME/.local/bin"
    
    cat > "$HOME/.local/bin/ctdiscovery" << 'EOF'
#!/bin/bash
# CTDiscovery Smart Wrapper
# Auto-detects and runs CTDiscovery installation

INSTALL_DIR="$HOME/.ctdiscovery"

if [ -f "$INSTALL_DIR/package.json" ]; then
    case "$1" in
        "scan"|"")
            npm --prefix "$INSTALL_DIR" run scan --silent
            ;;
        "tools")
            npm --prefix "$INSTALL_DIR" run tools --silent
            ;;
        "update")
            echo "🔄 Updating CTDiscovery..."
            cd "$INSTALL_DIR" && git pull origin main && npm install
            echo "✅ CTDiscovery updated!"
            ;;
        "--version")
            cd "$INSTALL_DIR" && node -p "require('./package.json').version"
            ;;
        "--help")
            echo "CTDiscovery - AI Development Environment Scanner"
            echo ""
            echo "Usage:"
            echo "  ctdiscovery [scan]     # Scan and display results"
            echo "  ctdiscovery tools      # Generate conversation starter"
            echo "  ctdiscovery update     # Update to latest version"
            echo "  ctdiscovery --version  # Show version"
            echo "  ctdiscovery --help     # Show this help"
            ;;
        *)
            npm --prefix "$INSTALL_DIR" start -- "$@"
            ;;
    esac
else
    echo "❌ CTDiscovery not found at $INSTALL_DIR"
    echo "🔧 Run the installer again to fix this issue"
    exit 1
fi
EOF
    
    chmod +x "$HOME/.local/bin/ctdiscovery"
    
    # Ensure ~/.local/bin is in PATH
    if ! echo "$PATH" | grep -q "$HOME/.local/bin"; then
        echo "🔧 Adding ~/.local/bin to PATH..."
        echo "" >> "$SHELL_CONFIG"
        echo "# Local bin directory" >> "$SHELL_CONFIG" 
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$SHELL_CONFIG"
    fi
    
    # Add simple aliases
    echo "" >> "$SHELL_CONFIG"
    echo "# CTDiscovery (Local Smart Wrapper)" >> "$SHELL_CONFIG"
    echo 'alias ctd="ctdiscovery scan"' >> "$SHELL_CONFIG"
    echo 'alias ctdtools="ctdiscovery tools"' >> "$SHELL_CONFIG"
    
    echo "✅ Local installation with smart wrapper complete!"
}

# Main installation flow
main() {
    echo "🚀 Starting CTDiscovery installation..."
    echo ""
    
    # Clean up old installations first
    cleanup_old_installations
    
    # Try NPM global install first, fallback to local
    if ! install_via_npm; then
        install_locally
    fi
    
    echo ""
    echo "🎉 Installation Complete!"
    echo "========================================"
    echo "📋 Next steps:"
    echo "   1. Restart your terminal OR run: source $SHELL_CONFIG"
    echo "   2. Test with: ctd"
    echo "   3. Get help with: ctdiscovery --help"
    echo "   4. Update anytime with: ctdiscovery update"
    echo ""
    echo "💡 New features:"
    echo "   • Path-independent installation"
    echo "   • Easy updates with 'ctdiscovery update'"
    echo "   • Works from any directory" 
    echo "   • Automatic fallback if issues occur"
    echo ""
    echo "📚 Documentation: https://github.com/binarybcc/ctdiscovery"
    echo "🐛 Issues: https://github.com/binarybcc/ctdiscovery/issues"
    echo ""
    echo "Happy coding! 🚀"
}

# Run main installation
main