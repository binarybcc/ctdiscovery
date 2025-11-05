#!/usr/bin/env node

/**
 * CI/CD Environment Reporter
 *
 * Generates comprehensive environment reports for CI/CD pipelines.
 * Outputs in multiple formats and creates artifacts for archiving.
 */

import { CTDiscovery } from '../src/index.js';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const OUTPUT_DIR = process.env.CI_REPORTS_DIR || './ci-reports';
const OUTPUT_FORMATS = ['json', 'markdown', 'text'];

async function generateCIReport() {
  console.log('📊 Generating CI/CD environment report...\n');

  try {
    // Create output directory
    mkdirSync(OUTPUT_DIR, { recursive: true });

    // Perform scan and analysis
    const ctd = new CTDiscovery({ timeout: 10000 });
    console.log('Scanning environment...');
    const analysis = await ctd.scanAndAnalyze();

    console.log(`✓ Found ${analysis.summary.totalTools} tools\n`);

    // Generate reports in all formats
    for (const format of OUTPUT_FORMATS) {
      const output = await ctd.format(analysis, format);
      const filename = `environment-report.${format === 'markdown' ? 'md' : format === 'text' ? 'txt' : format}`;
      const filepath = join(OUTPUT_DIR, filename);

      writeFileSync(filepath, output);
      console.log(`✓ Generated ${filename}`);
    }

    // Generate AI context
    const context = await ctd.generateContext(analysis);
    writeFileSync(join(OUTPUT_DIR, 'ai-context.md'), context.markdown);
    console.log('✓ Generated ai-context.md');

    // Generate summary for CI logs
    console.log('\n' + '='.repeat(60));
    console.log('ENVIRONMENT SUMMARY');
    console.log('='.repeat(60));
    console.log(`Platform: ${analysis.environment.platform}`);
    console.log(`Node.js: ${analysis.environment.nodeVersion}`);
    console.log(`Total Tools: ${analysis.summary.totalTools}`);
    console.log(`Active Tools: ${analysis.summary.byStatus.active || 0}`);
    console.log(`Available Tools: ${analysis.summary.byStatus.available || 0}`);

    if (analysis.overlaps.length > 0) {
      console.log(`\n⚠️  Tool Overlaps Detected: ${analysis.overlaps.length}`);
      for (const overlap of analysis.overlaps) {
        console.log(`  - ${overlap.type}: ${overlap.tools.join(', ')}`);
      }
    }

    // Output key tools for CI/CD
    console.log('\nKey Tools:');
    const keyTools = ['git', 'node', 'npm', 'docker', 'python', 'java', 'go'];
    for (const toolName of keyTools) {
      const tool = analysis.tools.find(t => t.name.toLowerCase() === toolName);
      if (tool) {
        const version = tool.metadata?.version || 'unknown';
        console.log(`  ✓ ${toolName}: ${version} (${tool.status})`);
      }
    }

    console.log('\n' + '='.repeat(60));
    console.log(`\n✅ Reports saved to ${OUTPUT_DIR}\n`);

    // Set environment variables for subsequent CI steps
    if (process.env.CI) {
      console.log('Setting CI environment variables:');
      console.log(`TOOLS_COUNT=${analysis.summary.totalTools}`);
      console.log(`HAS_DOCKER=${analysis.tools.some(t => t.name === 'docker') ? '1' : '0'}`);
      console.log(`HAS_PYTHON=${analysis.tools.some(t => t.name === 'python') ? '1' : '0'}`);
    }

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Report generation failed:', error.message);
    process.exit(1);
  }
}

generateCIReport();
