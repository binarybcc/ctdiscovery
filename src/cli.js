#!/usr/bin/env node

import { EnvironmentScanner } from './scanners/environment-scanner.js';
import { StatusDisplay } from './display/status-display.js';
import { ContextGenerator } from './generators/context-generator.js';

class CTDiscovery {
  constructor() {
    this.scanner = new EnvironmentScanner();
    this.display = new StatusDisplay();
    this.contextGenerator = new ContextGenerator();
    
    // Color definitions for terminal output
    this.colors = {
      active: '\x1b[32m',    // Green
      available: '\x1b[32m', // Green
      detected: '\x1b[32m',  // Green  
      missing: '\x1b[31m',   // Red
      error: '\x1b[31m',     // Red
      unknown: '\x1b[33m',   // Yellow
      warning: '\x1b[33m',   // Yellow
      reset: '\x1b[0m'       // Reset
    };
  }

  async run(options = {}) {
    console.log('🔍 CTDiscovery - AI Development Environment Status\n');
    
    try {
      const status = await this.scanner.scan();
      
      // Always show discovery dashboard summary
      this.displayDiscoveryDashboard(status);
      
      // Generate context files based on options
      if (options.generateContext || options.all) {
        console.log('\n📄 Generating context files...');
        this.contextGenerator.generateContextFile(status);
        console.log('');
      }
      
      if (options.conversationStarter || options.all) {
        console.log('💬 Generating conversation starter...');
        const starter = this.contextGenerator.generateConversationStarter(status);
        
        if (options.showStarter) {
          console.log('\n' + '='.repeat(60));
          console.log('CONVERSATION STARTER (copy this to new conversations):');
          console.log('='.repeat(60));
          console.log(starter);
          console.log('='.repeat(60) + '\n');
        }
      }
      
      // Display detailed output unless quiet mode
      if (!options.quiet && !options.all) {
        console.log('');
        this.display.render(status, options);
      }
      
    } catch (error) {
      console.error('❌ Error scanning environment:', error.message);
      process.exit(1);
    }
  }

  displayDiscoveryDashboard(scanResults) {
    console.log('🔍 TOOL DISCOVERY DASHBOARD');
    console.log('═'.repeat(50));
    
    // Summary stats
    const summary = this.calculateSummaryStats(scanResults);
    console.log(`📊 Scan: ${scanResults.scanDuration}ms | ${summary.total} tools | ${summary.active} active`);
    
    // Category breakdowns with color coding - show ALL tools
    Object.entries(scanResults.status).forEach(([category, result]) => {
      if (!result.data || result.data.length === 0) return;
      
      const categoryName = this.formatCategoryName(category);
      console.log(`\n📦 ${categoryName}:`);
      
      // Group tools by status for better organization
      const toolsByStatus = {};
      result.data.forEach(tool => {
        const status = tool.status || 'unknown';
        if (!toolsByStatus[status]) toolsByStatus[status] = [];
        toolsByStatus[status].push(tool);
      });
      
      // Display each status group
      Object.entries(toolsByStatus).forEach(([status, tools]) => {
        const statusIcon = this.getStatusIcon(status);
        const statusColor = this.getStatusColor(status);
        console.log(`   ${statusColor}${statusIcon} ${status.toUpperCase()}:${this.colors.reset}`);
        
        // Show each tool with version if available
        tools.forEach(tool => {
          const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
          console.log(`      • ${tool.name}${version}`);
        });
      });
    });
    
    // Show issues if any
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

  getCategoryStatus(result) {
    if (!result.data || result.data.length === 0) return { level: 'none', text: 'none' };
    
    const hasErrors = result.errors && result.errors.length > 0;
    const hasWarnings = result.warnings && result.warnings.length > 0;
    const activeCount = result.data.filter(tool => tool.status === 'active' || tool.status === 'available').length;
    
    if (hasErrors) return { level: 'error', text: 'errors' };
    if (hasWarnings) return { level: 'warning', text: 'warnings' };
    if (activeCount === result.data.length) return { level: 'success', text: 'all active' };
    if (activeCount > 0) return { level: 'partial', text: 'some active' };
    return { level: 'none', text: 'none active' };
  }

  getStatusIcon(status) {
    const icons = {
      'active': '●',
      'available': '●',
      'detected': '●',
      'missing': '○',
      'error': '✖',
      'unknown': '?',
      'success': '🟢',
      'partial': '🟡', 
      'warning': '🟡',
      'none': '⚪'
    };
    return icons[status] || '❓';
  }

  getStatusColor(status) {
    return this.colors[status] || this.colors.reset;
  }
}

const args = process.argv.slice(2);

// Handle special commands
if (args.includes('help') || args.includes('--help') || args.includes('-h')) {
  console.log(`
🔍 CTDiscovery - AI Development Environment Status

USAGE:
  npm start                    # Full scan with display
  npm run scan                 # Scan + generate context files
  npm run tools                # Quick conversation starter
  
OPTIONS:
  --json                       # JSON output format
  --verbose                    # Detailed information
  --dev                        # Development mode
  --generate-context           # Create .ctdiscovery-context.md
  --conversation-starter       # Create conversation starter
  --show-starter               # Display starter in console
  --all                        # Generate all context files
  --quiet                      # Suppress normal output

EXAMPLES:
  npm start --generate-context    # Scan + create context file
  npm start --conversation-starter --show-starter    # Show starter
  npm start --all --quiet         # Generate files without display
`);
  process.exit(0);
}

const options = {
  dev: args.includes('--dev'),
  verbose: args.includes('--verbose'),
  json: args.includes('--json'),
  generateContext: args.includes('--generate-context'),
  conversationStarter: args.includes('--conversation-starter'),
  showStarter: args.includes('--show-starter'),
  all: args.includes('--all'),
  quiet: args.includes('--quiet')
};

const discovery = new CTDiscovery();
discovery.run(options);