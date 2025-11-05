/**
 * Processors Tests
 *
 * Test suite for processing layer components
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Deduplicator, OverlapDetector, Enricher, Validator } from '../index.js';

describe('Deduplicator', () => {
  const deduplicator = new Deduplicator();

  it('should remove duplicate tools', async () => {
    const tools = [
      { name: 'git', type: 'version-control', status: 'active', source: 'system' },
      { name: 'git', type: 'version-control', status: 'available', source: 'config' }
    ];

    const deduplicated = await deduplicator.deduplicate(tools);

    assert.equal(deduplicated.length, 1);
    assert.equal(deduplicated[0].name, 'git');
  });

  it('should prefer active status', async () => {
    const tools = [
      { name: 'docker', type: 'container', status: 'available', source: 'system' },
      { name: 'docker', type: 'container', status: 'active', source: 'config' }
    ];

    const deduplicated = await deduplicator.deduplicate(tools);

    assert.equal(deduplicated.length, 1);
    assert.equal(deduplicated[0].status, 'active');
  });

  it('should handle empty array', async () => {
    const deduplicated = await deduplicator.deduplicate([]);
    assert.equal(deduplicated.length, 0);
  });
});

describe('OverlapDetector', () => {
  const detector = new OverlapDetector();

  it('should detect package manager overlaps', async () => {
    const tools = [
      { name: 'npm', type: 'package-manager', status: 'active' },
      { name: 'yarn', type: 'package-manager', status: 'active' },
      { name: 'pnpm', type: 'package-manager', status: 'active' }
    ];

    const overlaps = await detector.detect(tools);

    const packageManagerOverlap = overlaps.find(o => o.type === 'package-manager-overlap');
    assert.ok(packageManagerOverlap);
    assert.ok(packageManagerOverlap.tools.length >= 2);
  });

  it('should detect container tool overlaps', async () => {
    const tools = [
      { name: 'docker', type: 'container', status: 'active' },
      { name: 'podman', type: 'container', status: 'active' }
    ];

    const overlaps = await detector.detect(tools);

    const containerOverlap = overlaps.find(o => o.type === 'container-tool-overlap');
    assert.ok(containerOverlap);
  });

  it('should handle tools with no overlaps', async () => {
    const tools = [
      { name: 'git', type: 'version-control', status: 'active' },
      { name: 'node', type: 'language', status: 'active' }
    ];

    const overlaps = await detector.detect(tools);

    // May have system tool overlaps, but not package manager or container overlaps
    assert.ok(Array.isArray(overlaps));
  });

  it('should handle empty array', async () => {
    const overlaps = await detector.detect([]);
    assert.equal(overlaps.length, 0);
  });
});

describe('Enricher', () => {
  const enricher = new Enricher();

  it('should enrich tools with metadata', async () => {
    const tools = [
      { name: 'git', type: 'version-control', status: 'active', metadata: {} }
    ];

    const enriched = await enricher.enrich(tools);

    assert.ok(enriched[0].metadata.capabilities);
    assert.ok(Array.isArray(enriched[0].metadata.capabilities));
  });

  it('should add AI relevance score', async () => {
    const tools = [
      { name: 'claude', type: 'ai-assistant', status: 'active', metadata: {} }
    ];

    const enriched = await enricher.enrich(tools);

    assert.ok(typeof enriched[0].aiRelevance === 'number');
    assert.ok(enriched[0].aiRelevance >= 0 && enriched[0].aiRelevance <= 100);
  });

  it('should add platform compatibility', async () => {
    const tools = [
      { name: 'node', type: 'language', status: 'active', metadata: {} }
    ];

    const enriched = await enricher.enrich(tools);

    assert.ok(Array.isArray(enriched[0].platformCompatibility));
  });

  it('should handle empty array', async () => {
    const enriched = await enricher.enrich([]);
    assert.equal(enriched.length, 0);
  });
});

describe('Validator', () => {
  const validator = new Validator();

  it('should validate valid tools', async () => {
    const tools = [
      { name: 'git', type: 'version-control', status: 'active', source: 'system', metadata: {} }
    ];

    const validation = await validator.validate(tools);

    assert.ok(validation.valid);
    assert.equal(validation.issues.length, 0);
  });

  it('should detect missing name', async () => {
    const tools = [
      { type: 'version-control', status: 'active', source: 'system' }
    ];

    const validation = await validator.validate(tools);

    assert.equal(validation.valid, false);
    assert.ok(validation.issues.length > 0);
  });

  it('should detect invalid status', async () => {
    const tools = [
      { name: 'git', type: 'version-control', status: 'invalid-status', source: 'system' }
    ];

    const validation = await validator.validate(tools);

    assert.ok(validation.warnings.length > 0);
  });

  it('should handle empty array', async () => {
    const validation = await validator.validate([]);

    assert.ok(validation.valid);
    assert.equal(validation.toolCount, 0);
  });

  it('should return error for non-array input', async () => {
    const validation = await validator.validate(null);

    assert.equal(validation.valid, false);
    assert.ok(validation.issues.length > 0);
  });
});
