/**
 * Relevance Scorer
 *
 * Scores tools based on their relevance to the current project context.
 * This enables intelligent filtering and prioritization.
 */

export class RelevanceScorer {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Score all tools based on project context
   */
  async scoreTools(tools, projectType) {
    return tools.map(tool => {
      const score = this._calculateRelevance(tool, projectType);
      return {
        ...tool,
        relevance: {
          score: score.score,
          level: score.level,
          reasons: score.reasons,
          category: score.category
        }
      };
    });
  }

  /**
   * Calculate relevance score for a tool
   */
  _calculateRelevance(tool, projectType) {
    const scores = {
      ecosystem: 0,      // Tool is part of project ecosystem
      configured: 0,     // Tool is configured
      active: 0,         // Tool is actively used
      capability: 0,     // Tool provides needed capability
      standard: 0        // Tool is industry standard
    };

    const reasons = [];

    // Ecosystem match (0-40 points)
    const ecosystemScore = this._scoreEcosystem(tool, projectType);
    scores.ecosystem = ecosystemScore.score;
    reasons.push(...ecosystemScore.reasons);

    // Configuration status (0-20 points)
    const configScore = this._scoreConfiguration(tool);
    scores.configured = configScore.score;
    reasons.push(...configScore.reasons);

    // Active usage (0-20 points)
    const activeScore = this._scoreActive(tool);
    scores.active = activeScore.score;
    reasons.push(...activeScore.reasons);

    // Capability match (0-10 points)
    const capabilityScore = this._scoreCapability(tool, projectType);
    scores.capability = capabilityScore.score;
    reasons.push(...capabilityScore.reasons);

    // Industry standard (0-10 points)
    const standardScore = this._scoreStandard(tool);
    scores.standard = standardScore.score;
    reasons.push(...standardScore.reasons);

    // Calculate total
    const totalScore = Object.values(scores).reduce((sum, s) => sum + s, 0);

    // Debug logging for PHP tools
    if (process.env.DEBUG_RELEVANCE && ['phpstan', 'psalm', 'rector', 'phpunit', 'composer', 'php'].includes(tool.name)) {
      console.log(`[RELEVANCE] ${tool.name}:`);
      console.log(`  Ecosystem: ${scores.ecosystem}`);
      console.log(`  Configured: ${scores.configured}`);
      console.log(`  Active: ${scores.active}`);
      console.log(`  Capability: ${scores.capability}`);
      console.log(`  Standard: ${scores.standard}`);
      console.log(`  Total: ${totalScore}`);
      console.log(`  Usage pattern: ${tool.usage?.pattern || 'none'}`);
    }

    // Determine level
    let level, category;
    if (totalScore >= 80) {
      level = 'critical';
      category = 'active';
    } else if (totalScore >= 60) {
      level = 'high';
      category = 'active';
    } else if (totalScore >= 40) {
      level = 'medium';
      category = 'available';
    } else if (totalScore >= 20) {
      level = 'low';
      category = 'available';
    } else {
      level = 'irrelevant';
      category = 'noise';
    }

    return {
      score: totalScore,
      level,
      category,
      reasons: reasons.filter(r => r),
      breakdown: scores
    };
  }

  /**
   * Score ecosystem match
   */
  _scoreEcosystem(tool, projectType) {
    const toolName = tool.name.toLowerCase();
    const reasons = [];

    // Check if tool is in project's primary language ecosystem
    if (projectType.languages.includes(toolName)) {
      reasons.push(`Primary language: ${toolName}`);
      return { score: 40, reasons };
    }

    // Check package managers
    if (projectType.packageManagers.some(pm => pm.toLowerCase().includes(toolName) || toolName.includes(pm.toLowerCase()))) {
      reasons.push(`Project package manager`);
      return { score: 35, reasons };
    }

    // Check build systems
    if (projectType.buildSystems.some(bs => bs.toLowerCase() === toolName)) {
      reasons.push(`Project build system`);
      return { score: 30, reasons };
    }

    // Check frameworks
    if (projectType.frameworks.some(fw => fw.toLowerCase().includes(toolName) || toolName.includes(fw.toLowerCase()))) {
      reasons.push(`Project framework`);
      return { score: 35, reasons };
    }

    // Universal tools
    const universalTools = ['git', 'docker', 'make'];
    if (universalTools.includes(toolName)) {
      reasons.push(`Universal development tool`);
      return { score: 25, reasons };
    }

    // Language-specific tools
    const languageTools = {
      'php': ['composer', 'phpstan', 'rector', 'phpunit', 'psalm', 'phpcs', 'php-cs-fixer'],
      'python': ['pip', 'poetry', 'pytest', 'black', 'mypy', 'pylint', 'flake8'],
      'ruby': ['bundler', 'rake', 'rspec'],
      'rust': ['cargo', 'rustc', 'clippy'],
      'go': ['gofmt', 'golint'],
      'java': ['maven', 'gradle', 'javac'],
      'javascript': ['npm', 'yarn', 'pnpm', 'eslint', 'prettier'],
      'typescript': ['tsc', 'eslint', 'prettier']
    };

    // Check if tool is essential for THIS project's language
    for (const [lang, tools] of Object.entries(languageTools)) {
      if (tools.includes(toolName) && projectType.languages.includes(lang)) {
        reasons.push(`Essential ${lang} development tool`);
        return { score: 35, reasons };
      }
    }

    // Check if tool is language-specific but NOT for this project (irrelevant)
    for (const [lang, tools] of Object.entries(languageTools)) {
      if (tools.includes(toolName) && !projectType.languages.includes(lang)) {
        reasons.push(`Irrelevant to ${projectType.primaryType} project`);
        return { score: 0, reasons };
      }
    }

    return { score: 10, reasons };
  }

  /**
   * Score configuration status
   */
  _scoreConfiguration(tool) {
    const reasons = [];

    // Active status means configured and working
    if (tool.status === 'active') {
      reasons.push('Actively configured');
      return { score: 20, reasons };
    }

    // Available but check if configured
    if (tool.status === 'available') {
      // Check for config files
      if (tool.metadata?.configFiles && tool.metadata.configFiles.length > 0) {
        reasons.push('Configured with config files');
        return { score: 15, reasons };
      }

      reasons.push('Installed but not configured');
      return { score: 5, reasons };
    }

    if (tool.status === 'detected') {
      return { score: 3, reasons: ['Detected but status unknown'] };
    }

    return { score: 0, reasons };
  }

  /**
   * Score active usage
   */
  _scoreActive(tool) {
    const reasons = [];

    // PRIORITY 1: Check usage pattern from UsageAnalyzer
    if (tool.usage) {
      const pattern = tool.usage.pattern;
      const confidence = tool.usage.confidence || 0;

      if (pattern === 'active-development') {
        reasons.push('Active in project scripts');
        return { score: 20, reasons };
      }

      if (pattern === 'configured') {
        reasons.push('Configured in project');
        return { score: 15, reasons };
      }

      if (pattern === 'installed') {
        reasons.push('Installed but minimal use');
        return { score: 8, reasons };
      }

      if (pattern === 'dormant') {
        reasons.push('Dormant - not actively used');
        return { score: 3, reasons };
      }
    }

    // FALLBACK: Check status
    if (tool.status === 'active') {
      reasons.push('Currently active');
      return { score: 20, reasons };
    }

    // Check for recent usage indicators
    if (tool.metadata?.lastUsed) {
      const lastUsed = new Date(tool.metadata.lastUsed);
      const daysSince = (Date.now() - lastUsed) / (1000 * 60 * 60 * 24);

      if (daysSince < 7) {
        reasons.push('Used within last week');
        return { score: 18, reasons };
      }
      if (daysSince < 30) {
        reasons.push('Used within last month');
        return { score: 12, reasons };
      }
    }

    // Check if tool has running processes
    if (tool.metadata?.running) {
      reasons.push('Has running processes');
      return { score: 15, reasons };
    }

    return { score: 0, reasons: ['No recent usage detected'] };
  }

  /**
   * Score capability match
   */
  _scoreCapability(tool, projectType) {
    const reasons = [];

    if (!tool.metadata?.capabilities) {
      return { score: 0, reasons };
    }

    // Check if tool capabilities match project needs
    const toolCapabilities = tool.metadata.capabilities.map(c => c.toLowerCase());
    const projectCapabilities = projectType.capabilities.map(c => c.toLowerCase());

    const matches = toolCapabilities.filter(tc =>
      projectCapabilities.some(pc => pc.includes(tc) || tc.includes(pc))
    );

    if (matches.length > 0) {
      reasons.push(`Provides: ${matches.join(', ')}`);
      return { score: Math.min(10, matches.length * 5), reasons };
    }

    return { score: 0, reasons };
  }

  /**
   * Score industry standard status
   */
  _scoreStandard(tool) {
    const toolName = tool.name.toLowerCase();
    const reasons = [];

    // Industry standard tools
    const standards = {
      'git': 'Industry standard VCS',
      'docker': 'Industry standard containerization',
      'npm': 'Standard Node.js package manager',
      'composer': 'Standard PHP package manager',
      'pip': 'Standard Python package manager',
      'cargo': 'Standard Rust package manager',
      'eslint': 'Standard JavaScript linter',
      'prettier': 'Standard code formatter',
      'jest': 'Popular testing framework',
      'phpunit': 'Standard PHP testing framework',
      'pytest': 'Standard Python testing framework'
    };

    if (standards[toolName]) {
      reasons.push(standards[toolName]);
      return { score: 10, reasons };
    }

    return { score: 0, reasons };
  }

  /**
   * Filter tools by relevance threshold
   */
  filterByRelevance(tools, threshold = 'medium') {
    const thresholds = {
      'critical': 80,
      'high': 60,
      'medium': 40,
      'low': 20,
      'any': 0
    };

    const minScore = thresholds[threshold] || thresholds.medium;

    return {
      relevant: tools.filter(t => t.relevance.score >= minScore),
      filtered: tools.filter(t => t.relevance.score < minScore)
    };
  }

  /**
   * Group tools by relevance category
   */
  groupByRelevance(tools) {
    return {
      active: tools.filter(t => t.relevance.category === 'active'),
      available: tools.filter(t => t.relevance.category === 'available'),
      noise: tools.filter(t => t.relevance.category === 'noise')
    };
  }
}

export default RelevanceScorer;
