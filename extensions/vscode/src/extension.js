/**
 * CTDiscovery VSCode Extension
 *
 * Main entry point for the VSCode extension
 */

import * as vscode from 'vscode';
import { CTDiscoveryBridge } from './integration/ctdiscovery-bridge.js';
import { EnvironmentViewProvider } from './views/environment-view-provider.js';
import { ToolsTreeProvider } from './views/tools-tree-provider.js';
import { OverlapsViewProvider } from './views/overlaps-view-provider.js';
import { RecommendationsViewProvider } from './views/recommendations-view-provider.js';
import { registerCommands } from './commands/index.js';

/**
 * Extension state
 */
let bridge;
let environmentView;
let toolsView;
let overlapsView;
let recommendationsView;
let statusBarItem;
let autoRefreshTimer;

/**
 * Activate extension
 */
export async function activate(context) {
  console.log('CTDiscovery extension is activating...');

  // Initialize bridge
  bridge = new CTDiscoveryBridge({
    timeout: getConfig('timeout'),
    verbose: false
  });

  // Create view providers
  environmentView = new EnvironmentViewProvider(bridge);
  toolsView = new ToolsTreeProvider(bridge);
  overlapsView = new OverlapsViewProvider(bridge);
  recommendationsView = new RecommendationsViewProvider(bridge);

  // Register view providers
  context.subscriptions.push(
    vscode.window.registerTreeDataProvider(
      'ctdiscovery.environmentView',
      environmentView
    ),
    vscode.window.registerTreeDataProvider(
      'ctdiscovery.toolsView',
      toolsView
    ),
    vscode.window.registerTreeDataProvider(
      'ctdiscovery.overlapsView',
      overlapsView
    ),
    vscode.window.registerTreeDataProvider(
      'ctdiscovery.recommendationsView',
      recommendationsView
    )
  );

  // Create status bar item
  statusBarItem = vscode.window.createStatusBarItem(
    vscode.StatusBarAlignment.Right,
    100
  );
  statusBarItem.command = 'ctdiscovery.scan';
  statusBarItem.text = '$(gear) CTDiscovery';
  statusBarItem.tooltip = 'Click to scan environment';
  statusBarItem.show();
  context.subscriptions.push(statusBarItem);

  // Register commands
  registerCommands(context, {
    bridge,
    environmentView,
    toolsView,
    overlapsView,
    recommendationsView,
    statusBarItem
  });

  // Auto-scan on activation if enabled
  if (getConfig('autoScan')) {
    await performScan();
  }

  // Setup auto-refresh if configured
  const scanInterval = getConfig('scanInterval');
  if (scanInterval > 0) {
    autoRefreshTimer = setInterval(() => {
      performScan(true); // silent refresh
    }, scanInterval * 1000);

    context.subscriptions.push({
      dispose: () => clearInterval(autoRefreshTimer)
    });
  }

  // Watch for configuration changes
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('ctdiscovery')) {
        handleConfigurationChange();
      }
    })
  );

  // Watch for file changes that might affect tools
  if (vscode.workspace.workspaceFolders) {
    const watcher = vscode.workspace.createFileSystemWatcher(
      '**/package.json'
    );

    watcher.onDidChange(() => performScan(true));
    watcher.onDidCreate(() => performScan(true));
    watcher.onDidDelete(() => performScan(true));

    context.subscriptions.push(watcher);
  }

  console.log('CTDiscovery extension activated');
}

/**
 * Deactivate extension
 */
export function deactivate() {
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
  }

  console.log('CTDiscovery extension deactivated');
}

/**
 * Perform environment scan
 */
async function performScan(silent = false) {
  try {
    if (!silent) {
      statusBarItem.text = '$(sync~spin) Scanning...';
    }

    const results = await bridge.scanWorkspace(
      vscode.workspace.workspaceFolders?.[0]?.uri.fsPath
    );

    // Update all views
    environmentView.refresh(results);
    toolsView.refresh(results);
    overlapsView.refresh(results);
    recommendationsView.refresh(results);

    // Update status bar
    const toolCount = results.analysis?.summary?.totalTools || 0;
    statusBarItem.text = `$(check) CTDiscovery (${toolCount} tools)`;
    statusBarItem.tooltip = `Found ${toolCount} tools. Click to refresh.`;

    // Show notification if enabled
    if (!silent && getConfig('showNotifications')) {
      const activeCount = results.analysis?.summary?.byStatus?.active || 0;
      vscode.window.showInformationMessage(
        `CTDiscovery: Found ${toolCount} tools (${activeCount} active)`
      );
    }

    // Auto-generate context if enabled
    if (getConfig('generateContextOnChange')) {
      await generateContext(results, true);
    }

    // Auto-sync tasks if enabled
    if (getConfig('syncTasksAutomatically')) {
      await syncTasks(results, true);
    }

  } catch (error) {
    console.error('Scan failed:', error);
    statusBarItem.text = '$(error) CTDiscovery';
    statusBarItem.tooltip = `Scan failed: ${error.message}`;

    if (!silent) {
      vscode.window.showErrorMessage(
        `CTDiscovery scan failed: ${error.message}`
      );
    }
  }
}

/**
 * Generate AI context
 */
async function generateContext(results, silent = false) {
  try {
    const contextPath = getConfig('contextOutputPath');
    const context = results.context || await bridge.generateContext(results);

    // Write context file
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (workspaceFolder) {
      const uri = vscode.Uri.joinPath(workspaceFolder.uri, contextPath);
      await vscode.workspace.fs.writeFile(
        uri,
        Buffer.from(context.markdown, 'utf8')
      );

      if (!silent) {
        vscode.window.showInformationMessage(
          `Context generated: ${contextPath}`
        );
      }
    }

  } catch (error) {
    console.error('Context generation failed:', error);
    if (!silent) {
      vscode.window.showErrorMessage(
        `Context generation failed: ${error.message}`
      );
    }
  }
}

/**
 * Sync tools to tasks.json
 */
async function syncTasks(results, silent = false) {
  try {
    const tasks = bridge.generateTasks(results);

    // Read existing tasks.json
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    if (!workspaceFolder) return;

    const tasksUri = vscode.Uri.joinPath(
      workspaceFolder.uri,
      '.vscode',
      'tasks.json'
    );

    let existingTasks = { version: '2.0.0', tasks: [] };

    try {
      const content = await vscode.workspace.fs.readFile(tasksUri);
      existingTasks = JSON.parse(content.toString());
    } catch {
      // File doesn't exist, use default
    }

    // Merge tasks
    const mergedTasks = mergeTasks(existingTasks.tasks, tasks);
    existingTasks.tasks = mergedTasks;

    // Write back
    await vscode.workspace.fs.writeFile(
      tasksUri,
      Buffer.from(JSON.stringify(existingTasks, null, 2), 'utf8')
    );

    if (!silent) {
      vscode.window.showInformationMessage(
        `Synced ${tasks.length} tasks to .vscode/tasks.json`
      );
    }

  } catch (error) {
    console.error('Task sync failed:', error);
    if (!silent) {
      vscode.window.showErrorMessage(
        `Task sync failed: ${error.message}`
      );
    }
  }
}

/**
 * Merge discovered tasks with existing tasks
 */
function mergeTasks(existing, discovered) {
  const merged = [...existing];

  for (const task of discovered) {
    const existingIndex = merged.findIndex(t =>
      t.label === task.label || t.discoveredId === task.discoveredId
    );

    if (existingIndex >= 0) {
      // Update existing task
      merged[existingIndex] = { ...merged[existingIndex], ...task };
    } else {
      // Add new task
      merged.push(task);
    }
  }

  return merged;
}

/**
 * Handle configuration changes
 */
function handleConfigurationChange() {
  // Update bridge configuration
  bridge.updateConfig({
    timeout: getConfig('timeout')
  });

  // Setup/teardown auto-refresh
  const scanInterval = getConfig('scanInterval');
  if (autoRefreshTimer) {
    clearInterval(autoRefreshTimer);
    autoRefreshTimer = null;
  }

  if (scanInterval > 0) {
    autoRefreshTimer = setInterval(() => {
      performScan(true);
    }, scanInterval * 1000);
  }
}

/**
 * Get configuration value
 */
function getConfig(key) {
  return vscode.workspace.getConfiguration('ctdiscovery').get(key);
}

// Export for commands
export {
  bridge,
  performScan,
  generateContext,
  syncTasks
};
