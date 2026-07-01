# La Cafetería — Diseño de Sala

**ID de sala:** CAFE-01  
**Estado en el producto:** MVP — Sala principal  
**Versión:** 1.0  
**Fecha:** 2026-06-28

---

## Identidad emocional

**Emoción principal:** Calidez y pertenencia  
**Sensación objetivo:** Como llegar a tu café favorito de barrio un martes por la tarde. Hay gente que conoces, gente que no conoces, conversaciones que se mezclan suavemente. No tienes que hacer nada para sentirte bienvenido. Simplemente estás ahí.

---

## Referencia visual de inspiración

El espacio toma inspiración de cafeterías urbanas del Caribe y Latinoamérica. No es una cadena de café industrial. Es un café con historia. Madera cálida, plantas, luz natural filtrada, un mostrador de madera oscura detrás del cual siempre hay actividad.

La paleta visual no es europea ni minimalista. Es cálida, mezclada, con personalidad.

---

## Dimensiones y capacidad

- **Tamaño del espacio:** mediano-pequeño. No más grande de lo necesario para que 40 personas se sientan cómodas sin perderse.
- **Capacidad máxima:** 40 usuarios simultáneos
- **Punto de vida óptimo:** 15-25 usuarios. Con este número la sala se siente llena pero no caótica.

---

## Planta y zonas sociales

La cafetería se divide en cinco zonas naturales. No están señalizadas en la interfaz — el usuario las descubre por la distribución del espacio.

### Zona 1 — La Entrada
- Justo al entrar. Todos los avatares nuevos aparecen aquí.
- Hay una pequeña área de pie con una mesa alta y taburetes.
- Es el punto de mayor tránsito. Ideal para saludos rápidos.
- Visualmente atractiva desde el primer segundo: la iluminación más cálida está aquí.

### Zona 2 — Las Mesas Centrales
- Cuatro mesas de madera con dos a cuatro sillas cada una.
- La zona más "pública" de la sala. Las conversaciones aquí son más abiertas.
- Es natural acercarse a una mesa ocupada y unirse.
- Perfecta para grupos medianos (3-6 personas).

### Zona 3 — La Barra
- Un mostrador de madera oscura a lo largo de una pared.
- Taburetes altos a lo largo de la barra.
- Ambiente más íntimo y de conversación uno a uno.
- Hay un NPC (bartender) detrás de la barra en el MVP — una figura visual estática que añade vida al espacio sin ser interactivo.
- Ideal para los Rafaeles: se puede estar en la barra observando el resto sin estar en el centro.

### Zona 4 — Los Sofás
- Dos grupos de sofás y sillones en un rincón más tranquilo.
- Iluminación ligeramente más tenue.
- La zona de conversaciones más largas y profundas.
- Perfecta para grupos pequeños (2-4 personas) que quieren más privacidad relativa.
- El rango de proximidad aquí puede ajustarse para que las conversaciones sean más íntimas.

### Zona 5 — La Ventana
- Una mesa para dos junto a una ventana grande.
- Vista a una calle exterior animada (elementos visuales de fondo, no interactivos).
- La zona más íntima y privada. Dos personas sentadas aquí claramente quieren conversar solos.
- Opcional para el MVP — puede incluirse como detalle de diseño.

---

## Objetos y decoración

Los objetos deben hacer que el espacio se sienta habitado antes de que llegue el primer avatar.

**Objetos en la Zona 1 (Entrada):**
- Pizarra de bienvenida con mensaje del día (texto decorativo, no funcional)
- Plantas en macetas medianas
- Paragüero con un paraguas olvidado

**Objetos en las Mesas Centrales:**
- Tazas de café en algunas mesas (vacías y llenas)
- Flores secas en pequeños jarrones
- Servilletas, azucareras
- Una o dos mesas con libros o revistas abiertos

**Objetos en la Barra:**
- Cafetera espresso visible y activa (animación suave de vapor)
- Vasos y tazas apiladas
- Pizarra de menú detrás de la barra
- Flores frescas en un jarrón sobre la barra

**Objetos en los Sofás:**
- Cojines en los sofás
- Mesa de centro con libros apilados y una taza
- Una planta de interior grande en el rincón
- Lámpara de pie que añade luz cálida adicional

**Objetos generales:**
- Cuadros en las paredes (arte local dominicano o latinoamericano)
- Estantes con libros y plantas detrás de la barra
- Luces colgantes de estilo industrial-cálido sobre las mesas
- Suelo de madera o baldosa con personalidad

---

## Iluminación

**Paleta:** ámbar, dorado, naranja suave. La luz de las 5 PM.

**Fuentes de luz:**
- Luz natural suave filtrada por las ventanas (varía según el ciclo de tiempo)
- Luces colgantes cálidas sobre las mesas
- Luz de acento en la barra (más brillante, focalizada)
- Lámpara de pie en la zona de sofás
- Sin luz fría ni blanca en ninguna parte de la sala

**Ciclo de tiempo:**
- Mañana (6AM - 12PM): luz más brillante y natural, tonos más amarillos
- Tarde (12PM - 7PM): la paleta principal — ámbar dorado
- Noche (7PM - 6AM): más íntima y tenue, luces interiores protagonizan

---

## Audio ambiental

Ver `03_WORLD/Audio.md` para el sistema completo. Para la Cafetería específicamente:

**Capas de audio:**
1. **Fondo base:** murmullo suave de conversaciones indistintas (no palabras reales, solo ambiente)
2. **Efectos de sala:** tazas que se sirven ocasionalmente, sillas que se mueven, la cafetera
3. **Música de fondo:** jazz suave o bossa nova instrumental, volumen bajo
4. **Audio dinámico:** el murmullo aumenta sutilmente si hay más usuarios en la sala

**Variación nocturna:** la música cambia a algo más íntimo y tranquilo. El murmullo de fondo baja de nivel.

---

## Dinámica social de la sala

### Comportamientos esperados
- Los usuarios nuevos aparecen en la Zona 1 y caminan hacia donde hay actividad
- Los grupos se forman naturalmente alrededor de las mesas y la barra
- Los usuarios más tranquilos gravitan hacia los sofás o la barra
- La zona de la ventana se usa para conversaciones más privadas

### Comportamientos que el diseño debe propiciar
- Pasar cerca de la barra invita naturalmente a quedarse un momento
- Ver una mesa con pocas personas sugiere que puedes unirte
- Los sofás crean conversaciones más largas por su comodidad visual

### Comportamientos que el diseño debe evitar
- Que todos los usuarios se aglomeren en una sola zona y el resto quede vacío
- Que la sala se sienta desierta incluso con 10 usuarios presentes
- Que la zona de la entrada se convierta en el único punto de socialización

---

## Eventos temporales en la Cafetería

En fechas especiales, la sala recibe decoración adicional sin cambiar su estructura:

| Evento | Decoración añadida |
|---|---|
| Navidad | Árbol en un rincón, guirnaldas, menú navideño en la pizarra |
| Halloween | Calabazas, velas, decoración oscura sutil |
| San Valentín | Flores rojas, velas en las mesas |
| Año nuevo | Decoración festiva, cuenta regresiva en pizarra |
| Carnaval | Colores caribeños, música festiva en el loop de audio |

Estos cambios son cosméticos. No alteran la distribución ni las zonas sociales.

---

## Criterios de éxito del diseño de sala

La Cafetería está bien diseñada si:

1. Un usuario nuevo la describe como "acogedora" o "cálida" sin que nadie use esas palabras
2. Los usuarios pasan al menos 10 minutos en la sala antes de su primera conversación sin sentirse incómodos
3. Los grupos se forman naturalmente en múltiples zonas sin que la interfaz los dirija
4. Un usuario que entra solo se siente bienvenido, no expuesto

---

*La Cafetería es la primera impresión de Atlas. Cada detalle de su diseño es una inversión en la retención de usuarios.*
