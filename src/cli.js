#!/usr/bin/env node

/**
 * CTDiscovery CLI Entry Point
 *
 * This file serves as the bin entry point and delegates to the enhanced CLI
 */

// Import the enhanced CLI
import './cli/cli.js';

// The enhanced CLI will handle all command-line arguments
// This file simply serves as the entry point for the bin command

/*
 * Legacy implementation below (kept for reference)
 * The new enhanced CLI provides:
 * - Multi-layer API integration
 * - Intelligence modes (--smart, --all, --project-optimized, --ai-context)
 * - Better output formatting
 * - Programmatic API support
 */

/*
import { EnvironmentScanner } from './scanners/environment-scanner.js';
import { StatusDisplay } from './display/status-display.js';
import { ContextGenerator } from './generators/context-generator.js';

// (Legacy implementation commented out - see src/cli/cli.js for new implementation)
*/