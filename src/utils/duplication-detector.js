/**
 * Exact Overlap Detection System
 * Identifies tools with identical or overlapping functionality using algorithms
 */

import { detectAllRuleOverlaps } from '../overlap-rules/index.js';

export class DuplicationDetector {
  constructor() {
    // Command mappings - tools that provide identical commands
    this.commandMappings = {
      'npm': ['npm'],
      'yarn': ['yarn'], 
      'pnpm': ['pnpm'],
      'git': ['git'],
      'gh': ['gh'],
      'hub': ['hub'],
      'docker': ['docker'],
      'podman': ['podman'],
      'colima': ['docker'], // Colima provides docker command compatibility
      'kubectl': ['kubectl'],
      'python': ['python'],
      'python3': ['python', 'python3'],
      'pip': ['pip'],
      'pip3': ['pip', 'pip3'],
      'node': ['node'],
      'code': ['code'],
      'cursor': ['cursor', 'code'], // Cursor is VS Code compatible
      'vim': ['vim'],
      'nvim': ['nvim', 'vim'] // Neovim provides vim compatibility
    };

    // Process/daemon conflicts - tools that can't run simultaneously
    this.processConflicts = [
      {
        category: 'container-runtime',
        tools: ['docker', 'podman', 'colima'],
        reason: 'daemon-port-conflict',
        severity: 'warning'
      },
      {
        category: 'ai-assistant-completion',
        tools: ['copilot', 'tabnine', 'codewhisperer', 'cursor'],
        reason: 'completion-interference', 
        severity: 'info'
      }
    ];

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
    
    // 1. Command-based overlaps
    overlaps.push(...this.detectCommandOverlaps(tools));
    
    // 2. Process conflict detection  
    overlaps.push(...this.detectProcessConflicts(tools));
    
    // 3. File extension overlaps
    overlaps.push(...this.detectFileTypeOverlaps(tools));
    
    // 4. Plugin-based rule overlaps
    overlaps.push(...detectAllRuleOverlaps(tools));

    return overlaps;
  }

  detectCommandOverlaps(tools) {
    const commandMap = new Map();
    const overlaps = [];
    
    // Build command mapping
    tools.forEach(tool => {
      const commands = this.commandMappings[tool.name.toLowerCase()] || [];
      commands.forEach(cmd => {
        if (!commandMap.has(cmd)) commandMap.set(cmd, []);
        commandMap.get(cmd).push(tool);
      });
    });
    
    // Find commands provided by multiple tools
    commandMap.forEach((toolList, command) => {
      if (toolList.length > 1) {
        const context = this.analyzeCommandContext(command, toolList);
        overlaps.push({
          type: 'command-overlap',
          category: 'command-conflict',
          command: command,
          tools: toolList.map(t => t.name),
          severity: context.severity,
          message: `Multiple tools provide '${command}' command`,
          evidence: `Command '${command}' available from: ${toolList.map(t => t.name).join(', ')}`,
          context_warning: context.warning
        });
      }
    });
    
    return overlaps;
  }

  analyzeCommandContext(command, toolList) {
    const toolNames = toolList.map(t => t.name.toLowerCase());
    
    // Check for exact duplicates (same tool appearing multiple times)
    const uniqueNames = [...new Set(toolNames)];
    if (toolNames.length > uniqueNames.length) {
      return {
        severity: 'warning',
        warning: '⚠️  Duplicate tool installations detected - may indicate scanner issues'
      };
    }
    
    // Check for known system + dev version patterns
    if (command === 'python' && toolNames.includes('python') && toolNames.includes('python3')) {
      return {
        severity: 'info',
        warning: '✓ System and development Python versions commonly coexist'
      };
    }
    
    if (command === 'pip' && toolNames.some(n => n.includes('pip'))) {
      return {
        severity: 'info', 
        warning: 'ℹ️  Different pip versions may serve system vs. user Python installations'
      };
    }
    
    // Check for tools that provide compatibility commands
    if (command === 'vim' && toolNames.includes('nvim')) {
      return {
        severity: 'info',
        warning: '✓ Neovim provides vim compatibility - this overlap is by design'  
      };
    }
    
    if (command === 'docker' && toolNames.includes('colima')) {
      return {
        severity: 'info',
        warning: 'ℹ️  Colima provides Docker API compatibility for macOS'
      };
    }
    
    return {
      severity: 'info',
      warning: null
    };
  }

  detectProcessConflicts(tools) {
    const overlaps = [];
    
    this.processConflicts.forEach(conflictRule => {
      const foundTools = tools.filter(tool => 
        conflictRule.tools.includes(tool.name.toLowerCase())
      );
      
      if (foundTools.length > 1) {
        overlaps.push({
          type: 'process-conflict',
          category: conflictRule.category,
          tools: foundTools.map(t => t.name),
          severity: conflictRule.severity,
          reason: conflictRule.reason,
          message: `Multiple ${conflictRule.category.replace('-', ' ')} tools detected`,
          evidence: `Potential ${conflictRule.reason.replace('-', ' ')}: ${foundTools.map(t => t.name).join(', ')}`
        });
      }
    });
    
    return overlaps;
  }

  detectFileTypeOverlaps(tools) {
    // This could be enhanced to detect tools that handle same file types
    // For now, return empty - this is where external data would be most valuable
    return [];
  }

  detectVSCodeOverlaps(extensions) {
    const overlaps = [];

    // Detect extensions with similar functionality patterns
    Object.entries(this.vscodeOverlapRules).forEach(([ruleKey, rule]) => {
      const foundExtensions = extensions.filter(ext => 
        rule.extensions.some(ruleName => 
          ext.id?.toLowerCase().includes(ruleName) || 
          ext.displayName?.toLowerCase().includes(ruleName)
        )
      );

      if (foundExtensions.length > 1) {
        overlaps.push({
          type: 'vscode-extension-overlap',
          category: ruleKey,
          tools: foundExtensions.map(e => e.displayName || e.id),
          severity: 'info', // Remove opinionated severity levels
          message: `Multiple ${ruleKey.replace('-', ' ')} extensions detected`,
          evidence: `Extensions: ${foundExtensions.map(e => e.displayName || e.id).join(', ')}`,
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

    // Handle different scan result formats
    const status = scanResults.status || scanResults;
    
    // System tool overlaps
    const systemTools = status['system-tool']?.data || status.systemTools?.data;
    if (systemTools) {
      allOverlaps.push(...this.detectSystemToolOverlaps(systemTools));
    }

    // VSCode extension overlaps  
    const vscodeExtensions = status.vscode?.installed;
    if (vscodeExtensions) {
      allOverlaps.push(...this.detectVSCodeOverlaps(vscodeExtensions));
    }

    // Cross-type overlaps
    if (systemTools && vscodeExtensions) {
      allOverlaps.push(...this.detectCrossTypeOverlaps(systemTools, vscodeExtensions));
    }

    return {
      overlaps: allOverlaps,
      summary: this.generateOverlapSummary(allOverlaps)
    };
  }
}