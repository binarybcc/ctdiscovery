/**
 * Markdown Formatter
 *
 * Formats analysis results as Markdown
 */

export class MarkdownFormatter {
  constructor(options = {}) {
    this.options = {
      includeHeader: options.includeHeader !== false,
      includeTableOfContents: options.includeTableOfContents || false,
      ...options
    };
  }

  /**
   * Format analysis result as Markdown
   *
   * @param {AnalysisResult} analysisResult - Analysis result
   * @param {Object} options - Format options
   * @returns {Promise<string>} Markdown string
   */
  async format(analysisResult, options = {}) {
    const opts = { ...this.options, ...options };
    const sections = [];

    // Header
    if (opts.includeHeader !== false) {
      sections.push(this._formatHeader(analysisResult));
    }

    // Table of contents
    if (opts.includeTableOfContents) {
      sections.push(this._formatTableOfContents());
    }

    // Environment section
    sections.push(this._formatEnvironment(analysisResult.environment));

    // Summary section
    if (analysisResult.summary) {
      sections.push(this._formatSummary(analysisResult.summary));
    }

    // Tools section
    sections.push(this._formatTools(analysisResult.tools));

    // Overlaps section
    if (analysisResult.overlaps && analysisResult.overlaps.length > 0) {
      sections.push(this._formatOverlaps(analysisResult.overlaps));
    }

    // Validation section
    if (analysisResult.validation && !analysisResult.validation.valid) {
      sections.push(this._formatValidation(analysisResult.validation));
    }

    return sections.join('\n\n');
  }

  /**
   * Format header
   * @private
   */
  _formatHeader(analysisResult) {
    const date = new Date(analysisResult.timestamp).toLocaleString();
    const duration = analysisResult.scanDuration
      ? `${analysisResult.scanDuration}ms`
      : 'unknown';

    return `# Development Environment Report

**Generated:** ${date}
**Scan Duration:** ${duration}
**CTDiscovery Version:** ${analysisResult.version || '2.0.0'}`;
  }

  /**
   * Format table of contents
   * @private
   */
  _formatTableOfContents() {
    return `## Table of Contents

- [Environment](#environment)
- [Summary](#summary)
- [Discovered Tools](#discovered-tools)
- [Overlaps & Conflicts](#overlaps--conflicts)
- [Validation Issues](#validation-issues)`;
  }

  /**
   * Format environment section
   * @private
   */
  _formatEnvironment(environment) {
    if (!environment) return '';

    return `## Environment

| Property | Value |
|----------|-------|
| Platform | ${environment.platform || 'unknown'} |
| Node Version | ${environment.nodeVersion || 'unknown'} |
| Working Directory | \`${environment.workingDirectory || 'unknown'}\` |`;
  }

  /**
   * Format summary section
   * @private
   */
  _formatSummary(summary) {
    const statusLines = Object.entries(summary.byStatus || {})
      .map(([status, count]) => `- **${status}**: ${count}`)
      .join('\n');

    const categoryLines = Object.entries(summary.byCategory || {})
      .map(([category, count]) => `- **${category}**: ${count}`)
      .join('\n');

    return `## Summary

**Total Tools:** ${summary.totalTools || 0}
**Overlaps Detected:** ${summary.overlapCount || 0}
**Validation Issues:** ${summary.validationIssues || 0}

### By Status
${statusLines || '- None'}

### By Category
${categoryLines || '- None'}`;
  }

  /**
   * Format tools section
   * @private
   */
  _formatTools(tools) {
    if (!tools || tools.length === 0) {
      return '## Discovered Tools\n\nNo tools discovered.';
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

    const sections = ['## Discovered Tools\n'];

    for (const [category, categoryTools] of Object.entries(byCategory)) {
      sections.push(`### ${this._formatCategoryName(category)}\n`);

      for (const tool of categoryTools) {
        sections.push(this._formatTool(tool));
      }
    }

    return sections.join('\n');
  }

  /**
   * Format a single tool
   * @private
   */
  _formatTool(tool) {
    const status = this._formatStatus(tool.status);
    const version = tool.metadata?.version
      ? ` (v${tool.metadata.version})`
      : '';

    let output = `- **${tool.name}**${version} - ${status}`;

    // Add source
    if (tool.source) {
      output += `\n  - Source: ${tool.source}`;
    }

    // Add path if available
    if (tool.metadata?.path) {
      output += `\n  - Path: \`${tool.metadata.path}\``;
    }

    // Add capabilities
    if (tool.metadata?.capabilities && tool.metadata.capabilities.length > 0) {
      const caps = tool.metadata.capabilities.slice(0, 5).join(', ');
      output += `\n  - Capabilities: ${caps}`;
    }

    return output;
  }

  /**
   * Format overlaps section
   * @private
   */
  _formatOverlaps(overlaps) {
    const sections = ['## Overlaps & Conflicts\n'];

    for (const overlap of overlaps) {
      const severity = this._formatSeverity(overlap.severity);
      sections.push(`### ${overlap.type} ${severity}\n`);
      sections.push(`**Tools:** ${overlap.tools.join(', ')}\n`);
      sections.push(`**Reason:** ${overlap.reason}\n`);

      if (overlap.recommendation) {
        sections.push(`**Recommendation:** ${overlap.recommendation}\n`);
      }
    }

    return sections.join('\n');
  }

  /**
   * Format validation section
   * @private
   */
  _formatValidation(validation) {
    if (!validation || validation.valid) {
      return '';
    }

    const sections = ['## Validation Issues\n'];

    if (validation.issues && validation.issues.length > 0) {
      sections.push('### Errors\n');
      for (const issue of validation.issues) {
        sections.push(`- **Tool ${issue.tool}** (${issue.field}): ${issue.message}`);
      }
    }

    if (validation.warnings && validation.warnings.length > 0) {
      sections.push('\n### Warnings\n');
      for (const warning of validation.warnings) {
        sections.push(`- **Tool ${warning.tool}** (${warning.field}): ${warning.message}`);
      }
    }

    return sections.join('\n');
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
   * Format status with emoji
   * @private
   */
  _formatStatus(status) {
    const statusMap = {
      active: '🟢 Active',
      available: '🔵 Available',
      detected: '🟡 Detected',
      missing: '⚪ Missing',
      error: '🔴 Error'
    };

    return statusMap[status] || status;
  }

  /**
   * Format severity with emoji
   * @private
   */
  _formatSeverity(severity) {
    const severityMap = {
      error: '🔴',
      warning: '⚠️',
      info: 'ℹ️'
    };

    return severityMap[severity] || '';
  }
}

export default MarkdownFormatter;
