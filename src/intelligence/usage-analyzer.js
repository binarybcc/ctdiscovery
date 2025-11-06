/**
 * Usage Analyzer
 *
 * Analyzes actual usage patterns of tools to distinguish between
 * "installed" and "actually used".
 */

import { existsSync, statSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

export class UsageAnalyzer {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.options = options;
  }

  /**
   * Analyze usage patterns for all tools
   */
  async analyzeUsage(tools) {
    return tools.map(tool => {
      const usage = this._analyzeToolUsage(tool);
      return {
        ...tool,
        usage: {
          pattern: usage.pattern,
          indicators: usage.indicators,
          lastActivity: usage.lastActivity,
          frequency: usage.frequency,
          confidence: usage.confidence
        }
      };
    });
  }

  /**
   * Analyze usage pattern for a single tool (public API)
   */
  analyzeToolUsage(tool) {
    return this._analyzeToolUsage(tool);
  }

  /**
   * Analyze individual tool usage (internal implementation)
   * @private
   */
  _analyzeToolUsage(tool) {
    const indicators = [];
    let pattern = 'unknown';
    let lastActivity = null;
    let frequency = 'never';
    let confidence = 0;

    // Check configuration files
    const configCheck = this._checkConfigurationFiles(tool);
    if (configCheck.found) {
      indicators.push(...configCheck.indicators);
      confidence += 30;
    }

    // Check for lock files (indicates active dependency management)
    const lockCheck = this._checkLockFiles(tool);
    if (lockCheck.found) {
      indicators.push(...lockCheck.indicators);
      lastActivity = lockCheck.lastModified;
      confidence += 20;
    }

    // Check npm scripts / composer scripts
    const scriptCheck = this._checkScripts(tool);
    if (scriptCheck.found) {
      indicators.push(...scriptCheck.indicators);
      frequency = scriptCheck.frequency;
      confidence += 25;
    }

    // Check for tool-specific directories
    const dirCheck = this._checkToolDirectories(tool);
    if (dirCheck.found) {
      indicators.push(...dirCheck.indicators);
      confidence += 15;
    }

    // Determine usage pattern
    if (confidence >= 70) {
      pattern = 'active-development';
    } else if (confidence >= 50) {
      pattern = 'configured';
    } else if (confidence >= 30) {
      pattern = 'installed';
    } else if (tool.status === 'available') {
      pattern = 'dormant';
    } else {
      pattern = 'unknown';
    }

    return {
      pattern,
      indicators,
      lastActivity,
      frequency,
      confidence
    };
  }

  /**
   * Check for configuration files
   */
  _checkConfigurationFiles(tool) {
    const toolName = tool.name.toLowerCase();
    const found = [];

    const configFiles = {
      'eslint': ['.eslintrc.js', '.eslintrc.json', '.eslintrc.yml', 'eslint.config.js'],
      'prettier': ['.prettierrc', '.prettierrc.json', '.prettierrc.yml', 'prettier.config.js'],
      'phpstan': ['phpstan.neon', 'phpstan.neon.dist'],
      'rector': ['rector.php'],
      'jest': ['jest.config.js', 'jest.config.ts'],
      'vitest': ['vitest.config.js', 'vitest.config.ts'],
      'typescript': ['tsconfig.json'],
      'webpack': ['webpack.config.js'],
      'vite': ['vite.config.js', 'vite.config.ts'],
      'docker': ['Dockerfile', 'docker-compose.yml', '.dockerignore']
    };

    const files = configFiles[toolName] || [];

    for (const file of files) {
      const path = join(this.projectRoot, file);
      if (existsSync(path)) {
        const stats = statSync(path);
        found.push({
          type: 'config',
          file,
          lastModified: stats.mtime
        });
      }
    }

    return {
      found: found.length > 0,
      indicators: found
    };
  }

  /**
   * Check lock files for recent activity
   */
  _checkLockFiles(tool) {
    const toolName = tool.name.toLowerCase();
    const lockFiles = {
      'npm': 'package-lock.json',
      'yarn': 'yarn.lock',
      'pnpm': 'pnpm-lock.yaml',
      'composer': 'composer.lock',
      'pip': 'requirements.txt',
      'poetry': 'poetry.lock',
      'cargo': 'Cargo.lock',
      'bundler': 'Gemfile.lock'
    };

    const lockFile = lockFiles[toolName];
    if (!lockFile) return { found: false };

    const path = join(this.projectRoot, lockFile);
    if (existsSync(path)) {
      const stats = statSync(path);
      const daysSince = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24);

      return {
        found: true,
        lastModified: stats.mtime,
        indicators: [{
          type: 'lockfile',
          file: lockFile,
          lastModified: stats.mtime,
          daysSince: Math.round(daysSince)
        }]
      };
    }

    return { found: false };
  }

  /**
   * Check package.json or composer.json scripts
   */
  _checkScripts(tool) {
    const toolName = tool.name.toLowerCase();

    // Check package.json
    const packageJsonPath = join(this.projectRoot, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const pkgContent = readFileSync(packageJsonPath, 'utf-8');
        const pkg = JSON.parse(pkgContent);
        if (pkg.scripts) {
          const scriptsUsingTool = Object.entries(pkg.scripts)
            .filter(([_, cmd]) => cmd.toLowerCase().includes(toolName))
            .map(([name]) => name);

          if (scriptsUsingTool.length > 0) {
            return {
              found: true,
              frequency: scriptsUsingTool.length > 3 ? 'frequent' : 'occasional',
              indicators: [{
                type: 'npm-script',
                scripts: scriptsUsingTool,
                count: scriptsUsingTool.length
              }]
            };
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Check composer.json
    const composerPath = join(this.projectRoot, 'composer.json');
    if (existsSync(composerPath)) {
      try {
        const composerContent = readFileSync(composerPath, 'utf-8');
        const composer = JSON.parse(composerContent);
        if (composer.scripts) {
          const scriptsUsingTool = Object.entries(composer.scripts)
            .filter(([_, cmd]) => {
              const cmdStr = Array.isArray(cmd) ? cmd.join(' ') : cmd;
              return cmdStr.toLowerCase().includes(toolName);
            })
            .map(([name]) => name);

          if (scriptsUsingTool.length > 0) {
            return {
              found: true,
              frequency: scriptsUsingTool.length > 3 ? 'frequent' : 'occasional',
              indicators: [{
                type: 'composer-script',
                scripts: scriptsUsingTool,
                count: scriptsUsingTool.length
              }]
            };
          }
        }
      } catch (error) {
        // Ignore parse errors
      }
    }

    return { found: false };
  }

  /**
   * Check for tool-specific directories
   */
  _checkToolDirectories(tool) {
    const toolName = tool.name.toLowerCase();

    const toolDirs = {
      'node': ['node_modules'],
      'composer': ['vendor'],
      'docker': ['.docker'],
      'jest': ['__tests__'],
      'pytest': ['tests', '__pycache__']
    };

    const dirs = toolDirs[toolName] || [];
    const found = [];

    for (const dir of dirs) {
      const path = join(this.projectRoot, dir);
      if (existsSync(path)) {
        try {
          const stats = statSync(path);
          found.push({
            type: 'directory',
            path: dir,
            lastModified: stats.mtime
          });
        } catch (error) {
          // Ignore
        }
      }
    }

    return {
      found: found.length > 0,
      indicators: found
    };
  }

  /**
   * Detect configuration maturity
   */
  assessConfigurationMaturity(tool) {
    if (!tool.usage) {
      return 'unknown';
    }

    const confidence = tool.usage.confidence;

    if (confidence >= 70) {
      return 'mature'; // Fully configured and actively used
    } else if (confidence >= 50) {
      return 'configured'; // Configured but maybe not actively used
    } else if (confidence >= 30) {
      return 'basic'; // Basic setup, not fully configured
    } else if (tool.status === 'available') {
      return 'installed-only'; // Just installed, no configuration
    } else {
      return 'unknown';
    }
  }

  /**
   * Identify optimization opportunities
   */
  identifyOptimizationOpportunities(tools) {
    const opportunities = [];

    // Find dormant tools consuming resources
    const dormantTools = tools.filter(t =>
      t.usage?.pattern === 'dormant' &&
      t.status === 'available'
    );

    if (dormantTools.length > 0) {
      opportunities.push({
        type: 'remove-dormant',
        severity: 'low',
        tools: dormantTools.map(t => t.name),
        suggestion: `Consider removing ${dormantTools.length} installed but unused tools`
      });
    }

    // Find unconfigured tools
    const unconfigured = tools.filter(t =>
      t.usage?.pattern === 'installed' &&
      !t.usage?.indicators.some(i => i.type === 'config')
    );

    if (unconfigured.length > 0) {
      opportunities.push({
        type: 'configure-tools',
        severity: 'medium',
        tools: unconfigured.map(t => t.name),
        suggestion: `${unconfigured.length} tools are installed but not configured`
      });
    }

    // Find duplicate functionality
    const duplicatePackageManagers = tools.filter(t =>
      t.type === 'package-manager' &&
      t.status === 'available'
    );

    if (duplicatePackageManagers.length > 1) {
      opportunities.push({
        type: 'consolidate-package-managers',
        severity: 'medium',
        tools: duplicatePackageManagers.map(t => t.name),
        suggestion: `Multiple package managers detected. Consider standardizing on one.`
      });
    }

    return opportunities;
  }
}

export default UsageAnalyzer;
