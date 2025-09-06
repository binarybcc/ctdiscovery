import * as vscode from 'vscode';
import { ScannerService } from './services/scannerService';

let scannerService: ScannerService;

export function activate(context: vscode.ExtensionContext) {
    console.log('CTDiscovery VSCode Extension is now active!');
    
    scannerService = new ScannerService();
    
    // Only auto-scan if explicitly enabled by user
    const config = vscode.workspace.getConfiguration('ctdiscovery');
    if (config.get('autoScan', false)) {
        // Auto-scan on startup only if user enabled it
        scannerService.performScan().catch(error => {
            console.error('Auto-scan failed:', error);
        });
    }
    // Register commands
    const scanCommand = vscode.commands.registerCommand('ctdiscovery.scan', async () => {
        vscode.window.showInformationMessage('Scanning development environment...');
        try {
            await scannerService.performScan();
            ctdProvider.refresh();
            vscode.window.showInformationMessage('Environment scan complete!');
        } catch (error) {
            vscode.window.showErrorMessage(`Scan failed: ${error}`);
        }
    });

    const dashboardCommand = vscode.commands.registerCommand('ctdiscovery.dashboard', async () => {
        // Create and show a webview panel with the dashboard
        const panel = vscode.window.createWebviewPanel(
            'ctdiscoveryDashboard',
            'CTDiscovery Dashboard',
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true
            }
        );

        try {
            const scanResults = await scannerService.performScan();
            panel.webview.html = generateDashboardHTML(scanResults);
        } catch (error) {
            panel.webview.html = generateErrorHTML(`Failed to generate dashboard: ${error}`);
        }
    });

    const generateContextCommand = vscode.commands.registerCommand('ctdiscovery.generateContext', async () => {
        try {
            const context = await scannerService.generateAIContext();
            
            // Create a new untitled document with the context
            const doc = await vscode.workspace.openTextDocument({
                content: context,
                language: 'markdown'
            });
            
            await vscode.window.showTextDocument(doc);
            vscode.window.showInformationMessage('AI context generated and opened!');
        } catch (error) {
            vscode.window.showErrorMessage(`Context generation failed: ${error}`);
        }
    });

    // Auto-scan on startup if enabled
    const config = vscode.workspace.getConfiguration('ctdiscovery');
    if (config.get('autoScan', true)) {
        vscode.commands.executeCommand('ctdiscovery.scan');
    }

    // Set up periodic refresh if configured
    const scanInterval = config.get('scanInterval', 300000); // 5 minutes default
    if (scanInterval > 0) {
        setInterval(() => {
            vscode.commands.executeCommand('ctdiscovery.scan');
        }, scanInterval);
    }

    context.subscriptions.push(scanCommand, dashboardCommand, generateContextCommand);
}

export function deactivate() {}

function generateDashboardHTML(scanResults: any): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CTDiscovery Dashboard</title>
        <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-foreground); }
            .header { border-bottom: 1px solid var(--vscode-panel-border); padding-bottom: 10px; margin-bottom: 20px; }
            .section { margin-bottom: 20px; }
            .tool-item { padding: 8px; margin: 4px 0; border-radius: 4px; background: var(--vscode-editor-background); }
            .active { color: var(--vscode-charts-green); }
            .inactive { color: var(--vscode-charts-red); }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔍 CTDiscovery Dashboard</h1>
            <p>AI Development Environment Status</p>
        </div>
        <div class="section">
            <h2>📊 Scan Results</h2>
            <pre>${JSON.stringify(scanResults, null, 2)}</pre>
        </div>
    </body>
    </html>
    `;
}

function generateErrorHTML(error: string): string {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CTDiscovery Error</title>
        <style>
            body { font-family: var(--vscode-font-family); color: var(--vscode-errorForeground); }
        </style>
    </head>
    <body>
        <h1>❌ Error</h1>
        <p>${error}</p>
    </body>
    </html>
    `;
}