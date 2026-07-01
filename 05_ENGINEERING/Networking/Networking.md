# Networking — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo

---

## El networking es la experiencia

En la mayoría de las aplicaciones, el networking es infraestructura invisible. En Atlas, el networking es la experiencia misma.

La sensación de que hay personas reales al otro lado, de que te acercas a alguien y empiezas a escucharle, de que tu avatar se mueve fluidamente — todo eso depende de decisiones de networking. Un sistema de red con 300ms de latencia destruye la sensación de presencia tan completamente como un diseño visual feo.

---

## Los dos sistemas de red

### Sistema 1 — Realtime Server (WebSocket)

Gestiona todo lo que se ve: posición de avatares, animaciones, chat de texto, estados.

**Protocolo:** WebSocket sobre TLS (WSS)  
**Conexión:** persistente durante toda la sesión en sala

**Eventos del servidor → cliente:**

| Evento | Payload | Frecuencia |
|---|---|---|
| `user.joined` | user_id, username, avatar_data, position | Cuando alguien entra |
| `user.left` | user_id | Cuando alguien sale |
| `user.move` | user_id, x, y, z, rotation | ~15 veces/segundo por usuario |
| `user.animation` | user_id, animation_state | En cada cambio de estado |
| `user.speaking` | user_id, is_speaking | En cada cambio de estado de voz |
| `chat.message` | user_id, message, timestamp | En cada mensaje enviado |
| `room.state` | lista completa de usuarios y posiciones | Al conectarse a la sala |
| `moderation.muted` | user_id | Cuando un usuario es muteado |
| `moderation.kicked` | (sin payload — es para el propio usuario) | Cuando el usuario es expulsado |

**Eventos del cliente → servidor:**

| Evento | Payload | Frecuencia |
|---|---|---|
| `player.move` | x, y, z, rotation | ~15 veces/segundo |
| `player.animation` | animation_state | En cada cambio |
| `player.speaking` | is_speaking | En cada cambio |
| `chat.send` | message (max 500 chars) | En cada mensaje |
| `emote.trigger` | emote_id | En cada emote |

**Optimizaciones de ancho de banda:**

- Las posiciones se envían como floats de 16 bits (half-precision) en lugar de 32 bits para reducir el payload a la mitad
- Para usuarios fuera del rango de proximidad del receptor, la frecuencia de actualización de posición se reduce a 5 veces/segundo
- Los eventos de chat solo se distribuyen a usuarios dentro del rango de proximidad del emisor (el servidor filtra, no el cliente)
- La compresión de mensajes WebSocket está activada (permessage-deflate)

**Escalabilidad:**

El Realtime Server es el servicio más demandante en términos de concurrencia. Cada sala requiere mantener conexiones WebSocket con todos sus usuarios simultáneamente.

Para el MVP con una sala y hasta 40 usuarios, un solo nodo es suficiente. El diseño debe permitir escalar horizontalmente: múltiples instancias del Realtime Server, cada una gestionando un subconjunto de salas, con un estado compartido en Redis.

---

### Sistema 2 — Voice Router (WebRTC)

Gestiona todo lo que se escucha: la voz de los usuarios en tiempo real.

**Protocolo:** WebRTC (sobre UDP, con fallback a TCP)  
**Topología:** SFU (Selective Forwarding Unit)

#### Por qué SFU y no Peer-to-Peer

En una sala con 40 usuarios, la conexión P2P requeriría que cada usuario mantenga 39 conexiones simultáneas. Esto es inviable en términos de ancho de banda y CPU del cliente.

Un SFU actúa como intermediario: cada usuario envía su audio una sola vez al servidor, y el servidor lo distribuye selectivamente a quien corresponde. Esto reduce dramáticamente la carga del cliente.

**Flujo de audio:**

```
Usuario A (habla)
    │
    ▼
SFU (Voice Router)
    │
    ├── Determina quién está en rango de A
    ├── Aplica atenuación por distancia (metadata)
    └── Envía stream de audio de A a B, C, D (que están en rango)
         │
         ▼
Usuario B, C, D reciben el stream
    │
    ▼
Cliente Unreal aplica el volumen (atenuación) y la espacialización 3D
```

**La lógica de proximidad en el Voice Router:**

El SFU recibe actualizaciones de posición del Realtime Server. Con esas posiciones, calcula:
- ¿Quién está dentro del rango máximo de quién?
- ¿Qué factor de atenuación corresponde según la distancia?

El SFU no aplica la atenuación de volumen directamente en el audio — eso lo hace el cliente Unreal para tener control en tiempo real. Pero el SFU sí decide a quién enviar el stream: si estás fuera del rango máximo, no recibes el stream en absoluto (ahorra ancho de banda).

**Opciones de SFU a evaluar:**

| Opción | Pros | Contras |
|---|---|---|
| LiveKit | Open source, fácil de integrar, SDK para Unreal en desarrollo | SDK de Unreal menos maduro |
| mediasoup | Muy flexible, bajo nivel, buen rendimiento | Más complejo de implementar |
| Janus | Maduro, bien documentado | Más complejo de operar |
| Daily.co | Managed service, fácil | Costo por minuto, menos control |

La decisión se documenta en `10_OPERATIONS/ADR/` cuando se tome. Para el MVP, la prioridad es velocidad de implementación y estabilidad.

**Calidad de audio:**

| Parámetro | Valor objetivo |
|---|---|
| Codec | Opus (estándar WebRTC, excelente para voz) |
| Bitrate | 32-64 kbps por stream |
| Latencia | < 150ms extremo a extremo |
| Cancelación de eco | Activada (en cliente y servidor) |
| Supresión de ruido | Básica en cliente, opcional en servidor |

---

## Latencia y calidad de conexión

### Objetivos de latencia

| Tipo | Objetivo | Máximo aceptable |
|---|---|---|
| Voz (extremo a extremo) | < 100ms | < 150ms |
| Posición de avatar | < 50ms | < 100ms |
| Chat de texto | < 200ms | < 500ms |

### Estrategia para el mercado caribeño

La infraestructura de red en República Dominicana puede ser variable. Estrategias para mitigar:

- **Servidor en la región:** el servidor de producción debe estar en un datacenter con buena conectividad al Caribe. AWS São Paulo o us-east-1 son opciones a evaluar por latencia.
- **Interpolación del cliente:** el cliente interpola la posición de los avatares entre actualizaciones de servidor. Si llega una actualización a 66ms y la siguiente a 80ms, el movimiento sigue siendo fluido.
- **Reconexión automática:** si el WebSocket se pierde, el cliente reconecta automáticamente con backoff exponencial. El usuario ve un indicador de "reconectando" y vuelve a la sala en el mismo estado.
- **Degradación elegante:** si la conexión de voz falla, el chat de texto sigue funcionando. El usuario no pierde el acceso a la sala.

---

## Seguridad del networking

### WebSocket
- Toda conexión WebSocket usa WSS (TLS obligatorio)
- Al conectar, el cliente envía su access token. El servidor valida el token antes de permitir cualquier evento.
- Los tokens expiran. Si el token expira durante la sesión, el servidor cierra la conexión con un código específico y el cliente renegocia.

### WebRTC
- Las conexiones WebRTC usan DTLS-SRTP (cifrado estándar del protocolo)
- El servidor de señalización (para establecer la conexión WebRTC) está protegido por el mismo sistema de tokens que el resto del backend

### Anti-cheat básico
- El servidor valida que la velocidad de movimiento del avatar no supere el máximo permitido. Si un cliente envía una posición imposible (teletransportación), se ignora y se registra el intento.
- El servidor limita la frecuencia de mensajes de chat por usuario (máximo 1 mensaje por segundo).

---

*El networking de Atlas es silencioso cuando funciona bien. Solo se nota cuando falla. La misión es que nunca falle.*
