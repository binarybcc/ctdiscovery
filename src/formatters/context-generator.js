/**
 * Context Generator
 *
 * Generates AI assistant context from analysis results
 */

export class ContextGenerator {
  constructor(options = {}) {
    this.options = {
      includeConversationStarter: options.includeConversationStarter !== false,
      includeRecommendations: options.includeRecommendations !== false,
      aiRelevanceThreshold: options.aiRelevanceThreshold || 0,
      ...options
    };
  }

  /**
   * Generate AI assistant context
   *
   * @param {AnalysisResult} analysisResult - Analysis result
   * @param {Object} options - Generation options
   * @returns {Promise<Object>} Context object
   */
  async generate(analysisResult, options = {}) {
    const opts = { ...this.options, ...options };

    // Filter tools by AI relevance
    const relevantTools = this._filterRelevantTools(
      analysisResult.tools,
      opts.aiRelevanceThreshold
    );

    // Generate markdown context
    const markdown = this._generateMarkdown(
      analysisResult,
      relevantTools,
      opts
    );

    // Generate conversation starter
    const conversationStarter = opts.includeConversationStarter
      ? this._generateConversationStarter(analysisResult, relevantTools)
      : null;

    // Generate recommendations
    const recommendations = opts.includeRecommendations
      ? this._generateRecommendations(analysisResult, relevantTools)
      : [];

    return {
      markdown,
      conversationStarter,
      recommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        toolCount: relevantTools.length,
        totalToolCount: analysisResult.tools?.length || 0
      }
    };
  }

  /**
   * Filter tools by AI relevance
   * @private
   */
  _filterRelevantTools(tools, threshold) {
    if (!tools) return [];

    return tools.filter(tool => {
      // Always include active tools
      if (tool.status === 'active') return true;

      // Filter by AI relevance score if available
      if (tool.aiRelevance !== undefined) {
        return tool.aiRelevance >= threshold;
      }

      // Include by default if no score
      return true;
    });
  }

  /**
   * Generate markdown context
   * @private
   */
  _generateMarkdown(analysisResult, tools, opts) {
    const sections = [];

    // Header
    sections.push('# Development Environment Context\n');
    sections.push(`Generated: ${new Date().toLocaleString()}\n`);

    // Environment
    sections.push('## Environment\n');
    if (analysisResult.environment) {
      const env = analysisResult.environment;
      sections.push(`- **Platform:** ${env.platform || 'unknown'}`);
      sections.push(`- **Node Version:** ${env.nodeVersion || 'unknown'}`);
      sections.push(`- **Working Directory:** \`${env.workingDirectory || 'unknown'}\`\n`);
    }

    // Available tools by category
    sections.push('## Available Tools\n');
    const byCategory = this._groupByCategory(tools);

    for (const [category, categoryTools] of Object.entries(byCategory)) {
      sections.push(`### ${this._formatCategoryName(category)}\n`);

      for (const tool of categoryTools) {
        const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
        const status = tool.status === 'active' ? ' ✓' : '';
        sections.push(`- **${tool.name}**${version}${status}`);

        // Add key capabilities
        if (tool.metadata?.capabilities && tool.metadata.capabilities.length > 0) {
          const caps = tool.metadata.capabilities.slice(0, 3).join(', ');
          sections.push(`  - Capabilities: ${caps}`);
        }
      }

      sections.push('');
    }

    // MCP Servers (if any)
    const mcpServers = tools.filter(t => t.type === 'mcp-server');
    if (mcpServers.length > 0) {
      sections.push('## MCP Servers\n');
      for (const server of mcpServers) {
        sections.push(`- **${server.name}**`);
        if (server.metadata?.description) {
          sections.push(`  - ${server.metadata.description}`);
        }
      }
      sections.push('');
    }

    // VSCode Extensions (if any)
    const vscodeExtensions = tools.filter(t => t.type === 'vscode-extension');
    if (vscodeExtensions.length > 0) {
      sections.push('## VSCode Extensions\n');

      // Only show AI-relevant extensions
      const aiRelevant = vscodeExtensions
        .filter(ext => ext.aiRelevance > 50)
        .slice(0, 10);

      for (const ext of aiRelevant) {
        sections.push(`- **${ext.name}**`);
      }
      sections.push('');
    }

    // Overlaps (if any)
    if (analysisResult.overlaps && analysisResult.overlaps.length > 0) {
      sections.push('## Tool Overlaps\n');
      for (const overlap of analysisResult.overlaps) {
        if (overlap.severity === 'warning' || overlap.severity === 'error') {
          sections.push(`- **${overlap.type}:** ${overlap.reason}`);
          if (overlap.recommendation) {
            sections.push(`  - Recommendation: ${overlap.recommendation}`);
          }
        }
      }
      sections.push('');
    }

    // Recommendations
    if (opts.includeRecommendations) {
      const recs = this._generateRecommendations(analysisResult, tools);
      if (recs.length > 0) {
        sections.push('## Recommendations\n');
        for (const rec of recs) {
          sections.push(`- ${rec}`);
        }
        sections.push('');
      }
    }

    return sections.join('\n');
  }

  /**
   * Generate conversation starter
   * @private
   */
  _generateConversationStarter(analysisResult, tools) {
    const parts = [];

    // Opening
    parts.push('I scanned your development environment and found:');

    // Key tools
    const activeTools = tools.filter(t => t.status === 'active');
    if (activeTools.length > 0) {
      const toolNames = activeTools
        .slice(0, 5)
        .map(t => t.name)
        .join(', ');

      parts.push(`\n- Active tools: ${toolNames}`);
    }

    // Languages
    const languages = tools.filter(t => t.type === 'language' || t.category === 'language');
    if (languages.length > 0) {
      const langNames = languages.map(l => l.name).join(', ');
      parts.push(`- Programming languages: ${langNames}`);
    }

    // Version control
    const vcs = tools.find(t => t.name.toLowerCase() === 'git');
    if (vcs) {
      parts.push('- Version control: Git');
    }

    // MCP servers
    const mcpCount = tools.filter(t => t.type === 'mcp-server').length;
    if (mcpCount > 0) {
      parts.push(`- MCP servers configured: ${mcpCount}`);
    }

    // Closing
    parts.push('\nHow can I help you with your development today?');

    return parts.join('\n');
  }

  /**
   * Generate recommendations
   * @private
   */
  _generateRecommendations(analysisResult, tools) {
    const recommendations = [];

    // Check for missing common tools
    const hasGit = tools.some(t => t.name.toLowerCase() === 'git');
    if (!hasGit) {
      recommendations.push('Consider installing Git for version control');
    }

    const hasDocker = tools.some(t => t.name.toLowerCase() === 'docker');
    if (!hasDocker && analysisResult.environment?.platform !== 'win32') {
      recommendations.push('Consider Docker for containerized development');
    }

    // Check for overlaps
    if (analysisResult.overlaps) {
      for (const overlap of analysisResult.overlaps) {
        if (overlap.recommendation && overlap.severity === 'warning') {
          recommendations.push(overlap.recommendation);
        }
      }
    }

    // MCP server recommendations
    const mcpCount = tools.filter(t => t.type === 'mcp-server').length;
    if (mcpCount === 0) {
      recommendations.push('Consider installing MCP servers to extend Claude Code capabilities');
    }

    return recommendations.slice(0, 5); // Limit to 5 recommendations
  }

  /**
   * Group tools by category
   * @private
   */
  _groupByCategory(tools) {
    const byCategory = {};

    for (const tool of tools) {
      const category = tool.category || tool.type || 'other';
      if (!byCategory[category]) {
        byCategory[category] = [];
      }
      byCategory[category].push(tool);
    }

    return byCategory;
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
}

export default ContextGenerator;
