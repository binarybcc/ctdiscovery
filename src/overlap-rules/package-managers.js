/**
 * Package Manager Overlap Detection Rules
 * Detects overlapping package management tools
 */

export const packageManagerRules = {
  name: 'Package Manager Detection',
  version: '1.0.0',
  
  detect(tools) {
    const overlaps = [];
    
    // JavaScript package managers
    const jsPackageManagers = tools.filter(tool => 
      ['npm', 'yarn', 'pnpm'].includes(tool.name.toLowerCase())
    );
    
    if (jsPackageManagers.length > 1) {
      const context = this.analyzePackageManagerContext(jsPackageManagers);
      overlaps.push({
        type: 'functional-overlap',
        category: 'javascript-package-management',
        tools: jsPackageManagers.map(t => t.name),
        evidence: 'All tools manage JavaScript/Node.js dependencies',
        severity: context.severity,
        message: 'Multiple JavaScript package managers detected',
        context_warning: context.warning,
        details: {
          primary_indicators: this.detectPrimary(jsPackageManagers),
          lockfiles: this.detectLockfiles(),
          overlap_type: context.type
        }
      });
    }
    
    // Python package managers
    const pythonPackageManagers = tools.filter(tool => 
      ['pip', 'pip3', 'conda', 'poetry', 'pipenv'].includes(tool.name.toLowerCase())
    );
    
    if (pythonPackageManagers.length > 1) {
      const context = this.analyzePythonContext(pythonPackageManagers);
      overlaps.push({
        type: 'functional-overlap',
        category: 'python-package-management',
        tools: pythonPackageManagers.map(t => t.name),
        evidence: 'All tools manage Python dependencies',
        severity: context.severity,
        message: 'Multiple Python package managers detected',
        context_warning: context.warning,
        details: {
          overlap_type: context.type
        }
      });
    }
    
    return overlaps;
  },
  
  /**
   * Try to detect which package manager is primary based on lockfiles
   * @private
   */
  detectPrimary(packageManagers) {
    try {
      // Dynamic import doesn't work in this context, use require instead
      const fs = require('fs');
      const lockfileIndicators = {
        'npm': ['package-lock.json'],
        'yarn': ['yarn.lock'],
        'pnpm': ['pnpm-lock.yaml']
      };
      
      const detected = [];
      Object.entries(lockfileIndicators).forEach(([manager, files]) => {
        files.forEach(file => {
          if (fs.existsSync(file)) {
            detected.push({ manager, file });
          }
        });
      });
      
      return detected;
    } catch (error) {
      return [];
    }
  },
  
  /**
   * Detect lockfiles in current directory
   * @private
   */
  detectLockfiles() {
    try {
      const fs = require('fs');
      const lockfiles = [
        'package-lock.json',
        'yarn.lock', 
        'pnpm-lock.yaml'
      ];
      
      return lockfiles.filter(file => fs.existsSync(file));
    } catch (error) {
      return [];
    }
  },
  
  /**
   * Analyze package manager context to determine if overlap is problematic
   * @private
   */
  analyzePackageManagerContext(packageManagers) {
    // Check for exact duplicates (same tool name appearing multiple times)
    const toolNames = packageManagers.map(t => t.name.toLowerCase());
    const uniqueNames = [...new Set(toolNames)];
    
    if (toolNames.length > uniqueNames.length) {
      // True duplicates detected
      return {
        type: 'duplicate-installation',
        severity: 'warning',
        warning: '⚠️  Duplicate installations detected - may indicate scanner or system issues'
      };
    }
    
    // Multiple different package managers
    if (uniqueNames.length > 1) {
      return {
        type: 'multiple-managers',
        severity: 'info', 
        warning: 'ℹ️  Multiple package managers can coexist but projects should use consistent tooling'
      };
    }
    
    return {
      type: 'normal',
      severity: 'info',
      warning: null
    };
  },
  
  /**
   * Analyze Python tool context for system vs user versions
   * @private  
   */
  analyzePythonContext(pythonTools) {
    const toolNames = pythonTools.map(t => t.name.toLowerCase());
    
    // Check for python + python3 (common system + dev setup)
    if (toolNames.includes('python') && toolNames.includes('python3')) {
      return {
        type: 'system-and-dev-versions',
        severity: 'info',
        warning: '✓ System (python) and development (python3) versions often coexist by design'
      };
    }
    
    // Check for pip duplicates  
    const pipTools = toolNames.filter(name => name.includes('pip'));
    if (pipTools.length > 1) {
      const uniquePipTools = [...new Set(pipTools)];
      if (pipTools.length > uniquePipTools.length) {
        return {
          type: 'duplicate-installation', 
          severity: 'warning',
          warning: '⚠️  Duplicate pip installations detected - may indicate system issues'
        };
      }
    }
    
    return {
      type: 'normal',
      severity: 'info', 
      warning: 'ℹ️  Multiple Python tools may serve different development needs'
    };
  }
};