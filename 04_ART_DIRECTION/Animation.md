# Animation System — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento activo

---

## El rol de la animación en Atlas

Las animaciones de Atlas no son efectos especiales. Son el lenguaje corporal del producto.

Cuando un avatar respira suavemente mientras está parado, comunica que hay una persona real detrás. Cuando se sienta en una silla con naturalidad, el espacio se siente habitado. Cuando saluda con un gesto reconocible, la distancia social se reduce.

La animación es la diferencia entre una marioneta y una presencia.

---

## Principios de animación

### 1. Orgánico sobre mecánico
Las animaciones deben sentirse como movimiento humano real. No perfecto, no robótico. El movimiento humano tiene micro-variaciones, pesos y retrasos naturales que el ojo reconoce aunque no los nombre.

### 2. Sutil sobre espectacular
Las animaciones que más importan son las que el usuario no nota conscientemente. El idle que respira. Los pasos que tienen peso. La cabeza que gira levemente hacia quien habla. Estas animaciones construyen presencia sin pedir atención.

### 3. Transiciones siempre
No existe el "saltar" entre estados de animación. Caminar → sentarse tiene una transición. De pie → idle tiene una transición. La ausencia de transiciones hace que los avatares parezcan marionetas.

### 4. El movimiento comunica intención
Cuando un avatar camina hacia un grupo, el lenguaje corporal debe sugerir que se está acercando — leve inclinación hacia adelante, velocidad moderada, cabeza levemente hacia el grupo. La animación apoya la interacción social.

---

## Estados del avatar

El avatar siempre está en uno de estos estados. Cada estado tiene su conjunto de animaciones.

### Estado 1 — Idle (de pie, sin moverse)

El estado más frecuente. El avatar está parado, escuchando o simplemente presente.

**Animaciones de idle:**
- Respiración suave (ciclo de 4-6 segundos, sutil movimiento del torso)
- Micro-movimiento de peso (el avatar cambia levemente el peso de un pie al otro cada 8-12 segundos)
- Mirada ocasional (la cabeza gira suavemente hacia la dirección de quien habla, o a un objeto cercano)
- Variante nocturna: ligeramente más relajado, hombros más caídos

**Variaciones aleatorias de idle** (aparecen ocasionalmente para evitar que el avatar se vea congelado):
- Mirar el teléfono (3-5 segundos, luego vuelve a idle base)
- Tocarse el cabello brevemente
- Cruzar y descruzar los brazos
- Bostezar (muy ocasional, solo en ciclo nocturno)

### Estado 2 — Caminar

El avatar se desplaza por la sala.

**Animaciones:**
- Ciclo de caminata natural con balanceo de brazos
- Velocidad: paso de paseo, nunca carrera
- Al cambiar de dirección: giro suave del cuerpo antes de moverse, no rotación instantánea
- Al detenerse: un paso de desaceleración antes del idle

### Estado 3 — Sentado

El avatar ocupa una silla, taburete o sofá.

**Transición de pie → sentado:**
- El avatar se acerca a la silla
- Se detiene, gira para quedar de espaldas a la silla
- Animación de sentarse (0.8-1 segundo)
- Entra en estado idle sentado

**Idle sentado:**
- Respiración sutil
- Piernas ligeramente cruzadas o paralelas según el tipo de asiento
- Manos apoyadas en las piernas o en la mesa si hay una enfrente
- Micro-variaciones: mirar alrededor, apoyar el codo

**Transición sentado → de pie:**
- Animación de levantarse (0.6-0.8 segundos)
- Entra en estado idle de pie

### Estado 4 — Apoyado

El avatar se apoya en una pared, la barra o un objeto de altura media.

**Transición y idle:**
- Animación de apoyarse (0.5 segundos)
- Postura relajada con uno o dos brazos apoyados
- Micro-variaciones similares al idle de pie

---

## Animaciones sociales (emotes del MVP)

Las animaciones sociales son gestos que el usuario activa voluntariamente. En el MVP el conjunto es pequeño y deliberado — cada animación tiene un propósito social claro.

| Nombre | Descripción | Duración | Uso social |
|---|---|---|---|
| Saludar | Mano que se levanta y saluda | 2 segundos | Reconocer a alguien al llegar |
| Asentir | Cabeza que asiente dos veces | 1.5 segundos | Afirmar sin interrumpir |
| Negar | Cabeza que niega | 1.5 segundos | Negar sin interrumpir |
| Reír | Cuerpo que ríe con naturalidad | 2.5 segundos | Reaccionar a algo gracioso |
| Aplaudir | Manos que aplauden brevemente | 2 segundos | Celebrar o aprobar |
| Encoger hombros | Encogerse de hombros | 1.5 segundos | "No sé", "qué le voy a hacer" |
| Señalar | Mano que señala hacia adelante | 1.5 segundos | Indicar dirección o persona |
| Tomar café | Levantar taza imaginaria y beber | 3 segundos | Interacción ambiental |

**Notas de diseño:**
- Las animaciones sociales no bloquean el movimiento — el usuario puede caminar mientras asiente.
- Las animaciones tienen un cooldown de 3 segundos para evitar spam visual.
- No hay animaciones de baile en el MVP (postergadas para versiones futuras).
- No hay animaciones de abrazo o contacto físico entre avatares en el MVP.

---

## Animaciones de la interfaz y el mundo

### Animaciones de UI

| Elemento | Animación | Duración |
|---|---|---|
| Apertura de menú | Fade-in + slide up | 180ms |
| Cierre de menú | Fade-out + slide down | 150ms |
| Burbuja de chat | Fade-in desde el avatar | 200ms |
| Desaparición de burbuja | Fade-out gradual | 400ms |
| Botón presionado | Scale down 0.95 + feedback de color | 100ms |
| Carga de sala | Fade-in desde negro | 600ms |

### Animaciones del mundo

| Elemento | Animación |
|---|---|
| Vapor de la cafetera | Loop suave de partículas de vapor |
| Plantas | Micro-movimiento por brisa imperceptible |
| Luz de ventana | Variación lenta de intensidad (simulación de nubes) |
| Llamas de velas (si aplica) | Parpadeo orgánico |

---

## Sincronización de animaciones con audio

El sistema de animación debe responder al audio de voz:

- Cuando un usuario habla, su avatar tiene una sutil animación de "hablar" — movimiento leve de la mandíbula y expresión activa.
- La intensidad de la animación de hablar es proporcional al volumen de voz.
- Esta animación es simple y no pretende ser sincronización labial real — solo comunica "esta persona está hablando".

---

## Prioridades de desarrollo de animación (MVP)

Orden de implementación por importancia:

1. Idle de pie (con respiración) — sin esto el avatar parece muerto
2. Ciclo de caminata — sin esto el movimiento es imposible
3. Idle sentado — necesario para la zona de mesas y sofás
4. Transición de pie → sentado y sentado → de pie
5. Animación de hablar (sincronizada con voz)
6. Saludar (el emote más usado en un contexto social)
7. Asentir y negar (complementan la conversación sin voz)
8. Reír, aplaudir (segunda ronda de emotes sociales)
9. Variaciones de idle (mirar el teléfono, cambiar peso)
10. Beber café (elemento ambiental, refuerza la atmósfera)

Las animaciones del 1 al 5 son bloqueantes — sin ellas el MVP no puede lanzarse. Las del 6 al 10 son altamente recomendables pero pueden iterarse post-lanzamiento.

---

*Las animaciones de Atlas deben hacer que el usuario olvide que está mirando un avatar. Si logra eso, han cumplido su misión.*
