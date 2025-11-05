/**
 * CTDiscovery Bridge
 *
 * Bridges the VSCode extension with the core CTDiscovery module
 */

import { CTDiscovery } from 'ctdiscovery';

export class CTDiscoveryBridge {
  constructor(options = {}) {
    this.options = options;
    this.ctd = new CTDiscovery(options);
    this.lastResults = null;
  }

  /**
   * Scan workspace and return VSCode-friendly format
   */
  async scanWorkspace(workspacePath) {
    try {
      // Perform scan and analysis
      const scanResults = await this.ctd.scan();
      const analysis = await this.ctd.analyze(scanResults);
      const context = await this.ctd.generateContext(analysis);

      // Transform for VSCode
      const transformed = {
        timestamp: analysis.timestamp,
        environment: analysis.environment,
        analysis: analysis,
        context: context,
        treeItems: this.buildTreeItems(analysis),
        tasks: this.generateTasks(analysis),
        recommendations: this.buildRecommendations(analysis)
      };

      this.lastResults = transformed;
      return transformed;

    } catch (error) {
      console.error('Scan failed:', error);
      throw error;
    }
  }

  /**
   * Build tree items for VSCode tree views
   */
  buildTreeItems(analysis) {
    const items = {
      environment: this._buildEnvironmentItems(analysis.environment),
      tools: this._buildToolItems(analysis.tools),
      overlaps: this._buildOverlapItems(analysis.overlaps),
      recommendations: []
    };

    return items;
  }

  /**
   * Build environment tree items
   * @private
   */
  _buildEnvironmentItems(environment) {
    return [
      {
        label: `Platform: ${environment.platform}`,
        icon: 'device-desktop',
        contextValue: 'environment.platform'
      },
      {
        label: `Node: ${environment.nodeVersion}`,
        icon: 'versions',
        contextValue: 'environment.node'
      },
      {
        label: `Directory: ${this._shortenPath(environment.workingDirectory)}`,
        icon: 'folder',
        tooltip: environment.workingDirectory,
        contextValue: 'environment.directory'
      }
    ];
  }

  /**
   * Build tool tree items
   * @private
   */
  _buildToolItems(tools) {
    if (!tools || tools.length === 0) {
      return [];
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

    // Build tree structure
    const items = [];
    for (const [category, categoryTools] of Object.entries(byCategory)) {
      const categoryItem = {
        label: this._formatCategoryName(category),
        icon: this._getCategoryIcon(category),
        contextValue: 'toolCategory',
        collapsibleState: 'expanded',
        children: categoryTools.map(tool => this._buildToolItem(tool))
      };

      items.push(categoryItem);
    }

    return items;
  }

  /**
   * Build single tool item
   * @private
   */
  _buildToolItem(tool) {
    const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
    const icon = this._getStatusIcon(tool.status);

    return {
      label: `${tool.name}${version}`,
      icon: icon,
      tooltip: this._buildToolTooltip(tool),
      contextValue: 'tool',
      tool: tool, // Store full tool data
      command: {
        command: 'ctdiscovery.showToolDetails',
        title: 'Show Details',
        arguments: [tool]
      }
    };
  }

  /**
   * Build overlap tree items
   * @private
   */
  _buildOverlapItems(overlaps) {
    if (!overlaps || overlaps.length === 0) {
      return [];
    }

    return overlaps.map(overlap => ({
      label: overlap.type,
      description: overlap.tools.join(', '),
      icon: this._getSeverityIcon(overlap.severity),
      tooltip: overlap.reason,
      contextValue: 'overlap',
      overlap: overlap
    }));
  }

  /**
   * Build recommendations
   */
  buildRecommendations(analysis) {
    const recommendations = [];

    // Tool recommendations
    if (analysis.context?.recommendations) {
      for (const rec of analysis.context.recommendations) {
        recommendations.push({
          type: 'tool',
          message: rec,
          action: null
        });
      }
    }

    // Extension recommendations based on detected tools
    const extensionRecs = this._buildExtensionRecommendations(analysis.tools);
    recommendations.push(...extensionRecs);

    return recommendations;
  }

  /**
   * Build extension recommendations based on tools
   * @private
   */
  _buildExtensionRecommendations(tools) {
    const recommendations = [];
    const extensionMap = {
      'python': {
        id: 'ms-python.python',
        name: 'Python',
        reason: 'Python detected'
      },
      'docker': {
        id: 'ms-azuretools.vscode-docker',
        name: 'Docker',
        reason: 'Docker detected'
      },
      'node': {
        id: 'dbaeumer.vscode-eslint',
        name: 'ESLint',
        reason: 'Node.js detected'
      },
      'git': {
        id: 'eamodio.gitlens',
        name: 'GitLens',
        reason: 'Git detected'
      },
      'rust': {
        id: 'rust-lang.rust-analyzer',
        name: 'rust-analyzer',
        reason: 'Rust detected'
      },
      'go': {
        id: 'golang.go',
        name: 'Go',
        reason: 'Go detected'
      }
    };

    for (const tool of tools) {
      const toolName = tool.name.toLowerCase();
      if (extensionMap[toolName]) {
        const ext = extensionMap[toolName];
        recommendations.push({
          type: 'extension',
          extensionId: ext.id,
          message: `Install ${ext.name} extension`,
          reason: ext.reason,
          action: {
            command: 'workbench.extensions.installExtension',
            arguments: [ext.id]
          }
        });
      }
    }

    return recommendations;
  }

  /**
   * Generate VSCode tasks from tools
   */
  generateTasks(analysis) {
    const tasks = [];
    const tools = analysis?.analysis?.tools || analysis?.tools || [];

    for (const tool of tools) {
      if (tool.status !== 'active') continue;

      // Generate tasks for specific tools
      if (tool.name === 'npm' && tool.metadata?.path) {
        tasks.push(
          ...this._generateNpmTasks()
        );
      }

      if (tool.name === 'docker' && tool.metadata?.path) {
        tasks.push(
          ...this._generateDockerTasks()
        );
      }

      if (tool.name === 'make' && tool.metadata?.path) {
        tasks.push({
          label: 'Build (Make)',
          type: 'shell',
          command: 'make',
          group: 'build',
          discoveredBy: 'ctdiscovery',
          discoveredId: 'make-build'
        });
      }
    }

    return tasks;
  }

  /**
   * Generate npm tasks
   * @private
   */
  _generateNpmTasks() {
    return [
      {
        label: 'npm: install',
        type: 'shell',
        command: 'npm install',
        group: 'none',
        discoveredBy: 'ctdiscovery',
        discoveredId: 'npm-install'
      },
      {
        label: 'npm: test',
        type: 'shell',
        command: 'npm test',
        group: 'test',
        discoveredBy: 'ctdiscovery',
        discoveredId: 'npm-test'
      },
      {
        label: 'npm: build',
        type: 'shell',
        command: 'npm run build',
        group: 'build',
        discoveredBy: 'ctdiscovery',
        discoveredId: 'npm-build'
      }
    ];
  }

  /**
   * Generate Docker tasks
   * @private
   */
  _generateDockerTasks() {
    return [
      {
        label: 'Docker: Build',
        type: 'shell',
        command: 'docker build -t ${input:imageName} .',
        group: 'build',
        discoveredBy: 'ctdiscovery',
        discoveredId: 'docker-build'
      },
      {
        label: 'Docker: Run',
        type: 'shell',
        command: 'docker run ${input:imageName}',
        group: 'none',
        discoveredBy: 'ctdiscovery',
        discoveredId: 'docker-run'
      }
    ];
  }

  /**
   * Generate AI context
   */
  async generateContext(results) {
    return results.context || await this.ctd.generateContext(results.analysis);
  }

  /**
   * Update configuration
   */
  updateConfig(updates) {
    this.options = { ...this.options, ...updates };
    this.ctd.updateConfig(updates);
  }

  // Helper methods

  _formatCategoryName(category) {
    return category
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  _getCategoryIcon(category) {
    const icons = {
      'mcp-server': 'server',
      'vscode-extension': 'extensions',
      'system-tool': 'tools',
      'language': 'code',
      'package-manager': 'package',
      'version-control': 'git-commit',
      'build-tool': 'gear',
      'ai-assistant': 'robot'
    };

    return icons[category] || 'circle-outline';
  }

  _getStatusIcon(status) {
    const icons = {
      active: 'check',
      available: 'circle-outline',
      detected: 'info',
      missing: 'x',
      error: 'error'
    };

    return icons[status] || 'question';
  }

  _getSeverityIcon(severity) {
    const icons = {
      error: 'error',
      warning: 'warning',
      info: 'info'
    };

    return icons[severity] || 'info';
  }

  _buildToolTooltip(tool) {
    const lines = [
      `Name: ${tool.name}`,
      `Status: ${tool.status}`,
      `Type: ${tool.type || 'unknown'}`
    ];

    if (tool.metadata?.version) {
      lines.push(`Version: ${tool.metadata.version}`);
    }

    if (tool.metadata?.path) {
      lines.push(`Path: ${tool.metadata.path}`);
    }

    if (tool.source) {
      lines.push(`Source: ${tool.source}`);
    }

    return lines.join('\n');
  }

  _shortenPath(path) {
    if (!path) return '';
    if (path.length <= 50) return path;

    const parts = path.split('/');
    if (parts.length > 3) {
      return `.../${parts.slice(-2).join('/')}`;
    }

    return path;
  }
}

export default CTDiscoveryBridge;
