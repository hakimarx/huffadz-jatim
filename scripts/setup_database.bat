@echo off
echo =====================================================
echo SETUP DATABASE HUFFADZ JAWA TIMUR
echo =====================================================
echo.
echo Script ini HARUS dijalankan sebagai Administrator!
echo.
pause

set MYSQL_BIN="C:\Program Files\MySQL\MySQL Server 8.4\bin"
set PROJECT_DIR=%~dp0

echo.
echo [1/5] Initializing MySQL...
%MYSQL_BIN%\mysqld --initialize-insecure --console
if errorlevel 1 (
    echo MySQL sudah di-initialize sebelumnya, melanjutkan...
)

echo.
echo [2/5] Installing MySQL as Windows Service...
%MYSQL_BIN%\mysqld --install MySQL84
if errorlevel 1 (
    echo Service mungkin sudah ada, melanjutkan...
)

echo.
echo [3/5] Starting MySQL Service...
net start MySQL84
if errorlevel 1 (
    echo Service mungkin sudah berjalan, melanjutkan...
)

echo.
echo Menunggu MySQL siap...
timeout /t 5 /nobreak

echo.
echo [4/5] Creating Database huffadz_jatim...
%MYSQL_BIN%\mysql -u root -e "CREATE DATABASE IF NOT EXISTS huffadz_jatim CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
if errorlevel 1 (
    echo ERROR: Gagal membuat database!
    pause
    exit /b 1
)

echo.
echo [5/5] Importing Schema dan Admin Users...
%MYSQL_BIN%\mysql -u root huffadz_jatim < "%PROJECT_DIR%database\huffadz_jatim_mysql.sql"
if errorlevel 1 (
    echo WARNING: Error saat import schema (mungkin sudah ada)
)

%MYSQL_BIN%\mysql -u root huffadz_jatim < "%PROJECT_DIR%database\insert_admin_users_mysql.sql"
if errorlevel 1 (
    echo WARNING: Error saat import admin users
)

echo.
echo =====================================================
echo SETUP SELESAI!
echo =====================================================
echo.
echo Akun Login:
echo ---------------------------------------------------
echo Email: hakimarx@gmail.com
echo Password: g4yung4n
echo Role: Admin Provinsi
echo ---------------------------------------------------
echo Email: adminsby@huffadz.jatim.go.id  
echo Password: 123456
echo Role: Admin Kab/Ko Surabaya
echo ---------------------------------------------------
echo Email: hafiz@test.com
echo Password: 123456
echo Role: Hafiz
echo ---------------------------------------------------
echo.
echo Jalankan "npm run dev" di folder project untuk start server
echo Lalu buka http://localhost:3000 dan login
echo.
pause
