/**
 * Overlap Detector
 *
 * Detects conflicts and overlaps between tools
 */

import { DuplicationDetector } from '../utils/duplication-detector.js';

export class OverlapDetector {
  constructor(options = {}) {
    this.options = options;
    this.duplicationDetector = new DuplicationDetector();
  }

  /**
   * Detect overlaps between tools
   *
   * @param {Array<Tool>} tools - Array of tools
   * @returns {Promise<Array<Overlap>>} Array of detected overlaps
   */
  async detect(tools) {
    if (!Array.isArray(tools) || tools.length === 0) {
      return [];
    }

    const overlaps = [];

    // Use existing duplication detector for system tools
    try {
      const systemToolOverlaps = this.duplicationDetector.detectSystemToolOverlaps(tools);
      if (systemToolOverlaps && systemToolOverlaps.length > 0) {
        // Convert to our overlap format
        for (const overlap of systemToolOverlaps) {
          overlaps.push({
            type: overlap.category || 'tool-overlap',
            tools: overlap.tools || [],
            reason: overlap.reason || 'Tools have overlapping functionality',
            severity: overlap.severity || 'info',
            recommendation: overlap.recommendation || this._getRecommendation(overlap.tools)
          });
        }
      }
    } catch (error) {
      // If duplication detector fails, continue with other detection
      console.warn('Duplication detector failed:', error.message);
    }

    // Detect category-specific overlaps
    overlaps.push(...this._detectPackageManagerOverlaps(tools));
    overlaps.push(...this._detectContainerToolOverlaps(tools));
    overlaps.push(...this._detectVersionControlOverlaps(tools));

    return overlaps;
  }

  /**
   * Detect package manager overlaps
   * @private
   */
  _detectPackageManagerOverlaps(tools) {
    const packageManagers = tools.filter(t =>
      t.type === 'package-manager' || t.category === 'package-manager'
    );

    if (packageManagers.length <= 1) {
      return [];
    }

    // Group by language ecosystem
    const byEcosystem = {
      node: ['npm', 'yarn', 'pnpm', 'bun'],
      python: ['pip', 'poetry', 'pipenv'],
      ruby: ['gem', 'bundler'],
      rust: ['cargo'],
      go: ['go']
    };

    const overlaps = [];

    for (const [ecosystem, managers] of Object.entries(byEcosystem)) {
      const found = packageManagers.filter(pm =>
        managers.includes(pm.name.toLowerCase())
      );

      if (found.length > 1) {
        overlaps.push({
          type: 'package-manager-overlap',
          tools: found.map(pm => pm.name),
          reason: `Multiple ${ecosystem} package managers detected`,
          severity: 'warning',
          recommendation: `Consider standardizing on one ${ecosystem} package manager`
        });
      }
    }

    return overlaps;
  }

  /**
   * Detect container tool overlaps
   * @private
   */
  _detectContainerToolOverlaps(tools) {
    const containerTools = ['docker', 'podman', 'containerd', 'nerdctl'];
    const found = tools.filter(t =>
      containerTools.includes(t.name.toLowerCase())
    );

    if (found.length > 1) {
      return [{
        type: 'container-tool-overlap',
        tools: found.map(t => t.name),
        reason: 'Multiple container runtimes detected',
        severity: 'info',
        recommendation: 'Docker and Podman can coexist, but ensure compatibility'
      }];
    }

    return [];
  }

  /**
   * Detect version control overlaps
   * @private
   */
  _detectVersionControlOverlaps(tools) {
    const vcsTools = ['git', 'svn', 'hg', 'mercurial'];
    const found = tools.filter(t =>
      vcsTools.includes(t.name.toLowerCase())
    );

    if (found.length > 1) {
      return [{
        type: 'vcs-overlap',
        tools: found.map(t => t.name),
        reason: 'Multiple version control systems detected',
        severity: 'info',
        recommendation: 'Git is the industry standard for most projects'
      }];
    }

    return [];
  }

  /**
   * Get recommendation for overlapping tools
   * @private
   */
  _getRecommendation(tools) {
    // Basic recommendation logic
    const active = tools.filter(t => t.status === 'active');

    if (active.length === 0) {
      return `Choose one of: ${tools.map(t => t.name).join(', ')}`;
    }

    if (active.length === 1) {
      return `Continue using ${active[0].name}`;
    }

    return `Multiple tools are active. Consider consolidating to ${active[0].name}`;
  }
}

export default OverlapDetector;
