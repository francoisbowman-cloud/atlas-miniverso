# Audio Design — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento activo — actualizar con decisiones técnicas en 05_ENGINEERING/Audio

---

## El audio como arquitectura invisible

El audio de Atlas no es decoración. Es infraestructura social.

Cuando un usuario se acerca a alguien y empieza a escuchar su voz con más claridad, no está usando una función. Está experimentando el lenguaje más primitivo de la presencia humana: la proximidad física. El sistema de audio debe hacer que eso se sienta exactamente así — real, gradual y natural.

Un espacio sin audio ambiental es un set de teatro vacío. Con el audio correcto, es un lugar.

---

## Los tres sistemas de audio

### Sistema 1 — Audio ambiental de sala

El sonido de fondo que hace que cada sala tenga vida propia.

**Objetivo:** que un usuario con los ojos cerrados sepa en qué sala está.

**Principios:**
- El audio ambiental nunca silencia la conversación. Existe por debajo de ella.
- Debe ser suficientemente variado para no volverse irritante tras 30 minutos.
- Tiene que sonar auténtico, no como un loop de sonido de stock.
- Cambia sutilmente según el ciclo de tiempo y el número de usuarios presentes.

**Capas de audio ambiental (La Cafetería):**

| Capa | Descripción | Volumen relativo |
|---|---|---|
| Fondo base | Murmullo de conversaciones indistintas | Muy bajo |
| Efectos de sala | Tazas, sillas, cafetera, pasos en madera | Bajo |
| Música ambiente | Jazz suave o bossa nova instrumental | Bajo-medio |
| Dinámica | El murmullo sube cuando hay más de 20 usuarios | Automático |

**Regla:** si el usuario puede escuchar claramente la letra de una canción, la música está demasiado alta.

---

### Sistema 2 — Voz por proximidad

El sistema más importante de Atlas. Define la experiencia social fundamental del producto.

**Cómo funciona:**

La voz de cada usuario se escucha con un volumen proporcional a la distancia a la que está su avatar. A mayor distancia, menor volumen. Fuera del rango máximo, la voz desaparece por completo.

```
Distancia 0-2m   → Voz al 100% (conversación íntima)
Distancia 2-5m   → Voz al 70% (conversación de grupo)
Distancia 5-10m  → Voz al 40% (escuchar sin participar)
Distancia 10-15m → Voz al 15% (murmullos apenas perceptibles)
Distancia +15m   → Silencio total
```

*Los valores exactos deben calibrarse durante el desarrollo. Estos son puntos de partida.*

**Comportamiento espacial:**
- El audio de voz es espacializado. La voz de alguien a tu derecha suena desde la derecha.
- En espacios cerrados, hay una leve reverberación natural que refuerza la sensación de espacio.
- No hay ningún canal global de voz de sala en el MVP.

**Estados de voz del usuario:**
- **Activo:** el micrófono está abierto, el avatar tiene un indicador visual sutil
- **Silenciado (por el usuario):** el avatar no emite sonido, indicador visual de silencio
- **Silenciado (por otro usuario):** ese otro usuario no lo escucha, pero nadie más lo sabe
- **Push-to-talk:** opción disponible para usuarios que prefieren no tener micrófono abierto siempre

**Lo que el sistema de proximidad NO hace:**
- No aísla conversaciones de forma hermética — las voces se superponen de forma natural
- No crea "burbujas privadas" artificiales — la privacidad la da la distancia física
- No tiene función de "susurro" entre usuarios en el MVP

---

### Sistema 3 — Efectos de avatar

Sonidos sutiles asociados a las acciones del avatar.

**Efectos básicos:**

| Acción | Sonido |
|---|---|
| Pasos sobre madera | Pasos suaves, orgánicos |
| Sentarse | Crujido suave de silla |
| Animación de saludo | Ninguno (visual únicamente) |
| Animación de risa | Ninguno (visual únicamente) |
| Entrada a la sala | Campana suave de puerta al entrar |
| Salida de la sala | Ninguno |

**Principio:** los efectos de avatar son sutiles. Si el usuario los nota conscientemente, están demasiado presentes.

---

## Control de audio del usuario

El usuario tiene control total sobre su experiencia de audio:

| Control | Descripción |
|---|---|
| Volumen de voz de otros | Deslizador general 0-100% |
| Volumen de audio ambiental | Deslizador general 0-100% |
| Volumen de música | Deslizador independiente |
| Silenciar usuario específico | Disponible en el MVP |
| Push-to-talk vs micrófono abierto | Configurable en ajustes |
| Umbral de activación del micrófono | Configurable para evitar ruido de fondo |

---

## Moderación de audio

El audio es el vector principal de acoso en plataformas con voz. Esto requiere herramientas claras:

- **Silenciar a alguien:** inmediato, sin notificar al otro usuario
- **Reportar audio inapropiado:** disponible en el menú contextual del avatar
- **Muteo automático:** si un usuario recibe más de N reportes en X tiempo, su micrófono se silencia temporalmente hasta revisión de moderación
- **Zona libre de voz:** en el MVP no existe, pero debe considerarse para futuras salas

---

## Diseño de audio por sala (referencia rápida)

| Sala | Música | Efectos dominantes | Emoción sonora |
|---|---|---|---|
| Cafetería | Jazz / Bossa nova suave | Tazas, cafetera, madera | Cálida, tranquila |
| Rooftop nocturno | Lo-fi / Electrónica suave | Viento suave, ciudad lejana | Elegante, íntima |
| Playa | Tropical suave / Ambient | Olas, brisa, gaviotas lejanas | Relajada, abierta |
| Biblioteca | Ninguna (o ambient mínimo) | Páginas, pasos suaves | Silencio cómodo |
| Universidad | Indie / Pop suave | Voces lejanas, pasos | Energética, joven |

---

## Principios de implementación técnica

Los detalles técnicos se definen en `05_ENGINEERING/Audio/`. Estos son los requisitos funcionales que la implementación debe cumplir:

1. **Latencia de voz:** máximo 150ms para que la conversación sea natural
2. **Espacialización:** audio 3D basado en la posición del avatar
3. **Calidad de voz:** suficiente para conversación clara, no para transmisión de audio profesional
4. **Compresión:** necesaria para optimizar el ancho de banda sin sacrificar calidad comprensible
5. **Cancelación de eco:** obligatoria para evitar feedback entre usuarios en la misma sala física
6. **Supresión de ruido:** básica, para mejorar la experiencia en entornos domésticos
7. **Escalabilidad:** el sistema de audio debe funcionar con 40 usuarios simultáneos en la misma sala sin degradarse

---

*El audio de Atlas no debe notarse cuando está bien. Solo se nota cuando falta.*
