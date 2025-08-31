/**
 * External Data Provider
 * Optional API integration for enriching tool analysis
 * Fails gracefully - external data is enhancement, not requirement
 */

export class ExternalDataProvider {
  constructor(options = {}) {
    this.options = {
      timeout: options.timeout || 3000,
      offline: options.offline || false,
      maxRetries: options.maxRetries || 2,
      ...options
    };
    
    this.sources = [
      {
        name: 'npmjs-registry',
        endpoint: 'https://registry.npmjs.org',
        rateLimits: { requests: 100, period: 'hour' },
        provides: ['npm-packages', 'dependencies'],
        enabled: true
      },
      {
        name: 'github-api',
        endpoint: 'https://api.github.com',
        rateLimits: { requests: 60, period: 'hour' },
        provides: ['repositories', 'topics', 'alternatives'],
        enabled: true
      },
      {
        name: 'homebrew-formulae',
        endpoint: 'https://formulae.brew.sh/api',
        rateLimits: { requests: 1000, period: 'hour' },
        provides: ['macos-tools', 'descriptions', 'dependencies'],
        enabled: true
      }
    ];
    
    this.cache = new Map();
    this.requestCounts = new Map();
  }

  /**
   * Enrich tool data with external information
   * @param {string} toolName - Name of tool to enrich
   * @param {Object} options - Query options
   * @returns {Promise<Object|null>} - External data or null
   */
  async enrichToolData(toolName, options = {}) {
    if (this.options.offline || options.offline) {
      return null;
    }
    
    const cacheKey = `${toolName}-${JSON.stringify(options)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    for (const source of this.sources) {
      if (!source.enabled) continue;
      
      try {
        if (!this.canMakeRequest(source)) {
          continue; // Rate limit exceeded
        }
        
        const data = await this.querySource(source, toolName, options);
        if (data) {
          this.cache.set(cacheKey, data);
          this.incrementRequestCount(source);
          return data;
        }
      } catch (error) {
        // Fail gracefully - log but continue to next source
        console.debug(`External data source ${source.name} failed:`, error.message);
        continue;
      }
    }
    
    return null; // No external data available
  }

  /**
   * Query specific external source
   * @private
   */
  async querySource(source, toolName, options) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);
    
    try {
      let url;
      switch (source.name) {
        case 'npmjs-registry':
          url = `${source.endpoint}/${encodeURIComponent(toolName)}`;
          break;
        case 'github-api':
          url = `${source.endpoint}/search/repositories?q=${encodeURIComponent(toolName)}&sort=stars&per_page=1`;
          break;
        case 'homebrew-formulae':
          url = `${source.endpoint}/formula/${encodeURIComponent(toolName)}.json`;
          break;
        default:
          return null;
      }
      
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'CTDiscovery/1.0.0 (https://github.com/binarybcc/ctdiscovery)',
          'Accept': 'application/json'
        }
      });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Tool not found in this source
        }
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return this.normalizeData(data, source);
      
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Normalize data from different sources into consistent format
   * @private
   */
  normalizeData(data, source) {
    const normalized = {
      source: source.name,
      timestamp: new Date().toISOString(),
      data: {}
    };
    
    switch (source.name) {
      case 'npmjs-registry':
        normalized.data = {
          type: 'npm-package',
          description: data.description,
          version: data['dist-tags']?.latest,
          keywords: data.keywords || [],
          dependencies: Object.keys(data.dependencies || {}),
          repository: data.repository?.url,
          homepage: data.homepage
        };
        break;
        
      case 'github-api':
        if (data.items && data.items.length > 0) {
          const repo = data.items[0];
          normalized.data = {
            type: 'github-repository',
            description: repo.description,
            stars: repo.stargazers_count,
            language: repo.language,
            topics: repo.topics || [],
            homepage: repo.homepage,
            repository: repo.html_url
          };
        }
        break;
        
      case 'homebrew-formulae':
        normalized.data = {
          type: 'homebrew-formula',
          description: data.desc,
          version: data.versions?.stable,
          dependencies: data.dependencies || [],
          homepage: data.homepage
        };
        break;
    }
    
    return normalized;
  }

  /**
   * Rate limiting check
   * @private
   */
  canMakeRequest(source) {
    const now = Date.now();
    const key = source.name;
    
    if (!this.requestCounts.has(key)) {
      this.requestCounts.set(key, { count: 0, resetTime: now + (60 * 60 * 1000) });
      return true;
    }
    
    const limits = this.requestCounts.get(key);
    if (now > limits.resetTime) {
      // Reset counter
      limits.count = 0;
      limits.resetTime = now + (60 * 60 * 1000);
      return true;
    }
    
    return limits.count < source.rateLimits.requests;
  }

  /**
   * Increment request counter for rate limiting
   * @private
   */
  incrementRequestCount(source) {
    const key = source.name;
    if (this.requestCounts.has(key)) {
      this.requestCounts.get(key).count++;
    }
  }

  /**
   * Find alternative tools using external data
   * @param {Array} detectedTools - Currently detected tools
   * @returns {Promise<Array>} - Suggested alternatives
   */
  async findAlternatives(detectedTools) {
    if (this.options.offline) return [];
    
    const alternatives = [];
    
    for (const tool of detectedTools.slice(0, 5)) { // Limit to avoid rate limits
      try {
        const enriched = await this.enrichToolData(tool.name);
        if (enriched?.data?.keywords) {
          // Use keywords to suggest related tools
          // This is where more sophisticated matching would go
          alternatives.push({
            for: tool.name,
            suggestions: enriched.data.keywords.filter(k => k !== tool.name).slice(0, 3)
          });
        }
      } catch (error) {
        // Continue with other tools if one fails
        continue;
      }
    }
    
    return alternatives;
  }

  /**
   * Get status of external data sources
   */
  getSourceStatus() {
    return this.sources.map(source => ({
      name: source.name,
      enabled: source.enabled,
      provides: source.provides,
      requestCount: this.requestCounts.get(source.name)?.count || 0,
      rateLimitRemaining: source.rateLimits.requests - (this.requestCounts.get(source.name)?.count || 0)
    }));
  }

  /**
   * Clear cache and reset counters
   */
  reset() {
    this.cache.clear();
    this.requestCounts.clear();
  }
}