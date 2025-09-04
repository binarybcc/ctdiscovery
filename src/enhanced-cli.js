#!/usr/bin/env node

import { EnvironmentScanner } from './scanners/environment-scanner.js';
import { StatusDisplay } from './display/status-display.js';
import { EnhancedContextGenerator } from './generators/enhanced-context-generator.js';
// import { readlineSync } from 'readline-sync'; // For user prompts - TODO: add dependency
import { existsSync } from 'fs';

class EnhancedCTDiscovery {
  constructor() {
    this.scanner = new EnvironmentScanner();
    this.display = new StatusDisplay();
    this.contextGenerator = new EnhancedContextGenerator();
  }

  async run(options = {}) {
    console.log('🔍 CTDiscovery - AI Development Environment Status\n');
    
    try {
      const status = await this.scanner.scan();
      
      // Always show dashboard unless specifically quiet
      if (!options.suppressDashboard) {
        this.displayDiscoveryDashboard(status);
      }
      
      // Handle different output modes
      if (options.integrateClaudeMd) {
        await this.handleClaudeMdIntegration(status, options);
      } else if (options.generateFiles) {
        await this.handleFileGeneration(status, options);
      } else if (options.conversationStarter) {
        await this.handleConversationStarter(status, options);
      } else if (options.interactive) {
        await this.handleInteractiveMode(status, options);
      }
      
      // Show detailed output if requested
      if (options.verbose && !options.quiet) {
        console.log('');
        this.display.render(status, options);
      }
      
    } catch (error) {
      console.error('❌ Error scanning environment:', error.message);
      process.exit(1);
    }
  }

  async handleInteractiveMode(status, options) {
    console.log('\n🤖 CTDiscovery Interactive Mode');
    console.log('What would you like to do with the tool scan results?\n');
    
    const choices = [
      '1. Generate tool files in ./tools/ directory',
      '2. Integrate with CLAUDE.md (auto-find and update)',
      '3. Create conversation starter for Claude',
      '4. Generate all outputs',
      '5. Custom output directory',
      '6. Just show dashboard (already shown)'
    ];
    
    choices.forEach(choice => console.log(choice));
    
    // Simulate readline (in real implementation, use actual readline)
    console.log('\nEnter your choice (1-6): ');
    // For now, default to option 4 (generate all)
    const choice = '4';
    
    switch(choice) {
      case '1':
        await this.handleFileGeneration(status, options);
        break;
      case '2':
        await this.handleClaudeMdIntegration(status, options);
        break;
      case '3':
        await this.handleConversationStarter(status, options);
        break;
      case '4':
        await this.handleFileGeneration(status, options);
        await this.handleConversationStarter(status, { ...options, showOutput: true });
        await this.offerClaudeMdIntegration(status, options);
        break;
      case '5':
        console.log('Enter custom output directory: ');
        // const customDir = readline input
        await this.handleFileGeneration(status, { ...options, outputDir: 'custom-tools' });
        break;
      default:
        console.log('Dashboard shown above. Run with specific flags for file generation.');
    }
  }

  async handleFileGeneration(status, options) {
    console.log('\n📁 Generating tool files...');
    
    const result = await this.contextGenerator.generateToolFiles(status, {
      outputDir: options.outputDir || 'tools'
    });
    
    console.log('\n✅ Generated files:');
    console.log(`   📋 Tool Inventory: ${result.files.inventory}`);
    console.log(`   📊 JSON Summary: ${result.files.summary}`);
    console.log(`   🤖 Claude Context: ${result.files.claudeContext}`);
    console.log(`   💬 Conversation Starter: ${result.files.conversationStarter}`);
    
    if (options.openFiles) {
      console.log('\n📂 Opening tool inventory file...');
      const { exec } = await import('child_process');
      exec(`open "${result.files.inventory}"`);
    }
    
    return result;
  }

  async handleClaudeMdIntegration(status, options) {
    console.log('\n🔍 Looking for CLAUDE.md files...');
    
    const claudeFiles = await this.contextGenerator.findClaudeMdFiles();
    
    if (claudeFiles.length === 0) {
      console.log('❌ No CLAUDE.md files found in current or parent directories');
      console.log('💡 Consider running with --generate-files to create standalone tool files');
      return;
    }
    
    if (claudeFiles.length > 1) {
      console.log('📄 Found multiple CLAUDE.md files:');
      claudeFiles.forEach((file, i) => {
        console.log(`   ${i + 1}. ${file.path} (${file.relative})`);
      });
      
      if (!options.claudeFile) {
        console.log(`🎯 Using first found: ${claudeFiles[0].path}`);
      }
    }
    
    const result = await this.contextGenerator.integrateWithClaudeMd(status, {
      startDir: options.startDir,
      claudeFile: options.claudeFile || claudeFiles[0]
    });
    
    if (result.integrated) {
      console.log('✅ CLAUDE.md updated with current tool inventory');
      console.log(`📄 Backup created: ${result.backupFile}`);
      console.log('\n💡 Your CLAUDE.md now includes:');
      console.log('   • 🔧 AVAILABLE TOOLS section (tool overview)');
      console.log('   • 📋 CLAUDE CONTEXT section (AI-optimized context)');
    } else {
      console.log(`❌ Failed to integrate: ${result.reason}`);
    }
    
    return result;
  }

  async handleConversationStarter(status, options) {
    console.log('\n💬 Generating conversation starter...');
    
    const result = await this.contextGenerator.generateToolFiles(status, {
      outputDir: options.outputDir || 'tools'
    });
    
    if (options.showOutput) {
      console.log('\n' + '='.repeat(60));
      console.log('📋 CONVERSATION STARTER FOR CLAUDE:');
      console.log('='.repeat(60));
      console.log(result.content.starter);
      console.log('='.repeat(60));
      console.log(`\n📄 Full starter saved to: ${result.files.conversationStarter}`);
    } else {
      console.log(`💬 Conversation starter saved to: ${result.files.conversationStarter}`);
    }
    
    return result;
  }

  async offerClaudeMdIntegration(status, options) {
    const claudeFiles = await this.contextGenerator.findClaudeMdFiles();
    
    if (claudeFiles.length > 0) {
      console.log('\n🔍 CLAUDE.md file(s) detected.');
      console.log('💡 Would you like to integrate the tool inventory? (Y/n)');
      
      // In real implementation, wait for user input
      // For now, assume yes
      const integrate = true;
      
      if (integrate) {
        await this.handleClaudeMdIntegration(status, options);
      }
    }
  }

  displayDiscoveryDashboard(scanResults) {
    console.log('🔍 TOOL DISCOVERY DASHBOARD');
    console.log('═'.repeat(50));
    
    const summary = this.calculateSummaryStats(scanResults);
    console.log(`📊 Scan: ${scanResults.scanDuration}ms | ${summary.total} tools | ${summary.active} active`);
    
    // Show key tool categories
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const categoryName = this.formatCategoryName(category);
      const activeCount = result.data.filter(t => t.status === 'active' || t.status === 'available').length;
      const statusIcon = activeCount > 0 ? '🟢' : '🔴';
      
      console.log(`${statusIcon} ${categoryName}: ${activeCount}/${result.data.length} active`);
    });
    
    if (summary.warnings > 0 || summary.errors > 0) {
      console.log(`⚠️  Issues: ${summary.warnings} warnings, ${summary.errors} errors`);
    }
    
    console.log('═'.repeat(50));
  }

  calculateSummaryStats(scanResults) {
    const summary = { total: 0, active: 0, warnings: 0, errors: 0 };
    
    Object.values(scanResults.status).forEach(result => {
      if (result.data) {
        summary.total += result.data.length;
        summary.active += result.data.filter(tool => 
          tool.status === 'active' || tool.status === 'available'
        ).length;
      }
      
      summary.warnings += (result.warnings?.length || 0);
      summary.errors += (result.errors?.length || 0);
    });
    
    return summary;
  }

  formatCategoryName(category) {
    return category.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase())
                  .replace('Mcp-server', 'MCP Servers')
                  .replace('System-tool', 'System Tools')
                  .replace('Vscode', 'VSCode');
  }
}

// Enhanced CLI argument parsing
const args = process.argv.slice(2);

if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
  console.log(`
🔍 CTDiscovery Enhanced - AI Development Environment Status

USAGE:
  ctd [options]                    # Interactive mode
  ctd --integrate-claude           # Auto-find and update CLAUDE.md
  ctd --generate-files             # Create tool files in ./tools/
  ctd --conversation-starter       # Show conversation starter
  ctd --all                        # Generate all outputs
  
INTEGRATION OPTIONS:
  --integrate-claude               # Find and update CLAUDE.md automatically
  --claude-file <path>             # Specify CLAUDE.md file to update
  --generate-files                 # Generate visible tool files
  --output-dir <dir>               # Custom output directory (default: tools)
  --conversation-starter           # Generate conversation starter
  --show-starter                   # Display starter in console
  
DISPLAY OPTIONS:
  --interactive                    # Show menu of options
  --verbose                        # Detailed scan information  
  --quiet                          # Suppress normal output
  --suppress-dashboard             # Don't show dashboard
  --open-files                     # Open generated files (macOS)

OUTPUT FILES:
  tools/TOOL-INVENTORY.md          # Human-readable tool report
  tools/tool-summary.json          # Machine-readable data
  tools/claude-tools-context.md    # Claude-optimized context
  tools/conversation-starter.md    # Ready-to-paste conversation starter

EXAMPLES:
  ctd                              # Interactive mode with menu
  ctd --integrate-claude           # Update your CLAUDE.md file
  ctd --generate-files --open-files    # Create files and open them
  ctd --conversation-starter --show-starter    # Quick conversation context
  ctd --all                        # Generate everything

INTEGRATION WORKFLOW:
  1. Run 'ctd --generate-files' to create visible tool inventory
  2. Run 'ctd --integrate-claude' to update CLAUDE.md automatically  
  3. Use 'ctd --conversation-starter' for quick Claude context
  4. Files are visible, version-controllable, and human-readable
`);
  process.exit(0);
}

const options = {
  // Integration options
  integrateClaudeMd: args.includes('--integrate-claude'),
  generateFiles: args.includes('--generate-files'),
  conversationStarter: args.includes('--conversation-starter'),
  interactive: args.includes('--interactive') || args.length === 0,
  all: args.includes('--all'),
  
  // Display options  
  showOutput: args.includes('--show-starter'),
  verbose: args.includes('--verbose'),
  quiet: args.includes('--quiet'),
  suppressDashboard: args.includes('--suppress-dashboard'),
  openFiles: args.includes('--open-files'),
  
  // Custom paths
  outputDir: args.includes('--output-dir') ? args[args.indexOf('--output-dir') + 1] : undefined,
  claudeFile: args.includes('--claude-file') ? args[args.indexOf('--claude-file') + 1] : undefined,
  startDir: process.cwd()
};

// Handle --all flag
if (options.all) {
  options.generateFiles = true;
  options.conversationStarter = true;
  options.showOutput = true;
  options.integrateClaudeMd = true;
}

const discovery = new EnhancedCTDiscovery();
discovery.run(options);