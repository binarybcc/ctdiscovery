import * as vscode from 'vscode';
import * as path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export interface ScanResult {
    scanTime: number;
    toolCount: number;
    status: 'success' | 'error';
    data: {
        vscode: any[];
        systemTools: any[];
        mcpServers: any[];
    };
    error?: string;
}

export class ScannerService {
    private ctdPath: string;
    private lastScanResult: ScanResult | null = null;

    constructor() {
        // Try to find CTDiscovery installation
        this.ctdPath = this.findCTDiscoveryPath();
    }

    private findCTDiscoveryPath(): string {
        // Check if CTDiscovery is globally installed
        const globalPaths = [
            'ctdiscovery',
            'ctd',
            path.join(process.env.HOME || '', 'ctdiscovery', 'src', 'cli.js'),
            // Add more potential paths
        ];

        return globalPaths[0]; // Start with global command, fallback logic can be added
    }

    async performScan(): Promise<ScanResult> {
        const startTime = Date.now();
        
        try {
            // Get the workspace root
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            
            let command = `node "${this.ctdPath}" --json --quiet`;
            let options = {};
            
            if (workspaceRoot) {
                options = { cwd: workspaceRoot };
            }

            const { stdout, stderr } = await execAsync(command, options);
            
            if (stderr) {
                console.warn('CTDiscovery stderr:', stderr);
            }

            const scanData = JSON.parse(stdout);
            const scanTime = Date.now() - startTime;

            this.lastScanResult = {
                scanTime,
                toolCount: this.countTools(scanData),
                status: 'success',
                data: this.normalizeScanData(scanData)
            };

            return this.lastScanResult;

        } catch (error) {
            const scanTime = Date.now() - startTime;
            
            this.lastScanResult = {
                scanTime,
                toolCount: 0,
                status: 'error',
                data: { vscode: [], systemTools: [], mcpServers: [] },
                error: error instanceof Error ? error.message : String(error)
            };

            throw error;
        }
    }

    private countTools(scanData: any): number {
        let count = 0;
        
        if (scanData.status?.vscode?.data) {
            count += scanData.status.vscode.data.length;
        }
        
        if (scanData.status?.systemTools?.data) {
            count += scanData.status.systemTools.data.length;
        }
        
        if (scanData.status?.mcpServers?.data) {
            count += scanData.status.mcpServers.data.length;
        }
        
        return count;
    }

    private normalizeScanData(scanData: any) {
        return {
            vscode: scanData.status?.vscode?.data || [],
            systemTools: scanData.status?.systemTools?.data || [],
            mcpServers: scanData.status?.mcpServers?.data || []
        };
    }

    async generateAIContext(): Promise<string> {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            
            let command = `node "${this.ctdPath}" --generate-context --quiet`;
            let options = {};
            
            if (workspaceRoot) {
                options = { cwd: workspaceRoot };
            }

            const { stdout } = await execAsync(command, options);
            return stdout;

        } catch (error) {
            throw new Error(`Failed to generate AI context: ${error}`);
        }
    }

    getLastScanResult(): ScanResult | null {
        return this.lastScanResult;
    }

    async generateConversationStarter(): Promise<string> {
        try {
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            
            let command = `node "${this.ctdPath}" --conversation-starter --quiet`;
            let options = {};
            
            if (workspaceRoot) {
                options = { cwd: workspaceRoot };
            }

            const { stdout } = await execAsync(command, options);
            return stdout;

        } catch (error) {
            throw new Error(`Failed to generate conversation starter: ${error}`);
        }
    }
}