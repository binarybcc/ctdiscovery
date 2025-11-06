#!/usr/bin/env node
/**
 * Test script to verify UsageAnalyzer reads composer.json
 */

import { UsageAnalyzer } from './src/intelligence/usage-analyzer.js';
import { existsSync } from 'fs';
import { join } from 'path';

console.log('Testing UsageAnalyzer...\n');

// Set project root to current directory
const projectRoot = process.cwd();
console.log('Project Root:', projectRoot);

// Check if composer.json exists
const composerPath = join(projectRoot, 'composer.json');
console.log('Composer.json exists:', existsSync(composerPath));

if (!existsSync(composerPath)) {
  console.log('⚠️  No composer.json found. Run this from your PHP project directory.');
  process.exit(1);
}

// Create usage analyzer
const analyzer = new UsageAnalyzer({ projectRoot });

// Test tools that should be in composer.json scripts
const testTools = [
  { name: 'phpstan', type: 'php-tools' },
  { name: 'psalm', type: 'php-tools' },
  { name: 'rector', type: 'php-tools' },
  { name: 'php-cs-fixer', type: 'php-tools' },
  { name: 'phpunit', type: 'php-tools' },
  { name: 'composer', type: 'package-manager' }
];

console.log('\n📋 Testing tool usage analysis:\n');

for (const tool of testTools) {
  const usage = analyzer.analyzeToolUsage(tool);
  const icon = usage.pattern === 'active-development' ? '✅' :
               usage.pattern === 'configured' ? '🟡' :
               usage.pattern === 'installed' ? '⚪' : '❌';

  console.log(`${icon} ${tool.name}`);
  console.log(`   Pattern: ${usage.pattern}`);
  console.log(`   Confidence: ${usage.confidence}`);
  console.log(`   Indicators: ${usage.indicators.length}`);

  if (usage.indicators.length > 0) {
    usage.indicators.forEach(ind => {
      if (ind.type === 'composer-script') {
        console.log(`   └─ Composer scripts: ${ind.scripts.join(', ')}`);
      }
    });
  }
  console.log('');
}
