# Git Sync Script for Vibe Coding
# This script pulls changes from main and pushes any local changes.

Write-Host "🔄 Starting Vibe Sync..." -ForegroundColor Cyan

# 1. Fetch and Pull
Write-Host "📥 Pulling latest changes from GitHub (main)..." -ForegroundColor Yellow
git fetch origin main
$status = git status -uno
if ($status -match "Your branch is behind") {
    git pull origin main
    Write-Host "✅ Pulled latest changes!" -ForegroundColor Green
} else {
    Write-Host "✨ Already up to date with remote." -ForegroundColor Green
}

# 2. Check for local changes to push
git add .
$changes = git status --porcelain
if ($changes) {
    Write-Host "📤 Found local changes. Committing and pushing..." -ForegroundColor Yellow
    $msg = "Vibe sync: " + (Get-Date -Format "yyyy-MM-dd HH:mm:ss")
    git commit -m $msg
    git push origin main
    Write-Host "✅ Changes pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "🛌 No local changes to push." -ForegroundColor Green
}

Write-Host "🚀 Sync Complete! You are ready to code." -ForegroundColor Cyan
