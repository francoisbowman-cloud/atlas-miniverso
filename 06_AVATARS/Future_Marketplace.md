# Future Marketplace — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento de visión — no implementar hasta Fase 3

---

## Por qué este documento existe ahora

El Marketplace no se construye en el MVP. Pero las decisiones que tomemos hoy en el sistema de avatares deben poder soportar el Marketplace en el futuro sin reescribir todo desde cero.

Este documento existe para que las decisiones técnicas actuales no cierren puertas futuras.

---

## La visión del Marketplace

El Marketplace de Atlas es una economía de creadores. Los diseñadores de la comunidad crean ropa, accesorios y objetos, los venden, y obtienen ingresos reales.

Este modelo ha demostrado funcionar: IMVU genera más de 50 millones de dólares anuales, con la mayoría de ese dinero fluyendo hacia creadores de la comunidad. Roblox construyó una economía de miles de millones con el mismo principio.

Atlas tiene la ventaja de comenzar con una comunidad latina y caribeña con identidad cultural propia — un nicho con alta demanda de representación que los Marketplaces globales históricamente han servido mal.

---

## Cuándo se activa

El Marketplace se activa cuando se cumplen estas tres condiciones simultáneamente:

1. **Comunidad activa:** al menos 10.000 usuarios activos mensuales
2. **Retención demostrada:** retención de día 30 ≥ 20%
3. **Economía de creadores lista:** al menos 20 creadores beta probando el sistema

No hay fecha objetivo. La condición es métricas, no calendario.

---

## Cómo funciona

### Para compradores
- Moneda virtual (nombre por definir) que se compra con dinero real
- Los items se compran permanentemente — no hay alquiler ni suscripción por item
- Los items comprados están disponibles en el avatar para siempre
- Wishlist: guardar items para comprar después

### Para creadores
- Cualquier usuario puede solicitar convertirse en creador
- Los creadores suben designs en formatos estándar (texturas, modelos)
- El equipo de Atlas revisa y aprueba los items antes de publicarlos (control de calidad y moderación)
- Los creadores reciben un porcentaje de cada venta (modelo a definir, referencia: IMVU paga ~40-50%)
- Panel de creador con métricas de ventas

### Para Atlas
- Atlas retiene un porcentaje de cada transacción
- Atlas también puede vender items propios (colecciones oficiales, colaboraciones)

---

## Preparación técnica desde el MVP

Para que el Marketplace sea posible en el futuro, el sistema de avatares del MVP debe:

1. **Sistema de capas separadas desde el código:** aunque en el MVP se usen outfits completos, la arquitectura del renderizado debe soportar layers independientes (top, bottom, shoes, accessories, hair) para que agregar items individuales no requiera reescribir el sistema.

2. **IDs de items únicos y extensibles:** el esquema de datos del avatar debe usar IDs que permitan añadir miles de items sin cambiar la estructura. `outfit: 4` en el MVP debe poder convertirse en `items: [top_id, bottom_id, shoes_id, ...]` en el Marketplace sin migración traumática.

3. **Sistema de materiales parametrizado:** los materiales de ropa deben poder aceptar texturas externas, para que los items de creadores puedan cargarse dinámicamente.

4. **CDN para assets:** los assets del Marketplace (texturas, modelos) deben servirse desde un CDN, no estar embebidos en el cliente. Esto prepara el sistema para un catálogo de miles de items.

---

## Lo que el Marketplace NO hace

- No vende ventajas competitivas (no hay items que mejoren la experiencia social de forma injusta)
- No tiene gacha ni cajas sorpresa
- No tiene items de tiempo limitado que generen ansiedad artificial
- No tiene publicidad de terceros

El Marketplace vende expresión. No presión.

---

*El Marketplace es el futuro económico de Atlas. La comunidad es el presente. Primero la comunidad, después la economía.*
