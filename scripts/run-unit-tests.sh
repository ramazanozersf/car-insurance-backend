#!/bin/bash

# Car Insurance Backend - Unit Tests Only
# This script runs only unit tests without database dependencies

set -e

echo "🧪 Running Unit Tests for Car Insurance Backend"
echo "=============================================="

# Create test results directory
mkdir -p /app/test-results

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

log "🚀 Starting unit tests..."

# Run unit tests with coverage using Docker-friendly config (no coverage thresholds)
if npx jest --config jest.docker.config.js --coverage --passWithNoTests > /app/test-results/unit-results.txt 2>&1; then
    log "✅ Unit tests PASSED"
    
    # Generate simple HTML report for unit tests
    cat > /app/test-results/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Insurance Backend - Unit Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 15px; border-radius: 5px; margin: 10px 0; background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .results { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        pre { background: #f1f3f4; padding: 10px; border-radius: 3px; overflow-x: auto; font-size: 12px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Car Insurance Backend - Unit Tests</h1>
            <p>Generated on $(date)</p>
        </div>
        
        <div class="status">
            <h2>✅ Unit Tests PASSED</h2>
            <p>All unit tests executed successfully in Docker environment</p>
        </div>
        
        <div class="results">
            <h3>📋 Test Results</h3>
            <pre>$(cat /app/test-results/unit-results.txt | tail -30)</pre>
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #6c757d;">
            <p>🐳 Tests executed in Docker environment</p>
            <p>Coverage reports available at <a href="/coverage/lcov-report/index.html">/coverage/</a></p>
        </div>
    </div>
</body>
</html>
EOF

    log "📊 Unit tests completed successfully!"
    exit 0
else
    log "❌ Unit tests FAILED"
    exit 1
fi
