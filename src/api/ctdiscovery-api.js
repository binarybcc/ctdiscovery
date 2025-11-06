/**
 * CTDiscovery API
 *
 * Main programmatic interface for CTDiscovery.
 * Provides clean API for scanning, analyzing, and formatting environment data.
 */

import { EnvironmentScanner } from '../scanners/environment-scanner.js';
import { Deduplicator } from '../processors/deduplicator.js';
import { OverlapDetector } from '../processors/overlap-detector.js';
import { Enricher } from '../processors/enricher.js';
import { Validator } from '../processors/validator.js';
import { JSONFormatter } from '../formatters/json-formatter.js';
import { MarkdownFormatter } from '../formatters/markdown-formatter.js';
import { TextFormatter } from '../formatters/text-formatter.js';
import { ContextGenerator } from '../formatters/context-generator.js';
import { ConfigManager } from '../config/config-manager.js';
import { IntelligenceAnalyzer } from '../intelligence/intelligence-analyzer.js';
import { DEFAULTS, OUTPUT_FORMATS } from '../constants.js';

/**
 * CTDiscovery - Main API Class
 *
 * @example
 * ```javascript
 * const ctd = new CTDiscovery({ timeout: 5000 });
 * const results = await ctd.scan();
 * const analysis = await ctd.analyze(results);
 * const markdown = await ctd.format(analysis, 'markdown');
 * ```
 */
export default class CTDiscovery {
  /**
   * Create a new CTDiscovery instance
   *
   * @param {Object} options - Configuration options
   * @param {number} [options.timeout=3000] - Total scan timeout in ms
   * @param {boolean} [options.includeMCP=true] - Include MCP scanner
   * @param {boolean} [options.includeVSCode=true] - Include VSCode scanner
   * @param {boolean} [options.includeSystemTools=true] - Include system tools
   * @param {boolean} [options.verbose=false] - Enable verbose output
   * @param {boolean} [options.enableCache=true] - Enable result caching
   * @param {number} [options.cacheTTL=60000] - Cache TTL in ms
   * @param {string} [options.intelligenceMode='smart'] - Intelligence mode: 'all', 'smart', 'project-optimized', 'ai-context'
   * @param {Object} [options.config] - Custom configuration object
   */
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout ?? DEFAULTS.TIMEOUT_TOTAL,
      includeMCP: options.includeMCP ?? DEFAULTS.INCLUDE_MCP,
      includeVSCode: options.includeVSCode ?? DEFAULTS.INCLUDE_VSCODE,
      includeSystemTools: options.includeSystemTools ?? DEFAULTS.INCLUDE_SYSTEM_TOOLS,
      verbose: options.verbose ?? DEFAULTS.VERBOSE,
      enableCache: options.enableCache ?? DEFAULTS.ENABLE_CACHE,
      cacheTTL: options.cacheTTL ?? DEFAULTS.CACHE_TTL,
      intelligenceMode: options.intelligenceMode ?? 'smart',
      ...options
    };

    // Initialize components
    this.configManager = new ConfigManager(options.config);
    this.scanner = new EnvironmentScanner();
    this.deduplicator = new Deduplicator();
    this.overlapDetector = new OverlapDetector();
    this.enricher = new Enricher({
      projectRoot: process.cwd()
    });
    this.validator = new Validator();
    this.intelligenceAnalyzer = new IntelligenceAnalyzer({
      projectRoot: process.cwd(),
      intelligenceMode: this.options.intelligenceMode
    });

    // Initialize formatters
    this.formatters = {
      [OUTPUT_FORMATS.JSON]: new JSONFormatter(),
      [OUTPUT_FORMATS.MARKDOWN]: new MarkdownFormatter(),
      [OUTPUT_FORMATS.TEXT]: new TextFormatter()
    };

    // Cache
    this._cache = null;
    this._cacheTimestamp = null;
  }

  /**
   * Scan the development environment
   *
   * @param {Object} [options] - Scan-specific options (merged with constructor options)
   * @returns {Promise<ScanResults>} Raw scan results
   *
   * @example
   * ```javascript
   * const results = await ctd.scan({ includeMCP: false });
   * ```
   */
  async scan(options = {}) {
    const scanOptions = { ...this.options, ...options };

    // Check cache
    if (this._shouldUseCache()) {
      return this._cache;
    }

    const startTime = Date.now();

    try {
      // Perform scan using environment scanner
      const results = await this.scanner.scan(scanOptions);

      // Add scan metadata
      results.apiVersion = '2.0.0';
      results.scanDuration = results.scanDuration || (Date.now() - startTime);

      // Normalize structure: rename 'status' to 'tools' if needed
      if (results.status && !results.tools) {
        results.tools = results.status;
        delete results.status;
      }

      // Cache results
      if (scanOptions.enableCache) {
        this._cache = results;
        this._cacheTimestamp = Date.now();
      }

      return results;
    } catch (error) {
      throw new Error(`Scan failed: ${error.message}`);
    }
  }

  /**
   * Analyze scan results
   *
   * Processes raw scan results through:
   * 1. Deduplication - Remove duplicate tool entries
   * 2. Overlap Detection - Find tool conflicts/overlaps
   * 3. Enrichment - Add metadata and capabilities
   * 4. Validation - Validate tool entries
   *
   * @param {ScanResults} scanResults - Raw scan results from scan()
   * @param {Object} [options] - Analysis options
   * @returns {Promise<AnalysisResult>} Processed analysis
   *
   * @example
   * ```javascript
   * const analysis = await ctd.analyze(scanResults);
   * ```
   */
  async analyze(scanResults, options = {}) {
    if (!scanResults || !scanResults.tools) {
      throw new Error('Invalid scan results provided to analyze()');
    }

    const analysisOptions = { ...this.options, ...options };

    try {
      // Step 1: Deduplicate
      let tools = this._flattenTools(scanResults.tools);
      tools = await this.deduplicator.deduplicate(tools);

      // Step 2: Detect overlaps
      const overlaps = await this.overlapDetector.detect(tools);

      // Step 3: Enrich with metadata
      tools = await this.enricher.enrich(tools, scanResults.environment);

      // Step 4: Validate
      const validation = await this.validator.validate(tools);

      // Build analysis result
      const analysis = {
        version: '2.0.0',
        timestamp: scanResults.timestamp,
        environment: scanResults.environment,
        scanDuration: scanResults.scanDuration,
        tools: tools,
        overlaps: overlaps,
        validation: validation,
        metrics: scanResults.metrics || {},
        summary: this._buildSummary(tools, overlaps, validation)
      };

      return analysis;
    } catch (error) {
      throw new Error(`Analysis failed: ${error.message}`);
    }
  }

  /**
   * Perform intelligent analysis with context-aware filtering
   *
   * Adds project intelligence, relevance scoring, and smart filtering
   * to provide curated, actionable insights rather than overwhelming data.
   *
   * @param {AnalysisResult} analysisResult - Analysis result from analyze()
   * @param {Object} [options] - Intelligence options
   * @param {string} [options.mode] - Intelligence mode: 'smart', 'all', 'project-optimized', 'ai-context'
   * @returns {Promise<IntelligenceResult>} Intelligent analysis with smart filtering
   *
   * @example
   * ```javascript
   * const scanResults = await ctd.scan();
   * const analysis = await ctd.analyze(scanResults);
   * const intelligence = await ctd.intelligentAnalyze(analysis);
   * console.log(intelligence.aiContext.conversationStarter);
   * ```
   */
  async intelligentAnalyze(analysisResult, options = {}) {
    if (!analysisResult || !analysisResult.tools) {
      throw new Error('Invalid analysis result provided to intelligentAnalyze()');
    }

    const intelligenceOptions = {
      mode: options.mode || this.options.intelligenceMode,
      ...options
    };

    try {
      // Perform intelligent analysis
      const intelligence = await this.intelligenceAnalyzer.analyze(
        analysisResult.tools,
        analysisResult
      );

      // Build enhanced result
      const result = {
        version: '2.0.0',
        timestamp: analysisResult.timestamp,
        environment: analysisResult.environment,
        scanDuration: analysisResult.scanDuration,

        // Project intelligence
        projectIntelligence: intelligence.projectIntelligence,

        // Smart-filtered tools
        tools: this.intelligenceAnalyzer.filterByMode(intelligence, intelligenceOptions.mode),

        // All tools categorized by relevance
        toolsByRelevance: {
          active: intelligence.tools.active,
          available: intelligence.tools.available,
          filtered: intelligence.tools.noise
        },

        // Smart summary
        summary: intelligence.summary,

        // Recommendations
        recommendations: intelligence.recommendations,

        // Optimization opportunities
        optimizationOpportunities: intelligence.optimizationOpportunities,

        // AI-optimized context
        aiContext: intelligence.aiContext,

        // Original data (for compatibility)
        overlaps: analysisResult.overlaps,
        validation: analysisResult.validation,
        metrics: analysisResult.metrics
      };

      return result;
    } catch (error) {
      throw new Error(`Intelligent analysis failed: ${error.message}`);
    }
  }

  /**
   * Format analysis result for output
   *
   * @param {AnalysisResult} analysisResult - Analysis result from analyze()
   * @param {string} format - Output format (json|markdown|text)
   * @param {Object} [options] - Format-specific options
   * @returns {Promise<string>} Formatted output
   *
   * @example
   * ```javascript
   * const markdown = await ctd.format(analysis, 'markdown');
   * const json = await ctd.format(analysis, 'json', { pretty: true });
   * ```
   */
  async format(analysisResult, format = OUTPUT_FORMATS.JSON, options = {}) {
    if (!analysisResult) {
      throw new Error('Invalid analysis result provided to format()');
    }

    const formatter = this.formatters[format];
    if (!formatter) {
      throw new Error(`Unknown format: ${format}. Use one of: ${Object.values(OUTPUT_FORMATS).join(', ')}`);
    }

    try {
      return await formatter.format(analysisResult, options);
    } catch (error) {
      throw new Error(`Formatting failed: ${error.message}`);
    }
  }

  /**
   * Generate AI assistant context
   *
   * Convenience method to generate markdown context optimized for AI assistants
   *
   * @param {AnalysisResult} analysisResult - Analysis result
   * @param {Object} [options] - Generation options
   * @param {boolean} [options.includeConversationStarter=true] - Include conversation starter
   * @param {boolean} [options.includeRecommendations=true] - Include recommendations
   * @returns {Promise<Object>} Context object with markdown and metadata
   *
   * @example
   * ```javascript
   * const context = await ctd.generateContext(analysis);
   * console.log(context.markdown);
   * console.log(context.conversationStarter);
   * ```
   */
  async generateContext(analysisResult, options = {}) {
    const generator = new ContextGenerator();
    return await generator.generate(analysisResult, options);
  }

  /**
   * Scan and analyze in one call
   *
   * Convenience method that combines scan() and analyze()
   *
   * @param {Object} [options] - Combined options for scan and analyze
   * @returns {Promise<AnalysisResult>} Analysis result
   *
   * @example
   * ```javascript
   * const analysis = await ctd.scanAndAnalyze({ timeout: 5000 });
   * ```
   */
  async scanAndAnalyze(options = {}) {
    const results = await this.scan(options);
    return await this.analyze(results, options);
  }

  /**
   * Complete workflow: scan, analyze, and format
   *
   * @param {string} [format='json'] - Output format
   * @param {Object} [options] - Options for all stages
   * @returns {Promise<string>} Formatted output
   *
   * @example
   * ```javascript
   * const markdown = await ctd.run('markdown');
   * ```
   */
  async run(format = OUTPUT_FORMATS.JSON, options = {}) {
    const analysis = await this.scanAndAnalyze(options);
    return await this.format(analysis, format, options);
  }

  /**
   * Clear cached results
   */
  clearCache() {
    this._cache = null;
    this._cacheTimestamp = null;
  }

  /**
   * Get configuration
   * @returns {Object} Current configuration
   */
  getConfig() {
    return { ...this.options };
  }

  /**
   * Update configuration
   * @param {Object} updates - Configuration updates
   */
  updateConfig(updates) {
    this.options = { ...this.options, ...updates };
    this.clearCache(); // Clear cache when config changes
  }

  // Private methods

  /**
   * Check if cached results should be used
   * @private
   */
  _shouldUseCache() {
    if (!this.options.enableCache || !this._cache) {
      return false;
    }

    const age = Date.now() - this._cacheTimestamp;
    return age < this.options.cacheTTL;
  }

  /**
   * Flatten tools from scan results structure
   * @private
   */
  _flattenTools(toolsObject) {
    const tools = [];

    for (const [category, scanResult] of Object.entries(toolsObject)) {
      if (scanResult && scanResult.data) {
        for (const tool of scanResult.data) {
          tools.push({
            ...tool,
            category: category
          });
        }
      }
    }

    return tools;
  }

  /**
   * Build summary statistics
   * @private
   */
  _buildSummary(tools, overlaps, validation) {
    const summary = {
      totalTools: tools.length,
      byStatus: {},
      byCategory: {},
      overlapCount: overlaps.length,
      validationIssues: validation.issues?.length || 0
    };

    // Count by status
    for (const tool of tools) {
      summary.byStatus[tool.status] = (summary.byStatus[tool.status] || 0) + 1;
      summary.byCategory[tool.category] = (summary.byCategory[tool.category] || 0) + 1;
    }

    return summary;
  }
}
