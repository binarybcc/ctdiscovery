import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import os from 'os';
import { PlatformDetection } from '../utils/platform-detection.js';
import { ToolScannerInterface, TOOL_STATUSES, TOOL_CATEGORIES, SCAN_STATUSES } from '../interfaces/tool-scanner-interface.js';

export class MCPScanner extends ToolScannerInterface {
  constructor() {
    super();
    this.name = 'MCP Server Scanner';
    this.category = 'mcp-server';
    this.platform = 'macos';
    this.version = '1.0.0';
    
    this.platformDetection = new PlatformDetection();
    this.detectionMethods = [
      this.scanClaudeCodeMCPs.bind(this),
      this.scanSystemMCPs.bind(this),
      this.scanLocalMCPs.bind(this)
    ];
  }

  async validate() {
    const startTime = Date.now();
    try {
      // Test if we can read basic directories
      const claudePaths = this.platformDetection.getClaudePaths();
      const accessible = existsSync(claudePaths.localConfig) || existsSync(os.homedir());
      
      return {
        functional: accessible,
        accessible: accessible,
        configured: existsSync(claudePaths.localConfig),
        duration: Date.now() - startTime,
        requirements: ['File system read access', 'Claude Code installation']
      };
    } catch (error) {
      return {
        functional: false,
        accessible: false,
        configured: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  getCapabilities() {
    return [
      'Detect active Claude Code MCP servers',
      'Scan system-wide MCP installations',
      'Find project-local MCP configurations',
      'Extract MCP server metadata and capabilities'
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
        platform: this.platform
      },
      overlaps: [],
      errors: [],
      warnings: []
    };

    // Global deduplication across all methods
    const seenNames = new Set();

    for (const method of this.detectionMethods) {
      try {
        const methodResult = await method();
        
        // Convert to standardized format and deduplicate globally
        if (methodResult.active) {
          methodResult.active.forEach(tool => {
            if (!seenNames.has(tool.name)) {
              seenNames.add(tool.name);
              results.data.push({
                ...tool,
                type: TOOL_CATEGORIES.MCP_SERVER,
                status: TOOL_STATUSES.ACTIVE
              });
            }
          });
        }
        
        if (methodResult.available) {
          methodResult.available.forEach(tool => {
            if (!seenNames.has(tool.name)) {
              seenNames.add(tool.name);
              results.data.push({
                ...tool,
                type: TOOL_CATEGORIES.MCP_SERVER,
                status: TOOL_STATUSES.AVAILABLE
              });
            }
          });
        }
        
      } catch (error) {
        results.errors.push(`${method.name}: ${error.message}`);
        results.status = SCAN_STATUSES.PARTIAL;
      }
    }

    results.method.duration = Date.now() - startTime;
    results.method.status = results.errors.length === 0 ? 'completed' : 'partial';
    
    if (results.data.length === 0 && results.errors.length > 0) {
      results.status = SCAN_STATUSES.FAILED;
    }
    
    return results;
  }

  async scanClaudeCodeMCPs() {
    // Scan for active Claude Code MCP connections
    const result = {
      method: { name: 'Claude Code MCP Detection', status: 'scanning' },
      active: [],
      available: []
    };

    // Modern Claude Code config locations
    const claudeConfigPaths = [
      path.join(os.homedir(), '.claude', 'settings.local.json'),
      path.join(process.cwd(), '.claude', 'settings.local.json'),
      // Legacy paths
      path.join(os.homedir(), '.config', 'claude', 'config.json'),
      '/usr/local/share/claude/config.json'
    ];

    for (const configPath of claudeConfigPaths) {
      if (existsSync(configPath)) {
        try {
          const config = JSON.parse(readFileSync(configPath, 'utf8'));
          result.method.status = 'found_config';
          
          // Modern Claude Code format - Extract from permissions
          if (config.permissions && config.permissions.allow) {
            config.permissions.allow.forEach(permission => {
              if (typeof permission === 'string' && permission.startsWith('mcp__')) {
                const mcpName = permission.replace('mcp__', '');
                result.active.push({
                  name: mcpName,
                  type: 'mcp-server',
                  source: 'claude-permissions',
                  permission: permission,
                  status: 'active',
                  metadata: {
                    configPath: configPath,
                    method: 'permissions'
                  }
                });
              }
            });
          }
          
          // Extract from enabledMcpjsonServers
          if (config.enabledMcpjsonServers && Array.isArray(config.enabledMcpjsonServers)) {
            config.enabledMcpjsonServers.forEach(serverName => {
              result.active.push({
                name: serverName,
                type: 'mcp-server', 
                source: 'claude-enabled-servers',
                status: 'active',
                metadata: {
                  configPath: configPath,
                  method: 'enabledMcpjsonServers'
                }
              });
            });
          }
          
          // Legacy format - Extract MCP server information from Claude config
          if (config.mcpServers) {
            Object.entries(config.mcpServers).forEach(([name, server]) => {
              result.active.push({
                name: name,
                type: 'mcp-server',
                source: 'claude-config-legacy',
                command: server.command,
                args: server.args,
                status: 'active',
                metadata: {
                  configPath: configPath,
                  method: 'mcpServers'
                }
              });
            });
          }

          // Check for built-in Claude Code MCP
          if (config.enableAllProjectMcpServers || config.permissions) {
            result.active.push({
              name: '@anthropic-ai/claude-code',
              type: 'mcp-server',
              source: 'claude-built-in',
              status: 'active',
              metadata: {
                configPath: configPath,
                method: 'built-in',
                globalEnabled: config.enableAllProjectMcpServers
              }
            });
          }
          
        } catch (error) {
          result.method.status = 'config_parse_error';
          result.method.error = error.message;
        }
      }
    }

    return result;
  }

  async scanSystemMCPs() {
    // Scan for system-wide MCP installations
    const result = {
      method: { name: 'System MCP Detection', status: 'scanning' },
      available: [],
      potential: []
    };

    // Common MCP installation locations
    const mcpPaths = [
      '/usr/local/bin',
      path.join(os.homedir(), '.local/bin'),
      path.join(os.homedir(), 'bin')
    ];

    // Known MCP server patterns
    const mcpPatterns = [
      'mcp-*',
      '*-mcp',
      'claude-mcp-*'
    ];

    // Scan npm global packages for MCP servers
    try {
      const npmGlobals = execSync('npm list -g --depth=0 --json', { encoding: 'utf8' });
      const packages = JSON.parse(npmGlobals);
      
      Object.keys(packages.dependencies || {}).forEach(pkg => {
        if (pkg.includes('mcp') || pkg.includes('claude')) {
          result.available.push({
            name: pkg,
            type: 'npm-global',
            source: 'npm',
            version: packages.dependencies[pkg].version,
            status: 'installed'
          });
        }
      });
    } catch (error) {
      result.method.npmScanError = error.message;
    }

    return result;
  }

  async scanLocalMCPs() {
    // Scan for project-local MCP configurations
    const result = {
      method: { name: 'Local Project MCP Detection', status: 'scanning' },
      available: [],
      potential: []
    };

    // Check package.json for MCP-related dependencies
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        Object.entries(allDeps).forEach(([name, version]) => {
          if (name.includes('mcp') || name.includes('claude')) {
            result.available.push({
              name: name,
              type: 'npm-local',
              source: 'package.json',
              version: version,
              status: 'listed'
            });
          }
        });
      } catch (error) {
        result.method.packageJsonError = error.message;
      }
    }

    return result;
  }

  determineOverallStatus(results) {
    const totalActive = results.active.length;
    const totalAvailable = results.available.length;
    
    if (totalActive > 0) return 'active';
    if (totalAvailable > 0) return 'available';
    return 'none_detected';
  }
}