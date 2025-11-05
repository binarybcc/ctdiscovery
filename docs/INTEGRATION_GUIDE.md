# CTDiscovery Integration Guide

Complete guide for integrating CTDiscovery into your tools, workflows, and applications.

## Table of Contents

- [Overview](#overview)
- [Integration Patterns](#integration-patterns)
- [Layer 1: Programmatic API](#layer-1-programmatic-api)
- [Layer 2: CLI Integration](#layer-2-cli-integration)
- [Layer 3: VSCode Extension](#layer-3-vscode-extension)
- [Build Tool Integration](#build-tool-integration)
- [CI/CD Integration](#cicd-integration)
- [Custom Integrations](#custom-integrations)

---

## Overview

CTDiscovery supports multiple integration patterns, from simple CLI usage to deep programmatic integration:

```
┌─────────────────────────────────────────────┐
│  Your Application/Tool                      │
│  ┌────────────┐  ┌────────────┐            │
│  │   CLI      │  │ Programmatic│            │
│  │ Integration│  │   API       │            │
│  └─────┬──────┘  └──────┬─────┘            │
│        │                 │                   │
│        └────────┬────────┘                   │
└─────────────────┼──────────────────────────┘
                  │
        ┌─────────▼──────────┐
        │  CTDiscovery Core  │
        │    • Scan          │
        │    • Analyze       │
        │    • Format        │
        └────────────────────┘
```

---

## Integration Patterns

### Pattern 1: Direct Module Import

**Best for:** Node.js applications, build tools, test frameworks

```javascript
import { CTDiscovery } from 'ctdiscovery';

const ctd = new CTDiscovery();
const analysis = await ctd.scanAndAnalyze();

// Use analysis data in your application
if (analysis.tools.some(t => t.name === 'docker')) {
  console.log('Docker available!');
}
```

### Pattern 2: CLI with JSON Output

**Best for:** Shell scripts, CI/CD pipelines, automation

```bash
RESULTS=$(ctdiscovery --json --quiet)
HAS_GIT=$(echo "$RESULTS" | jq -r '.tools[] | select(.name=="git") | .status')
```

### Pattern 3: VSCode Extension

**Best for:** Editor integration, developer workflows

```javascript
import { CTDiscoveryBridge } from './integration/bridge.js';

const bridge = new CTDiscoveryBridge();
const results = await bridge.scanWorkspace(workspacePath);
```

### Pattern 4: HTTP API (Future)

**Best for:** Web dashboards, remote access, microservices

```javascript
fetch('http://localhost:3000/api/scan')
  .then(res => res.json())
  .then(analysis => console.log(analysis));
```

---

## Layer 1: Programmatic API

### Basic Usage

```javascript
import { CTDiscovery } from 'ctdiscovery';

async function detectEnvironment() {
  const ctd = new CTDiscovery({
    timeout: 5000,
    verbose: false
  });

  try {
    // Scan environment
    const results = await ctd.scan();

    // Analyze results
    const analysis = await ctd.analyze(results);

    // Use analysis data
    return {
      hasDocker: analysis.tools.some(t => t.name === 'docker'),
      nodeVersion: analysis.environment.nodeVersion,
      toolCount: analysis.summary.totalTools
    };

  } catch (error) {
    console.error('Detection failed:', error);
    return null;
  }
}
```

### Advanced Usage with Individual Scanners

```javascript
import {
  MCPScanner,
  VSCodeScanner,
  SystemToolScanner
} from 'ctdiscovery';

async function scanSpecificAreas() {
  // Scan only MCP servers
  const mcpScanner = new MCPScanner();
  const mcpServers = await mcpScanner.scan();

  // Scan only system tools
  const systemScanner = new SystemToolScanner();
  const systemTools = await systemScanner.scan();

  return {
    mcpCount: mcpServers.data.length,
    systemToolCount: systemTools.data.length
  };
}
```

### Custom Processing Pipeline

```javascript
import {
  CTDiscovery,
  Deduplicator,
  OverlapDetector,
  Enricher
} from 'ctdiscovery';

async function customPipeline() {
  const ctd = new CTDiscovery();
  const results = await ctd.scan();

  // Custom deduplication
  const deduplicator = new Deduplicator({
    preferSource: ['system', 'active', 'config']
  });
  let tools = await deduplicator.deduplicate(results.tools);

  // Custom overlap detection
  const detector = new OverlapDetector();
  const overlaps = await detector.detect(tools);

  // Custom enrichment
  const enricher = new Enricher();
  tools = await enricher.enrich(tools, results.environment);

  return { tools, overlaps };
}
```

---

## Layer 2: CLI Integration

### Shell Script Integration

```bash
#!/bin/bash

# Check for required tools
check_requirements() {
  echo "Checking requirements..."

  RESULTS=$(ctdiscovery --json --quiet)

  # Check for Git
  HAS_GIT=$(echo "$RESULTS" | jq -r 'any(.tools[]; .name=="git" and .status=="active")')
  if [ "$HAS_GIT" != "true" ]; then
    echo "Error: Git is required"
    exit 1
  fi

  # Check Node version
  NODE_VERSION=$(echo "$RESULTS" | jq -r '.environment.nodeVersion')
  echo "Node.js version: $NODE_VERSION"

  # List active tools
  echo "$RESULTS" | jq -r '.tools[] | select(.status=="active") | .name' | while read tool; do
    echo "  ✓ $tool"
  done
}

check_requirements
```

### Package.json Scripts

```json
{
  "scripts": {
    "preinstall": "ctdiscovery --json | jq -e '.tools[] | select(.name==\"node\")' || exit 1",
    "prebuild": "ctdiscovery --generate-context --context-file=.claude/context.md",
    "analyze": "ctdiscovery --json --output=dist/environment.json",
    "check-env": "ctdiscovery --conversation-starter --show-starter"
  }
}
```

### Makefile Integration

```makefile
.PHONY: check-env
check-env:
	@echo "Checking environment..."
	@ctdiscovery --json | jq '.summary.totalTools' | xargs -I {} echo "Found {} tools"

.PHONY: build
build: check-env
	@echo "Building..."
	@npm run build

.PHONY: docker-check
docker-check:
	@ctdiscovery --json | jq -e '.tools[] | select(.name=="docker" and .status=="active")' || \
		(echo "Docker not found" && exit 1)
```

---

## Layer 3: VSCode Extension

### Installing the Extension

```bash
cd extensions/vscode
npm install
npm run package
code --install-extension ctdiscovery-vscode-*.vsix
```

### Extension Settings

```json
{
  "ctdiscovery.autoScan": true,
  "ctdiscovery.scanInterval": 300,
  "ctdiscovery.generateContextOnChange": true,
  "ctdiscovery.contextOutputPath": ".claude/context.md",
  "ctdiscovery.syncTasksAutomatically": false
}
```

### Using the Extension

1. **Automatic Scanning**: Extension scans on workspace open
2. **Manual Scanning**: Command Palette → "CTDiscovery: Scan Environment"
3. **View Results**: Click CTDiscovery icon in Activity Bar
4. **Generate Context**: Command → "CTDiscovery: Generate AI Context"
5. **Sync Tasks**: Command → "CTDiscovery: Sync Discovered Tools to Tasks"

---

## Build Tool Integration

### Webpack Plugin

```javascript
// webpack.config.js
import { CTDiscoveryWebpackPlugin } from './examples/build-integration.js';

export default {
  plugins: [
    new CTDiscoveryWebpackPlugin({
      outputPath: 'dist/environment',
      generateContext: true,
      failOnError: false
    })
  ]
};
```

### Vite Plugin

```javascript
// vite.config.js
import { CTDiscovery } from 'ctdiscovery';

function ctdiscoveryPlugin() {
  let ctd;

  return {
    name: 'ctdiscovery',

    async buildStart() {
      console.log('Scanning environment...');
      ctd = new CTDiscovery({ timeout: 5000 });
      const analysis = await ctd.scanAndAnalyze();

      console.log(`Found ${analysis.summary.totalTools} tools`);

      // Inject environment info
      this.emitFile({
        type: 'asset',
        fileName: 'environment.json',
        source: JSON.stringify(analysis, null, 2)
      });
    }
  };
}

export default {
  plugins: [ctdiscoveryPlugin()]
};
```

### Rollup Plugin

```javascript
// rollup.config.js
import { CTDiscovery } from 'ctdiscovery';

function ctdiscoveryPlugin() {
  return {
    name: 'ctdiscovery',

    async buildStart() {
      const ctd = new CTDiscovery();
      const analysis = await ctd.scanAndAnalyze();

      // Use analysis data
      this.meta.ctdiscovery = analysis;

      console.log(`Environment: ${analysis.environment.platform}`);
      console.log(`Tools: ${analysis.summary.totalTools}`);
    }
  };
}

export default {
  plugins: [ctdiscoveryPlugin()]
};
```

### ESBuild Plugin

```javascript
// esbuild.config.js
import { CTDiscovery } from 'ctdiscovery';

const ctdiscoveryPlugin = {
  name: 'ctdiscovery',
  setup(build) {
    build.onStart(async () => {
      const ctd = new CTDiscovery();
      const analysis = await ctd.scanAndAnalyze();

      console.log(`[CTDiscovery] Found ${analysis.summary.totalTools} tools`);
    });
  }
};

await build({
  plugins: [ctdiscoveryPlugin]
});
```

---

## CI/CD Integration

### GitHub Actions

```yaml
name: Build

on: [push, pull_request]

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: npm install

      - name: Scan environment
        run: |
          npx ctdiscovery --json --output=environment.json
          cat environment.json | jq '.summary'

      - name: Check required tools
        run: |
          HAS_GIT=$(cat environment.json | jq -r 'any(.tools[]; .name=="git")')
          if [ "$HAS_GIT" != "true" ]; then
            echo "Git not found"
            exit 1
          fi

      - name: Upload environment report
        uses: actions/upload-artifact@v3
        with:
          name: environment-report
          path: environment.json

      - name: Build
        run: npm run build
```

### GitLab CI

```yaml
stages:
  - scan
  - build

scan-environment:
  stage: scan
  script:
    - npm install -g ctdiscovery
    - ctdiscovery --json --output=environment.json
    - cat environment.json | jq '.summary'
  artifacts:
    paths:
      - environment.json
    expire_in: 1 week

build:
  stage: build
  dependencies:
    - scan-environment
  script:
    - npm install
    - npm run build
```

### Jenkins Pipeline

```groovy
pipeline {
  agent any

  stages {
    stage('Scan Environment') {
      steps {
        sh 'npm install -g ctdiscovery'
        sh 'ctdiscovery --json --output=environment.json'
        sh 'cat environment.json | jq ".summary"'

        archiveArtifacts artifacts: 'environment.json', fingerprint: true
      }
    }

    stage('Build') {
      steps {
        sh 'npm install'
        sh 'npm run build'
      }
    }
  }
}
```

### CircleCI

```yaml
version: 2.1

jobs:
  scan:
    docker:
      - image: node:18
    steps:
      - checkout
      - run:
          name: Install CTDiscovery
          command: npm install -g ctdiscovery
      - run:
          name: Scan environment
          command: |
            ctdiscovery --json --output=environment.json
            cat environment.json | jq '.summary'
      - store_artifacts:
          path: environment.json

  build:
    docker:
      - image: node:18
    steps:
      - checkout
      - run: npm install
      - run: npm run build

workflows:
  version: 2
  build-and-test:
    jobs:
      - scan
      - build:
          requires:
            - scan
```

---

## Custom Integrations

### Test Framework Integration

```javascript
// test-setup.js
import { CTDiscovery } from 'ctdiscovery';

export async function setupTests() {
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  // Skip tests if Docker not available
  if (!analysis.tools.some(t => t.name === 'docker')) {
    console.log('Skipping Docker tests - Docker not available');
    process.env.SKIP_DOCKER_TESTS = 'true';
  }

  // Configure test environment based on available tools
  global.testConfig = {
    hasDocker: analysis.tools.some(t => t.name === 'docker'),
    hasPython: analysis.tools.some(t => t.name === 'python'),
    nodeVersion: analysis.environment.nodeVersion
  };
}
```

### Project Scaffolding

```javascript
// create-project.js
import { CTDiscovery } from 'ctdiscovery';
import { writeFileSync } from 'fs';

async function scaffoldProject(projectName) {
  // Detect environment
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  // Generate package.json based on detected tools
  const packageJson = {
    name: projectName,
    version: '1.0.0',
    scripts: {}
  };

  // Add scripts for detected package managers
  if (analysis.tools.some(t => t.name === 'npm')) {
    packageJson.scripts.install = 'npm install';
    packageJson.scripts.test = 'npm test';
  }

  // Add Docker scripts if available
  if (analysis.tools.some(t => t.name === 'docker')) {
    packageJson.scripts['docker:build'] = 'docker build -t ' + projectName + ' .';
    packageJson.scripts['docker:run'] = 'docker run ' + projectName;
  }

  writeFileSync('package.json', JSON.stringify(packageJson, null, 2));
  console.log('Project scaffolded with detected tools');
}
```

### Documentation Generator

```javascript
// generate-docs.js
import { CTDiscovery } from 'ctdiscovery';
import { writeFileSync } from 'fs';

async function generateEnvironmentDocs() {
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  // Generate environment documentation
  const markdown = await ctd.format(analysis, 'markdown', {
    includeHeader: true,
    includeTableOfContents: true
  });

  writeFileSync('docs/ENVIRONMENT.md', markdown);

  // Generate AI context
  const context = await ctd.generateContext(analysis);
  writeFileSync('.claude/context.md', context.markdown);

  console.log('Environment documentation generated');
}
```

### Dependency Checker

```javascript
// check-deps.js
import { CTDiscovery } from 'ctdiscovery';

async function checkDependencies(required) {
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  const missing = [];

  for (const dep of required) {
    const found = analysis.tools.some(t =>
      t.name.toLowerCase() === dep.toLowerCase() &&
      t.status === 'active'
    );

    if (!found) {
      missing.push(dep);
    }
  }

  if (missing.length > 0) {
    console.error('Missing required dependencies:', missing.join(', '));
    process.exit(1);
  }

  console.log('All dependencies satisfied');
}

// Usage
await checkDependencies(['git', 'node', 'docker']);
```

---

## Best Practices

### 1. Cache Results

```javascript
let cachedAnalysis = null;
let cacheTime = 0;
const CACHE_TTL = 60000; // 1 minute

async function getAnalysis() {
  const now = Date.now();

  if (cachedAnalysis && (now - cacheTime) < CACHE_TTL) {
    return cachedAnalysis;
  }

  const ctd = new CTDiscovery();
  cachedAnalysis = await ctd.scanAndAnalyze();
  cacheTime = now;

  return cachedAnalysis;
}
```

### 2. Handle Errors Gracefully

```javascript
async function safeScan() {
  try {
    const ctd = new CTDiscovery({ timeout: 5000 });
    return await ctd.scanAndAnalyze();
  } catch (error) {
    console.warn('Scan failed, using fallback:', error.message);
    return {
      tools: [],
      environment: {
        platform: process.platform,
        nodeVersion: process.version
      }
    };
  }
}
```

### 3. Progressive Enhancement

```javascript
async function enhancedWorkflow() {
  const ctd = new CTDiscovery();

  try {
    // Try full scan
    const analysis = await ctd.scanAndAnalyze({ timeout: 5000 });
    return analysis;
  } catch {
    try {
      // Fallback to system tools only
      const analysis = await ctd.scanAndAnalyze({
        includeMCP: false,
        includeVSCode: false,
        timeout: 2000
      });
      return analysis;
    } catch {
      // Ultimate fallback
      return { tools: [], environment: {} };
    }
  }
}
```

### 4. Filter Irrelevant Data

```javascript
async function getRelevantTools() {
  const ctd = new CTDiscovery();
  const analysis = await ctd.scanAndAnalyze();

  // Only return high-relevance tools
  return analysis.tools.filter(tool =>
    tool.status === 'active' && tool.aiRelevance > 50
  );
}
```

---

## See Also

- [API Documentation](./API.md)
- [Architecture Overview](../ARCHITECTURE.md)
- [Integration Examples](../examples/)
- [VSCode Extension](../extensions/vscode/README.md)
