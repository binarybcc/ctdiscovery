/**
 * Text Formatter
 *
 * Formats analysis results as plain text
 */

export class TextFormatter {
  constructor(options = {}) {
    this.options = {
      width: options.width || 80,
      ...options
    };
  }

  /**
   * Format analysis result as plain text
   *
   * @param {AnalysisResult} analysisResult - Analysis result
   * @param {Object} options - Format options
   * @returns {Promise<string>} Plain text string
   */
  async format(analysisResult, options = {}) {
    const opts = { ...this.options, ...options };
    const lines = [];

    // Header
    lines.push(this._formatHeader(analysisResult));
    lines.push('');

    // Environment
    lines.push(this._formatEnvironment(analysisResult.environment));
    lines.push('');

    // Summary
    if (analysisResult.summary) {
      lines.push(this._formatSummary(analysisResult.summary));
      lines.push('');
    }

    // Tools
    lines.push(this._formatTools(analysisResult.tools));

    // Overlaps
    if (analysisResult.overlaps && analysisResult.overlaps.length > 0) {
      lines.push('');
      lines.push(this._formatOverlaps(analysisResult.overlaps));
    }

    return lines.join('\n');
  }

  /**
   * Format header
   * @private
   */
  _formatHeader(analysisResult) {
    const title = 'DEVELOPMENT ENVIRONMENT REPORT';
    const border = '='.repeat(title.length);

    const date = new Date(analysisResult.timestamp).toLocaleString();
    const duration = analysisResult.scanDuration
      ? `${analysisResult.scanDuration}ms`
      : 'unknown';

    return `${border}
${title}
${border}

Generated: ${date}
Scan Duration: ${duration}
Version: ${analysisResult.version || '2.0.0'}`;
  }

  /**
   * Format environment section
   * @private
   */
  _formatEnvironment(environment) {
    if (!environment) return 'Environment: Unknown';

    return `ENVIRONMENT
-----------
Platform: ${environment.platform || 'unknown'}
Node Version: ${environment.nodeVersion || 'unknown'}
Working Directory: ${environment.workingDirectory || 'unknown'}`;
  }

  /**
   * Format summary section
   * @private
   */
  _formatSummary(summary) {
    const lines = ['SUMMARY', '-------'];

    lines.push(`Total Tools: ${summary.totalTools || 0}`);
    lines.push(`Overlaps: ${summary.overlapCount || 0}`);
    lines.push(`Validation Issues: ${summary.validationIssues || 0}`);

    if (summary.byStatus) {
      lines.push('');
      lines.push('By Status:');
      for (const [status, count] of Object.entries(summary.byStatus)) {
        lines.push(`  ${status}: ${count}`);
      }
    }

    return lines.join('\n');
  }

  /**
   * Format tools section
   * @private
   */
  _formatTools(tools) {
    if (!tools || tools.length === 0) {
      return 'DISCOVERED TOOLS\n---------------\nNo tools discovered.';
    }

    // Group by category
    const byCategory = {};
    for (const tool of tools) {
      const category = tool.category || tool.type || 'other';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(tool);
    }

    const lines = ['DISCOVERED TOOLS', '---------------', ''];

    for (const [category, categoryTools] of Object.entries(byCategory)) {
      lines.push(this._formatCategoryName(category) + ':');

      for (const tool of categoryTools) {
        const status = this._formatStatusSymbol(tool.status);
        const version = tool.metadata?.version
          ? ` (${tool.metadata.version})`
          : '';

        lines.push(`  ${status} ${tool.name}${version}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format overlaps section
   * @private
   */
  _formatOverlaps(overlaps) {
    const lines = ['OVERLAPS & CONFLICTS', '--------------------', ''];

    for (const overlap of overlaps) {
      lines.push(`${overlap.type}:`);
      lines.push(`  Tools: ${overlap.tools.join(', ')}`);
      lines.push(`  Reason: ${overlap.reason}`);

      if (overlap.recommendation) {
        lines.push(`  Recommendation: ${overlap.recommendation}`);
      }

      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * Format category name
   * @private
   */
  _formatCategoryName(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  /**
   * Format status symbol
   * @private
   */
  _formatStatusSymbol(status) {
    const symbols = {
      active: '[✓]',
      available: '[○]',
      detected: '[·]',
      missing: '[ ]',
      error: '[✗]'
    };

    return symbols[status] || '[?]';
  }
}

export default TextFormatter;
