/**
 * Overlap Rules Plugin System
 * Extensible rules for detecting tool overlaps
 */

import { packageManagerRules } from './package-managers.js';
import { containerRules } from './container-tools.js';

// Plugin registry - users/community can add more rules here
export const OVERLAP_RULES = [
  packageManagerRules,
  containerRules
  // Add more rules here:
  // webServerRules,
  // databaseRules,
  // testingFrameworkRules,
  // etc.
];

/**
 * Execute all overlap detection rules
 * @param {Array} tools - Detected tools to analyze
 * @returns {Array} - All detected overlaps from all rules
 */
export function detectAllRuleOverlaps(tools) {
  const allOverlaps = [];
  
  for (const rule of OVERLAP_RULES) {
    try {
      const overlaps = rule.detect(tools);
      if (Array.isArray(overlaps)) {
        // Add rule metadata to each overlap
        const enrichedOverlaps = overlaps.map(overlap => ({
          ...overlap,
          rule: {
            name: rule.name,
            version: rule.version
          }
        }));
        allOverlaps.push(...enrichedOverlaps);
      }
    } catch (error) {
      // Rule failed - log error but continue with other rules
      console.warn(`Overlap rule '${rule.name}' failed:`, error.message);
    }
  }
  
  return allOverlaps;
}

/**
 * Get metadata about available overlap rules
 * @returns {Array} - Rule metadata
 */
export function getAvailableRules() {
  return OVERLAP_RULES.map(rule => ({
    name: rule.name,
    version: rule.version,
    enabled: true
  }));
}

/**
 * Template for creating new overlap rules
 */
export const OverlapRuleTemplate = {
  name: 'Rule Name',
  version: '1.0.0',
  
  /**
   * Detect overlaps in tool list
   * @param {Array} tools - Tools to analyze
   * @returns {Array} - Array of overlap objects
   */
  detect(tools) {
    // Implementation here
    return [];
  }
  
  // Optional helper methods can be added
};