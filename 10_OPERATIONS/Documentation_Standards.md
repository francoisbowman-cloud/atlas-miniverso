# Documentation Standards — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo — obligatorio para todo el equipo

---

## Por qué existen estos estándares

Un proyecto con documentación inconsistente se convierte en un proyecto con documentación inútil. Estos estándares garantizan que cualquier persona — o IA — que lea el AKS encuentre información confiable, actualizada y en el lugar donde la espera.

---

## Estructura de encabezado obligatoria

Todo documento del AKS debe comenzar con este encabezado:

```markdown
# Nombre del Documento — Atlas

**Versión:** X.Y  
**Fecha:** YYYY-MM-DD  
**Estado:** [ver estados válidos abajo]
```

### Estados válidos

| Estado | Significado |
|---|---|
| `Documento fundacional` | Define algo irrenunciable. Rara vez cambia. |
| `Documento activo` | Se usa y se actualiza regularmente. |
| `Documento de visión` | Describe algo futuro. No implementar todavía. |
| `Documento vivo` | Se actualiza con cada sesión o descubrimiento relevante. |
| `Deprecado` | Ya no es válido. Se mantiene por historial. Añadir nota de reemplazo. |

---

## Convenciones de nombrado de archivos

| Tipo | Formato | Ejemplo |
|---|---|---|
| Documento general | `PascalCase.md` | `Character_System.md` |
| Decisión de producto | `YYYY-MM-DD_nombre-decision.md` | `2026-06-28_mvp-plataforma-pc.md` |
| ADR (decisión técnica) | `YYYY-MM-DD_nombre-decision.md` | `2026-07-15_eleccion-sfu-livekit.md` |
| Log de sesión | `YYYY-MM-DD_descripcion.md` | `2026-06-28_Sesion-Fundacional.md` |
| Spec de feature | `nombre-feature.md` | `proximity-chat.md` |
| Diseño de sala | `NombreSala.md` | `Cafeteria.md` |

---

## Reglas de contenido

### Regla 1 — Un documento, una responsabilidad
Cada documento cubre un tema específico. Si un documento empieza a cubrir dos temas distintos, se divide.

### Regla 2 — Las listas no reemplazan el razonamiento
Las listas de bullets son útiles para enumerar. No son útiles para explicar. Si algo requiere contexto, se escribe en prosa. Un documento de Atlas no es una lista de PowerPoint.

### Regla 3 — Los documentos se cruzan por referencia, no por copia
Si la información sobre moderación ya está en `07_COMMUNITY/Moderation.md`, los demás documentos la referencian: `Ver Moderation.md`. No la copian. La información duplicada se vuelve inconsistente inevitablemente.

### Regla 4 — Las decisiones se explican, no solo se declaran
"Usamos X" no es suficiente. "Usamos X porque Y, habiendo evaluado Z" es lo que pertenece al AKS. Las razones detrás de las decisiones tienen tanto valor como las decisiones mismas.

### Regla 5 — El estado del documento se actualiza
Si un documento cambia de "Documento de visión" a "Documento activo" porque se empezó a implementar, el encabezado se actualiza. Un estado incorrecto genera confusión.

---

## Dónde va cada tipo de información

| Tipo de información | Ubicación |
|---|---|
| Visión y filosofía | `00_PROJECT_FOUNDATION/` |
| Requisitos de producto | `01_PRODUCT/` |
| Decisiones de UX | `02_EXPERIENCE/` |
| Diseño de salas y mundos | `03_WORLD/` |
| Identidad visual y animación | `04_ART_DIRECTION/` |
| Arquitectura técnica | `05_ENGINEERING/` |
| Sistema de avatares | `06_AVATARS/` |
| Comunidad y moderación | `07_COMMUNITY/` |
| Rol de la IA | `08_AI/` |
| Negocio y métricas | `09_BUSINESS/` |
| Historial y operaciones | `10_OPERATIONS/` |
| Recursos visuales | `Assets/` |

Si la información no encaja claramente en ninguna categoría, se propone primero una nueva categoría antes de crear un documento en un lugar arbitrario.

---

## Proceso de actualización de un documento

1. Identificar qué cambió y por qué
2. Actualizar el contenido del documento
3. Actualizar la versión (X.Y → X.Y+1 para cambios menores, X.Y → X+1.0 para cambios mayores)
4. Actualizar la fecha
5. Si el cambio es una decisión estratégica, registrarla también en `10_OPERATIONS/Decisions/` o `10_OPERATIONS/ADR/`

---

## Lo que nunca va en el AKS

- Contraseñas, tokens o credenciales de ningún tipo
- Datos personales de usuarios reales
- Código fuente (el código vive en el repositorio de código, el AKS documenta las decisiones de diseño)
- Ideas descartadas sin contexto (si una idea fue evaluada y descartada, se documenta la razón del descarte, no solo la idea)
- "Notas para después" sin fecha ni responsable

---

*Un AKS bien mantenido es tan valioso como el código. Trátalo con la misma disciplina.*
