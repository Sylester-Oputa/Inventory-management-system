@echo off
REM EliMed Daily Export Script
REM This script runs the daily Excel export at 11pm

echo Starting EliMed Daily Export...
echo Time: %date% %time%

REM Change to the backend directory
cd /d "C:\Users\pc\Desktop\EliMed\backend"

REM Make API call to generate export
curl -X POST http://localhost:4000/export/generate ^
  -H "Content-Type: application/json" ^
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

if %ERRORLEVEL% EQU 0 (
    echo Export completed successfully!
) else (
    echo Export failed with error code %ERRORLEVEL%
)

echo Export completed at %time%
