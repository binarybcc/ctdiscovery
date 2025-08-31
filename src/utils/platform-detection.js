import os from 'os';
import path from 'path';
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
          globalSettings: path.join(this.home, 'AppData', 'Roaming', 'Code', 'User', 'settings.json'),
          workspaceSettings: path.join(process.cwd(), '.vscode', 'settings.json')
        };
      case 'darwin':
        return {
          userSettings: path.join(this.home, 'Library', 'Application Support', 'Code', 'User'),
          extensions: path.join(this.home, '.vscode', 'extensions'),
          globalSettings: path.join(this.home, 'Library', 'Application Support', 'Code', 'User', 'settings.json'),
          workspaceSettings: path.join(process.cwd(), '.vscode', 'settings.json')
        };
      default: // Linux
        return {
          userSettings: path.join(this.home, '.config', 'Code', 'User'),
          extensions: path.join(this.home, '.vscode', 'extensions'),
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
    try {
      const testCmd = this.platform === 'win32' 
        ? `where ${command}` 
        : `which ${command}`;
      
      const result = execSync(testCmd, { 
        encoding: 'utf8', 
        stdio: 'pipe',
        timeout: 5000 
      });
      
      return {
        available: true,
        path: result.trim(),
        command: command
      };
    } catch (error) {
      return {
        available: false,
        command: command,
        error: error.message
      };
    }
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