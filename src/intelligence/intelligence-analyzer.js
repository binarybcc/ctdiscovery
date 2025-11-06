/**
 * Intelligence Analyzer
 *
 * Main intelligence component that combines project detection, relevance scoring,
 * and usage analysis to provide smart, context-aware insights.
 */

import { ProjectTypeDetector } from './project-type-detector.js';
import { RelevanceScorer } from './relevance-scorer.js';
import { UsageAnalyzer } from './usage-analyzer.js';

export class IntelligenceAnalyzer {
  constructor(options = {}) {
    this.options = {
      projectRoot: options.projectRoot || process.cwd(),
      intelligenceMode: options.intelligenceMode || 'smart',
      relevanceThreshold: options.relevanceThreshold || 'medium',
      ...options
    };

    this.projectDetector = new ProjectTypeDetector({ projectRoot: this.options.projectRoot });
    this.relevanceScorer = new RelevanceScorer();
    this.usageAnalyzer = new UsageAnalyzer({ projectRoot: this.options.projectRoot });
  }

  /**
   * Perform intelligent analysis of tools
   */
  async analyze(tools, analysisResult) {
    // Detect project type
    const projectType = await this.projectDetector.detect();

    // Analyze usage patterns
    const toolsWithUsage = await this.usageAnalyzer.analyzeUsage(tools);

    // Score relevance
    const toolsWithRelevance = await this.relevanceScorer.scoreTools(toolsWithUsage, projectType);

    // Group and filter based on mode
    const intelligence = this._buildIntelligence(
      toolsWithRelevance,
      projectType,
      analysisResult
    );

    return intelligence;
  }

  /**
   * Build intelligence object
   */
  _buildIntelligence(tools, projectType, analysisResult) {
    // Group tools by relevance
    const grouped = this.relevanceScorer.groupByRelevance(tools);

    // Identify optimization opportunities
    const opportunities = this.usageAnalyzer.identifyOptimizationOpportunities(tools);

    // Build smart summary
    const summary = this._buildSmartSummary(grouped, projectType, analysisResult);

    // Generate recommendations
    const recommendations = this._generateRecommendations(grouped, projectType, opportunities);

    // Build AI-optimized context
    const aiContext = this._buildAIContext(grouped, projectType, summary);

    return {
      projectIntelligence: {
        type: projectType.primaryType,
        languages: projectType.languages,
        frameworks: projectType.frameworks,
        packageManagers: projectType.packageManagers,
        buildSystems: projectType.buildSystems,
        capabilities: projectType.capabilities,
        confidence: projectType.confidence
      },

      tools: {
        active: grouped.active,
        available: grouped.available,
        noise: grouped.noise,
        all: tools
      },

      summary: {
        ...summary,
        total: tools.length,
        active: grouped.active.length,
        available: grouped.available.length,
        filtered: grouped.noise.length
      },

      recommendations,

      optimizationOpportunities: opportunities,

      aiContext
    };
  }

  /**
   * Build smart summary
   */
  _buildSmartSummary(grouped, projectType, analysisResult) {
    const active = grouped.active;

    // Build capability summary
    const capabilities = new Set();
    for (const tool of active) {
      if (tool.metadata?.capabilities) {
        tool.metadata.capabilities.forEach(cap => capabilities.add(cap));
      }
    }

    // Detect maturity level
    const maturityScore = this._assessMaturity(active, projectType);

    // Build description
    const description = this._generateDescription(projectType, active, maturityScore);

    return {
      description,
      maturity: maturityScore.level,
      maturityScore: maturityScore.score,
      capabilities: Array.from(capabilities),
      keyTools: active.slice(0, 10).map(t => ({
        name: t.name,
        relevance: t.relevance.level,
        usage: t.usage?.pattern
      }))
    };
  }

  /**
   * Assess environment maturity
   */
  _assessMaturity(activeTools, projectType) {
    let score = 0;

    // Base score from project type detection
    score += projectType.confidence * 0.3;

    // Points for having package manager configured
    if (activeTools.some(t => t.type === 'package-manager' && t.relevance.score >= 60)) {
      score += 15;
    }

    // Points for testing framework
    if (activeTools.some(t => t.metadata?.capabilities?.includes('testing'))) {
      score += 15;
    }

    // Points for linting/formatting
    if (activeTools.some(t => t.metadata?.capabilities?.includes('code-quality'))) {
      score += 10;
    }

    // Points for static analysis
    if (activeTools.some(t => t.metadata?.capabilities?.includes('static-analysis'))) {
      score += 10;
    }

    // Points for CI/CD tools
    if (activeTools.some(t => t.metadata?.capabilities?.includes('containerization'))) {
      score += 10;
    }

    // Determine level
    let level;
    if (score >= 80) level = 'mature';
    else if (score >= 60) level = 'established';
    else if (score >= 40) level = 'developing';
    else if (score >= 20) level = 'basic';
    else level = 'minimal';

    return { score, level };
  }

  /**
   * Generate human-readable description
   */
  _generateDescription(projectType, activeTools, maturity) {
    const parts = [];

    // Maturity
    const maturityDesc = {
      'mature': 'Mature',
      'established': 'Well-established',
      'developing': 'Developing',
      'basic': 'Basic',
      'minimal': 'Minimal'
    };

    parts.push(maturityDesc[maturity.level] || 'Unknown');

    // Project type
    if (projectType.frameworks.length > 0) {
      parts.push(`${projectType.frameworks[0]} development environment`);
    } else if (projectType.languages.length > 0) {
      parts.push(`${projectType.languages[0]} development environment`);
    } else {
      parts.push('development environment');
    }

    // Key capabilities
    const hasQuality = activeTools.some(t => t.metadata?.capabilities?.includes('code-quality'));
    const hasTesting = activeTools.some(t => t.metadata?.capabilities?.includes('testing'));
    const hasContainer = activeTools.some(t => t.metadata?.capabilities?.includes('containerization'));

    const capabilities = [];
    if (hasQuality) capabilities.push('quality tools');
    if (hasTesting) capabilities.push('automated testing');
    if (hasContainer) capabilities.push('containerization');

    if (capabilities.length > 0) {
      parts.push(`with ${capabilities.join(', ')}`);
    }

    return parts.join(' ');
  }

  /**
   * Generate recommendations
   */
  _generateRecommendations(grouped, projectType, opportunities) {
    const recommendations = [];

    // Recommend missing essential tools (check ALL tools, not just active)
    const allTools = [...grouped.active, ...grouped.available, ...grouped.noise];
    const essential = this._getMissingEssentialTools(allTools, projectType);
    if (essential.length > 0) {
      recommendations.push({
        type: 'install',
        priority: 'high',
        tools: essential,
        reason: 'Essential tools for this project type',
        action: `Consider installing: ${essential.join(', ')}`
      });
    }

    // Recommend configuration for available tools
    const unconfigured = grouped.available.filter(t =>
      t.usage?.pattern === 'installed' &&
      t.relevance.score >= 40
    );

    if (unconfigured.length > 0) {
      recommendations.push({
        type: 'configure',
        priority: 'medium',
        tools: unconfigured.map(t => t.name),
        reason: 'Installed tools not yet configured',
        action: `Configure: ${unconfigured.map(t => t.name).join(', ')}`
      });
    }

    // Include optimization opportunities
    for (const opp of opportunities) {
      recommendations.push({
        type: opp.type,
        priority: opp.severity === 'high' ? 'high' : 'low',
        tools: opp.tools,
        reason: opp.suggestion,
        action: opp.suggestion
      });
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  /**
   * Get missing essential tools for project type
   * Checks against ALL detected tools (active, available, and filtered)
   */
  _getMissingEssentialTools(allTools, projectType) {
    const installedNames = allTools.map(t => t.name.toLowerCase());
    const missing = [];

    // Essential tools by project type
    const essentials = {
      'javascript': ['eslint'],
      'typescript': ['tsc', 'eslint'],
      'php': ['composer', 'phpstan'],
      'python': ['pip', 'pytest'],
      'rust': ['cargo', 'clippy'],
      'go': ['gofmt']
    };

    for (const lang of projectType.languages) {
      const essential = essentials[lang] || [];
      for (const tool of essential) {
        if (!installedNames.includes(tool)) {
          missing.push(tool);
        }
      }
    }

    return missing;
  }

  /**
   * Build AI-optimized context
   */
  _buildAIContext(grouped, projectType, summary) {
    // Build concise conversation starter
    const conversationStarter = this._buildConversationStarter(grouped.active, projectType, summary);

    // Extract key capabilities
    const capabilities = Array.from(new Set(
      grouped.active.flatMap(t => t.metadata?.capabilities || [])
    )).slice(0, 8);

    // Build focus areas
    const focusAreas = this._identifyFocusAreas(grouped.active, projectType);

    return {
      conversationStarter,
      summary: summary.description,
      capabilities,
      focusAreas,
      keyTools: grouped.active.slice(0, 5).map(t => ({
        name: t.name,
        purpose: t.relevance.reasons[0] || 'Development tool'
      })),
      irrelevantToolsFiltered: grouped.noise.length
    };
  }

  /**
   * Build conversation starter for AI
   */
  _buildConversationStarter(activeTools, projectType, summary) {
    const parts = [];

    // Opening with project type
    if (projectType.frameworks.length > 0) {
      parts.push(`This is a ${projectType.frameworks[0]} project`);
    } else if (projectType.languages.length > 0) {
      parts.push(`This is a ${projectType.languages[0]} project`);
    }

    // Maturity and tools
    parts.push(`with a ${summary.maturity} development setup`);

    // Key tools (top 3-4)
    const keyTools = activeTools
      .slice(0, 4)
      .map(t => t.name)
      .join(', ');

    if (keyTools) {
      parts.push(`using ${keyTools}`);
    }

    return parts.join(' ') + '. How can I help you with your development?';
  }

  /**
   * Identify focus areas for development
   */
  _identifyFocusAreas(activeTools, projectType) {
    const areas = [];

    if (projectType.packageManagers.length > 0) {
      areas.push(`${projectType.packageManagers[0]} workflow`);
    }

    if (activeTools.some(t => t.metadata?.capabilities?.includes('testing'))) {
      areas.push('automated testing');
    }

    if (activeTools.some(t => t.metadata?.capabilities?.includes('code-quality'))) {
      areas.push('code quality');
    }

    if (activeTools.some(t => t.metadata?.capabilities?.includes('containerization'))) {
      areas.push('containerized deployment');
    }

    return areas;
  }

  /**
   * Filter tools based on intelligence mode
   */
  filterByMode(intelligence, mode = 'smart') {
    switch (mode) {
      case 'all':
      case 'comprehensive':
        // Return everything
        return intelligence.tools.all;

      case 'smart':
      case 'intelligent':
        // Return active + highly relevant available tools
        return [
          ...intelligence.tools.active,
          ...intelligence.tools.available.filter(t => t.relevance.score >= 60)
        ];

      case 'project-optimized':
      case 'focused':
        // Return only active tools
        return intelligence.tools.active;

      case 'ai-context':
        // Return minimal set for AI context
        return intelligence.tools.active.slice(0, 10);

      default:
        return intelligence.tools.active;
    }
  }
}

export default IntelligenceAnalyzer;
