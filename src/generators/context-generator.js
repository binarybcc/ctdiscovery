/**
 * Context File Generator - Creates Claude-readable tool context
 * Implements "Option A" conversation starter strategy
 */

import { writeFileSync, existsSync } from 'fs';
import path from 'path';

export class ContextGenerator {
  constructor() {
    this.outputPath = '.ctdiscovery-context.md';
    this.conversationStarterPath = '.ctdiscovery-conversation-starter.txt';
  }

  /**
   * Generate comprehensive context file for Claude reference
   */
  generateContextFile(scanResults, options = {}) {
    const content = this.buildContextContent(scanResults, options);
    
    const outputFile = options.outputPath || this.outputPath;
    writeFileSync(outputFile, content, 'utf8');
    
    console.log(`📄 Generated context file: ${outputFile}`);
    return outputFile;
  }

  /**
   * Generate conversation starter summary
   */
  generateConversationStarter(scanResults, options = {}) {
    const starter = this.buildConversationStarter(scanResults, options);
    
    const outputFile = options.outputPath || this.conversationStarterPath;
    writeFileSync(outputFile, starter, 'utf8');
    
    console.log(`💬 Generated conversation starter: ${outputFile}`);
    return starter;
  }

  /**
   * Build comprehensive context content
   */
  buildContextContent(scanResults, options) {
    const timestamp = new Date().toISOString();
    const summary = this.generateToolSummary(scanResults);
    
    return `# CTDiscovery Tool Context

**Generated:** ${timestamp}
**Scan Duration:** ${scanResults.scanDuration}ms
**Platform:** ${scanResults.environment.platform}

## Quick Status Summary

${this.generateStatusBadges(summary)}

## Available Tools by Category

${this.generateToolsByCategory(scanResults)}

## Tool Details

${this.generateDetailedToolList(scanResults)}

## Performance & Issues

${this.generatePerformanceSection(scanResults)}

## Configuration

${this.generateConfigurationSection(scanResults)}

---

**For Claude:** This file contains current tool availability. Reference sections as needed for task-relevant tools.

**For Developer:** Run \`npm run scan\` to refresh this context when tools change.
`;
  }

  /**
   * Build conversation starter summary
   */
  buildConversationStarter(scanResults, options) {
    const summary = this.generateToolSummary(scanResults);
    const aiRelevantTools = this.extractAIRelevantTools(scanResults);
    const recentChanges = this.detectRecentChanges(scanResults);
    
    return `## Current Development Environment - ${new Date().toISOString().split('T')[0]}

**Quick Tool Status:** ${this.generateStatusBadges(summary, true)}

### AI-Relevant Tools Available:
${aiRelevantTools.map(tool => `- **${tool.category}:** ${tool.tools.join(', ')}`).join('\n')}

### Recent Changes:
${recentChanges.length > 0 ? recentChanges.join('\n') : '- No recent changes detected'}

### Key Capabilities:
- **Web Research:** WebFetch, Firecrawl search/scraping
- **Development:** ${summary.languages.join(', ')} environments
- **Build/Test:** ${summary.buildTools.join(', ')}
- **Containers:** ${summary.containers.length > 0 ? summary.containers.join(', ') : 'Not available'}

**Full details:** See .ctdiscovery-context.md | **Refresh:** Run \`tools\` command

---
*Copy this into conversations to give Claude current tool awareness*`;
  }

  /**
   * Generate tool summary statistics
   */
  generateToolSummary(scanResults) {
    const summary = {
      total: 0,
      active: 0,
      warnings: 0,
      errors: 0,
      categories: {},
      aiRelevant: [],
      languages: [],
      buildTools: [],
      containers: []
    };

    // Process each scanner result
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        summary.total++;
        
        if (tool.status === 'active' || tool.status === 'available') {
          summary.active++;
        }
        
        if (tool.metadata?.category) {
          const cat = tool.metadata.category;
          summary.categories[cat] = (summary.categories[cat] || 0) + 1;
          
          // Categorize for conversation starter
          if (cat === 'language') summary.languages.push(tool.name);
          if (cat === 'build-tool') summary.buildTools.push(tool.name);
          if (['docker', 'podman', 'orbstack'].includes(tool.name)) summary.containers.push(tool.name);
        }
        
        if (this.isAIRelevant(tool)) {
          summary.aiRelevant.push(tool);
        }
      });
      
      // Count warnings and errors
      if (result.warnings) summary.warnings += result.warnings.length;
      if (result.errors) summary.errors += result.errors.length;
    });

    return summary;
  }

  /**
   * Generate status badges
   */
  generateStatusBadges(summary, inline = false) {
    const active = `🟢 ${summary.active} active tools`;
    const warnings = summary.warnings > 0 ? `🟡 ${summary.warnings} warnings` : '';
    const errors = summary.errors > 0 ? `🔴 ${summary.errors} critical` : `🔴 0 critical`;
    
    const badges = [active, warnings, errors].filter(Boolean);
    return inline ? badges.join(' | ') : badges.join('\n\n');
  }

  /**
   * Generate tools by category section
   */
  generateToolsByCategory(scanResults) {
    const sections = [];
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const categoryTitle = category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
      sections.push(`### ${categoryTitle}`);
      
      // Group by status
      const byStatus = {};
      result.data.forEach(tool => {
        const status = tool.status || 'unknown';
        if (!byStatus[status]) byStatus[status] = [];
        byStatus[status].push(tool);
      });
      
      Object.entries(byStatus).forEach(([status, tools]) => {
        const icon = this.getStatusIcon(status);
        sections.push(`**${icon} ${status.toUpperCase()}:**`);
        tools.forEach(tool => {
          const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
          const description = tool.metadata?.description ? ` - ${tool.metadata.description}` : '';
          sections.push(`  - ${tool.name}${version}${description}`);
        });
      });
      
      sections.push(''); // Empty line
    });
    
    return sections.join('\n');
  }

  /**
   * Generate detailed tool list
   */
  generateDetailedToolList(scanResults) {
    const details = [];
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      result.data.forEach(tool => {
        if (this.isAIRelevant(tool) || tool.metadata?.capabilities) {
          details.push(`#### ${tool.name}`);
          details.push(`- **Status:** ${tool.status}`);
          details.push(`- **Category:** ${tool.metadata?.category || 'unknown'}`);
          
          if (tool.metadata?.capabilities) {
            details.push(`- **Capabilities:** ${Array.isArray(tool.metadata.capabilities) 
              ? tool.metadata.capabilities.join(', ') 
              : tool.metadata.capabilities}`);
          }
          
          if (tool.metadata?.path) {
            details.push(`- **Location:** ${tool.metadata.path}`);
          }
          
          details.push('');
        }
      });
    });
    
    return details.join('\n');
  }

  /**
   * Generate performance section
   */
  generatePerformanceSection(scanResults) {
    const sections = [];
    
    if (scanResults.metrics?.performance) {
      const perf = scanResults.metrics.performance;
      sections.push(`**Scan Performance:**`);
      sections.push(`- Total Duration: ${perf.totalDuration}ms`);
      sections.push(`- Tools Detected: ${perf.toolsDetected}`);
      sections.push(`- Scanners Completed: ${perf.scannersCompleted}`);
      sections.push('');
    }
    
    if (scanResults.degradation?.hasIssues) {
      sections.push(`**Issues Detected:**`);
      scanResults.degradation.userMessages.forEach(msg => {
        sections.push(`- ${msg.severity.toUpperCase()}: ${msg.message}`);
      });
      sections.push('');
    }
    
    return sections.join('\n');
  }

  /**
   * Generate configuration section
   */
  generateConfigurationSection(scanResults) {
    const sections = [];
    
    if (scanResults.status.claudeCode) {
      const cc = scanResults.status.claudeCode;
      sections.push(`**Claude Code Integration:**`);
      sections.push(`- Configuration: ${cc.configPresent ? '✅ Present' : '❌ Missing'}`);
      sections.push(`- Documentation: ${cc.documentationPresent ? '✅ Present' : '❌ Missing'}`);
      
      if (cc.permissions) {
        sections.push(`- Permissions: ${cc.permissions.allowCount} allowed, ${cc.permissions.denyCount} denied`);
        sections.push(`- Git Access: ${cc.permissions.hasGitAccess ? '✅' : '❌'}`);
        sections.push(`- Node Access: ${cc.permissions.hasNodeAccess ? '✅' : '❌'}`);
      }
    }
    
    return sections.join('\n');
  }

  /**
   * Extract AI-relevant tools for conversation starter
   */
  extractAIRelevantTools(scanResults) {
    const aiTools = {};
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        if (this.isAIRelevant(tool)) {
          const toolCategory = this.getAIToolCategory(tool);
          if (!aiTools[toolCategory]) aiTools[toolCategory] = [];
          aiTools[toolCategory].push(tool.name);
        }
      });
    });
    
    return Object.entries(aiTools).map(([category, tools]) => ({
      category,
      tools: tools.slice(0, 5) // Limit to 5 per category for brevity
    }));
  }

  /**
   * Detect recent changes (placeholder for future implementation)
   */
  detectRecentChanges(scanResults) {
    // TODO: Compare with previous scan results
    return ['- No change detection implemented yet'];
  }

  /**
   * Check if tool is AI-relevant
   */
  isAIRelevant(tool) {
    const aiKeywords = [
      'ai', 'claude', 'copilot', 'assistant', 'gpt', 'openai',
      'mcp', 'context', 'git', 'node', 'python', 'docker',
      'build', 'test', 'deploy', 'web', 'api'
    ];
    
    const searchText = [
      tool.name,
      tool.metadata?.description,
      tool.metadata?.category,
      ...(tool.metadata?.capabilities || [])
    ].join(' ').toLowerCase();
    
    return aiKeywords.some(keyword => searchText.includes(keyword));
  }

  /**
   * Get AI tool category for organization
   */
  getAIToolCategory(tool) {
    const name = tool.name.toLowerCase();
    const category = tool.metadata?.category;
    
    if (name.includes('mcp') || name.includes('context')) return 'MCP Servers';
    if (category === 'ai-assistant' || name.includes('copilot') || name.includes('claude')) return 'AI Assistants';
    if (category === 'version-control' || name.includes('git')) return 'Version Control';
    if (category === 'language' || ['node', 'python', 'go', 'rust'].includes(name)) return 'Languages';
    if (category === 'build-tool' || name.includes('docker')) return 'Build Tools';
    
    return 'Development Tools';
  }

  /**
   * Get status icon
   */
  getStatusIcon(status) {
    const icons = {
      'active': '✅',
      'available': '🟢',
      'detected': '🔵',
      'missing': '❌',
      'error': '🔴',
      'timeout': '⏰'
    };
    return icons[status] || '❓';
  }
}