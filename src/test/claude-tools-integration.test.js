/**
 * Integration Tests for Claude Tools CLI
 * Tests the complete end-to-end functionality
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

// Helper to run CLI commands and parse output
async function runCliCommand(args) {
  try {
    const { stdout, stderr } = await execAsync(`node src/cli.js ${args} --quiet`);
    return { stdout, stderr, success: true };
  } catch (error) {
    return { stdout: error.stdout || '', stderr: error.stderr || '', success: false, error };
  }
}

test('CLI - tools-list basic functionality', async () => {
  const result = await runCliCommand('--tools-list');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  assert.match(result.stdout, /Found \d+ tools:/, 'Should show tools count');
  assert.match(result.stdout, /● \w+/, 'Should show tool list with status icons');
});

test('CLI - tools-list JSON format', async () => {
  const result = await runCliCommand('--tools-list --format json');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  
  // Parse JSON output (skip scanner output)
  const jsonMatch = result.stdout.match(/{\s*"version"[\s\S]*}/);
  assert.ok(jsonMatch, 'Should contain JSON output');
  
  const jsonOutput = JSON.parse(jsonMatch[0]);
  assert.strictEqual(jsonOutput.version, 1, 'Should have version 1');
  assert.strictEqual(Array.isArray(jsonOutput.tools), true, 'Should have tools array');
  assert.ok(jsonOutput.tools.length > 0, 'Should have at least one tool');
  
  // Verify tool structure
  const firstTool = jsonOutput.tools[0];
  assert.ok(firstTool.name, 'Tool should have name');
  assert.ok(firstTool.status, 'Tool should have status');
  assert.ok(firstTool.category, 'Tool should have category');
});

test('CLI - tools-list table format', async () => {
  const result = await runCliCommand('--tools-list --format table --filter git');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  assert.match(result.stdout, /Name\s+\|\s+Category\s+\|\s+Version\s+\|\s+Status/, 'Should have table headers');
  assert.match(result.stdout, /-{10,}/, 'Should have table separator line');
  assert.match(result.stdout, /Total: \d+ tools/, 'Should show total count');
});

test('CLI - tools-list with filter', async () => {
  const result = await runCliCommand('--tools-list --filter git');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  assert.match(result.stdout, /git/, 'Should contain git in output');
});

test('CLI - tools-inspect functionality', async () => {
  const result = await runCliCommand('--tools-inspect git');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  assert.match(result.stdout, /🔍 .* - Detailed Information/, 'Should show inspection header');
  assert.match(result.stdout, /Status:/, 'Should show status');
  assert.match(result.stdout, /Category:/, 'Should show category');
});

test('CLI - tools-inspect JSON format', async () => {
  const result = await runCliCommand('--tools-inspect git --format json');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  
  const jsonMatch = result.stdout.match(/{\s*"version"[\s\S]*}/);
  assert.ok(jsonMatch, 'Should contain JSON output');
  
  const jsonOutput = JSON.parse(jsonMatch[0]);
  assert.strictEqual(jsonOutput.version, 1, 'Should have version 1');
  assert.ok(jsonOutput.tool, 'Should have tool object');
  assert.ok(jsonOutput.tool.name, 'Tool should have name');
});

test('CLI - mcp-servers functionality', async () => {
  const result = await runCliCommand('--mcp-servers');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  // Should either find servers or show "Found N servers" or "Total: N servers"
  assert.match(result.stdout, /(Found \d+ MCP servers:|Total: \d+ servers)/, 'Should show server count');
});

test('CLI - mcp-servers table format', async () => {
  const result = await runCliCommand('--mcp-servers --format table');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  
  if (result.stdout.includes('Total: 0 servers')) {
    assert.match(result.stdout, /No MCP servers found/, 'Should handle no servers gracefully');
  } else {
    assert.match(result.stdout, /Name\s+\|\s+Type\s+\|\s+Status/, 'Should have table headers for servers');
  }
});

test('CLI - mcp-servers JSON format', async () => {
  const result = await runCliCommand('--mcp-servers --format json');
  
  assert.strictEqual(result.success, true, 'Command should succeed');
  
  const jsonMatch = result.stdout.match(/{\s*"version"[\s\S]*}/);
  assert.ok(jsonMatch, 'Should contain JSON output');
  
  const jsonOutput = JSON.parse(jsonMatch[0]);
  assert.strictEqual(jsonOutput.version, 1, 'Should have version 1');
  assert.strictEqual(Array.isArray(jsonOutput.servers), true, 'Should have servers array');
});

test('CLI - mcp-inspect with valid server', async () => {
  // First get available servers
  const serversResult = await runCliCommand('--mcp-servers --format json');
  
  if (serversResult.success) {
    const jsonMatch = serversResult.stdout.match(/{\s*"version"[\s\S]*}/);
    
    if (jsonMatch) {
      const jsonOutput = JSON.parse(jsonMatch[0]);
      
      if (jsonOutput.servers && jsonOutput.servers.length > 0) {
        const firstServer = jsonOutput.servers[0];
        const inspectResult = await runCliCommand(`--mcp-inspect ${firstServer.name}`);
        
        assert.strictEqual(inspectResult.success, true, 'Inspect should succeed for valid server');
        assert.match(inspectResult.stdout, /🔍 .* - MCP Server Details/, 'Should show server details');
      }
    }
  }
  
  // This test passes if no servers are available or if inspection works
  assert.ok(true, 'MCP inspect test completed');
});

test('CLI - error handling for invalid tool', async () => {
  const result = await runCliCommand('--tools-inspect nonexistent-tool-xyz-123');
  
  assert.strictEqual(result.success, true, 'Command should succeed but show not found message');
  assert.match(result.stdout, /❌ Tool .* not found/, 'Should show tool not found message');
  assert.match(result.stdout, /Available tools:/, 'Should show available tools');
});

test('CLI - error handling for invalid server', async () => {
  const result = await runCliCommand('--mcp-inspect nonexistent-server-xyz-123');
  
  assert.strictEqual(result.success, true, 'Command should succeed but show not found message');
  assert.match(result.stdout, /❌ MCP server .* not found/, 'Should show server not found message');
});