# Style Guide — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento fundacional de identidad visual

---

## La identidad visual de Atlas

Atlas no compite con videojuegos fotorrealistas ni con plataformas minimalistas frías. Tiene su propia identidad: **cálida, contemporánea y latinoamericana**.

El estilo visual de Atlas debe transmitir que este es un lugar donde quieres estar. No un lugar que te impresiona técnicamente, sino uno que te hace sentir cómodo.

La referencia mental correcta no es un render de Unreal Engine. Es una fotografía bien compuesta de un café en Bogotá, Santo Domingo o Buenos Aires un viernes por la tarde.

---

## Principio visual central

> **Calidez sobre perfección técnica.**

Un gráfico cálido y estilizado siempre ganará a un gráfico hiperrealista y frío en el contexto de Atlas. Si alguna vez hay que elegir entre fidelidad técnica y atmósfera, la atmósfera gana.

---

## Estilo artístico

### Clasificación
**Semi-realista estilizado.** No es cartoon. No es hiperrealismo. Es algo intermedio que prioriza la legibilidad, la calidez y la expresividad sobre la fidelidad fotográfica.

**Referencias de estilo:**
- Personajes con proporciones ligeramente idealizadas pero reconocibles y humanas
- Materiales con textura visible pero no excesivamente detallados
- Iluminación expresiva más que técnicamente precisa
- Entornos que parecen diseñados por un artista, no renderizados por una máquina

### Lo que evitamos
- Estilo "metaverso corporativo" (avatares plastificados sin personalidad)
- Hiperrealismo que requiere hardware potente para verse bien
- Cartoon infantil que aleje al público adulto
- Estética de videojuego de acción (oscuro, agresivo, cinemático)

---

## Paleta de color

### Colores primarios del mundo

Estos son los colores que dominan los espacios de Atlas. Evocan materiales naturales, calidez y presencia humana.

| Color | Nombre | Uso |
|---|---|---|
| `#C8956C` | Terracota cálida | Materiales, detalles de sala |
| `#8B6F47` | Madera oscura | Muebles, estructuras |
| `#F5E6C8` | Crema suave | Paredes, superficies neutras |
| `#D4A96A` | Ámbar dorado | Iluminación, acentos cálidos |
| `#4A3728` | Marrón profundo | Sombras, contraluces |

### Colores de acento del mundo

Aparecen en objetos decorativos, plantas, detalles. Dan vida sin saturar.

| Color | Nombre | Uso |
|---|---|---|
| `#6B8F71` | Verde salvia | Plantas, detalles naturales |
| `#B5473A` | Rojo ladrillo | Acentos cálidos, decoración |
| `#4A6FA5` | Azul noche | Tonos nocturnos, ventanas |
| `#E8C5A0` | Melocotón suave | Tono de piel medio de referencia |

### Colores de interfaz

La UI tiene su propia paleta, diferenciada del mundo pero complementaria.

| Color | Nombre | Uso |
|---|---|---|
| `#1A1410` | Negro cálido | Fondo de UI, texto principal |
| `#F5F0E8` | Blanco crema | Texto sobre fondo oscuro |
| `#C8956C` | Terracota | Botones primarios, acentos de acción |
| `#6B8F71` | Verde salvia | Confirmaciones, estados activos |
| `#B5473A` | Rojo ladrillo | Alertas, errores, moderación |
| `#A09080` | Gris cálido | Texto secundario, elementos inactivos |

### Reglas de uso de color

- La UI nunca usa colores fríos (azules eléctricos, blancos puros, grises neutros)
- Los botones de acción principal son siempre terracota o una variación cálida
- Los fondos de pantalla son oscuros con transparencia para no competir con el mundo 3D
- Los mensajes de error y moderación son rojos ladrillo, nunca rojo saturado agresivo

---

## Tipografía

### Familia tipográfica principal
**Variable sans-serif humanista.** Una fuente que se siente amigable y contemporánea sin ser infantil. Opciones de referencia: Inter, Plus Jakarta Sans, DM Sans.

La tipografía final se decidirá durante el desarrollo, pero debe cumplir:
- Legible en pantalla a tamaños pequeños
- Con personalidad pero no decorativa
- Disponible en al menos 4 pesos (Regular, Medium, SemiBold, Bold)
- Soporte completo para caracteres latinos con acentos (obligatorio para el mercado hispanohablante)

### Jerarquía tipográfica

| Nivel | Tamaño | Peso | Uso |
|---|---|---|---|
| Título pantalla | 28-32px | Bold | Nombres de sala, títulos de pantalla |
| Título sección | 20-24px | SemiBold | Encabezados de menú |
| Cuerpo | 14-16px | Regular | Texto de chat, descripciones |
| Cuerpo destacado | 14-16px | Medium | Nombres de usuario, etiquetas |
| Auxiliar | 11-12px | Regular | Timestamps, indicadores secundarios |

### Texto en el chat de proximidad

El texto del chat que aparece sobre los avatares tiene reglas propias:
- Fondo semitransparente oscuro (negro cálido al 80% de opacidad)
- Texto en blanco crema
- Border-radius generoso — no cuadrado, no burbuja de cómic
- Desvanecimiento gradual al alejarse del avatar que habla
- Máximo 2 líneas visibles simultáneamente por avatar

---

## Materiales y texturas del mundo 3D

### Principios de materialidad

- Los materiales tienen textura visible pero no excesiva. Una mesa de madera se ve como madera, no como una fotografía de madera.
- Los acabados son levemente mate. Nada excesivamente brillante o plástico.
- Las telas (ropa, cojines) tienen pliegues y textura natural.
- Los metales (lámparas, detalles de barra) son dorados o cobrizos, nunca cromados fríos.

### Materiales por zona de la Cafetería

| Zona | Piso | Paredes | Muebles |
|---|---|---|---|
| Entrada | Baldosa cerámica cálida | Pintura crema con textura | Madera oscura |
| Mesas centrales | Madera de parquet | Pintura crema o ladrillo expuesto | Madera media + metal cobrizo |
| Barra | Madera oscura | Azulejo artesanal detrás de la barra | Madera oscura + mármol suave |
| Sofás | Alfombra de tono cálido | Pintura con ligera textura | Tela de lino o terciopelo suave |

---

## Avatares — Estilo visual

### Proporciones
Ligeramente idealizadas: figura un poco más estilizada que la realidad pero completamente humana y reconocible. No es anime, no es ultra-realista.

### Cara
- Expresiva pero no caricaturesca
- Variedad real de tonos de piel, rasgos y tipos de rostro
- El mercado inicial es el Caribe y Latinoamérica — la diversidad de rasgos debe reflejarlo
- Los ojos tienen expresión visible desde distancia media

### Ropa
- Ropa contemporánea, reconocible y variada
- El armario inicial refleja el estilo urbano caribeño y latinoamericano
- Hay opciones formales, casuales, deportivas y festivas desde el día uno
- Sin fantasía, sin armaduras, sin estética de videojuego — al menos en el MVP

### Animaciones
Ver `04_ART_DIRECTION/Animation.md`

---

## Identidad de marca

### El nombre
**Atlas.** Simple, poderoso, con resonancia en español e inglés. Sugiere amplitud y conexión sin prometer un metaverso.

El nombre interno de desarrollo fue "Project Atlas". El nombre público puede ser simplemente **Atlas** o una variante que se defina durante el proceso de marca.

### El logotipo
A definir durante el desarrollo. Criterios obligatorios:
- Funciona en fondo oscuro y fondo claro
- Reconocible a tamaño de ícono de app (32x32px)
- No usa elementos de avatar, mundo virtual o tecnología — evoca conexión humana
- Funciona en blanco y negro

### El tono de comunicación
- Cercano, no corporativo
- En español dominicano / latinoamericano natural, no traducido del inglés
- Directo y sin jerga técnica
- Cálido pero no infantil

---

## Lo que el estilo visual de Atlas NO es

- No es un metaverso corporativo azul y blanco
- No es un juego de fantasía con colores saturados
- No es una app minimalista sin alma
- No es una copia de IMVU ni de VRChat
- No es una plataforma "para gamers"

Atlas es un lugar para personas. Su estética debe comunicar exactamente eso.

---

*Este documento es la referencia de identidad visual. Todo asset, pantalla, avatar o elemento de UI producido para Atlas debe poder justificarse en términos de este Style Guide.*
