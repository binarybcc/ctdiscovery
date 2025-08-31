#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { configManager, configValidator, CONFIG_PATHS } from './index.js';

/**
 * CLI utility for managing CTDiscovery configuration
 * Usage: node src/config/config-cli.js [command] [options]
 */

class ConfigCLI {
  constructor() {
    this.commands = {
      'validate': this.validateCommand.bind(this),
      'create-user-config': this.createUserConfigCommand.bind(this),
      'show-config': this.showConfigCommand.bind(this),
      'check-config': this.checkConfigCommand.bind(this),
      'reset-config': this.resetConfigCommand.bind(this),
      'help': this.helpCommand.bind(this)
    };
  }

  async run(args) {
    const command = args[0] || 'help';
    const options = args.slice(1);

    if (this.commands[command]) {
      try {
        await this.commands[command](options);
      } catch (error) {
        console.error(`Error executing ${command}:`, error.message);
        process.exit(1);
      }
    } else {
      console.error(`Unknown command: ${command}`);
      this.helpCommand([]);
      process.exit(1);
    }
  }

  async validateCommand(options) {
    const filePath = options[0] || CONFIG_PATHS.USER_LOCAL;
    
    if (!existsSync(filePath)) {
      console.error(`Configuration file not found: ${filePath}`);
      return;
    }

    console.log(`Validating configuration: ${filePath}`);
    
    const result = await configValidator.validateFile(filePath);
    
    if (result.valid) {
      console.log('✅ Configuration is valid!');
      
      if (result.warnings && result.warnings.length > 0) {
        console.log('\n⚠️  Warnings:');
        result.warnings.forEach(warning => {
          console.log(`   • ${warning}`);
        });
      }
    } else {
      console.log('❌ Configuration has errors:');
      result.errors.forEach(error => {
        console.log(`   • ${error}`);
      });
      
      if (result.warnings && result.warnings.length > 0) {
        console.log('\n⚠️  Additional warnings:');
        result.warnings.forEach(warning => {
          console.log(`   • ${warning}`);
        });
      }
    }
  }

  async createUserConfigCommand(options) {
    const filePath = options[0] || CONFIG_PATHS.USER_LOCAL;
    const force = options.includes('--force') || options.includes('-f');
    
    if (existsSync(filePath) && !force) {
      console.error(`Configuration file already exists: ${filePath}`);
      console.error('Use --force to overwrite');
      return;
    }

    console.log(`Creating user configuration template: ${filePath}`);
    
    const success = configManager.createUserConfigTemplate(filePath);
    
    if (success) {
      console.log('✅ User configuration template created successfully!');
      console.log('\nNext steps:');
      console.log(`1. Edit ${filePath} to customize your configuration`);
      console.log(`2. Run 'node src/config/config-cli.js validate ${filePath}' to validate`);
      console.log('3. Use the configuration with CTDiscovery');
    } else {
      console.error('❌ Failed to create user configuration template');
    }
  }

  async showConfigCommand(options) {
    const includeDefault = options.includes('--include-default') || options.includes('-d');
    const format = options.find(opt => opt.startsWith('--format='))?.split('=')[1] || 'pretty';
    
    console.log('Loading configuration...\n');
    
    try {
      const result = await configManager.initialize();
      
      if (format === 'json') {
        console.log(JSON.stringify(result.config, null, 2));
        return;
      }
      
      // Pretty format
      console.log('📋 Configuration Summary');
      console.log('========================');
      
      console.log(`Version: ${result.config.version || 'unknown'}`);
      console.log(`Description: ${result.config.description || 'N/A'}`);
      
      console.log('\n🚀 Performance Settings:');
      const perf = result.config.performance || {};
      console.log(`   Max Scan Time: ${perf.maxScanTime || 'default'}ms`);
      console.log(`   Scanner Timeout: ${perf.timeoutPerScanner || 'default'}ms`);
      console.log(`   Parallel Scanning: ${perf.enableParallelScanning ? 'enabled' : 'disabled'}`);
      console.log(`   Max Concurrent: ${perf.maxConcurrentScanners || 'default'}`);
      
      console.log('\n🔍 Scanner Configuration:');
      const scanners = result.config.scanners || {};
      Object.entries(scanners).forEach(([name, config]) => {
        const status = config.enabled !== false ? '✅ enabled' : '❌ disabled';
        console.log(`   ${name}: ${status} (priority: ${config.priority || 'default'})`);
      });
      
      console.log('\n⚙️  Global Settings:');
      const global = result.config.globalSettings || {};
      Object.entries(global).forEach(([key, value]) => {
        console.log(`   ${key}: ${value}`);
      });
      
      console.log('\n📊 Metadata:');
      console.log(`   Sources: ${result.metadata.sources.join(', ')}`);
      console.log(`   Platform: ${result.metadata.platform.platform}`);
      console.log(`   Init Time: ${result.metadata.initTime}ms`);
      
      if (result.metadata.error) {
        console.log(`   Error: ${result.metadata.error}`);
      }
      
    } catch (error) {
      console.error('Failed to load configuration:', error.message);
    }
  }

  async checkConfigCommand(options) {
    const verbose = options.includes('--verbose') || options.includes('-v');
    
    console.log('🔍 Checking configuration system...\n');
    
    // Check for configuration files
    const configChecks = [
      { path: CONFIG_PATHS.DEFAULT, name: 'Default config', required: true },
      { path: CONFIG_PATHS.USER_LOCAL, name: 'Local user config', required: false },
      { path: CONFIG_PATHS.USER_LOCAL_ALT, name: 'Alt local user config', required: false },
      { path: CONFIG_PATHS.EXAMPLE, name: 'Example config', required: false }
    ];
    
    console.log('📁 Configuration Files:');
    configChecks.forEach(check => {
      const exists = existsSync(check.path);
      const status = exists ? '✅ found' : (check.required ? '❌ missing' : '⚪ not found');
      console.log(`   ${check.name}: ${status}`);
      
      if (verbose && exists) {
        try {
          const content = readFileSync(check.path, 'utf8');
          const config = JSON.parse(content);
          console.log(`      Version: ${config.version || 'unknown'}`);
          console.log(`      Scanners: ${Object.keys(config.scanners || {}).length}`);
        } catch (error) {
          console.log(`      Error: ${error.message}`);
        }
      }
    });
    
    // Test configuration loading
    console.log('\n🔧 Configuration Loading:');
    try {
      const result = await configManager.initialize();
      console.log('   ✅ Configuration loaded successfully');
      console.log(`   📊 Sources: ${result.metadata.sources.join(', ')}`);
      console.log(`   ⏱️  Load time: ${result.metadata.initTime}ms`);
      
      // Validate loaded configuration
      console.log('\n✅ Configuration Validation:');
      const validation = configValidator.validate(result.config);
      if (validation.valid) {
        console.log('   ✅ Configuration is valid');
      } else {
        console.log('   ❌ Configuration has errors:');
        validation.errors.forEach(error => {
          console.log(`      • ${error}`);
        });
      }
      
      if (validation.warnings.length > 0) {
        console.log('   ⚠️  Warnings:');
        validation.warnings.forEach(warning => {
          console.log(`      • ${warning}`);
        });
      }
      
    } catch (error) {
      console.log('   ❌ Configuration loading failed:', error.message);
    }
    
    console.log('\n🎯 System Status: Ready');
  }

  async resetConfigCommand(options) {
    const confirm = options.includes('--yes') || options.includes('-y');
    
    if (!confirm) {
      console.log('This will reset your user configuration to defaults.');
      console.log('Use --yes to confirm this action.');
      return;
    }
    
    const userConfigPath = CONFIG_PATHS.USER_LOCAL;
    
    if (existsSync(userConfigPath)) {
      console.log(`Resetting user configuration: ${userConfigPath}`);
      
      // Backup existing config
      const backupPath = `${userConfigPath}.backup.${Date.now()}`;
      try {
        const existingConfig = readFileSync(userConfigPath, 'utf8');
        writeFileSync(backupPath, existingConfig);
        console.log(`✅ Backed up existing config to: ${backupPath}`);
      } catch (error) {
        console.log(`⚠️  Could not backup existing config: ${error.message}`);
      }
    }
    
    // Create new default user config
    const success = configManager.createUserConfigTemplate(userConfigPath);
    
    if (success) {
      console.log('✅ User configuration reset to defaults');
    } else {
      console.error('❌ Failed to reset user configuration');
    }
  }

  helpCommand() {
    console.log(`
CTDiscovery Configuration CLI
============================

Usage: node src/config/config-cli.js <command> [options]

Commands:
  validate [file]              Validate configuration file
  create-user-config [file]    Create user configuration template
  show-config                  Display current configuration
  check-config                 Check configuration system status
  reset-config                 Reset user configuration to defaults
  help                         Show this help message

Options:
  --force, -f                  Force overwrite existing files
  --verbose, -v                Show detailed information
  --yes, -y                    Confirm destructive actions
  --include-default, -d        Include default configuration
  --format=json|pretty         Output format (default: pretty)

Examples:
  node src/config/config-cli.js create-user-config
  node src/config/config-cli.js validate .ctdiscovery.json
  node src/config/config-cli.js show-config --verbose
  node src/config/config-cli.js check-config
  node src/config/config-cli.js reset-config --yes

Configuration Files:
  .ctdiscovery.json           Local project configuration
  .ctdiscovery/config.json    Alternative local configuration
  example-user-config.json    Example configuration template
`);
  }
}

// Run CLI if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const cli = new ConfigCLI();
  cli.run(process.argv.slice(2));
}

export { ConfigCLI };