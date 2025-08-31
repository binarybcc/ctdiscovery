/**
 * Integration Example: How to use the Configuration System
 * This demonstrates how to integrate the config system with existing CTDiscovery code
 */

import { configManager, scannerConfigAdapter } from './index.js';
import { MCPScanner } from '../scanners/mcp-scanner.js';
import { EnhancedMCPScanner } from './enhanced-mcp-scanner.js';

/**
 * Example: Enhanced Scanner Factory
 * Creates scanners with configuration system integration
 */
export class ConfiguredScannerFactory {
  constructor() {
    this.configManager = configManager;
    this.configAdapter = scannerConfigAdapter;
    this.initialized = false;
  }

  async initialize() {
    if (!this.initialized) {
      await this.configManager.initialize();
      await this.configAdapter.initialize();
      this.initialized = true;
    }
  }

  /**
   * Create a scanner with configuration integration
   * @param {string} scannerType - Type of scanner to create
   * @returns {Object} Configured scanner instance
   */
  async createScanner(scannerType) {
    await this.initialize();

    // Check if scanner is enabled in configuration
    if (!this.configAdapter.isScannerEnabled(scannerType)) {
      console.log(`Scanner '${scannerType}' is disabled in configuration`);
      return null;
    }

    switch (scannerType) {
      case 'mcp-server':
        return new EnhancedMCPScanner();
      
      case 'system-tool':
        // Could create an enhanced system-tool scanner here
        const originalScanner = await import('../scanners/system-tool-scanner.js');
        return new originalScanner.SystemToolScanner();
      
      default:
        throw new Error(`Unknown scanner type: ${scannerType}`);
    }
  }

  /**
   * Get all enabled scanners with their execution parameters
   * @returns {Array} Array of scanner configurations
   */
  async getEnabledScanners() {
    await this.initialize();

    const config = this.configManager.getConfig();
    const enabledScanners = [];

    for (const [scannerType, scannerConfig] of Object.entries(config.scanners || {})) {
      if (scannerConfig.enabled !== false) {
        const executionParams = this.configAdapter.getExecutionParams(scannerType);
        enabledScanners.push({
          type: scannerType,
          priority: scannerConfig.priority || 999,
          ...executionParams
        });
      }
    }

    // Sort by priority
    return enabledScanners.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Run all enabled scanners with configuration-aware execution
   * @returns {Object} Aggregated scan results
   */
  async runConfiguredScan() {
    const startTime = Date.now();
    console.log('🚀 Running CTDiscovery scan with configuration system...\n');

    await this.initialize();

    const enabledScanners = await this.getEnabledScanners();
    const performanceSettings = this.configManager.getPerformanceSettings();
    
    console.log(`📋 Enabled Scanners: ${enabledScanners.length}`);
    console.log(`⚡ Performance: ${performanceSettings.maxScanTime}ms max, parallel=${performanceSettings.enableParallelScanning}\n`);

    const results = {
      summary: {
        totalScanners: enabledScanners.length,
        successful: 0,
        failed: 0,
        totalTools: 0,
        totalTime: 0
      },
      scannerResults: [],
      aggregatedTools: [],
      configuration: {
        version: this.configManager.getConfig().version,
        sources: 'enhanced-config-system'
      }
    };

    // Run scanners based on configuration
    if (performanceSettings.enableParallelScanning) {
      await this._runScannersParallel(enabledScanners, results, performanceSettings);
    } else {
      await this._runScannersSequential(enabledScanners, results);
    }

    // Apply global overlap detection
    if (this.configManager.getGlobalSettings().enableOverlapDetection) {
      results.aggregatedTools = this._deduplicateAllResults(results.scannerResults);
    }

    results.summary.totalTime = Date.now() - startTime;
    
    this._displayResults(results);
    return results;
  }

  // Private methods

  async _runScannersParallel(scanners, results, performanceSettings) {
    const chunks = this._chunkArray(scanners, performanceSettings.maxConcurrentScanners);
    
    for (const chunk of chunks) {
      const promises = chunk.map(async (scannerConfig) => {
        try {
          const scanner = await this.createScanner(scannerConfig.type);
          if (!scanner) return null;

          console.log(`🔍 Scanning: ${scannerConfig.type}...`);
          const result = await scanner.scan();
          
          results.scannerResults.push({
            type: scannerConfig.type,
            ...result
          });
          results.summary.successful++;
          results.summary.totalTools += result.data?.length || 0;
          
          return result;
        } catch (error) {
          console.error(`❌ Scanner ${scannerConfig.type} failed:`, error.message);
          results.summary.failed++;
          return null;
        }
      });

      await Promise.all(promises);
    }
  }

  async _runScannersSequential(scanners, results) {
    for (const scannerConfig of scanners) {
      try {
        const scanner = await this.createScanner(scannerConfig.type);
        if (!scanner) continue;

        console.log(`🔍 Scanning: ${scannerConfig.type}...`);
        const result = await scanner.scan();
        
        results.scannerResults.push({
          type: scannerConfig.type,
          ...result
        });
        results.summary.successful++;
        results.summary.totalTools += result.data?.length || 0;
      } catch (error) {
        console.error(`❌ Scanner ${scannerConfig.type} failed:`, error.message);
        results.summary.failed++;
      }
    }
  }

  _chunkArray(array, chunkSize) {
    const chunks = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  _deduplicateAllResults(scannerResults) {
    const allTools = [];
    scannerResults.forEach(result => {
      if (result.data) {
        allTools.push(...result.data);
      }
    });

    // Simple deduplication by name
    const seen = new Map();
    const deduplicated = [];
    
    for (const tool of allTools) {
      const key = tool.name + '|' + tool.type;
      if (!seen.has(key)) {
        seen.set(key, tool);
        deduplicated.push(tool);
      }
    }

    return deduplicated;
  }

  _displayResults(results) {
    console.log('\n' + '='.repeat(60));
    console.log('🎯 CTDiscovery Scan Results (Configuration-Enhanced)');
    console.log('='.repeat(60));
    
    console.log(`\n📊 Summary:`);
    console.log(`   • Total Scanners: ${results.summary.totalScanners}`);
    console.log(`   • Successful: ${results.summary.successful}`);
    console.log(`   • Failed: ${results.summary.failed}`);
    console.log(`   • Total Tools Found: ${results.summary.totalTools}`);
    console.log(`   • Total Scan Time: ${results.summary.totalTime}ms`);
    
    if (results.aggregatedTools.length > 0) {
      console.log(`\n🛠️  Detected Tools:`);
      const toolsByType = {};
      results.aggregatedTools.forEach(tool => {
        if (!toolsByType[tool.type]) toolsByType[tool.type] = [];
        toolsByType[tool.type].push(tool);
      });

      Object.entries(toolsByType).forEach(([type, tools]) => {
        console.log(`\n   ${type.toUpperCase()}:`);
        tools.forEach(tool => {
          const status = tool.status === 'active' ? '🟢' : 
                        tool.status === 'available' ? '🟡' : '⚪';
          console.log(`      ${status} ${tool.name} (${tool.source})`);
        });
      });
    }
  }
}

/**
 * Example usage function
 */
export async function runConfigurationExample() {
  console.log('CTDiscovery Configuration System Example');
  console.log('========================================\n');

  try {
    const factory = new ConfiguredScannerFactory();
    const results = await factory.runConfiguredScan();
    
    console.log('\n✅ Example completed successfully!');
    return results;
  } catch (error) {
    console.error('❌ Example failed:', error.message);
    throw error;
  }
}

// Run example if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runConfigurationExample();
}