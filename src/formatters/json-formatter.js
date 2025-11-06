/**
 * JSON Formatter
 *
 * Formats analysis results as JSON
 */

export class JSONFormatter {
  constructor(options = {}) {
    this.options = {
      pretty: options.pretty !== false, // Default to pretty
      indent: options.indent || 2,
      ...options
    };
  }

  /**
   * Format analysis result as JSON
   *
   * @param {AnalysisResult} analysisResult - Analysis result
   * @param {Object} options - Format options
   * @param {boolean} [options.pretty=true] - Pretty print with indentation
   * @param {number} [options.indent=2] - Indentation spaces
   * @param {boolean} [options.includeMetadata=true] - Include metadata
   * @returns {Promise<string>} JSON string
   */
  async format(analysisResult, options = {}) {
    const opts = { ...this.options, ...options };

    // Check if this is an intelligent analysis result
    const isIntelligent = analysisResult.projectIntelligence !== undefined;

    // Build output object
    const output = {
      version: analysisResult.version || '2.0.0',
      timestamp: analysisResult.timestamp,
      environment: analysisResult.environment,
      scan: {
        duration: analysisResult.scanDuration,
        status: this._determineScanStatus(analysisResult)
      }
    };

    // Add intelligence-specific fields if present
    if (isIntelligent) {
      output.intelligence = {
        mode: opts.mode || 'smart',
        projectType: analysisResult.projectIntelligence
      };

      // Add tools organized by relevance
      if (analysisResult.toolsByRelevance) {
        output.tools = opts.includeMetadata !== false
          ? analysisResult.tools
          : analysisResult.tools.map(t => this._stripMetadata(t));

        output.intelligence.toolsByRelevance = {
          active: analysisResult.toolsByRelevance.active.length,
          available: analysisResult.toolsByRelevance.available.length,
          filtered: analysisResult.toolsByRelevance.filtered.length
        };

        // Optionally include detailed relevance breakdown
        if (opts.includeRelevanceDetails) {
          output.intelligence.relevanceDetails = {
            active: analysisResult.toolsByRelevance.active.map(t => ({
              name: t.name,
              relevance: t.relevance.level,
              score: t.relevance.score,
              reasons: t.relevance.reasons
            })),
            available: analysisResult.toolsByRelevance.available.map(t => ({
              name: t.name,
              usage: t.usage?.pattern,
              score: t.relevance.score
            }))
          };
        }
      }

      // Add summary with maturity
      if (analysisResult.summary) {
        output.intelligence.summary = analysisResult.summary;
      }

      // Add recommendations
      if (analysisResult.recommendations && analysisResult.recommendations.length > 0) {
        output.intelligence.recommendations = analysisResult.recommendations;
      }

      // Add optimization opportunities
      if (analysisResult.optimizationOpportunities && analysisResult.optimizationOpportunities.length > 0) {
        output.intelligence.optimizations = analysisResult.optimizationOpportunities;
      }

      // Add AI context
      if (analysisResult.aiContext && opts.includeAIContext !== false) {
        output.intelligence.aiContext = {
          conversationStarter: analysisResult.aiContext.conversationStarter,
          keyTools: analysisResult.aiContext.keyTools?.map(t => t.name) || [],
          focusAreas: analysisResult.aiContext.focusAreas || []
        };
      }
    } else {
      // Standard analysis result
      // Add tools
      if (analysisResult.tools) {
        output.tools = opts.includeMetadata !== false
          ? analysisResult.tools
          : analysisResult.tools.map(t => this._stripMetadata(t));
      }

      // Add summary
      if (analysisResult.summary) {
        output.summary = analysisResult.summary;
      }
    }

    // Add overlaps if present
    if (analysisResult.overlaps && analysisResult.overlaps.length > 0) {
      output.overlaps = analysisResult.overlaps;
    }

    // Add validation if present
    if (analysisResult.validation) {
      output.validation = {
        valid: analysisResult.validation.valid,
        issues: analysisResult.validation.issues?.length || 0,
        warnings: analysisResult.validation.warnings?.length || 0
      };

      if (analysisResult.validation.issues?.length > 0) {
        output.validation.issueDetails = analysisResult.validation.issues;
      }
    }

    // Add metrics if present
    if (analysisResult.metrics && opts.includeMetrics !== false) {
      output.metrics = analysisResult.metrics;
    }

    // Format as JSON
    if (opts.pretty) {
      return JSON.stringify(output, null, opts.indent);
    }

    return JSON.stringify(output);
  }

  /**
   * Determine overall scan status
   * @private
   */
  _determineScanStatus(analysisResult) {
    if (analysisResult.validation?.valid === false) {
      return 'failed';
    }

    if (analysisResult.validation?.warnings?.length > 0) {
      return 'partial';
    }

    return 'success';
  }

  /**
   * Strip metadata for compact output
   * @private
   */
  _stripMetadata(tool) {
    return {
      name: tool.name,
      type: tool.type,
      status: tool.status,
      version: tool.metadata?.version
    };
  }
}

export default JSONFormatter;
