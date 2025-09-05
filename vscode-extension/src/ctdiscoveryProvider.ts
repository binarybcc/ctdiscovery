import * as vscode from 'vscode';
import { ScannerService, ScanResult } from './services/scannerService';

export class CTDiscoveryProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | null | void> = new vscode.EventEmitter<TreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    constructor(private scannerService: ScannerService) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: TreeItem): Promise<TreeItem[]> {
        if (!element) {
            // Root level items
            return this.getRootItems();
        }

        // Child items based on parent category
        return this.getChildItems(element);
    }

    private async getRootItems(): Promise<TreeItem[]> {
        const scanResult = this.scannerService.getLastScanResult();
        
        if (!scanResult) {
            return [
                new TreeItem('No scan data available', vscode.TreeItemCollapsibleState.None, 'info'),
                new TreeItem('Click "Scan Development Environment" to start', vscode.TreeItemCollapsibleState.None, 'info')
            ];
        }

        if (scanResult.status === 'error') {
            return [
                new TreeItem(`Scan Error: ${scanResult.error}`, vscode.TreeItemCollapsibleState.None, 'error'),
                new TreeItem('Check CTDiscovery installation', vscode.TreeItemCollapsibleState.None, 'warning')
            ];
        }

        const items: TreeItem[] = [
            new TreeItem(
                `📊 Scan completed in ${scanResult.scanTime}ms`,
                vscode.TreeItemCollapsibleState.None,
                'success'
            ),
            new TreeItem(
                `🔧 ${scanResult.toolCount} tools detected`,
                vscode.TreeItemCollapsibleState.None,
                'info'
            )
        ];

        // Add category sections
        if (scanResult.data.vscode.length > 0) {
            items.push(new TreeItem(
                `📦 VSCode Extensions (${scanResult.data.vscode.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'category',
                'vscode'
            ));
        }

        if (scanResult.data.systemTools.length > 0) {
            items.push(new TreeItem(
                `🛠️ System Tools (${scanResult.data.systemTools.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'category',
                'systemTools'
            ));
        }

        if (scanResult.data.mcpServers.length > 0) {
            items.push(new TreeItem(
                `🔌 MCP Servers (${scanResult.data.mcpServers.length})`,
                vscode.TreeItemCollapsibleState.Collapsed,
                'category',
                'mcpServers'
            ));
        }

        return items;
    }

    private getChildItems(element: TreeItem): TreeItem[] {
        const scanResult = this.scannerService.getLastScanResult();
        
        if (!scanResult || !element.contextValue) {
            return [];
        }

        switch (element.contextValue) {
            case 'vscode':
                return scanResult.data.vscode.map(ext => 
                    new TreeItem(
                        `${ext.displayName || ext.name} v${ext.version}`,
                        vscode.TreeItemCollapsibleState.None,
                        'extension',
                        undefined,
                        ext.description || `By ${ext.publisher}`,
                        ext.variant ? `$(package) ${ext.variant}` : '$(extensions)'
                    )
                );

            case 'systemTools':
                return scanResult.data.systemTools.map(tool => 
                    new TreeItem(
                        `${tool.name} ${tool.version ? `v${tool.version}` : ''}`,
                        vscode.TreeItemCollapsibleState.None,
                        'tool',
                        undefined,
                        tool.description || tool.path || 'System tool',
                        '$(tools)'
                    )
                );

            case 'mcpServers':
                return scanResult.data.mcpServers.map(server => 
                    new TreeItem(
                        server.name || 'Unknown Server',
                        vscode.TreeItemCollapsibleState.None,
                        'server',
                        undefined,
                        server.description || server.command || 'MCP Server',
                        '$(server-process)'
                    )
                );

            default:
                return [];
        }
    }
}

export class TreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly itemType: 'success' | 'error' | 'warning' | 'info' | 'category' | 'extension' | 'tool' | 'server',
        public readonly contextValue?: string,
        public readonly description?: string,
        iconPath?: string | vscode.ThemeIcon
    ) {
        super(label, collapsibleState);
        
        this.tooltip = this.description || this.label;
        this.contextValue = contextValue || itemType;
        
        // Set icons based on item type
        if (iconPath) {
            this.iconPath = typeof iconPath === 'string' ? new vscode.ThemeIcon(iconPath) : iconPath;
        } else {
            switch (itemType) {
                case 'success':
                    this.iconPath = new vscode.ThemeIcon('check', new vscode.ThemeColor('charts.green'));
                    break;
                case 'error':
                    this.iconPath = new vscode.ThemeIcon('error', new vscode.ThemeColor('charts.red'));
                    break;
                case 'warning':
                    this.iconPath = new vscode.ThemeIcon('warning', new vscode.ThemeColor('charts.yellow'));
                    break;
                case 'info':
                    this.iconPath = new vscode.ThemeIcon('info', new vscode.ThemeColor('charts.blue'));
                    break;
                case 'category':
                    this.iconPath = new vscode.ThemeIcon('folder');
                    break;
                case 'extension':
                    this.iconPath = new vscode.ThemeIcon('extensions');
                    break;
                case 'tool':
                    this.iconPath = new vscode.ThemeIcon('tools');
                    break;
                case 'server':
                    this.iconPath = new vscode.ThemeIcon('server-process');
                    break;
            }
        }
    }
}