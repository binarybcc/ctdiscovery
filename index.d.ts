// Type definitions for ctdiscovery v2.0.0
// Project: https://github.com/binarybcc/ctdiscovery
// Definitions by: binarybcc <https://github.com/binarybcc>

declare module 'ctdiscovery' {
  // ============================================================================
  // Constants
  // ============================================================================

  export const VERSION: string;
  export const NAME: string;

  export const TOOL_STATUSES: {
    ACTIVE: 'active';
    AVAILABLE: 'available';
    DETECTED: 'detected';
    MISSING: 'missing';
    ERROR: 'error';
  };

  export const TOOL_CATEGORIES: {
    MCP_SERVER: 'mcp-server';
    VSCODE_EXTENSION: 'vscode-extension';
    SYSTEM_TOOL: 'system-tool';
    LANGUAGE: 'language';
    PACKAGE_MANAGER: 'package-manager';
    AI_ASSISTANT: 'ai-assistant';
    VERSION_CONTROL: 'version-control';
    BUILD_TOOL: 'build-tool';
    CONTAINER_TOOL: 'container-tool';
    DEVELOPMENT: 'development';
  };

  export type ToolStatus = typeof TOOL_STATUSES[keyof typeof TOOL_STATUSES];
  export type ToolCategory = typeof TOOL_CATEGORIES[keyof typeof TOOL_CATEGORIES];

  // ============================================================================
  // Tool and Scan Result Types
  // ============================================================================

  export interface Tool {
    name: string;
    type: string;
    status: ToolStatus;
    source: string;
    metadata?: {
      version?: string;
      path?: string;
      capabilities?: string[];
      documentation?: string;
      examples?: string[];
      [key: string]: any;
    };
    validation?: {
      validated: boolean;
      validatedAt?: string;
      issues?: string[];
    };
    category?: string;
    aiRelevance?: number;
    platformCompatibility?: string[];
  }

  export interface ScanResult {
    status: 'success' | 'partial' | 'failed';
    data: Tool[];
    method: {
      name: string;
      status: string;
      duration: number;
      platform: string;
    };
    overlaps?: Overlap[];
    errors?: Error[];
    warnings?: string[];
  }

  export interface ScanResults {
    timestamp: string;
    scanDuration: number;
    environment: {
      platform: 'darwin' | 'win32' | 'linux';
      nodeVersion: string;
      workingDirectory: string;
    };
    tools: {
      mcp?: ScanResult;
      vscode?: ScanResult;
      systemTools?: ScanResult;
      claudeCode?: any;
      [key: string]: ScanResult | any;
    };
    metrics?: {
      performance?: any;
      degradation?: any[];
    };
    apiVersion?: string;
  }

  export interface Overlap {
    type: string;
    tools: string[];
    reason: string;
    severity: 'error' | 'warning' | 'info';
    recommendation?: string;
  }

  export interface ValidationResult {
    valid: boolean;
    issues: Array<{
      severity: 'error' | 'warning';
      tool?: number;
      field?: string;
      message: string;
    }>;
    warnings: Array<{
      severity: 'warning';
      tool?: number;
      field?: string;
      message: string;
    }>;
    toolCount?: number;
    validToolCount?: number;
  }

  export interface AnalysisResult {
    version: string;
    timestamp: string;
    environment: {
      platform: string;
      nodeVersion: string;
      workingDirectory: string;
    };
    scanDuration: number;
    tools: Tool[];
    overlaps: Overlap[];
    validation: ValidationResult;
    metrics: any;
    summary: {
      totalTools: number;
      byStatus: Record<string, number>;
      byCategory: Record<string, number>;
      overlapCount: number;
      validationIssues: number;
    };
  }

  // ============================================================================
  // Intelligence Layer Types
  // ============================================================================

  export interface ProjectIntelligence {
    type: string;
    languages: string[];
    frameworks: string[];
    packageManagers: string[];
    buildSystems: string[];
    capabilities: string[];
    confidence: number;
  }

  export interface UsagePattern {
    pattern: 'active-development' | 'configured' | 'installed' | 'dormant' | 'unknown';
    indicators: string[];
    lastActivity?: string;
    frequency?: 'daily' | 'weekly' | 'monthly' | 'rare' | 'unknown';
    confidence: number;
    configurationMaturity?: 'mature' | 'configured' | 'basic' | 'installed-only' | 'unknown';
    active: boolean;
  }

  export interface ToolRelevance {
    score: number;
    level: 'critical' | 'high' | 'medium' | 'low' | 'irrelevant';
    category: 'essential' | 'recommended' | 'optional' | 'noise';
    reasons: string[];
    breakdown: {
      ecosystem: number;
      configured: number;
      active: number;
      capability: number;
      standard: number;
    };
  }

  export interface ToolWithIntelligence extends Tool {
    usage?: UsagePattern;
    relevance: ToolRelevance;
  }

  export interface IntelligentSummary {
    description: string;
    maturity: 'mature' | 'configured' | 'basic' | 'minimal';
    maturityScore: number;
    capabilities: string[];
    keyTools: string[];
    total: number;
    active: number;
    available: number;
    filtered: number;
  }

  export interface Recommendation {
    type: 'install' | 'configure' | 'remove' | 'upgrade' | 'optimize';
    priority: 'high' | 'medium' | 'low';
    action: string;
    reason: string;
    tools?: string[];
  }

  export interface OptimizationOpportunity {
    type: 'redundancy' | 'upgrade' | 'configuration' | 'removal';
    impact: 'high' | 'medium' | 'low';
    suggestion: string;
    affected: string[];
  }

  export interface AIContext {
    conversationStarter: string;
    keyTools: Array<{
      name: string;
      purpose: string;
      relevance: number;
    }>;
    focusAreas: string[];
    environmentProfile: string;
  }

  export interface IntelligentAnalysisResult extends AnalysisResult {
    projectIntelligence: ProjectIntelligence;
    tools: ToolWithIntelligence[];
    toolsByRelevance: {
      active: ToolWithIntelligence[];
      available: ToolWithIntelligence[];
      filtered: ToolWithIntelligence[];
    };
    summary: IntelligentSummary;
    recommendations: Recommendation[];
    optimizationOpportunities: OptimizationOpportunity[];
    aiContext: AIContext;
  }

  export interface ContextObject {
    markdown: string;
    conversationStarter: string | null;
    recommendations: string[];
    metadata: {
      generatedAt: string;
      toolCount: number;
      totalToolCount: number;
    };
  }

  // ============================================================================
  // CTDiscovery Options
  // ============================================================================

  export interface CTDiscoveryOptions {
    timeout?: number;
    includeMCP?: boolean;
    includeVSCode?: boolean;
    includeSystemTools?: boolean;
    verbose?: boolean;
    enableCache?: boolean;
    cacheTTL?: number;
    intelligenceMode?: 'all' | 'smart' | 'project-optimized' | 'ai-context';
    config?: any;
  }

  export interface IntelligentAnalyzeOptions {
    mode?: 'all' | 'smart' | 'project-optimized' | 'ai-context';
  }

  export interface ScanOptions extends CTDiscoveryOptions {}

  export interface AnalysisOptions extends CTDiscoveryOptions {}

  export interface FormatOptions {
    pretty?: boolean;
    indent?: number;
    includeMetadata?: boolean;
    includeMetrics?: boolean;
    includeHeader?: boolean;
    includeTableOfContents?: boolean;
    width?: number;
  }

  export interface ContextGenerationOptions {
    includeConversationStarter?: boolean;
    includeRecommendations?: boolean;
    aiRelevanceThreshold?: number;
  }

  // ============================================================================
  // Main CTDiscovery Class
  // ============================================================================

  export default class CTDiscovery {
    constructor(options?: CTDiscoveryOptions);

    /**
     * Scan the development environment
     */
    scan(options?: ScanOptions): Promise<ScanResults>;

    /**
     * Analyze scan results
     */
    analyze(scanResults: ScanResults, options?: AnalysisOptions): Promise<AnalysisResult>;

    /**
     * Apply intelligent analysis to results
     */
    intelligentAnalyze(
      analysisResult: AnalysisResult,
      options?: IntelligentAnalyzeOptions
    ): Promise<IntelligentAnalysisResult>;

    /**
     * Format analysis result for output
     */
    format(
      analysisResult: AnalysisResult | IntelligentAnalysisResult,
      format?: 'json' | 'markdown' | 'text',
      options?: FormatOptions
    ): Promise<string>;

    /**
     * Generate AI assistant context
     */
    generateContext(
      analysisResult: AnalysisResult,
      options?: ContextGenerationOptions
    ): Promise<ContextObject>;

    /**
     * Scan and analyze in one call
     */
    scanAndAnalyze(options?: CTDiscoveryOptions): Promise<AnalysisResult>;

    /**
     * Complete workflow: scan, analyze, and format
     */
    run(format?: 'json' | 'markdown' | 'text', options?: CTDiscoveryOptions): Promise<string>;

    /**
     * Clear cached results
     */
    clearCache(): void;

    /**
     * Get current configuration
     */
    getConfig(): CTDiscoveryOptions;

    /**
     * Update configuration
     */
    updateConfig(updates: Partial<CTDiscoveryOptions>): void;
  }

  export { CTDiscovery };

  // ============================================================================
  // Scanners
  // ============================================================================

  export class MCPScanner {
    constructor();
    scan(options?: any): Promise<ScanResult>;
  }

  export class VSCodeScanner {
    constructor();
    scan(options?: any): Promise<ScanResult>;
  }

  export class SystemToolScanner {
    constructor();
    scan(options?: any): Promise<ScanResult>;
  }

  export class EnvironmentScanner {
    constructor();
    scan(options?: any): Promise<ScanResults>;
  }

  // ============================================================================
  // Processors
  // ============================================================================

  export class Deduplicator {
    constructor(options?: { preferSource?: string[] });
    deduplicate(tools: Tool[]): Promise<Tool[]>;
  }

  export class OverlapDetector {
    constructor(options?: any);
    detect(tools: Tool[]): Promise<Overlap[]>;
  }

  export class Enricher {
    constructor(options?: any);
    enrich(tools: Tool[], environment?: any): Promise<Tool[]>;
  }

  export class Validator {
    constructor(options?: { strict?: boolean });
    validate(tools: Tool[]): Promise<ValidationResult>;
    validateScanResults(scanResults: ScanResults): Promise<ValidationResult>;
  }

  // ============================================================================
  // Formatters
  // ============================================================================

  export class JSONFormatter {
    constructor(options?: { pretty?: boolean; indent?: number });
    format(analysisResult: AnalysisResult, options?: FormatOptions): Promise<string>;
  }

  export class MarkdownFormatter {
    constructor(options?: { includeHeader?: boolean; includeTableOfContents?: boolean });
    format(analysisResult: AnalysisResult, options?: FormatOptions): Promise<string>;
  }

  export class TextFormatter {
    constructor(options?: { width?: number });
    format(analysisResult: AnalysisResult, options?: FormatOptions): Promise<string>;
  }

  export class ContextGenerator {
    constructor(options?: ContextGenerationOptions);
    generate(
      analysisResult: AnalysisResult,
      options?: ContextGenerationOptions
    ): Promise<ContextObject>;
  }

  // ============================================================================
  // Intelligence Layer
  // ============================================================================

  export class ProjectTypeDetector {
    constructor(options?: { projectRoot?: string });
    detect(): Promise<ProjectIntelligence>;
    getRelevantToolEcosystem(projectType: string): string[];
  }

  export class RelevanceScorer {
    constructor(options?: any);
    scoreTools(tools: Tool[], projectType: ProjectIntelligence): Promise<ToolWithIntelligence[]>;
    filterByRelevance(tools: ToolWithIntelligence[], minScore?: number): ToolWithIntelligence[];
    groupByRelevance(tools: ToolWithIntelligence[]): {
      active: ToolWithIntelligence[];
      available: ToolWithIntelligence[];
      noise: ToolWithIntelligence[];
    };
  }

  export class UsageAnalyzer {
    constructor(options?: { projectRoot?: string });
    analyzeUsage(tools: Tool[]): Promise<Tool[]>;
  }

  export interface IntelligenceAnalyzerOptions {
    projectRoot?: string;
    intelligenceMode?: 'all' | 'smart' | 'project-optimized' | 'ai-context';
  }

  export class IntelligenceAnalyzer {
    constructor(options?: IntelligenceAnalyzerOptions);
    analyze(tools: Tool[], analysisResult: AnalysisResult): Promise<{
      projectIntelligence: ProjectIntelligence;
      tools: {
        active: ToolWithIntelligence[];
        available: ToolWithIntelligence[];
        noise: ToolWithIntelligence[];
        all: ToolWithIntelligence[];
      };
      summary: IntelligentSummary;
      recommendations: Recommendation[];
      optimizationOpportunities: OptimizationOpportunity[];
      aiContext: AIContext;
    }>;
    filterByMode(
      intelligence: any,
      mode: 'all' | 'smart' | 'project-optimized' | 'ai-context'
    ): ToolWithIntelligence[];
  }

  // ============================================================================
  // Utilities
  // ============================================================================

  export class ConfigManager {
    constructor(customConfig?: any);
    loadConfig(configPath?: string): any;
    validateConfig(config: any): boolean;
  }

  export class ErrorHandler {
    constructor();
    handle(error: Error, context: string, options?: any): any;
  }

  export class PlatformDetection {
    constructor();
    getPlatform(): 'darwin' | 'win32' | 'linux';
    getNodeVersion(): string;
  }

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Quick scan helper for simple use cases
   */
  export function quickScan(options?: CTDiscoveryOptions): Promise<AnalysisResult>;

  /**
   * Generate AI context helper
   */
  export function generateContext(options?: CTDiscoveryOptions): Promise<string>;
}

declare module 'ctdiscovery/api' {
  export { default as CTDiscovery } from 'ctdiscovery';
}

declare module 'ctdiscovery/scanners' {
  export {
    MCPScanner,
    VSCodeScanner,
    SystemToolScanner,
    EnvironmentScanner
  } from 'ctdiscovery';
}

declare module 'ctdiscovery/processors' {
  export { Deduplicator, OverlapDetector, Enricher, Validator } from 'ctdiscovery';
}

declare module 'ctdiscovery/formatters' {
  export {
    JSONFormatter,
    MarkdownFormatter,
    TextFormatter,
    ContextGenerator
  } from 'ctdiscovery';
}

declare module 'ctdiscovery/constants' {
  export { TOOL_STATUSES, TOOL_CATEGORIES } from 'ctdiscovery';
}

declare module 'ctdiscovery/intelligence' {
  export {
    ProjectTypeDetector,
    RelevanceScorer,
    UsageAnalyzer,
    IntelligenceAnalyzer,
    ProjectIntelligence,
    UsagePattern,
    ToolRelevance,
    ToolWithIntelligence,
    IntelligentSummary,
    IntelligentAnalysisResult,
    Recommendation,
    OptimizationOpportunity,
    AIContext
  } from 'ctdiscovery';
}
