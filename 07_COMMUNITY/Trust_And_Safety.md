# Trust & Safety — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo

---

## Confianza antes de seguridad

La seguridad sin confianza produce una plataforma policial que nadie quiere usar. La confianza sin seguridad produce un espacio que nadie puede habitar. Atlas necesita ambas, en ese orden: primero construir confianza, luego reforzar la seguridad que la protege.

---

## Principios de Trust & Safety

### 1. Las herramientas de seguridad no deben ser visibles cuando no son necesarias
Un botón de "reportar" visible en todo momento recuerda constantemente al usuario que algo podría salir mal. Las herramientas de seguridad están disponibles siempre, pero no son el elemento visual dominante.

### 2. La privacidad es control
El usuario controla quién puede acercarse, escucharle y verle. Esto no es una función avanzada — es parte fundamental del diseño.

### 3. La seguridad proactiva vale más que la reactiva
Mejor prevenir que moderar. El diseño del espacio (proximidad, sin canales globales, sin anonimato total) reduce la incidencia de abuso antes de que ocurra.

### 4. Los menores de edad son prioridad absoluta
Atlas es para mayores de 18 años. Cualquier indicio de que un menor está usando la plataforma se trata como caso P0.

---

## Riesgos principales y mitigaciones

### Acoso por proximidad
**Riesgo:** un usuario persigue a otro dentro de la sala, acercándose repetidamente.  
**Mitigación:** el bloqueo hace que el usuario bloqueado no pueda acercarse al que bloqueó. Si lo intenta, su avatar no puede entrar en el radio de proximidad del usuario que lo bloqueó. El sistema lo maneja automáticamente.

### Abuso de audio
**Riesgo:** un usuario reproduce sonidos fuertes, música o contenido perturbador por el micrófono.  
**Mitigación:** el silenciado por otros usuarios es inmediato. Los reportes de audio activan el umbral automático rápidamente. La comunidad tiene herramientas para protegerse antes de que intervenga la moderación.

### Grooming y contacto con menores
**Riesgo:** adultos buscan contactar con menores a través de la plataforma.  
**Mitigación:**
- Atlas requiere verificación de edad en el registro (fecha de nacimiento)
- Los reportes de comportamiento sospechoso relacionado con menores son P0
- No existe en el MVP sistema de mensajería directa fuera de la sala (reduce el vector de contacto privado)
- El equipo de moderación tiene protocolo específico para estos casos

### Suplantación de identidad
**Riesgo:** un usuario se hace pasar por otra persona, especialmente figuras públicas o miembros del equipo.  
**Mitigación:** nombres de usuario únicos en la plataforma. El equipo de Atlas tiene badges verificados que no pueden replicarse. Los reportes de suplantación tienen revisión prioritaria.

### Spam y bots
**Riesgo:** cuentas automatizadas inundan salas o el chat.  
**Mitigación:** verificación de email en registro, rate limiting de mensajes, detección de patrones de comportamiento automatizado. El anti-bot puede reforzarse con CAPTCHA si el problema escala.

---

## Privacidad del usuario

### Qué datos se recopilan (MVP)
- Email (para autenticación, no se expone nunca en la plataforma)
- Nombre de usuario (público dentro de Atlas)
- Datos del avatar (público dentro de Atlas)
- Historial de moderación propio (privado, solo visible al usuario y al equipo)
- Logs de conexión (fecha/hora de sesiones, para soporte y seguridad)

### Qué no se recopila ni almacena (MVP)
- Contenido de las conversaciones de voz (no se graba)
- Historial completo de mensajes de chat (los mensajes son efímeros en el MVP)
- Ubicación geográfica precisa
- Datos de dispositivo más allá de lo necesario para soporte técnico

### Derechos del usuario
- Puede cambiar su nombre de usuario (con límite de frecuencia)
- Puede eliminar su cuenta y todos sus datos
- Puede solicitar exportación de sus datos
- Puede ver su historial de sanciones propias

---

## Protocolo de incidentes graves

Para incidentes que involucren amenazas físicas, menores de edad o contenido ilegal:

1. El moderador que detecta el incidente lo escala inmediatamente al líder de moderación
2. Se documenta toda la evidencia disponible (reportes, logs de conexión)
3. El usuario involucrado es suspendido preventivamente mientras se investiga
4. Si hay obligación legal de reportar (menores, amenazas), se sigue el protocolo legal aplicable
5. El caso se documenta en `10_OPERATIONS/Decisions/` con todos los detalles

---

*La seguridad de Atlas es tan buena como la confianza que genera. Construir una comunidad segura es construir el producto mismo.*
