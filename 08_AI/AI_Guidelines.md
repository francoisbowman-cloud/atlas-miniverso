# AI Guidelines — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento de visión — implementación post-MVP

---

## Principio de IA en Atlas

La IA en Atlas existe para reforzar la presencia humana, no para reemplazarla.

Cualquier uso de IA en el producto debe responder esta pregunta:

> ¿Esto hace que las personas se sientan más presentes unas con otras?

Si la IA crea la ilusión de conexión en lugar de la conexión real, está en el lugar equivocado.

---

## Usos de IA en el producto (por fase)

### Fase MVP — Sin IA en el producto

El MVP no incluye IA integrada. La experiencia debe validarse con personas reales antes de introducir elementos artificiales. Si la sala se siente vacía sin NPC, el problema es de masa crítica de usuarios, no de falta de IA.

### Fase 2 — IA de soporte (post-MVP)

#### NPC de sala
Avatares controlados por IA que ocupan salas con poca actividad para que no se sientan vacías.

**Reglas estrictas para NPC:**
- Los NPC siempre son identificables como IA — nunca se hacen pasar por humanos
- Si un usuario les pregunta directamente "¿Eres real?", responden honestamente
- Su comportamiento es ambiental: están presentes, no inician conversaciones agresivamente
- Se retiran automáticamente cuando la sala alcanza un número mínimo de usuarios reales
- No guardan información de las conversaciones que presencian

#### Asistente de conversación (opt-in)
Una función que el usuario puede activar para recibir sugerencias de conversación cuando no sabe cómo empezar.

**Comportamiento:**
- Completamente opt-in — el usuario lo activa conscientemente
- Las sugerencias son privadas — solo el usuario las ve
- El sistema aprende del contexto de la sala (tema de conversación en curso) para hacer sugerencias relevantes
- Se puede desactivar en cualquier momento

### Fase 3 — IA avanzada

#### Traductor en tiempo real
Para conversaciones entre usuarios de distintos idiomas (especialmente relevante para expandir al Caribe anglófono y francófono).

#### Moderación asistida por IA
Detección automática de comportamiento problemático (patrones de acoso, lenguaje de odio) para apoyar al equipo de moderación humano. La IA señala — la decisión de actuar siempre la toma un humano.

---

## Lo que la IA NO hará en Atlas

- No tomará decisiones de moderación sin revisión humana
- No creará perfiles de usuarios para publicidad
- No grabará ni analizará el contenido de las conversaciones de voz sin consentimiento explícito
- No generará respuestas que se hagan pasar por otros usuarios
- No manipulará el comportamiento de los usuarios para aumentar el tiempo en pantalla mediante mecanismos adictivos

---

## Transparencia con los usuarios

Cuando la IA está presente en cualquier forma, el usuario lo sabe:
- Los NPC tienen un indicador visual claro
- Las sugerencias del asistente de conversación están claramente marcadas como IA
- La política de uso de IA está disponible en la sección de privacidad

---

*La IA en Atlas es una herramienta al servicio de la comunidad. Nunca al revés.*
