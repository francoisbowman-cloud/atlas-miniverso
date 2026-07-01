# ADR-001 — Cambio de Unreal Engine a Babylon.js

**Fecha:** 2026-06-29  
**Estado:** Aceptado  
**Decidido por:** Brey (fundador)

---

## Contexto

El stack original de Atlas usaba Unreal Engine 5 como motor gráfico. Durante la sesión de trabajo del 2026-06-29, se evaluaron las especificaciones del hardware de desarrollo disponible:

- CPU: Intel Core i5-7200U @ 2.50GHz (7ª generación, dual-core)
- GPU: Intel HD Graphics 620 (128 MB, integrada — sin GPU dedicada)
- RAM: 8 GB
- PC: HP ProBook 450 G4

**Problema identificado:** Unreal Engine 5 requiere como mínimo una GPU dedicada (NVIDIA GTX 1070 o equivalente) tanto para desarrollo como para uso del cliente. Esta PC no cumple ese requisito. UE5 no puede ejecutarse en este hardware de forma funcional.

Adicionalmente, el mercado inicial (República Dominicana) tiene una infraestructura de hardware similar o inferior en muchos casos — lo que significa que una app nativa con requisitos de GPU también afectaría a los usuarios finales.

---

## Decisión

**Se reemplaza Unreal Engine por Babylon.js como capa de presentación.**

La aplicación pasa de ser un cliente nativo descargable a una **aplicación web 3D que corre en el navegador**.

---

## Por qué Babylon.js sobre otras alternativas

### Babylon.js vs Three.js
Ambos son motores WebGL. Babylon.js fue elegido porque:
- Tiene sistema de animación más avanzado (Animation Groups, State Machines) — crítico para los avatares
- Mejor sistema de colisiones para detección de proximidad
- Character Controller integrado
- Inspector de escena integrado (herramienta de desarrollo muy útil)
- Audio espacializado 3D nativo
- Diseñado específicamente para experiencias interactivas, no solo visualización
- Mantenido activamente por Microsoft

### Babylon.js vs Unity WebGL
- Babylon.js es nativo web — no hay capa de transpilación
- Tamaño de bundle más pequeño (mejor carga inicial)
- Más fácil de integrar con el stack web del backend
- Sin licencias de Unity que gestionar

---

## Implicaciones del cambio

### Positivas (ventajas no previstas inicialmente)

1. **Sin descarga:** la app corre en el navegador. El usuario solo necesita un enlace. Esto reduce radicalmente la fricción de onboarding — crítico para el mercado de República Dominicana.

2. **Requisitos mínimos de hardware para usuarios:** cualquier PC con navegador moderno y conexión a internet puede usar Atlas. Esto amplía el mercado potencial significativamente.

3. **Ciclo de desarrollo más rápido:** no hay que compilar un cliente nativo para cada cambio. Los cambios se ven en el navegador inmediatamente.

4. **Despliegue trivial:** el cliente es una aplicación web estática. Se despliega como cualquier sitio web.

5. **Multiplataforma de serie:** Chrome en Windows, Mac o Linux. Eventualmente móvil sin trabajo adicional.

6. **Compatible con el hardware de desarrollo disponible:** el equipo puede desarrollar y probar en el hardware actual.

### Negativas (trade-offs aceptados)

1. **Menor fidelidad gráfica:** WebGL no alcanza el nivel visual de UE5 con Nanite y Lumen. Aceptado — la filosofía de Atlas es calidez sobre hiperrealismo.

2. **Rendimiento limitado por el navegador:** JavaScript/WebAssembly es menos eficiente que código nativo C++. Con optimización y límite de 40 usuarios en sala, es manejable.

3. **Acceso al hardware más restringido:** menos control sobre GPU, audio del sistema, etc. Mitigable con APIs modernas (WebAudio, WebRTC).

---

## Documentos afectados por este cambio

| Documento | Acción |
|---|---|
| `05_ENGINEERING/Architecture.md` | Reescribir con nuevo stack |
| `05_ENGINEERING/Unreal/Unreal_Engine.md` | Reemplazar por `05_ENGINEERING/Web3D/Web3D.md` |
| `01_PRODUCT/MVP.md` | Actualizar requisitos de cliente y ventaja "sin descarga" |
| `04_ART_DIRECTION/Style_Guide.md` | Ajustar expectativas visuales a WebGL |
| `09_BUSINESS/Go_To_Market.md` | Añadir ventaja de acceso sin descarga |

---

## Stack tecnológico actualizado

| Componente | Antes | Ahora |
|---|---|---|
| Motor gráfico | Unreal Engine 5 | Babylon.js |
| Plataforma cliente | App nativa Windows | Navegador web (Chrome, Edge, Firefox) |
| Lenguaje cliente | C++ / Blueprints | TypeScript |
| Animaciones | Animation Blueprints | Babylon.js Animation Groups |
| Audio espacial | Unreal Audio Engine | Web Audio API + Babylon.js Sound |
| Voz | Plugin WebRTC UE5 | LiveKit SDK (WebRTC nativo en browser) |
| Backend | Sin cambios | Sin cambios |
| Networking | Sin cambios | Sin cambios |

---

*Esta decisión convierte una limitación de hardware en una ventaja de producto: Atlas es ahora más accesible que en su concepción original.*
