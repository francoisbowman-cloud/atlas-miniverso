# Unreal Engine en Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo

---

## El rol exacto de Unreal Engine

Unreal Engine es la capa de presentación de Atlas. Nada más.

Renderiza el mundo. Mueve los avatares. Reproduce el audio. Procesa el input del usuario. Comunica al backend lo que ocurre. Recibe del backend lo que debe mostrar.

No toma decisiones de negocio. No valida identidades. No gestiona salas. No procesa lógica de moderación. No almacena datos de usuario.

Esta delimitación es deliberada y no debe violarse.

---

## Qué hace Unreal Engine en Atlas

### Renderizado del mundo
- El entorno 3D de cada sala: geometría, materiales, iluminación, sombras
- Efectos de partículas (vapor, polvo de luz, ambiente)
- Ciclo de tiempo (variación de iluminación según hora)
- Post-procesado: color grading cálido, viñeta suave, depth of field

### Avatares
- Carga y renderizado del modelo 3D del avatar según los datos recibidos del backend
- Sistema de personalización visual: mapas de color para piel, cabello y ropa
- Skeletal mesh con sistema de huesos para animaciones
- LOD (Level of Detail): menor detalle para avatares lejanos para optimizar rendimiento

### Sistema de animaciones
- Máquina de estados de animación (Idle, Walk, Sit, Lean, Emotes)
- Animation Blending: transiciones suaves entre estados
- Procedural animation: la cabeza del avatar gira hacia quien habla (IK)
- Sincronización de animación de "hablar" con el estado de voz recibido del servidor

### Audio en cliente
- Reproducción del audio ambiental de sala (loops, efectos)
- Audio espacializado 3D para voz por proximidad (Unreal gestiona el volumen y la dirección)
- El sistema de voz usa Unreal como capa de presentación de audio, pero WebRTC gestiona la transmisión

### Input del usuario
- Movimiento del avatar: WASD o joystick analógico
- Rotación de cámara: ratón
- Acciones: teclas de emotes, apertura de menú, activar micrófono
- Todo input se valida localmente para respuesta inmediata, y se comunica al servidor para sincronización

### UI y HUD
- Renderizado de la interfaz (HUD, menús, burbujas de chat)
- Unreal Widget System (UMG) para toda la UI
- Los datos de UI (nombre de usuario, estado, mensajes) vienen del backend

### Comunicación con el backend
- WebSocket client integrado en Unreal para el Realtime Server
- HTTP client para llamadas REST a los servicios del backend
- Toda comunicación está cifrada (TLS/WSS)

---

## Qué NO hace Unreal Engine en Atlas

Esta lista es igual de importante. Violarla crea deuda técnica difícil de resolver.

- **No valida autenticación.** El token de sesión viene del Auth Service. Unreal lo almacena y lo envía en cada request, pero no lo genera ni lo valida.
- **No gestiona la lógica de sala.** Si la sala está llena, es el Rooms Service quien lo decide, no el cliente.
- **No procesa chat.** Los mensajes de texto pasan por el Realtime Server. Unreal solo los muestra.
- **No gestiona voz.** La captura, transmisión y enrutamiento de voz es responsabilidad del Voice Router (WebRTC). Unreal recibe el stream de audio ya procesado y lo reproduce con espacialización 3D.
- **No almacena datos de usuario.** El perfil, el avatar y la configuración viven en el backend. El cliente los carga al iniciar sesión.
- **No toma decisiones de moderación.** Si un usuario es expulsado, el Moderation Service lo notifica al Realtime Server, que a su vez le ordena al cliente desconectarse.

---

## Arquitectura del proyecto en Unreal

```
AtlasGame/
│
├── Content/
│   ├── Levels/
│   │   └── Cafeteria/          ← La sala del MVP
│   ├── Characters/
│   │   ├── Base/               ← Skeletal mesh base por silueta
│   │   ├── Customization/      ← Materiales y texturas intercambiables
│   │   └── Animations/         ← Animation blueprints y assets
│   ├── UI/
│   │   ├── HUD/
│   │   ├── Menus/
│   │   └── Chat/
│   ├── Audio/
│   │   ├── Ambient/            ← Loops de ambiente por sala
│   │   └── SFX/                ← Efectos de sonido
│   └── World/
│       ├── Props/              ← Objetos decorativos
│       ├── Architecture/       ← Geometría de sala
│       └── VFX/                ← Partículas y efectos
│
├── Source/
│   ├── AtlasGame/
│   │   ├── Network/            ← WebSocket client, HTTP client
│   │   ├── Avatar/             ← Lógica de avatar y personalización
│   │   ├── Proximity/          ← Sistema de detección de proximidad
│   │   ├── AudioSpatial/       ← Integración de audio 3D con WebRTC
│   │   └── GameMode/           ← Game Mode y Game State del cliente
```

---

## Sistema de proximidad en el cliente

El cliente Unreal gestiona la detección de proximidad visualmente, pero el backend es la fuente de verdad de quién está en el rango de quién.

**Cómo funciona en cliente:**

1. El Realtime Server envía la posición de todos los avatares en la sala constantemente.
2. El cliente calcula la distancia de cada avatar al propio usuario localmente.
3. Basado en esa distancia, el cliente ajusta:
   - Visibilidad de las burbujas de chat
   - Volumen de la voz (aplicado sobre el stream de audio recibido de WebRTC)
   - Dirección del audio espacializado
   - Visibilidad del nombre de usuario sobre el avatar

**La decisión de si mostrar o no un mensaje de chat** la toma el cliente basado en la posición, no el servidor. Esto permite respuesta inmediata sin latencia de red para la UI visual. El servidor sin embargo también filtra qué mensajes distribuye a qué clientes para eficiencia.

---

## Optimización para hardware de gama media

El mayor reto técnico en cliente es mantener 60 FPS estables en hardware modesto con múltiples avatares en sala.

**Estrategias:**

- **LOD agresivo en avatares:** los avatares a más de 10 metros usan una versión simplificada del modelo con menos polígonos y texturas de menor resolución.
- **Culling:** avatares fuera del campo de visión no se renderizan.
- **Instanced rendering:** los elementos decorativos repetidos (sillas, mesas, tazas) se instancian para reducir draw calls.
- **Audio occlusion simplificado:** no necesitamos audio occlusion físicamente preciso — la atenuación por distancia es suficiente para la experiencia social.
- **Streaming de assets:** los assets de la sala se cargan de forma asíncrona para minimizar el tiempo de carga inicial.

**Objetivo de rendimiento:**
- 60 FPS estables en hardware mínimo con 20 avatares en sala
- 30 FPS mínimo en hardware mínimo con 40 avatares en sala

---

## Decisiones técnicas pendientes (Unreal)

A documentar en `10_OPERATIONS/ADR/` cuando se resuelvan:

| Decisión | Opciones | Impacto |
|---|---|---|
| Versión de Unreal Engine | UE 5.3, 5.4 | Compatibilidad de plugins, nanite/lumen |
| Nanite para geometría estática | Activado / Desactivado | Calidad vs. requisitos de hardware |
| Lumen para iluminación global | Activado / Lumen básico / Sin Lumen | Calidad vs. rendimiento |
| Sistema de personalización | Runtime material instancing | Flexibilidad del catálogo de ropa |
| Plugin de WebRTC | PixelStreaming SDK / Plugin custom | Integración con Voice Router |
| Formato de red para posición | Protobuf / MessagePack / JSON | Eficiencia de ancho de banda |

---

*Unreal Engine es la ventana al mundo de Atlas. El mundo real de la plataforma vive en el backend.*
