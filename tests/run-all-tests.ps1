# Main test runner script
$ErrorActionPreference = "Stop"
$testResults = @()

function Write-TestResult {
    param (
        [string]$testName,
        [bool]$success,
        [string]$message
    )
    
    $color = if ($success) { "Green" } else { "Red" }
    $symbol = if ($success) { "✓" } else { "✗" }
    Write-Host "[$symbol] $testName - $message" -ForegroundColor $color
    
    $testResults += @{
        Name = $testName
        Success = $success
        Message = $message
    }
}

function Test-DirectoryStructure {
    $requiredDirs = @(
        "src/frontend",
        "src/edge-functions",
        "src/shared",
        "config/prometheus",
        "config/fluentd",
        "config/nginx",
        "config/otel",
        "docs/api",
        "docs/deployment",
        "docs/development",
        "docs/user-guides",
        "scripts/deployment",
        "scripts/monitoring",
        "scripts/backup",
        "tests/frontend",
        "tests/edge-functions",
        "tests/integration"
    )
    
    foreach ($dir in $requiredDirs) {
        if (-not (Test-Path $dir)) {
            Write-TestResult "Directory Structure - $dir" $false "Directory not found"
            return $false
        }
    }
    Write-TestResult "Directory Structure" $true "All required directories present"
    return $true
}

function Test-ConfigurationFiles {
    $requiredConfigs = @{
        "config/prometheus/rules/health_metrics.yml" = "groups:"
        "config/prometheus/rules/einstein_metrics.yml" = "groups:"
        "config/fluentd/parsers/main.conf" = "<source>"
        "config/nginx/sites/default.conf" = "server {"
        "config/otel/otel-collector-config.yaml" = "receivers:"
    }
    
    foreach ($config in $requiredConfigs.GetEnumerator()) {
        if (-not (Test-Path $config.Key)) {
            Write-TestResult "Configuration Files - $($config.Key)" $false "File not found"
            return $false
        }
        $content = Get-Content $config.Key -Raw
        if (-not $content.Contains($config.Value)) {
            Write-TestResult "Configuration Files - $($config.Key)" $false "Invalid configuration format"
            return $false
        }
    }
    Write-TestResult "Configuration Files" $true "All configuration files present and valid"
    return $true
}

function Test-DocumentationFiles {
    $requiredDocs = @(
        "docs/api/README.md",
        "docs/deployment/README.md",
        "docs/development/README.md",
        "docs/user-guides/README.md"
    )
    
    foreach ($doc in $requiredDocs) {
        if (-not (Test-Path $doc)) {
            Write-TestResult "Documentation Files - $doc" $false "File not found"
            return $false
        }
        $content = Get-Content $doc -Raw
        if (-not $content.Contains("# ")) {
            Write-TestResult "Documentation Files - $doc" $false "Invalid documentation format"
            return $false
        }
    }
    Write-TestResult "Documentation Files" $true "All documentation files present and valid"
    return $true
}

function Test-GitHubWorkflows {
    $workflowFile = ".github/workflows/supabase-ci-cd.yml"
    if (-not (Test-Path $workflowFile)) {
        Write-TestResult "GitHub Workflows" $false "Workflow file not found"
        return $false
    }
    
    $content = Get-Content $workflowFile -Raw
    $requiredElements = @(
        "name: Supabase CI/CD",
        "on:",
        "jobs:",
        "permissions:",
        "env:",
        "SUPABASE_URL:",
        "SUPABASE_PROJECT_REF:"
    )
    
    foreach ($element in $requiredElements) {
        if (-not $content.Contains($element)) {
            Write-TestResult "GitHub Workflows" $false "Missing required element: $element"
            return $false
        }
    }
    Write-TestResult "GitHub Workflows" $true "Workflow file present and valid"
    return $true
}

function Test-Dependencies {
    $frontendPackageJson = "src/frontend/package.json"
    if (-not (Test-Path $frontendPackageJson)) {
        Write-TestResult "Dependencies" $false "Frontend package.json not found"
        return $false
    }
    
    $content = Get-Content $frontendPackageJson | ConvertFrom-Json
    $requiredDeps = @(
        "react",
        "typescript",
        "@supabase/supabase-js"
    )
    
    foreach ($dep in $requiredDeps) {
        if (-not $content.dependencies.$dep) {
            Write-TestResult "Dependencies" $false "Missing required dependency: $dep"
            return $false
        }
    }
    Write-TestResult "Dependencies" $true "All required dependencies present"
    return $true
}

function Test-EnvironmentFiles {
    if (-not (Test-Path ".env.example")) {
        Write-TestResult "Environment Files" $false ".env.example not found"
        return $false
    }
    
    $content = Get-Content ".env.example" -Raw
    $requiredVars = @(
        "SUPABASE_URL=",
        "SUPABASE_ANON_KEY=",
        "SUPABASE_PROJECT_REF="
    )
    
    foreach ($var in $requiredVars) {
        if (-not $content.Contains($var)) {
            Write-TestResult "Environment Files" $false "Missing required variable: $var"
            return $false
        }
    }
    Write-TestResult "Environment Files" $true "Environment files present and valid"
    return $true
}

function Test-DockerConfiguration {
    $requiredFiles = @{
        "Dockerfile" = "FROM"
        "docker-compose.yml" = "version:"
        "docker-compose.prod.yml" = "version:"
        ".dockerignore" = "node_modules"
    }
    
    foreach ($file in $requiredFiles.GetEnumerator()) {
        if (-not (Test-Path $file.Key)) {
            Write-TestResult "Docker Configuration - $($file.Key)" $false "File not found"
            return $false
        }
        $content = Get-Content $file.Key -Raw
        if (-not $content.Contains($file.Value)) {
            Write-TestResult "Docker Configuration - $($file.Key)" $false "Invalid configuration format"
            return $false
        }
    }
    Write-TestResult "Docker Configuration" $true "All Docker files present and valid"
    return $true
}

# Run all tests
Write-Host "Starting system-wide tests..." -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan

Test-DirectoryStructure
Test-ConfigurationFiles
Test-DocumentationFiles
Test-GitHubWorkflows
Test-Dependencies
Test-EnvironmentFiles
Test-DockerConfiguration

# Summary
Write-Host "`nTest Summary" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
$successCount = ($testResults | Where-Object { $_.Success }).Count
$failureCount = ($testResults | Where-Object { -not $_.Success }).Count
Write-Host "Total Tests: $($testResults.Count)" -ForegroundColor White
Write-Host "Successes: $successCount" -ForegroundColor Green
Write-Host "Failures: $failureCount" -ForegroundColor Red

if ($failureCount -gt 0) {
    Write-Host "`nFailed Tests:" -ForegroundColor Red
    $testResults | Where-Object { -not $_.Success } | ForEach-Object {
        Write-Host "- $($_.Name): $($_.Message)" -ForegroundColor Red
    }
    exit 1
}

Write-Host "`nAll tests passed successfully!" -ForegroundColor Green

# Run all tests for the Einstein Field Equations calculator

# Function to check if Redis is running
function Test-RedisConnection {
    try {
        $redis = New-Object System.Net.Sockets.TcpClient
        $redis.Connect("localhost", 6379)
        $redis.Close()
        return $true
    }
    catch {
        return $false
    }
}

# Function to start Redis if not running
function Start-Redis {
    if (-not (Test-RedisConnection)) {
        Write-Host "Starting Redis server..."
        Start-Process "redis-server" -NoNewWindow
        Start-Sleep -Seconds 2
        if (Test-RedisConnection) {
            Write-Host "Redis server started successfully"
        }
        else {
            Write-Host "Failed to start Redis server"
            exit 1
        }
    }
    else {
        Write-Host "Redis server is already running"
    }
}

# Function to run tests
function Run-Tests {
    param (
        [switch]$Coverage,
        [switch]$Verbose
    )

    # Build test command
    $testCmd = "pytest"
    if ($Coverage) {
        $testCmd += " --cov=app"
    }
    if ($Verbose) {
        $testCmd += " -v"
    }

    # Run tests
    Write-Host "Running tests..."
    Invoke-Expression $testCmd
}

# Main script
Write-Host "Starting test suite..."

# Check Python environment
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "Python is not installed or not in PATH"
    exit 1
}

# Check pip
if (-not (Get-Command pip -ErrorAction SilentlyContinue)) {
    Write-Host "pip is not installed"
    exit 1
}

# Install dependencies
Write-Host "Installing dependencies..."
pip install -r requirements-dev.txt

# Start Redis
Start-Redis

# Run tests with coverage
Run-Tests -Coverage -Verbose

# Clean up
Write-Host "Test suite completed" 