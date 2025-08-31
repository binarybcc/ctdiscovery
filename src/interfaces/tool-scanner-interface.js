/**
 * Strict Plugin Interface Standard for CTDiscovery
 * All scanner plugins MUST implement this interface
 */

export class ToolScannerInterface {
  constructor() {
    if (new.target === ToolScannerInterface) {
      throw new Error('ToolScannerInterface cannot be instantiated directly');
    }
    
    this.name = '';           // REQUIRED: Human-readable scanner name
    this.category = '';       // REQUIRED: Function category for overlap detection  
    this.platform = 'macos'; // REQUIRED: Platform requirement
    this.version = '1.0.0';  // REQUIRED: Scanner version for compatibility
  }

  /**
   * MANDATORY: Primary scanning method
   * @returns {Promise<ScanResult>} Standardized scan result
   */
  async scan() {
    throw new Error('scan() method must be implemented by scanner plugin');
  }

  /**
   * MANDATORY: Validate scanner can function in current environment
   * @returns {Promise<ValidationResult>} Environment validation result
   */
  async validate() {
    throw new Error('validate() method must be implemented by scanner plugin');
  }

  /**
   * OPTIONAL: Detect functional overlaps with other tools
   * @param {Array} allDetectedTools - All tools found by all scanners
   * @returns {Array<OverlapResult>} Detected duplications
   */
  detectOverlaps(allDetectedTools) {
    return []; // Default: no overlap detection
  }

  /**
   * MANDATORY: Return scanner metadata
   * @returns {ScannerMetadata} Scanner information
   */
  getMetadata() {
    return {
      name: this.name,
      category: this.category,
      platform: this.platform,
      version: this.version,
      capabilities: this.getCapabilities()
    };
  }

  /**
   * MANDATORY: Return scanner capabilities
   * @returns {ScannerCapabilities} What this scanner can detect
   */
  getCapabilities() {
    throw new Error('getCapabilities() method must be implemented by scanner plugin');
  }
}

/**
 * Standardized Data Types
 */

export const TOOL_STATUSES = {
  ACTIVE: 'active',           // Currently running/configured
  AVAILABLE: 'available',     // Installed but not active
  DETECTED: 'detected',       // Found but status unknown
  MISSING: 'missing',         // Expected but not found
  ERROR: 'error'             // Scan failed for this tool
};

export const TOOL_CATEGORIES = {
  MCP_SERVER: 'mcp-server',
  VSCODE_EXTENSION: 'vscode-extension',
  SYSTEM_TOOL: 'system-tool',
  LANGUAGE: 'language',
  PACKAGE_MANAGER: 'package-manager',
  AI_ASSISTANT: 'ai-assistant',
  VERSION_CONTROL: 'version-control',
  BUILD_TOOL: 'build-tool'
};

export const SCAN_STATUSES = {
  SUCCESS: 'success',
  PARTIAL: 'partial',
  FAILED: 'failed',
  PERMISSION_DENIED: 'permission_denied',
  NOT_SUPPORTED: 'not_supported'
};

/**
 * TypeScript-style interfaces for documentation
 * (Will be enforced at runtime)
 */

/*
interface ScanResult {
  status: keyof typeof SCAN_STATUSES;
  data: ToolData[];
  method: {
    name: string;
    status: string;
    duration: number;
    platform: string;
  };
  overlaps?: OverlapResult[];
  errors?: string[];
  warnings?: string[];
}

interface ToolData {
  name: string;
  type: keyof typeof TOOL_CATEGORIES;
  status: keyof typeof TOOL_STATUSES;
  source: string;
  metadata: {
    version?: string;
    path?: string;
    capabilities?: string[];
    description?: string;
    configured?: boolean;
  };
  validation?: {
    functional: boolean;
    accessible: boolean;
    configured: boolean;
  };
}

interface OverlapResult {
  category: string;
  tools: string[];
  suggestion: string;
  severity: 'info' | 'warning' | 'conflict';
}
*/