#!/usr/bin/env node

/**
 * CTDiscovery HTTP API Server
 *
 * REST API server for CTDiscovery
 * Enables web dashboards, remote access, and microservice integration
 */

import http from 'http';
import { URL } from 'url';
import { CTDiscovery } from '../index.js';

export class CTDiscoveryServer {
  constructor(options = {}) {
    this.options = {
      port: options.port || 3000,
      host: options.host || 'localhost',
      cors: options.cors !== false,
      timeout: options.timeout || 30000,
      cache: options.cache !== false,
      cacheTTL: options.cacheTTL || 60000,
      ...options
    };

    this.ctd = new CTDiscovery({
      timeout: this.options.timeout,
      enableCache: this.options.cache,
      cacheTTL: this.options.cacheTTL
    });

    this.server = null;
    this.cache = new Map();
  }

  /**
   * Start the HTTP server
   */
  async start() {
    this.server = http.createServer((req, res) => {
      this.handleRequest(req, res).catch(error => {
        console.error('Request handler error:', error);
        this.sendError(res, 500, 'Internal server error');
      });
    });

    return new Promise((resolve, reject) => {
      this.server.listen(this.options.port, this.options.host, (error) => {
        if (error) {
          reject(error);
        } else {
          console.log(`CTDiscovery HTTP API listening on http://${this.options.host}:${this.options.port}`);
          resolve();
        }
      });
    });
  }

  /**
   * Stop the HTTP server
   */
  async stop() {
    if (this.server) {
      return new Promise((resolve) => {
        this.server.close(() => {
          console.log('CTDiscovery HTTP API stopped');
          resolve();
        });
      });
    }
  }

  /**
   * Handle incoming HTTP request
   */
  async handleRequest(req, res) {
    // CORS headers
    if (this.options.cors) {
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    }

    // Handle OPTIONS (CORS preflight)
    if (req.method === 'OPTIONS') {
      res.writeHead(200);
      res.end();
      return;
    }

    // Parse URL
    const url = new URL(req.url, `http://${req.headers.host}`);
    const path = url.pathname;
    const query = Object.fromEntries(url.searchParams);

    // Route to handler
    if (path === '/' && req.method === 'GET') {
      await this.handleRoot(req, res);
    } else if (path === '/api/scan' && req.method === 'GET') {
      await this.handleScan(req, res, query);
    } else if (path === '/api/analyze' && req.method === 'POST') {
      await this.handleAnalyze(req, res);
    } else if (path === '/api/format' && req.method === 'POST') {
      await this.handleFormat(req, res);
    } else if (path === '/api/context' && req.method === 'GET') {
      await this.handleContext(req, res, query);
    } else if (path === '/api/quick-scan' && req.method === 'GET') {
      await this.handleQuickScan(req, res, query);
    } else if (path === '/health' && req.method === 'GET') {
      await this.handleHealth(req, res);
    } else {
      this.sendError(res, 404, 'Not found');
    }
  }

  /**
   * Handle root endpoint
   */
  async handleRoot(req, res) {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <title>CTDiscovery API</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
    h1 { color: #333; }
    code { background: #f4f4f4; padding: 2px 6px; border-radius: 3px; }
    .endpoint { background: #f9f9f9; padding: 15px; margin: 10px 0; border-left: 3px solid #007acc; }
    .method { font-weight: bold; color: #007acc; }
  </style>
</head>
<body>
  <h1>CTDiscovery HTTP API</h1>
  <p>REST API for development environment discovery</p>

  <h2>Endpoints</h2>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/health</code></p>
    <p>Health check endpoint</p>
  </div>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/scan</code></p>
    <p>Scan the development environment</p>
    <p>Query parameters: <code>format=json|markdown|text</code></p>
  </div>

  <div class="endpoint">
    <p><span class="method">POST</span> <code>/api/analyze</code></p>
    <p>Analyze scan results</p>
    <p>Body: JSON scan results from /api/scan</p>
  </div>

  <div class="endpoint">
    <p><span class="method">POST</span> <code>/api/format</code></p>
    <p>Format analysis results</p>
    <p>Body: <code>{ "analysis": {...}, "format": "json|markdown|text" }</code></p>
  </div>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/context</code></p>
    <p>Generate AI assistant context</p>
  </div>

  <div class="endpoint">
    <p><span class="method">GET</span> <code>/api/quick-scan</code></p>
    <p>Quick scan and analyze in one call</p>
    <p>Query parameters: <code>format=json|markdown|text</code></p>
  </div>

  <h2>Examples</h2>
  <pre>
# Quick scan
curl http://localhost:3000/api/quick-scan

# Scan with format
curl http://localhost:3000/api/scan?format=markdown

# Get AI context
curl http://localhost:3000/api/context
  </pre>
</body>
</html>
    `;

    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(html);
  }

  /**
   * Handle /api/scan
   */
  async handleScan(req, res, query) {
    try {
      const results = await this.ctd.scan();

      if (query.format && query.format !== 'json') {
        const analysis = await this.ctd.analyze(results);
        const formatted = await this.ctd.format(analysis, query.format);
        const contentType = query.format === 'markdown' ? 'text/markdown' : 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(formatted);
      } else {
        this.sendJSON(res, results);
      }
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }

  /**
   * Handle /api/analyze
   */
  async handleAnalyze(req, res) {
    try {
      const body = await this.readBody(req);
      const scanResults = JSON.parse(body);

      const analysis = await this.ctd.analyze(scanResults);
      this.sendJSON(res, analysis);
    } catch (error) {
      this.sendError(res, 400, error.message);
    }
  }

  /**
   * Handle /api/format
   */
  async handleFormat(req, res) {
    try {
      const body = await this.readBody(req);
      const { analysis, format = 'json' } = JSON.parse(body);

      const formatted = await this.ctd.format(analysis, format);

      if (format === 'json') {
        this.sendJSON(res, JSON.parse(formatted));
      } else {
        const contentType = format === 'markdown' ? 'text/markdown' : 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(formatted);
      }
    } catch (error) {
      this.sendError(res, 400, error.message);
    }
  }

  /**
   * Handle /api/context
   */
  async handleContext(req, res, query) {
    try {
      const analysis = await this.ctd.scanAndAnalyze();
      const context = await this.ctd.generateContext(analysis);

      if (query.format === 'text') {
        res.writeHead(200, { 'Content-Type': 'text/markdown' });
        res.end(context.markdown);
      } else {
        this.sendJSON(res, context);
      }
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }

  /**
   * Handle /api/quick-scan
   */
  async handleQuickScan(req, res, query) {
    try {
      const analysis = await this.ctd.scanAndAnalyze();

      if (query.format && query.format !== 'json') {
        const formatted = await this.ctd.format(analysis, query.format);
        const contentType = query.format === 'markdown' ? 'text/markdown' : 'text/plain';
        res.writeHead(200, { 'Content-Type': contentType });
        res.end(formatted);
      } else {
        this.sendJSON(res, analysis);
      }
    } catch (error) {
      this.sendError(res, 500, error.message);
    }
  }

  /**
   * Handle /health
   */
  async handleHealth(req, res) {
    this.sendJSON(res, {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '2.0.0'
    });
  }

  /**
   * Read request body
   */
  async readBody(req) {
    return new Promise((resolve, reject) => {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => resolve(body));
      req.on('error', reject);
    });
  }

  /**
   * Send JSON response
   */
  sendJSON(res, data) {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(data, null, 2));
  }

  /**
   * Send error response
   */
  sendError(res, status, message) {
    res.writeHead(status, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: message, status }));
  }
}

/**
 * CLI entry point
 */
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = process.argv[2] || 3000;
  const host = process.argv[3] || 'localhost';

  const server = new CTDiscoveryServer({ port, host });

  server.start().catch(error => {
    console.error('Failed to start server:', error);
    process.exit(1);
  });

  // Graceful shutdown
  process.on('SIGTERM', async () => {
    console.log('Received SIGTERM, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    console.log('Received SIGINT, shutting down gracefully');
    await server.stop();
    process.exit(0);
  });
}

export default CTDiscoveryServer;
