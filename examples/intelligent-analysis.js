#!/usr/bin/env node

/**
 * Intelligent Analysis Example
 *
 * Demonstrates the new intelligent analysis capabilities that provide
 * context-aware, curated insights rather than overwhelming tool inventories.
 */

import { CTDiscovery } from '../src/index.js';

async function demonstrateIntelligence() {
  console.log('🧠 CTDiscovery - Intelligent Analysis Demo\n');
  console.log('='.repeat(60));

  const ctd = new CTDiscovery({
    timeout: 10000,
    intelligenceMode: 'smart'
  });

  try {
    // Step 1: Standard scan and analyze
    console.log('\n📊 Step 1: Scanning environment...\n');
    const scanResults = await ctd.scan();
    const analysis = await ctd.analyze(scanResults);

    console.log(`✓ Found ${analysis.tools.length} total tools\n`);

    // Step 2: Intelligent analysis
    console.log('🧠 Step 2: Applying intelligence layer...\n');
    const intelligence = await ctd.intelligentAnalyze(analysis);

    // Display project intelligence
    console.log('📁 PROJECT INTELLIGENCE');
    console.log('─'.repeat(60));
    console.log(`Type: ${intelligence.projectIntelligence.type}`);
    console.log(`Languages: ${intelligence.projectIntelligence.languages.join(', ') || 'None detected'}`);
    console.log(`Frameworks: ${intelligence.projectIntelligence.frameworks.join(', ') || 'None detected'}`);
    console.log(`Package Managers: ${intelligence.projectIntelligence.packageManagers.join(', ') || 'None'}`);
    console.log(`Confidence: ${intelligence.projectIntelligence.confidence}%`);

    // Display smart summary
    console.log('\n📝 SMART SUMMARY');
    console.log('─'.repeat(60));
    console.log(intelligence.summary.description);
    console.log(`\nMaturity Level: ${intelligence.summary.maturity} (${intelligence.summary.maturityScore}/100)`);
    console.log(`\nActive Tools: ${intelligence.summary.active} of ${intelligence.summary.total}`);
    console.log(`Filtered as Irrelevant: ${intelligence.summary.filtered}`);

    if (intelligence.summary.capabilities.length > 0) {
      console.log(`\nCapabilities: ${intelligence.summary.capabilities.slice(0, 5).join(', ')}`);
    }

    // Display AI Context
    console.log('\n🤖 AI CONTEXT');
    console.log('─'.repeat(60));
    console.log(intelligence.aiContext.conversationStarter);
    console.log(`\nKey Tools: ${intelligence.aiContext.keyTools.map(t => t.name).join(', ')}`);
    console.log(`Focus Areas: ${intelligence.aiContext.focusAreas.join(', ') || 'None identified'}`);

    // Display active tools (relevant)
    console.log('\n✅ ACTIVE & RELEVANT TOOLS');
    console.log('─'.repeat(60));
    intelligence.toolsByRelevance.active.forEach((tool, i) => {
      if (i < 10) { // Show top 10
        console.log(`${i + 1}. ${tool.name} - ${tool.relevance.level} relevance (${tool.relevance.score}/100)`);
        if (tool.relevance.reasons[0]) {
          console.log(`   └─ ${tool.relevance.reasons[0]}`);
        }
      }
    });

    // Display available but unused tools
    if (intelligence.toolsByRelevance.available.length > 0) {
      console.log('\n⚪ AVAILABLE BUT UNUSED');
      console.log('─'.repeat(60));
      intelligence.toolsByRelevance.available.slice(0, 5).forEach((tool, i) => {
        console.log(`${i + 1}. ${tool.name} - ${tool.usage?.pattern || 'unknown'} (${tool.relevance.score}/100)`);
      });
    }

    // Display filtered tools (noise)
    if (intelligence.toolsByRelevance.filtered.length > 0) {
      console.log('\n🔇 FILTERED AS IRRELEVANT');
      console.log('─'.repeat(60));
      console.log(`${intelligence.toolsByRelevance.filtered.length} tools filtered (low relevance to this project)`);
      const examples = intelligence.toolsByRelevance.filtered.slice(0, 5).map(t => t.name).join(', ');
      console.log(`Examples: ${examples}`);
    }

    // Display recommendations
    if (intelligence.recommendations.length > 0) {
      console.log('\n💡 RECOMMENDATIONS');
      console.log('─'.repeat(60));
      intelligence.recommendations.forEach((rec, i) => {
        const priority = rec.priority === 'high' ? '🔴' : rec.priority === 'medium' ? '🟡' : '🟢';
        console.log(`${priority} ${i + 1}. ${rec.action}`);
      });
    }

    // Display optimization opportunities
    if (intelligence.optimizationOpportunities.length > 0) {
      console.log('\n⚡ OPTIMIZATION OPPORTUNITIES');
      console.log('─'.repeat(60));
      intelligence.optimizationOpportunities.forEach((opp, i) => {
        console.log(`${i + 1}. ${opp.suggestion}`);
      });
    }

    // Compare modes
    console.log('\n📊 COMPARISON: Different Intelligence Modes');
    console.log('─'.repeat(60));

    const modes = ['all', 'smart', 'project-optimized', 'ai-context'];
    for (const mode of modes) {
      const modeResults = await ctd.intelligentAnalyze(analysis, { mode });
      console.log(`${mode.padEnd(20)}: ${modeResults.tools.length} tools`);
    }

    console.log('\n' + '='.repeat(60));
    console.log('✨ Intelligence analysis complete!\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

demonstrateIntelligence();
