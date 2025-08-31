import { DuplicationDetector } from '../utils/duplication-detector.js';

export class StatusDisplay {
  constructor() {
    this.duplicationDetector = new DuplicationDetector();
    this.colors = {
      active: '\x1b[32m',    // Green
      available: '\x1b[33m', // Yellow  
      missing: '\x1b[31m',   // Red
      error: '\x1b[35m',     // Magenta
      info: '\x1b[36m',      // Cyan
      warning: '\x1b[93m',   // Bright Yellow
      reset: '\x1b[0m'       // Reset
    };
  }

  render(scanResults, options = {}) {
    if (options.json) {
      return this.renderJSON(scanResults);
    }

    console.log(this.renderHeader(scanResults));
    console.log(this.renderEnvironmentInfo(scanResults.environment));
    console.log(this.renderToolStatus(scanResults.status));
    
    // Detect and display overlaps
    const overlapAnalysis = this.duplicationDetector.detectAllOverlaps(scanResults.status);
    if (overlapAnalysis.overlaps.length > 0) {
      console.log(this.renderOverlaps(overlapAnalysis));
    }

    console.log(this.renderSummary(scanResults, overlapAnalysis));
    
    if (options.verbose) {
      console.log(this.renderDetailedInfo(scanResults));
    }
  }

  renderHeader(scanResults) {
    const duration = scanResults.scanDuration || 0;
    return `
🔍 ${this.colors.info}CTDiscovery Status Report${this.colors.reset}
📅 ${scanResults.timestamp}
⚡ Scan completed in ${duration}ms
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
  }

  renderEnvironmentInfo(env) {
    return `
🖥️  ${this.colors.info}Environment${this.colors.reset}
   Platform: ${env.platform}
   Node.js: ${env.nodeVersion}
   Directory: ${env.workingDirectory}`;
  }

  renderToolStatus(status) {
    let output = `\n📦 ${this.colors.info}Tool Status${this.colors.reset}\n`;

    // MCP Servers
    if (status.mcp) {
      output += this.renderSection('MCP Servers', status.mcp);
    }

    // VSCode Extensions
    if (status.vscode) {
      output += this.renderSection('VSCode Extensions', status.vscode);
    }

    // System Tools
    if (status.systemTools) {
      output += this.renderSection('System Tools', status.systemTools);
    }

    // Claude Code
    if (status.claudeCode) {
      output += this.renderClaudeCodeSection(status.claudeCode);
    }

    return output;
  }

  renderSection(sectionName, sectionData) {
    let output = `\n   ${this.colors.info}${sectionName}:${this.colors.reset}\n`;
    
    if (sectionData.status === 'failed') {
      output += `      ${this.colors.error}✖ Scan failed${this.colors.reset}\n`;
      if (sectionData.errors?.length > 0) {
        output += `      Errors: ${sectionData.errors.join(', ')}\n`;
      }
      return output;
    }

    if (sectionData.data && sectionData.data.length > 0) {
      // Group by status for better display
      const byStatus = {};
      sectionData.data.forEach(tool => {
        const status = tool.status || 'unknown';
        if (!byStatus[status]) byStatus[status] = [];
        byStatus[status].push(tool);
      });

      Object.entries(byStatus).forEach(([status, tools]) => {
        const statusColor = this.colors[status] || this.colors.reset;
        const statusIcon = this.getStatusIcon(status);
        
        output += `      ${statusColor}${statusIcon} ${status.toUpperCase()}${this.colors.reset}\n`;
        tools.forEach(tool => {
          const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
          output += `         • ${tool.name}${version}\n`;
        });
      });
    } else {
      output += `      ${this.colors.warning}⚠ No tools detected${this.colors.reset}\n`;
    }

    if (sectionData.warnings?.length > 0) {
      output += `      ${this.colors.warning}⚠ Warnings: ${sectionData.warnings.length}${this.colors.reset}\n`;
    }

    return output;
  }

  renderClaudeCodeSection(claudeData) {
    let output = `\n   ${this.colors.info}Claude Code Configuration:${this.colors.reset}\n`;
    
    const configIcon = claudeData.configPresent ? '✅' : '❌';
    const docsIcon = claudeData.documentationPresent ? '✅' : '❌';
    
    output += `      ${configIcon} Configuration: ${claudeData.configPresent ? 'Present' : 'Missing'}\n`;
    output += `      ${docsIcon} Documentation: ${claudeData.documentationPresent ? 'Present' : 'Missing'}\n`;
    
    if (claudeData.permissions) {
      output += `      🔑 Permissions: ${claudeData.permissions.allowCount} allowed, ${claudeData.permissions.denyCount} denied\n`;
      
      const gitAccess = claudeData.permissions.hasGitAccess ? '✅' : '❌';
      const nodeAccess = claudeData.permissions.hasNodeAccess ? '✅' : '❌';
      output += `         Git Access: ${gitAccess}, Node Access: ${nodeAccess}\n`;
    }

    return output;
  }

  renderOverlaps(overlapAnalysis) {
    let output = `\n🔄 ${this.colors.warning}Tool Overlaps Detected${this.colors.reset}\n`;
    
    const { overlaps, summary } = overlapAnalysis;
    
    // Show summary
    output += `   Found ${summary.total} potential overlaps\n`;
    if (summary.bySeverity.warning > 0) {
      output += `   ${this.colors.warning}⚠ ${summary.bySeverity.warning} may cause conflicts${this.colors.reset}\n`;
    }

    // Show each overlap
    overlaps.forEach(overlap => {
      const severityColor = overlap.severity === 'warning' ? this.colors.warning : this.colors.info;
      const severityIcon = overlap.severity === 'warning' ? '⚠' : 'ℹ';
      
      output += `\n   ${severityColor}${severityIcon} ${overlap.category}${this.colors.reset}\n`;
      output += `      Tools: ${overlap.tools.join(', ')}\n`;
      output += `      ${overlap.message}\n`;
      output += `      💡 ${overlap.recommendation}\n`;
    });

    return output;
  }

  renderSummary(scanResults, overlapAnalysis) {
    const totalTools = this.countTotalTools(scanResults.status);
    const activeTools = this.countActiveTools(scanResults.status);
    const issueCount = this.countIssues(scanResults.status) + (overlapAnalysis?.summary?.bySeverity?.warning || 0);

    let output = `\n📊 ${this.colors.info}Summary${this.colors.reset}\n`;
    output += `   ${this.colors.active}${activeTools} active${this.colors.reset} • `;
    output += `${totalTools} total tools detected\n`;
    
    if (issueCount > 0) {
      output += `   ${this.colors.warning}⚠ ${issueCount} issues requiring attention${this.colors.reset}\n`;
    } else {
      output += `   ${this.colors.active}✅ Environment looks good!${this.colors.reset}\n`;
    }

    return output;
  }

  renderJSON(scanResults) {
    console.log(JSON.stringify(scanResults, null, 2));
  }

  renderDetailedInfo(scanResults) {
    let output = `\n🔍 ${this.colors.info}Detailed Information${this.colors.reset}\n`;
    
    Object.entries(scanResults.status).forEach(([sectionName, sectionData]) => {
      if (sectionData.method) {
        output += `   ${sectionName}: ${sectionData.method.status} (${sectionData.method.duration}ms)\n`;
      }
    });

    return output;
  }

  getStatusIcon(status) {
    const icons = {
      'active': '●',
      'available': '●', 
      'detected': '●',
      'missing': '○',
      'error': '✖',
      'partial': '◐'
    };
    return icons[status] || '?';
  }

  countTotalTools(status) {
    let total = 0;
    Object.values(status).forEach(section => {
      if (section.data && Array.isArray(section.data)) {
        total += section.data.length;
      }
      if (section.installed && Array.isArray(section.installed)) {
        total += section.installed.length;
      }
    });
    return total;
  }

  countActiveTools(status) {
    let active = 0;
    Object.values(status).forEach(section => {
      if (section.data && Array.isArray(section.data)) {
        active += section.data.filter(tool => tool.status === 'active').length;
      }
      if (section.installed && Array.isArray(section.installed)) {
        active += section.installed.length; // VSCode extensions are active if installed
      }
    });
    return active;
  }

  countIssues(status) {
    let issues = 0;
    Object.values(status).forEach(section => {
      if (section.errors && Array.isArray(section.errors)) {
        issues += section.errors.length;
      }
      if (section.warnings && Array.isArray(section.warnings)) {
        issues += section.warnings.length;
      }
    });
    return issues;
  }
}