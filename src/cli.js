#!/usr/bin/env node

import { EnvironmentScanner } from './scanners/environment-scanner.js';
import { StatusDisplay } from './display/status-display.js';
import { ContextGenerator } from './generators/context-generator.js';
import { ClaudeMCPManager } from './scanners/claude-mcp-manager.js';
import { ClaudeToolDiscovery } from './scanners/claude-tool-discovery.js';

class CTDiscovery {
  constructor() {
    this.scanner = new EnvironmentScanner();
    this.display = new StatusDisplay();
    this.contextGenerator = new ContextGenerator();
    this.claudeMCPManager = new ClaudeMCPManager();
    this.toolDiscovery = new ClaudeToolDiscovery();
    
    // Color definitions for terminal output
    this.colors = {
      active: '\x1b[32m',    // Green
      available: '\x1b[32m', // Green
      detected: '\x1b[32m',  // Green  
      missing: '\x1b[31m',   // Red
      error: '\x1b[31m',     // Red
      unknown: '\x1b[33m',   // Yellow
      warning: '\x1b[33m',   // Yellow
      reset: '\x1b[0m'       // Reset
    };
  }

  async run(options = {}) {
    // Handle Claude Tools CLI commands first
    if (options.toolsList) {
      return await this.handleToolsList(options);
    }
    if (options.toolsInspect) {
      return await this.handleToolsInspect(options.toolsInspect, options);
    }
    // New enhanced tool discovery commands (matching Claude Code spec)
    if (options.claudeToolsList) {
      return await this.handleClaudeToolsList(options);
    }
    if (options.claudeToolsInspect) {
      return await this.handleClaudeToolsInspect(options.claudeToolsInspect, options);
    }
    if (options.mcpServers) {
      return await this.handleMcpServers(options);
    }
    if (options.mcpInspect) {
      return await this.handleMcpInspect(options.mcpInspect, options);
    }
    
    console.log('🔍 CTDiscovery - AI Development Environment Status\n');
    
    try {
      const status = await this.scanner.scan();
      
      // Always show discovery dashboard summary
      this.displayDiscoveryDashboard(status);
      
      // Generate context files based on options
      if (options.generateContext || options.all) {
        console.log('\n📄 Generating context files...');
        this.contextGenerator.generateContextFile(status);
        console.log('');
      }
      
      if (options.conversationStarter || options.all) {
        console.log('💬 Generating conversation starter...');
        const starter = this.contextGenerator.generateConversationStarter(status);
        
        if (options.showStarter) {
          console.log('\n' + '='.repeat(60));
          console.log('CONVERSATION STARTER (copy this to new conversations):');
          console.log('='.repeat(60));
          console.log(starter);
          console.log('='.repeat(60) + '\n');
        }
      }
      
      // Display detailed output unless quiet mode
      if (!options.quiet && !options.all) {
        console.log('');
        this.display.render(status, options);
      }
      
    } catch (error) {
      console.error('❌ Error scanning environment:', error.message);
      process.exit(1);
    }
  }

  displayDiscoveryDashboard(scanResults) {
    console.log('🔍 TOOL DISCOVERY DASHBOARD');
    console.log('═'.repeat(50));
    
    // Summary stats
    const summary = this.calculateSummaryStats(scanResults);
    console.log(`📊 Scan: ${scanResults.scanDuration}ms | ${summary.total} tools | ${summary.active} active`);
    
    // Category breakdowns with color coding - show ALL tools
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const categoryName = this.formatCategoryName(category);
      console.log(`\n📦 ${categoryName}:`);
      
      // Group tools by status for better organization
      const toolsByStatus = {};
      result.data.forEach(tool => {
        const status = tool.status || 'unknown';
        if (!toolsByStatus[status]) toolsByStatus[status] = [];
        toolsByStatus[status].push(tool);
      });
      
      // Display each status group
      Object.entries(toolsByStatus).forEach(([status, tools]) => {
        const statusIcon = this.getStatusIcon(status);
        const statusColor = this.getStatusColor(status);
        console.log(`   ${statusColor}${statusIcon} ${status.toUpperCase()}:${this.colors.reset}`);
        
        // Show each tool with version if available
        tools.forEach(tool => {
          const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
          console.log(`      • ${tool.name}${version}`);
        });
      });
    });
    
    // Show issues if any
    if (summary.warnings > 0 || summary.errors > 0) {
      console.log(`⚠️  Issues: ${summary.warnings} warnings, ${summary.errors} errors`);
    }
    
    console.log('═'.repeat(50));
  }

  calculateSummaryStats(scanResults) {
    const summary = { total: 0, active: 0, warnings: 0, errors: 0 };
    
    Object.values(scanResults.status).forEach(result => {
      if (result.data) {
        summary.total += result.data.length;
        summary.active += result.data.filter(tool => 
          tool.status === 'active' || tool.status === 'available'
        ).length;
      }
      
      summary.warnings += (result.warnings?.length || 0);
      summary.errors += (result.errors?.length || 0);
    });
    
    return summary;
  }

  formatCategoryName(category) {
    return category.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace('Mcp Servers', 'MCP Servers')
                  .replace('Mcp-server', 'MCP Servers')
                  .replace('System-tool', 'System Tools')
                  .replace('Vscode', 'VSCode');
  }

  getCategoryStatus(result) {
    if (!result.data || result.data.length === 0) return { level: 'none', text: 'none' };
    
    const hasErrors = result.errors && result.errors.length > 0;
    const hasWarnings = result.warnings && result.warnings.length > 0;
    const activeCount = result.data.filter(tool => tool.status === 'active' || tool.status === 'available').length;
    
    if (hasErrors) return { level: 'error', text: 'errors' };
    if (hasWarnings) return { level: 'warning', text: 'warnings' };
    if (activeCount === result.data.length) return { level: 'success', text: 'all active' };
    if (activeCount > 0) return { level: 'partial', text: 'some active' };
    return { level: 'none', text: 'none active' };
  }

  getStatusIcon(status) {
    const icons = {
      'active': '●',
      'available': '●',
      'detected': '●',
      'missing': '○',
      'error': '✖',
      'unknown': '?',
      'success': '🟢',
      'partial': '🟡', 
      'warning': '🟡',
      'none': '⚪'
    };
    return icons[status] || '❓';
  }

  getStatusColor(status) {
    return this.colors[status] || this.colors.reset;
  }

  // Claude Tools CLI command handlers
  async handleToolsList(options) {
    if (!options.quiet) {
      console.log('🔍 CTDiscovery - Available Tools\n');
    }
    
    const status = await this.scanner.scan();
    const allTools = this.extractAllTools(status);
    const filteredTools = this.applyFilters(allTools, options);
    
    if (options.format === 'json') {
      const versionedOutput = {
        version: 1,
        tools: filteredTools
      };
      console.log(JSON.stringify(versionedOutput, null, 2));
    } else if (options.format === 'table') {
      this.displayToolsTable(filteredTools);
    } else {
      this.displayToolsList(filteredTools);
    }
  }

  async handleToolsInspect(toolName, options) {
    const status = await this.scanner.scan();
    const allTools = this.extractAllTools(status);
    const tool = allTools.find(t => t.name.toLowerCase().includes(toolName.toLowerCase()));
    
    if (!tool) {
      console.log(`❌ Tool '${toolName}' not found`);
      console.log(`\nAvailable tools: ${allTools.map(t => t.name).join(', ')}`);
      return;
    }
    
    if (options.format === 'json') {
      const versionedOutput = {
        version: 1,
        tool: tool
      };
      console.log(JSON.stringify(versionedOutput, null, 2));
    } else {
      this.displayToolInspection(tool);
    }
  }

  async handleMcpServers(options) {
    if (!options.quiet) {
      console.log('🔍 CTDiscovery - MCP Servers (Claude Code Source of Truth)\n');
    }
    
    try {
      // Use Claude MCP Manager as source of truth instead of regular scanner
      const mcpResults = await this.claudeMCPManager.scan();
      const mcpServers = mcpResults.data || [];
      
      // Add source-of-truth metadata
      const serversWithMetadata = mcpServers.map(server => ({
        ...server,
        category: 'mcp-server',
        source: 'claude-mcp-manager',
        sourceOfTruth: true
      }));
      
      if (options.format === 'json') {
        const versionedOutput = {
          version: 1,
          servers: serversWithMetadata,
          metadata: {
            scanStatus: mcpResults.status,
            scanDuration: mcpResults.method.duration,
            sourceOfTruth: 'claude-code-mcp-manager',
            totalServers: serversWithMetadata.length,
            connectedServers: serversWithMetadata.filter(s => s.status === 'active').length
          }
        };
        console.log(JSON.stringify(versionedOutput, null, 2));
      } else if (options.format === 'table') {
        this.displayMcpServersTable(serversWithMetadata);
      } else {
        this.displayMcpServersList(serversWithMetadata);
      }
    } catch (error) {
      console.error(`❌ Failed to access Claude Code MCP manager: ${error.message}`);
      console.log('\n💡 Falling back to configuration file scanning...\n');
      
      // Fallback to original method
      const status = await this.scanner.scan();
      const allTools = this.extractAllTools(status);
      const mcpServers = allTools.filter(tool => tool.category === 'mcp-server');
      
      if (options.format === 'json') {
        const versionedOutput = {
          version: 1,
          servers: mcpServers,
          metadata: {
            fallbackMode: true,
            sourceOfTruth: 'config-file-parsing'
          }
        };
        console.log(JSON.stringify(versionedOutput, null, 2));
      } else if (options.format === 'table') {
        this.displayMcpServersTable(mcpServers);
      } else {
        this.displayMcpServersList(mcpServers);
      }
    }
  }

  async handleMcpInspect(serverName, options) {
    try {
      // Use Claude MCP Manager as source of truth
      const mcpResults = await this.claudeMCPManager.scan();
      const mcpServers = mcpResults.data || [];
      const server = mcpServers.find(s => s.name.toLowerCase().includes(serverName.toLowerCase()));
      
      if (!server) {
        console.log(`❌ MCP server '${serverName}' not found in Claude Code MCP manager`);
        console.log(`\nAvailable servers: ${mcpServers.map(s => s.name).join(', ')}`);
        return;
      }
      
      // Add enhanced metadata from source of truth
      const enhancedServer = {
        ...server,
        category: 'mcp-server',
        source: 'claude-mcp-manager',
        sourceOfTruth: true,
        inspectionMetadata: {
          scannedAt: new Date().toISOString(),
          scanDuration: mcpResults.method.duration,
          scanStatus: mcpResults.status,
          sourceOfTruth: 'claude-code-mcp-manager'
        }
      };
      
      if (options.format === 'json') {
        const versionedOutput = {
          version: 1,
          server: enhancedServer
        };
        console.log(JSON.stringify(versionedOutput, null, 2));
      } else {
        this.displayMcpServerInspection(enhancedServer);
      }
    } catch (error) {
      console.error(`❌ Failed to access Claude Code MCP manager: ${error.message}`);
      console.log('\n💡 Falling back to configuration file scanning...\n');
      
      // Fallback to original method
      const status = await this.scanner.scan();
      const allTools = this.extractAllTools(status);
      const mcpServers = allTools.filter(tool => tool.category === 'mcp-server');
      const server = mcpServers.find(s => s.name.toLowerCase().includes(serverName.toLowerCase()));
      
      if (!server) {
        console.log(`❌ MCP server '${serverName}' not found`);
        console.log(`\nAvailable servers: ${mcpServers.map(s => s.name).join(', ')}`);
        return;
      }
      
      if (options.format === 'json') {
        const versionedOutput = {
          version: 1,
          server: {
            ...server,
            metadata: {
              ...server.metadata,
              fallbackMode: true,
              sourceOfTruth: 'config-file-parsing'
            }
          }
        };
        console.log(JSON.stringify(versionedOutput, null, 2));
      } else {
        this.displayMcpServerInspection(server);
      }
    }
  }

  // Utility methods
  extractAllTools(scanResults) {
    const tools = [];
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (result.data && Array.isArray(result.data)) {
        result.data.forEach(tool => {
          tools.push({
            ...tool,
            category,
            source: 'ctdiscovery'
          });
        });
      }
    });
    return tools;
  }

  applyFilters(tools, options) {
    let filtered = [...tools];
    
    if (options.filter) {
      const pattern = options.filter.toLowerCase();
      filtered = filtered.filter(tool => 
        tool.name.toLowerCase().includes(pattern) ||
        (tool.description && tool.description.toLowerCase().includes(pattern))
      );
    }
    
    if (options.status) {
      filtered = filtered.filter(tool => tool.status === options.status);
    }
    
    return filtered;
  }

  displayToolsList(tools) {
    console.log(`Found ${tools.length} tools:\n`);
    
    tools.forEach(tool => {
      const status = this.getStatusIcon(tool.status);
      const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
      console.log(`${status} ${tool.name}${version} - ${tool.category}`);
    });
  }

  displayToolInspection(tool) {
    console.log(`🔍 ${tool.name} - Detailed Information`);
    console.log('═'.repeat(50));
    console.log(`Status: ${this.getStatusIcon(tool.status)} ${tool.status}`);
    console.log(`Category: ${tool.category}`);
    if (tool.metadata?.version) {
      console.log(`Version: ${tool.metadata.version}`);
    }
    if (tool.description) {
      console.log(`Description: ${tool.description}`);
    }
    if (tool.metadata) {
      console.log('\nMetadata:');
      console.log(JSON.stringify(tool.metadata, null, 2));
    }
  }

  displayMcpServersList(servers) {
    console.log(`Found ${servers.length} MCP servers:\n`);
    
    servers.forEach(server => {
      const status = this.getStatusIcon(server.status);
      console.log(`${status} ${server.name} - ${server.status}`);
    });
  }

  displayMcpServerInspection(server) {
    console.log(`🔍 ${server.name} - MCP Server Details`);
    console.log('═'.repeat(50));
    console.log(`Status: ${this.getStatusIcon(server.status)} ${server.status}`);
    console.log(`Type: ${server.type || 'MCP Server'}`);
    if (server.metadata) {
      console.log('\nServer Details:');
      console.log(JSON.stringify(server.metadata, null, 2));
    }
  }

  displayToolsTable(tools) {
    if (tools.length === 0) {
      console.log('No tools found.');
      return;
    }

    // Calculate column widths
    const maxNameWidth = Math.max(4, ...tools.map(t => t.name.length));
    const maxCategoryWidth = Math.max(8, ...tools.map(t => t.category.length));
    const maxVersionWidth = Math.max(7, ...tools.map(t => (t.metadata?.version || '').length));
    
    // Headers
    const nameHeader = 'Name'.padEnd(maxNameWidth);
    const categoryHeader = 'Category'.padEnd(maxCategoryWidth);
    const versionHeader = 'Version'.padEnd(maxVersionWidth);
    const statusHeader = 'Status';
    
    console.log(`${nameHeader} | ${categoryHeader} | ${versionHeader} | ${statusHeader}`);
    console.log('-'.repeat(nameHeader.length + categoryHeader.length + versionHeader.length + statusHeader.length + 9));
    
    // Data rows
    tools.forEach(tool => {
      const name = tool.name.padEnd(maxNameWidth);
      const category = tool.category.padEnd(maxCategoryWidth);
      const version = (tool.metadata?.version || '').padEnd(maxVersionWidth);
      const status = `${this.getStatusIcon(tool.status)} ${tool.status}`;
      
      console.log(`${name} | ${category} | ${version} | ${status}`);
    });
    
    console.log(`\nTotal: ${tools.length} tools`);
  }

  displayMcpServersTable(servers) {
    if (servers.length === 0) {
      console.log('No MCP servers found.');
      return;
    }

    // Calculate column widths
    const maxNameWidth = Math.max(4, ...servers.map(s => s.name.length));
    const maxTypeWidth = Math.max(4, ...servers.map(s => (s.type || 'MCP Server').length));
    
    // Headers
    const nameHeader = 'Name'.padEnd(maxNameWidth);
    const typeHeader = 'Type'.padEnd(maxTypeWidth);
    const statusHeader = 'Status';
    
    console.log(`${nameHeader} | ${typeHeader} | ${statusHeader}`);
    console.log('-'.repeat(nameHeader.length + typeHeader.length + statusHeader.length + 5));
    
    // Data rows
    servers.forEach(server => {
      const name = server.name.padEnd(maxNameWidth);
      const type = (server.type || 'MCP Server').padEnd(maxTypeWidth);
      const status = `${this.getStatusIcon(server.status)} ${server.status}`;
      
      console.log(`${name} | ${type} | ${status}`);
    });
    
    console.log(`\nTotal: ${servers.length} servers`);
  }

  // New enhanced tool discovery commands (matching Claude Code specification)
  
  async handleClaudeToolsList(options) {
    if (!options.quiet) {
      console.log('🔧 Claude Tools Discovery - Individual MCP Tools\n');
    }

    try {
      // Use the new tool discovery scanner
      const toolResults = await this.toolDiscovery.scan();
      let tools = toolResults.data || [];

      // Apply filters as per Claude Code spec
      const filters = {
        server: options.server,
        search: options.search,
        permissions: options.permissions,
        status: options.status
      };

      if (Object.values(filters).some(f => f)) {
        tools = this.toolDiscovery.filterTools(tools, filters);
      }

      // Output in requested format
      if (options.format === 'json') {
        const versionedOutput = {
          version: 1,
          tools: tools,
          metadata: {
            total: tools.length,
            scanStatus: toolResults.status,
            scanDuration: toolResults.method.duration,
            sourceOfTruth: 'claude-tool-discovery',
            filtersApplied: filters,
            byServer: this._groupToolsByServer(tools)
          }
        };
        console.log(JSON.stringify(versionedOutput, null, 2));
      } else if (options.format === 'table') {
        this.displayEnhancedToolsTable(tools);
      } else if (options.format === 'csv') {
        this.displayToolsCSV(tools);
      } else {
        this.displayEnhancedToolsList(tools);
      }

    } catch (error) {
      console.error(`❌ Failed to discover Claude tools: ${error.message}`);
      if (!options.quiet) {
        console.log('\n💡 Make sure Claude Code is installed and MCP servers are configured.');
      }
    }
  }

  async handleClaudeToolsInspect(toolName, options) {
    try {
      // Get all tools and find the matching one
      const toolResults = await this.toolDiscovery.scan();
      const tools = toolResults.data || [];
      
      const tool = tools.find(t => 
        t.name.toLowerCase().includes(toolName.toLowerCase()) ||
        t.displayName?.toLowerCase().includes(toolName.toLowerCase())
      );

      if (!tool) {
        console.log(`❌ Tool '${toolName}' not found in Claude tool discovery`);
        console.log(`\nAvailable tools: ${tools.map(t => t.displayName || t.name).join(', ')}`);
        return;
      }

      // Output in requested format
      if (options.format === 'json') {
        const versionedOutput = {
          version: 1,
          tool: tool,
          inspectionMetadata: {
            inspectedAt: new Date().toISOString(),
            sourceOfTruth: 'claude-tool-discovery'
          }
        };
        console.log(JSON.stringify(versionedOutput, null, 2));
      } else if (options.format === 'markdown') {
        this.displayToolInspectionMarkdown(tool);
      } else if (options.brief) {
        this.displayToolInspectionBrief(tool);
      } else {
        this.displayToolInspectionDetailed(tool);
      }

    } catch (error) {
      console.error(`❌ Failed to inspect tool '${toolName}': ${error.message}`);
    }
  }

  // Enhanced display methods for tool discovery

  displayEnhancedToolsList(tools) {
    const groupedTools = this._groupToolsByServer(tools);
    
    console.log(`MCP Tools Available (${tools.length} total)`);
    console.log('='.repeat(50));
    
    Object.entries(groupedTools).forEach(([serverName, serverTools]) => {
      console.log(`\n${serverName.toUpperCase()} Tools (${serverTools.length}):`);
      console.log('-'.repeat(serverName.length + 8));
      
      serverTools.forEach(tool => {
        const status = this.getStatusIcon(tool.status);
        const description = tool.metadata?.description || 'No description available';
        
        console.log(`${status} ${tool.displayName || tool.name}`);
        console.log(`   ${description}`);
        if (tool.metadata?.parameters?.required?.length > 0) {
          console.log(`   Required: ${tool.metadata.parameters.required.join(', ')}`);
        }
      });
    });
  }

  displayEnhancedToolsTable(tools) {
    console.log('Tool Name'.padEnd(25) + '| Server'.padEnd(15) + '| Status'.padEnd(12) + '| Description');
    console.log('-'.repeat(80));
    
    tools.forEach(tool => {
      const name = (tool.displayName || tool.name).substring(0, 24).padEnd(25);
      const server = (tool.server || 'unknown').substring(0, 14).padEnd(15);
      const status = `${this.getStatusIcon(tool.status)} ${tool.status}`.padEnd(12);
      const description = (tool.metadata?.description || '').substring(0, 30);
      
      console.log(`${name}| ${server}| ${status}| ${description}`);
    });
    
    console.log(`\nTotal: ${tools.length} tools`);
  }

  displayToolsCSV(tools) {
    console.log('Tool Name,Server,Status,Description,Required Parameters,Permissions');
    
    tools.forEach(tool => {
      const name = tool.displayName || tool.name;
      const server = tool.server || '';
      const status = tool.status || '';
      const description = (tool.metadata?.description || '').replace(/,/g, ';');
      const requiredParams = (tool.metadata?.parameters?.required || []).join(';');
      const permissions = (tool.metadata?.permissions || []).join(';');
      
      console.log(`"${name}","${server}","${status}","${description}","${requiredParams}","${permissions}"`);
    });
  }

  displayToolInspectionDetailed(tool) {
    console.log(`Tool: ${tool.name}`);
    console.log('='.repeat(tool.name.length + 6));
    console.log();
    
    console.log(`Display Name: ${tool.displayName || tool.name}`);
    console.log(`Server: ${tool.server || 'Unknown'}`);
    console.log(`Status: ${this.getStatusIcon(tool.status)} ${tool.status}`);
    console.log();
    
    console.log('Description:');
    console.log(`  ${tool.metadata?.description || 'No description available'}`);
    console.log();
    
    if (tool.metadata?.parameters) {
      console.log('Parameters:');
      console.log('-'.repeat(11));
      
      if (tool.metadata.parameters.required?.length > 0) {
        console.log('Required:');
        tool.metadata.parameters.required.forEach(param => {
          console.log(`  • ${param}`);
        });
      }
      
      if (tool.metadata.parameters.optional?.length > 0) {
        console.log('Optional:');
        tool.metadata.parameters.optional.forEach(param => {
          console.log(`  • ${param}`);
        });
      }
      console.log();
    }
    
    if (tool.metadata?.permissions?.length > 0) {
      console.log('Permissions:');
      console.log('-'.repeat(12));
      tool.metadata.permissions.forEach(perm => {
        console.log(`  • ${perm}`);
      });
      console.log();
    }
    
    if (tool.metadata?.usageExamples?.length > 0) {
      console.log('Usage Examples:');
      console.log('-'.repeat(15));
      tool.metadata.usageExamples.forEach((example, index) => {
        console.log(`  ${index + 1}. ${example}`);
      });
    }
  }

  displayToolInspectionBrief(tool) {
    const status = this.getStatusIcon(tool.status);
    const description = tool.metadata?.description || 'No description';
    const requiredParams = tool.metadata?.parameters?.required?.join(', ') || 'None';
    
    console.log(`${status} ${tool.displayName || tool.name} (${tool.server})`);
    console.log(`   ${description}`);
    console.log(`   Required: ${requiredParams}`);
  }

  displayToolInspectionMarkdown(tool) {
    console.log(`# ${tool.displayName || tool.name}\n`);
    console.log(`**Server:** ${tool.server || 'Unknown'}  `);
    console.log(`**Status:** ${tool.status}  `);
    console.log(`**Tool ID:** \`${tool.name}\`\n`);
    
    console.log('## Description\n');
    console.log(`${tool.metadata?.description || 'No description available'}\n`);
    
    if (tool.metadata?.parameters) {
      console.log('## Parameters\n');
      
      if (tool.metadata.parameters.required?.length > 0) {
        console.log('### Required\n');
        tool.metadata.parameters.required.forEach(param => {
          console.log(`- \`${param}\``);
        });
        console.log();
      }
      
      if (tool.metadata.parameters.optional?.length > 0) {
        console.log('### Optional\n');
        tool.metadata.parameters.optional.forEach(param => {
          console.log(`- \`${param}\``);
        });
        console.log();
      }
    }
  }

  _groupToolsByServer(tools) {
    const grouped = {};
    
    tools.forEach(tool => {
      const server = tool.server || 'unknown';
      if (!grouped[server]) {
        grouped[server] = [];
      }
      grouped[server].push(tool);
    });
    
    return grouped;
  }
}

const args = process.argv.slice(2);

// Helper function to get argument values
function getArgValue(args, flag) {
  // Handle --flag=value format
  const flagWithEquals = args.find(arg => arg.startsWith(`${flag}=`));
  if (flagWithEquals) {
    return flagWithEquals.split('=')[1];
  }
  
  // Handle --flag value format
  const index = args.indexOf(flag);
  return index >= 0 && index + 1 < args.length ? args[index + 1] : null;
}

// Handle special commands
if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
  console.log(`
🔍 CTDiscovery - AI Development Environment Status

USAGE:
  npm start                    # Full scan with display
  npm run scan                 # Scan + generate context files
  npm run tools                # Quick conversation starter
  
CLAUDE TOOLS CLI:
  --tools-list                 # List all available tools
  --tools-inspect <tool>       # Inspect specific tool
  --mcp-servers                # List MCP servers
  --mcp-inspect <server>       # Inspect MCP server
  
CLAUDE TOOLS OPTIONS:
  --format <format>            # Output format: human, json, table
  --filter <pattern>           # Filter by name pattern
  --status <status>            # Filter by status: active, missing, error
  
OPTIONS:
  --json                       # JSON output format (legacy)
  --verbose                    # Detailed information
  --dev                        # Development mode
  --generate-context           # Create .ctdiscovery-context.md
  --conversation-starter       # Create conversation starter
  --show-starter               # Display starter in console
  --all                        # Generate all context files
  --quiet                      # Suppress normal output

EXAMPLES:
  npm start --generate-context              # Scan + create context file
  npm start --tools-list --format=json      # List tools as JSON (versioned)
  npm start --tools-list --format=table     # List tools in table format
  npm start --tools-inspect npm             # Inspect npm tool
  npm start --mcp-servers --format=table    # List MCP servers in table format
`);
  process.exit(0);
}

// Claude Tools CLI options
const claudeToolsOptions = {
  toolsList: args.includes('--tools-list'),
  toolsInspect: getArgValue(args, '--tools-inspect'),
  mcpServers: args.includes('--mcp-servers'),
  mcpInspect: getArgValue(args, '--mcp-inspect'),
  // New enhanced tool discovery commands (Claude Code spec)
  claudeToolsList: args.includes('--claude-tools-list') || args.includes('tools') && args.includes('list'),
  claudeToolsInspect: getArgValue(args, '--claude-tools-inspect') || (args.includes('tools') && args.includes('inspect') && args[args.indexOf('inspect') + 1]),
  mcpServersList: args.includes('--mcp-servers-list') || (args.includes('mcp') && args.includes('servers') && args.includes('list')),
  // Enhanced options
  format: getArgValue(args, '--format') || 'human',
  filter: getArgValue(args, '--filter'),
  status: getArgValue(args, '--status'),
  server: getArgValue(args, '--server'),
  search: getArgValue(args, '--search'),
  permissions: getArgValue(args, '--permissions'),
  verbose: args.includes('--verbose'),
  brief: args.includes('--brief'),
  watch: args.includes('--watch'),
  alert: args.includes('--alert')
};

const options = {
  dev: args.includes('--dev'),
  verbose: args.includes('--verbose'),
  json: args.includes('--json'),
  generateContext: args.includes('--generate-context'),
  conversationStarter: args.includes('--conversation-starter'),
  showStarter: args.includes('--show-starter'),
  all: args.includes('--all'),
  quiet: args.includes('--quiet'),
  ...claudeToolsOptions
};

const discovery = new CTDiscovery();
discovery.run(options);

export { CTDiscovery };