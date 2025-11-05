/**
 * Enricher
 *
 * Enriches tool entries with additional metadata, capabilities, and context
 */

export class Enricher {
  constructor(options = {}) {
    this.options = options;

    // Tool capability database
    this.capabilities = this._buildCapabilityDatabase();
  }

  /**
   * Enrich tools with metadata and capabilities
   *
   * @param {Array<Tool>} tools - Array of tools
   * @param {Object} environment - Environment context
   * @returns {Promise<Array<Tool>>} Enriched tools
   */
  async enrich(tools, environment = {}) {
    if (!Array.isArray(tools)) {
      return [];
    }

    return tools.map(tool => this._enrichTool(tool, environment));
  }

  /**
   * Enrich a single tool
   * @private
   */
  _enrichTool(tool, environment) {
    const enriched = { ...tool };

    // Add capabilities if not already present
    if (!enriched.metadata?.capabilities) {
      enriched.metadata = {
        ...enriched.metadata,
        capabilities: this._getCapabilities(tool.name, tool.type)
      };
    }

    // Add categories if not present
    if (!enriched.categories) {
      enriched.categories = this._inferCategories(tool);
    }

    // Add platform compatibility
    if (!enriched.platformCompatibility) {
      enriched.platformCompatibility = this._getPlatformCompatibility(tool.name);
    }

    // Add AI relevance score
    enriched.aiRelevance = this._calculateAIRelevance(tool);

    // Add documentation links
    if (!enriched.metadata?.documentation) {
      enriched.metadata = {
        ...enriched.metadata,
        documentation: this._getDocumentationLinks(tool.name)
      };
    }

    // Add usage examples if applicable
    if (!enriched.metadata?.examples) {
      enriched.metadata = {
        ...enriched.metadata,
        examples: this._getUsageExamples(tool.name)
      };
    }

    return enriched;
  }

  /**
   * Get tool capabilities
   * @private
   */
  _getCapabilities(toolName, toolType) {
    const name = toolName.toLowerCase();
    return this.capabilities[name] || this._inferCapabilities(toolName, toolType);
  }

  /**
   * Build capability database
   * @private
   */
  _buildCapabilityDatabase() {
    return {
      // Version Control
      git: ['version-control', 'branching', 'merging', 'history'],
      gh: ['github', 'cli', 'pr-management', 'issue-tracking'],

      // Package Managers
      npm: ['package-management', 'dependency-resolution', 'script-runner'],
      yarn: ['package-management', 'dependency-resolution', 'workspace'],
      pnpm: ['package-management', 'dependency-resolution', 'disk-efficient'],

      // Build Tools
      docker: ['containerization', 'isolation', 'deployment'],
      make: ['build-automation', 'task-runner'],
      webpack: ['bundling', 'module-resolution', 'optimization'],
      vite: ['bundling', 'dev-server', 'hmr'],

      // Languages
      node: ['javascript', 'runtime', 'async'],
      python: ['scripting', 'ai-ml', 'data-science'],
      go: ['compiled', 'concurrent', 'systems'],
      rust: ['systems', 'memory-safe', 'performance'],

      // AI Assistants
      claude: ['ai-assistant', 'code-generation', 'analysis'],
      copilot: ['ai-assistant', 'code-completion']
    };
  }

  /**
   * Infer capabilities from tool name and type
   * @private
   */
  _inferCapabilities(toolName, toolType) {
    const capabilities = [];

    if (toolType === 'language') {
      capabilities.push('programming-language', 'development');
    }

    if (toolType === 'package-manager') {
      capabilities.push('dependency-management', 'package-management');
    }

    if (toolType === 'build-tool') {
      capabilities.push('build-automation', 'task-execution');
    }

    if (toolType === 'version-control') {
      capabilities.push('source-control', 'collaboration');
    }

    return capabilities;
  }

  /**
   * Infer categories for a tool
   * @private
   */
  _inferCategories(tool) {
    const categories = [];

    // Use existing type/category
    if (tool.type) categories.push(tool.type);
    if (tool.category && tool.category !== tool.type) {
      categories.push(tool.category);
    }

    // Infer additional categories
    const name = tool.name.toLowerCase();

    if (['docker', 'podman', 'kubernetes'].includes(name)) {
      categories.push('container');
    }

    if (['webpack', 'vite', 'rollup', 'parcel'].includes(name)) {
      categories.push('bundler');
    }

    if (['jest', 'mocha', 'vitest', 'pytest'].includes(name)) {
      categories.push('testing');
    }

    return [...new Set(categories)]; // unique
  }

  /**
   * Get platform compatibility
   * @private
   */
  _getPlatformCompatibility(toolName) {
    const name = toolName.toLowerCase();

    // Platform-specific tools
    const platformSpecific = {
      'brew': ['darwin'],
      'apt': ['linux'],
      'yum': ['linux'],
      'choco': ['win32'],
      'winget': ['win32']
    };

    if (platformSpecific[name]) {
      return platformSpecific[name];
    }

    // Most tools are cross-platform
    return ['darwin', 'win32', 'linux'];
  }

  /**
   * Calculate AI relevance score (0-100)
   * @private
   */
  _calculateAIRelevance(tool) {
    let score = 0;

    // AI assistant tools get highest score
    if (tool.type === 'ai-assistant' || tool.name.match(/claude|copilot|cursor/i)) {
      score += 50;
    }

    // MCP servers are highly relevant
    if (tool.type === 'mcp-server') {
      score += 40;
    }

    // VSCode extensions moderately relevant
    if (tool.type === 'vscode-extension') {
      score += 20;
    }

    // Development tools
    if (['language', 'build-tool', 'version-control'].includes(tool.type)) {
      score += 30;
    }

    // Active status adds points
    if (tool.status === 'active') {
      score += 20;
    }

    return Math.min(100, score);
  }

  /**
   * Get documentation links
   * @private
   */
  _getDocumentationLinks(toolName) {
    const name = toolName.toLowerCase();

    const docs = {
      git: 'https://git-scm.com/doc',
      docker: 'https://docs.docker.com',
      node: 'https://nodejs.org/docs',
      npm: 'https://docs.npmjs.com',
      python: 'https://docs.python.org',
      rust: 'https://doc.rust-lang.org',
      go: 'https://go.dev/doc'
    };

    return docs[name] || null;
  }

  /**
   * Get usage examples
   * @private
   */
  _getUsageExamples(toolName) {
    const name = toolName.toLowerCase();

    const examples = {
      git: ['git status', 'git commit -m "message"', 'git push'],
      docker: ['docker ps', 'docker build -t name .', 'docker run image'],
      npm: ['npm install', 'npm run dev', 'npm test'],
      node: ['node script.js', 'node --version']
    };

    return examples[name] || [];
  }
}

export default Enricher;
