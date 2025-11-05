#!/usr/bin/env node

/**
 * Build Tool Integration Example
 *
 * Demonstrates integrating CTDiscovery into a build process
 */

import { CTDiscovery } from '../src/index.js';
import { writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Example build plugin that uses CTDiscovery
 */
class CTDiscoveryBuildPlugin {
  constructor(options = {}) {
    this.options = {
      outputPath: options.outputPath || '.ctdiscovery',
      generateContext: options.generateContext !== false,
      failOnError: options.failOnError || false,
      ...options
    };

    this.ctd = new CTDiscovery({
      timeout: 5000,
      verbose: false
    });
  }

  async run() {
    console.log('[CTDiscovery Build Plugin] Starting scan...');

    try {
      // Scan and analyze
      const analysis = await this.ctd.scanAndAnalyze();

      // Check for critical issues
      if (this.options.failOnError && analysis.validation?.issues?.length > 0) {
        throw new Error(`Build failed: ${analysis.validation.issues.length} validation errors`);
      }

      // Generate outputs
      await this.generateOutputs(analysis);

      // Report
      this.reportResults(analysis);

      return {
        success: true,
        analysis
      };

    } catch (error) {
      console.error('[CTDiscovery Build Plugin] Error:', error.message);

      if (this.options.failOnError) {
        throw error;
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  async generateOutputs(analysis) {
    const { outputPath } = this.options;

    // Generate JSON report
    const json = await this.ctd.format(analysis, 'json');
    writeFileSync(join(outputPath, 'environment.json'), json);
    console.log(`[CTDiscovery Build Plugin] Generated: ${outputPath}/environment.json`);

    // Generate Markdown report
    const markdown = await this.ctd.format(analysis, 'markdown');
    writeFileSync(join(outputPath, 'environment.md'), markdown);
    console.log(`[CTDiscovery Build Plugin] Generated: ${outputPath}/environment.md`);

    // Generate AI context if requested
    if (this.options.generateContext) {
      const context = await this.ctd.generateContext(analysis);
      writeFileSync(join(outputPath, 'context.md'), context.markdown);
      console.log(`[CTDiscovery Build Plugin] Generated: ${outputPath}/context.md`);
    }
  }

  reportResults(analysis) {
    console.log('\n[CTDiscovery Build Plugin] Results:');
    console.log(`  Tools discovered: ${analysis.summary.totalTools}`);
    console.log(`  Active tools: ${analysis.summary.byStatus.active || 0}`);
    console.log(`  Overlaps: ${analysis.summary.overlapCount}`);
    console.log(`  Validation issues: ${analysis.summary.validationIssues}`);
  }
}

/**
 * Example Webpack plugin
 */
class CTDiscoveryWebpackPlugin {
  constructor(options = {}) {
    this.plugin = new CTDiscoveryBuildPlugin(options);
  }

  apply(compiler) {
    compiler.hooks.beforeRun.tapPromise('CTDiscoveryPlugin', async () => {
      console.log('\n=== CTDiscovery Webpack Plugin ===\n');
      await this.plugin.run();
      console.log('\n=================================\n');
    });
  }
}

/**
 * Example usage
 */
async function main() {
  console.log('CTDiscovery - Build Integration Example\n');

  // Example 1: Standalone build plugin
  console.log('Example 1: Standalone Build Plugin\n');
  const plugin = new CTDiscoveryBuildPlugin({
    outputPath: '.ctdiscovery',
    generateContext: true,
    failOnError: false
  });

  const result = await plugin.run();

  if (result.success) {
    console.log('\n✓ Build plugin completed successfully');
  } else {
    console.log('\n✗ Build plugin failed:', result.error);
  }

  // Example 2: Simulated Webpack integration
  console.log('\n\nExample 2: Webpack Plugin Integration\n');
  console.log('Usage in webpack.config.js:');
  console.log(`
const { CTDiscoveryWebpackPlugin } = require('ctdiscovery/build-plugins');

module.exports = {
  plugins: [
    new CTDiscoveryWebpackPlugin({
      outputPath: 'dist/environment',
      generateContext: true
    })
  ]
};
  `);

  // Example 3: Package.json script
  console.log('\nExample 3: Package.json Scripts\n');
  console.log('Add to package.json:');
  console.log(`
{
  "scripts": {
    "prebuild": "node examples/build-integration.js",
    "build": "your-build-command",
    "analyze": "ctdiscovery --json --output=dist/environment.json"
  }
}
  `);
}

// Export for use in other build tools
export { CTDiscoveryBuildPlugin, CTDiscoveryWebpackPlugin };

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
