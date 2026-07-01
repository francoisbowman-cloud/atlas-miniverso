# Cómo arrancar Atlas en tu PC

## Requisitos previos

Instalar **Node.js 20+** si no lo tienes:
→ https://nodejs.org (descargar versión LTS)

Verificar instalación abriendo CMD y ejecutando:
```
node --version
npm --version
```

---

## Primer arranque (una sola vez)

Abrir CMD o PowerShell en la carpeta del proyecto y ejecutar:

```bash
# 1. Instalar dependencias del proyecto raíz
npm install

# 2. Instalar dependencias del cliente
cd client
npm install
cd ..

# 3. Instalar dependencias del servidor
cd server
npm install
cd ..
```

---

## Arrancar el proyecto

### Opción A — Cliente y servidor juntos
```bash
npm run dev
```

### Opción B — Solo el cliente (para ver la escena 3D)
```bash
npm run dev:client
```
Luego abrir en Chrome: **http://localhost:3000**

### Opción C — Solo el servidor
```bash
npm run dev:server
```
Health check en: **http://localhost:4000/api/health**

---

## Lo que verás al abrir http://localhost:3000

La cafetería de Atlas: suelo de madera, paredes crema, mesas, sillas, barra, área de sofás, y la iluminación ámbar cálida de las luces colgantes. Con tu avatar (colores custom aplicados sobre el GLB base) parado en la sala.

Para generar o cambiar el avatar sin abrir Blender manualmente, ver `avatar_factory.py` / el conector MCP (`mcp_avatar_server.py`) en la raíz del repo, o ejecutar `run_avatar.bat`.

---

## Si algo falla

**Error "node_modules not found":** ejecutar `npm install` dentro de `client/` o `server/` según corresponda.

**Puerto 3000 ocupado:** cambiar el puerto en `client/vite.config.ts` (línea `port: 3000`).

**Puerto 4000 ocupado:** cambiar `PORT=4001` en `server/.env`.
