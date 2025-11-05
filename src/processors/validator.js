/**
 * Validator
 *
 * Validates tool entries for completeness and correctness
 */

import { TOOL_STATUSES, TOOL_CATEGORIES } from '../constants.js';

export class Validator {
  constructor(options = {}) {
    this.options = {
      strict: options.strict || false,
      ...options
    };
  }

  /**
   * Validate tools
   *
   * @param {Array<Tool>} tools - Array of tools to validate
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validate(tools) {
    if (!Array.isArray(tools)) {
      return {
        valid: false,
        issues: [{ severity: 'error', message: 'Tools must be an array' }]
      };
    }

    const issues = [];
    const warnings = [];

    for (let i = 0; i < tools.length; i++) {
      const tool = tools[i];
      const toolIssues = this._validateTool(tool, i);

      issues.push(...toolIssues.filter(issue => issue.severity === 'error'));
      warnings.push(...toolIssues.filter(issue => issue.severity === 'warning'));
    }

    return {
      valid: issues.length === 0,
      issues: issues,
      warnings: warnings,
      toolCount: tools.length,
      validToolCount: tools.length - issues.length
    };
  }

  /**
   * Validate a single tool
   * @private
   */
  _validateTool(tool, index) {
    const issues = [];

    // Required fields
    if (!tool.name) {
      issues.push({
        severity: 'error',
        tool: index,
        field: 'name',
        message: 'Tool name is required'
      });
    }

    if (!tool.type && !tool.category) {
      issues.push({
        severity: this.options.strict ? 'error' : 'warning',
        tool: index,
        field: 'type',
        message: 'Tool type or category is required'
      });
    }

    if (!tool.status) {
      issues.push({
        severity: 'warning',
        tool: index,
        field: 'status',
        message: 'Tool status is missing'
      });
    }

    // Validate status value
    if (tool.status && !Object.values(TOOL_STATUSES).includes(tool.status)) {
      issues.push({
        severity: 'warning',
        tool: index,
        field: 'status',
        message: `Invalid status: ${tool.status}`
      });
    }

    // Validate type value
    if (tool.type && !Object.values(TOOL_CATEGORIES).includes(tool.type)) {
      issues.push({
        severity: 'warning',
        tool: index,
        field: 'type',
        message: `Unknown type: ${tool.type}`
      });
    }

    // Validate metadata structure
    if (tool.metadata && typeof tool.metadata !== 'object') {
      issues.push({
        severity: 'error',
        tool: index,
        field: 'metadata',
        message: 'Metadata must be an object'
      });
    }

    // Warn about missing source
    if (!tool.source) {
      issues.push({
        severity: 'warning',
        tool: index,
        field: 'source',
        message: 'Tool source is missing'
      });
    }

    // Validate version format if present
    if (tool.metadata?.version) {
      const version = tool.metadata.version;
      if (typeof version !== 'string' || version.trim() === '') {
        issues.push({
          severity: 'warning',
          tool: index,
          field: 'metadata.version',
          message: 'Invalid version format'
        });
      }
    }

    return issues;
  }

  /**
   * Validate scan results structure
   *
   * @param {Object} scanResults - Raw scan results
   * @returns {Promise<ValidationResult>} Validation result
   */
  async validateScanResults(scanResults) {
    const issues = [];

    if (!scanResults) {
      return {
        valid: false,
        issues: [{ severity: 'error', message: 'Scan results are null or undefined' }]
      };
    }

    // Check required fields
    const requiredFields = ['timestamp', 'environment', 'tools'];
    for (const field of requiredFields) {
      if (!scanResults[field]) {
        issues.push({
          severity: 'error',
          field: field,
          message: `Required field missing: ${field}`
        });
      }
    }

    // Validate environment
    if (scanResults.environment) {
      if (!scanResults.environment.platform) {
        issues.push({
          severity: 'warning',
          field: 'environment.platform',
          message: 'Platform not specified'
        });
      }

      if (!scanResults.environment.nodeVersion) {
        issues.push({
          severity: 'warning',
          field: 'environment.nodeVersion',
          message: 'Node version not specified'
        });
      }
    }

    // Validate tools structure
    if (scanResults.tools && typeof scanResults.tools !== 'object') {
      issues.push({
        severity: 'error',
        field: 'tools',
        message: 'Tools must be an object'
      });
    }

    return {
      valid: issues.filter(i => i.severity === 'error').length === 0,
      issues: issues.filter(i => i.severity === 'error'),
      warnings: issues.filter(i => i.severity === 'warning')
    };
  }
}

export default Validator;
