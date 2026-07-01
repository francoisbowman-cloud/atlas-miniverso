# Backend — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo

---

## Filosofía del backend

El backend de Atlas es la plataforma. Unreal Engine es solo la pantalla.

Cada decisión de negocio ocurre aquí: quién puede entrar a una sala, qué mensajes llegan a quién, quién está moderado, cómo se persiste el perfil de un usuario. El cliente nunca es confiable — el backend siempre valida.

Los servicios están desacoplados. Cada uno tiene su propia responsabilidad, su propia base de código y puede desplegarse, actualizarse y escalarse de forma independiente.

---

## Servicios del MVP

### Auth Service

**Responsabilidad única:** gestionar la identidad del usuario.

**Endpoints principales:**

| Método | Ruta | Descripción |
|---|---|---|
| POST | /auth/register | Registro con email + contraseña |
| POST | /auth/verify-email | Verificación del enlace de email |
| POST | /auth/login | Login, devuelve access token + refresh token |
| POST | /auth/refresh | Renueva el access token usando el refresh token |
| POST | /auth/logout | Invalida los tokens de la sesión activa |
| POST | /auth/reset-password | Solicita enlace de recuperación |

**Tokens:**
- Access token: JWT, expira en 15 minutos
- Refresh token: opaco, almacenado en base de datos, expira en 30 días
- Ambos tokens se transmiten solo por HTTPS

**Lo que no hace:**
No sabe nada de salas, avatares ni mensajes. Su única misión es confirmar "este token pertenece a este usuario con este ID".

---

### Users Service

**Responsabilidad única:** gestionar el perfil y las relaciones entre usuarios.

**Endpoints principales:**

| Método | Ruta | Descripción |
|---|---|---|
| GET | /users/:id | Obtener perfil público de un usuario |
| PUT | /users/me | Actualizar perfil propio |
| GET | /users/me/avatar | Obtener datos del avatar |
| PUT | /users/me/avatar | Actualizar personalización del avatar |
| PUT | /users/me/status | Cambiar estado (disponible/ocupado/ausente) |
| POST | /users/me/block/:id | Bloquear a un usuario |
| DELETE | /users/me/block/:id | Desbloquear a un usuario |
| GET | /users/me/blocks | Lista de usuarios bloqueados |

**Modelo de datos del usuario:**

```
User {
  id: UUID
  username: string (único)
  email: string (privado)
  status: enum (available, busy, away)
  created_at: timestamp
  last_seen: timestamp
}

Avatar {
  user_id: UUID (FK)
  silhouette: enum (A, B, C)
  skin_tone: int (1-8)
  face_preset: int
  hair_preset: int
  outfit_preset: int
  updated_at: timestamp
}

Block {
  blocker_id: UUID
  blocked_id: UUID
  created_at: timestamp
}
```

---

### Rooms Service

**Responsabilidad única:** gestionar la existencia y el estado de las salas.

**Endpoints principales:**

| Método | Ruta | Descripción |
|---|---|---|
| GET | /rooms | Lista de salas disponibles con ocupación actual |
| GET | /rooms/:id | Detalle de una sala |
| POST | /rooms/:id/join | Solicitar entrada a una sala |
| POST | /rooms/:id/leave | Notificar salida de una sala |
| GET | /rooms/:id/users | Lista de usuarios actualmente en la sala |

**Lógica de entrada a sala:**

Cuando un usuario solicita entrar a una sala:
1. Rooms Service verifica que la sala existe y está activa
2. Verifica que la sala no ha superado su capacidad máxima (40 usuarios)
3. Verifica que el usuario no está baneado de la sala
4. Si todo es válido, registra al usuario como presente y devuelve el token de sala para conectar al Realtime Server

**Modelo de datos:**

```
Room {
  id: UUID
  name: string
  slug: string (ej: "cafeteria")
  capacity: int
  is_active: boolean
  theme: string
}

RoomPresence {
  room_id: UUID
  user_id: UUID
  joined_at: timestamp
  position_x: float (última posición conocida)
  position_y: float
  position_z: float
}
```

---

### Moderation Service

**Responsabilidad única:** gestionar la seguridad y el comportamiento de la comunidad.

**Endpoints principales:**

| Método | Ruta | Descripción |
|---|---|---|
| POST | /reports | Crear un reporte |
| GET | /admin/reports | Lista de reportes (solo admins) |
| PUT | /admin/reports/:id | Actualizar estado de un reporte |
| POST | /admin/users/:id/mute | Silenciar a un usuario |
| POST | /admin/users/:id/ban | Banear a un usuario de una sala |
| DELETE | /admin/users/:id/ban | Revertir un ban |

**Flujo de reporte:**

1. Usuario A reporta a Usuario B desde el cliente
2. El reporte llega al Moderation Service con: reporter_id, reported_id, room_id, category, description opcional
3. El servicio registra el reporte y evalúa si se supera el umbral de muteo automático
4. Si el umbral se supera: el servicio notifica al Realtime Server para silenciar temporalmente al usuario B
5. El reporte queda en cola para revisión manual del equipo de moderación

**Modelo de datos:**

```
Report {
  id: UUID
  reporter_id: UUID
  reported_id: UUID
  room_id: UUID
  category: enum (harassment, spam, inappropriate, impersonation, other)
  description: string (nullable)
  status: enum (pending, reviewed, resolved, dismissed)
  created_at: timestamp
}

UserMute {
  user_id: UUID
  muted_by: enum (system, admin)
  reason: string
  expires_at: timestamp (nullable — null = permanente)
  created_at: timestamp
}

UserBan {
  user_id: UUID
  room_id: UUID (nullable — null = ban global)
  banned_by: UUID
  reason: string
  expires_at: timestamp (nullable)
  created_at: timestamp
}
```

---

## Comunicación entre servicios

Los servicios se comunican entre sí de dos formas:

**Llamadas síncronas (REST interno):** cuando un servicio necesita datos de otro de forma inmediata. Por ejemplo: el Realtime Server consulta al Users Service para obtener el nombre del usuario al conectarse.

**Eventos asíncronos (message queue):** cuando un servicio necesita notificar a otro sin esperar respuesta. Por ejemplo: el Moderation Service publica un evento "usuario_muteado" y el Realtime Server lo consume para aplicar el muteo en la sala.

Para el MVP, la cola de mensajes puede ser simple (Redis Pub/Sub). En fases de escala, se evaluará migrar a un sistema más robusto (RabbitMQ, Kafka).

---

## Seguridad

### Autenticación de requests
Todo endpoint del backend (excepto /auth/register y /auth/login) requiere un Bearer token válido en el header `Authorization`.

### Validación en el servidor
El servidor valida todo. El cliente puede enviar cualquier dato — la validación de negocio siempre ocurre en el backend.

### Rate limiting
- /auth/login: máximo 10 intentos por IP en 15 minutos
- /reports: máximo 10 reportes por usuario por hora
- Endpoints generales: límite razonable por usuario autenticado

### Datos sensibles
- Los emails nunca se exponen en respuestas públicas
- Las contraseñas se hashean con bcrypt (cost factor 12 mínimo)
- Los tokens de refresh se almacenan hasheados en base de datos

---

## Monitoreo y observabilidad (MVP)

Para el MVP, los requisitos mínimos de observabilidad son:

- **Logs estructurados** en todos los servicios (JSON, con nivel, servicio, timestamp, request_id)
- **Health check endpoint** en cada servicio (`GET /health`)
- **Métricas básicas:** requests por segundo, tiempo de respuesta, errores 5xx
- **Alertas:** notificación si un servicio cae o si la tasa de errores supera el 1%

Los detalles de infraestructura de monitoreo se definen en `05_ENGINEERING/Infrastructure/`.

---

*El backend de Atlas es la plataforma real. Invisible para el usuario, esencial para todo.*
