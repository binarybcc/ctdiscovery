/**
 * Configuration Validator
 * Validates CTDiscovery configuration files for correctness and best practices
 */
export class ConfigValidator {
  constructor() {
    this.errors = [];
    this.warnings = [];
    this.schema = this._getConfigSchema();
  }

  /**
   * Validate a configuration object
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validate(config) {
    this.errors = [];
    this.warnings = [];

    if (!config) {
      this.errors.push('Configuration is null or undefined');
      return this._getValidationResult();
    }

    // Validate structure
    this._validateStructure(config);
    
    // Validate version
    this._validateVersion(config);
    
    // Validate performance settings
    this._validatePerformance(config);
    
    // Validate scanners
    this._validateScanners(config);
    
    // Validate global settings
    this._validateGlobalSettings(config);
    
    // Validate platform settings
    this._validatePlatformSettings(config);

    return this._getValidationResult();
  }

  /**
   * Validate configuration file from path
   * @param {string} filePath - Path to configuration file
   * @returns {Object} Validation result
   */
  async validateFile(filePath) {
    try {
      const { readFileSync } = await import('fs');
      const content = readFileSync(filePath, 'utf8');
      const config = JSON.parse(content);
      return this.validate(config);
    } catch (error) {
      return {
        valid: false,
        errors: [`Failed to read/parse configuration file: ${error.message}`],
        warnings: []
      };
    }
  }

  // Private validation methods

  /**
   * Validate basic configuration structure
   * @private
   */
  _validateStructure(config) {
    const requiredFields = ['version', 'scanners'];
    const optionalFields = ['description', 'performance', 'globalSettings', 'platformSpecific'];
    
    for (const field of requiredFields) {
      if (!(field in config)) {
        this.errors.push(`Missing required field: ${field}`);
      }
    }

    // Check for unexpected top-level fields
    const allValidFields = [...requiredFields, ...optionalFields];
    for (const field of Object.keys(config)) {
      if (!allValidFields.includes(field) && !field.startsWith('_')) {
        this.warnings.push(`Unexpected field: ${field}`);
      }
    }
  }

  /**
   * Validate version field
   * @private
   */
  _validateVersion(config) {
    if (!config.version) {
      this.errors.push('Version field is required');
      return;
    }

    if (typeof config.version !== 'string') {
      this.errors.push('Version must be a string');
      return;
    }

    // Validate semantic version format
    const semverPattern = /^\d+\.\d+\.\d+(-[\w\.-]+)?(\+[\w\.-]+)?$/;
    if (!semverPattern.test(config.version)) {
      this.warnings.push('Version should follow semantic versioning (x.y.z)');
    }
  }

  /**
   * Validate performance settings
   * @private
   */
  _validatePerformance(config) {
    if (!config.performance) return;

    const perf = config.performance;
    
    // Validate maxScanTime
    if ('maxScanTime' in perf) {
      if (typeof perf.maxScanTime !== 'number' || perf.maxScanTime <= 0) {
        this.errors.push('maxScanTime must be a positive number');
      } else if (perf.maxScanTime > 10000) {
        this.warnings.push('maxScanTime is very high (>10s), may impact user experience');
      }
    }

    // Validate timeoutPerScanner
    if ('timeoutPerScanner' in perf) {
      if (typeof perf.timeoutPerScanner !== 'number' || perf.timeoutPerScanner <= 0) {
        this.errors.push('timeoutPerScanner must be a positive number');
      }
    }

    // Validate enableParallelScanning
    if ('enableParallelScanning' in perf && typeof perf.enableParallelScanning !== 'boolean') {
      this.errors.push('enableParallelScanning must be a boolean');
    }

    // Validate maxConcurrentScanners
    if ('maxConcurrentScanners' in perf) {
      if (typeof perf.maxConcurrentScanners !== 'number' || perf.maxConcurrentScanners <= 0) {
        this.errors.push('maxConcurrentScanners must be a positive number');
      } else if (perf.maxConcurrentScanners > 10) {
        this.warnings.push('maxConcurrentScanners is very high, may cause resource issues');
      }
    }
  }

  /**
   * Validate scanners configuration
   * @private
   */
  _validateScanners(config) {
    if (!config.scanners) {
      this.errors.push('scanners field is required');
      return;
    }

    if (typeof config.scanners !== 'object') {
      this.errors.push('scanners must be an object');
      return;
    }

    const validScannerTypes = [
      'mcp-server', 'vscode-extension', 'system-tool', 
      'language', 'ai-assistant', 'package-manager',
      'version-control', 'build-tool'
    ];

    for (const [scannerType, scannerConfig] of Object.entries(config.scanners)) {
      // Validate scanner type
      if (!validScannerTypes.includes(scannerType)) {
        this.warnings.push(`Unknown scanner type: ${scannerType}`);
      }

      // Validate scanner configuration
      this._validateScannerConfig(scannerType, scannerConfig);
    }

    // Check for recommended scanners
    const recommendedScanners = ['mcp-server', 'system-tool'];
    for (const scanner of recommendedScanners) {
      if (!(scanner in config.scanners)) {
        this.warnings.push(`Recommended scanner '${scanner}' is not configured`);
      }
    }
  }

  /**
   * Validate individual scanner configuration
   * @private
   */
  _validateScannerConfig(scannerType, config) {
    // Validate enabled field
    if ('enabled' in config && typeof config.enabled !== 'boolean') {
      this.errors.push(`Scanner '${scannerType}': enabled must be a boolean`);
    }

    // Validate priority
    if ('priority' in config) {
      if (typeof config.priority !== 'number' || config.priority <= 0) {
        this.errors.push(`Scanner '${scannerType}': priority must be a positive number`);
      }
    }

    // Validate timeout
    if ('timeout' in config) {
      if (typeof config.timeout !== 'number' || config.timeout <= 0) {
        this.errors.push(`Scanner '${scannerType}': timeout must be a positive number`);
      } else if (config.timeout > 5000) {
        this.warnings.push(`Scanner '${scannerType}': timeout is very high (>5s)`);
      }
    }

    // Validate detection methods
    if ('detectionMethods' in config) {
      if (!Array.isArray(config.detectionMethods)) {
        this.errors.push(`Scanner '${scannerType}': detectionMethods must be an array`);
      }
    }

    // Validate search paths
    if ('searchPaths' in config) {
      this._validateSearchPaths(scannerType, config.searchPaths);
    }

    // Validate known tools
    if ('knownTools' in config) {
      this._validateKnownTools(scannerType, config.knownTools);
    }

    // Validate overlap rules
    if ('overlapRules' in config) {
      this._validateOverlapRules(scannerType, config.overlapRules);
    }
  }

  /**
   * Validate search paths configuration
   * @private
   */
  _validateSearchPaths(scannerType, searchPaths) {
    if (typeof searchPaths !== 'object') {
      this.errors.push(`Scanner '${scannerType}': searchPaths must be an object`);
      return;
    }

    const validPlatforms = ['macos', 'win32', 'linux'];
    for (const [platform, paths] of Object.entries(searchPaths)) {
      if (!validPlatforms.includes(platform)) {
        this.warnings.push(`Scanner '${scannerType}': unknown platform '${platform}' in searchPaths`);
      }

      if (!Array.isArray(paths)) {
        this.errors.push(`Scanner '${scannerType}': searchPaths['${platform}'] must be an array`);
      }
    }
  }

  /**
   * Validate known tools configuration
   * @private
   */
  _validateKnownTools(scannerType, knownTools) {
    if (!Array.isArray(knownTools)) {
      this.errors.push(`Scanner '${scannerType}': knownTools must be an array`);
      return;
    }

    for (const [index, tool] of knownTools.entries()) {
      if (typeof tool !== 'object') {
        this.errors.push(`Scanner '${scannerType}': knownTools[${index}] must be an object`);
        continue;
      }

      // Validate required fields
      if (!tool.name || typeof tool.name !== 'string') {
        this.errors.push(`Scanner '${scannerType}': knownTools[${index}] missing required 'name' field`);
      }

      if (!tool.patterns || !Array.isArray(tool.patterns)) {
        this.errors.push(`Scanner '${scannerType}': knownTools[${index}] missing required 'patterns' array`);
      }

      // Validate optional fields
      if ('capabilities' in tool && !Array.isArray(tool.capabilities)) {
        this.errors.push(`Scanner '${scannerType}': knownTools[${index}].capabilities must be an array`);
      }
    }
  }

  /**
   * Validate overlap rules configuration
   * @private
   */
  _validateOverlapRules(scannerType, overlapRules) {
    if (typeof overlapRules !== 'object') {
      this.errors.push(`Scanner '${scannerType}': overlapRules must be an object`);
      return;
    }

    if ('deduplicateBy' in overlapRules && !Array.isArray(overlapRules.deduplicateBy)) {
      this.errors.push(`Scanner '${scannerType}': overlapRules.deduplicateBy must be an array`);
    }

    if ('priorityOrder' in overlapRules && !Array.isArray(overlapRules.priorityOrder)) {
      this.errors.push(`Scanner '${scannerType}': overlapRules.priorityOrder must be an array`);
    }
  }

  /**
   * Validate global settings
   * @private
   */
  _validateGlobalSettings(config) {
    if (!config.globalSettings) return;

    const settings = config.globalSettings;
    const booleanSettings = [
      'enableOverlapDetection', 'showOnlyRelevantTools', 
      'includeVersionInfo', 'respectUserConfig', 'gracefulFallback'
    ];

    for (const setting of booleanSettings) {
      if (setting in settings && typeof settings[setting] !== 'boolean') {
        this.errors.push(`globalSettings.${setting} must be a boolean`);
      }
    }

    // Validate log level
    if ('logLevel' in settings) {
      const validLevels = ['error', 'warn', 'info', 'debug', 'trace'];
      if (!validLevels.includes(settings.logLevel)) {
        this.errors.push(`globalSettings.logLevel must be one of: ${validLevels.join(', ')}`);
      }
    }
  }

  /**
   * Validate platform-specific settings
   * @private
   */
  _validatePlatformSettings(config) {
    if (!config.platformSpecific) return;

    const validPlatforms = ['macos', 'win32', 'linux'];
    for (const [platform, settings] of Object.entries(config.platformSpecific)) {
      if (!validPlatforms.includes(platform)) {
        this.warnings.push(`Unknown platform in platformSpecific: ${platform}`);
      }

      if (typeof settings !== 'object') {
        this.errors.push(`platformSpecific.${platform} must be an object`);
        continue;
      }

      // Validate system paths
      if ('systemPaths' in settings && !Array.isArray(settings.systemPaths)) {
        this.errors.push(`platformSpecific.${platform}.systemPaths must be an array`);
      }

      // Validate config paths
      if ('configPaths' in settings && !Array.isArray(settings.configPaths)) {
        this.errors.push(`platformSpecific.${platform}.configPaths must be an array`);
      }
    }
  }

  /**
   * Get configuration schema for reference
   * @private
   */
  _getConfigSchema() {
    return {
      type: 'object',
      required: ['version', 'scanners'],
      properties: {
        version: { type: 'string' },
        description: { type: 'string' },
        performance: {
          type: 'object',
          properties: {
            maxScanTime: { type: 'number', minimum: 1 },
            timeoutPerScanner: { type: 'number', minimum: 1 },
            enableParallelScanning: { type: 'boolean' },
            maxConcurrentScanners: { type: 'number', minimum: 1 }
          }
        },
        scanners: {
          type: 'object',
          additionalProperties: {
            type: 'object',
            properties: {
              enabled: { type: 'boolean' },
              priority: { type: 'number', minimum: 1 },
              timeout: { type: 'number', minimum: 1 },
              description: { type: 'string' }
            }
          }
        }
      }
    };
  }

  /**
   * Get validation result object
   * @private
   */
  _getValidationResult() {
    return {
      valid: this.errors.length === 0,
      errors: [...this.errors],
      warnings: [...this.warnings]
    };
  }
}

export const configValidator = new ConfigValidator();