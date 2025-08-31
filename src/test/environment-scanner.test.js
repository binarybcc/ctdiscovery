import { describe, it, before } from 'node:test';
import assert from 'node:assert';
import { EnvironmentScanner } from '../scanners/environment-scanner.js';

describe('EnvironmentScanner', () => {
  let scanner;

  before(() => {
    scanner = new EnvironmentScanner();
  });

  it('should initialize with required scanners', () => {
    assert.ok(scanner.mcpScanner, 'MCP scanner should be initialized');
    assert.ok(scanner.vscodeScanner, 'VSCode scanner should be initialized');
    assert.ok(scanner.systemScanner, 'System scanner should be initialized');
    assert.ok(scanner.sequentialScanner, 'Sequential scanner should be initialized');
  });

  it('should complete scan within timeout limit', async () => {
    const startTime = Date.now();
    const results = await scanner.scan();
    const duration = Date.now() - startTime;
    
    assert.ok(duration < 4000, `Scan should complete under 4 seconds, took ${duration}ms`);
    assert.ok(results.timestamp, 'Should include timestamp');
    assert.ok(results.environment, 'Should include environment info');
  });

  it('should include platform information', async () => {
    const results = await scanner.scan();
    
    assert.strictEqual(results.environment.platform, process.platform);
    assert.strictEqual(results.environment.nodeVersion, process.version);
    assert.ok(results.environment.workingDirectory, 'Should include working directory');
  });

  it('should handle graceful degradation', async () => {
    // Create scanner with very short timeout to force degradation
    const timeoutScanner = new EnvironmentScanner({ 
      totalTimeout: 100,
      scannerTimeout: 50 
    });
    
    const results = await timeoutScanner.scan();
    
    // Should still return results even with timeouts
    assert.ok(results.timestamp, 'Should return results even with errors');
    assert.ok(results.degradation, 'Should include degradation information');
  });

  it('should detect Claude Code configuration', async () => {
    const results = await scanner.scan();
    const claudeCode = results.status.claudeCode;
    
    assert.ok(typeof claudeCode.configPresent === 'boolean', 'Should check config presence');
    assert.ok(typeof claudeCode.documentationPresent === 'boolean', 'Should check docs presence');
    assert.ok(claudeCode.status, 'Should determine overall Claude Code status');
  });

  it('should provide performance metrics', async () => {
    const results = await scanner.scan();
    
    assert.ok(results.metrics, 'Should include metrics');
    assert.ok(typeof results.metrics.performance === 'object', 'Should include performance data');
    assert.ok(typeof results.scanDuration === 'number', 'Should include scan duration');
  });

  it('should handle errors without crashing', async () => {
    // This test should not throw, even if scanners fail
    try {
      const results = await scanner.scan();
      assert.ok(results, 'Should return results even with internal errors');
    } catch (error) {
      assert.fail(`Scanner should handle errors gracefully, but threw: ${error.message}`);
    }
  });
});