# Events — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento de visión — implementación post-MVP

---

## Los eventos son razones para regresar

La retención en una plataforma social depende de dos cosas: las personas que ya conoces y la expectativa de algo nuevo. Los eventos sirven al segundo propósito.

Un usuario que sabe que el próximo viernes hay una fiesta en la playa, o que en Navidad la cafetería va a estar decorada de forma especial, tiene una razón concreta para regresar aunque ese día no tenga planes de socializar.

---

## Tipos de eventos

### Tipo 1 — Eventos de ambiente (sin coordinación)

Cambios en la sala que ocurren automáticamente sin que nadie tenga que organizarlos. El sistema los activa según el calendario.

**Ejemplos:**
- Decoración navideña en diciembre
- Decoración de Halloween en octubre
- Ambiente de San Valentín en febrero
- Colores del Carnaval en febrero/marzo (especialmente relevante en RD)
- Día de la Independencia Dominicana (27 de febrero)

Estos eventos no requieren que haya nadie organizando. Son parte del ciclo del mundo.

### Tipo 2 — Eventos programados por el equipo

El equipo de Atlas programa eventos con fecha, hora y descripción. Los usuarios pueden verlos en un calendario dentro de la app.

**Ejemplos para el mercado dominicano:**
- "Noche de música urbana" — viernes por la noche, playlist especial
- "Tarde de debate" — un tema de discusión propuesto para que la sala lo debata
- "Game night" — una sala donde el tema del día es hablar de gaming
- "Madrugada de terror" — noche de Halloween, decoración especial, tema de conversación

### Tipo 3 — Eventos de la comunidad (post-MVP)

Usuarios organizan sus propios eventos dentro de una sala y los anuncian a través de la plataforma. En fases posteriores, los "Constructores de Comunidad" (como el arquetipo Jorge) pueden tener herramientas para crear y promocionar sus propios eventos.

---

## Mecánica de eventos en el MVP

En el MVP, los eventos son principalmente de Tipo 1 (ambiente automático). La infraestructura para eventos programados se puede construir de forma simple:

- Una tabla en base de datos con eventos futuros (nombre, descripción, fecha_inicio, fecha_fin, sala_id, tipo_decoracion)
- El cliente consulta el estado del evento al entrar a la sala
- La sala carga los assets de decoración correspondientes

No se necesita un sistema complejo para empezar.

---

## Calendario de eventos para el lanzamiento en RD

Sugerencia de eventos para los primeros 6 meses post-lanzamiento:

| Mes | Evento | Tipo |
|---|---|---|
| Lanzamiento | Decoración de bienvenida especial | Ambiente |
| Mes 1 | "Primera noche de viernes" — evento semanal | Programado |
| Mes 2 | Carnaval dominicano | Ambiente |
| Mes 2 | Independencia de RD (27 de feb) | Ambiente especial |
| Mes 3 | San Valentín | Ambiente |
| Mes 3 | "Tarde de debate — temas dominicanos" | Programado |
| Mes 4 | Semana Santa — sala más tranquila y contemplativa | Ambiente |
| Mes 5 | Día de las Madres (segunda sala temporal: "La terraza") | Programado |
| Mes 6 | Primer aniversario del MVP | Celebración especial |

---

## Lo que los eventos NO son

- Los eventos no son obligatorios para disfrutar de Atlas
- Los eventos no crean ventajas competitivas (items exclusivos permanentes que los no-asistentes nunca pueden obtener)
- Los eventos no interrumpen la experiencia de quien simplemente quiere conversar
- Los eventos no requieren que el usuario "complete" nada

Son ambiente. Son razones para entrar. Son conversación en sí mismos.

---

*Un evento bien hecho convierte "debería volver a Atlas" en "tengo que entrar hoy".*
