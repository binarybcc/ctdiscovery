#!/usr/bin/env node

/**
 * Custom Scanner Example
 *
 * Demonstrates how to use individual scanners and customize behavior
 */

import { MCPScanner, VSCodeScanner, SystemToolScanner } from '../src/index.js';

async function main() {
  console.log('CTDiscovery - Custom Scanner Example\n');

  try {
    // Use individual scanners
    console.log('1. MCP Scanner:');
    const mcpScanner = new MCPScanner();
    const mcpResults = await mcpScanner.scan();
    console.log(`   Found ${mcpResults.data?.length || 0} MCP servers`);

    console.log('\n2. VSCode Scanner:');
    const vscodeScanner = new VSCodeScanner();
    const vscodeResults = await vscodeScanner.scan();
    console.log(`   Found ${vscodeResults.data?.length || 0} VSCode extensions`);

    console.log('\n3. System Tool Scanner:');
    const systemScanner = new SystemToolScanner();
    const systemResults = await systemScanner.scan();
    console.log(`   Found ${systemResults.data?.length || 0} system tools`);

    // Show specific tools
    console.log('\n=== MCP Servers ===');
    if (mcpResults.data && mcpResults.data.length > 0) {
      for (const server of mcpResults.data.slice(0, 5)) {
        console.log(`- ${server.name} (${server.status})`);
      }
    } else {
      console.log('No MCP servers found');
    }

    console.log('\n=== System Tools ===');
    if (systemResults.data && systemResults.data.length > 0) {
      for (const tool of systemResults.data.slice(0, 10)) {
        const version = tool.metadata?.version || 'unknown';
        console.log(`- ${tool.name}: ${version}`);
      }
    } else {
      console.log('No system tools found');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
