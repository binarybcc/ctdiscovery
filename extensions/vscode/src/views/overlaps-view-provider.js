/**
 * Overlaps View Provider
 *
 * Displays tool overlaps and conflicts
 */

export class OverlapsViewProvider {
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
      return this.data.treeItems?.overlaps || [];
    }

    return element.children || [];
  }

  registerChangeEvent(emitter) {
    this._onDidChangeTreeData = emitter;
  }
}

export default OverlapsViewProvider;
