# Script untuk mempersiapkan file deployment ke cPanel
# Jalankan dengan: .\prepare_cpanel_deploy.ps1

Write-Host "=== Persiapan Deployment ke cPanel ===" -ForegroundColor Cyan

$projectDir = "c:\Users\Administrator\aplikasi\huffadz-jatim"
$standalonePath = "$projectDir\.next\standalone"
$staticPath = "$projectDir\.next\static"
$outputZip = "$projectDir\cpanel-deploy.zip"
$tempDir = "$projectDir\temp-deploy"

# Cleanup temp folder if exists
if (Test-Path $tempDir) {
    Remove-Item -Recurse -Force $tempDir
}

# Create temp folder
New-Item -ItemType Directory -Path $tempDir | Out-Null

Write-Host "1. Copying standalone files..." -ForegroundColor Yellow
Copy-Item -Recurse "$standalonePath\*" $tempDir

Write-Host "2. Copying static files to .next/static..." -ForegroundColor Yellow
if (!(Test-Path "$tempDir\.next\static")) {
    New-Item -ItemType Directory -Path "$tempDir\.next\static" -Force | Out-Null
}
Copy-Item -Recurse "$staticPath\*" "$tempDir\.next\static\"

Write-Host "3. Creating ZIP file..." -ForegroundColor Yellow
if (Test-Path $outputZip) {
    Remove-Item $outputZip -Force
}

# Compress to ZIP 
Compress-Archive -Path "$tempDir\*" -DestinationPath $outputZip -Force

Write-Host "4. Cleaning up..." -ForegroundColor Yellow
Remove-Item -Recurse -Force $tempDir

$zipSize = (Get-Item $outputZip).Length / 1MB
Write-Host ""
Write-Host "=== SELESAI ===" -ForegroundColor Green
Write-Host "File ZIP: $outputZip" -ForegroundColor Cyan
Write-Host "Ukuran: $([math]::Round($zipSize, 2)) MB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Langkah selanjutnya:" -ForegroundColor Yellow
Write-Host "1. Upload file $outputZip ke cPanel File Manager > public_html"
Write-Host "2. Extract file ZIP di public_html"
Write-Host "3. Setup Node.js App di cPanel"
Write-Host "4. Start aplikasi"
