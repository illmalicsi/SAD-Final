#!/usr/bin/env pwsh
# PowerShell script to export MySQL users to JSON

Write-Host "🎵 Blue Eagles Music Band - User Export Tool" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the backend directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: Please run this script from the backend directory" -ForegroundColor Red
    Write-Host "💡 Tip: cd backend" -ForegroundColor Yellow
    exit 1
}

Write-Host "📋 Available export options:" -ForegroundColor Green
Write-Host "   1. Export application users only" -ForegroundColor White
Write-Host "   2. Export all users (app + MySQL system users)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Select option (1 or 2)"

switch ($choice) {
    "1" {
        Write-Host "🚀 Exporting application users..." -ForegroundColor Yellow
        npm run export-users
    }
    "2" {
        Write-Host "🚀 Exporting all users (requires admin privileges)..." -ForegroundColor Yellow
        npm run export-all-users
    }
    default {
        Write-Host "❌ Invalid choice. Please select 1 or 2." -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "✅ Export completed! Check the exports folder for your JSON file." -ForegroundColor Green