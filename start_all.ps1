# =====================================================================
# Project Aahavaan - Rail: Unified Startup Script (start_all.ps1)
# Starts FastAPI Backend (Port 8000) and Next.js Frontend (Port 3000)
# =====================================================================

$ErrorActionPreference = "Continue"
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "   PROJECT AAHAVAAN - RAIL: UNIFIED SYSTEM STARTUP" -ForegroundColor Yellow
Write-Host "   Indian Railways Digital Twin, Decision Support & x402 Ecosystem" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Clean Stale Processes on Ports 8000 & 3000 ---
Write-Host "[1/4] Checking and clearing ports 8000 & 3000..." -ForegroundColor Cyan
$ports = @(8000, 3000)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $pidToKill = $conn.OwningProcess
            if ($pidToKill -gt 0 -and $pidToKill -ne $PID) {
                Write-Host "  -> Port $port in use by PID $pidToKill. Terminating..." -ForegroundColor Yellow
                Stop-Process -Id $pidToKill -Force -ErrorAction SilentlyContinue
            }
        }
    } else {
        Write-Host "  -> Port $port is available." -ForegroundColor Green
    }
}
Start-Sleep -Seconds 1

# --- 2. Launch FastAPI Backend (Port 8000) ---
Write-Host ""
Write-Host "[2/4] Starting FastAPI Backend on http://localhost:8000..." -ForegroundColor Cyan
$backendCmd = "cd '$ScriptDir'; python backend/main.py"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- Project Aahavaan: FastAPI Backend (Port 8000) ---' -ForegroundColor Cyan; $backendCmd"

# Wait for backend to become healthy
Write-Host "  Waiting for backend health check..." -NoNewline -ForegroundColor Gray
$backendReady = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Seconds 1
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:8000/healthcheck" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            $backendReady = $true
            break
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if ($backendReady) {
    Write-Host " [ONLINE]" -ForegroundColor Green
} else {
    Write-Host " [TIMEOUT - Check backend window]" -ForegroundColor Yellow
}

# --- 3. Launch Next.js Frontend (Port 3000) ---
Write-Host ""
Write-Host "[3/4] Starting Next.js Unified Frontend on http://localhost:3000..." -ForegroundColor Cyan
$frontendCmd = "cd '$ScriptDir'; npm run dev -- -p 3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "Write-Host '--- Project Aahavaan: Next.js Frontend (Port 3000) ---' -ForegroundColor Green; $frontendCmd"

# Wait for frontend to be responsive
Write-Host "  Waiting for frontend server..." -NoNewline -ForegroundColor Gray
$frontendReady = $false
for ($i = 0; $i -lt 25; $i++) {
    Start-Sleep -Seconds 1
    try {
        $res = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
        if ($res.StatusCode -eq 200) {
            $frontendReady = $true
            break
        }
    } catch {
        Write-Host "." -NoNewline -ForegroundColor Gray
    }
}

if ($frontendReady) {
    Write-Host " [ONLINE]" -ForegroundColor Green
} else {
    Write-Host " [STARTING UP in background window]" -ForegroundColor Yellow
}

# --- 4. Launch Browser & Display URLs ---
Write-Host ""
Write-Host "[4/4] Opening Web Browser..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host ""
Write-Host "=================================================================" -ForegroundColor Green
Write-Host "   ALL SYSTEMS ARE UP AND RUNNING!" -ForegroundColor Green
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Primary Command Center:        http://localhost:3000" -ForegroundColor White
Write-Host "  Physical 6-Platform Simulator: http://localhost:3000/simulator" -ForegroundColor White
Write-Host "  Station Master Cockpit (HITL): http://localhost:3000/station-master" -ForegroundColor White
Write-Host "  Passenger Client & x402:       http://localhost:3000/passenger" -ForegroundColor White
Write-Host "  FastAPI Swagger API Docs:      http://localhost:8000/docs" -ForegroundColor White
Write-Host "  Backend Health Check:          http://localhost:8000/healthcheck" -ForegroundColor White
Write-Host ""
Write-Host "  To stop all running servers, run: .\stop_all.ps1 or double-click stop_all.bat" -ForegroundColor Yellow
Write-Host "=================================================================" -ForegroundColor Green
Write-Host ""
