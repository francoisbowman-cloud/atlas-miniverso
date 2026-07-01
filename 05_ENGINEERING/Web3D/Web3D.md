# Babylon.js — Capa de presentación de Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo  
**Reemplaza a:** `05_ENGINEERING/Unreal/Unreal_Engine.md`

---

## El rol de Babylon.js en Atlas

Babylon.js es la capa de presentación de Atlas. Renderiza el mundo, mueve los avatares, reproduce el audio y procesa el input del usuario — todo dentro del navegador web.

Igual que Unreal Engine en la concepción original, Babylon.js no toma decisiones de negocio. No valida identidades. No gestiona salas. No almacena datos. Muestra y recibe input. Nada más.

La diferencia es que ahora todo esto ocurre en el navegador, sin descarga, en cualquier hardware moderno.

---

## Qué hace Babylon.js en Atlas

### Renderizado de la escena 3D
- La sala (Cafetería) construida con meshes, materiales y luces
- Sombras mediante shadow maps (no ray tracing — compatible con hardware integrado)
- Post-procesado ligero: color grading cálido, leve viñeta
- Efectos de partículas para vapor, polvo de luz
- Sistema de LOD para avatares lejanos

### Sistema de avatares
- Modelos 3D cargados en formato **GLB/glTF** (estándar web)
- Personalización visual en runtime mediante material instances (color de piel, cabello, ropa)
- Skeletal mesh con sistema de huesos (Babylon.js Skeleton)
- Múltiples avatares renderizados simultáneamente con instancing

### Sistema de animaciones
- **Animation Groups:** cada estado del avatar (idle, walk, sit, emote) es un AnimationGroup
- **State machine:** transiciones entre estados manejadas por una máquina de estados custom en TypeScript
- **IK procedural:** la cabeza del avatar gira hacia quien habla (Bone Look Controller de Babylon.js)
- **Sincronización de "hablar":** animación de hablar activada por el estado de voz recibido del servidor

### Audio
- **Audio ambiental:** Web Audio API + Babylon.js Sound para loops de ambiente (murmullo, música, efectos)
- **Audio espacializado:** Babylon.js `Sound` con `spatialSound: true` para la voz de cada avatar — el volumen y la dirección cambian con la posición en la escena
- **Integración con LiveKit:** el stream de audio de cada usuario llega de LiveKit, Atlas lo conecta como fuente al nodo espacial de Babylon.js

### Input del usuario
- **Movimiento:** WASD o flechas — mueve el avatar en la escena
- **Cámara:** sigue al avatar en tercera persona (ArcRotateCamera con límites)
- **Acciones:** teclas para emotes, click para interactuar, Escape para menú
- Todo input se valida localmente para respuesta inmediata y se envía al Realtime Server

### UI
- La UI **no se renderiza en Babylon.js** — se construye en **HTML/CSS con Svelte** sobre el canvas
- El canvas de Babylon.js ocupa el 100% de la pantalla
- La UI (HUD, chat, menús) son elementos HTML posicionados en `position: absolute` sobre el canvas
- Esta separación hace la UI más fácil de desarrollar y más accesible

### Comunicación con el backend
- **WebSocket:** cliente nativo del navegador para el Realtime Server
- **Fetch API:** para llamadas REST al backend
- **LiveKit SDK:** biblioteca oficial para WebRTC en el navegador

---

## Estructura del proyecto cliente

```
client/
│
├── src/
│   ├── engine/
│   │   ├── scene.ts           ← Inicialización de Babylon.js y la escena
│   │   ├── camera.ts          ← Configuración y control de cámara
│   │   ├── lighting.ts        ← Luces y sombras de la sala
│   │   └── renderer.ts        ← Loop de render y optimizaciones
│   │
│   ├── world/
│   │   ├── cafeteria.ts       ← Carga y setup de la Cafetería
│   │   ├── props.ts           ← Objetos decorativos
│   │   └── ambientAudio.ts    ← Audio ambiental de la sala
│   │
│   ├── avatar/
│   │   ├── AvatarManager.ts   ← Gestiona todos los avatares en escena
│   │   ├── Avatar.ts          ← Clase de un avatar individual
│   │   ├── AnimationController.ts ← State machine de animaciones
│   │   ├── Customization.ts   ← Aplica personalización visual
│   │   └── ProximityDetector.ts ← Detecta distancias entre avatares
│   │
│   ├── network/
│   │   ├── WebSocketClient.ts ← Conexión al Realtime Server
│   │   ├── RestClient.ts      ← Llamadas a la API REST
│   │   └── VoiceClient.ts     ← Integración con LiveKit SDK
│   │
│   ├── ui/                    ← Componentes Svelte
│   │   ├── HUD.svelte
│   │   ├── Chat.svelte
│   │   ├── AvatarCreator.svelte
│   │   ├── Menu.svelte
│   │   └── UserProfile.svelte
│   │
│   ├── audio/
│   │   └── SpatialAudio.ts    ← Conecta streams de LiveKit con Babylon.js
│   │
│   └── main.ts                ← Punto de entrada
│
├── public/
│   └── assets/
│       ├── models/            ← GLB de avatares y sala
│       ├── textures/          ← Texturas de materiales
│       └── audio/             ← Loops de ambiente
│
├── package.json
├── vite.config.ts             ← Bundler (Vite)
└── tsconfig.json
```

---

## Sistema de proximidad en el cliente

La lógica de proximidad es local en el cliente, sin latencia adicional:

```typescript
// ProximityDetector.ts
class ProximityDetector {
  private myPosition: Vector3;
  
  getDistanceTo(otherAvatar: Avatar): number {
    return Vector3.Distance(this.myPosition, otherAvatar.position);
  }
  
  getAudioVolume(distance: number): number {
    if (distance > 15) return 0;
    if (distance > 10) return 0.15;
    if (distance > 5)  return 0.40;
    if (distance > 2)  return 0.70;
    return 1.0;
  }
  
  isChatVisible(distance: number): boolean {
    return distance <= 10;
  }
}
```

El volumen calculado se aplica al nodo de audio espacial del avatar correspondiente en Web Audio API. LiveKit entrega el stream — Babylon.js controla el volumen y la posición.

---

## Formato de assets

| Asset | Formato | Razón |
|---|---|---|
| Modelos 3D | GLB (glTF binario) | Estándar web, eficiente, soportado nativamente por Babylon.js |
| Texturas | WebP / KTX2 | Mejor compresión que PNG/JPG, KTX2 para compresión en GPU |
| Audio ambiental | OGG Vorbis + MP3 (fallback) | OGG: mejor compresión. MP3: compatibilidad Safari |
| Fuentes | WOFF2 | Estándar web moderno |

---

## Optimizaciones de rendimiento para hardware integrado

El objetivo es 30-60 FPS en Intel HD 620 con 20-40 avatares:

**Reducir draw calls:**
- Los props decorativos estáticos se fusionan en un solo mesh (Babylon.js `mergeMeshes`)
- Los avatares usan `InstancedMesh` donde sea posible (mismo modelo, distintas posiciones)

**LOD de avatares:**
- Distancia 0-8m: modelo completo, animaciones completas
- Distancia 8-15m: modelo reducido (50% polígonos), animaciones interpoladas
- Distancia +15m: billboard (sprite plano del avatar) — casi sin costo de render

**Texturas:**
- Texturas comprimidas con KTX2 para reducir carga en VRAM
- Resolución máxima de texturas: 1024x1024 (suficiente para WebGL en integrada)

**Sombras:**
- Sombras solo del avatar del propio usuario (no de todos los avatares)
- Shadow map resolution: 512x512 (bajo costo)

**Anti-aliasing:**
- FXAA (post-proceso, económico) en lugar de MSAA (costoso en integradas)

---

## Compatibilidad de navegadores

| Navegador | Soporte |
|---|---|
| Chrome 90+ | ✅ Completo |
| Edge 90+ | ✅ Completo |
| Firefox 88+ | ✅ Completo |
| Safari 15+ | ✅ Con ajustes de audio (Web Audio requiere interacción del usuario) |
| Safari < 15 | ⚠️ Parcial — sin WebRTC completo |
| Internet Explorer | ❌ No soportado |

---

## Herramientas de desarrollo

| Herramienta | Uso |
|---|---|
| **Vite** | Bundler — recarga en caliente durante desarrollo |
| **Babylon.js Inspector** | Depuración visual de la escena en el navegador |
| **Chrome DevTools** | Profiling de rendimiento, debugging de WebSocket |
| **LiveKit CLI** | Testing de voz en local |
| **glTF Validator** | Validar modelos 3D antes de incluirlos |

---

*Babylon.js convierte el navegador en el motor de Atlas. Sin instalación, sin GPU dedicada, sin barreras.*
