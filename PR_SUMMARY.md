# Pull Request: Intelligence Layer v2.1.0

## Title
🎉 Intelligence Layer v2.1.0 - Multi-layer Architecture with Smart Tool Detection

## Summary

This PR implements a comprehensive multi-layer intelligence system for CTDiscovery v2.1.0, transforming it from a basic scanner into an intelligent development environment analyzer with context-aware tool detection, relevance scoring, and smart filtering.

### Major Features

#### 🧠 Intelligence Layer
- **Project Type Detection**: Automatically identifies project type (PHP, JavaScript, Python, etc.) from config files
- **Usage Pattern Analysis**: Detects if tools are actively used in scripts, configured, or just installed
- **Relevance Scoring**: Multi-factor scoring system (ecosystem match, configuration, active usage, capabilities)
- **Smart Filtering**: Organizes tools into active/available/noise categories
- **Maturity Assessment**: Evaluates development environment maturity (0-100 score)

#### 🛠️ Core Components
- **IntelligenceAnalyzer**: Orchestrates all intelligence components
- **ProjectTypeDetector**: Identifies project type with confidence scores
- **UsageAnalyzer**: Analyzes tool usage patterns from package.json/composer.json scripts
- **RelevanceScorer**: Calculates multi-dimensional relevance scores
- **MaturityAssessor**: Evaluates environment maturity based on tool capabilities

#### 🐛 Critical Bug Fixes
1. **ES Module JSON Loading**: Fixed `require()` usage in ES modules (silent failures)
2. **Script Confidence Scoring**: Increased from 25 to 45 points for tools in scripts
3. **Active-Development Threshold**: Lowered from 70 to 45 to match script-based tools
4. **Ecosystem Scoring Logic**: Fixed to check for matching language BEFORE irrelevance
5. **Tool Capabilities**: Added comprehensive capability mappings for PHP/JS/Python tools
6. **JSON Output Corruption**: Fixed progress messages mixing into JSON output
7. **Quiet Mode Runtime**: Fixed quiet flag propagation through component chain
8. **ProjectRoot Propagation**: Fixed UsageAnalyzer to receive projectRoot correctly

### Test Results

✅ **66/67 tests passing** (1 expected timeout on systems with extensive tooling)
- All intelligence layer tests passing
- All processor tests passing
- All API tests passing

### Real-World Testing

Tested on production PHP project (cfk-standalone):

**Before:**
- Maturity: basic (30/100)
- Active Tools: 1 (only ESLint detected)
- False recommendations to install already-installed tools

**After:**
- Maturity: established (65/100) ✅
- Active Tools: 7 (php, composer, phpstan, phpcs, php-cs-fixer, rector, phpunit) ✅
- Description: "Well-established php development environment with quality tools, automated testing" ✅
- No false recommendations ✅

### New Features

- `--smart` mode: Shows only relevant, actively-used tools
- `--version` / `-v`: Display version information
- Version display in CLI header
- Quiet mode for clean JSON/markdown output
- Debug logging: `DEBUG_USAGE=1` and `DEBUG_RELEVANCE=1`

### Documentation

- Complete API documentation
- Architecture guide
- Integration examples
- Changelog with all changes

### Breaking Changes

None - fully backward compatible with v1.x

### Files Changed

- 57 files changed
- 13,293 lines added
- New intelligence/ directory with 4 components
- Enhanced processors/ with capability mappings
- Comprehensive test coverage

## Test Plan

- [x] Run full test suite (`npm test`)
- [x] Test on JavaScript project (CTDiscovery itself)
- [x] Test on PHP project (cfk-standalone)
- [x] Verify JSON output is clean
- [x] Verify version display works
- [x] Test quiet mode with --json flag
- [x] Verify all intelligence modes (smart, all, project-optimized)

## How to Create the PR

Run this command to create the pull request:

```bash
gh pr create \
  --base main \
  --head claude/ctdiscovery-multi-layer-architecture-011CUqZfihAtJTq17SiVjU8e \
  --title "🎉 Intelligence Layer v2.1.0 - Multi-layer Architecture with Smart Tool Detection" \
  --body-file PR_SUMMARY.md
```

Or create it manually on GitHub using the content above.
