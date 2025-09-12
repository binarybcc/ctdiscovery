import { execSync } from 'child_process';
import { ToolScannerInterface, TOOL_STATUSES, TOOL_CATEGORIES, SCAN_STATUSES } from '../interfaces/tool-scanner-interface.js';

/**
 * Claude Code MCP Manager Scanner
 * Uses Claude Code's internal MCP manager as the source of truth
 * This provides real connection status and post-permission resolution data
 */
export class ClaudeMCPManager extends ToolScannerInterface {
  constructor() {
    super();
    this.name = 'Claude Code MCP Manager';
    this.category = 'mcp-server';
    this.platform = process.platform;
    this.version = '1.0.0';
  }

  async validate() {
    const startTime = Date.now();
    try {
      // Test if claude command is available
      execSync('claude --version', { encoding: 'utf8', stdio: 'pipe' });
      
      // Test if claude mcp command works
      const mcpList = await this._executeClaudeCommand('mcp list');
      const functional = mcpList !== null;
      
      return {
        functional,
        accessible: functional,
        configured: functional,
        duration: Date.now() - startTime,
        requirements: ['Claude Code CLI installed and accessible']
      };
    } catch (error) {
      return {
        functional: false,
        accessible: false,
        configured: false,
        duration: Date.now() - startTime,
        error: error.message,
        requirements: ['Claude Code CLI installed and accessible']
      };
    }
  }

  getCapabilities() {
    return [
      'Access Claude Code internal MCP manager',
      'Real-time MCP server connection status',
      'Post-permission resolution tool states',
      'Server capabilities and version information',
      'Connection health monitoring',
      'Detailed server configuration'
    ];
  }

  async scan() {
    const startTime = Date.now();
    const results = {
      status: SCAN_STATUSES.SUCCESS,
      data: [],
      method: {
        name: this.name,
        status: 'scanning',
        duration: 0,
        platform: this.platform,
        sourceOfTruth: 'claude-mcp-manager'
      },
      overlaps: [],
      errors: [],
      warnings: []
    };

    try {
      // Get active MCP server list from Claude Code's internal manager
      const serverList = await this._getServerList();
      if (!serverList) {
        throw new Error('Failed to get MCP server list from Claude Code');
      }

      // Process each server
      for (const serverInfo of serverList) {
        try {
          // Get detailed server information
          const detailedInfo = await this._getServerDetails(serverInfo.name);
          
          // Get server capabilities if available
          const capabilities = await this._getServerCapabilities(serverInfo.name);
          
          const tool = {
            name: serverInfo.name,
            type: TOOL_CATEGORIES.MCP_SERVER,
            status: serverInfo.connected ? TOOL_STATUSES.ACTIVE : TOOL_STATUSES.ERROR,
            source: 'claude-mcp-manager',
            metadata: {
              connectionStatus: serverInfo.connected ? 'Connected' : 'Disconnected',
              command: serverInfo.command,
              args: serverInfo.args,
              serverType: serverInfo.type,
              scope: detailedInfo?.scope,
              url: detailedInfo?.url,
              headers: detailedInfo?.headers,
              environment: detailedInfo?.environment,
              capabilities: capabilities,
              healthCheck: serverInfo.healthCheck || 'unknown',
              sourceOfTruth: 'internal-mcp-manager'
            }
          };

          results.data.push(tool);

        } catch (error) {
          results.warnings.push(`Failed to get details for server ${serverInfo.name}: ${error.message}`);
          
          // Still add basic server info even if details failed
          results.data.push({
            name: serverInfo.name,
            type: TOOL_CATEGORIES.MCP_SERVER,
            status: serverInfo.connected ? TOOL_STATUSES.ACTIVE : TOOL_STATUSES.ERROR,
            source: 'claude-mcp-manager',
            metadata: {
              connectionStatus: serverInfo.connected ? 'Connected' : 'Disconnected',
              command: serverInfo.command,
              args: serverInfo.args,
              serverType: serverInfo.type,
              error: error.message,
              sourceOfTruth: 'internal-mcp-manager'
            }
          });
        }
      }

      results.method.status = 'completed';

    } catch (error) {
      results.errors.push(`MCP Manager scan failed: ${error.message}`);
      results.status = SCAN_STATUSES.FAILED;
      results.method.status = 'failed';
    }

    results.method.duration = Date.now() - startTime;
    
    return results;
  }

  /**
   * Get list of MCP servers from Claude Code's internal manager
   * Parses output of `claude mcp list`
   */
  async _getServerList() {
    try {
      const output = await this._executeClaudeCommand('mcp list');
      if (!output) return null;

      const servers = [];
      const lines = output.split('\n').filter(line => line.trim());

      // Skip header lines and parse server entries
      for (const line of lines) {
        if (line.includes(':') && !line.startsWith('Checking')) {
          const serverInfo = this._parseServerListLine(line);
          if (serverInfo) {
            servers.push(serverInfo);
          }
        }
      }

      return servers;
    } catch (error) {
      throw new Error(`Failed to get server list: ${error.message}`);
    }
  }

  /**
   * Parse a single line from `claude mcp list` output
   * Format: "github: npx -y @modelcontextprotocol/server-github - ✓ Connected"
   * Format: "context7: https://mcp.context7.com/mcp (HTTP) - ✓ Connected"
   */
  _parseServerListLine(line) {
    try {
      // Split on first colon to get name
      const colonIndex = line.indexOf(':');
      if (colonIndex === -1) return null;

      const name = line.substring(0, colonIndex).trim();
      const rest = line.substring(colonIndex + 1).trim();

      // Check connection status
      const connected = line.includes('✓ Connected');
      
      // Parse command/URL
      let command = null;
      let args = [];
      let type = 'stdio';
      let url = null;

      if (rest.includes('http')) {
        // HTTP server format
        type = 'http';
        const httpMatch = rest.match(/(https?:\/\/[^\s]+)/);
        if (httpMatch) {
          url = httpMatch[1];
        }
      } else {
        // Stdio server format
        const parts = rest.split(' - ')[0].trim().split(' ');
        if (parts.length > 0) {
          command = parts[0];
          args = parts.slice(1);
        }
      }

      return {
        name,
        connected,
        command,
        args,
        type,
        url,
        healthCheck: connected ? 'passed' : 'failed'
      };
    } catch (error) {
      return null;
    }
  }

  /**
   * Get detailed server information using `claude mcp get <name>`
   */
  async _getServerDetails(serverName) {
    try {
      const output = await this._executeClaudeCommand(`mcp get "${serverName}"`);
      if (!output) return null;

      const details = {
        scope: null,
        status: null,
        type: null,
        command: null,
        args: null,
        url: null,
        headers: {},
        environment: {}
      };

      const lines = output.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        
        if (trimmed.startsWith('Scope:')) {
          details.scope = trimmed.replace('Scope:', '').trim();
        } else if (trimmed.startsWith('Status:')) {
          details.status = trimmed.replace('Status:', '').trim();
        } else if (trimmed.startsWith('Type:')) {
          details.type = trimmed.replace('Type:', '').trim();
        } else if (trimmed.startsWith('Command:')) {
          details.command = trimmed.replace('Command:', '').trim();
        } else if (trimmed.startsWith('Args:')) {
          details.args = trimmed.replace('Args:', '').trim().split(' ').filter(Boolean);
        } else if (trimmed.startsWith('URL:')) {
          details.url = trimmed.replace('URL:', '').trim();
        } else if (trimmed.startsWith('Environment:')) {
          // Environment section follows - would need more parsing for full support
        } else if (trimmed.startsWith('Headers:')) {
          // Headers section follows - would need more parsing for full support
        } else if (trimmed.includes(':') && !trimmed.startsWith('To remove')) {
          // Try to parse key-value pairs for headers/environment
          const keyValue = trimmed.split(':');
          if (keyValue.length === 2) {
            const key = keyValue[0].trim();
            const value = keyValue[1].trim();
            if (key && value) {
              details.headers[key] = value;
            }
          }
        }
      }

      return details;
    } catch (error) {
      return null;
    }
  }

  /**
   * Get server capabilities by parsing debug output
   * This provides version and capability information
   */
  async _getServerCapabilities(serverName) {
    try {
      // Use debug mode to get capability information
      const output = await this._executeClaudeCommand(
        `--debug --print "List MCP capabilities" 2>&1 | grep -A 2 -B 2 "${serverName}"`,
        { timeout: 10000 }
      );

      if (!output) return null;

      const capabilities = {
        hasTools: null,
        hasPrompts: null,
        hasResources: null,
        serverVersion: null
      };

      // Look for capability patterns in debug output
      const lines = output.split('\n');
      
      for (const line of lines) {
        if (line.includes('capabilities') && line.includes('{')) {
          try {
            // Try to extract JSON capabilities object
            const jsonMatch = line.match(/\{[^}]+\}/);
            if (jsonMatch) {
              const capabilitiesObj = JSON.parse(jsonMatch[0]);
              Object.assign(capabilities, capabilitiesObj);
            }
          } catch (error) {
            // Continue if JSON parsing fails
          }
        }
        
        // Look for version information
        if (line.includes('version') && line.includes(serverName)) {
          const versionMatch = line.match(/"version":"([^"]+)"/);
          if (versionMatch) {
            capabilities.serverVersion = {
              name: serverName,
              version: versionMatch[1]
            };
          }
        }
      }

      return capabilities;
    } catch (error) {
      return null;
    }
  }

  /**
   * Execute a Claude Code command with error handling and timeout
   */
  async _executeClaudeCommand(command, options = {}) {
    const timeout = options.timeout || 5000;
    
    try {
      const fullCommand = command.startsWith('claude') ? command : `claude ${command}`;
      
      const output = execSync(fullCommand, {
        encoding: 'utf8',
        timeout: timeout,
        stdio: 'pipe'
      });

      return output;
    } catch (error) {
      if (error.code === 'TIMEOUT') {
        throw new Error(`Command timed out after ${timeout}ms: ${command}`);
      }
      throw new Error(`Command failed: ${error.message}`);
    }
  }

  /**
   * Check if a specific MCP server is active and connected
   */
  async isServerActive(serverName) {
    try {
      const serverList = await this._getServerList();
      if (!serverList) return false;

      const server = serverList.find(s => s.name === serverName);
      return server ? server.connected : false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get summary of MCP manager state
   */
  async getSummary() {
    try {
      const serverList = await this._getServerList();
      if (!serverList) {
        return {
          total: 0,
          connected: 0,
          disconnected: 0,
          servers: []
        };
      }

      const connected = serverList.filter(s => s.connected).length;
      const disconnected = serverList.length - connected;

      return {
        total: serverList.length,
        connected,
        disconnected,
        servers: serverList.map(s => ({
          name: s.name,
          connected: s.connected,
          type: s.type
        }))
      };
    } catch (error) {
      throw new Error(`Failed to get MCP manager summary: ${error.message}`);
    }
  }
}