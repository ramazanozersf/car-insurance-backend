#!/bin/bash

# Car Insurance Backend - Comprehensive Test Runner
# This script runs all test types in sequence with proper reporting

set -e

echo "🧪 Starting Comprehensive Test Suite for Car Insurance Backend"
echo "=============================================================="

# Create test results directory
mkdir -p /app/test-results

# Function to log with timestamp
log() {
    echo "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

# Function to run tests with error handling
run_test() {
    local test_type=$1
    local test_command=$2
    local output_file="/app/test-results/${test_type}-results.txt"
    
    log "🚀 Running ${test_type} tests..."
    
    if eval "$test_command" > "$output_file" 2>&1; then
        log "✅ ${test_type} tests PASSED"
        return 0
    else
        log "❌ ${test_type} tests FAILED"
        echo "Error details:" >> "$output_file"
        return 1
    fi
}

# Function to wait for database
wait_for_db() {
    log "⏳ Waiting for test database to be ready..."
    while ! pg_isready -h test-db -p 5432 -U postgres -d car_insurance_test_db; do
        sleep 2
    done
    log "✅ Test database is ready"
}

# Function to wait for Redis
wait_for_redis() {
    log "⏳ Waiting for test Redis to be ready..."
    while ! redis-cli -h test-redis -p 6379 ping > /dev/null 2>&1; do
        sleep 2
    done
    log "✅ Test Redis is ready"
}

# Initialize test environment
log "🔧 Initializing test environment..."
wait_for_db
wait_for_redis

# Test execution tracking
TESTS_PASSED=0
TESTS_FAILED=0
FAILED_TESTS=()

# 1. Unit Tests
log "📋 Phase 1: Unit Tests"
if run_test "unit" "npm run test:unit:cov"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
    FAILED_TESTS+=("unit")
fi

# 2. Integration Tests
log "📋 Phase 2: Integration Tests"
if run_test "integration" "npm run test:integration"; then
    ((TESTS_PASSED++))
else
    ((TESTS_FAILED++))
    FAILED_TESTS+=("integration")
fi

# 3. E2E Tests (if app is available)
log "📋 Phase 3: E2E Tests"
if curl -f http://app-test:3000/api/v1/health > /dev/null 2>&1; then
    if run_test "e2e" "npm run test:e2e"; then
        ((TESTS_PASSED++))
    else
        ((TESTS_FAILED++))
        FAILED_TESTS+=("e2e")
    fi
else
    log "⚠️  Skipping E2E tests - application not available"
fi

# Generate test summary
log "📊 Generating test summary..."
cat > /app/test-results/test-summary.json << EOF
{
  "timestamp": "$(date -Iseconds)",
  "environment": "docker",
  "total_test_suites": $((TESTS_PASSED + TESTS_FAILED)),
  "passed_suites": $TESTS_PASSED,
  "failed_suites": $TESTS_FAILED,
  "failed_test_types": $(printf '%s\n' "${FAILED_TESTS[@]}" | jq -R . | jq -s .),
  "success_rate": $(echo "scale=2; $TESTS_PASSED * 100 / ($TESTS_PASSED + $TESTS_FAILED)" | bc -l 2>/dev/null || echo "0")
}
EOF

# Generate HTML report
cat > /app/test-results/index.html << EOF
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Car Insurance Backend - Test Results</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { text-align: center; margin-bottom: 30px; }
        .status { padding: 10px; border-radius: 5px; margin: 10px 0; }
        .passed { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .failed { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin: 20px 0; }
        .metric { background: #e9ecef; padding: 15px; border-radius: 5px; text-align: center; }
        .metric h3 { margin: 0 0 10px 0; color: #495057; }
        .metric .value { font-size: 2em; font-weight: bold; color: #007bff; }
        .test-results { margin-top: 30px; }
        .test-result { margin: 15px 0; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff; background: #f8f9fa; }
        pre { background: #f1f3f4; padding: 10px; border-radius: 3px; overflow-x: auto; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 Car Insurance Backend Test Results</h1>
            <p>Generated on $(date)</p>
        </div>
        
        <div class="status $([ $TESTS_FAILED -eq 0 ] && echo 'passed' || echo 'failed')">
            <h2>Overall Status: $([ $TESTS_FAILED -eq 0 ] && echo '✅ ALL TESTS PASSED' || echo '❌ SOME TESTS FAILED')</h2>
        </div>
        
        <div class="summary">
            <div class="metric">
                <h3>Total Test Suites</h3>
                <div class="value">$((TESTS_PASSED + TESTS_FAILED))</div>
            </div>
            <div class="metric">
                <h3>Passed</h3>
                <div class="value" style="color: #28a745;">$TESTS_PASSED</div>
            </div>
            <div class="metric">
                <h3>Failed</h3>
                <div class="value" style="color: #dc3545;">$TESTS_FAILED</div>
            </div>
            <div class="metric">
                <h3>Success Rate</h3>
                <div class="value" style="color: #17a2b8;">$(echo "scale=1; $TESTS_PASSED * 100 / ($TESTS_PASSED + $TESTS_FAILED)" | bc -l 2>/dev/null || echo "0")%</div>
            </div>
        </div>
        
        <div class="test-results">
            <h2>📋 Test Results Details</h2>
EOF

# Add individual test results to HTML
for result_file in /app/test-results/*-results.txt; do
    if [ -f "$result_file" ]; then
        test_name=$(basename "$result_file" -results.txt)
        cat >> /app/test-results/index.html << EOF
            <div class="test-result">
                <h3>$(echo "$test_name" | tr '[:lower:]' '[:upper:]') Tests</h3>
                <pre>$(cat "$result_file" | tail -20)</pre>
            </div>
EOF
    fi
done

cat >> /app/test-results/index.html << EOF
        </div>
        
        <div style="margin-top: 30px; text-align: center; color: #6c757d;">
            <p>🐳 Tests executed in Docker environment</p>
            <p>Coverage reports available at <a href="/coverage/lcov-report/index.html">/coverage/</a></p>
        </div>
    </div>
</body>
</html>
EOF

# Final summary
echo ""
echo "=============================================================="
log "📊 TEST EXECUTION SUMMARY"
echo "=============================================================="
log "Total Test Suites: $((TESTS_PASSED + TESTS_FAILED))"
log "Passed: $TESTS_PASSED"
log "Failed: $TESTS_FAILED"

if [ $TESTS_FAILED -eq 0 ]; then
    log "🎉 ALL TESTS PASSED! The application is ready for deployment."
    echo "✅ Test results available at: http://localhost:8080"
    exit 0
else
    log "❌ Some tests failed. Failed test types: ${FAILED_TESTS[*]}"
    log "🔍 Check individual test results in /app/test-results/"
    echo "📊 Test results available at: http://localhost:8080"
    exit 1
fi
