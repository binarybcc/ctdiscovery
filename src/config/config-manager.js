import { readFileSync, existsSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { PlatformDetection } from '../utils/platform-detection.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

/**
 * Configuration Manager for CTDiscovery
 * Handles loading, merging, and validating tool scanner configurations
 */
export class ConfigManager {
  constructor() {
    this.platformDetection = new PlatformDetection();
    this.defaultConfig = null;
    this.userConfig = null;
    this.mergedConfig = null;
    this.configPaths = this._getConfigPaths();
  }

  /**
   * Initialize the configuration system
   * @returns {Promise<Object>} Merged configuration object
   */
  async initialize() {
    const startTime = Date.now();
    
    try {
      // Load default configuration
      this.defaultConfig = this._loadDefaultConfig();
      
      // Load user configuration with fallbacks
      this.userConfig = this._loadUserConfig();
      
      // Merge configurations
      this.mergedConfig = this._mergeConfigurations();
      
      // Validate merged configuration
      const validation = this._validateConfig(this.mergedConfig);
      if (!validation.valid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }
      
      // Apply platform-specific settings
      this._applyPlatformSettings();
      
      const initTime = Date.now() - startTime;
      
      return {
        config: this.mergedConfig,
        metadata: {
          initTime,
          sources: this._getConfigSources(),
          platform: this.platformDetection.getPlatformInfo(),
          validation: validation
        }
      };
      
    } catch (error) {
      // Graceful fallback to default config only
      console.warn(`Configuration loading failed, using defaults: ${error.message}`);
      
      this.mergedConfig = this.defaultConfig || this._getMinimalConfig();
      
      return {
        config: this.mergedConfig,
        metadata: {
          initTime: Date.now() - startTime,
          sources: ['default-fallback'],
          platform: this.platformDetection.getPlatformInfo(),
          error: error.message
        }
      };
    }
  }

  /**
   * Get current configuration
   * @returns {Object} Current merged configuration
   */
  getConfig() {
    return this.mergedConfig || this.defaultConfig;
  }

  /**
   * Get scanner configuration for specific scanner type
   * @param {string} scannerType - Type of scanner (e.g., 'mcp-server', 'vscode-extension')
   * @returns {Object} Scanner-specific configuration
   */
  getScannerConfig(scannerType) {
    const config = this.getConfig();
    return config?.scanners?.[scannerType] || null;
  }

  /**
   * Get performance settings
   * @returns {Object} Performance configuration
   */
  getPerformanceSettings() {
    const config = this.getConfig();
    return config?.performance || {
      maxScanTime: 3000,
      timeoutPerScanner: 2000,
      enableParallelScanning: true,
      maxConcurrentScanners: 4
    };
  }

  /**
   * Get global settings
   * @returns {Object} Global configuration settings
   */
  getGlobalSettings() {
    const config = this.getConfig();
    return config?.globalSettings || {
      enableOverlapDetection: true,
      showOnlyRelevantTools: true,
      includeVersionInfo: true,
      respectUserConfig: true,
      gracefulFallback: true,
      logLevel: 'info'
    };
  }

  /**
   * Create a user config override template
   * @param {string} filePath - Path to create the template
   * @returns {boolean} Success status
   */
  createUserConfigTemplate(filePath) {
    try {
      const template = this._getUserConfigTemplate();
      writeFileSync(filePath, JSON.stringify(template, null, 2));
      return true;
    } catch (error) {
      console.error(`Failed to create user config template: ${error.message}`);
      return false;
    }
  }

  /**
   * Reload configuration from disk
   * @returns {Promise<Object>} Reloaded configuration
   */
  async reload() {
    this.defaultConfig = null;
    this.userConfig = null;
    this.mergedConfig = null;
    return this.initialize();
  }

  // Private Methods

  /**
   * Get platform-specific configuration paths
   * @private
   */
  _getConfigPaths() {
    const platform = this.platformDetection.getPlatformInfo();
    const claudePaths = this.platformDetection.getClaudePaths();
    
    return {
      default: join(__dirname, 'default-config.json'),
      userGlobal: claudePaths.globalConfig,
      userLocal: join(process.cwd(), '.ctdiscovery.json'),
      userLocalAlt: join(process.cwd(), '.ctdiscovery', 'config.json'),
      fallbackLocal: join(claudePaths.localConfig, 'ctdiscovery-config.json')
    };
  }

  /**
   * Load default configuration
   * @private
   */
  _loadDefaultConfig() {
    try {
      const defaultPath = this.configPaths.default;
      if (!existsSync(defaultPath)) {
        throw new Error('Default configuration file not found');
      }
      
      const content = readFileSync(defaultPath, 'utf8');
      return JSON.parse(content);
    } catch (error) {
      console.warn(`Failed to load default config: ${error.message}`);
      return this._getMinimalConfig();
    }
  }

  /**
   * Load user configuration with fallbacks
   * @private
   */
  _loadUserConfig() {
    const userConfigPaths = [
      this.configPaths.userLocal,
      this.configPaths.userLocalAlt,
      this.configPaths.userGlobal,
      this.configPaths.fallbackLocal
    ];

    for (const configPath of userConfigPaths) {
      if (existsSync(configPath)) {
        try {
          const content = readFileSync(configPath, 'utf8');
          const userConfig = JSON.parse(content);
          
          console.log(`Loaded user config from: ${configPath}`);
          return userConfig;
        } catch (error) {
          console.warn(`Failed to parse user config at ${configPath}: ${error.message}`);
        }
      }
    }
    
    return {};
  }

  /**
   * Merge default and user configurations
   * @private
   */
  _mergeConfigurations() {
    if (!this.defaultConfig) {
      return this.userConfig || {};
    }
    
    if (!this.userConfig || Object.keys(this.userConfig).length === 0) {
      return this.defaultConfig;
    }
    
    return this._deepMerge(this.defaultConfig, this.userConfig);
  }

  /**
   * Deep merge two configuration objects
   * @private
   */
  _deepMerge(target, source) {
    const result = { ...target };
    
    for (const key in source) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        result[key] = this._deepMerge(target[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
    
    return result;
  }

  /**
   * Validate configuration structure and values
   * @private
   */
  _validateConfig(config) {
    const errors = [];
    
    if (!config) {
      errors.push('Configuration is null or undefined');
      return { valid: false, errors };
    }
    
    // Validate version
    if (!config.version) {
      errors.push('Missing version field');
    }
    
    // Validate scanners section
    if (!config.scanners || typeof config.scanners !== 'object') {
      errors.push('Missing or invalid scanners configuration');
    } else {
      // Validate each scanner configuration
      for (const [scannerType, scannerConfig] of Object.entries(config.scanners)) {
        if (!scannerConfig.enabled !== undefined && typeof scannerConfig.enabled !== 'boolean') {
          errors.push(`Invalid enabled field for scanner: ${scannerType}`);
        }
        
        if (scannerConfig.timeout && (typeof scannerConfig.timeout !== 'number' || scannerConfig.timeout <= 0)) {
          errors.push(`Invalid timeout for scanner: ${scannerType}`);
        }
        
        if (scannerConfig.priority && (typeof scannerConfig.priority !== 'number' || scannerConfig.priority <= 0)) {
          errors.push(`Invalid priority for scanner: ${scannerType}`);
        }
      }
    }
    
    // Validate performance settings
    if (config.performance) {
      const perf = config.performance;
      if (perf.maxScanTime && (typeof perf.maxScanTime !== 'number' || perf.maxScanTime <= 0)) {
        errors.push('Invalid maxScanTime in performance settings');
      }
      
      if (perf.timeoutPerScanner && (typeof perf.timeoutPerScanner !== 'number' || perf.timeoutPerScanner <= 0)) {
        errors.push('Invalid timeoutPerScanner in performance settings');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings: this._getConfigWarnings(config)
    };
  }

  /**
   * Get configuration warnings
   * @private
   */
  _getConfigWarnings(config) {
    const warnings = [];
    
    // Check for performance concerns
    if (config.performance?.maxScanTime > 10000) {
      warnings.push('maxScanTime is very high, may impact user experience');
    }
    
    // Check for disabled critical scanners
    const criticalScanners = ['mcp-server', 'system-tool'];
    for (const scanner of criticalScanners) {
      if (config.scanners?.[scanner]?.enabled === false) {
        warnings.push(`Critical scanner '${scanner}' is disabled`);
      }
    }
    
    return warnings;
  }

  /**
   * Apply platform-specific settings to merged configuration
   * @private
   */
  _applyPlatformSettings() {
    if (!this.mergedConfig) return;
    
    const platformInfo = this.platformDetection.getPlatformInfo();
    const platformSettings = this.mergedConfig.platformSpecific?.[platformInfo.platform];
    
    if (platformSettings) {
      // Apply platform-specific search paths
      if (platformSettings.systemPaths) {
        for (const [scannerType, scannerConfig] of Object.entries(this.mergedConfig.scanners || {})) {
          if (scannerConfig.searchPaths) {
            scannerConfig.searchPaths.current = platformSettings.systemPaths;
          }
        }
      }
      
      // Apply platform-specific package manager preference
      if (platformSettings.preferredPackageManager) {
        this.mergedConfig._platformContext = {
          preferredPackageManager: platformSettings.preferredPackageManager,
          platform: platformInfo.platform
        };
      }
    }
  }

  /**
   * Get configuration sources for debugging
   * @private
   */
  _getConfigSources() {
    const sources = [];
    
    if (this.defaultConfig) sources.push('default');
    if (this.userConfig && Object.keys(this.userConfig).length > 0) sources.push('user');
    
    return sources;
  }

  /**
   * Get minimal fallback configuration
   * @private
   */
  _getMinimalConfig() {
    return {
      version: '1.0.0',
      description: 'Minimal fallback configuration',
      performance: {
        maxScanTime: 3000,
        timeoutPerScanner: 2000,
        enableParallelScanning: true,
        maxConcurrentScanners: 4
      },
      scanners: {
        'mcp-server': { enabled: true, priority: 1, timeout: 2000 },
        'system-tool': { enabled: true, priority: 2, timeout: 1000 },
        'vscode-extension': { enabled: true, priority: 3, timeout: 1500 }
      },
      globalSettings: {
        enableOverlapDetection: true,
        gracefulFallback: true,
        logLevel: 'info'
      }
    };
  }

  /**
   * Get user configuration template
   * @private
   */
  _getUserConfigTemplate() {
    return {
      "version": "1.0.0",
      "description": "User configuration override for CTDiscovery",
      "performance": {
        "maxScanTime": 3000,
        "enableParallelScanning": true
      },
      "scanners": {
        "mcp-server": {
          "enabled": true,
          "timeout": 2000,
          "detectionMethods": [
            "claude-config",
            "npm-global",
            "npm-local"
          ]
        },
        "vscode-extension": {
          "enabled": true,
          "timeout": 1500
        },
        "system-tool": {
          "enabled": true,
          "timeout": 1000
        }
      },
      "globalSettings": {
        "enableOverlapDetection": true,
        "showOnlyRelevantTools": true,
        "logLevel": "info"
      },
      "customPaths": {
        "additionalSearchPaths": [],
        "excludePaths": []
      }
    };
  }
}

// Export singleton instance
export const configManager = new ConfigManager();