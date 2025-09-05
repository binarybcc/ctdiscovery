import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import { PlatformDetection } from '../utils/platform-detection.js';
import { ToolScannerInterface, TOOL_STATUSES, TOOL_CATEGORIES, SCAN_STATUSES } from '../interfaces/tool-scanner-interface.js';

export class VSCodeScanner extends ToolScannerInterface {
  constructor() {
    super();
    this.name = 'VSCode Extension Scanner';
    this.category = 'vscode';
    this.platform = 'cross-platform'; 
    this.version = '1.0.0';
    
    this.platformDetection = new PlatformDetection();
  }

  async scan() {
    const results = {
      data: [],
      installed: [],
      workspace: [],
      settings: {},
      scanMethods: [],
      status: 'unknown'
    };

    try {
      // Scan installed extensions
      const extensionResult = await this.scanInstalledExtensions();
      results.scanMethods.push(extensionResult.method);
      results.installed = extensionResult.extensions;
      // Transform extensions for display compatibility
      results.data = extensionResult.extensions.map(ext => ({
        ...ext,
        name: ext.displayName || ext.id,
        status: 'active' // VSCode extensions are active if installed
      }));

      // Scan workspace settings
      const workspaceResult = await this.scanWorkspaceSettings();
      results.scanMethods.push(workspaceResult.method);
      results.workspace = workspaceResult.extensions;
      results.settings.workspace = workspaceResult.settings;

      // Scan global settings
      const globalResult = await this.scanGlobalSettings();
      results.scanMethods.push(globalResult.method);
      results.settings.global = globalResult.settings;

      results.status = this.determineStatus(results);
    } catch (error) {
      results.scanMethods.push({
        name: 'VSCode Scanner',
        status: 'error',
        error: error.message
      });
    }

    return results;
  }

  async scanInstalledExtensions() {
    const result = {
      method: { name: 'VSCode Extension Detection', status: 'scanning' },
      extensions: []
    };

    const vscPaths = this.platformDetection.getVSCodePaths();
    const extensionPaths = [
      { path: vscPaths.extensions, variant: 'VSCode' },
      { path: vscPaths.extensionsInsiders, variant: 'VSCode Insiders' },
      { path: vscPaths.extensionsOss, variant: 'VSCodium' }
    ];

    let foundAnyExtensions = false;

    for (const { path: extensionsPath, variant } of extensionPaths) {
      if (!existsSync(extensionsPath)) {
        continue; // Skip if this variant's directory doesn't exist
      }

      try {
        const extensionDirs = readdirSync(extensionsPath);
        
        for (const dir of extensionDirs) {
          const extPath = path.join(extensionsPath, dir);
          const packageJsonPath = path.join(extPath, 'package.json');
          
          if (existsSync(packageJsonPath)) {
            try {
              const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
              
              const extension = {
                id: packageJson.name,
                displayName: packageJson.displayName || packageJson.name,
                version: packageJson.version,
                description: packageJson.description,
                publisher: packageJson.publisher,
                categories: packageJson.categories || [],
                keywords: packageJson.keywords || [],
                aiRelevant: this.isAIRelevant(packageJson),
                contributes: this.extractContributions(packageJson.contributes),
                path: extPath,
                variant: variant // Track which VSCode variant this extension belongs to
              };

              result.extensions.push(extension);
              foundAnyExtensions = true;
            } catch (parseError) {
              // Skip malformed package.json files
            }
          }
        }
      } catch (error) {
        // Continue with other variants even if one fails
        continue;
      }
    }

    if (foundAnyExtensions) {
      result.method.status = 'completed';
      result.method.extensionsFound = result.extensions.length;
      
      // Add variant summary to method result
      const variantCounts = result.extensions.reduce((acc, ext) => {
        acc[ext.variant] = (acc[ext.variant] || 0) + 1;
        return acc;
      }, {});
      result.method.variantBreakdown = variantCounts;
    } else {
      result.method.status = 'no_extensions_found';
    }

    return result;
  }

  async scanWorkspaceSettings() {
    const result = {
      method: { name: 'VSCode Workspace Settings', status: 'scanning' },
      extensions: [],
      settings: {}
    };

    const vscPaths = this.platformDetection.getVSCodePaths();
    const workspaceSettingsPath = vscPaths.workspaceSettings;

    if (existsSync(workspaceSettingsPath)) {
      try {
        const settings = JSON.parse(readFileSync(workspaceSettingsPath, 'utf8'));
        result.settings = settings;
        
        // Extract extension-specific settings
        Object.keys(settings).forEach(key => {
          if (key.includes('.') && !key.startsWith('files.') && !key.startsWith('editor.')) {
            const extensionId = key.split('.')[0];
            if (!result.extensions.find(ext => ext.id === extensionId)) {
              result.extensions.push({
                id: extensionId,
                source: 'workspace-settings',
                configured: true,
                settings: { [key]: settings[key] }
              });
            }
          }
        });

        result.method.status = 'found';
      } catch (error) {
        result.method.status = 'parse_error';
        result.method.error = error.message;
      }
    } else {
      result.method.status = 'not_found';
    }

    return result;
  }

  async scanGlobalSettings() {
    const result = {
      method: { name: 'VSCode Global Settings', status: 'scanning' },
      settings: {}
    };

    const vscPaths = this.platformDetection.getVSCodePaths();
    const globalSettingsPath = vscPaths.globalSettings;

    if (existsSync(globalSettingsPath)) {
      try {
        const settings = JSON.parse(readFileSync(globalSettingsPath, 'utf8'));
        result.settings = settings;
        result.method.status = 'found';
      } catch (error) {
        result.method.status = 'parse_error';
        result.method.error = error.message;
      }
    } else {
      result.method.status = 'not_found';
    }

    return result;
  }

  isAIRelevant(packageJson) {
    const aiKeywords = [
      'ai', 'claude', 'copilot', 'assistant', 'gpt', 'openai', 
      'anthropic', 'llm', 'language-model', 'automation',
      'code-generation', 'mcp', 'model-context-protocol'
    ];

    const searchText = [
      packageJson.name,
      packageJson.displayName,
      packageJson.description,
      ...(packageJson.keywords || []),
      ...(packageJson.categories || [])
    ].join(' ').toLowerCase();

    return aiKeywords.some(keyword => searchText.includes(keyword));
  }

  extractContributions(contributes) {
    if (!contributes) return {};

    return {
      commands: contributes.commands?.length || 0,
      keybindings: contributes.keybindings?.length || 0,
      languages: contributes.languages?.length || 0,
      themes: contributes.themes?.length || 0,
      snippets: contributes.snippets?.length || 0,
      configuration: !!contributes.configuration,
      views: contributes.views ? Object.keys(contributes.views).length : 0,
      menus: contributes.menus ? Object.keys(contributes.menus).length : 0
    };
  }

  determineStatus(results) {
    const installedCount = results.installed.length;
    const aiRelevantCount = results.installed.filter(ext => ext.aiRelevant).length;
    
    if (aiRelevantCount > 5) return 'ai_rich';
    if (aiRelevantCount > 0) return 'ai_present';
    if (installedCount > 20) return 'extension_rich';
    if (installedCount > 0) return 'basic';
    return 'minimal';
  }

  // REQUIRED INTERFACE METHODS
  async validate() {
    const startTime = Date.now();
    try {
      const vscPaths = this.platformDetection.getVSCodePaths();
      const extensionsPath = vscPaths.extensions;
      
      return {
        functional: existsSync(extensionsPath),
        accessible: true,
        configured: true,
        duration: Date.now() - startTime,
        requirements: ['VSCode extensions directory']
      };
    } catch (error) {
      return {
        functional: false,
        accessible: false,
        configured: false,
        duration: Date.now() - startTime,
        error: error.message
      };
    }
  }

  getCapabilities() {
    return [
      'Extension detection',
      'AI-relevant extension identification', 
      'Workspace settings analysis',
      'Global settings analysis'
    ];
  }
}