import * as vscode from 'vscode';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';

const execAsync = promisify(exec);

export class ScannerService {
    
    async performScan(): Promise<any> {
        try {
            // Get the workspace root directory
            const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            if (!workspaceRoot) {
                throw new Error('No workspace folder found');
            }

            // Find the project root (where package.json with ctdiscovery exists)
            const projectRoot = this.findProjectRoot(workspaceRoot);
            
            // Run npm run scan from the project root
            const { stdout, stderr } = await execAsync('npm run scan', {
                cwd: projectRoot,
                timeout: 30000 // 30 second timeout
            });

            if (stderr && !stderr.includes('npm WARN')) {
                console.error('Scanner stderr:', stderr);
            }

            // Parse the CLI output to extract tool information
            return this.parseCLIOutput(stdout);

        } catch (error) {
            console.error('Scanner service error:', error);
            throw new Error(`Scanner failed: ${error}`);
        }
    }

    private findProjectRoot(startPath: string): string {
        let currentPath = startPath;
        
        // Keep going up directories until we find a package.json with ctdiscovery
        while (currentPath !== path.dirname(currentPath)) {
            try {
                const packageJsonPath = path.join(currentPath, 'package.json');
                const fs = require('fs');
                if (fs.existsSync(packageJsonPath)) {
                    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
                    if (packageJson.name === 'ctdiscovery') {
                        return currentPath;
                    }
                }
            } catch (error) {
                // Continue searching
            }
            currentPath = path.dirname(currentPath);
        }
        
        // Fallback to workspace root
        return startPath;
    }

    parseCLIOutput(output: string): any {
        try {
            const lines = output.split('\n');
            const result: { [key: string]: any[] } = {};
            
            let currentSection = '';
            let inToolSection = false;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                
                // Skip empty lines and non-relevant content
                if (!trimmedLine || trimmedLine.startsWith('🔍') || trimmedLine.startsWith('📊') || 
                    trimmedLine.startsWith('✅') || trimmedLine.startsWith('🏁') || 
                    trimmedLine.startsWith('══') || trimmedLine.startsWith('📄') ||
                    trimmedLine.startsWith('💬')) {
                    continue;
                }
                
                // Detect section headers
                if (trimmedLine.includes('📦 MCP Servers:')) {
                    currentSection = 'MCP Servers';
                    result[currentSection] = [];
                    inToolSection = false;
                    continue;
                }
                
                if (trimmedLine.includes('📦 VSCode:')) {
                    currentSection = 'VSCode';
                    result[currentSection] = [];
                    inToolSection = false;
                    continue;
                }
                
                if (trimmedLine.includes('📦 System Tools:')) {
                    currentSection = 'System Tools';
                    result[currentSection] = [];
                    inToolSection = false;
                    continue;
                }
                
                // Detect tool status (ACTIVE, AVAILABLE, etc.)
                if (trimmedLine.includes('● ACTIVE:') || trimmedLine.includes('● AVAILABLE:')) {
                    inToolSection = true;
                    continue;
                }
                
                // Parse tool entries
                if (inToolSection && currentSection && trimmedLine.startsWith('•')) {
                    const toolName = trimmedLine.replace(/^•\s*/, '').trim();
                    if (toolName && result[currentSection]) {
                        // Parse version info if present (e.g., "git (2.50.1)")
                        const match = toolName.match(/^(.+?)\s*\((.+)\)$/);
                        if (match) {
                            result[currentSection].push({
                                name: match[1].trim(),
                                version: match[2].trim(),
                                active: true
                            });
                        } else {
                            result[currentSection].push({
                                name: toolName,
                                active: true
                            });
                        }
                    }
                }
            }
            
            return result;
        } catch (error) {
            console.error('Error parsing CLI output:', error);
            // Return a fallback structure
            return {
                'MCP Servers': [],
                'VSCode': [], 
                'System Tools': []
            };
        }
    }

    countTools(data: any): number {
        if (!data || typeof data !== 'object') {
            return 0;
        }
        
        let count = 0;
        for (const category of Object.values(data)) {
            if (Array.isArray(category)) {
                count += category.length;
            }
        }
        return count;
    }

    normalizeScanData(data: any): any {
        // The data from parseCLIOutput should already be in the correct format
        return data || {
            'MCP Servers': [],
            'VSCode': [],
            'System Tools': []
        };
    }
}