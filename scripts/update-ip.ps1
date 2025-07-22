# PowerShell script to update backend API URL with current IP address
# Usage: .\update-ip.ps1 [new-ip]

param(
    [string]$NewIP = $null
)

# Files to update
$FilesToUpdate = @(
    "src\services\axios.customize.ts",
    "src\constants\api.ts"
)

# Function to get current IP address
function Get-CurrentIP {
    try {
        $output = ipconfig | Select-String "IPv4 Address"
        if ($output) {
            $ip = ($output[0] -split ":")[1].Trim()
            return $ip
        }
    }
    catch {
        Write-Error "Error getting IP address: $($_.Exception.Message)"
    }
    return $null
}

# Function to update IP in files
function Update-IPInFiles {
    param(
        [string]$OldIP,
        [string]$NewIP
    )
    
    $oldUrl = "http://$OldIP`:3000/api"
    $newUrl = "http://$NewIP`:3000/api"
    
    Write-Host "Updating IP from $OldIP to $NewIP" -ForegroundColor Yellow
    
    $updatedFiles = 0
    
    foreach ($filePath in $FilesToUpdate) {
        $fullPath = Join-Path (Get-Location) $filePath
        
        try {
            if (Test-Path $fullPath) {
                $content = Get-Content $fullPath -Raw
                $updatedContent = $content -replace [regex]::Escape($oldUrl), $newUrl
                
                if ($content -ne $updatedContent) {
                    Set-Content $fullPath -Value $updatedContent -NoNewline
                    Write-Host "Successfully updated: $filePath" -ForegroundColor Green
                    $updatedFiles++
                } else {
                    Write-Host "No changes needed: $filePath" -ForegroundColor Yellow
                }
            } else {
                Write-Host "File not found: $filePath" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "Error updating $filePath : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    return $updatedFiles
}

# Main execution
try {
    if (-not $NewIP) {
        # Auto-detect current IP
        $NewIP = Get-CurrentIP
        if (-not $NewIP) {
            Write-Host "Could not detect current IP address. Please provide IP manually." -ForegroundColor Red
            Write-Host "Usage: .\update-ip.ps1 [new-ip]" -ForegroundColor Yellow
            exit 1
        }
        Write-Host "Detected current IP: $NewIP" -ForegroundColor Cyan
    }
    
    # Validate IP format
    if ($NewIP -notmatch "^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$") {
        Write-Host "Invalid IP address format" -ForegroundColor Red
        exit 1
    }
    
    # Find current IP in files
    $firstFile = Join-Path (Get-Location) $FilesToUpdate[0]
    $currentIP = $null
    
    if (Test-Path $firstFile) {
        $content = Get-Content $firstFile -Raw
        if ($content -match "http://(\d+\.\d+\.\d+\.\d+):3000") {
            $currentIP = $matches[1]
        }
    }
    
    if (-not $currentIP) {
        Write-Host "Could not find current IP in configuration files" -ForegroundColor Red
        exit 1
    }
    
    if ($currentIP -eq $NewIP) {
        Write-Host "IP address is already up to date" -ForegroundColor Green
        exit 0
    }
    
    Write-Host "Updating IP address from $currentIP to $NewIP" -ForegroundColor Cyan
    
    $updatedFiles = Update-IPInFiles -OldIP $currentIP -NewIP $NewIP
    
    if ($updatedFiles -gt 0) {
        Write-Host ""
        Write-Host "Successfully updated $updatedFiles files" -ForegroundColor Green
        Write-Host "Please restart your app to apply changes" -ForegroundColor Yellow
    } else {
        Write-Host "No files were updated" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "An error occurred: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
