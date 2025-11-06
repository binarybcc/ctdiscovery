/**
 * Project Type Detector
 *
 * Analyzes the project to determine its type and characteristics.
 * This enables intelligent filtering of tools by relevance.
 */

import { existsSync, readFileSync, readdirSync } from 'fs';
import { join } from 'path';

export class ProjectTypeDetector {
  constructor(options = {}) {
    this.projectRoot = options.projectRoot || process.cwd();
    this.cache = new Map();
  }

  /**
   * Detect project type and characteristics
   */
  async detect() {
    const cacheKey = this.projectRoot;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    const detection = {
      primaryType: 'unknown',
      languages: [],
      frameworks: [],
      buildSystems: [],
      packageManagers: [],
      confidence: 0,
      indicators: [],
      capabilities: []
    };

    // Detect languages and frameworks
    this._detectNodeJS(detection);
    this._detectPHP(detection);
    this._detectPython(detection);
    this._detectRust(detection);
    this._detectGo(detection);
    this._detectJava(detection);
    this._detectRuby(detection);
    this._detectDocker(detection);

    // Determine primary type
    this._determinePrimaryType(detection);

    // Calculate confidence
    this._calculateConfidence(detection);

    this.cache.set(cacheKey, detection);
    return detection;
  }

  /**
   * Detect Node.js projects
   */
  _detectNodeJS(detection) {
    const packageJsonPath = join(this.projectRoot, 'package.json');

    if (existsSync(packageJsonPath)) {
      detection.languages.push('javascript');
      detection.indicators.push({ file: 'package.json', weight: 10 });

      try {
        const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        // Detect package manager
        if (existsSync(join(this.projectRoot, 'yarn.lock'))) {
          detection.packageManagers.push('yarn');
          detection.indicators.push({ file: 'yarn.lock', weight: 5 });
        } else if (existsSync(join(this.projectRoot, 'pnpm-lock.yaml'))) {
          detection.packageManagers.push('pnpm');
          detection.indicators.push({ file: 'pnpm-lock.yaml', weight: 5 });
        } else if (existsSync(join(this.projectRoot, 'package-lock.json'))) {
          detection.packageManagers.push('npm');
          detection.indicators.push({ file: 'package-lock.json', weight: 5 });
        }

        // Detect frameworks
        const deps = { ...pkg.dependencies, ...pkg.devDependencies };

        if (deps.react || deps['react-dom']) {
          detection.frameworks.push('react');
          detection.capabilities.push('frontend-ui');
        }
        if (deps.vue || deps['@vue/cli']) {
          detection.frameworks.push('vue');
          detection.capabilities.push('frontend-ui');
        }
        if (deps.next) {
          detection.frameworks.push('nextjs');
          detection.capabilities.push('server-side-rendering');
        }
        if (deps.express || deps.fastify || deps.koa) {
          detection.frameworks.push('node-backend');
          detection.capabilities.push('api-server');
        }
        if (deps.typescript) {
          detection.languages.push('typescript');
          detection.capabilities.push('type-safety');
        }

        // Detect build systems
        if (deps.webpack) detection.buildSystems.push('webpack');
        if (deps.vite) detection.buildSystems.push('vite');
        if (deps.rollup) detection.buildSystems.push('rollup');

        // Detect testing
        if (deps.jest || deps.vitest || deps.mocha) {
          detection.capabilities.push('automated-testing');
        }

        // Detect linting
        if (deps.eslint || deps.prettier) {
          detection.capabilities.push('code-quality');
        }

      } catch (error) {
        // Invalid package.json
      }
    }

    // Check for TypeScript
    if (existsSync(join(this.projectRoot, 'tsconfig.json'))) {
      detection.languages.push('typescript');
      detection.indicators.push({ file: 'tsconfig.json', weight: 8 });
    }
  }

  /**
   * Detect PHP projects
   */
  _detectPHP(detection) {
    const composerPath = join(this.projectRoot, 'composer.json');

    if (existsSync(composerPath)) {
      detection.languages.push('php');
      detection.packageManagers.push('composer');
      detection.indicators.push({ file: 'composer.json', weight: 10 });

      try {
        const composer = JSON.parse(readFileSync(composerPath, 'utf-8'));

        // Detect frameworks
        const require = { ...composer.require, ...composer['require-dev'] };

        if (require['laravel/framework']) {
          detection.frameworks.push('laravel');
          detection.capabilities.push('mvc-framework', 'orm', 'routing');
        }
        if (require['symfony/symfony'] || require['symfony/framework-bundle']) {
          detection.frameworks.push('symfony');
          detection.capabilities.push('mvc-framework');
        }
        if (require['cakephp/cakephp']) {
          detection.frameworks.push('cakephp');
        }

        // Detect testing
        if (require.phpunit || require['phpunit/phpunit']) {
          detection.capabilities.push('automated-testing');
        }

        // Detect static analysis
        if (require.phpstan || require['phpstan/phpstan']) {
          detection.capabilities.push('static-analysis');
        }
        if (require.rector || require['rector/rector']) {
          detection.capabilities.push('code-refactoring');
        }

      } catch (error) {
        // Invalid composer.json
      }
    }

    if (existsSync(join(this.projectRoot, 'composer.lock'))) {
      detection.indicators.push({ file: 'composer.lock', weight: 5 });
    }
  }

  /**
   * Detect Python projects
   */
  _detectPython(detection) {
    const files = ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'];

    for (const file of files) {
      if (existsSync(join(this.projectRoot, file))) {
        detection.languages.push('python');
        detection.indicators.push({ file, weight: file === 'pyproject.toml' ? 10 : 8 });

        if (file === 'requirements.txt') detection.packageManagers.push('pip');
        if (file === 'Pipfile') detection.packageManagers.push('pipenv');
        if (file === 'pyproject.toml') {
          detection.packageManagers.push('poetry');
          detection.capabilities.push('modern-python');
        }
        break;
      }
    }

    // Check for Django/Flask
    const requirementsPath = join(this.projectRoot, 'requirements.txt');
    if (existsSync(requirementsPath)) {
      const content = readFileSync(requirementsPath, 'utf-8').toLowerCase();
      if (content.includes('django')) {
        detection.frameworks.push('django');
        detection.capabilities.push('web-framework', 'orm');
      }
      if (content.includes('flask')) {
        detection.frameworks.push('flask');
        detection.capabilities.push('micro-framework');
      }
    }
  }

  /**
   * Detect Rust projects
   */
  _detectRust(detection) {
    if (existsSync(join(this.projectRoot, 'Cargo.toml'))) {
      detection.languages.push('rust');
      detection.packageManagers.push('cargo');
      detection.buildSystems.push('cargo');
      detection.indicators.push({ file: 'Cargo.toml', weight: 10 });
      detection.capabilities.push('systems-programming', 'memory-safe');
    }
  }

  /**
   * Detect Go projects
   */
  _detectGo(detection) {
    if (existsSync(join(this.projectRoot, 'go.mod'))) {
      detection.languages.push('go');
      detection.packageManagers.push('go-modules');
      detection.indicators.push({ file: 'go.mod', weight: 10 });
      detection.capabilities.push('concurrent', 'compiled');
    }
  }

  /**
   * Detect Java projects
   */
  _detectJava(detection) {
    if (existsSync(join(this.projectRoot, 'pom.xml'))) {
      detection.languages.push('java');
      detection.buildSystems.push('maven');
      detection.packageManagers.push('maven');
      detection.indicators.push({ file: 'pom.xml', weight: 10 });
    }

    if (existsSync(join(this.projectRoot, 'build.gradle')) ||
        existsSync(join(this.projectRoot, 'build.gradle.kts'))) {
      detection.languages.push('java');
      detection.buildSystems.push('gradle');
      detection.packageManagers.push('gradle');
      detection.indicators.push({ file: 'build.gradle', weight: 10 });
    }
  }

  /**
   * Detect Ruby projects
   */
  _detectRuby(detection) {
    if (existsSync(join(this.projectRoot, 'Gemfile'))) {
      detection.languages.push('ruby');
      detection.packageManagers.push('bundler');
      detection.indicators.push({ file: 'Gemfile', weight: 10 });

      // Check for Rails
      try {
        const gemfile = readFileSync(join(this.projectRoot, 'Gemfile'), 'utf-8');
        if (gemfile.includes('rails')) {
          detection.frameworks.push('rails');
          detection.capabilities.push('mvc-framework', 'orm');
        }
      } catch (error) {
        // Ignore
      }
    }
  }

  /**
   * Detect Docker usage
   */
  _detectDocker(detection) {
    if (existsSync(join(this.projectRoot, 'Dockerfile'))) {
      detection.capabilities.push('containerized');
      detection.indicators.push({ file: 'Dockerfile', weight: 7 });
    }

    if (existsSync(join(this.projectRoot, 'docker-compose.yml')) ||
        existsSync(join(this.projectRoot, 'docker-compose.yaml'))) {
      detection.capabilities.push('multi-container');
      detection.indicators.push({ file: 'docker-compose.yml', weight: 7 });
    }
  }

  /**
   * Determine primary project type
   */
  _determinePrimaryType(detection) {
    if (detection.frameworks.length > 0) {
      detection.primaryType = detection.frameworks[0];
    } else if (detection.languages.length > 0) {
      detection.primaryType = detection.languages[0];
    }

    // Add descriptive type
    if (detection.frameworks.includes('react') || detection.frameworks.includes('vue')) {
      detection.primaryType = 'frontend-spa';
    } else if (detection.frameworks.includes('nextjs')) {
      detection.primaryType = 'fullstack-javascript';
    } else if (detection.frameworks.includes('laravel') || detection.frameworks.includes('symfony')) {
      detection.primaryType = 'php-backend';
    } else if (detection.frameworks.includes('django') || detection.frameworks.includes('flask')) {
      detection.primaryType = 'python-web';
    }
  }

  /**
   * Calculate confidence score (0-100)
   */
  _calculateConfidence(detection) {
    const totalWeight = detection.indicators.reduce((sum, ind) => sum + ind.weight, 0);

    if (totalWeight >= 20) detection.confidence = 100;
    else if (totalWeight >= 15) detection.confidence = 90;
    else if (totalWeight >= 10) detection.confidence = 80;
    else if (totalWeight >= 5) detection.confidence = 60;
    else detection.confidence = 30;
  }

  /**
   * Get tool ecosystem for detected project type
   */
  getRelevantToolEcosystem(projectType) {
    const ecosystems = {
      'javascript': ['node', 'npm', 'yarn', 'pnpm', 'eslint', 'prettier'],
      'typescript': ['node', 'npm', 'yarn', 'pnpm', 'tsc', 'eslint'],
      'php': ['php', 'composer', 'phpstan', 'rector', 'phpunit'],
      'python': ['python', 'pip', 'poetry', 'pipenv', 'pytest', 'black'],
      'rust': ['cargo', 'rustc', 'clippy', 'rustfmt'],
      'go': ['go', 'gofmt', 'golint'],
      'java': ['java', 'maven', 'gradle', 'javac'],
      'ruby': ['ruby', 'bundler', 'gem', 'rake'],

      // Frameworks
      'laravel': ['php', 'composer', 'artisan', 'phpunit', 'phpstan'],
      'symfony': ['php', 'composer', 'console', 'phpunit'],
      'react': ['node', 'npm', 'webpack', 'babel', 'eslint'],
      'vue': ['node', 'npm', 'vite', 'eslint'],
      'nextjs': ['node', 'npm', 'next', 'react'],
      'django': ['python', 'pip', 'manage.py', 'pytest'],
      'flask': ['python', 'pip', 'pytest']
    };

    // Handle both string and object input
    const typeKey = typeof projectType === 'string' ? projectType : projectType.primaryType;
    return ecosystems[typeKey] || [];
  }
}

export default ProjectTypeDetector;
