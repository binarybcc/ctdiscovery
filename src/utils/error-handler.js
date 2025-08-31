/**
 * Centralized Error Handler for Graceful Degradation
 * Implements graceful degradation strategy per startup checklist decisions
 */

export class ErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.suppressedErrors = new Set();
    this.errorLog = [];
  }

  /**
   * Handle errors with graceful degradation
   * @param {Error} error - The error object
   * @param {string} context - Where the error occurred
   * @param {Object} options - Error handling options
   */
  handle(error, context, options = {}) {
    const errorInfo = {
      timestamp: new Date().toISOString(),
      context: context,
      message: error.message,
      stack: error.stack,
      severity: options.severity || 'warning',
      recoverable: options.recoverable !== false
    };

    // Log error for debugging
    this.errorLog.push(errorInfo);
    
    // Track error frequency
    const errorKey = `${context}:${error.message}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Apply graceful degradation strategy
    switch (options.strategy || 'continue') {
      case 'suppress':
        return this.suppress(errorInfo, options);
      case 'retry':
        return this.retry(errorInfo, options);
      case 'fallback':
        return this.fallback(errorInfo, options);
      case 'continue':
      default:
        return this.continue(errorInfo, options);
    }
  }

  /**
   * Continue operation with warning
   */
  continue(errorInfo, options) {
    return {
      success: false,
      continue: true,
      error: errorInfo,
      userMessage: options.userMessage || `Warning: ${errorInfo.context} failed, continuing with partial results`,
      data: options.fallbackData || null
    };
  }

  /**
   * Suppress error after threshold
   */
  suppress(errorInfo, options) {
    const errorKey = `${errorInfo.context}:${errorInfo.message}`;
    const threshold = options.suppressAfter || 3;
    
    if (this.errorCounts.get(errorKey) >= threshold) {
      this.suppressedErrors.add(errorKey);
      return {
        success: false,
        continue: true,
        suppressed: true,
        error: errorInfo,
        userMessage: `${errorInfo.context} consistently failing - suppressed after ${threshold} attempts`
      };
    }

    return this.continue(errorInfo, options);
  }

  /**
   * Retry with backoff
   */
  async retry(errorInfo, options) {
    const maxRetries = options.maxRetries || 2;
    const baseDelay = options.baseDelay || 100;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        if (options.retryFunction) {
          const result = await options.retryFunction();
          return {
            success: true,
            continue: true,
            retrySuccess: true,
            attempts: attempt,
            data: result
          };
        }
      } catch (retryError) {
        if (attempt === maxRetries) {
          return this.continue({
            ...errorInfo,
            message: `Failed after ${maxRetries} retries: ${retryError.message}`
          }, options);
        }
        
        // Exponential backoff
        await this.delay(baseDelay * Math.pow(2, attempt - 1));
      }
    }
  }

  /**
   * Use fallback data/method
   */
  fallback(errorInfo, options) {
    return {
      success: options.fallbackData !== null,
      continue: true,
      usedFallback: true,
      error: errorInfo,
      userMessage: options.userMessage || `${errorInfo.context} failed, using fallback method`,
      data: options.fallbackData
    };
  }

  /**
   * Handle scanner-specific errors
   */
  handleScannerError(scannerName, error, options = {}) {
    const context = `Scanner: ${scannerName}`;
    
    // Common scanner error patterns
    if (error.message.includes('permission denied')) {
      return this.handle(error, context, {
        strategy: 'fallback',
        severity: 'warning',
        userMessage: `${scannerName} requires additional permissions - using limited detection`,
        fallbackData: { status: 'permission_limited', tools: [] },
        ...options
      });
    }

    if (error.message.includes('timeout')) {
      return this.handle(error, context, {
        strategy: 'continue',
        severity: 'warning', 
        userMessage: `${scannerName} scan timed out - may have missed some tools`,
        fallbackData: { status: 'timeout', tools: [] },
        ...options
      });
    }

    if (error.code === 'ENOENT') {
      return this.handle(error, context, {
        strategy: 'continue',
        severity: 'info',
        userMessage: `${scannerName} dependencies not found - skipping`,
        fallbackData: { status: 'not_applicable', tools: [] },
        ...options
      });
    }

    // Generic error handling
    return this.handle(error, context, {
      strategy: 'continue',
      severity: 'error',
      userMessage: `${scannerName} encountered an error - partial results may be available`,
      ...options
    });
  }

  /**
   * Handle configuration errors
   */
  handleConfigError(error, configPath, options = {}) {
    return this.handle(error, `Config: ${configPath}`, {
      strategy: 'fallback',
      severity: 'warning',
      userMessage: `Configuration error in ${configPath} - using defaults`,
      fallbackData: null,
      ...options
    });
  }

  /**
   * Get error summary for display
   */
  getErrorSummary() {
    const summary = {
      totalErrors: this.errorLog.length,
      bySeverity: {},
      byContext: {},
      suppressedCount: this.suppressedErrors.size,
      recentErrors: this.errorLog.slice(-10)
    };

    this.errorLog.forEach(error => {
      summary.bySeverity[error.severity] = (summary.bySeverity[error.severity] || 0) + 1;
      summary.byContext[error.context] = (summary.byContext[error.context] || 0) + 1;
    });

    return summary;
  }

  /**
   * Clear error history
   */
  clearErrors() {
    this.errorLog = [];
    this.errorCounts.clear();
    this.suppressedErrors.clear();
  }

  /**
   * Get user-friendly error messages for display
   */
  getUserMessages() {
    return this.errorLog
      .filter(error => error.severity !== 'debug')
      .map(error => ({
        context: error.context,
        message: error.userMessage || error.message,
        severity: error.severity,
        timestamp: error.timestamp
      }))
      .slice(-5); // Show last 5 user-relevant errors
  }

  /**
   * Utility function for delays
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if error should be suppressed
   */
  isSuppressed(context, message) {
    const errorKey = `${context}:${message}`;
    return this.suppressedErrors.has(errorKey);
  }
}