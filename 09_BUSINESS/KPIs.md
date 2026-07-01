# KPIs — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo — revisar semanalmente durante el MVP

---

## La métrica norte

Antes de cualquier KPI específico, hay una métrica que lo resume todo:

> **DAU/MAU ratio ≥ 0.30**

Si al menos el 30% de los usuarios activos del mes entran en cualquier día dado, el producto es parte de la rutina de las personas. Eso es lo que Atlas busca.

Todo lo demás es instrumental para llegar a este número.

---

## KPIs por fase

### Fase 0 — Beta privada

| KPI | Objetivo | Por qué importa |
|---|---|---|
| Usuarios activos en la primera semana | ≥ 30 simultáneos en horario pico | Necesitamos masa crítica para probar la experiencia |
| Sesiones por usuario por semana | ≥ 4 | Señal de que están volviendo |
| Duración promedio de sesión | ≥ 15 min | Si duran menos, algo no engancha |
| Usuarios que regresan sin ser invitados | ≥ 50% al día 7 | El retorno orgánico es el único que importa |
| Bugs críticos reportados | 0 al lanzamiento | La calidad es requisito, no aspiración |

### Fase 1 — Lanzamiento soft

**Adquisición:**

| KPI | Objetivo semana 4 |
|---|---|
| Usuarios registrados | ≥ 500 |
| Tasa de conversión landing → registro | ≥ 15% |
| Usuarios activos semanales (WAU) | ≥ 300 |
| Fuente principal de adquisición | Boca a boca ≥ 60% |

**Engagement:**

| KPI | Objetivo |
|---|---|
| Retención día 1 | ≥ 60% |
| Retención día 7 | ≥ 30% |
| Retención día 30 | ≥ 15% |
| Duración promedio de sesión | ≥ 18 min |
| Sesiones por usuario activo por semana | ≥ 3 |
| % de usuarios que inician al menos 1 conversación | ≥ 70% |
| NPS (encuesta día 14) | ≥ 40 |

**Experiencia social (los más importantes):**

| KPI | Objetivo |
|---|---|
| % de usuarios que reportan haber conocido a alguien nuevo | ≥ 40% en mes 1 |
| Tiempo promedio hasta primera conversación | < 5 min desde que entra a la sala |
| Usuarios que regresan "para ver a alguien específico" | ≥ 25% en mes 2 |

### Fase 2 — Crecimiento

| KPI | Objetivo mes 3 | Objetivo mes 6 |
|---|---|---|
| MAU (Usuarios activos mensuales) | 2,000 | 10,000 |
| DAU/MAU ratio | ≥ 0.25 | ≥ 0.30 |
| Retención día 30 | ≥ 18% | ≥ 25% |
| Usuarios que trajeron a otra persona | ≥ 20% | ≥ 30% |
| Tasa de conversión gratuito → pago (Fase 2) | — | ≥ 5% |

---

## Métricas de moderación

| KPI | Objetivo |
|---|---|
| % de usuarios sancionados | < 2% mensual |
| Tiempo de resolución de reporte P1 | < 1 hora |
| Tasa de apelaciones exitosas | < 10% |
| Reportes de abuso por cada 100 sesiones | < 0.5 |

---

## Métricas técnicas

| KPI | Objetivo |
|---|---|
| Uptime del servidor | ≥ 99.5% |
| Latencia de voz (p95) | < 150ms |
| Latencia de WebSocket (p95) | < 100ms |
| Crash rate del cliente | < 0.5% de sesiones |
| Tiempo de carga inicial de la sala | < 10 segundos en conexión de 5 Mbps |

---

## Señales de alerta

Estos eventos deben disparar revisión inmediata del producto:

| Señal | Umbral de alerta |
|---|---|
| Retención día 7 cae por debajo de | 20% |
| Duración promedio de sesión cae por debajo de | 10 min |
| NPS cae por debajo de | 25 |
| Sala vacía en horario pico (8-11 PM hora RD) | 3 días consecutivos |
| Tasa de reportes de abuso supera | 1% de sesiones |
| Tasa de errores del servidor supera | 2% |

Cuando se activa una señal, el equipo tiene 48 horas para identificar la causa y definir una respuesta.

---

## Cadencia de revisión

| Frecuencia | Qué se revisa |
|---|---|
| Diaria | DAU, duración de sesión, incidentes de moderación |
| Semanal | WAU, retención día 7, señales de alerta técnicas |
| Mensual | MAU, retención día 30, NPS, métricas de crecimiento |
| Por hito | Métricas de criterio de salida del MVP |

---

*Los números sin contexto son ruido. Los KPIs de Atlas se leen siempre preguntando: ¿las personas se sienten más presentes unas con otras?*
