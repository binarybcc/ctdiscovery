/**
 * CTDiscovery Configuration System
 * Main entry point for configuration management
 */

// Core configuration management
export { ConfigManager, configManager } from './config-manager.js';

// Scanner integration
export { ScannerConfigAdapter, scannerConfigAdapter } from './scanner-config-adapter.js';

// Configuration validation
export { ConfigValidator, configValidator } from './config-validator.js';

// Enhanced scanner example
export { EnhancedMCPScanner } from './enhanced-mcp-scanner.js';

// Utility functions
export function createDefaultUserConfig(filePath) {
  return configManager.createUserConfigTemplate(filePath);
}

export async function validateConfigurationFile(filePath) {
  return configValidator.validateFile(filePath);
}

export async function initializeConfigSystem() {
  return configManager.initialize();
}

// Configuration constants
export const CONFIG_PATHS = {
  DEFAULT: 'src/config/default-config.json',
  USER_LOCAL: '.ctdiscovery.json',
  USER_LOCAL_ALT: '.ctdiscovery/config.json',
  EXAMPLE: 'example-user-config.json'
};

export const SUPPORTED_SCANNERS = [
  'mcp-server',
  'vscode-extension', 
  'system-tool',
  'language',
  'ai-assistant',
  'package-manager',
  'version-control',
  'build-tool'
];

export const DEFAULT_PERFORMANCE_SETTINGS = {
  maxScanTime: 3000,
  timeoutPerScanner: 2000,
  enableParallelScanning: true,
  maxConcurrentScanners: 4
};

export const DEFAULT_GLOBAL_SETTINGS = {
  enableOverlapDetection: true,
  showOnlyRelevantTools: true,
  includeVersionInfo: true,
  respectUserConfig: true,
  gracefulFallback: true,
  logLevel: 'info'
};