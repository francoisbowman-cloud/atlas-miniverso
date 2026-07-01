# Business Model — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento activo

---

## El modelo en una oración

Atlas es una plataforma social freemium que monetiza mediante la venta de expresión digital — nunca mediante ventajas competitivas ni publicidad.

---

## Por qué freemium

El acceso a Atlas debe ser gratuito. Un usuario que paga para entrar es un usuario que no entrará. La masa crítica de usuarios es el activo más valioso del MVP, y cualquier barrera de entrada la reduce.

El dinero llega después, cuando la comunidad existe y tiene razones para invertir en su experiencia dentro de ella.

---

## Las tres fases del modelo de negocio

### Fase 1 — Crecimiento (MVP)

**Revenue:** cero.

Esta fase no genera dinero. Su único objetivo es validar la hipótesis central y construir una comunidad activa en República Dominicana.

Los costos de esta fase son inversión en el producto: servidores, desarrollo, moderación, y las primeras acciones de comunidad.

**Métrica de éxito:** 10.000 usuarios activos mensuales con retención de día 30 ≥ 20%.

### Fase 2 — Monetización inicial

**Revenue:** items cosméticos básicos.

Cuando la comunidad es activa y la retención está demostrada, se activa la primera capa de monetización:

- **Items cosméticos exclusivos:** outfits, peinados y accesorios que no están disponibles en el catálogo gratuito
- **Moneda virtual (Fichas Atlas):** se compra con dinero real, se usa para comprar items
- El catálogo gratuito se mantiene atractivo — los items de pago son adiciones, no lo que faltaba

**Precio orientativo de la moneda:**

| Pack | Fichas | Precio USD | Precio DOP (aprox.) |
|---|---|---|---|
| Starter | 100 | $0.99 | ~RD$60 |
| Regular | 500 | $4.99 | ~RD$300 |
| Plus | 1,200 | $9.99 | ~RD$600 |
| Premium | 2,800 | $19.99 | ~RD$1,200 |

Los precios en pesos dominicanos se ajustan a la paridad local. Esto es crítico para el mercado inicial.

### Fase 3 — Marketplace

**Revenue:** comisión sobre ventas de creadores + items oficiales de Atlas.

Ver `06_AVATARS/Future_Marketplace.md` y `09_BUSINESS/Monetization.md` para el detalle completo.

---

## Fuentes de revenue por fase

| Fuente | Fase 1 | Fase 2 | Fase 3 |
|---|---|---|---|
| Items cosméticos propios | ❌ | ✅ | ✅ |
| Moneda virtual | ❌ | ✅ | ✅ |
| Comisión de Marketplace | ❌ | ❌ | ✅ |
| Membresía VIP | ❌ | 🔄 Evaluar | ✅ |
| Publicidad | ❌ | ❌ | ❌ |
| Venta de datos | ❌ | ❌ | ❌ |

La publicidad y la venta de datos están permanentemente excluidas por la Constitution (Artículo VI).

---

## Costos del MVP

Estimación de costos operativos mensuales para el MVP con hasta 10.000 usuarios activos:

| Componente | Costo mensual estimado |
|---|---|
| Servidores (backend + DB) | $200-500 |
| Servidores de voz (WebRTC SFU) | $300-800 (depende del uso) |
| CDN (assets) | $50-150 |
| Monitoreo y logging | $50-100 |
| Email transaccional | $20-50 |
| **Total infraestructura** | **$620-1,600/mes** |

El costo dominante es la infraestructura de voz, que escala con los minutos de audio transmitidos. Con una base de usuarios inicial de Republic Dominicana (timezone similar, horarios concentrados), el costo real puede ser menor al estimado.

---

## Camino a sostenibilidad

El punto de equilibrio básico (cubrir costos de infraestructura) requiere:

Con un ARPU (Average Revenue Per User) de $2/mes en la base de usuarios activos:
- **Para cubrir $1,600/mes:** 800 usuarios pagantes
- Con una tasa de conversión freemium→pago del 5%: se necesitan **16,000 usuarios activos**

Esto es alcanzable antes de lanzar el Marketplace, solo con items cosméticos básicos.

---

*El mejor modelo de negocio para Atlas es uno que los usuarios casi no notan. Pagan porque quieren, no porque deban.*
