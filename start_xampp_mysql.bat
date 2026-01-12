@echo off
echo Starting XAMPP MySQL...
echo.
if exist "C:\xampp\mysql\bin\mysqld.exe" (
    start /B "" "C:\xampp\mysql\bin\mysqld.exe"
    echo MySQL started in background.
    echo You can close this window, MySQL will keep running.
    echo.
    echo To stop it, use Task Manager or run 'taskkill /F /IM mysqld.exe'
) else (
    echo Error: MySQL binary not found at C:\xampp\mysql\bin\mysqld.exe
    echo Please check your XAMPP installation.
)
pause
