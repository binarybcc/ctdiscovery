import { configManager } from './config-manager.js';

/**
 * Scanner Configuration Adapter
 * Provides a bridge between the configuration system and existing scanners
 */
export class ScannerConfigAdapter {
  constructor() {
    this.configManager = configManager;
    this.initialized = false;
  }

  /**
   * Initialize the adapter and configuration system
   * @returns {Promise<void>}
   */
  async initialize() {
    if (!this.initialized) {
      await this.configManager.initialize();
      this.initialized = true;
    }
  }

  /**
   * Get enhanced scanner configuration for a specific scanner
   * @param {string} scannerType - Type of scanner
   * @param {Object} defaultOptions - Default scanner options
   * @returns {Object} Enhanced configuration
   */
  getEnhancedConfig(scannerType, defaultOptions = {}) {
    const baseConfig = this.configManager.getScannerConfig(scannerType) || {};
    const globalSettings = this.configManager.getGlobalSettings();
    const performanceSettings = this.configManager.getPerformanceSettings();
    
    return {
      // Base scanner configuration
      ...baseConfig,
      ...defaultOptions,
      
      // Enhanced metadata
      metadata: {
        ...defaultOptions.metadata,
        configSource: 'config-system',
        timeout: baseConfig.timeout || performanceSettings.timeoutPerScanner,
        priority: baseConfig.priority || 999,
        enabled: baseConfig.enabled !== false
      },
      
      // Enhanced detection methods
      detectionMethods: this._mergeDetectionMethods(
        defaultOptions.detectionMethods || [],
        baseConfig.detectionMethods || []
      ),
      
      // Enhanced search paths
      searchPaths: this._getEnhancedSearchPaths(scannerType, baseConfig),
      
      // Enhanced known tools
      knownTools: this._mergeKnownTools(
        defaultOptions.knownTools || [],
        baseConfig.knownTools || []
      ),
      
      // Overlap detection rules
      overlapRules: baseConfig.overlapRules || {
        deduplicateBy: ['name'],
        priorityOrder: ['active', 'installed', 'available']
      },
      
      // Global settings
      global: {
        enableOverlapDetection: globalSettings.enableOverlapDetection,
        includeVersionInfo: globalSettings.includeVersionInfo,
        logLevel: globalSettings.logLevel
      }
    };
  }

  /**
   * Get scanner execution parameters based on configuration
   * @param {string} scannerType - Type of scanner
   * @returns {Object} Execution parameters
   */
  getExecutionParams(scannerType) {
    const scannerConfig = this.configManager.getScannerConfig(scannerType);
    const performanceSettings = this.configManager.getPerformanceSettings();
    
    return {
      enabled: scannerConfig?.enabled !== false,
      timeout: scannerConfig?.timeout || performanceSettings.timeoutPerScanner,
      priority: scannerConfig?.priority || 999,
      parallel: performanceSettings.enableParallelScanning,
      maxConcurrency: performanceSettings.maxConcurrentScanners
    };
  }

  /**
   * Get platform-specific configuration for a scanner
   * @param {string} scannerType - Type of scanner
   * @returns {Object} Platform-specific settings
   */
  getPlatformConfig(scannerType) {
    const config = this.configManager.getConfig();
    const platformInfo = config._platformContext || {};
    const scannerConfig = this.configManager.getScannerConfig(scannerType);
    
    return {
      platform: platformInfo.platform || process.platform,
      preferredPackageManager: platformInfo.preferredPackageManager,
      searchPaths: this._getEnhancedSearchPaths(scannerType, scannerConfig),
      executableExtensions: this._getExecutableExtensions()
    };
  }

  /**
   * Check if a scanner should be enabled
   * @param {string} scannerType - Type of scanner
   * @returns {boolean} Whether scanner should be enabled
   */
  isScannerEnabled(scannerType) {
    const scannerConfig = this.configManager.getScannerConfig(scannerType);
    return scannerConfig?.enabled !== false;
  }

  /**
   * Get validation requirements for a scanner
   * @param {string} scannerType - Type of scanner
   * @returns {Object} Validation requirements
   */
  getValidationRequirements(scannerType) {
    const scannerConfig = this.configManager.getScannerConfig(scannerType);
    const globalSettings = this.configManager.getGlobalSettings();
    
    return {
      requireFunctional: true,
      requireAccessible: !globalSettings.gracefulFallback,
      requireConfigured: false,
      customChecks: scannerConfig?.validationChecks || []
    };
  }

  /**
   * Apply overlap detection rules to scan results
   * @param {string} scannerType - Type of scanner
   * @param {Array} results - Scan results
   * @param {Array} allResults - All results from all scanners
   * @returns {Array} Results with overlap detection applied
   */
  applyOverlapRules(scannerType, results, allResults = []) {
    const globalSettings = this.configManager.getGlobalSettings();
    if (!globalSettings.enableOverlapDetection) {
      return results;
    }
    
    const scannerConfig = this.configManager.getScannerConfig(scannerType);
    const overlapRules = scannerConfig?.overlapRules;
    
    if (!overlapRules) {
      return results;
    }
    
    return this._deduplicateResults(results, overlapRules);
  }

  /**
   * Get custom tool definitions for a scanner
   * @param {string} scannerType - Type of scanner
   * @returns {Array} Custom tool definitions
   */
  getCustomTools(scannerType) {
    const scannerConfig = this.configManager.getScannerConfig(scannerType);
    return [
      ...(scannerConfig?.knownTools || []),
      ...(scannerConfig?.customTools || [])
    ];
  }

  // Private Methods

  /**
   * Merge detection methods from default and config
   * @private
   */
  _mergeDetectionMethods(defaultMethods, configMethods) {
    const merged = [...defaultMethods];
    
    for (const method of configMethods) {
      if (!merged.includes(method)) {
        merged.push(method);
      }
    }
    
    return merged;
  }

  /**
   * Get enhanced search paths for a scanner
   * @private
   */
  _getEnhancedSearchPaths(scannerType, scannerConfig) {
    const config = this.configManager.getConfig();
    const platform = process.platform;
    
    const paths = {
      default: scannerConfig?.searchPaths?.[platform] || [],
      custom: scannerConfig?.customPaths || [],
      platform: config?.platformSpecific?.[platform]?.additionalPaths || [],
      current: scannerConfig?.searchPaths?.current || []
    };
    
    return paths;
  }

  /**
   * Merge known tools from default and config
   * @private
   */
  _mergeKnownTools(defaultTools, configTools) {
    const merged = [...defaultTools];
    const existingNames = new Set(defaultTools.map(tool => tool.name));
    
    for (const tool of configTools) {
      if (!existingNames.has(tool.name)) {
        merged.push(tool);
        existingNames.add(tool.name);
      }
    }
    
    return merged;
  }

  /**
   * Get executable extensions for current platform
   * @private
   */
  _getExecutableExtensions() {
    return process.platform === 'win32' ? ['.exe', '.cmd', '.bat', '.ps1'] : [''];
  }

  /**
   * Deduplicate results based on overlap rules
   * @private
   */
  _deduplicateResults(results, overlapRules) {
    if (!overlapRules.deduplicateBy || !Array.isArray(overlapRules.deduplicateBy)) {
      return results;
    }
    
    const seen = new Map();
    const deduplicated = [];
    
    for (const result of results) {
      const key = overlapRules.deduplicateBy
        .map(field => result[field] || result.metadata?.[field])
        .filter(Boolean)
        .join('|');
        
      if (!seen.has(key)) {
        seen.set(key, result);
        deduplicated.push(result);
      } else {
        // Apply priority order to determine which result to keep
        const existing = seen.get(key);
        if (this._shouldReplace(existing, result, overlapRules.priorityOrder)) {
          seen.set(key, result);
          const index = deduplicated.findIndex(r => r === existing);
          if (index !== -1) {
            deduplicated[index] = result;
          }
        }
      }
    }
    
    return deduplicated;
  }

  /**
   * Determine if one result should replace another based on priority
   * @private
   */
  _shouldReplace(existing, candidate, priorityOrder) {
    if (!priorityOrder || !Array.isArray(priorityOrder)) {
      return false;
    }
    
    const existingPriority = priorityOrder.indexOf(existing.status);
    const candidatePriority = priorityOrder.indexOf(candidate.status);
    
    // Lower index = higher priority
    return candidatePriority < existingPriority && candidatePriority !== -1;
  }
}

// Export singleton instance
export const scannerConfigAdapter = new ScannerConfigAdapter();