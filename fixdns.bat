@echo off
echo Setting DNS to Cloudflare (1.1.1.1) on WiFi 2...
netsh interface ip set dns "WiFi 2" static 1.1.1.1 primary
netsh interface ip add dns "WiFi 2" 1.0.0.1 index=2
echo.
echo Verifying...
netsh interface ip show dns "WiFi 2"
echo.
echo Flushing DNS cache...
ipconfig /flushdns
echo.
pause
