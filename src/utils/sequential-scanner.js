/**
 * Sequential Scanner with Timeouts
 * Implements sequential scanning strategy per startup checklist decisions
 */

import { ErrorHandler } from './error-handler.js';

export class SequentialScanner {
  constructor(options = {}) {
    this.totalTimeout = options.totalTimeout || 3000; // 3 seconds total
    this.scannerTimeout = options.scannerTimeout || 2000; // 2 seconds per scanner
    this.errorHandler = new ErrorHandler();
    this.results = {};
    this.scanStartTime = null;
  }

  /**
   * Run scanners sequentially with timeout management
   * @param {Array} scanners - Array of scanner instances
   * @param {Object} options - Scanning options
   */
  async runSequentialScan(scanners, options = {}) {
    this.scanStartTime = Date.now();
    const results = {
      timestamp: new Date().toISOString(),
      totalDuration: 0,
      completed: [],
      failed: [],
      skipped: [],
      timeouts: [],
      errors: [],
      status: 'running'
    };

    console.log(`🔍 Starting sequential scan of ${scanners.length} scanners...`);

    for (let i = 0; i < scanners.length; i++) {
      const scanner = scanners[i];
      const scannerStartTime = Date.now();
      
      // Check total time budget
      const elapsedTotal = Date.now() - this.scanStartTime;
      const remainingTime = this.totalTimeout - elapsedTotal;
      
      if (remainingTime <= 0) {
        console.log(`⏰ Total timeout reached - skipping remaining ${scanners.length - i} scanners`);
        
        // Mark remaining scanners as skipped
        for (let j = i; j < scanners.length; j++) {
          results.skipped.push({
            name: scanners[j].name,
            reason: 'total_timeout_reached'
          });
        }
        break;
      }

      // Adjust scanner timeout based on remaining time
      const effectiveTimeout = Math.min(this.scannerTimeout, remainingTime - 100); // 100ms buffer
      
      try {
        console.log(`📊 Scanning ${scanner.name} (timeout: ${effectiveTimeout}ms)...`);
        
        const scannerResult = await this.runWithTimeout(
          scanner.scan(),
          effectiveTimeout,
          `${scanner.name} scan`
        );

        const duration = Date.now() - scannerStartTime;
        results.completed.push({
          name: scanner.name,
          duration: duration,
          toolCount: scannerResult.data?.length || 0,
          status: scannerResult.status
        });

        // Store scanner results
        this.results[scanner.category] = {
          ...scannerResult,
          scanDuration: duration
        };

        console.log(`✅ ${scanner.name} completed in ${duration}ms`);

      } catch (error) {
        const duration = Date.now() - scannerStartTime;
        
        if (error.name === 'TimeoutError') {
          console.log(`⏰ ${scanner.name} timed out after ${effectiveTimeout}ms`);
          
          results.timeouts.push({
            name: scanner.name,
            timeout: effectiveTimeout,
            duration: duration
          });

          // Handle timeout with graceful degradation
          const errorResult = this.errorHandler.handleScannerError(scanner.name, error, {
            strategy: 'continue',
            severity: 'warning',
            fallbackData: { status: 'timeout', data: [], errors: ['Scan timed out'] }
          });

          this.results[scanner.category] = errorResult.data;

        } else {
          console.log(`❌ ${scanner.name} failed: ${error.message}`);
          
          results.failed.push({
            name: scanner.name,
            error: error.message,
            duration: duration
          });

          // Handle other errors with graceful degradation
          const errorResult = this.errorHandler.handleScannerError(scanner.name, error, {
            strategy: 'continue',
            severity: 'error'
          });

          this.results[scanner.category] = errorResult.data || {
            status: 'failed',
            data: [],
            errors: [error.message]
          };
        }

        results.errors.push({
          scanner: scanner.name,
          error: error.message,
          type: error.name || 'Error'
        });
      }
    }

    // Calculate final results
    results.totalDuration = Date.now() - this.scanStartTime;
    results.status = this.determineFinalStatus(results);
    
    console.log(`🏁 Sequential scan completed in ${results.totalDuration}ms`);
    console.log(`📊 Results: ${results.completed.length} completed, ${results.failed.length} failed, ${results.skipped.length} skipped`);

    return {
      scanResults: this.results,
      scanMetrics: results,
      errorSummary: this.errorHandler.getErrorSummary()
    };
  }

  /**
   * Run a promise with timeout
   */
  async runWithTimeout(promise, timeoutMs, operationName) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        const error = new Error(`${operationName} timed out after ${timeoutMs}ms`);
        error.name = 'TimeoutError';
        error.timeout = timeoutMs;
        reject(error);
      }, timeoutMs);

      promise
        .then(result => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }

  /**
   * Determine final scan status based on results
   */
  determineFinalStatus(results) {
    const total = results.completed.length + results.failed.length + results.skipped.length;
    const successful = results.completed.length;
    
    if (successful === total) return 'success';
    if (successful === 0) return 'failed';
    if (results.timeouts.length > 0) return 'partial_timeout';
    return 'partial_success';
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    if (!this.scanStartTime) return null;

    const totalDuration = Date.now() - this.scanStartTime;
    const scannerResults = Object.values(this.results);
    
    return {
      totalDuration: totalDuration,
      averageScannerTime: scannerResults.reduce((sum, r) => sum + (r.scanDuration || 0), 0) / scannerResults.length,
      timeoutBudgetUsed: (totalDuration / this.totalTimeout) * 100,
      scannersCompleted: scannerResults.filter(r => r.status === 'success').length,
      toolsDetected: scannerResults.reduce((sum, r) => sum + (r.data?.length || 0), 0)
    };
  }

  /**
   * Check if we should abort remaining scans
   */
  shouldAbortRemaining() {
    const elapsed = Date.now() - this.scanStartTime;
    const timeRemaining = this.totalTimeout - elapsed;
    
    // Abort if less than 200ms remaining (need buffer for cleanup)
    return timeRemaining < 200;
  }

  /**
   * Create user-friendly progress indicator
   */
  getProgressIndicator(currentIndex, totalScanners) {
    const elapsed = Date.now() - this.scanStartTime;
    const progress = currentIndex / totalScanners;
    const estimatedTotal = elapsed / progress;
    const eta = estimatedTotal - elapsed;

    return {
      progress: Math.round(progress * 100),
      elapsed: elapsed,
      eta: Math.max(0, eta),
      withinBudget: estimatedTotal <= this.totalTimeout
    };
  }

  /**
   * Get graceful degradation summary for user display
   */
  getDegradationSummary() {
    const summary = this.errorHandler.getErrorSummary();
    const userMessages = this.errorHandler.getUserMessages();
    
    return {
      hasIssues: summary.totalErrors > 0,
      issueCount: summary.totalErrors,
      criticalIssues: summary.bySeverity.error || 0,
      warnings: summary.bySeverity.warning || 0,
      userMessages: userMessages,
      recommendation: this.getRecommendation(summary)
    };
  }

  getRecommendation(errorSummary) {
    if (errorSummary.bySeverity.error > 0) {
      return 'Some scanners failed - try running with --verbose for detailed error information';
    }
    
    if (errorSummary.bySeverity.warning > 2) {
      return 'Multiple warnings detected - consider checking tool installations';
    }
    
    if (errorSummary.totalErrors === 0) {
      return 'All scanners completed successfully!';
    }
    
    return 'Scan completed with minor issues - results should be reliable';
  }
}