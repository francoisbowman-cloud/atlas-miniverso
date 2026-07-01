# Moderation — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo — obligatorio desde el día 1

---

## La moderación es infraestructura

La moderación no es una función que se añade después. Es parte de la infraestructura del producto, igual que el sistema de voz o el renderizado de avatares.

Una plataforma social con voz y avatares sin moderación sólida no es viable. El abuso, el acoso y el spam destruyen la comunidad más rápido que cualquier bug técnico. Deben prevenirse, detectarse y resolverse desde el primer día.

---

## Capas del sistema de moderación

### Capa 1 — Herramientas del usuario

El usuario es la primera línea de defensa. Las herramientas deben ser inmediatas, simples y no punitivas para quien las usa.

| Herramienta | Efecto | Notifica al otro? |
|---|---|---|
| Silenciar | No escuchas la voz de esa persona | No |
| Bloquear | No ves ni escuchas a esa persona. Tampoco puede acercársete | No |
| Alejarse | El sistema de proximidad hace el resto | N/A |
| Reportar | Envía un reporte al equipo de moderación | No |

**Principio clave:** ninguna de estas acciones notifica a la persona reportada. Bloquear o silenciar a alguien es un acto privado.

### Capa 2 — Moderación automática

El sistema detecta y actúa sobre comportamientos claramente problemáticos sin intervención humana.

**Reglas automáticas del MVP:**

| Trigger | Acción automática | Duración |
|---|---|---|
| 5 reportes de usuarios distintos en 60 minutos | Silencio de micrófono temporal | 30 minutos |
| 10 reportes en 24 horas | Suspensión de sala temporal | 2 horas |
| Velocidad de mensajes > 1/segundo por 10 segundos (spam) | Rate limit de chat | 5 minutos |
| Posición de avatar imposible (anti-cheat) | Posición corregida al server | Inmediato |

Los eventos automáticos se registran y quedan en cola para revisión humana.

### Capa 3 — Moderación humana

El equipo de Atlas revisa los reportes en cola. En el MVP, el equipo de moderación es pequeño, así que la prioridad es correcta: los casos más graves primero.

**Prioridad de revisión:**

1. Reportes de contenido sexual / menores de edad → revisión inmediata (máximo 1 hora)
2. Reportes de acoso activo en sala → revisión en < 4 horas
3. Reportes de spam / comportamiento disruptivo → revisión en < 24 horas
4. Reportes de lenguaje inapropiado → revisión en < 48 horas

**Panel de moderación (funciones mínimas del MVP):**
- Cola de reportes ordenada por prioridad
- Vista del historial de un usuario reportado
- Acciones: advertir, silenciar temporalmente, suspender, ban permanente
- Historial de acciones de moderación tomadas

---

## Flujo completo de un reporte

```
Usuario A reporta a Usuario B
          │
          ▼
Moderation Service registra el reporte
          │
          ▼
¿Supera el umbral automático?
     │           │
    SÍ           NO
     │           │
     ▼           ▼
Acción      Queda en cola
automática  para revisión
     │      humana
     │           │
     └─────┬─────┘
           │
           ▼
Moderador revisa el caso
           │
           ▼
Toma decisión y documenta razón
           │
           ▼
Acción aplicada (si aplica)
           │
           ▼
Reporte marcado como resuelto
```

---

## Comunicación con usuarios sancionados

Cuando un usuario recibe una sanción, recibe una notificación dentro de la app (o por email si es suspensión) con:
- Qué sanción fue aplicada
- Por cuánto tiempo (si aplica)
- Una descripción general del motivo (sin revelar quién reportó)
- Un enlace para apelar si considera que es un error

El sistema de apelación en el MVP es simple: un formulario que llega al equipo de moderación para revisión manual.

---

## Lo que el equipo de moderación NO hace

- No revela quién hizo un reporte
- No toma partido en disputas de opinión o desacuerdos entre usuarios
- No moddera el contenido de las conversaciones privadas de voz (no hay grabación)
- No accede a mensajes de texto históricos de usuarios en el MVP

---

## Moderación cultural

Atlas comienza en República Dominicana. El equipo de moderación del MVP debe incluir al menos una persona familiarizada con el español dominicano y la cultura local. El humor, el vocabulario y los contextos culturales varían, y una moderación sin ese contexto produce falsos positivos o falsos negativos.

---

## Métricas de moderación

El equipo de moderación debe reportar estas métricas semanalmente:

| Métrica | Objetivo |
|---|---|
| Tiempo promedio de resolución de reporte P1 | < 1 hora |
| Tiempo promedio de resolución de reporte P2 | < 4 horas |
| Tasa de apelaciones exitosas | < 10% (si es mayor, el sistema es impreciso) |
| Porcentaje de usuarios reportados en 30 días | < 2% (si es mayor, hay un problema sistémico) |
| Tasa de reincidencia post-sanción | < 20% |

---

*La moderación de Atlas debe ser tan buena que la mayoría de los usuarios nunca la necesiten. Y cuando la necesiten, confíen en ella.*
