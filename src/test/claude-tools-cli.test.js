/**
 * Unit Tests for Claude Tools CLI functionality
 * Tests the new CLI commands added to CTDiscovery
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { CTDiscovery } from '../cli.js';

test('CTDiscovery - extractAllTools', () => {
  const discovery = new CTDiscovery();
  
  const mockScanResults = {
    status: {
      mcpServers: {
        data: [
          { name: 'test-server', status: 'active', metadata: { version: '1.0.0' } }
        ]
      },
      vscodeExtensions: {
        data: [
          { name: 'test-extension', status: 'available', metadata: { version: '2.0.0' } }
        ]
      },
      systemTools: {
        data: [
          { name: 'git', status: 'active' }
        ]
      }
    }
  };

  const tools = discovery.extractAllTools(mockScanResults);
  
  assert.strictEqual(tools.length, 3);
  assert.strictEqual(tools[0].name, 'test-server');
  assert.strictEqual(tools[0].category, 'mcpServers');
  assert.strictEqual(tools[0].source, 'ctdiscovery');
  assert.strictEqual(tools[1].name, 'test-extension');
  assert.strictEqual(tools[1].category, 'vscodeExtensions');
  assert.strictEqual(tools[2].name, 'git');
  assert.strictEqual(tools[2].category, 'systemTools');
});

test('CTDiscovery - applyFilters - filter by name', () => {
  const discovery = new CTDiscovery();
  
  const tools = [
    { name: 'git', status: 'active', category: 'systemTools' },
    { name: 'node', status: 'active', category: 'systemTools' },
    { name: 'test-server', status: 'active', category: 'mcpServers' }
  ];

  const filtered = discovery.applyFilters(tools, { filter: 'git' });
  
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].name, 'git');
});

test('CTDiscovery - applyFilters - filter by description', () => {
  const discovery = new CTDiscovery();
  
  const tools = [
    { name: 'tool1', status: 'active', category: 'test', description: 'Version control system' },
    { name: 'tool2', status: 'active', category: 'test', description: 'JavaScript runtime' },
    { name: 'tool3', status: 'active', category: 'test' }
  ];

  const filtered = discovery.applyFilters(tools, { filter: 'version' });
  
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].name, 'tool1');
});

test('CTDiscovery - applyFilters - filter by status', () => {
  const discovery = new CTDiscovery();
  
  const tools = [
    { name: 'tool1', status: 'active', category: 'test' },
    { name: 'tool2', status: 'missing', category: 'test' },
    { name: 'tool3', status: 'active', category: 'test' }
  ];

  const filtered = discovery.applyFilters(tools, { status: 'active' });
  
  assert.strictEqual(filtered.length, 2);
  assert.strictEqual(filtered[0].name, 'tool1');
  assert.strictEqual(filtered[1].name, 'tool3');
});

test('CTDiscovery - applyFilters - combined filters', () => {
  const discovery = new CTDiscovery();
  
  const tools = [
    { name: 'git', status: 'active', category: 'test', description: 'Version control' },
    { name: 'git-lfs', status: 'missing', category: 'test', description: 'Git extension' },
    { name: 'node', status: 'active', category: 'test', description: 'JavaScript runtime' }
  ];

  const filtered = discovery.applyFilters(tools, { filter: 'git', status: 'active' });
  
  assert.strictEqual(filtered.length, 1);
  assert.strictEqual(filtered[0].name, 'git');
});

test('CTDiscovery - getStatusIcon', () => {
  const discovery = new CTDiscovery();
  
  assert.strictEqual(discovery.getStatusIcon('active'), '●');
  assert.strictEqual(discovery.getStatusIcon('available'), '●');
  assert.strictEqual(discovery.getStatusIcon('missing'), '○');
  assert.strictEqual(discovery.getStatusIcon('error'), '✖');
  assert.strictEqual(discovery.getStatusIcon('unknown'), '?');
  assert.strictEqual(discovery.getStatusIcon('invalid-status'), '❓');
});

test('CTDiscovery - formatCategoryName', () => {
  const discovery = new CTDiscovery();
  
  assert.strictEqual(discovery.formatCategoryName('mcpServers'), 'MCP Servers');
  assert.strictEqual(discovery.formatCategoryName('systemTools'), 'System Tools');
  assert.strictEqual(discovery.formatCategoryName('vscodeExtensions'), 'VSCode Extensions');
  assert.strictEqual(discovery.formatCategoryName('singleword'), 'Singleword');
});

test('Versioned JSON output structure', () => {
  const tools = [
    { name: 'test-tool', status: 'active', category: 'test' }
  ];
  
  const versionedOutput = {
    version: 1,
    tools: tools
  };
  
  assert.strictEqual(versionedOutput.version, 1);
  assert.strictEqual(Array.isArray(versionedOutput.tools), true);
  assert.strictEqual(versionedOutput.tools.length, 1);
  assert.strictEqual(versionedOutput.tools[0].name, 'test-tool');
});

test('MCP Server versioned JSON structure', () => {
  const servers = [
    { name: 'test-server', status: 'active', type: 'MCP Server' }
  ];
  
  const versionedOutput = {
    version: 1,
    servers: servers
  };
  
  assert.strictEqual(versionedOutput.version, 1);
  assert.strictEqual(Array.isArray(versionedOutput.servers), true);
  assert.strictEqual(versionedOutput.servers.length, 1);
  assert.strictEqual(versionedOutput.servers[0].name, 'test-server');
});

test('Tool inspection versioned JSON structure', () => {
  const tool = {
    name: 'test-tool',
    status: 'active',
    category: 'test',
    metadata: { version: '1.0.0' }
  };
  
  const versionedOutput = {
    version: 1,
    tool: tool
  };
  
  assert.strictEqual(versionedOutput.version, 1);
  assert.strictEqual(typeof versionedOutput.tool, 'object');
  assert.strictEqual(versionedOutput.tool.name, 'test-tool');
  assert.strictEqual(versionedOutput.tool.metadata.version, '1.0.0');
});