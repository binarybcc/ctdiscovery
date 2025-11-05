/**
 * CTDiscovery API Tests
 *
 * Comprehensive test suite for the programmatic API
 */

import { describe, it, before } from 'node:test';
import assert from 'node:assert/strict';
import { CTDiscovery, quickScan, generateContext as generateContextHelper } from '../index.js';

describe('CTDiscovery API', () => {
  let ctd;

  before(() => {
    ctd = new CTDiscovery({ timeout: 10000, verbose: false });
  });

  describe('Constructor', () => {
    it('should create instance with default options', () => {
      const instance = new CTDiscovery();
      assert.ok(instance);
      const config = instance.getConfig();
      assert.ok(config.timeout);
    });

    it('should create instance with custom options', () => {
      const instance = new CTDiscovery({ timeout: 5000, verbose: true });
      const config = instance.getConfig();
      assert.equal(config.timeout, 5000);
      assert.equal(config.verbose, true);
    });
  });

  describe('scan()', () => {
    it('should scan environment successfully', async () => {
      const results = await ctd.scan();

      assert.ok(results);
      assert.ok(results.timestamp);
      assert.ok(results.environment);
      assert.ok(results.tools);
      assert.equal(typeof results.scanDuration, 'number');
    });

    it('should include environment data', async () => {
      const results = await ctd.scan();

      assert.ok(results.environment.platform);
      assert.ok(results.environment.nodeVersion);
      assert.ok(results.environment.workingDirectory);
    });

    it('should include tools data', async () => {
      const results = await ctd.scan();

      assert.ok(results.tools);
      assert.ok(typeof results.tools === 'object');
    });
  });

  describe('analyze()', () => {
    it('should analyze scan results successfully', async () => {
      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);

      assert.ok(analysis);
      assert.ok(analysis.tools);
      assert.ok(Array.isArray(analysis.tools));
      assert.ok(analysis.summary);
      assert.equal(typeof analysis.summary.totalTools, 'number');
    });

    it('should include summary statistics', async () => {
      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);

      assert.ok(analysis.summary);
      assert.ok(analysis.summary.byStatus);
      assert.ok(analysis.summary.byCategory);
      assert.equal(typeof analysis.summary.overlapCount, 'number');
    });

    it('should detect overlaps', async () => {
      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);

      assert.ok(Array.isArray(analysis.overlaps));
    });

    it('should throw error for invalid input', async () => {
      await assert.rejects(
        async () => await ctd.analyze(null),
        /Invalid scan results/
      );
    });
  });

  describe('format()', () => {
    let analysis;

    before(async () => {
      const scanResults = await ctd.scan();
      analysis = await ctd.analyze(scanResults);
    });

    it('should format as JSON', async () => {
      const json = await ctd.format(analysis, 'json');

      assert.ok(json);
      assert.ok(typeof json === 'string');
      const parsed = JSON.parse(json);
      assert.ok(parsed.tools);
    });

    it('should format as Markdown', async () => {
      const markdown = await ctd.format(analysis, 'markdown');

      assert.ok(markdown);
      assert.ok(typeof markdown === 'string');
      assert.ok(markdown.includes('#'));
    });

    it('should format as Text', async () => {
      const text = await ctd.format(analysis, 'text');

      assert.ok(text);
      assert.ok(typeof text === 'string');
    });

    it('should throw error for invalid format', async () => {
      await assert.rejects(
        async () => await ctd.format(analysis, 'invalid'),
        /Unknown format/
      );
    });
  });

  describe('generateContext()', () => {
    it('should generate AI context', async () => {
      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);
      const context = await ctd.generateContext(analysis);

      assert.ok(context);
      assert.ok(context.markdown);
      assert.ok(typeof context.markdown === 'string');
      assert.ok(context.metadata);
    });

    it('should include conversation starter', async () => {
      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);
      const context = await ctd.generateContext(analysis, {
        includeConversationStarter: true
      });

      assert.ok(context.conversationStarter);
    });

    it('should include recommendations', async () => {
      const scanResults = await ctd.scan();
      const analysis = await ctd.analyze(scanResults);
      const context = await ctd.generateContext(analysis, {
        includeRecommendations: true
      });

      assert.ok(Array.isArray(context.recommendations));
    });
  });

  describe('scanAndAnalyze()', () => {
    it('should scan and analyze in one call', async () => {
      const analysis = await ctd.scanAndAnalyze();

      assert.ok(analysis);
      assert.ok(analysis.tools);
      assert.ok(analysis.summary);
    });
  });

  describe('run()', () => {
    it('should run complete workflow with JSON format', async () => {
      const output = await ctd.run('json');

      assert.ok(output);
      assert.ok(typeof output === 'string');
      const parsed = JSON.parse(output);
      assert.ok(parsed.tools);
    });

    it('should run complete workflow with markdown format', async () => {
      const output = await ctd.run('markdown');

      assert.ok(output);
      assert.ok(typeof output === 'string');
      assert.ok(output.includes('#'));
    });
  });

  describe('Configuration', () => {
    it('should get current configuration', () => {
      const config = ctd.getConfig();

      assert.ok(config);
      assert.ok(typeof config.timeout === 'number');
    });

    it('should update configuration', () => {
      const newTimeout = 8000;
      ctd.updateConfig({ timeout: newTimeout });

      const config = ctd.getConfig();
      assert.equal(config.timeout, newTimeout);
    });
  });

  describe('Caching', () => {
    it('should cache results', async () => {
      const ctdWithCache = new CTDiscovery({
        enableCache: true,
        cacheTTL: 60000
      });

      const results1 = await ctdWithCache.scan();
      const results2 = await ctdWithCache.scan();

      // Second call should be much faster (cached)
      assert.ok(results1.timestamp === results2.timestamp);
    });

    it('should clear cache', async () => {
      ctd.clearCache();

      const results = await ctd.scan();
      assert.ok(results);
    });
  });
});

describe('Helper Functions', () => {
  describe('quickScan()', () => {
    it('should perform quick scan', async () => {
      const analysis = await quickScan({ timeout: 10000 });

      assert.ok(analysis);
      assert.ok(analysis.tools);
      assert.ok(analysis.summary);
    });
  });

  describe('generateContext()', () => {
    it('should generate context with helper', async () => {
      const context = await generateContextHelper({ timeout: 10000 });

      assert.ok(context);
      assert.ok(context.markdown);
      assert.ok(typeof context.markdown === 'string');
    });
  });
});
