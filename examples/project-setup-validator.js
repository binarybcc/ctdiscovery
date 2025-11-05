#!/usr/bin/env node

/**
 * Project Setup Validator
 *
 * Validates that a development environment meets project requirements.
 * Can be run by new team members to verify their setup.
 */

import { CTDiscovery } from '../src/index.js';
import { readFileSync, existsSync } from 'fs';

// Load project requirements from package.json or custom config
function loadProjectRequirements() {
  if (existsSync('./package.json')) {
    const pkg = JSON.parse(readFileSync('./package.json', 'utf-8'));

    return {
      name: pkg.name || 'Unknown Project',
      node: pkg.engines?.node || '>=16.0.0',
      required: extractRequired(pkg),
      recommended: extractRecommended(pkg)
    };
  }

  return {
    name: 'Project',
    required: ['git', 'node', 'npm'],
    recommended: []
  };
}

function extractRequired(pkg) {
  const tools = ['git', 'node'];

  // Detect package manager
  if (pkg.packageManager?.includes('yarn')) tools.push('yarn');
  else if (pkg.packageManager?.includes('pnpm')) tools.push('pnpm');
  else tools.push('npm');

  // Check for Docker
  if (pkg.scripts && Object.values(pkg.scripts).some(s => s.includes('docker'))) {
    tools.push('docker');
  }

  // Check for Python
  if (pkg.devDependencies?.python || pkg.dependencies?.python) {
    tools.push('python');
  }

  return tools;
}

function extractRecommended(pkg) {
  const tools = [];

  // Linters
  if (pkg.devDependencies?.eslint) tools.push('eslint');
  if (pkg.devDependencies?.prettier) tools.push('prettier');

  // Type checkers
  if (pkg.devDependencies?.typescript) tools.push('tsc');

  // Test runners
  if (pkg.devDependencies?.jest) tools.push('jest');
  if (pkg.devDependencies?.vitest) tools.push('vitest');

  return tools;
}

function parseNodeVersion(versionString) {
  const match = versionString.match(/(\d+)/);
  return match ? parseInt(match[1]) : 16;
}

async function validateSetup() {
  const requirements = loadProjectRequirements();

  console.log(`\n🔧 Validating setup for: ${requirements.name}`);
  console.log('='.repeat(60) + '\n');

  try {
    // Scan environment
    const ctd = new CTDiscovery({ timeout: 10000 });
    const analysis = await ctd.scanAndAnalyze();

    let hasErrors = false;
    let hasWarnings = false;

    // Check Node.js version
    console.log('📦 Node.js Version:');
    const currentNode = analysis.environment.nodeVersion;
    const requiredNode = parseNodeVersion(requirements.node);
    const actualNode = parseNodeVersion(currentNode);

    if (actualNode >= requiredNode) {
      console.log(`  ✓ ${currentNode} (required: ${requirements.node})\n`);
    } else {
      console.log(`  ❌ ${currentNode} (required: ${requirements.node})`);
      console.log(`     Please upgrade Node.js\n`);
      hasErrors = true;
    }

    // Check required tools
    console.log('🔧 Required Tools:');
    for (const toolName of requirements.required) {
      const tool = analysis.tools.find(t =>
        t.name.toLowerCase() === toolName.toLowerCase() &&
        t.status === 'active'
      );

      if (tool) {
        const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
        console.log(`  ✓ ${toolName}${version}`);
      } else {
        console.log(`  ❌ ${toolName} - NOT FOUND`);
        hasErrors = true;
      }
    }

    // Check recommended tools
    if (requirements.recommended.length > 0) {
      console.log('\n💡 Recommended Tools:');
      for (const toolName of requirements.recommended) {
        const tool = analysis.tools.find(t =>
          t.name.toLowerCase() === toolName.toLowerCase()
        );

        if (tool && tool.status === 'active') {
          const version = tool.metadata?.version ? ` (${tool.metadata.version})` : '';
          console.log(`  ✓ ${toolName}${version}`);
        } else {
          console.log(`  ⚠️  ${toolName} - Not found (recommended for this project)`);
          hasWarnings = true;
        }
      }
    }

    // Check for tool overlaps
    if (analysis.overlaps.length > 0) {
      console.log('\n⚠️  Tool Overlaps Detected:');
      for (const overlap of analysis.overlaps) {
        if (overlap.severity === 'warning' || overlap.severity === 'error') {
          console.log(`  ${overlap.severity === 'error' ? '❌' : '⚠️ '} ${overlap.reason}`);
          console.log(`     Tools: ${overlap.tools.join(', ')}`);
          if (overlap.recommendation) {
            console.log(`     Recommendation: ${overlap.recommendation}`);
          }
        }
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));

    if (hasErrors) {
      console.log('❌ Setup validation FAILED');
      console.log('\nPlease install the missing tools and try again.');
      console.log('Run `npm install` or check project documentation.\n');
      process.exit(1);
    } else if (hasWarnings) {
      console.log('⚠️  Setup validation passed with warnings');
      console.log('\nYour environment is functional, but consider installing');
      console.log('the recommended tools for the best experience.\n');
      process.exit(0);
    } else {
      console.log('✅ Setup validation PASSED');
      console.log('\nYour development environment is ready!');
      console.log(`You have all ${requirements.required.length} required tools installed.\n`);
      process.exit(0);
    }

  } catch (error) {
    console.error('\n❌ Validation failed:', error.message);
    process.exit(1);
  }
}

validateSetup();
