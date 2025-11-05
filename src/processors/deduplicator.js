/**
 * Deduplicator
 *
 * Removes duplicate tool entries from scan results
 */

export class Deduplicator {
  constructor(options = {}) {
    this.options = {
      preferSource: options.preferSource || ['active', 'system', 'config'],
      ...options
    };
  }

  /**
   * Deduplicate tools
   *
   * @param {Array<Tool>} tools - Array of tool entries
   * @returns {Promise<Array<Tool>>} Deduplicated tools
   */
  async deduplicate(tools) {
    if (!Array.isArray(tools)) {
      return [];
    }

    const uniqueTools = new Map();

    for (const tool of tools) {
      const key = this._generateKey(tool);

      if (!uniqueTools.has(key)) {
        uniqueTools.set(key, tool);
      } else {
        // Merge with existing entry, preferring better source
        const existing = uniqueTools.get(key);
        const merged = this._mergeTool(existing, tool);
        uniqueTools.set(key, merged);
      }
    }

    return Array.from(uniqueTools.values());
  }

  /**
   * Generate unique key for tool
   * @private
   */
  _generateKey(tool) {
    return `${tool.type || 'unknown'}:${tool.name}`.toLowerCase();
  }

  /**
   * Merge two tool entries, preferring the better one
   * @private
   */
  _mergeTool(existing, newTool) {
    // Prefer active over available
    if (newTool.status === 'active' && existing.status !== 'active') {
      return this._mergeMetadata(newTool, existing);
    }

    if (existing.status === 'active' && newTool.status !== 'active') {
      return this._mergeMetadata(existing, newTool);
    }

    // Prefer based on source hierarchy
    const existingPriority = this._getSourcePriority(existing.source);
    const newPriority = this._getSourcePriority(newTool.source);

    if (newPriority > existingPriority) {
      return this._mergeMetadata(newTool, existing);
    }

    return this._mergeMetadata(existing, newTool);
  }

  /**
   * Merge metadata from both tools
   * @private
   */
  _mergeMetadata(primary, secondary) {
    return {
      ...primary,
      metadata: {
        ...secondary.metadata,
        ...primary.metadata
      },
      sources: [
        ...(primary.sources || [primary.source]),
        ...(secondary.sources || [secondary.source])
      ].filter((s, i, arr) => arr.indexOf(s) === i) // unique
    };
  }

  /**
   * Get priority for source (higher = better)
   * @private
   */
  _getSourcePriority(source) {
    const priorities = {
      'active': 3,
      'system': 2,
      'config': 2,
      'detected': 1,
      'default': 0
    };

    for (const [key, priority] of Object.entries(priorities)) {
      if (source?.includes(key)) {
        return priority;
      }
    }

    return 0;
  }
}

export default Deduplicator;
