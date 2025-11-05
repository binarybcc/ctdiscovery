# Development Environment Report

**Generated:** 11/5/2025, 11:26:22 PM
**Scan Duration:** 8715ms
**CTDiscovery Version:** 2.0.0

## Environment

| Property | Value |
|----------|-------|
| Platform | linux |
| Node Version | v22.21.0 |
| Working Directory | `/home/user/ctdiscovery` |

## Summary

**Total Tools:** 21
**Overlaps Detected:** 2
**Validation Issues:** 0

### By Status
- **available**: 21

### By Category
- **mcp-server**: 1
- **system-tool**: 20

## Discovered Tools

### Mcp Server

- **@anthropic-ai/claude-code** - 🔵 Available
  - Source: npm
### System Tool

- **git** (v2.43.0) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/git`
  - Capabilities: version-control, branching, merging, history
- **node** (v22.21.0) - 🔵 Available
  - Source: system-path
  - Path: `/opt/node22/bin/node`
  - Capabilities: javascript, runtime, async
- **npm** (v10.9.4) - 🔵 Available
  - Source: system-path
  - Path: `/opt/node22/bin/npm`
  - Capabilities: package-management, dependency-resolution, script-runner
- **python** (v3.11.14) - 🔵 Available
  - Source: system-path
  - Path: `/usr/local/bin/python`
  - Capabilities: scripting, ai-ml, data-science
- **python3** (v3.11.14) - 🔵 Available
  - Source: system-path
  - Path: `/usr/local/bin/python3`
- **pip** (vpip 24.0 from /usr/lib/python3/dist-packages/pip (python 3.11)) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/pip`
- **ruby** (v3.3.6) - 🔵 Available
  - Source: system-path
  - Path: `/usr/local/bin/ruby`
- **go** (vunknown) - 🔵 Available
  - Source: system-path
  - Path: `/usr/local/go/bin/go`
  - Capabilities: compiled, concurrent, systems
- **java** (v21.0.8) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/java`
- **make** (vGNU Make 4.3) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/make`
  - Capabilities: build-automation, task-runner
- **cmake** (v3.28.3) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/cmake`
- **yarn** (v1.22.22) - 🔵 Available
  - Source: system-path
  - Path: `/opt/node22/bin/yarn`
  - Capabilities: package-management, dependency-resolution, workspace
- **pnpm** (v10.19.0) - 🔵 Available
  - Source: system-path
  - Path: `/opt/node22/bin/pnpm`
  - Capabilities: package-management, dependency-resolution, disk-efficient
- **cargo** (v1.90.0) - 🔵 Available
  - Source: system-path
  - Path: `/root/.cargo/bin/cargo`
- **gem** (v3.5.22) - 🔵 Available
  - Source: system-path
  - Path: `/usr/local/bin/gem`
- **claude** (vunknown) - 🔵 Available
  - Source: system-path
  - Path: `/opt/node22/bin/claude`
  - Capabilities: ai-assistant, code-generation, analysis
- **vim** (v9.1.0016) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/vim`
- **curl** (v8.5.0) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/curl`
- **wget** (v1.21.4) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/wget`
- **jq** (vjq-1.7) - 🔵 Available
  - Source: system-path
  - Path: `/usr/bin/jq`

## Overlaps & Conflicts

### command-conflict ℹ️

**Tools:** python, python3

**Reason:** Tools have overlapping functionality

**Recommendation:** Choose one of: , 

### javascript-package-management ℹ️

**Tools:** npm, yarn, pnpm

**Reason:** Tools have overlapping functionality

**Recommendation:** Choose one of: , , 
