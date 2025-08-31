import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { PlatformDetection } from '../utils/platform-detection.js';
import { ToolScannerInterface, TOOL_STATUSES, TOOL_CATEGORIES, SCAN_STATUSES } from '../interfaces/tool-scanner-interface.js';

export class SystemToolScanner extends ToolScannerInterface {
  constructor() {
    super();
    this.name = 'System Tool Scanner';
    this.category = 'system-tool';
    this.platform = 'macos';
    this.version = '1.0.0';
    
    this.platformDetection = new PlatformDetection();
    this.toolCategories = {
      'version-control': ['git', 'gh', 'hub'],
      'language': ['node', 'npm', 'python', 'python3', 'pip', 'ruby', 'go', 'rust', 'java'],
      'build-tool': ['make', 'cmake', 'docker', 'podman', 'webpack', 'vite', 'rollup'],
      'package-manager': ['brew', 'npm', 'yarn', 'pnpm', 'pip', 'cargo', 'gem'],
      'ai-assistant': ['claude', 'copilot', 'cursor'],
      'development': ['code', 'vim', 'nvim', 'emacs', 'curl', 'wget', 'jq']
    };
  }

  async validate() {
    const startTime = Date.now();
    try {
      // Test basic command execution
      const testResult = await this.platformDetection.testCommandAvailability('which');
      
      return {
        functional: testResult.available,
        accessible: testResult.available,
        configured: true,
        duration: Date.now() - startTime,
        requirements: ['Shell command access', 'macOS which command']
      };
    } catch (error) {
      return {
        functional: false,
        accessible: false,
        configured: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  getCapabilities() {
    return [
      'Detect system development tools',
      'Check tool versions and availability',
      'Identify package managers and languages',
      'Detect AI development assistants',
      'Find build tools and automation'
    ];
  }

  async scan() {
    const startTime = Date.now();
    const results = {
      status: SCAN_STATUSES.SUCCESS,
      data: [],
      method: {
        name: this.name,
        status: 'scanning',
        duration: 0,
        platform: this.platform
      },
      overlaps: [],
      errors: [],
      warnings: []
    };

    // Scan each tool category
    for (const [category, tools] of Object.entries(this.toolCategories)) {
      for (const tool of tools) {
        try {
          const detection = await this.detectTool(tool, category);
          if (detection) {
            results.data.push(detection);
          }
        } catch (error) {
          results.warnings.push(`Failed to detect ${tool}: ${error.message}`);
        }
      }
    }

    // Deduplicate results - tools may appear in multiple categories
    results.data = this.deduplicateTools(results.data);

    // Detect overlaps within categories
    results.overlaps = this.detectCategoryOverlaps(results.data);

    results.method.duration = Date.now() - startTime;
    results.method.status = results.errors.length === 0 ? 'completed' : 'partial';
    
    if (results.data.length === 0 && results.errors.length > 0) {
      results.status = SCAN_STATUSES.FAILED;
    } else if (results.warnings.length > 0) {
      results.status = SCAN_STATUSES.PARTIAL;
    }

    return results;
  }

  async detectTool(toolName, category) {
    try {
      const testResult = await this.platformDetection.testCommandAvailability(toolName);
      
      if (!testResult.available) {
        return null; // Tool not found
      }

      // Get version information
      let version = 'unknown';
      try {
        const versionResult = execSync(`${toolName} --version`, { 
          encoding: 'utf8', 
          timeout: 3000,
          stdio: 'pipe'
        });
        version = this.extractVersion(versionResult);
      } catch {
        // Version detection failed, but tool exists
      }

      return {
        name: toolName,
        type: TOOL_CATEGORIES.SYSTEM_TOOL,
        status: TOOL_STATUSES.AVAILABLE,
        source: 'system-path',
        metadata: {
          version: version,
          path: testResult.path,
          category: category,
          description: this.getToolDescription(toolName)
        },
        validation: {
          functional: true,
          accessible: true,
          configured: true
        }
      };
    } catch (error) {
      return {
        name: toolName,
        type: TOOL_CATEGORIES.SYSTEM_TOOL,
        status: TOOL_STATUSES.ERROR,
        source: 'detection-error',
        metadata: {
          category: category,
          error: error.message
        }
      };
    }
  }

  extractVersion(versionOutput) {
    // Extract version from common version output patterns
    const versionRegex = /(\d+\.\d+\.\d+)/;
    const match = versionOutput.match(versionRegex);
    return match ? match[1] : versionOutput.split('\n')[0].trim();
  }

  getToolDescription(toolName) {
    const descriptions = {
      'git': 'Distributed version control system',
      'gh': 'GitHub CLI for repository management', 
      'node': 'JavaScript runtime environment',
      'npm': 'Node.js package manager',
      'python': 'Python programming language',
      'pip': 'Python package manager',
      'docker': 'Container platform',
      'brew': 'macOS package manager',
      'code': 'Visual Studio Code editor',
      'curl': 'HTTP client for API testing',
      'jq': 'JSON processor for CLI'
    };
    return descriptions[toolName] || `${toolName} development tool`;
  }

  detectCategoryOverlaps(tools) {
    const overlaps = [];
    const categoryGroups = {};

    // Group tools by category
    tools.forEach(tool => {
      const category = tool.metadata?.category;
      if (category) {
        if (!categoryGroups[category]) categoryGroups[category] = [];
        categoryGroups[category].push(tool.name);
      }
    });

    // Detect overlaps within categories
    Object.entries(categoryGroups).forEach(([category, toolList]) => {
      if (toolList.length > 1) {
        overlaps.push({
          category: category,
          tools: toolList,
          suggestion: this.getOverlapSuggestion(category, toolList),
          severity: this.getOverlapSeverity(category, toolList)
        });
      }
    });

    return overlaps;
  }

  deduplicateTools(tools) {
    const deduplicatedData = [];
    const seenTools = new Map();
    
    tools.forEach(tool => {
      const key = tool.name.toLowerCase();
      
      if (!seenTools.has(key)) {
        // First occurrence - add it
        seenTools.set(key, tool);
        deduplicatedData.push(tool);
      } else {
        // Duplicate detected - merge categories if possible
        const existing = seenTools.get(key);
        if (tool.metadata?.category && existing.metadata?.category) {
          // Merge categories into a combined string
          const categories = [existing.metadata.category, tool.metadata.category];
          const uniqueCategories = [...new Set(categories)];
          existing.metadata.category = uniqueCategories.join(', ');
        }
      }
    });
    
    return deduplicatedData;
  }

  getOverlapSuggestion(category, tools) {
    switch (category) {
      case 'package-manager':
        return `Multiple package managers detected: ${tools.join(', ')}. Consider standardizing on primary manager.`;
      case 'version-control':
        return `Multiple Git tools: ${tools.join(', ')}. 'gh' provides most functionality of other tools.`;
      case 'ai-assistant':
        return `Multiple AI assistants: ${tools.join(', ')}. May conflict - consider choosing primary.`;
      default:
        return `Multiple ${category} tools: ${tools.join(', ')}. Review for functional overlap.`;
    }
  }

  getOverlapSeverity(category, tools) {
    switch (category) {
      case 'ai-assistant':
        return 'warning'; // AI assistants may conflict
      case 'package-manager':
        return 'info'; // Multiple package managers often needed
      default:
        return 'info';
    }
  }
}