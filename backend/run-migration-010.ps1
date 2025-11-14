# PowerShell script to run migration 010 - Add password reset tokens

Write-Host "Running migration 010: Add password reset tokens..." -ForegroundColor Cyan

# Load environment variables from .env if it exists
$envFile = ".\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]*)\s*=\s*(.*)$') {
            [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), "Process")
        }
    }
}

# Database connection details
$DB_HOST = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DB_USER = if ($env:DB_USER) { $env:DB_USER } else { "root" }
$DB_PASSWORD = if ($env:DB_PASSWORD) { $env:DB_PASSWORD } else { "" }
$DB_NAME = if ($env:DB_NAME) { $env:DB_NAME } else { "dbemb" }

Write-Host "Database: $DB_NAME on $DB_HOST" -ForegroundColor Yellow

# Path to migration file
$migrationFile = "..\database\migrations\010_add_password_reset_tokens.sql"

if (-not (Test-Path $migrationFile)) {
    Write-Host "Error: Migration file not found at $migrationFile" -ForegroundColor Red
    exit 1
}

# Build mysql command
$mysqlCmd = "mysql"
$mysqlArgs = @(
    "-h", $DB_HOST,
    "-u", $DB_USER,
    $DB_NAME
)

if ($DB_PASSWORD) {
    $mysqlArgs += "-p$DB_PASSWORD"
}

# Execute migration
Write-Host "Executing migration SQL..." -ForegroundColor Yellow
Get-Content $migrationFile | & $mysqlCmd @mysqlArgs

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✓ Migration completed successfully!" -ForegroundColor Green
} else {
    Write-Host "`n✗ Migration failed with exit code $LASTEXITCODE" -ForegroundColor Red
    exit $LASTEXITCODE
}
