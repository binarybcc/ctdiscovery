#!/usr/bin/env node

/**
 * CTDiscovery - Multi-layer Environment Discovery System
 *
 * Main API Entry Point
 *
 * This module provides the core programmatic API for CTDiscovery,
 * enabling other tools to import and use environment discovery
 * capabilities without CLI overhead.
 *
 * @example
 * ```javascript
 * import { CTDiscovery } from 'ctdiscovery';
 *
 * const ctd = new CTDiscovery();
 * const results = await ctd.scan();
 * const analysis = await ctd.analyze(results);
 * const markdown = await ctd.format(analysis, 'markdown');
 * ```
 */

// Core API
import CTDiscoveryClass from './api/ctdiscovery-api.js';
export { CTDiscoveryClass as CTDiscovery };

// Individual scanners for advanced usage
export { MCPScanner } from './scanners/mcp-scanner.js';
export { VSCodeScanner } from './scanners/vscode-scanner.js';
export { SystemToolScanner } from './scanners/system-tool-scanner.js';
export { EnvironmentScanner } from './scanners/environment-scanner.js';

// Processing layer components
export { Deduplicator } from './processors/deduplicator.js';
export { OverlapDetector } from './processors/overlap-detector.js';
export { Enricher } from './processors/enricher.js';
export { Validator } from './processors/validator.js';

// Formatters
export { JSONFormatter } from './formatters/json-formatter.js';
export { MarkdownFormatter } from './formatters/markdown-formatter.js';
export { TextFormatter } from './formatters/text-formatter.js';
export { ContextGenerator } from './formatters/context-generator.js';

// Intelligence layer
export { IntelligenceAnalyzer } from './intelligence/intelligence-analyzer.js';
export { ProjectTypeDetector } from './intelligence/project-type-detector.js';
export { RelevanceScorer } from './intelligence/relevance-scorer.js';
export { UsageAnalyzer } from './intelligence/usage-analyzer.js';

// Utilities
export { ConfigManager } from './config/config-manager.js';
export { ErrorHandler } from './utils/error-handler.js';
export { PlatformDetection } from './utils/platform-detection.js';

// Constants
export { TOOL_STATUSES, TOOL_CATEGORIES } from './constants.js';

// Version info
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

export const VERSION = packageJson.version;
export const NAME = packageJson.name;

/**
 * Quick scan helper for simple use cases
 * @param {Object} options - Scan options
 * @returns {Promise<Object>} Scan results
 */
export async function quickScan(options = {}) {
  const ctd = new CTDiscoveryClass(options);
  const results = await ctd.scan();
  const analysis = await ctd.analyze(results);
  return analysis;
}

/**
 * Generate AI context helper
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Context markdown
 */
export async function generateContext(options = {}) {
  const ctd = new CTDiscoveryClass(options);
  const results = await ctd.scan();
  const analysis = await ctd.analyze(results);
  return await ctd.generateContext(analysis, options);
}

// Default export
export default CTDiscoveryClass;
