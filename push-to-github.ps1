# GitHub Push Script
# Instructions:
# 1. GitHub par jayein aur Personal Access Token generate karein
# 2. Neeche YOUR_TOKEN_HERE ki jagah apna token paste karein
# 3. Is script ko PowerShell mein run karein: .\push-to-github.ps1

# ============================================
# APNA TOKEN YAHAN PASTE KAREIN
# ============================================
$token = "YOUR_TOKEN_HERE"
# ============================================

$username = "shafeeqvibe1"
$repo = "education-system"

# Current directory check
if (!(Test-Path ".git")) {
    Write-Host "Error: Ye folder git repository nahi hai!" -ForegroundColor Red
    exit 1
}

Write-Host "Pushing to GitHub..." -ForegroundColor Cyan

# Remove old remote (if exists)
git remote remove origin 2>$null

# Add new remote with token
$remoteUrl = "https://${username}:${token}@github.com/${username}/${repo}.git"
git remote add origin $remoteUrl

# Push to GitHub
Write-Host "Uploading files to GitHub..." -ForegroundColor Yellow
git push -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Success! Code GitHub par push ho gaya!" -ForegroundColor Green
    Write-Host "Repository: https://github.com/${username}/${repo}" -ForegroundColor Cyan
    
    # Remove token from remote URL for security
    git remote remove origin
    git remote add origin "https://github.com/${username}/${repo}.git"
    Write-Host "`n🔒 Security: Token removed from git config" -ForegroundColor Green
} else {
    Write-Host "`n❌ Error: Push failed!" -ForegroundColor Red
    Write-Host "Token sahi hai? Internet connection check karein." -ForegroundColor Yellow
}
