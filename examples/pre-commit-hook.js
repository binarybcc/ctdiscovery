#!/usr/bin/env node

/**
 * Pre-commit Hook Example
 *
 * Validates that required tools are available before allowing a commit.
 * Place in .git/hooks/pre-commit and make executable.
 */

import { CTDiscovery } from '../src/index.js';

const REQUIRED_TOOLS = [
  'git',
  'node',
  'npm'
];

const OPTIONAL_TOOLS = [
  'docker',
  'eslint'
];

async function validateEnvironment() {
  console.log('🔍 Validating development environment...\n');

  try {
    // Quick scan
    const ctd = new CTDiscovery({ timeout: 5000 });
    const analysis = await ctd.scanAndAnalyze();

    // Check required tools
    const missing = [];
    const warnings = [];

    for (const required of REQUIRED_TOOLS) {
      const tool = analysis.tools.find(t =>
        t.name.toLowerCase() === required.toLowerCase() &&
        t.status === 'active'
      );

      if (!tool) {
        missing.push(required);
      } else {
        console.log(`✓ ${required} ${tool.metadata?.version || ''}`);
      }
    }

    // Check optional tools
    for (const optional of OPTIONAL_TOOLS) {
      const tool = analysis.tools.find(t =>
        t.name.toLowerCase() === optional.toLowerCase()
      );

      if (!tool || tool.status !== 'active') {
        warnings.push(optional);
      } else {
        console.log(`✓ ${optional} ${tool.metadata?.version || ''}`);
      }
    }

    // Report results
    console.log('');

    if (missing.length > 0) {
      console.error(`❌ Missing required tools: ${missing.join(', ')}`);
      console.error('\nPlease install the missing tools before committing.\n');
      process.exit(1);
    }

    if (warnings.length > 0) {
      console.warn(`⚠️  Optional tools not available: ${warnings.join(', ')}`);
      console.warn('Some functionality may be limited.\n');
    }

    console.log('✅ Environment validation passed\n');
    process.exit(0);

  } catch (error) {
    console.error('❌ Environment validation failed:', error.message);
    process.exit(1);
  }
}

validateEnvironment();
