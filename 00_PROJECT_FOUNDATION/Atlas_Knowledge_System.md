# Atlas Knowledge System (AKS)

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento vivo — actualizar con cada decisión relevante

---

## Qué es el AKS

El Atlas Knowledge System es el sistema operativo documental de Project Atlas. No es una carpeta de archivos. No es un wiki. Es la fuente única de verdad del proyecto.

Todo lo que existe en el AKS existe oficialmente. Todo lo que no está en el AKS no tiene validez institucional, aunque haya sido discutido, acordado o prometido verbalmente.

Su propósito es que cualquier persona — o cualquier IA — que se incorpore al proyecto pueda entender exactamente cómo debe construirse Atlas sin depender de explicaciones adicionales.

---

## Estructura del AKS

```
PROJECT ATLAS
│
├── 00_PROJECT_FOUNDATION        ← El núcleo. Todo lo demás emana de aquí.
│   ├── Manifesto.md             ← Visión, propósito y filosofía
│   ├── Constitution.md          ← Reglas irrenunciables
│   ├── Atlas_Knowledge_System.md ← Este documento
│   ├── Vision.md                ← Estado detallado de la visión a largo plazo
│   ├── Glossary.md              ← Vocabulario oficial del proyecto
│   └── North_Star.md            ← La métrica y experiencia que lo define todo
│
├── 01_PRODUCT                   ← Qué construimos y en qué orden
│   ├── PRD.md                   ← Product Requirements Document
│   ├── MVP.md                   ← Alcance y criterios del MVP
│   ├── User_Personas.md         ← Quiénes son nuestros usuarios
│   ├── User_Journeys.md         ← Cómo viven la experiencia
│   ├── Roadmap.md               ← Plan de fases y prioridades
│   ├── Feature_Specifications/  ← Un archivo por función
│   └── Product_Decisions/       ← Decisiones de producto con justificación
│
├── 02_EXPERIENCE                ← Cómo se siente el producto
│   ├── UX_Principles.md
│   ├── Social_Psychology.md
│   ├── Presence_System.md
│   ├── Voice_Interactions.md
│   ├── Avatar_Experience.md
│   ├── Onboarding.md
│   └── Retention.md
│
├── 03_WORLD                     ← Los espacios del mundo
│   ├── World_Design.md
│   ├── Audio.md
│   ├── Locations/               ← Un archivo por sala
│   ├── Atmospheres/             ← Paleta emocional de cada espacio
│   └── Events/                  ← Eventos recurrentes y especiales
│
├── 04_ART_DIRECTION             ← La identidad visual
│   ├── Style_Guide.md
│   ├── Lighting.md
│   ├── Materials.md
│   ├── Animation.md
│   ├── UI.md
│   └── Branding.md
│
├── 05_ENGINEERING               ← Cómo se construye
│   ├── Unreal/
│   ├── Backend/
│   ├── Networking/
│   ├── Audio/
│   ├── Database/
│   ├── Infrastructure/
│   ├── Security/
│   └── Performance/
│
├── 06_AVATARS                   ← El sistema de identidad del usuario
│   ├── Character_System.md
│   ├── Clothing.md
│   ├── Accessories.md
│   ├── Animations.md
│   └── Future_Marketplace.md
│
├── 07_COMMUNITY                 ← Cómo se cuida la comunidad
│   ├── Moderation.md
│   ├── Community_Guidelines.md
│   ├── Trust_And_Safety.md
│   ├── Events.md
│   └── Reputation_System.md
│
├── 08_AI                        ← El rol de la IA dentro del producto y el AKS
│   ├── Claude.md
│   ├── AI_Skills.md
│   ├── AI_Guidelines.md
│   ├── Prompt_Library.md
│   └── Decision_Framework.md
│
├── 09_BUSINESS                  ← El modelo económico
│   ├── Business_Model.md
│   ├── Monetization.md
│   ├── Go_To_Market.md
│   ├── KPIs.md
│   └── Expansion.md
│
├── 10_OPERATIONS                ← El registro histórico del proyecto
│   ├── Meeting_Notes/
│   ├── ADR/                     ← Architecture Decision Records
│   ├── Changelog/
│   ├── Decisions/
│   └── Documentation_Standards.md
│
└── Assets/                      ← Imágenes, referencias visuales, logos
```

---

## Roles del AKS

### El Arquitecto del Conocimiento

Toda IA que trabaje en este proyecto asume el rol permanente de **Arquitecto del Conocimiento**. Esto significa que además de programar, diseñar o analizar, es responsable de:

- Mantener la documentación organizada, coherente y actualizada
- Detectar redundancias o contradicciones entre documentos y proponer soluciones
- Crear nuevos documentos únicamente cuando el contenido no encaje en ninguno existente
- Proponer reorganizaciones antes de continuar si la estructura se vuelve inconsistente

Este rol no es opcional. Es parte del trabajo.

---

## Reglas de oro del AKS

### Regla 1 — No crear documentos innecesarios
Antes de crear un archivo nuevo, verificar si la información pertenece a uno existente. Si un documento crece en exceso o cubre temas distintos, proponer dividirlo manteniendo una jerarquía clara.

**Prohibido:** crear archivos como `ideas.md`, `notas2.md`, `version_final.md` o cualquier documento sin un lugar claro en la estructura.

### Regla 2 — Un lugar para cada cosa
Cada decisión, especificación o cambio de dirección tiene un lugar predefinido en la estructura. Si no está claro dónde va algo, primero se actualiza el AKS con el lugar correcto y luego se añade el contenido.

### Regla 3 — El AKS es la memoria del proyecto
Las conversaciones verbales, los chats y los mensajes informales no son fuentes de verdad. Solo lo es el AKS. Si un acuerdo no está documentado aquí, no existe oficialmente.

### Regla 4 — Los documentos son vivos, no archivos muertos
Un documento desactualizado es peor que ningún documento, porque genera confusión. Cada vez que una decisión cambia, el documento correspondiente debe actualizarse antes de continuar.

### Regla 5 — La constitución es el límite
Ningún documento del AKS puede contradecir la Constitution. Si se detecta una contradicción, el documento que la genera debe revisarse, no la constitución.

---

## Cómo añadir contenido al AKS

### Para decisiones de producto
→ `01_PRODUCT/Product_Decisions/YYYY-MM-DD_nombre-decision.md`

### Para decisiones de arquitectura técnica
→ `10_OPERATIONS/ADR/YYYY-MM-DD_nombre-decision.md`

### Para nuevas funciones
→ `01_PRODUCT/Feature_Specifications/nombre-funcion.md`

### Para nuevas salas del mundo
→ `03_WORLD/Locations/nombre-sala.md`

### Para cambios al AKS mismo
→ Actualizar este documento con nueva versión y fecha, y registrar el cambio en `10_OPERATIONS/Changelog/`

---

## Cómo incorporarse al proyecto

Cualquier persona o IA que se incorpore al proyecto debe comenzar leyendo estos cuatro documentos en orden:

1. `00_PROJECT_FOUNDATION/Manifesto.md` — Para entender el propósito
2. `00_PROJECT_FOUNDATION/Constitution.md` — Para entender las reglas
3. `00_PROJECT_FOUNDATION/Atlas_Knowledge_System.md` — Para entender cómo trabajar (este documento)
4. `01_PRODUCT/MVP.md` — Para entender qué se está construyendo ahora

Solo después de leer estos cuatro documentos se debe comenzar a trabajar en el proyecto.

---

## Estado actual del AKS

| Sección | Estado | Última actualización |
|---|---|---|
| 00_PROJECT_FOUNDATION | ✅ Completo | 2026-06-29 |
| 01_PRODUCT | 🟡 Parcial (faltan PRD, Roadmap) | 2026-06-28 |
| 02_EXPERIENCE | 🟡 Parcial (faltan Social_Psychology, Presence_System, Onboarding, Retention) | 2026-06-28 |
| 03_WORLD | 🟡 Parcial (faltan Atmospheres, Events adicionales, más Locations) | 2026-06-28 |
| 04_ART_DIRECTION | 🟡 Parcial (faltan Lighting, Materials, Branding) | 2026-06-28 |
| 05_ENGINEERING | 🟡 Parcial (faltan Database, Infrastructure, Security, Performance) | 2026-06-29 |
| 06_AVATARS | ✅ Completo | 2026-06-29 |
| 07_COMMUNITY | ✅ Completo | 2026-06-29 |
| 08_AI | ✅ Completo | 2026-06-29 |
| 09_BUSINESS | ✅ Completo | 2026-06-29 |
| 10_OPERATIONS | 🟡 En uso | 2026-06-29 |

---

*El AKS no es un archivo. Es el cerebro del proyecto. Tratarlo como tal.*
