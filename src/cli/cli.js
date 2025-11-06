#!/usr/bin/env node

/**
 * CTDiscovery Enhanced CLI
 *
 * Enhanced CLI with multi-layer API support and intelligent analysis
 */

import CTDiscovery from '../api/ctdiscovery-api.js';

class CTDiscoveryCLI {
  constructor() {
    this.colors = {
      reset: '\x1b[0m',
      bright: '\x1b[1m',
      green: '\x1b[32m',
      yellow: '\x1b[33m',
      red: '\x1b[31m',
      cyan: '\x1b[36m',
      gray: '\x1b[90m'
    };
  }

  async run(options = {}) {
    try {
      // Initialize CTDiscovery with options
      const ctd = new CTDiscovery({
        timeout: options.timeout || 10000,
        intelligenceMode: options.intelligenceMode || (options.smart ? 'smart' : 'all')
      });

      // Scan environment
      if (!options.quiet) {
        console.log('🔍 CTDiscovery - Multi-layer Environment Discovery\n');
      }

      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);

      // Apply intelligence layer if requested
      let output = analysis;
      if (options.smart || options.projectOptimized || options.aiContext) {
        const mode = options.projectOptimized ? 'project-optimized' :
                    options.aiContext ? 'ai-context' : 'smart';
        output = await ctd.intelligentAnalyze(analysis, { mode });
      }

      // Output based on format
      if (options.json) {
        const formatted = await ctd.format(output, 'json');
        console.log(formatted);
      } else if (options.markdown) {
        const formatted = await ctd.format(output, 'markdown');
        console.log(formatted);
      } else if (options.generateContext) {
        const context = await ctd.generateContext(analysis);
        console.log(context.markdown);
      } else {
        // Default text display
        this.displayResults(output, options);
      }

    } catch (error) {
      console.error(`${this.colors.red}❌ Error: ${error.message}${this.colors.reset}`);
      if (options.verbose) {
        console.error(error.stack);
      }
      process.exit(1);
    }
  }

  displayResults(analysis, options) {
    const hasIntelligence = analysis.projectIntelligence !== undefined;

    if (hasIntelligence) {
      this.displayIntelligentResults(analysis, options);
    } else {
      this.displayStandardResults(analysis, options);
    }
  }

  displayIntelligentResults(intelligence, options) {
    // Project Intelligence
    console.log(`${this.colors.bright}📁 PROJECT INTELLIGENCE${this.colors.reset}`);
    console.log('─'.repeat(60));
    console.log(`Type: ${this.colors.cyan}${intelligence.projectIntelligence.type}${this.colors.reset}`);
    console.log(`Languages: ${intelligence.projectIntelligence.languages.join(', ') || 'None detected'}`);
    console.log(`Confidence: ${intelligence.projectIntelligence.confidence}%`);

    // Summary
    console.log(`\n${this.colors.bright}📊 SUMMARY${this.colors.reset}`);
    console.log('─'.repeat(60));
    console.log(intelligence.summary.description);
    console.log(`Maturity: ${intelligence.summary.maturity} (${intelligence.summary.maturityScore}/100)`);
    console.log(`Active Tools: ${this.colors.green}${intelligence.summary.active}${this.colors.reset} of ${intelligence.summary.total}`);

    if (intelligence.summary.filtered > 0) {
      console.log(`Filtered: ${this.colors.gray}${intelligence.summary.filtered}${this.colors.reset}`);
    }

    // Active & Relevant Tools
    if (intelligence.toolsByRelevance.active.length > 0) {
      console.log(`\n${this.colors.bright}✅ ACTIVE & RELEVANT${this.colors.reset}`);
      console.log('─'.repeat(60));
      intelligence.toolsByRelevance.active.slice(0, options.verbose ? 20 : 10).forEach((tool, i) => {
        const version = tool.metadata?.version ? ` ${this.colors.gray}(${tool.metadata.version})${this.colors.reset}` : '';
        const relevanceColor = tool.relevance.level === 'critical' ? this.colors.green :
                               tool.relevance.level === 'high' ? this.colors.cyan :
                               this.colors.reset;
        console.log(`  ${i + 1}. ${relevanceColor}${tool.name}${this.colors.reset}${version}`);

        if (options.verbose && tool.relevance.reasons[0]) {
          console.log(`     ${this.colors.gray}└─ ${tool.relevance.reasons[0]}${this.colors.reset}`);
        }
      });
    }

    // Available but unused
    if (intelligence.toolsByRelevance.available.length > 0 && !options.quiet) {
      console.log(`\n${this.colors.bright}⚪ AVAILABLE BUT UNUSED${this.colors.reset}`);
      console.log('─'.repeat(60));
      intelligence.toolsByRelevance.available.slice(0, 5).forEach((tool, i) => {
        console.log(`  ${i + 1}. ${tool.name} - ${tool.usage?.pattern || 'unknown'}`);
      });
    }

    // Recommendations
    if (intelligence.recommendations.length > 0) {
      console.log(`\n${this.colors.bright}💡 RECOMMENDATIONS${this.colors.reset}`);
      console.log('─'.repeat(60));
      intelligence.recommendations.slice(0, 5).forEach((rec, i) => {
        const priorityIcon = rec.priority === 'high' ? '🔴' :
                            rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`  ${priorityIcon} ${rec.action}`);
      });
    }

    console.log('');
  }

  displayStandardResults(analysis, options) {
    console.log(`${this.colors.bright}📊 ENVIRONMENT ANALYSIS${this.colors.reset}`);
    console.log('─'.repeat(60));
    console.log(`Total Tools: ${this.colors.cyan}${analysis.summary.totalTools}${this.colors.reset}`);
    console.log(`Active: ${this.colors.green}${analysis.summary.byStatus.active || 0}${this.colors.reset}`);
    console.log(`Available: ${analysis.summary.byStatus.available || 0}`);

    // Tools by category
    console.log(`\n${this.colors.bright}🔧 TOOLS BY CATEGORY${this.colors.reset}`);
    console.log('─'.repeat(60));

    Object.entries(analysis.summary.byCategory).forEach(([category, count]) => {
      if (count > 0) {
        console.log(`  ${category}: ${count}`);
      }
    });

    // Show some key tools
    console.log(`\n${this.colors.bright}🔑 KEY TOOLS${this.colors.reset}`);
    console.log('─'.repeat(60));

    const keyToolNames = ['git', 'node', 'npm', 'docker', 'python'];
    const keyTools = analysis.tools.filter(t =>
      keyToolNames.includes(t.name.toLowerCase())
    );

    keyTools.forEach(tool => {
      const statusIcon = tool.status === 'active' ? '✓' : '○';
      const statusColor = tool.status === 'active' ? this.colors.green : this.colors.gray;
      const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
      console.log(`  ${statusColor}${statusIcon} ${tool.name}${version}${this.colors.reset}`);
    });

    console.log('');
  }

  showHelp() {
    console.log(`
${this.colors.bright}🔍 CTDiscovery - Multi-layer Environment Discovery${this.colors.reset}

${this.colors.bright}USAGE:${this.colors.reset}
  ctdiscovery [options]
  ctd [options]

${this.colors.bright}INTELLIGENCE MODES:${this.colors.reset}
  --smart                  ${this.colors.gray}Smart filtering (relevant tools only)${this.colors.reset}
  --all                    ${this.colors.gray}Complete inventory (all tools)${this.colors.reset}
  --project-optimized      ${this.colors.gray}Project-specific relevance only${this.colors.reset}
  --ai-context             ${this.colors.gray}Optimized for AI assistant consumption${this.colors.reset}

${this.colors.bright}OUTPUT FORMATS:${this.colors.reset}
  --json                   ${this.colors.gray}JSON output${this.colors.reset}
  --markdown               ${this.colors.gray}Markdown format${this.colors.reset}
  --generate-context       ${this.colors.gray}Generate AI context document${this.colors.reset}

${this.colors.bright}OPTIONS:${this.colors.reset}
  --verbose                ${this.colors.gray}Show detailed information${this.colors.reset}
  --quiet                  ${this.colors.gray}Minimal output${this.colors.reset}
  --timeout <ms>           ${this.colors.gray}Scan timeout (default: 10000)${this.colors.reset}
  --help, -h               ${this.colors.gray}Show this help${this.colors.reset}

${this.colors.bright}EXAMPLES:${this.colors.reset}
  ${this.colors.cyan}ctd${this.colors.reset}                           ${this.colors.gray}# Standard scan${this.colors.reset}
  ${this.colors.cyan}ctd --smart${this.colors.reset}                   ${this.colors.gray}# Smart filtering (default)${this.colors.reset}
  ${this.colors.cyan}ctd --all --verbose${this.colors.reset}           ${this.colors.gray}# Complete inventory, detailed${this.colors.reset}
  ${this.colors.cyan}ctd --project-optimized${this.colors.reset}       ${this.colors.gray}# Project-specific tools only${this.colors.reset}
  ${this.colors.cyan}ctd --json --smart${this.colors.reset}            ${this.colors.gray}# JSON output with smart filtering${this.colors.reset}
  ${this.colors.cyan}ctd --generate-context${this.colors.reset}        ${this.colors.gray}# Generate AI context document${this.colors.reset}

${this.colors.bright}PROGRAMMATIC API:${this.colors.reset}
  ${this.colors.gray}import { CTDiscovery } from 'ctdiscovery';

  const ctd = new CTDiscovery({ intelligenceMode: 'smart' });
  const results = await ctd.scan();
  const analysis = await ctd.analyze(results);
  const intelligence = await ctd.intelligentAnalyze(analysis);${this.colors.reset}

For more information: ${this.colors.cyan}https://github.com/binarybcc/ctdiscovery${this.colors.reset}
`);
  }
}

// Parse arguments
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h') || args.includes('help')) {
  const cli = new CTDiscoveryCLI();
  cli.showHelp();
  process.exit(0);
}

// Parse options
const options = {
  // Intelligence modes
  smart: args.includes('--smart'),
  all: args.includes('--all'),
  projectOptimized: args.includes('--project-optimized'),
  aiContext: args.includes('--ai-context'),

  // Output formats
  json: args.includes('--json'),
  markdown: args.includes('--markdown'),
  generateContext: args.includes('--generate-context'),

  // General options
  verbose: args.includes('--verbose'),
  quiet: args.includes('--quiet'),

  // Timeout
  timeout: (() => {
    const timeoutIndex = args.indexOf('--timeout');
    if (timeoutIndex !== -1 && args[timeoutIndex + 1]) {
      return parseInt(args[timeoutIndex + 1], 10);
    }
    return 10000;
  })()
};

// Default to smart mode if no mode specified and output is JSON
if (!options.smart && !options.all && !options.projectOptimized && !options.aiContext) {
  options.smart = options.json; // Smart mode for JSON by default
}

const cli = new CTDiscoveryCLI();
cli.run(options);
