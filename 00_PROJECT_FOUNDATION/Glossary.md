# Glossary — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-29  
**Estado:** Documento vivo — añadir términos conforme aparecen

---

## Propósito

Este glosario define el vocabulario oficial del proyecto. Cuando un término aparece en el AKS, en una conversación de equipo o en el código, su significado es exactamente el que está aquí. No hay ambigüedad.

Si alguien usa un término de forma diferente a la definición aquí, la definición prevalece.

---

## Términos del producto

**Atlas**  
El nombre del producto. Plataforma social con espacios virtuales 3D donde los usuarios interactúan mediante avatares. También el nombre del proyecto en su conjunto.

**AKS (Atlas Knowledge System)**  
El sistema de documentación oficial del proyecto. La fuente única de verdad. Cualquier información no registrada aquí no existe oficialmente.

**Sala**  
Un espacio virtual temático donde los usuarios se encuentran e interactúan. Cada sala tiene una identidad emocional, capacidad máxima, zonas sociales y audio ambiental propios. Sinónimo de "room" en el código.

**La Cafetería**  
La primera y única sala del MVP. Sinónimo técnico: `CAFE-01`.

**Avatar**  
La representación 3D del usuario dentro de las salas. Es personalizable y refleja la identidad que el usuario quiere proyectar.

**Proximidad / Sistema de proximidad**  
El mecanismo por el cual la voz y el chat de texto solo son perceptibles por usuarios cercanos en el espacio virtual. A mayor distancia, menor audibilidad. Es el lenguaje social fundamental de Atlas.

**Rango de proximidad**  
La distancia máxima dentro de la cual dos avatares pueden escucharse y leerse. Actualmente dividido en zonas: conversación íntima (0-2m), conversación de grupo (2-5m), escucha pasiva (5-10m), murmullos (10-15m), silencio (+15m).

**Emote**  
Una animación social que el usuario activa voluntariamente para comunicar algo sin usar la voz. Ejemplos: saludar, asentir, reír.

**Idle**  
El estado de animación base del avatar cuando el usuario no está haciendo nada. Incluye respiración y micro-movimientos para dar sensación de presencia.

**Fichas Atlas**  
La moneda virtual del producto (nombre provisional). Se compra con dinero real y se usa para adquirir items cosméticos. Aparece en Fase 2.

**Marketplace**  
La economía de creadores donde los usuarios pueden comprar y vender items cosméticos. Aparece en Fase 3.

**Badge de Fundador**  
Distinción visual exclusiva para los primeros 1.000 usuarios registrados. No otorga ventajas funcionales — es un símbolo de pertenencia a la comunidad fundadora.

---

## Términos técnicos

**Realtime Server**  
El servidor WebSocket que sincroniza posiciones, animaciones, estado y chat de texto entre todos los usuarios de una sala en tiempo real.

**Voice Router**  
El servidor SFU (Selective Forwarding Unit) que gestiona la transmisión de voz entre usuarios usando WebRTC.

**SFU (Selective Forwarding Unit)**  
Arquitectura de servidor de voz donde cada cliente envía su audio una vez al servidor, y el servidor lo distribuye selectivamente. Más eficiente que peer-to-peer para grupos grandes.

**Auth Service**  
Servicio del backend responsable de autenticación: registro, login, tokens y gestión de sesiones.

**Users Service**  
Servicio del backend responsable del perfil de usuario, avatar y relaciones entre usuarios (bloqueos).

**Rooms Service**  
Servicio del backend responsable de la existencia y estado de las salas.

**Moderation Service**  
Servicio del backend responsable de reportes, sanciones y el panel de moderación.

**JWT (JSON Web Token)**  
El formato de token usado para autenticar requests al backend. El access token expira en 15 minutos.

**LOD (Level of Detail)**  
Técnica de optimización donde los avatares lejanos se renderizan con menos polígonos y menor resolución de textura para mejorar el rendimiento.

**Skeletal Mesh**  
El modelo 3D del avatar en Unreal Engine, compuesto por una malla de polígonos y un esqueleto de huesos que permite animarlo.

---

## Términos de comunidad y negocio

**Early Adopter**  
Usuario que se une a Atlas durante la beta o el lanzamiento soft, antes de que la plataforma tenga masa crítica.

**Constructor de Comunidad**  
Arquetipo de usuario (ver `01_PRODUCT/User_Personas.md`) que naturalmente lidera, organiza y atrae a otras personas. Clave para la salud de la comunidad inicial.

**MAU (Monthly Active Users)**  
Usuarios únicos que han entrado a Atlas al menos una vez en los últimos 30 días.

**DAU (Daily Active Users)**  
Usuarios únicos que entran a Atlas en un día dado.

**DAU/MAU ratio**  
La proporción entre DAU y MAU. Es la métrica norte de Atlas. Un ratio de 0.30 significa que el 30% de los usuarios activos del mes entran cualquier día dado.

**Retención día N**  
Porcentaje de usuarios que, habiendo entrado por primera vez, vuelven a entrar N días después. La retención día 7 y día 30 son las más críticas.

**NPS (Net Promoter Score)**  
Métrica que mide la disposición de los usuarios a recomendar Atlas. Se obtiene preguntando "¿Qué tan probable es que recomiendes Atlas a alguien?" (0-10). NPS = % promotores (9-10) - % detractores (0-6).

**ARPU (Average Revenue Per User)**  
Revenue mensual dividido entre el número de usuarios activos. Métrica de monetización clave.

**Freemium**  
Modelo de negocio donde el acceso básico es gratuito y las funciones o items adicionales son de pago.

---

*Este glosario es la constitución del lenguaje del proyecto. Si un término genera confusión, la solución es añadirlo aquí, no asumir que todos entienden lo mismo.*
