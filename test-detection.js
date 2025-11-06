#!/usr/bin/env node
/**
 * Standalone test script to verify tool detection
 */

import { PlatformDetection } from './src/utils/platform-detection.js';
import { SystemToolScanner } from './src/scanners/system-tool-scanner.js';

console.log('🔍 Testing Tool Detection\n');
console.log('Working Directory:', process.cwd());
console.log('');

// Test 1: Direct platform detection
console.log('📋 Test 1: Direct Platform Detection');
console.log('─'.repeat(60));

const pd = new PlatformDetection();
const phpTools = ['phpstan', 'psalm', 'php-cs-fixer', 'phpunit', 'rector', 'composer'];

for (const tool of phpTools) {
  const result = await pd.testCommandAvailability(tool);
  const icon = result.available ? '✅' : '❌';
  const location = result.location ? ` (${result.location})` : '';
  console.log(`${icon} ${tool}${location}`);
  if (result.available) {
    console.log(`   Path: ${result.path}`);
  }
}

console.log('');

// Test 2: Full scanner
console.log('📋 Test 2: System Scanner Detection');
console.log('─'.repeat(60));

const scanner = new SystemToolScanner();
const scanResult = await scanner.scan();

console.log(`Total tools detected: ${scanResult.data.length}`);
console.log('');

// Filter PHP tools
const detectedPhpTools = scanResult.data.filter(tool =>
  phpTools.includes(tool.name)
);

if (detectedPhpTools.length > 0) {
  console.log('✅ PHP Tools Detected:');
  detectedPhpTools.forEach(tool => {
    console.log(`   - ${tool.name} (${tool.status})`);
    console.log(`     Path: ${tool.metadata?.path}`);
    console.log(`     Location: ${tool.metadata?.location || 'unknown'}`);
  });
} else {
  console.log('❌ No PHP tools detected by scanner');
  console.log('');
  console.log('⚠️  This is the bug! Platform detection finds them, but scanner doesn\'t.');
}

console.log('');

// Test 3: Check tool categories
console.log('📋 Test 3: Scanner Tool Categories');
console.log('─'.repeat(60));
console.log('php-tools category:', scanner.toolCategories['php-tools']);
console.log('');

// Show all detected tool names
console.log('📋 All Detected Tools:');
console.log('─'.repeat(60));
scanResult.data.forEach(tool => {
  console.log(`- ${tool.name} (${tool.status})`);
});
