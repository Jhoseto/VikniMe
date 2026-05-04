# restart.ps1 – спира стари процеси и стартира Vite dev сървъра
$Host.UI.RawUI.WindowTitle = "VikniMe – Dev Server"

Write-Host ""
Write-Host " ============================================" -ForegroundColor Cyan
Write-Host "  vikni.me – Спиране на стари процеси..." -ForegroundColor Cyan
Write-Host " ============================================" -ForegroundColor Cyan
Write-Host ""

# Убива всичко на порт 3000
$port = 3000
$connections = netstat -ano | Select-String ":$port\s"
foreach ($line in $connections) {
    $parts = $line -split '\s+' | Where-Object { $_ -ne '' }
    $pid = $parts[-1]
    if ($pid -match '^\d+$' -and $pid -ne '0') {
        Write-Host "  [*] Спиране на PID $pid (port $port)..." -ForegroundColor Yellow
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host " ============================================" -ForegroundColor Green
Write-Host "  Стартиране на dev сървъра..." -ForegroundColor Green
Write-Host "  http://localhost:$port" -ForegroundColor Green
Write-Host " ============================================" -ForegroundColor Green
Write-Host ""

Set-Location "$PSScriptRoot\frontend"
npm run dev
