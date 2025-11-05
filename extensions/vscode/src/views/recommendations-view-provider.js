/**
 * Recommendations View Provider
 *
 * Displays recommendations for tools and extensions
 */

export class RecommendationsViewProvider {
  constructor(bridge) {
    this.bridge = bridge;
    this._onDidChangeTreeData = null;
    this.data = null;
  }

  refresh(results) {
    this.data = results;
    if (this._onDidChangeTreeData) {
      this._onDidChangeTreeData.fire();
    }
  }

  getTreeItem(element) {
    return element;
  }

  async getChildren(element) {
    if (!this.data) {
      return [];
    }

    if (!element) {
      // Build recommendation items
      const items = [];

      if (this.data.recommendations) {
        for (const rec of this.data.recommendations) {
          items.push({
            label: rec.message,
            tooltip: rec.reason || rec.message,
            contextValue: rec.type,
            command: rec.action
          });
        }
      }

      return items;
    }

    return [];
  }

  registerChangeEvent(emitter) {
    this._onDidChangeTreeData = emitter;
  }
}

export default RecommendationsViewProvider;
