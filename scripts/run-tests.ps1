# Run all tests for the Einstein Field Equations project
param(
    [switch]$CI,
    [switch]$UpdateSnapshots,
    [switch]$Debug
)

# Set error action preference
$ErrorActionPreference = "Stop"

# Function to check if a command exists
function Test-Command($command) {
    try { Get-Command $command -ErrorAction Stop | Out-Null; return $true }
    catch { return $false }
}

# Function to run a command and check its exit code
function Invoke-CommandWithCheck {
    param([string]$Command, [string]$ErrorMessage)
    
    Write-Host "Running: $Command" -ForegroundColor Cyan
    Invoke-Expression $Command
    if ($LASTEXITCODE -ne 0) {
        Write-Host $ErrorMessage -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

# Verify required tools are installed
$requiredTools = @("node", "npm", "playwright")
foreach ($tool in $requiredTools) {
    if (-not (Test-Command $tool)) {
        Write-Host "Error: $tool is not installed" -ForegroundColor Red
        exit 1
    }
}

# Create test results directory if it doesn't exist
if (-not (Test-Path "test-results")) {
    New-Item -ItemType Directory -Path "test-results"
}

# Clean previous test results
Remove-Item -Path "test-results/*" -Recurse -Force -ErrorAction SilentlyContinue

# Load test environment variables
if (Test-Path ".env.test") {
    Get-Content ".env.test" | ForEach-Object {
        if ($_ -match '^([^#=]+)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value)
        }
    }
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    Invoke-CommandWithCheck "npm install" "Failed to install dependencies"
}

# Install Playwright browsers if needed
if ($CI -or -not (Test-Path "$env:USERPROFILE/.cache/ms-playwright")) {
    Write-Host "Installing Playwright browsers..." -ForegroundColor Yellow
    Invoke-CommandWithCheck "npx playwright install" "Failed to install Playwright browsers"
}

# Build the project if needed
Write-Host "Building project..." -ForegroundColor Yellow
Invoke-CommandWithCheck "npm run build" "Failed to build project"

# Start local services for testing
Write-Host "Starting local services..." -ForegroundColor Yellow
$supabaseProcess = Start-Process "supabase" -ArgumentList "start" -PassThru
Start-Sleep -Seconds 5  # Wait for services to start

try {
    # Run unit tests
    Write-Host "Running unit tests..." -ForegroundColor Yellow
    $unitTestCommand = "npm run test:unit"
    if ($UpdateSnapshots) { $unitTestCommand += " -- -u" }
    Invoke-CommandWithCheck $unitTestCommand "Unit tests failed"

    # Run integration tests
    Write-Host "Running integration tests..." -ForegroundColor Yellow
    $playwrightCommand = "npx playwright test"
    if ($CI) { $playwrightCommand += " --reporter=github" }
    if ($Debug) { $playwrightCommand += " --debug" }
    if ($UpdateSnapshots) { $playwrightCommand += " --update-snapshots" }
    Invoke-CommandWithCheck $playwrightCommand "Integration tests failed"

    # Run edge function tests
    Write-Host "Running edge function tests..." -ForegroundColor Yellow
    Invoke-CommandWithCheck "npm run test:edge" "Edge function tests failed"

    # Generate test report
    Write-Host "Generating test report..." -ForegroundColor Yellow
    Invoke-CommandWithCheck "npx playwright show-report" "Failed to generate test report"

    Write-Host "All tests completed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "Error during test execution: $_" -ForegroundColor Red
    exit 1
}
finally {
    # Cleanup
    Write-Host "Cleaning up..." -ForegroundColor Yellow
    if ($supabaseProcess) {
        Stop-Process -Id $supabaseProcess.Id -Force
        supabase stop
    }
}

# Save test results if in CI environment
if ($CI) {
    Write-Host "Saving test results..." -ForegroundColor Yellow
    Compress-Archive -Path "test-results/*" -DestinationPath "test-results.zip" -Force
} 