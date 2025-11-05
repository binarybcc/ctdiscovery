#!/usr/bin/env node

/**
 * Basic Usage Example
 *
 * Demonstrates basic usage of CTDiscovery API
 */

import { CTDiscovery } from '../src/index.js';

async function main() {
  console.log('CTDiscovery - Basic Usage Example\n');

  // Create instance
  const ctd = new CTDiscovery({
    timeout: 5000,
    verbose: false
  });

  try {
    // Scan environment
    console.log('Scanning environment...');
    const results = await ctd.scan();
    console.log(`✓ Scan completed in ${results.scanDuration}ms\n`);

    // Analyze results
    console.log('Analyzing results...');
    const analysis = await ctd.analyze(results);
    console.log(`✓ Found ${analysis.summary.totalTools} tools\n`);

    // Format as JSON
    console.log('Formatting as JSON...');
    const json = await ctd.format(analysis, 'json');
    console.log('✓ JSON output generated\n');

    // Format as Markdown
    console.log('Formatting as Markdown...');
    const markdown = await ctd.format(analysis, 'markdown');
    console.log('✓ Markdown output generated\n');

    // Generate AI context
    console.log('Generating AI context...');
    const context = await ctd.generateContext(analysis);
    console.log('✓ AI context generated\n');

    console.log('Context preview:');
    console.log(context.conversationStarter);

    console.log('\n=== Summary ===');
    console.log(`Platform: ${analysis.environment.platform}`);
    console.log(`Node: ${analysis.environment.nodeVersion}`);
    console.log(`Total tools: ${analysis.summary.totalTools}`);
    console.log(`Active tools: ${analysis.summary.byStatus.active || 0}`);
    console.log(`Overlaps: ${analysis.summary.overlapCount}`);

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();
