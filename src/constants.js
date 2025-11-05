/**
 * CTDiscovery Constants
 *
 * Centralized constants used across the system
 */

/**
 * Tool status indicators
 */
export const TOOL_STATUSES = {
  ACTIVE: 'active',           // Currently running or actively configured
  AVAILABLE: 'available',     // Installed and usable but not active
  DETECTED: 'detected',       // Found but status unclear
  MISSING: 'missing',         // Expected but not found
  ERROR: 'error'             // Error during detection
};

/**
 * Tool categories for organization and filtering
 */
export const TOOL_CATEGORIES = {
  MCP_SERVER: 'mcp-server',
  VSCODE_EXTENSION: 'vscode-extension',
  SYSTEM_TOOL: 'system-tool',
  LANGUAGE: 'language',
  PACKAGE_MANAGER: 'package-manager',
  AI_ASSISTANT: 'ai-assistant',
  VERSION_CONTROL: 'version-control',
  BUILD_TOOL: 'build-tool',
  CONTAINER_TOOL: 'container-tool',
  DEVELOPMENT: 'development'
};

/**
 * Scan result status
 */
export const SCAN_STATUS = {
  SUCCESS: 'success',         // Scan completed successfully
  PARTIAL: 'partial',        // Some methods failed but got results
  FAILED: 'failed'           // Complete failure
};

/**
 * Default configuration values
 */
export const DEFAULTS = {
  TIMEOUT_TOTAL: 3000,        // Total scan timeout (ms)
  TIMEOUT_PER_SCANNER: 2000,  // Per-scanner timeout (ms)
  ENABLE_CACHE: true,         // Enable result caching
  CACHE_TTL: 60000,          // Cache TTL (ms)
  VERBOSE: false,            // Verbose output
  INCLUDE_MCP: true,         // Include MCP scanner
  INCLUDE_VSCODE: true,      // Include VSCode scanner
  INCLUDE_SYSTEM_TOOLS: true // Include system tools scanner
};

/**
 * Error handling strategies
 */
export const ERROR_STRATEGIES = {
  CONTINUE: 'continue',      // Log and continue with partial results
  SUPPRESS: 'suppress',      // Suppress after threshold
  RETRY: 'retry',           // Retry with backoff
  FALLBACK: 'fallback'      // Use fallback method
};

/**
 * Output formats
 */
export const OUTPUT_FORMATS = {
  JSON: 'json',
  MARKDOWN: 'markdown',
  TEXT: 'text',
  HTML: 'html'
};

/**
 * Scanner types
 */
export const SCANNER_TYPES = {
  MCP: 'mcp',
  VSCODE: 'vscode',
  SYSTEM_TOOLS: 'system-tools',
  ENVIRONMENT: 'environment'
};

/**
 * Platform identifiers
 */
export const PLATFORMS = {
  DARWIN: 'darwin',
  WIN32: 'win32',
  LINUX: 'linux'
};

/**
 * API version
 */
export const API_VERSION = '2.0.0';

export default {
  TOOL_STATUSES,
  TOOL_CATEGORIES,
  SCAN_STATUS,
  DEFAULTS,
  ERROR_STRATEGIES,
  OUTPUT_FORMATS,
  SCANNER_TYPES,
  PLATFORMS,
  API_VERSION
};
