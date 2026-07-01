# Arquitectura Técnica — Atlas

**Versión:** 2.0  
**Fecha:** 2026-06-29  
**Estado:** Documento fundacional de ingeniería  
**Cambio v2.0:** Unreal Engine reemplazado por Babylon.js (ver ADR-001)

---

## Principio arquitectónico central

> Atlas es una plataforma social. No un videojuego.

Esta distinción define cómo construimos cada parte del sistema. Toda la infraestructura crítica — autenticación, salas, usuarios, mensajes, moderación — existe como servicios independientes que el cliente web consulta, pero no controla.

Si mañana cambiamos Babylon.js por otro framework, la plataforma sigue funcionando.

---

## Visión de alto nivel

```
┌─────────────────────────────────────────────────────┐
│              CLIENTE (Navegador Web)                │
│                                                     │
│   ┌─────────────────────────────────────────────┐  │
│   │           Babylon.js (WebGL)                │  │
│   │   (Render 3D, Avatares, Animaciones)        │  │
│   │                                             │  │
│   │   ┌──────────────┐  ┌───────────────────┐  │  │
│   │   │  Scene Layer  │  │   UI Layer (HTML) │  │  │
│   │   └──────┬───────┘  └────────┬──────────┘  │  │
│   └──────────┼────────────────────┼─────────────┘  │
│              │    Web Audio API   │                 │
│         WebSocket           REST API (HTTPS)        │
└──────────────┼────────────────────┼────────────────┘
               │                    │
┌──────────────▼────────────────────▼────────────────┐
│                    BACKEND                          │
│                                                     │
│  ┌──────────────┐  ┌───────────┐  ┌─────────────┐  │
│  │  Realtime    │  │   Auth    │  │   Rooms     │  │
│  │  Server (WS) │  │  Service  │  │   Service   │  │
│  └──────┬───────┘  └─────┬─────┘  └──────┬──────┘  │
│         │                │               │          │
│  ┌──────▼───────┐  ┌─────▼─────┐  ┌──────▼──────┐  │
│  │  LiveKit SFU │  │   Users   │  │  Moderation │  │
│  │  (WebRTC)    │  │  Service  │  │   Service   │  │
│  └──────────────┘  └───────────┘  └─────────────┘  │
│                                                     │
│  ┌─────────────────────────────────────────────┐    │
│  │          Base de datos (PostgreSQL)          │    │
│  │  + Redis (sesiones y estado en tiempo real) │    │
│  └─────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────┘
```

---

## Stack tecnológico definido

| Componente | Tecnología | Razón |
|---|---|---|
| Motor 3D (cliente) | **Babylon.js** | WebGL nativo, sistema de animación avanzado, audio espacial, sin requisito de GPU dedicada |
| Lenguaje cliente | **TypeScript** | Tipado estático, mejor mantenibilidad, ecosistema maduro |
| UI del cliente | **HTML/CSS + Svelte** | UI reactiva ligera sobre el canvas 3D de Babylon.js |
| Backend principal | **Node.js + Express** | Compatible con el hardware de desarrollo, mismo lenguaje que el cliente |
| Base de datos | **PostgreSQL** | Madurez, soporte JSON, relaciones claras |
| Cache / tiempo real | **Redis** | Estado efímero de sala, sesiones, pub/sub |
| Voz (WebRTC SFU) | **LiveKit** | SDK nativo para browser, open source, fácil de autoalojar |
| Autenticación | **JWT + refresh tokens** | Estándar, stateless, seguro |
| Infraestructura | **Railway / Render (MVP)** | Despliegue simple y económico para comenzar |
| CDN | **Cloudflare** | Assets estáticos, caché global, gratuito en tier básico |

---

## Por qué este cambio es una ventaja, no un compromiso

El cambio de Unreal Engine a Babylon.js fue motivado por las limitaciones de hardware de desarrollo (ver ADR-001), pero produce beneficios reales para el producto:

**Sin descarga.** El usuario abre un enlace en el navegador y está dentro. Cero fricción de instalación. Para el mercado de República Dominicana, esto es una ventaja enorme.

**Requisitos mínimos de usuario.** Cualquier PC con navegador moderno funciona. No se necesita GPU dedicada. Esto amplía el mercado potencial a prácticamente cualquier persona con computadora.

**Despliegue inmediato.** Cada cambio en el cliente se despliega como una página web. No hay que distribuir instaladores ni gestionar versiones en la máquina del usuario.

**La filosofía del producto justifica el trade-off.** Atlas prioriza calidez sobre hiperrealismo. Babylon.js puede producir una experiencia visualmente cálida y acogedora perfectamente alineada con la filosofía del producto.

---

## Capas del sistema

### Capa 1 — Cliente web (Babylon.js en el navegador)

Lo que corre en el navegador del usuario. Responsable de:

- Renderizar la escena 3D con los avatares y la sala
- Reproducir audio ambiental (Web Audio API) y voz espacializada
- Procesar el input del usuario (movimiento WASD, clics, acciones)
- Renderizar la UI sobre el canvas (HTML/CSS + Svelte)
- Comunicarse con el backend vía WebSocket y REST

El cliente no toma decisiones de negocio. Ver `05_ENGINEERING/Web3D/Web3D.md`.

### Capa 2 — Backend (Node.js, servicios independientes)

Sin cambios respecto a la arquitectura original. Ver `05_ENGINEERING/Backend/Backend.md`.

Los 4 servicios: Auth, Users, Rooms, Moderation.

### Capa 3 — Voz (LiveKit SFU)

LiveKit reemplaza la solución WebRTC custom. Es open source, tiene SDK nativo para browser, y puede autoalojarse.

Ver `05_ENGINEERING/Networking/Networking.md`.

### Capa 4 — Base de datos

PostgreSQL para datos persistentes + Redis para estado en tiempo real.

Ver `05_ENGINEERING/Database/` (pendiente).

---

## Requisitos del entorno de desarrollo

Con el nuevo stack, el desarrollo completo puede realizarse en el hardware disponible:

| Herramienta | Requisito | HP ProBook 450 G4 |
|---|---|---|
| Node.js 20+ | CPU cualquiera, 512 MB RAM | ✅ Compatible |
| PostgreSQL | CPU cualquiera, 256 MB RAM | ✅ Compatible |
| Redis | CPU cualquiera, 64 MB RAM | ✅ Compatible |
| Babylon.js (dev) | Navegador moderno | ✅ Chrome funciona |
| TypeScript / Svelte | CPU cualquiera | ✅ Compatible |
| LiveKit (local) | Docker o binario nativo | ✅ Compatible |
| VS Code | 4 GB RAM mínimo | ✅ Compatible |

**Todo el stack puede ejecutarse en local en la HP ProBook 450 G4.**

---

## Requisitos mínimos para usuarios de Atlas

| Componente | Mínimo |
|---|---|
| Navegador | Chrome 90+, Firefox 88+, Edge 90+ |
| CPU | Intel Core i3 o equivalente (cualquier generación reciente) |
| RAM | 4 GB |
| GPU | Integrada (Intel HD, AMD Vega integrada) — sin GPU dedicada necesaria |
| Internet | 3 Mbps para texto + 5 Mbps para voz |
| SO | Windows 7+, macOS 10.13+, Ubuntu 18+ |

**Esto cubre la amplia mayoría de computadoras en República Dominicana.**

---

## Hoja de ruta técnica del MVP

### Fase 0 — Setup
- Repositorio monorepo (client/ + server/)
- CI/CD con GitHub Actions
- Auth Service + base de datos
- Deploy de prueba en Railway

### Fase 1 — Sala y avatares
- Escena de la Cafetería en Babylon.js
- Sistema de avatares con personalización visual
- Movimiento del jugador (WASD + cámara)
- Sincronización de posición vía WebSocket

### Fase 2 — Comunicación
- LiveKit integrado para voz por proximidad
- Chat de texto con atenuación por distancia
- Animaciones sincronizadas entre clientes

### Fase 3 — Identidad y moderación
- Flujo completo de registro y creación de avatar
- Perfiles de usuario
- Sistema de reporte y moderación

### Fase 4 — Pulido y lanzamiento
- Optimización de rendimiento en hardware de gama baja
- QA en distintos navegadores y hardware
- Lanzamiento con comunidad inicial en RD

---

*El stack de Atlas es ahora más accesible, más rápido de desarrollar y más alineado con el hardware real del mercado inicial. La limitación se convirtió en ventaja.*
