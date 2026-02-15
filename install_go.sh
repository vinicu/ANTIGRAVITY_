#!/bin/bash
set -e

echo "Starting Go installation..."

# Detect Architecture
ARCH=$(uname -m)
echo "Architecture: $ARCH"

# Check for Homebrew
if command -v brew >/dev/null 2>&1; then
    echo "Homebrew detected. Installing Go..."
    brew install go
else
    echo "Homebrew not found."
    # Define version
    GO_VERSION="1.21.6"
    
    if [ "$ARCH" = "arm64" ]; then
        URL="https://go.dev/dl/go${GO_VERSION}.darwin-arm64.tar.gz"
    else
        URL="https://go.dev/dl/go${GO_VERSION}.darwin-amd64.tar.gz"
    fi
    
    INSTALL_DIR="$HOME/.local/go"
    mkdir -p "$INSTALL_DIR"
    
    echo "Downloading and installing Go $GO_VERSION to $INSTALL_DIR..."
    curl -L "$URL" | tar -xz -C "$INSTALL_DIR" --strip-components 1
    
    # Setup PATH
    SHELL_RC="$HOME/.zshrc"
    [ -f "$HOME/.bashrc" ] && SHELL_RC="$HOME/.bashrc"
    
    echo "Updating $SHELL_RC..."
    echo "" >> "$SHELL_RC"
    echo "# Go configuration" >> "$SHELL_RC"
    echo "export GOROOT=\"$INSTALL_DIR\"" >> "$SHELL_RC"
    echo "export PATH=\"\$PATH:\$GOROOT/bin\"" >> "$SHELL_RC"
    
    echo "Go installed. You may need to restart your terminal."
fi

echo "Verifying installation..."
$HOME/.local/go/bin/go version || go version || echo "Please restart terminal to use 'go'"
