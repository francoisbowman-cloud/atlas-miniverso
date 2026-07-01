# Atlas MVP

**Versión:** 2.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo — referencia obligatoria durante toda la fase MVP  
**Cambio v2.0:** Motor gráfico actualizado a Babylon.js (web), sin descarga requerida (ver ADR-001)

---

## La hipótesis que estamos probando

> Las personas desean entrar diariamente para conversar dentro de espacios virtuales.

Todo lo que construimos en el MVP existe para probar o refutar esta hipótesis. Nada más.

---

## Decisiones de alcance

| Dimensión | Decisión |
|---|---|
| Salas | 1 sala |
| Comunicación | Texto + voz por proximidad |
| Plataforma | **Navegador web** (Chrome, Edge, Firefox) — sin descarga |
| Motor 3D | **Babylon.js** (WebGL) |
| Mercado inicial | República Dominicana |
| Marketplace | Pospuesto |
| Economía interna | Pospuesta |
| IA integrada | Pospuesta |
| Creación de salas por usuarios | Pospuesta |

### Por qué navegador web en lugar de app nativa

El hardware disponible para desarrollo (Intel HD 620, sin GPU dedicada) hace inviable Unreal Engine. El cambio a web 3D con Babylon.js produce beneficios reales para el producto:

- **Sin descarga:** el usuario entra con un enlace. Cero fricción de onboarding.
- **Requisitos mínimos:** cualquier PC con navegador moderno funciona — incluyendo la mayoría del hardware en República Dominicana.
- **Multiplataforma de serie:** mismo código en Windows, Mac, Linux.

Ver ADR-001 en `10_OPERATIONS/ADR/` para el razonamiento completo.

---

## La sala del MVP

**La Cafetería**

La primera sala de Atlas es una cafetería. No por arbitrariedad — por coherencia con la visión del proyecto.

Una cafetería es el espacio social más universal. Es íntima pero pública. Cálida pero no exclusiva. Permite tanto el silencio como la conversación espontánea. Transmite exactamente la sensación que Atlas quiere generar.

### Características de la sala

- Capacidad: entre 20 y 40 usuarios simultáneos
- Ambiente: calidez, iluminación suave, atmósfera de café urbano
- Objetos interactivos básicos: mesas, sillas, barra, sofás
- Audio ambiental: sonido suave de cafetería (murmullos, tazas, música de fondo)
- Hora del día: variable según zona horaria o ciclo automático

---

## Lo que incluye el MVP

### Avatares
- Selección de base corporal (hombre / mujer / neutro)
- Personalización básica: tono de piel, peinado, color de ojos, ropa predefinida
- Sin Marketplace — los outfits disponibles son los incluidos en el lanzamiento
- Nombre de usuario visible sobre el avatar

### Movimiento
- Caminar dentro de la sala
- Sentarse en mesas y sillas
- Animaciones básicas: idle (respiración), caminar, sentado
- Sin correr, sin saltar, sin explorar múltiples zonas

### Comunicación
- **Chat de texto por proximidad:** los mensajes son visibles únicamente para avatares cercanos. A mayor distancia, el texto desaparece.
- **Voz por proximidad:** el volumen de voz disminuye con la distancia, igual que en la realidad. Los usuarios dentro del rango de proximidad se escuchan mutuamente.
- Sin mensajes directos privados en esta versión
- Sin canales globales de sala

### Interfaz
- HUD mínimo: nombre de usuario, indicador de voz activa, botón de configuración
- Sin mapas, sin minimapas
- Sin notificaciones dentro de la sala (excepto alertas de moderación)

### Autenticación y perfil
- Registro con email y contraseña
- Perfil básico: nombre de usuario, avatar, estado (disponible / ocupado / ausente)
- Sin historial de chats, sin feed de actividad

### Moderación (obligatoria desde el día 1)
- Sistema de reporte de usuarios (acoso, spam, contenido inapropiado)
- Silenciar y bloquear usuarios individualmente
- Panel básico de moderación para administradores
- Posibilidad de expulsar usuarios de la sala
- Filtro de texto básico para lenguaje inapropiado

---

## Lo que NO incluye el MVP

Esta lista es tan importante como la anterior. Cada ítem fue descartado conscientemente para mantener el foco.

- Múltiples salas
- Marketplace de ropa o accesorios
- Economía interna o moneda virtual
- Salas privadas o apartamentos
- Eventos programados
- Sistema de amigos o seguidores
- Chat global de sala
- Mensajes directos privados
- Notificaciones push
- Versión móvil
- Versión web
- IA integrada (NPC, traductor, asistente)
- Creación de salas por usuarios
- Sistema de reputación o insignias
- Transmisiones en vivo
- Juegos o minijuegos dentro de la sala
- Membresía VIP

---

## Métricas de éxito del MVP

El MVP es exitoso si, en las primeras 4 semanas de lanzamiento con la comunidad inicial:

| Métrica | Umbral de validación |
|---|---|
| Retención día 7 | ≥ 30% de usuarios registrados regresan al día 7 |
| Tiempo promedio de sesión | ≥ 15 minutos por sesión |
| Sesiones por usuario por semana | ≥ 3 sesiones semanales en usuarios activos |
| Conversaciones iniciadas | ≥ 70% de los usuarios que entran inician al menos una conversación |
| NPS (Net Promoter Score) | ≥ 40 en encuesta al día 14 |

Si estos umbrales no se alcanzan, antes de añadir funciones se analiza por qué. La respuesta está en la experiencia, no en las funciones.

---

## Criterios de salida del MVP

El MVP concluye y se entra a la siguiente fase cuando:

1. Las métricas de éxito se cumplen de forma consistente durante al menos 2 semanas
2. Se ha identificado claramente qué tipo de conversaciones y encuentros genera más retención
3. Se tiene evidencia suficiente para decidir qué sala añadir en segundo lugar
4. La infraestructura ha demostrado estabilidad bajo carga real

---

## Stack tecnológico del MVP

| Componente | Tecnología |
|---|---|
| Motor 3D (cliente) | **Babylon.js** (WebGL en navegador) |
| Lenguaje cliente | **TypeScript + Svelte** |
| Backend | **Node.js + Express** (servicios independientes) |
| Base de datos | **PostgreSQL + Redis** |
| Comunicación en tiempo real | **WebSocket** (Realtime Server) |
| Voz por proximidad | **LiveKit** (WebRTC SFU) |
| Autenticación | **JWT + refresh tokens** |
| Despliegue | **Railway** (MVP) |
| CDN de assets | **Cloudflare** |

Los detalles técnicos se definen en la sección 05_ENGINEERING. Este documento no toma decisiones técnicas — solo define qué experiencia debe existir.

---

## Lo que el MVP debe transmitir

Un usuario que entra por primera vez debe sentir, en menos de 3 minutos:

1. "Esto se ve bien y se siente cálido."
2. "Hay personas reales aquí."
3. "Puedo acercarme a alguien y hablar."
4. "No necesito aprender nada para participar."

Si alguna de estas cuatro sensaciones falla, el MVP necesita ajuste antes de escalar.

---

*Este documento define lo que construimos primero. Cualquier función no listada en la sección "Lo que incluye el MVP" es oficialmente fuera de alcance hasta que este documento sea actualizado.*
