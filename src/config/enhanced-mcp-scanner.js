import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import os from 'os';
import { PlatformDetection } from '../utils/platform-detection.js';
import { ToolScannerInterface, TOOL_STATUSES, TOOL_CATEGORIES, SCAN_STATUSES } from '../interfaces/tool-scanner-interface.js';
import { scannerConfigAdapter } from './scanner-config-adapter.js';

/**
 * Enhanced MCP Scanner with Configuration System Integration
 * Demonstrates how to integrate existing scanners with the new config system
 */
export class EnhancedMCPScanner extends ToolScannerInterface {
  constructor() {
    super();
    this.name = 'Enhanced MCP Server Scanner';
    this.category = 'mcp-server';
    this.platform = process.platform;
    this.version = '2.0.0';
    
    this.platformDetection = new PlatformDetection();
    this.configAdapter = scannerConfigAdapter;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.configAdapter.initialize();
      
      // Get enhanced configuration
      this.config = this.configAdapter.getEnhancedConfig('mcp-server', {
        detectionMethods: [
          'claude-config',
          'npm-global', 
          'npm-local',
          'system-binaries'
        ],
        knownTools: [
          {
            name: 'filesystem',
            patterns: ['mcp-server-filesystem', '@modelcontextprotocol/server-filesystem'],
            capabilities: ['read_files', 'write_files', 'list_directories']
          }
        ]
      });
      
      // Get execution parameters
      this.executionParams = this.configAdapter.getExecutionParams('mcp-server');
      
      // Get platform configuration
      this.platformConfig = this.configAdapter.getPlatformConfig('mcp-server');
      
      this.initialized = true;
    }
  }

  async validate() {
    await this.initialize();
    
    const startTime = Date.now();
    const validationReqs = this.configAdapter.getValidationRequirements('mcp-server');
    
    try {
      // Test if we can read basic directories
      const claudePaths = this.platformDetection.getClaudePaths();
      const accessible = existsSync(claudePaths.localConfig) || existsSync(os.homedir());
      
      // Enhanced validation based on config
      const functional = accessible && this._testConfigAccess();
      
      return {
        functional: functional,
        accessible: accessible,
        configured: existsSync(claudePaths.localConfig),
        duration: Date.now() - startTime,
        requirements: [
          'File system read access', 
          'Claude Code installation',
          ...this.config.metadata.requirements || []
        ],
        configSource: 'enhanced-config-system'
      };
    } catch (error) {
      return {
        functional: false,
        accessible: false,
        configured: false,
        duration: Date.now() - startTime,
        error: error.message,
        configSource: 'enhanced-config-system'
      };
    }
  }

  getCapabilities() {
    const baseCapabilities = [
      'Detect active Claude Code MCP servers',
      'Scan system-wide MCP installations', 
      'Find project-local MCP configurations',
      'Extract MCP server metadata and capabilities'
    ];
    
    // Add configuration-based capabilities
    const configCapabilities = this.config?.capabilities || [];
    
    return [...baseCapabilities, ...configCapabilities];
  }

  async scan() {
    await this.initialize();
    
    // Check if scanner is enabled
    if (!this.executionParams.enabled) {
      return {
        status: SCAN_STATUSES.NOT_SUPPORTED,
        data: [],
        method: {
          name: this.name,
          status: 'disabled',
          duration: 0,
          platform: this.platform
        },
        message: 'Scanner disabled in configuration'
      };
    }
    
    const startTime = Date.now();
    const results = {
      status: SCAN_STATUSES.SUCCESS,
      data: [],
      method: {
        name: this.name,
        status: 'scanning',
        duration: 0,
        platform: this.platform,
        configVersion: this.config?.version || '1.0.0'
      },
      overlaps: [],
      errors: [],
      warnings: []
    };

    // Use configured detection methods
    const enabledMethods = this._getEnabledDetectionMethods();
    
    for (const methodName of enabledMethods) {
      try {
        const method = this._getDetectionMethod(methodName);
        if (method) {
          const methodResult = await this._executeWithTimeout(
            method.bind(this),
            this.executionParams.timeout
          );
          
          // Process results with configuration-aware logic
          this._processMethodResults(methodResult, results);
        }
      } catch (error) {
        results.errors.push(`${methodName}: ${error.message}`);
        results.status = SCAN_STATUSES.PARTIAL;
      }
    }

    // Apply overlap detection if enabled
    if (this.config?.global?.enableOverlapDetection) {
      results.data = this.configAdapter.applyOverlapRules('mcp-server', results.data);
    }

    // Add custom tools from configuration
    this._addCustomTools(results);

    results.method.duration = Date.now() - startTime;
    results.method.status = results.errors.length === 0 ? 'completed' : 'partial';
    
    if (results.data.length === 0 && results.errors.length > 0) {
      results.status = SCAN_STATUSES.FAILED;
    }
    
    return results;
  }

  // Enhanced Detection Methods

  async scanClaudeCodeMCPs() {
    const result = {
      method: { name: 'Claude Code MCP Detection (Enhanced)', status: 'scanning' },
      active: [],
      available: []
    };

    // Use enhanced search paths from configuration
    const searchPaths = this._getConfiguredSearchPaths();
    
    for (const configPath of searchPaths) {
      if (existsSync(configPath)) {
        try {
          const config = JSON.parse(readFileSync(configPath, 'utf8'));
          result.method.status = 'found_config';
          
          // Extract MCP server information with enhanced metadata
          if (config.mcpServers) {
            Object.entries(config.mcpServers).forEach(([name, server]) => {
              const toolInfo = this._enhanceToolInfo(name, server);
              result.active.push(toolInfo);
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
    const result = {
      method: { name: 'System MCP Detection (Enhanced)', status: 'scanning' },
      available: [],
      potential: []
    };

    // Use platform-specific package manager from configuration
    const preferredPM = this.platformConfig.preferredPackageManager;
    
    // Enhanced npm scanning with configuration
    if (preferredPM === 'npm' || !preferredPM) {
      await this._scanNpmMCPs(result);
    }
    
    // Additional package managers based on platform config
    if (this.platformConfig.platform === 'darwin' && preferredPM === 'brew') {
      await this._scanBrewMCPs(result);
    }

    return result;
  }

  async scanLocalMCPs() {
    const result = {
      method: { name: 'Local Project MCP Detection (Enhanced)', status: 'scanning' },
      available: [],
      potential: []
    };

    // Enhanced package.json scanning
    await this._scanPackageJson(result);
    
    // Scan additional local paths from configuration
    const customPaths = this.config?.searchPaths?.custom || [];
    for (const customPath of customPaths) {
      await this._scanCustomPath(customPath, result);
    }

    return result;
  }

  // Private Helper Methods

  _testConfigAccess() {
    try {
      const claudePaths = this.platformDetection.getClaudePaths();
      return existsSync(claudePaths.config) || existsSync(claudePaths.fallback || '');
    } catch {
      return false;
    }
  }

  _getEnabledDetectionMethods() {
    return this.config?.detectionMethods || [
      'claude-config',
      'npm-global',
      'npm-local'
    ];
  }

  _getDetectionMethod(methodName) {
    const methodMap = {
      'claude-config': this.scanClaudeCodeMCPs,
      'npm-global': this.scanSystemMCPs,
      'npm-local': this.scanLocalMCPs,
      'system-binaries': this._scanSystemBinaries
    };
    
    return methodMap[methodName];
  }

  async _executeWithTimeout(method, timeout) {
    return Promise.race([
      method(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Method timeout')), timeout)
      )
    ]);
  }

  _processMethodResults(methodResult, results) {
    if (methodResult.active) {
      methodResult.active.forEach(tool => {
        results.data.push({
          ...tool,
          type: TOOL_CATEGORIES.MCP_SERVER,
          status: TOOL_STATUSES.ACTIVE,
          source: 'enhanced-config-scan'
        });
      });
    }
    
    if (methodResult.available) {
      methodResult.available.forEach(tool => {
        results.data.push({
          ...tool,
          type: TOOL_CATEGORIES.MCP_SERVER,
          status: TOOL_STATUSES.AVAILABLE,
          source: 'enhanced-config-scan'
        });
      });
    }
  }

  _getConfiguredSearchPaths() {
    const claudePaths = this.platformDetection.getClaudePaths();
    const configPaths = this.config?.searchPaths || {};
    
    const defaultPaths = [
      claudePaths.globalConfig,
      claudePaths.fallback && path.join(claudePaths.fallback, 'config.json'),
      path.join(claudePaths.localConfig, 'settings.local.json')
    ].filter(Boolean);
    
    const platformPaths = configPaths[this.platformConfig.platform] || [];
    const customPaths = configPaths.custom || [];
    
    return [...defaultPaths, ...platformPaths, ...customPaths];
  }

  _enhanceToolInfo(name, server) {
    // Find matching known tool from configuration
    const knownTool = this.config?.knownTools?.find(tool => 
      tool.patterns?.some(pattern => name.includes(pattern))
    );
    
    return {
      name: name,
      type: 'mcp-server',
      source: 'claude-config',
      command: server.command,
      args: server.args,
      status: 'configured',
      metadata: {
        description: knownTool?.description,
        capabilities: knownTool?.capabilities || [],
        version: server.version,
        configPath: server.configPath
      },
      enhanced: true
    };
  }

  _addCustomTools(results) {
    const customTools = this.configAdapter.getCustomTools('mcp-server');
    
    for (const tool of customTools) {
      // Check if tool is actually available
      if (this._isToolAvailable(tool)) {
        results.data.push({
          name: tool.name,
          type: TOOL_CATEGORIES.MCP_SERVER,
          status: TOOL_STATUSES.AVAILABLE,
          source: 'custom-config',
          metadata: {
            description: tool.description,
            capabilities: tool.capabilities || [],
            patterns: tool.patterns
          },
          customTool: true
        });
      }
    }
  }

  _isToolAvailable(tool) {
    // Basic availability check for custom tools
    return tool.patterns?.some(pattern => {
      try {
        execSync(`which ${pattern}`, { stdio: 'pipe' });
        return true;
      } catch {
        return false;
      }
    });
  }

  async _scanNpmMCPs(result) {
    try {
      const npmGlobals = execSync('npm list -g --depth=0 --json', { 
        encoding: 'utf8',
        timeout: this.executionParams.timeout 
      });
      const packages = JSON.parse(npmGlobals);
      
      Object.keys(packages.dependencies || {}).forEach(pkg => {
        if (this._isMCPPackage(pkg)) {
          result.available.push({
            name: pkg,
            type: 'npm-global',
            source: 'npm',
            version: packages.dependencies[pkg].version,
            status: 'installed',
            enhanced: true
          });
        }
      });
    } catch (error) {
      result.method.npmScanError = error.message;
    }
  }

  async _scanBrewMCPs(result) {
    try {
      const brewList = execSync('brew list --formula --json', {
        encoding: 'utf8',
        timeout: this.executionParams.timeout
      });
      const formulas = JSON.parse(brewList);
      
      formulas.forEach(formula => {
        if (this._isMCPPackage(formula.name)) {
          result.available.push({
            name: formula.name,
            type: 'brew-formula',
            source: 'homebrew',
            version: formula.versions?.stable,
            status: 'installed',
            enhanced: true
          });
        }
      });
    } catch (error) {
      result.method.brewScanError = error.message;
    }
  }

  async _scanPackageJson(result) {
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
        const allDeps = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };

        Object.entries(allDeps).forEach(([name, version]) => {
          if (this._isMCPPackage(name)) {
            result.available.push({
              name: name,
              type: 'npm-local',
              source: 'package.json',
              version: version,
              status: 'listed',
              enhanced: true
            });
          }
        });
      } catch (error) {
        result.method.packageJsonError = error.message;
      }
    }
  }

  async _scanCustomPath(customPath, result) {
    const expandedPath = customPath.replace('~', os.homedir());
    if (existsSync(expandedPath)) {
      // Custom path scanning logic based on path type
      result.potential.push({
        name: `custom-path-${path.basename(expandedPath)}`,
        type: 'custom-path',
        source: customPath,
        status: 'found',
        enhanced: true
      });
    }
  }

  _isMCPPackage(name) {
    const mcpPatterns = [
      'mcp', 'claude', '@modelcontextprotocol',
      ...this.config?.knownTools?.flatMap(tool => tool.patterns) || []
    ];
    
    return mcpPatterns.some(pattern => 
      name.toLowerCase().includes(pattern.toLowerCase())
    );
  }
}

