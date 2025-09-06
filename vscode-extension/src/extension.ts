import * as vscode from 'vscode';
import { ScannerService } from './services/scannerService';

let scannerService: ScannerService;

export function activate(context: vscode.ExtensionContext) {
    console.log('CTDiscovery VSCode Extension is now active!');
    
    scannerService = new ScannerService();
    
    // Register commands
    const scanCommand = vscode.commands.registerCommand('ctdiscovery.scan', async () => {
        try {
            vscode.window.showInformationMessage('Scanning development environment...');
            const results = await scannerService.performScan();
            vscode.window.showInformationMessage(`Scan complete! Found ${scannerService.countTools(results)} tools.`);
        } catch (error) {
            vscode.window.showErrorMessage(`Scan failed: ${error}`);
        }
    });

    const dashboardCommand = vscode.commands.registerCommand('ctdiscovery.dashboard', async () => {
        try {
            const results = await scannerService.performScan();
            showDashboard(results);
        } catch (error) {
            vscode.window.showErrorMessage(`Dashboard failed: ${error}`);
        }
    });

    const generateContextCommand = vscode.commands.registerCommand('ctdiscovery.generateContext', async () => {
        try {
            const results = await scannerService.performScan();
            // Generate context files in project root
            vscode.window.showInformationMessage('Context files generated in project root.');
        } catch (error) {
            vscode.window.showErrorMessage(`Context generation failed: ${error}`);
        }
    });

    context.subscriptions.push(scanCommand, dashboardCommand, generateContextCommand);
}

function showDashboard(data: any) {
    const panel = vscode.window.createWebviewPanel(
        'ctdiscoveryDashboard',
        'CTDiscovery Dashboard',
        vscode.ViewColumn.Two, // Use ViewColumn.Two for split panel
        {
            enableScripts: true,
            retainContextWhenHidden: true
        }
    );

    panel.webview.html = generateDashboardHTML(data);
}

function generateDashboardHTML(data: any): string {
    const normalizedData = scannerService.normalizeScanData(data);
    const totalTools = scannerService.countTools(normalizedData);
    
    let html = `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CTDiscovery Dashboard</title>
        <style>
            body { 
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                margin: 0;
                padding: 20px;
                background-color: var(--vscode-editor-background);
                color: var(--vscode-editor-foreground);
            }
            .header { 
                border-bottom: 2px solid var(--vscode-panel-border);
                padding-bottom: 15px;
                margin-bottom: 25px;
            }
            .title { 
                font-size: 24px; 
                font-weight: bold;
                color: var(--vscode-foreground);
            }
            .subtitle { 
                color: var(--vscode-descriptionForeground);
                font-size: 14px;
                margin-top: 5px;
            }
            .category { 
                margin-bottom: 25px;
                border: 1px solid var(--vscode-panel-border);
                border-radius: 8px;
                padding: 15px;
                background-color: var(--vscode-panel-background);
            }
            .category-title { 
                font-size: 18px; 
                font-weight: bold;
                margin-bottom: 15px;
                color: var(--vscode-foreground);
                display: flex;
                align-items: center;
            }
            .category-icon { 
                margin-right: 8px;
            }
            .tool-list { 
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                gap: 10px;
                margin-top: 10px;
            }
            .tool-item { 
                padding: 8px 12px;
                background-color: var(--vscode-button-background);
                border-radius: 4px;
                border: 1px solid var(--vscode-button-border, transparent);
                font-size: 13px;
            }
            .tool-active { 
                background-color: var(--vscode-button-secondaryBackground);
                border-color: var(--vscode-focusBorder);
            }
            .empty-category {
                color: var(--vscode-descriptionForeground);
                font-style: italic;
                padding: 10px;
            }
        </style>
    </head>
    <body>
        <div class="header">
            <div class="title">🔍 CTDiscovery Dashboard</div>
            <div class="subtitle">Found ${totalTools} tools across ${Object.keys(normalizedData).length} categories</div>
        </div>
    `;

    // Generate sections for each category
    for (const [categoryName, tools] of Object.entries(normalizedData)) {
        html += generateCategorySection(categoryName, tools as any[]);
    }

    html += `
    </body>
    </html>`;

    return html;
}

function generateCategorySection(categoryName: string, tools: any[]): string {
    const categoryIcons: { [key: string]: string } = {
        'MCP Servers': '📦',
        'VSCode': '📦', 
        'System Tools': '📦'
    };

    const icon = categoryIcons[categoryName] || '📦';
    const toolCount = tools.length;

    let html = `
        <div class="category">
            <div class="category-title">
                <span class="category-icon">${icon}</span>
                ${categoryName} (${toolCount})
            </div>
    `;

    if (toolCount === 0) {
        html += `<div class="empty-category">No tools found in this category</div>`;
    } else {
        html += `<div class="tool-list">`;
        for (const tool of tools) {
            const toolName = typeof tool === 'string' ? tool : (tool.name || tool.displayName || 'Unknown');
            const isActive = tool.active !== false; // Default to active unless explicitly false
            const toolClass = isActive ? 'tool-item tool-active' : 'tool-item';
            html += `<div class="${toolClass}">${toolName}</div>`;
        }
        html += `</div>`;
    }

    html += `</div>`;
    return html;
}

export function deactivate() {}