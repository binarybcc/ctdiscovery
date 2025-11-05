/**
 * Environment View Provider
 *
 * Provides environment information in the VSCode sidebar
 */

export class EnvironmentViewProvider {
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
      // Root level
      return this.data.treeItems?.environment || [];
    }

    return element.children || [];
  }

  registerChangeEvent(emitter) {
    this._onDidChangeTreeData = emitter;
  }
}

export default EnvironmentViewProvider;
