#!/usr/bin/env bash
set -euo pipefail

# Build script for VSCode Workspaces Alfred Workflow
# Creates vscode-workspaces.alfredworkflow (a ZIP archive)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WORKFLOW_NAME="vscode-workspaces.alfredworkflow"
BUILD_DIR="$SCRIPT_DIR/dist"

echo "Building $WORKFLOW_NAME..."

# Clean previous build
rm -rf "$BUILD_DIR"
rm -f "$SCRIPT_DIR/$WORKFLOW_NAME"

# Create build directory
mkdir -p "$BUILD_DIR"

# Copy required files
cp "$SCRIPT_DIR/info.plist" "$BUILD_DIR/"
cp "$SCRIPT_DIR/icon.png" "$BUILD_DIR/"
cp "$SCRIPT_DIR/index.js" "$BUILD_DIR/"
cp "$SCRIPT_DIR/package.json" "$BUILD_DIR/"
cp "$SCRIPT_DIR/package-lock.json" "$BUILD_DIR/"

# Copy lib directory
cp -r "$SCRIPT_DIR/lib" "$BUILD_DIR/"

# Install production dependencies
echo "Installing dependencies..."
cd "$BUILD_DIR"
npm install --production --silent

# Create the workflow archive
echo "Creating workflow archive..."
cd "$BUILD_DIR"
zip -rq "$SCRIPT_DIR/$WORKFLOW_NAME" .

# Clean up
rm -rf "$BUILD_DIR"

echo "Done! Created: $WORKFLOW_NAME"

open "$SCRIPT_DIR/$WORKFLOW_NAME"
