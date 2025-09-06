#!/usr/bin/env node

// Simple test script to validate CTDiscovery CLI integration
const { exec } = require('child_process');
const path = require('path');
const fs = require('fs');

async function testCTDiscoveryIntegration() {
    console.log('🧪 Testing CTDiscovery CLI Integration...\n');
    
    try {
        // Test 1: Check if ctdiscovery command is available
        console.log('1️⃣ Testing CTDiscovery CLI availability...');
        const { stdout: helpOutput } = await execAsync('ctdiscovery --help');
        console.log('✅ CTDiscovery CLI is available');
        
        // Test 2: Generate tools file
        console.log('\n2️⃣ Testing file generation...');
        const { stdout: scanOutput } = await execAsync('ctdiscovery --all --quiet');
        console.log('✅ CTDiscovery scan completed');
        
        // Test 3: Check if tool-summary.json was created
        console.log('\n3️⃣ Testing JSON file generation...');
        const jsonPath = path.join(process.cwd(), '..', 'tools', 'tool-summary.json');
        
        if (fs.existsSync(jsonPath)) {
            const jsonContent = fs.readFileSync(jsonPath, 'utf8');
            const data = JSON.parse(jsonContent);
            
            console.log('✅ tool-summary.json found and parsed');
            console.log(`📊 Tools found: ${data.summary?.total || 0}`);
            console.log(`📦 Categories: ${Object.keys(data.categories || {}).join(', ')}`);
            
            // Test scanner service normalization
            const normalizedData = {
                vscode: data.categories['vscode']?.tools || [],
                systemTools: data.categories['system-tool']?.tools || [],
                mcpServers: data.categories['mcp-server']?.tools || []
            };
            
            console.log('\n📋 Normalized data structure:');
            console.log(`  • VSCode tools: ${normalizedData.vscode.length}`);
            console.log(`  • System tools: ${normalizedData.systemTools.length}`);
            console.log(`  • MCP servers: ${normalizedData.mcpServers.length}`);
            
        } else {
            console.log('❌ tool-summary.json not found at:', jsonPath);
        }
        
        console.log('\n🎉 Integration test completed successfully!');
        
    } catch (error) {
        console.error('❌ Integration test failed:', error.message);
        process.exit(1);
    }
}

function execAsync(command) {
    return new Promise((resolve, reject) => {
        exec(command, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            } else {
                resolve({ stdout, stderr });
            }
        });
    });
}

testCTDiscoveryIntegration();