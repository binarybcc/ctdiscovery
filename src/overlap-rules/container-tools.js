/**
 * Container Tools Overlap Detection Rules
 * Detects overlapping containerization tools
 */

export const containerRules = {
  name: 'Container Tools Detection',
  version: '1.0.0',
  
  detect(tools) {
    const overlaps = [];
    
    // Container runtimes
    const containerRuntimes = tools.filter(tool => 
      ['docker', 'podman', 'colima', 'containerd'].includes(tool.name.toLowerCase())
    );
    
    if (containerRuntimes.length > 1) {
      overlaps.push({
        type: 'process-conflict',
        category: 'container-runtime',
        tools: containerRuntimes.map(t => t.name),
        evidence: 'Container runtimes typically use same ports and socket files',
        severity: 'warning',
        message: 'Multiple container runtimes detected',
        details: {
          potential_conflicts: [
            'Docker daemon port (2376, 2375)',
            'Docker socket (/var/run/docker.sock)',
            'Container registry authentication'
          ],
          running_status: this.checkRunningStatus(containerRuntimes)
        }
      });
    }
    
    // Orchestration tools
    const orchestrationTools = tools.filter(tool => 
      ['kubectl', 'docker-compose', 'podman-compose', 'helm'].includes(tool.name.toLowerCase())
    );
    
    if (orchestrationTools.length > 1) {
      overlaps.push({
        type: 'functional-overlap',
        category: 'container-orchestration',
        tools: orchestrationTools.map(t => t.name),
        evidence: 'Tools provide container orchestration capabilities',
        severity: 'info',
        message: 'Multiple container orchestration tools detected'
      });
    }
    
    return overlaps;
  },
  
  /**
   * Check which container runtimes are currently running
   * @private
   */
  checkRunningStatus(runtimes) {
    const status = [];
    
    runtimes.forEach(tool => {
      try {
        const { execSync } = require('child_process');
        
        switch (tool.name.toLowerCase()) {
          case 'docker':
            try {
              execSync('docker info', { timeout: 2000, stdio: 'ignore' });
              status.push({ tool: tool.name, running: true });
            } catch {
              status.push({ tool: tool.name, running: false });
            }
            break;
            
          case 'podman':
            try {
              execSync('podman info', { timeout: 2000, stdio: 'ignore' });
              status.push({ tool: tool.name, running: true });
            } catch {
              status.push({ tool: tool.name, running: false });
            }
            break;
            
          case 'colima':
            try {
              execSync('colima status', { timeout: 2000, stdio: 'ignore' });
              status.push({ tool: tool.name, running: true });
            } catch {
              status.push({ tool: tool.name, running: false });
            }
            break;
            
          default:
            status.push({ tool: tool.name, running: null }); // Unknown
        }
      } catch (error) {
        status.push({ tool: tool.name, running: null, error: error.message });
      }
    });
    
    return status;
  }
};