/**
 * Enhanced Context Generator - Visible files with CLAUDE.md integration
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { dirname, join, resolve } from 'path';

export class EnhancedContextGenerator {
  constructor() {
    this.defaultOutputDir = 'tools';
    this.toolsSection = '## 🔧 AVAILABLE TOOLS (Auto-Generated)';
    this.claudeSection = '## 📋 CLAUDE CONTEXT (Auto-Generated)';
  }

  async generateToolFiles(scanResults, options = {}) {
    const outputDir = options.outputDir || this.defaultOutputDir;
    const timestamp = new Date().toISOString();
    
    // Ensure output directory exists
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }

    const files = {
      inventory: join(outputDir, 'TOOL-INVENTORY.md'),
      summary: join(outputDir, 'tool-summary.json'),
      claudeContext: join(outputDir, 'claude-tools-context.md'),
      conversationStarter: join(outputDir, 'conversation-starter.md')
    };

    // Generate all files
    const inventory = this.buildToolInventory(scanResults, timestamp);
    const summary = this.buildToolSummary(scanResults, timestamp);
    const claudeContext = this.buildClaudeContext(scanResults, timestamp);
    const starter = this.buildConversationStarter(scanResults, timestamp);

    // Write files
    writeFileSync(files.inventory, inventory, 'utf8');
    writeFileSync(files.summary, JSON.stringify(summary, null, 2), 'utf8');
    writeFileSync(files.claudeContext, claudeContext, 'utf8');
    writeFileSync(files.conversationStarter, starter, 'utf8');

    console.log(`📁 Generated tool files in ${outputDir}/:`);
    Object.entries(files).forEach(([type, path]) => {
      console.log(`   • ${type}: ${path}`);
    });

    return { files, content: { inventory, summary, claudeContext, starter } };
  }

  async findClaudeMdFiles(startDir = process.cwd()) {
    const claudeFiles = [];
    const checkDirs = [startDir];
    
    // Add parent directories
    let current = resolve(startDir);
    for (let i = 0; i < 3; i++) {
      const parent = dirname(current);
      if (parent !== current) {
        checkDirs.push(parent);
        current = parent;
      }
    }

    // Check each directory for CLAUDE.md
    for (const dir of checkDirs) {
      const claudePath = join(dir, 'CLAUDE.md');
      if (existsSync(claudePath)) {
        claudeFiles.push({
          path: claudePath,
          dir: dir,
          relative: dir === startDir ? 'current' : 'parent'
        });
      }
    }

    return claudeFiles;
  }

  async integrateWithClaudeMd(scanResults, options = {}) {
    const claudeFiles = await this.findClaudeMdFiles(options.startDir);
    
    if (claudeFiles.length === 0) {
      console.log('❌ No CLAUDE.md files found');
      return { integrated: false, reason: 'no-files-found' };
    }

    // Use first found file or user-specified
    const targetFile = options.claudeFile || claudeFiles[0];
    console.log(`🎯 Integrating with: ${targetFile.path}`);

    try {
      const content = readFileSync(targetFile.path, 'utf8');
      const updatedContent = this.updateClaudeContent(content, scanResults);
      
      // Create backup
      const backupPath = targetFile.path + '.backup-' + Date.now();
      writeFileSync(backupPath, content, 'utf8');
      
      // Write updated content
      writeFileSync(targetFile.path, updatedContent, 'utf8');
      
      console.log(`✅ Updated CLAUDE.md with tool inventory`);
      console.log(`📄 Backup saved: ${backupPath}`);
      
      return { 
        integrated: true, 
        targetFile: targetFile.path, 
        backupFile: backupPath 
      };
    } catch (error) {
      console.error(`❌ Error integrating with CLAUDE.md:`, error.message);
      return { integrated: false, reason: 'integration-error', error };
    }
  }

  updateClaudeContent(existingContent, scanResults) {
    const toolsContent = this.buildToolsSection(scanResults);
    const claudeContent = this.buildClaudeSection(scanResults);
    
    // Remove existing auto-generated sections
    let updated = existingContent
      .replace(new RegExp(`${this.toolsSection}[\\s\\S]*?(?=##|$)`, 'g'), '')
      .replace(new RegExp(`${this.claudeSection}[\\s\\S]*?(?=##|$)`, 'g'), '');

    // Add new sections at the end
    updated += `\n\n${this.toolsSection}\n\n${toolsContent}`;
    updated += `\n\n${this.claudeSection}\n\n${claudeContent}`;

    // Clean up multiple newlines
    updated = updated.replace(/\n{3,}/g, '\n\n');
    
    return updated;
  }

  buildToolInventory(scanResults, timestamp) {
    const summary = this.calculateSummary(scanResults);
    
    return `# Tool Inventory Report

**Generated:** ${timestamp}  
**Scan Duration:** ${scanResults.scanDuration}ms  
**Platform:** ${scanResults.environment?.platform || 'unknown'}

## Summary

- **Total Tools:** ${summary.total}
- **Active/Available:** ${summary.active}
- **Warnings:** ${summary.warnings}
- **Errors:** ${summary.errors}

${this.buildCategoryBreakdown(scanResults)}

## Detailed Tool List

${this.buildDetailedInventory(scanResults)}

## Integration Notes

This report is generated by CTDiscovery and can be:
- Integrated into CLAUDE.md for Claude awareness
- Used as reference for development environment setup
- Shared with team members for environment consistency
- Automated in CI/CD for environment validation

**Refresh:** Run \`ctd --integrate-claude\` to update with current status.

---
*Generated by CTDiscovery - AI Development Environment Scanner*
`;
  }

  buildToolsSection(scanResults) {
    const summary = this.calculateSummary(scanResults);
    
    return `**Status:** ${summary.active}/${summary.total} tools active | Updated: ${new Date().toISOString().split('T')[0]}

${this.buildQuickToolList(scanResults)}

**Full Details:** See \`tools/TOOL-INVENTORY.md\` | **Refresh:** \`ctd --integrate-claude\``;
  }

  buildClaudeSection(scanResults) {
    return `**Claude Tool Awareness Context:**

${this.buildAIRelevantTools(scanResults)}

**Capabilities Available:**
${this.buildCapabilitiesList(scanResults)}

**Usage:** Reference this section when asking Claude about available tools and capabilities.`;
  }

  buildQuickToolList(scanResults) {
    const sections = [];
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const activeTools = result.data.filter(tool => 
        tool.status === 'active' || tool.status === 'available'
      );
      
      if (activeTools.length > 0) {
        const categoryName = this.formatCategoryName(category);
        const toolNames = activeTools.slice(0, 5).map(t => t.name).join(', ');
        const more = activeTools.length > 5 ? ` (+${activeTools.length - 5} more)` : '';
        sections.push(`• **${categoryName}:** ${toolNames}${more}`);
      }
    });
    
    return sections.join('\n');
  }

  buildAIRelevantTools(scanResults) {
    const aiTools = [];
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        if (this.isAIRelevant(tool) && (tool.status === 'active' || tool.status === 'available')) {
          aiTools.push(`• **${tool.name}** - ${tool.metadata?.description || 'Development tool'}`);
        }
      });
    });
    
    return aiTools.slice(0, 10).join('\n') + 
           (aiTools.length > 10 ? `\n• *...and ${aiTools.length - 10} more tools*` : '');
  }

  buildCapabilitiesList(scanResults) {
    const capabilities = new Set();
    
    Object.values(scanResults.status).forEach(result => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        if (tool.status === 'active' || tool.status === 'available') {
          if (tool.metadata?.capabilities) {
            const caps = Array.isArray(tool.metadata.capabilities) 
              ? tool.metadata.capabilities 
              : [tool.metadata.capabilities];
            caps.forEach(cap => capabilities.add(cap));
          }
        }
      });
    });
    
    return Array.from(capabilities).slice(0, 15).map(cap => `• ${cap}`).join('\n');
  }

  buildConversationStarter(scanResults, timestamp) {
    const summary = this.calculateSummary(scanResults);
    
    return `# Claude Conversation Starter

**Development Environment Status - ${timestamp.split('T')[0]}**

## Quick Status
🟢 **${summary.active} active tools** | 🔧 **${summary.total} total** | ⚠️ **${summary.warnings} warnings**

## Key Capabilities Available
${this.buildAIRelevantTools(scanResults)}

## Ready for Development
- **Languages:** ${this.getLanguages(scanResults).join(', ')}
- **Build Tools:** ${this.getBuildTools(scanResults).join(', ')}
- **Version Control:** ${this.getVersionControl(scanResults).join(', ')}

**Context:** Copy this into Claude conversations to provide current tool awareness.
**Refresh:** Run \`ctd --conversation-starter\` for updated context.

---
*This environment is ready for AI-assisted development*
`;
  }

  // Helper methods
  calculateSummary(scanResults) {
    let total = 0, active = 0, warnings = 0, errors = 0;
    
    Object.values(scanResults.status).forEach(result => {
      if (result.data) {
        total += result.data.length;
        active += result.data.filter(t => t.status === 'active' || t.status === 'available').length;
      }
      warnings += (result.warnings?.length || 0);
      errors += (result.errors?.length || 0);
    });
    
    return { total, active, warnings, errors };
  }

  formatCategoryName(category) {
    return category.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace('Mcp-server', 'MCP Servers')
                  .replace('System-tool', 'System Tools');
  }

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

  getLanguages(scanResults) {
    return this.getToolsByCategory(scanResults, 'language').slice(0, 5);
  }

  getBuildTools(scanResults) {
    return this.getToolsByCategory(scanResults, 'build-tool').slice(0, 5);
  }

  getVersionControl(scanResults) {
    return this.getToolsByCategory(scanResults, 'version-control').slice(0, 3);
  }

  getToolsByCategory(scanResults, targetCategory) {
    const tools = [];
    
    Object.values(scanResults.status).forEach(result => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        if (tool.metadata?.category === targetCategory && 
            (tool.status === 'active' || tool.status === 'available')) {
          tools.push(tool.name);
        }
      });
    });
    
    return tools;
  }

  buildCategoryBreakdown(scanResults) {
    const sections = ['## Categories\n'];
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const active = result.data.filter(t => t.status === 'active' || t.status === 'available').length;
      const total = result.data.length;
      const categoryName = this.formatCategoryName(category);
      
      sections.push(`- **${categoryName}:** ${active}/${total} active`);
    });
    
    return sections.join('\n');
  }

  buildDetailedInventory(scanResults) {
    const sections = [];
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const categoryName = this.formatCategoryName(category);
      sections.push(`### ${categoryName}\n`);
      
      result.data.forEach(tool => {
        const status = tool.status === 'active' || tool.status === 'available' ? '✅' : '❌';
        const version = tool.metadata?.version ? ` (v${tool.metadata.version})` : '';
        const description = tool.metadata?.description ? ` - ${tool.metadata.description}` : '';
        
        sections.push(`- ${status} **${tool.name}**${version}${description}`);
      });
      
      sections.push(''); // Empty line between categories
    });
    
    return sections.join('\n');
  }

  buildToolSummary(scanResults, timestamp) {
    return {
      timestamp,
      scanDuration: scanResults.scanDuration,
      platform: scanResults.environment?.platform,
      summary: this.calculateSummary(scanResults),
      categories: this.buildCategorySummary(scanResults),
      aiRelevantTools: this.buildAIToolsSummary(scanResults),
      capabilities: Array.from(this.getAllCapabilities(scanResults))
    };
  }

  buildCategorySummary(scanResults) {
    const categories = {};
    
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data) return;
      
      categories[category] = {
        total: result.data.length,
        active: result.data.filter(t => t.status === 'active' || t.status === 'available').length,
        tools: result.data.map(tool => ({
          name: tool.name,
          status: tool.status,
          version: tool.metadata?.version,
          capabilities: tool.metadata?.capabilities
        }))
      };
    });
    
    return categories;
  }

  buildAIToolsSummary(scanResults) {
    const aiTools = [];
    
    Object.values(scanResults.status).forEach(result => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        if (this.isAIRelevant(tool) && (tool.status === 'active' || tool.status === 'available')) {
          aiTools.push({
            name: tool.name,
            category: tool.metadata?.category,
            description: tool.metadata?.description,
            capabilities: tool.metadata?.capabilities
          });
        }
      });
    });
    
    return aiTools;
  }

  getAllCapabilities(scanResults) {
    const capabilities = new Set();
    
    Object.values(scanResults.status).forEach(result => {
      if (!result.data) return;
      
      result.data.forEach(tool => {
        if (tool.metadata?.capabilities) {
          const caps = Array.isArray(tool.metadata.capabilities) 
            ? tool.metadata.capabilities 
            : [tool.metadata.capabilities];
          caps.forEach(cap => capabilities.add(cap));
        }
      });
    });
    
    return capabilities;
  }

  buildClaudeContext(scanResults, timestamp) {
    return `# Claude Tools Context

**Generated for Claude Code Integration**
**Timestamp:** ${timestamp}

## Current Tool Availability

${this.buildAIRelevantTools(scanResults)}

## Development Capabilities

${this.buildCapabilitiesList(scanResults)}

## Usage Instructions

This context provides Claude with awareness of currently available development tools and capabilities. Reference specific tools when asking for help with:

- Code development and testing
- Build and deployment tasks  
- Version control operations
- Environment setup and configuration

**Note:** This file is auto-generated. For human-readable format, see TOOL-INVENTORY.md

---
*Auto-generated by CTDiscovery for Claude integration*
`;
  }
}