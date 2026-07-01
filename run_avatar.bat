@echo off
echo [Atlas] Generando avatar en Blender background mode...
echo.

"C:\Program Files\Blender Foundation\Blender 5.1\blender.exe" --background --python "%~dp0create_avatar.py"

echo.
if exist "%~dp0client\public\models\avatar.glb" (
    echo [Atlas] OK - avatar.glb generado exitosamente.
) else (
    echo [Atlas] ERROR - No se encontro el archivo GLB. Revisa los mensajes arriba.
)
echo.
pause
