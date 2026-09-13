@echo off
title Stop Project Aahavaan Services
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0stop_all.ps1"
pause
