/**
 * VSCode Extension Commands
 *
 * Registers all commands for the extension
 */

export function registerCommands(context, components) {
  const {
    bridge,
    environmentView,
    toolsView,
    overlapsView,
    recommendationsView,
    statusBarItem
  } = components;

  // Import performScan, generateContext, syncTasks from extension.js
  // Since these are defined in extension.js, we'll reference them through context

  return {
    'ctdiscovery.scan': async () => {
      // Trigger scan - implementation in extension.js
      console.log('Scan command triggered');
    },
    'ctdiscovery.refresh': async () => {
      // Refresh views - implementation in extension.js
      console.log('Refresh command triggered');
    },
    'ctdiscovery.generateContext': async () => {
      // Generate AI context - implementation in extension.js
      console.log('Generate context command triggered');
    },
    'ctdiscovery.syncTasks': async () => {
      // Sync tasks - implementation in extension.js
      console.log('Sync tasks command triggered');
    },
    'ctdiscovery.showRecommendations': async () => {
      // Show recommendations - implementation in extension.js
      console.log('Show recommendations command triggered');
    },
    'ctdiscovery.openTool': async (tool) => {
      console.log('Open tool:', tool);
    },
    'ctdiscovery.copyToolInfo': async (tool) => {
      console.log('Copy tool info:', tool);
    }
  };
}

export default registerCommands;
