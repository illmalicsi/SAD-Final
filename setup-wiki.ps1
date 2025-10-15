# GitHub Wiki Setup Script
# This script automatically sets up a GitHub Wiki from your markdown files

param(
    [string]$GitUserName = "",
    [string]$GitUserEmail = ""
)

# Configuration
$sourcePath = "c:\Users\limni\Downloads\SAD-Final-main (2)\SAD-Final-main"
$wikiRepoUrl = "https://github.com/illmalicsi/SAD-Final.wiki.git"
$wikiPath = "$env:TEMP\SAD-Final.wiki"

Write-Host ""
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host "    GitHub Wiki Setup for SAD-Final Project" -ForegroundColor Cyan
Write-Host "=========================================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is installed
Write-Host "[*] Checking prerequisites..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "[OK] Git installed: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git is not installed. Please install Git first." -ForegroundColor Red
    Write-Host "        Download from: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

# Configure git user if provided
if ($GitUserName -and $GitUserEmail) {
    Write-Host "[*] Configuring git user..." -ForegroundColor Yellow
    git config --global user.name $GitUserName
    git config --global user.email $GitUserEmail
    Write-Host "[OK] Git configured" -ForegroundColor Green
} else {
    Write-Host "[!] Git user not provided. Using existing git config." -ForegroundColor Yellow
}

# Step 1: Clone wiki repository
Write-Host ""
Write-Host "[STEP 1] Cloning wiki repository..." -ForegroundColor Cyan
Write-Host "         Repository: $wikiRepoUrl" -ForegroundColor Gray

Set-Location $env:TEMP

# Remove existing wiki folder if it exists
if (Test-Path $wikiPath) {
    Write-Host "         Removing existing wiki folder..." -ForegroundColor Yellow
    Remove-Item $wikiPath -Recurse -Force
}

try {
    git clone $wikiRepoUrl 2>&1 | Out-Null
    Write-Host "[OK] Wiki repository cloned successfully" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Failed to clone wiki repository" -ForegroundColor Red
    Write-Host "        Make sure:" -ForegroundColor Yellow
    Write-Host "        1. Wiki is enabled on GitHub" -ForegroundColor Yellow
    Write-Host "        2. You created at least one wiki page manually first" -ForegroundColor Yellow
    Write-Host "        3. You have access to the repository" -ForegroundColor Yellow
    exit 1
}

Set-Location $wikiPath

# Step 2: Copy documentation files
Write-Host ""
Write-Host "[STEP 2] Copying documentation files..." -ForegroundColor Cyan

# Copy README as Home.md
if (Test-Path "$sourcePath\README.md") {
    Copy-Item "$sourcePath\README.md" "$wikiPath\Home.md" -Force
    Write-Host "[OK] Home.md (from README.md)" -ForegroundColor Green
} else {
    Write-Host "[!] README.md not found" -ForegroundColor Yellow
}

# List of documentation files to copy
$files = @(
    "SETUP.md",
    "BOOKING_FINANCE_INTEGRATION.md",
    "TESTING_INVOICE_NOTIFICATION.md",
    "TESTING_NOTIFICATIONS.md",
    "UNIFIED_CUSTOMER_BOOKING_MANAGEMENT.md",
    "DEBUGGING_GUIDE.md",
    "COMPLETE_FIX_GUIDE.md",
    "ALL_COMPONENTS_FIXED.md",
    "BOOKING_NOTIFICATIONS.md",
    "NOTIFICATIONS_FIXED.md",
    "MEMBERSHIP_APPROVAL_FIX.md",
    "LOGIN_TROUBLESHOOTING.md",
    "DASHBOARD_REDESIGN.md",
    "BOOKING_PERSISTENCE_FIX.md",
    "TESTING_BOOKING_FIX.md",
    "IMPLEMENTATION_COMPLETE.md",
    "FINAL_STATUS.md",
    "MIGRATION_REQUIRED.md",
    "BEFORE_AFTER_COMPARISON.md",
    "CLEAR_LOCALSTORAGE.md",
    "FIX_COMPLETE.md",
    "QUICKFIX.md",
    "QUICK_TEST.md"
)

$copiedCount = 0
foreach ($file in $files) {
    if (Test-Path "$sourcePath\$file") {
        Copy-Item "$sourcePath\$file" "$wikiPath\$file" -Force
        Write-Host "[OK] $file" -ForegroundColor Green
        $copiedCount++
    } else {
        Write-Host "[!] $file (not found)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "     Total files copied: $copiedCount" -ForegroundColor Cyan

# Step 3: Create sidebar navigation
Write-Host ""
Write-Host "[STEP 3] Creating sidebar navigation..." -ForegroundColor Cyan

$sidebarContent = @"
## Documentation

### Getting Started
- [Home](Home)
- [Setup Guide](SETUP)

### Integration Guides
- [Booking & Finance Integration](BOOKING_FINANCE_INTEGRATION)
- [Booking Notifications](BOOKING_NOTIFICATIONS)
- [Customer Management](UNIFIED_CUSTOMER_BOOKING_MANAGEMENT)

### Testing Guides
- [Testing Invoice Notifications](TESTING_INVOICE_NOTIFICATION)
- [Testing Notifications](TESTING_NOTIFICATIONS)
- [Testing Booking Fix](TESTING_BOOKING_FIX)
- [Quick Test](QUICK_TEST)

### Troubleshooting
- [Debugging Guide](DEBUGGING_GUIDE)
- [Login Troubleshooting](LOGIN_TROUBLESHOOTING)
- [Complete Fix Guide](COMPLETE_FIX_GUIDE)
- [Quick Fix](QUICKFIX)

### Feature Documentation
- [All Components Fixed](ALL_COMPONENTS_FIXED)
- [Dashboard Redesign](DASHBOARD_REDESIGN)
- [Membership Approval Fix](MEMBERSHIP_APPROVAL_FIX)
- [Booking Persistence Fix](BOOKING_PERSISTENCE_FIX)
- [Notifications Fixed](NOTIFICATIONS_FIXED)
- [Before/After Comparison](BEFORE_AFTER_COMPARISON)

### Status & History
- [Implementation Complete](IMPLEMENTATION_COMPLETE)
- [Final Status](FINAL_STATUS)
- [Fix Complete](FIX_COMPLETE)
- [Migration Required](MIGRATION_REQUIRED)
- [Clear LocalStorage](CLEAR_LOCALSTORAGE)
"@

$sidebarContent | Out-File -FilePath "_Sidebar.md" -Encoding UTF8
Write-Host "[OK] Sidebar navigation created" -ForegroundColor Green

# Step 4: Create footer
Write-Host ""
Write-Host "[STEP 4] Creating footer..." -ForegroundColor Cyan

$footerContent = @"
---
**Davao Blue Eagles Music Studio** | [Main Repository](https://github.com/illmalicsi/SAD-Final) | Last Updated: $(Get-Date -Format "MMMM dd, yyyy")
"@

$footerContent | Out-File -FilePath "_Footer.md" -Encoding UTF8
Write-Host "[OK] Footer created" -ForegroundColor Green

# Step 5: Show git status
Write-Host ""
Write-Host "[STEP 5] Checking files to commit..." -ForegroundColor Cyan
$gitStatus = git status --short
if ($gitStatus) {
    Write-Host $gitStatus -ForegroundColor Gray
    Write-Host ""
    Write-Host "     Files ready to commit: $(($gitStatus -split "`n").Count)" -ForegroundColor Cyan
} else {
    Write-Host "     No changes to commit" -ForegroundColor Yellow
}

# Step 6: Commit and push
Write-Host ""
Write-Host "[STEP 6] Publishing to GitHub..." -ForegroundColor Cyan

try {
    git add . 2>&1 | Out-Null
    Write-Host "[OK] Files staged" -ForegroundColor Green
    
    $commitMsg = "Initial wiki setup with all documentation - $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git commit -m $commitMsg 2>&1 | Out-Null
    Write-Host "[OK] Changes committed" -ForegroundColor Green
    
    Write-Host "     Pushing to GitHub..." -ForegroundColor Yellow
    git push origin master 2>&1 | Out-Null
    Write-Host "[OK] Published to GitHub" -ForegroundColor Green
    
    $success = $true
} catch {
    Write-Host "[ERROR] Failed to publish to GitHub" -ForegroundColor Red
    Write-Host "        Error: $_" -ForegroundColor Yellow
    $success = $false
}

# Final summary
Write-Host ""
Write-Host "=========================================================" -ForegroundColor Green
Write-Host "              WIKI SETUP COMPLETE!" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

if ($success) {
    Write-Host ""
    Write-Host "[SUCCESS] Your wiki has been published!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Visit your wiki at:" -ForegroundColor Cyan
    Write-Host "https://github.com/illmalicsi/SAD-Final/wiki" -ForegroundColor White
    Write-Host ""
    Write-Host "What was created:" -ForegroundColor Cyan
    Write-Host "  * Home page (from README.md)" -ForegroundColor White
    Write-Host "  * $copiedCount documentation pages" -ForegroundColor White
    Write-Host "  * Sidebar navigation menu" -ForegroundColor White
    Write-Host "  * Footer with repository link" -ForegroundColor White
    
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "  1. Open the wiki link above" -ForegroundColor White
    Write-Host "  2. Review the pages and organization" -ForegroundColor White
    Write-Host "  3. Edit pages directly on GitHub if needed" -ForegroundColor White
    Write-Host "  4. Share the wiki link with your team" -ForegroundColor White
    
    # Ask if user wants to open browser
    Write-Host ""
    $openBrowser = Read-Host "Open wiki in browser now? (Y/N)"
    if ($openBrowser -eq 'Y' -or $openBrowser -eq 'y') {
        Start-Process "https://github.com/illmalicsi/SAD-Final/wiki"
    }
} else {
    Write-Host ""
    Write-Host "[!] Setup completed but failed to publish" -ForegroundColor Yellow
    Write-Host "    Files are ready in: $wikiPath" -ForegroundColor White
    Write-Host "    You can manually push with:" -ForegroundColor White
    Write-Host "    cd $wikiPath" -ForegroundColor Gray
    Write-Host "    git push origin master" -ForegroundColor Gray
}

Write-Host ""
