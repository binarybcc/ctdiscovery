/**
 * Tools Tree Provider
 *
 * Provides tree view of discovered tools
 */

export class ToolsTreeProvider {
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
      // Root level - return categories
      return this.data.treeItems?.tools || [];
    }

    // Return children of the element
    return element.children || [];
  }

  registerChangeEvent(emitter) {
    this._onDidChangeTreeData = emitter;
  }
}

export default ToolsTreeProvider;
