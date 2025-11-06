import os from 'os';
import path from 'path';
import { existsSync } from 'fs';
import { execSync } from 'child_process';

export class PlatformDetection {
  constructor() {
    this.platform = process.platform;
    this.home = os.homedir();
    this.arch = process.arch;
  }

  getClaudePaths() {
    switch (this.platform) {
      case 'win32':
        return {
          config: path.join(this.home, 'AppData', 'Roaming', 'Claude'),
          localConfig: path.join(process.cwd(), '.claude'),
          globalConfig: path.join(this.home, 'AppData', 'Roaming', 'Claude', 'config.json')
        };
      case 'darwin':
        return {
          config: path.join(this.home, 'Library', 'Application Support', 'Claude'),
          localConfig: path.join(process.cwd(), '.claude'),
          globalConfig: path.join(this.home, 'Library', 'Application Support', 'Claude', 'config.json'),
          fallback: path.join(this.home, '.claude')
        };
      default: // Linux and others
        return {
          config: path.join(this.home, '.config', 'claude'),
          localConfig: path.join(process.cwd(), '.claude'),
          globalConfig: path.join(this.home, '.config', 'claude', 'config.json'),
          fallback: path.join(this.home, '.claude')
        };
    }
  }

  getVSCodePaths() {
    switch (this.platform) {
      case 'win32':
        return {
          userSettings: path.join(this.home, 'AppData', 'Roaming', 'Code', 'User'),
          extensions: path.join(this.home, '.vscode', 'extensions'),
          extensionsInsiders: path.join(this.home, '.vscode-insiders', 'extensions'),
          extensionsOss: path.join(this.home, '.vscode-oss', 'extensions'),
          globalSettings: path.join(this.home, 'AppData', 'Roaming', 'Code', 'User', 'settings.json'),
          workspaceSettings: path.join(process.cwd(), '.vscode', 'settings.json')
        };
      case 'darwin':
        return {
          userSettings: path.join(this.home, 'Library', 'Application Support', 'Code', 'User'),
          extensions: path.join(this.home, '.vscode', 'extensions'),
          extensionsInsiders: path.join(this.home, '.vscode-insiders', 'extensions'),
          extensionsOss: path.join(this.home, '.vscode-oss', 'extensions'),
          globalSettings: path.join(this.home, 'Library', 'Application Support', 'Code', 'User', 'settings.json'),
          workspaceSettings: path.join(process.cwd(), '.vscode', 'settings.json')
        };
      default: // Linux
        return {
          userSettings: path.join(this.home, '.config', 'Code', 'User'),
          extensions: path.join(this.home, '.vscode', 'extensions'),
          extensionsInsiders: path.join(this.home, '.vscode-insiders', 'extensions'),
          extensionsOss: path.join(this.home, '.vscode-oss', 'extensions'),
          globalSettings: path.join(this.home, '.config', 'Code', 'User', 'settings.json'),
          workspaceSettings: path.join(process.cwd(), '.vscode', 'settings.json')
        };
    }
  }

  getSystemToolPaths() {
    switch (this.platform) {
      case 'win32':
        return {
          npm: {
            global: path.join(this.home, 'AppData', 'Roaming', 'npm'),
            command: 'npm.cmd'
          },
          paths: process.env.PATH?.split(';') || [],
          shell: 'cmd'
        };
      case 'darwin':
        return {
          npm: {
            global: '/usr/local/lib/node_modules',
            command: 'npm'
          },
          paths: process.env.PATH?.split(':') || [],
          shell: 'bash',
          brew: '/opt/homebrew/bin'
        };
      default: // Linux
        return {
          npm: {
            global: '/usr/local/lib/node_modules',
            command: 'npm'
          },
          paths: process.env.PATH?.split(':') || [],
          shell: 'bash',
          packageManagers: ['apt', 'yum', 'dnf', 'pacman', 'snap']
        };
    }
  }

  getExecutableExtensions() {
    return this.platform === 'win32' ? ['.exe', '.cmd', '.bat', '.ps1'] : [''];
  }

  async testCommandAvailability(command) {
    if (process.env.DEBUG_SCANNER) {
      console.log(`[PLATFORM] Testing availability: ${command}`);
    }

    try {
      // First try global PATH (which/where)
      const testCmd = this.platform === 'win32'
        ? `where ${command}`
        : `which ${command}`;

      const result = execSync(testCmd, {
        encoding: 'utf8',
        stdio: 'pipe',
        timeout: 5000
      });

      if (process.env.DEBUG_SCANNER) {
        console.log(`[PLATFORM] ✅ Found in global PATH: ${result.trim()}`);
      }

      return {
        available: true,
        path: result.trim(),
        command: command,
        location: 'global'
      };
    } catch (error) {
      if (process.env.DEBUG_SCANNER) {
        console.log(`[PLATFORM] Not in global PATH, checking project-local...`);
      }
      // If not found in PATH, check project-local directories
      return this._checkProjectLocalTool(command);
    }
  }

  /**
   * Check for project-local tools in common locations
   * @private
   */
  _checkProjectLocalTool(command) {
    const cwd = process.cwd();

    if (process.env.DEBUG_SCANNER) {
      console.log(`[PLATFORM] Checking project-local for: ${command}`);
      console.log(`[PLATFORM] CWD: ${cwd}`);
    }

    // Common project-local tool directories
    const localPaths = [
      path.join(cwd, 'vendor', 'bin', command),      // PHP Composer
      path.join(cwd, 'node_modules', '.bin', command), // npm/yarn/pnpm
      path.join(cwd, '.venv', 'bin', command),         // Python venv
      path.join(cwd, 'venv', 'bin', command),          // Python venv (alternative)
      path.join(cwd, 'bin', command),                  // Project bin directory
    ];

    for (const toolPath of localPaths) {
      if (process.env.DEBUG_SCANNER) {
        console.log(`[PLATFORM] Checking path: ${toolPath}`);
      }
      if (existsSync(toolPath)) {
        if (process.env.DEBUG_SCANNER) {
          console.log(`[PLATFORM] ✅ FOUND at: ${toolPath}`);
        }
        return {
          available: true,
          path: toolPath,
          command: command,
          location: 'project-local'
        };
      }
    }

    if (process.env.DEBUG_SCANNER) {
      console.log(`[PLATFORM] ❌ NOT FOUND: ${command}`);
    }

    return {
      available: false,
      command: command,
      error: 'Command not found in PATH or project-local directories'
    };
  }

  getPlatformInfo() {
    return {
      platform: this.platform,
      arch: this.arch,
      nodeVersion: process.version,
      home: this.home,
      cwd: process.cwd(),
      shell: this.platform === 'win32' ? 'cmd' : 'bash'
    };
  }
}