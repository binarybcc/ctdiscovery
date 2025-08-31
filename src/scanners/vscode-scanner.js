import { existsSync, readFileSync, readdirSync } from 'fs';
import path from 'path';
import { PlatformDetection } from '../utils/platform-detection.js';

export class VSCodeScanner {
  constructor() {
    this.platform = new PlatformDetection();
  }

  async scan() {
    const results = {
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

    const vscPaths = this.platform.getVSCodePaths();
    const extensionsPath = vscPaths.extensions;

    if (!existsSync(extensionsPath)) {
      result.method.status = 'extensions_dir_not_found';
      return result;
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
              path: extPath
            };

            result.extensions.push(extension);
          } catch (parseError) {
            // Skip malformed package.json files
          }
        }
      }

      result.method.status = 'completed';
      result.method.extensionsFound = result.extensions.length;
    } catch (error) {
      result.method.status = 'scan_error';
      result.method.error = error.message;
    }

    return result;
  }

  async scanWorkspaceSettings() {
    const result = {
      method: { name: 'VSCode Workspace Settings', status: 'scanning' },
      extensions: [],
      settings: {}
    };

    const vscPaths = this.platform.getVSCodePaths();
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

    const vscPaths = this.platform.getVSCodePaths();
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
}