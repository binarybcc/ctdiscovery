/**
 * Duplication Detection System
 * Identifies overlapping functionality across tool categories
 */

export class DuplicationDetector {
  constructor() {
    this.overlapRules = {
      'ai-assistant': {
        tools: ['claude', 'copilot', 'cursor', 'tabnine', 'codewhisperer'],
        severity: 'warning',
        message: 'Multiple AI assistants may conflict in code completion',
        recommendation: 'Choose one primary AI assistant to avoid conflicts'
      },
      'package-manager-js': {
        tools: ['npm', 'yarn', 'pnpm'],
        severity: 'info',
        message: 'Multiple JavaScript package managers available',
        recommendation: 'Project should use consistent package manager (check package-lock files)'
      },
      'git-tools': {
        tools: ['git', 'gh', 'hub'],
        severity: 'info', 
        message: 'Multiple Git tools provide overlapping functionality',
        recommendation: 'gh (GitHub CLI) provides most functionality of hub'
      },
      'python-package-managers': {
        tools: ['pip', 'conda', 'poetry'],
        severity: 'info',
        message: 'Multiple Python package managers detected',
        recommendation: 'Different managers serve different use cases'
      },
      'container-tools': {
        tools: ['docker', 'podman', 'colima'],
        severity: 'info',
        message: 'Multiple container runtimes available',
        recommendation: 'Docker is most widely supported for development'
      },
      'code-editors': {
        tools: ['code', 'cursor', 'vim', 'nvim', 'emacs'],
        severity: 'info',
        message: 'Multiple code editors detected',
        recommendation: 'Each serves different workflows - overlap is usually intentional'
      }
    };

    this.vscodeOverlapRules = {
      'git-extensions': {
        extensions: ['gitlens', 'git-history', 'git-graph', 'gitignore'],
        severity: 'info',
        message: 'Multiple Git extensions - GitLens provides comprehensive functionality',
        recommendation: 'GitLens includes most features of other Git extensions'
      },
      'ai-coding': {
        extensions: ['github-copilot', 'claude-dev', 'tabnine', 'codewhisperer'],
        severity: 'warning',
        message: 'Multiple AI coding assistants may interfere with each other',
        recommendation: 'Enable one primary AI assistant, disable others to avoid conflicts'
      },
      'theme-extensions': {
        extensions: ['material-theme', 'one-dark-pro', 'dracula', 'monokai'],
        severity: 'info',
        message: 'Multiple theme extensions detected',
        recommendation: 'Only one theme is active at a time - others can be disabled'
      },
      'formatting-tools': {
        extensions: ['prettier', 'eslint', 'beautify', 'format-code'],
        severity: 'warning',
        message: 'Multiple formatting tools may conflict',
        recommendation: 'Configure one primary formatter per file type'
      },
      'bracket-helpers': {
        extensions: ['bracket-pair-colorizer', 'rainbow-brackets', 'auto-close-tag'],
        severity: 'info',
        message: 'VS Code now includes native bracket pair functionality',
        recommendation: 'Consider disabling bracket extensions - native support is faster'
      }
    };
  }

  detectSystemToolOverlaps(tools) {
    const overlaps = [];
    const toolsByCategory = this.categorizeTools(tools);

    Object.entries(this.overlapRules).forEach(([ruleKey, rule]) => {
      const foundTools = tools.filter(tool => 
        rule.tools.includes(tool.name.toLowerCase())
      );

      if (foundTools.length > 1) {
        overlaps.push({
          category: ruleKey,
          tools: foundTools.map(t => t.name),
          severity: rule.severity,
          message: rule.message,
          recommendation: rule.recommendation,
          type: 'system-tool-overlap'
        });
      }
    });

    return overlaps;
  }

  detectVSCodeOverlaps(extensions) {
    const overlaps = [];

    Object.entries(this.vscodeOverlapRules).forEach(([ruleKey, rule]) => {
      const foundExtensions = extensions.filter(ext => 
        rule.extensions.some(ruleName => 
          ext.id?.toLowerCase().includes(ruleName) || 
          ext.displayName?.toLowerCase().includes(ruleName)
        )
      );

      if (foundExtensions.length > 1) {
        overlaps.push({
          category: ruleKey,
          tools: foundExtensions.map(e => e.displayName || e.id),
          severity: rule.severity,
          message: rule.message,
          recommendation: rule.recommendation,
          type: 'vscode-extension-overlap',
          extensions: foundExtensions.map(e => ({
            id: e.id,
            name: e.displayName,
            enabled: e.enabled !== false
          }))
        });
      }
    });

    return overlaps;
  }

  detectCrossTypeOverlaps(systemTools, vscodeExtensions) {
    const overlaps = [];

    // Detect system tools that have VSCode extension equivalents
    const systemAI = systemTools.filter(tool => 
      ['claude', 'copilot', 'cursor'].includes(tool.name.toLowerCase())
    );
    
    const vscodeAI = vscodeExtensions.filter(ext => 
      ext.aiRelevant && ['copilot', 'claude', 'cursor', 'tabnine'].some(ai => 
        ext.id?.toLowerCase().includes(ai)
      )
    );

    if (systemAI.length > 0 && vscodeAI.length > 0) {
      overlaps.push({
        category: 'ai-system-vs-extension',
        tools: [
          ...systemAI.map(t => `${t.name} (system)`),
          ...vscodeAI.map(e => `${e.displayName} (extension)`)
        ],
        severity: 'warning',
        message: 'AI assistants available both as system tools and VSCode extensions',
        recommendation: 'VSCode extensions typically provide better IDE integration',
        type: 'cross-type-overlap'
      });
    }

    return overlaps;
  }

  categorizeTools(tools) {
    const categories = {};
    
    tools.forEach(tool => {
      const category = tool.metadata?.category || 'uncategorized';
      if (!categories[category]) categories[category] = [];
      categories[category].push(tool);
    });

    return categories;
  }

  generateOverlapSummary(allOverlaps) {
    const summary = {
      total: allOverlaps.length,
      byType: {},
      bySeverity: {},
      recommendations: []
    };

    allOverlaps.forEach(overlap => {
      // Count by type
      summary.byType[overlap.type] = (summary.byType[overlap.type] || 0) + 1;
      
      // Count by severity
      summary.bySeverity[overlap.severity] = (summary.bySeverity[overlap.severity] || 0) + 1;
      
      // Collect high-priority recommendations
      if (overlap.severity === 'warning') {
        summary.recommendations.push({
          category: overlap.category,
          message: overlap.recommendation,
          tools: overlap.tools
        });
      }
    });

    return summary;
  }

  /**
   * Main entry point for overlap detection across all tool types
   */
  detectAllOverlaps(scanResults) {
    const allOverlaps = [];

    // System tool overlaps
    if (scanResults.systemTools?.data) {
      allOverlaps.push(...this.detectSystemToolOverlaps(scanResults.systemTools.data));
    }

    // VSCode extension overlaps  
    if (scanResults.vscode?.installed) {
      allOverlaps.push(...this.detectVSCodeOverlaps(scanResults.vscode.installed));
    }

    // Cross-type overlaps
    if (scanResults.systemTools?.data && scanResults.vscode?.installed) {
      allOverlaps.push(...this.detectCrossTypeOverlaps(
        scanResults.systemTools.data, 
        scanResults.vscode.installed
      ));
    }

    return {
      overlaps: allOverlaps,
      summary: this.generateOverlapSummary(allOverlaps)
    };
  }
}