# restart.ps1 - spira stari procesi na port 3000 i startira Vite dev sarvara
$Host.UI.RawUI.WindowTitle = "VikniMe Dev Server"

$port = 3000

Write-Host ""
Write-Host " ============================================" -ForegroundColor Cyan
Write-Host "  vikni.me  -  Dev Server" -ForegroundColor Cyan
Write-Host " ============================================" -ForegroundColor Cyan
Write-Host ""

# Nameri i ubij vsichki procesi na port 3000
# VAZNO: ne izpolzvame $pid (reserved PowerShell variable!)
$procs = netstat -ano | Select-String "TCP.*:$port\s.*LISTEN"
if ($procs) {
    foreach ($line in $procs) {
        $parts  = ($line.Line -split '\s+') | Where-Object { $_ -ne '' }
        $procId = $parts[-1]
        if ($procId -match '^\d+$' -and [int]$procId -ne 0) {
            Write-Host "  [*] Spirane na PID $procId (port $port)..." -ForegroundColor Yellow
            Stop-Process -Id ([int]$procId) -Force -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Milliseconds 500
} else {
    Write-Host "  [OK] Port $port e svoboden." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host " ============================================" -ForegroundColor Green
Write-Host "  Startira dev sarvara..." -ForegroundColor Green
Write-Host "  http://localhost:$port" -ForegroundColor Green
Write-Host " ============================================" -ForegroundColor Green
Write-Host ""

Set-Location "$PSScriptRoot\frontend"
npm run dev
