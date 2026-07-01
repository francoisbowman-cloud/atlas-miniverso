# UI Design — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento activo

---

## Filosofía de UI

La interfaz de Atlas tiene un objetivo que parece simple pero no lo es: **no existir**.

El usuario no viene a usar una interfaz. Viene a estar con personas. La UI es el obstáculo necesario entre el usuario y esa experiencia. Nuestra misión es hacerlo lo más pequeño e invisible posible.

Cada elemento de UI que añadimos es una decisión consciente con un costo: distrae al usuario del espacio social. Ese costo siempre debe justificarse.

---

## Pantallas del MVP

### 1. Pantalla de registro

**Objetivo:** crear una cuenta en menos de 90 segundos.

**Campos:**
- Correo electrónico
- Contraseña (mínimo 8 caracteres)
- Nombre de usuario (el único nombre visible en la plataforma)

**Notas de diseño:**
- Un solo paso. Sin dividir en múltiples pantallas.
- Verificación de correo requerida antes de entrar, pero el proceso es un clic en el email.
- Texto de fondo: imagen suave de la cafetería desenfocada. El usuario ya sabe a dónde va.
- Mensaje debajo del formulario: *"En menos de un minuto estarás dentro."*

---

### 2. Creación de avatar

**Objetivo:** personalización rápida con resultado siempre atractivo.

**Flujo:**
1. Selección de silueta base (tres opciones visuales, sin etiquetas de género)
2. Tono de piel (paleta de 8 opciones que cubren toda la diversidad latinoamericana y caribeña)
3. Rostro (4-6 opciones predefinidas por tipo de silueta)
4. Peinado (8-12 opciones)
5. Outfit inicial (4-6 opciones completas prediseñadas)
6. Confirmación con rotación 360° del avatar

**Notas de diseño:**
- Vista previa 3D del avatar en tiempo real mientras se personaliza.
- Todas las opciones de la misma categoría son visibles simultáneamente, no en un carrusel.
- Ninguna combinación produce un resultado poco atractivo — las opciones están curadas.
- El usuario puede omitir este paso ("entrar con avatar aleatorio") y personalizarlo después.
- Tiempo objetivo: menos de 2 minutos si el usuario quiere personalizarlo. 10 segundos si elige aleatorio.

---

### 3. HUD en sala (la pantalla más importante)

**Objetivo:** dar al usuario lo mínimo necesario sin interrumpir la inmersión.

**Elementos permanentes visibles:**

Esquina inferior izquierda:
- Avatar miniatura del propio usuario + nombre de usuario
- Indicador de estado del micrófono (activo / silenciado)

Esquina inferior derecha:
- Botón de micrófono (activar/silenciar)
- Botón de chat de texto (abrir/cerrar)
- Botón de menú (⋯ — accede a ajustes, perfil, salir)

**Elementos que aparecen solo cuando son necesarios:**
- Nombre de un usuario sobre su avatar (al acercarse a él)
- Indicador de que alguien está hablando (sutil onda sobre el avatar)
- Burbujas de chat de texto (solo visibles en rango de proximidad)

**Lo que NO aparece en el HUD:**
- Mapa o minimapa
- Lista de usuarios en sala
- Contador de usuarios
- Notificaciones de sistema durante la sesión
- Ningún elemento publicitario o promocional

**Notas de diseño:**
- Todos los elementos del HUD son semitransparentes. No compiten visualmente con la sala.
- En modo "inmersión" (tecla Tab o botón dedicado), el HUD desaparece completamente.
- El HUD reaparece al mover el ratón o presionar cualquier tecla.

---

### 4. Chat de texto

**Objetivo:** texto como complemento de la voz, no como sustituto.

**Comportamiento:**
- Las burbujas de texto aparecen flotando sobre el avatar que escribe, visibles solo dentro del rango de proximidad.
- Al abrir el panel de chat (esquina inferior derecha), aparece un historial breve de los mensajes recientes del entorno cercano.
- Máximo 50 caracteres por mensaje visible en burbuja. Mensajes más largos se ven completos en el panel de chat.
- Los mensajes desaparecen de la burbuja flotante tras 6 segundos.

**Panel de chat:**
- Ancho máximo 320px, height 40% de la pantalla
- Fondo oscuro semitransparente
- Los mensajes muestran nombre de usuario + texto. Sin foto de perfil en este panel.
- El panel de chat no ocupa toda la pantalla. El mundo sigue visible.

---

### 5. Perfil de usuario

Accesible al hacer clic sobre el avatar de otro usuario.

**Información visible:**
- Nombre de usuario
- Avatar en miniatura
- Estado actual (disponible / ocupado / ausente)
- Botones: Silenciar / Bloquear / Reportar

**Lo que NO se muestra en el MVP:**
- Historial de actividad
- Cantidad de amigos o seguidores
- Sala favorita
- Estadísticas de uso

---

### 6. Menú de ajustes

Accesible desde el botón ⋯ del HUD.

**Secciones:**
- **Audio:** volumen de voz, volumen ambiental, volumen de música, activación de push-to-talk
- **Controles:** sensibilidad de cámara, teclas de movimiento
- **Perfil:** cambiar nombre de usuario, cambiar avatar, cambiar estado
- **Privacidad:** quién puede hablarme, radio de proximidad
- **Cuenta:** cambiar contraseña, cerrar sesión
- **Salir de la sala**

---

### 7. Sistema de reporte y moderación (UI)

Accesible desde el perfil de cualquier usuario.

**Flujo de reporte:**
1. Clic en "Reportar" en el perfil del usuario
2. Selección de categoría (acoso, lenguaje inapropiado, spam, suplantación, otro)
3. Descripción opcional (campo de texto libre, máximo 200 caracteres)
4. Confirmación: *"Tu reporte ha sido enviado. Gracias por ayudarnos a mantener Atlas seguro."*

El flujo no debe tomar más de 30 segundos.

---

## Principios de diseño de UI

### Oscuro por defecto
Los fondos de UI son oscuros (negro cálido al 80-90% de opacidad). Esto permite que el mundo 3D siempre sea el protagonista visual, y que los elementos de UI floten sobre él sin competir.

### Sin bordes duros
Los paneles, burbujas y tarjetas usan esquinas redondeadas generosas (border-radius 12-16px). Los bordes son sutiles o inexistentes.

### Feedback inmediato
Cada acción del usuario genera una respuesta visual en menos de 100ms. Si algo tarda más, hay un indicador de carga mínimo y elegante.

### Microcopy en español natural
Todos los textos de interfaz están en español latinoamericano coloquial y cercano. Nunca traducciones literales del inglés.

Ejemplos:
- ❌ "Ingrese su dirección de correo electrónico"
- ✅ "Tu correo"
- ❌ "El usuario ha sido silenciado correctamente"
- ✅ "Ya no escuchas a esta persona"
- ❌ "Error de conexión al servidor"
- ✅ "Algo salió mal. Intenta de nuevo."

### Jerarquía de acciones
En cualquier pantalla, hay una sola acción primaria (botón grande, color terracota). Las acciones secundarias son más pequeñas y neutras. Las acciones destructivas (bloquear, reportar, salir) requieren confirmación.

---

## Accesibilidad básica (MVP)

- Contraste mínimo de texto: ratio 4.5:1 (WCAG AA)
- Todos los botones tienen tamaño mínimo de 44x44px (estándar táctil, aunque el MVP es PC)
- Los indicadores de estado (micrófono activo, etc.) no dependen solo del color — tienen también un ícono o forma diferente
- Los textos escalables respetan el zoom del sistema operativo

---

*La UI de Atlas debe sentirse como la ropa que llevas sin pensar. Cómoda, en su lugar, sin distraerte de lo que importa: las personas.*
