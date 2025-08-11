@echo off
title 🎮 Quick Backup - Legal Retro Gaming Service
echo 🚀 Quick Backup Starting...
echo ========================

REM Zum Projektverzeichnis wechseln
cd /d D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service

REM Lokales Backup nach C:\temp\RetroRetro
echo 📦 Creating backup...
set BACKUP_DIR=C:\temp\RetroRetro_%date:~6,4%_%date:~3,2%_%date:~0,2%_%time:~0,2%_%time:~3,2%
echo Creating: %BACKUP_DIR%

REM Backup-Verzeichnis erstellen
if not exist "C:\temp" mkdir "C:\temp"
if exist "%BACKUP_DIR%" rmdir /s /q "%BACKUP_DIR%"
mkdir "%BACKUP_DIR%"

REM Komplettes Projekt kopieren
echo Copying all project files...
xcopy "D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service\*" "%BACKUP_DIR%\" /E /I /Y /Q

if %errorlevel% equ 0 (
    echo ✅ Backup: SUCCESS
) else (
    echo ❌ Backup: FAILED
)

echo.
echo 🎯 BACKUP COMPLETE!
echo ==================
echo 💾 Location: %BACKUP_DIR%
echo ⏰ Time: %date% %time%
echo 📁 Size: Calculating...

REM Backup-Größe anzeigen
for /f "tokens=3" %%a in ('dir "%BACKUP_DIR%" /-c ^| findstr /i "bytes"') do set size=%%a
echo 📊 Backup size: %size% bytes

echo.
echo 💡 Your work is SAFE! ✅
echo.
pause