@echo off
:start
set PROGRESS_DIR=D:\Claude_Scripte\RetroRetro\legal-retro-gaming-service\docs\progress

echo.
echo ======================================
echo   RETRORETRO PROGRESS TRACKER
echo ======================================
echo.
echo [1] Open Today's Log (daily_log.md)
echo [2] Open Current Sprint (current-sprint.md) 
echo [3] Open Overview (README.md)
echo [4] Open All in Explorer
echo [5] Quick Daily Update
echo [0] Exit
echo.
set /p choice="Choose option (0-5): "

if "%choice%"=="1" (
    uedit64 "%PROGRESS_DIR%\daily_log.md"
) else if "%choice%"=="2" (
    uedit64 "%PROGRESS_DIR%\current_sprint.md"
) else if "%choice%"=="3" (
    uedit64 "%PROGRESS_DIR%\README.md"  
) else if "%choice%"=="4" (
    explorer "%PROGRESS_DIR%"
) else if "%choice%"=="5" (
    goto :quick_update
) else if "%choice%"=="0" (
    exit
) else (
    echo Invalid choice!
    pause
    goto :start
)
goto :end

:quick_update
echo.
echo === QUICK DAILY UPDATE ===
set /p hours="Hours worked today: "
set /p completed="Main achievement: "
set /p tomorrow="Tomorrow's focus: "
echo.
echo --- Adding to daily log ---
echo ### %date%
echo **Time:** %hours%h ^| **Mood:** 🟢
echo #### ✅ Completed
echo - [x] %completed%
echo #### 🎯 Tomorrow's Plan  
echo - %tomorrow%
echo.
echo Entry ready to copy to daily-log.md
echo Opening file now...
uedit64 "%PROGRESS_DIR%\daily_log.md"

:end
pause