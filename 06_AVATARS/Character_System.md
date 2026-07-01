# Character System — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo

---

## El avatar como identidad

El avatar no es un personaje de videojuego. Es la representación digital de una persona real.

Cuando alguien personaliza su avatar en Atlas, no está eligiendo una skin. Está construyendo cómo quiere ser percibido en un espacio social. Esa decisión tiene peso emocional. El sistema de avatares debe honrar eso: ofrecer suficiente expresión para sentirse representado, sin tanta complejidad que se convierta en una tarea.

---

## Principios del sistema

### 1. Cualquier combinación es atractiva
No existe una combinación "fea" en el creador de avatares. Las opciones están curadas para que cualquier resultado sea visualmente agradable. Esto elimina la ansiedad de elegir "mal".

### 2. La diversidad es el default
El mercado inicial es el Caribe y Latinoamérica — una de las poblaciones más diversas del mundo. La paleta de tonos de piel, los tipos de cabello y los rasgos del rostro deben reflejar esa diversidad desde el día uno. No como afterthought sino como punto de partida.

### 3. Rápido de configurar, fácil de cambiar
El avatar inicial debe poder configurarse en menos de 2 minutos. Y el usuario debe poder cambiarlo en cualquier momento sin consecuencias. No existe el "avatar permanente" — la identidad puede evolucionar.

### 4. El avatar es expresivo en reposo
La personalidad del avatar no se transmite solo a través de la ropa o los emotes. El idle, la forma en que el avatar está parado, la expresión en su cara — todo debe comunicar presencia y carácter incluso sin que el usuario haga nada.

---

## Estructura del sistema de personalización (MVP)

### Nivel 1 — Silueta base

Tres siluetas. No etiquetadas por género — simplemente formas.

| Silueta | Descripción |
|---|---|
| A | Hombros anchos, cadera estrecha |
| B | Proporciones balanceadas |
| C | Hombros medianos, cadera pronunciada |

Cualquier outfit funciona en cualquier silueta. No hay restricciones de ropa por silueta.

### Nivel 2 — Rostro

| Opción | Cantidad MVP | Notas |
|---|---|---|
| Tono de piel | 8 | Desde muy claro hasta muy oscuro, enfocado en tonos latinoamericanos y caribeños |
| Forma de cara | 4 por silueta | Oval, cuadrado, redondo, angular |
| Ojos | 6 | Variedad de forma y tamaño |
| Cejas | 4 | Finas, gruesas, arqueadas, rectas |
| Nariz | 4 | Variedad de anchos y perfiles |
| Boca | 4 | Fina, media, gruesa, amplia |

La combinación de estos elementos produce miles de rostros únicos sin necesidad de un editor de sliders complejo.

### Nivel 3 — Cabello

| Categoría | Cantidad MVP |
|---|---|
| Cabello corto | 4 opciones |
| Cabello medio | 4 opciones |
| Cabello largo | 4 opciones |
| Rapado / sin cabello | 2 opciones |
| Color de cabello | 10 colores (naturales + algunos expresivos) |

Los peinados incluyen texturas que representan cabello liso, ondulado, rizado y muy rizado. El cabello afro y las trenzas están incluidas desde el día uno — no son DLC.

### Nivel 4 — Vello facial (disponible para silueta A y B)

| Categoría | Cantidad MVP |
|---|---|
| Sin vello | 1 |
| Barba corta | 2 |
| Barba larga | 2 |
| Bigote | 1 |
| Color | Hereda del color de cabello seleccionado |

### Nivel 5 — Outfit

En el MVP, el outfit se selecciona como conjunto completo. No hay sistema de capas separadas (parte de arriba / parte de abajo / calzado) — eso llega con el Marketplace.

| Categoría | Cantidad MVP |
|---|---|
| Casual urbano | 4 outfits completos |
| Casual elegante | 3 outfits completos |
| Deportivo | 2 outfits completos |
| Festivo | 2 outfits completos |
| **Total** | **11 outfits** |

Los outfits están diseñados para reflejar el estilo contemporáneo del Caribe y Latinoamérica. No hay fantasía, uniformes ni estética de videojuego.

---

## Flujo técnico de personalización

### Almacenamiento
Los datos del avatar son simples: IDs de las opciones seleccionadas.

```json
{
  "silhouette": "B",
  "skin_tone": 5,
  "face_shape": 2,
  "eyes": 3,
  "eyebrows": 1,
  "nose": 2,
  "mouth": 4,
  "hair_style": 7,
  "hair_color": 3,
  "facial_hair": 0,
  "outfit": 4
}
```

Este objeto vive en el Users Service y se envía al cliente al cargar el perfil.

### Renderizado en Babylon.js
Tras ADR-001 (2026-06-29), el cliente es una app web (Babylon.js 7 + TypeScript + Vite), no Unreal. El cliente recibe los datos del avatar y construye el personaje en runtime:
- Carga el GLB de la silueta correspondiente
- Reemplaza los materiales por `StandardMaterial` propios (el GLB no trae texturas embebidas)
- Aplica tono de piel, cabello, ropa mediante `diffuseColor` por material
- Carga y adjunta meshes de cabello, ropa y accesorios según evolucione el catálogo

Toda la personalización es a nivel de material y mesh swap — no hay morph targets en el MVP.

### Estado de implementación actual (MVP técnico, 2026-06-30)

Lo descrito en Niveles 1-5 arriba es el diseño objetivo. Lo que existe hoy, funcionando de punta a punta, es una base más simple sobre la que ese diseño se construye:

- **`create_avatar.py`** (raíz del repo) — genera con Blender (headless, sin GPU) un avatar humanoid de bajo poligonaje, sin texturas, con 4 materiales exactos que el cliente reconoce por nombre: `skin`, `hair`, `jacket`, `pant`. Paramétrico: género, altura, complexión y color base de cada material.
- **`client/src/avatar/GLBAvatar.ts`** — carga el GLB, clasifica cada mesh por palabras clave en el nombre del material/mesh (`skin/body/face/head`, `hair/eyebrow`, `jacket/shirt/torso/chest`, `pant/leg/shoe/foot`), y expone `updateSkin()/updateHair()/updateJacket()/updatePants()` para recolorear en vivo.
- **`avatar_factory.py`** — puente Python que invoca Blender en background, genera variantes en `client/public/models/variants/`, y puede fijar una como `avatar.glb` (el que carga el cliente).
- **`mcp_avatar_server.py`** + **`.mcp.json`** — conector MCP: permite generar y aplicar avatares directamente desde Cowork/Claude, sin intervención humana ni Blender abierto manualmente. Herramientas: `atlas_avatar_generate`, `atlas_avatar_list_variants`, `atlas_avatar_set_default`.

Todavía no existe el sistema de siluetas/rasgos faciales/outfits en capas del diseño objetivo — es la brecha entre este MVP técnico y la visión de Niveles 1-5.

### Visualización en tiempo real
Durante la creación del avatar, el preview 3D se actualiza instantáneamente al cambiar cualquier opción. No hay "aplicar" — el usuario ve el resultado en vivo mientras navega por las opciones.

---

## Identidad visual del avatar sobre la cabeza

Nombre de usuario flotante sobre el avatar:
- Visible a todos los usuarios dentro del rango de proximidad
- Se desvanece con la distancia
- Fondo semitransparente oscuro, texto en blanco crema
- Indicador de estado de voz (icono de micrófono) junto al nombre cuando está hablando

---

## El avatar en el futuro (post-MVP)

El sistema de personalización del MVP es deliberadamente limitado. El catálogo crece en fases:

**Fase 2 — Post-MVP:**
- Sistema de capas separadas (parte de arriba, parte de abajo, calzado, accesorios)
- Más opciones de cabello, incluyendo extensiones y peinados elaborados
- Accesorios: gafas, aretes, collares, relojes, gorras
- Tatuajes y piercings

**Fase 3 — Marketplace:**
- Prendas diseñadas por la comunidad
- Colecciones de temporada
- Items exclusivos de eventos

Ver `06_AVATARS/Future_Marketplace.md` para la visión del Marketplace.

---

*El avatar es la puerta de entrada a Atlas. Si el usuario no se siente representado en él, nunca se sentirá en casa.*
