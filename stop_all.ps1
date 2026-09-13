# =====================================================================
# Project Aahavaan - Rail: Stop All Services Script (stop_all.ps1)
# Terminates processes on port 8000 (FastAPI) and port 3000 (Next.js)
# =====================================================================

Write-Host ""
Write-Host "Stopping Project Aahavaan services..." -ForegroundColor Cyan

$ports = @(8000, 3000)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -gt 0) {
                Write-Host "  -> Terminating process PID $pidToKill on port $port..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
        Write-Host "  -> Port $port stopped successfully." -ForegroundColor Green
    } else {
        Write-Host "  -> Port $port is already inactive." -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "All Project Aahavaan services stopped." -ForegroundColor Green
Write-Host ""
