#!/bin/bash

###############################################################################
# Shell Script Integration Example
#
# Demonstrates how to consume CTDiscovery output in shell scripts
###############################################################################

set -e

echo "CTDiscovery - Shell Script Integration Example"
echo "=============================================="
echo ""

# Example 1: Check if specific tool exists
echo "Example 1: Check for Git installation"
echo "--------------------------------------"

RESULTS=$(node -e "
import { CTDiscovery } from './src/index.js';
const ctd = new CTDiscovery();
const analysis = await ctd.scanAndAnalyze();
const json = await ctd.format(analysis, 'json');
console.log(json);
")

HAS_GIT=$(echo "$RESULTS" | jq -r '.tools[] | select(.name=="git") | .status')

if [ "$HAS_GIT" == "active" ]; then
  echo "✓ Git is installed and active"
  GIT_VERSION=$(echo "$RESULTS" | jq -r '.tools[] | select(.name=="git") | .metadata.version')
  echo "  Version: $GIT_VERSION"
else
  echo "✗ Git not found"
fi

echo ""

# Example 2: Check Node.js version
echo "Example 2: Verify Node.js version"
echo "-----------------------------------"

NODE_VERSION=$(echo "$RESULTS" | jq -r '.environment.nodeVersion')
echo "Node.js version: $NODE_VERSION"

# Parse major version
NODE_MAJOR=$(echo "$NODE_VERSION" | cut -d'.' -f1 | sed 's/v//')

if [ "$NODE_MAJOR" -ge 16 ]; then
  echo "✓ Node.js version is compatible (>=16)"
else
  echo "✗ Node.js version is too old. Please upgrade to v16 or higher."
fi

echo ""

# Example 3: List all active tools
echo "Example 3: List active tools"
echo "-----------------------------"

ACTIVE_TOOLS=$(echo "$RESULTS" | jq -r '.tools[] | select(.status=="active") | .name')

echo "Active tools:"
for TOOL in $ACTIVE_TOOLS; do
  echo "  - $TOOL"
done

echo ""

# Example 4: Check for overlaps
echo "Example 4: Check for tool overlaps"
echo "-----------------------------------"

OVERLAP_COUNT=$(echo "$RESULTS" | jq -r '.overlaps | length')

if [ "$OVERLAP_COUNT" -gt 0 ]; then
  echo "⚠️  Found $OVERLAP_COUNT tool overlaps:"
  echo "$RESULTS" | jq -r '.overlaps[] | "  - \(.type): \(.tools | join(", "))"'
else
  echo "✓ No tool overlaps detected"
fi

echo ""

# Example 5: Generate environment report
echo "Example 5: Generate environment report"
echo "---------------------------------------"

REPORT_FILE=".ctdiscovery/environment-report.json"
mkdir -p .ctdiscovery

echo "$RESULTS" | jq '.' > "$REPORT_FILE"
echo "✓ Environment report saved to: $REPORT_FILE"

echo ""

# Example 6: Check for required tools
echo "Example 6: Verify required tools"
echo "---------------------------------"

REQUIRED_TOOLS=("git" "node" "npm")
ALL_PRESENT=true

for TOOL in "${REQUIRED_TOOLS[@]}"; do
  STATUS=$(echo "$RESULTS" | jq -r ".tools[] | select(.name==\"$TOOL\") | .status")

  if [ -z "$STATUS" ] || [ "$STATUS" == "null" ]; then
    echo "✗ Missing: $TOOL"
    ALL_PRESENT=false
  elif [ "$STATUS" == "active" ]; then
    echo "✓ Present: $TOOL"
  else
    echo "⚠️  Found but not active: $TOOL ($STATUS)"
  fi
done

echo ""

if [ "$ALL_PRESENT" = true ]; then
  echo "✓ All required tools are present"
  exit 0
else
  echo "✗ Some required tools are missing"
  exit 1
fi

###############################################################################
# Additional Examples
###############################################################################

# Example 7: Export environment variables
# export HAS_DOCKER=$(echo "$RESULTS" | jq -r 'any(.tools[]; .name=="docker" and .status=="active")')
# export HAS_PYTHON=$(echo "$RESULTS" | jq -r 'any(.tools[]; .name=="python" and .status=="active")')

# Example 8: Conditional build based on tools
# if echo "$RESULTS" | jq -e '.tools[] | select(.name=="docker" and .status=="active")' > /dev/null; then
#   echo "Running Docker build..."
#   # docker build commands
# fi

# Example 9: Save specific tool info
# echo "$RESULTS" | jq '.tools[] | select(.type=="language")' > languages.json

# Example 10: Check MCP servers
# MCP_COUNT=$(echo "$RESULTS" | jq '[.tools[] | select(.type=="mcp-server")] | length')
# echo "MCP servers configured: $MCP_COUNT"
