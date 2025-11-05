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

    // Add tools
    if (analysisResult.tools) {
      output.tools = opts.includeMetadata !== false
        ? analysisResult.tools
        : analysisResult.tools.map(t => this._stripMetadata(t));
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

    // Add summary
    if (analysisResult.summary) {
      output.summary = analysisResult.summary;
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
