# PowerShell script to restart the React Native development server
# This ensures that any IP address changes take effect

Write-Host "🔄 Restarting React Native development server..." -ForegroundColor Cyan

# Kill any existing Metro bundler processes
try {
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*expo start*" } | Stop-Process -Force
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*metro*" } | Stop-Process -Force
} catch {
    # Ignore errors if processes don't exist
}

# Wait a moment for processes to clean up
Start-Sleep -Seconds 2

# Clear Metro bundler cache and restart
Write-Host "🧹 Clearing Metro cache..." -ForegroundColor Yellow
npx expo start --clear

Write-Host "✅ Development server restarted with fresh cache" -ForegroundColor Green
