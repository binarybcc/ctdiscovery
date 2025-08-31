import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { MCPScanner } from './mcp-scanner.js';
import { VSCodeScanner } from './vscode-scanner.js';
import { SystemToolScanner } from './system-tool-scanner.js';
import { SequentialScanner } from '../utils/sequential-scanner.js';
import { ErrorHandler } from '../utils/error-handler.js';

export class EnvironmentScanner {
  constructor(options = {}) {
    this.mcpScanner = new MCPScanner();
    this.vscodeScanner = new VSCodeScanner();
    this.systemScanner = new SystemToolScanner();
    
    this.sequentialScanner = new SequentialScanner({
      totalTimeout: options.totalTimeout || 3000,
      scannerTimeout: options.scannerTimeout || 2000
    });
    
    this.errorHandler = new ErrorHandler();
  }

  async scan() {
    const startTime = Date.now();
    
    // Prepare scanner list
    const scanners = [
      this.mcpScanner,
      this.vscodeScanner, 
      this.systemScanner
    ];

    try {
      // Run sequential scan with timeout management
      const scanResult = await this.sequentialScanner.runSequentialScan(scanners);
      
      // Add Claude Code scan (lightweight, no timeout needed)
      const claudeCodeResult = this.scanClaudeCode();
      scanResult.scanResults.claudeCode = claudeCodeResult;

      // Build final results structure
      const results = {
        timestamp: new Date().toISOString(),
        scanDuration: Date.now() - startTime,
        environment: {
          platform: process.platform,
          nodeVersion: process.version,
          workingDirectory: process.cwd()
        },
        status: scanResult.scanResults,
        metrics: {
          ...scanResult.scanMetrics,
          performance: this.sequentialScanner.getPerformanceMetrics()
        },
        degradation: this.sequentialScanner.getDegradationSummary(),
        errors: scanResult.errorSummary
      };

      return results;
      
    } catch (error) {
      // Handle catastrophic scanner failure
      const errorResult = this.errorHandler.handle(error, 'Environment Scanner', {
        strategy: 'fallback',
        severity: 'error',
        userMessage: 'Environment scan failed - using minimal detection',
        fallbackData: this.getMinimalResults()
      });

      return errorResult.data;
    }
  }

  getMinimalResults() {
    return {
      timestamp: new Date().toISOString(),
      scanDuration: 0,
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        workingDirectory: process.cwd()
      },
      status: {
        error: 'Minimal scan mode - full scan failed'
      },
      metrics: null,
      degradation: {
        hasIssues: true,
        issueCount: 1,
        userMessages: ['Environment scan failed - using fallback detection']
      }
    };
  }

  scanClaudeCode() {
    const claudeConfigPath = path.join(process.cwd(), '.claude/settings.local.json');
    const claudeMdPath = path.join(process.cwd(), 'CLAUDE.md');
    
    return {
      configPresent: existsSync(claudeConfigPath),
      documentationPresent: existsSync(claudeMdPath),
      permissions: this.getClaudePermissions(claudeConfigPath),
      status: existsSync(claudeConfigPath) && existsSync(claudeMdPath) ? 'configured' : 'partial'
    };
  }

  getClaudePermissions(configPath) {
    if (!existsSync(configPath)) return null;
    
    try {
      const config = JSON.parse(readFileSync(configPath, 'utf8'));
      return {
        allowCount: config.permissions?.allow?.length || 0,
        denyCount: config.permissions?.deny?.length || 0,
        hasGitAccess: config.permissions?.allow?.some(p => p.includes('git')) || false,
        hasNodeAccess: config.permissions?.allow?.some(p => p.includes('npm')) || false
      };
    } catch {
      return null;
    }
  }
}