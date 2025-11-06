/**
 * Intelligence Layer Tests
 *
 * Test suite for intelligence analysis components
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  ProjectTypeDetector,
  RelevanceScorer,
  UsageAnalyzer,
  IntelligenceAnalyzer
} from '../index.js';

describe('ProjectTypeDetector', () => {
  const detector = new ProjectTypeDetector({ projectRoot: process.cwd() });

  it('should detect project type', async () => {
    const projectType = await detector.detect();

    assert.ok(projectType);
    assert.ok(typeof projectType.primaryType === 'string');
    assert.ok(Array.isArray(projectType.languages));
    assert.ok(Array.isArray(projectType.frameworks));
    assert.ok(typeof projectType.confidence === 'number');
    assert.ok(projectType.confidence >= 0 && projectType.confidence <= 100);
  });

  it('should detect JavaScript project', async () => {
    const projectType = await detector.detect();

    // Current project is JavaScript
    assert.ok(projectType.languages.includes('javascript'));
    assert.ok(projectType.primaryType === 'javascript' || projectType.primaryType === 'node');
  });

  it('should identify package manager', async () => {
    const projectType = await detector.detect();

    assert.ok(Array.isArray(projectType.packageManagers));
    // Should detect npm since we have package.json
    assert.ok(projectType.packageManagers.length > 0);
  });

  it('should return relevant tool ecosystem', async () => {
    const ecosystem = detector.getRelevantToolEcosystem('javascript');

    assert.ok(Array.isArray(ecosystem));
    assert.ok(ecosystem.includes('node'));
    assert.ok(ecosystem.includes('npm'));
  });
});

describe('RelevanceScorer', () => {
  const scorer = new RelevanceScorer();

  const mockTools = [
    { name: 'node', type: 'language', status: 'active', metadata: {} },
    { name: 'npm', type: 'package-manager', status: 'active', metadata: {} },
    { name: 'python', type: 'language', status: 'available', metadata: {} }
  ];

  const mockProjectType = {
    type: 'javascript',
    languages: ['javascript'],
    frameworks: [],
    packageManagers: ['npm'],
    buildSystems: [],
    capabilities: [],
    confidence: 90
  };

  it('should score tools based on relevance', async () => {
    const scored = await scorer.scoreTools(mockTools, mockProjectType);

    assert.ok(Array.isArray(scored));
    assert.equal(scored.length, mockTools.length);

    scored.forEach(tool => {
      assert.ok(tool.relevance);
      assert.ok(typeof tool.relevance.score === 'number');
      assert.ok(tool.relevance.score >= 0 && tool.relevance.score <= 100);
      assert.ok(typeof tool.relevance.level === 'string');
      assert.ok(Array.isArray(tool.relevance.reasons));
    });
  });

  it('should score ecosystem-matching tools higher', async () => {
    const scored = await scorer.scoreTools(mockTools, mockProjectType);

    const nodeScore = scored.find(t => t.name === 'node')?.relevance.score || 0;
    const pythonScore = scored.find(t => t.name === 'python')?.relevance.score || 0;

    // Node should score higher than Python for a JavaScript project
    assert.ok(nodeScore > pythonScore);
  });

  it('should filter by relevance score', async () => {
    const scored = await scorer.scoreTools(mockTools, mockProjectType);
    const filtered = scorer.filterByRelevance(scored, 'medium');

    assert.ok(filtered);
    assert.ok(Array.isArray(filtered.relevant));
    assert.ok(Array.isArray(filtered.filtered));
    // All relevant tools should have score >= 40 (medium threshold)
    filtered.relevant.forEach(tool => {
      assert.ok(tool.relevance.score >= 40);
    });
  });

  it('should group tools by relevance level', async () => {
    const scored = await scorer.scoreTools(mockTools, mockProjectType);
    const grouped = scorer.groupByRelevance(scored);

    assert.ok(grouped.active);
    assert.ok(grouped.available);
    assert.ok(grouped.noise);
    assert.ok(Array.isArray(grouped.active));
    assert.ok(Array.isArray(grouped.available));
    assert.ok(Array.isArray(grouped.noise));
  });
});

describe('UsageAnalyzer', () => {
  const analyzer = new UsageAnalyzer({ projectRoot: process.cwd() });

  const mockTools = [
    { name: 'git', type: 'version-control', status: 'active', metadata: {} },
    { name: 'npm', type: 'package-manager', status: 'active', metadata: {} }
  ];

  it('should analyze tool usage', async () => {
    const analyzed = await analyzer.analyzeUsage(mockTools);

    assert.ok(Array.isArray(analyzed));
    assert.equal(analyzed.length, mockTools.length);

    analyzed.forEach(tool => {
      assert.ok(tool.usage);
      assert.ok(typeof tool.usage.pattern === 'string');
      assert.ok(Array.isArray(tool.usage.indicators));
      assert.ok(typeof tool.usage.confidence === 'number');
    });
  });

  it('should detect usage patterns', async () => {
    const analyzed = await analyzer.analyzeUsage(mockTools);

    const validPatterns = ['active-development', 'configured', 'installed', 'dormant', 'unknown'];
    analyzed.forEach(tool => {
      assert.ok(validPatterns.includes(tool.usage.pattern));
    });
  });

  it('should provide usage indicators', async () => {
    const analyzed = await analyzer.analyzeUsage(mockTools);

    analyzed.forEach(tool => {
      assert.ok(Array.isArray(tool.usage.indicators));
      // If there are indicators, they should be strings or objects
      if (tool.usage.indicators.length > 0) {
        tool.usage.indicators.forEach(indicator => {
          assert.ok(typeof indicator === 'string' || typeof indicator === 'object');
        });
      }
    });
  });
});

describe('IntelligenceAnalyzer', () => {
  const analyzer = new IntelligenceAnalyzer({
    projectRoot: process.cwd(),
    intelligenceMode: 'smart'
  });

  const mockTools = [
    { name: 'node', type: 'language', status: 'active', metadata: {}, source: 'system' },
    { name: 'npm', type: 'package-manager', status: 'active', metadata: {}, source: 'system' },
    { name: 'git', type: 'version-control', status: 'active', metadata: {}, source: 'system' }
  ];

  const mockAnalysisResult = {
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    environment: {
      platform: 'linux',
      nodeVersion: 'v22.0.0',
      workingDirectory: process.cwd()
    },
    scanDuration: 1000,
    tools: mockTools,
    overlaps: [],
    validation: { valid: true, issues: [], warnings: [] },
    summary: {
      totalTools: mockTools.length,
      byStatus: { active: mockTools.length },
      byCategory: {},
      overlapCount: 0,
      validationIssues: 0
    }
  };

  it('should perform complete intelligent analysis', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    assert.ok(intelligence);
    assert.ok(intelligence.projectIntelligence);
    assert.ok(intelligence.tools);
    assert.ok(intelligence.summary);
    assert.ok(Array.isArray(intelligence.recommendations));
    assert.ok(Array.isArray(intelligence.optimizationOpportunities));
    assert.ok(intelligence.aiContext);
  });

  it('should detect project intelligence', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    assert.ok(intelligence.projectIntelligence.type);
    assert.ok(Array.isArray(intelligence.projectIntelligence.languages));
    assert.ok(typeof intelligence.projectIntelligence.confidence === 'number');
  });

  it('should organize tools by relevance', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    assert.ok(intelligence.tools.active);
    assert.ok(intelligence.tools.available);
    assert.ok(intelligence.tools.noise);
    assert.ok(intelligence.tools.all);
    assert.ok(Array.isArray(intelligence.tools.all));
  });

  it('should generate intelligent summary', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    assert.ok(intelligence.summary.description);
    assert.ok(intelligence.summary.maturity);
    assert.ok(typeof intelligence.summary.maturityScore === 'number');
    assert.ok(typeof intelligence.summary.total === 'number');
    assert.ok(typeof intelligence.summary.active === 'number');
  });

  it('should provide recommendations', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    assert.ok(Array.isArray(intelligence.recommendations));
    intelligence.recommendations.forEach(rec => {
      assert.ok(rec.type);
      assert.ok(rec.priority);
      assert.ok(rec.action);
      assert.ok(rec.reason);
    });
  });

  it('should generate AI context', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    assert.ok(intelligence.aiContext.conversationStarter);
    assert.ok(Array.isArray(intelligence.aiContext.keyTools));
    assert.ok(Array.isArray(intelligence.aiContext.focusAreas));
  });

  it('should filter tools by mode', async () => {
    const intelligence = await analyzer.analyze(mockTools, mockAnalysisResult);

    const allMode = analyzer.filterByMode(intelligence, 'all');
    const smartMode = analyzer.filterByMode(intelligence, 'smart');
    const projectMode = analyzer.filterByMode(intelligence, 'project-optimized');

    assert.ok(Array.isArray(allMode));
    assert.ok(Array.isArray(smartMode));
    assert.ok(Array.isArray(projectMode));

    // All mode should include everything
    assert.ok(allMode.length >= smartMode.length);
  });
});

describe('Intelligence Integration', () => {
  it('should work end-to-end', async () => {
    const detector = new ProjectTypeDetector({ projectRoot: process.cwd() });
    const scorer = new RelevanceScorer();
    const usageAnalyzer = new UsageAnalyzer({ projectRoot: process.cwd() });

    const mockTools = [
      { name: 'node', type: 'language', status: 'active', metadata: {}, source: 'system' },
      { name: 'npm', type: 'package-manager', status: 'active', metadata: {}, source: 'system' }
    ];

    // Step 1: Detect project type
    const projectType = await detector.detect();
    assert.ok(projectType);

    // Step 2: Analyze usage
    const withUsage = await usageAnalyzer.analyzeUsage(mockTools);
    assert.ok(withUsage.every(t => t.usage));

    // Step 3: Score relevance
    const withRelevance = await scorer.scoreTools(withUsage, projectType);
    assert.ok(withRelevance.every(t => t.relevance));

    // Step 4: Group by relevance
    const grouped = scorer.groupByRelevance(withRelevance);
    assert.ok(grouped.active || grouped.available || grouped.noise);
  });
});
