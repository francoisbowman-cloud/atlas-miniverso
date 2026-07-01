# User Journeys — Atlas MVP

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento vivo — actualizar con observaciones de usuarios reales

---

## Propósito

Este documento mapea cómo un usuario vive Atlas desde el primer momento en que escucha del producto hasta que regresa por segunda vez. Cada punto de contacto es una oportunidad para reforzar o destruir la experiencia.

Los journeys están organizados en dos niveles: el **Journey Principal** (común a todos los usuarios) y las **Variaciones por Arquetipo** (cómo cada persona vive los momentos clave de forma diferente).

---

## Journey Principal — Primera Experiencia

### Fase 1: Descubrimiento

El usuario escucha hablar de Atlas. En la fase MVP, esto ocurre principalmente por:

- Un amigo que lo invita directamente ("entra, que estamos aquí")
- Redes sociales (un post, un reel, un story de alguien conocido)
- Contenido de un creador early adopter (el arquetipo "Constructor de Comunidad")

**Emoción esperada:** curiosidad. "¿Qué es esto exactamente?"  
**Riesgo:** confusión. Si el mensaje de marketing no es claro, el usuario llega con expectativas equivocadas.

**Decisión de diseño:** el mensaje externo debe ser una sola oración que capture la esencia. Algo como: *"Entra a una cafetería virtual y conoce personas reales."* Sin mencionar avatares 3D, sin mencionar tecnología, sin mencionar Unreal Engine.

---

### Fase 2: Llegada al sitio web / landing

El usuario llega a la página de descarga o landing del MVP.

**Lo que debe ver en 5 segundos:**
- Qué es Atlas (en una oración)
- Cómo se ve (captura o video corto de la cafetería)
- Cómo entrar (un solo botón)

**Emoción esperada:** "Esto se ve bien. Quiero probarlo."  
**Riesgo:** sobrecarga de información, explicaciones largas, texto técnico.

**Decisión de diseño:** la landing page no explica funciones. Muestra la experiencia. Un video de 20 segundos de personas conversando en la cafetería vale más que mil palabras.

---

### Fase 3: Registro

El usuario descarga Atlas y comienza el registro.

**Flujo:**
1. Correo electrónico
2. Contraseña
3. Nombre de usuario
4. Verificación de correo (enlace simple)

**Tiempo objetivo:** menos de 90 segundos.

**Emoción esperada:** anticipación. "Ya casi entro."  
**Riesgo:** fricción. Cada campo adicional es una oportunidad para que el usuario abandone.

**Decisión de diseño:** no pedir nombre completo, teléfono, fecha de nacimiento ni foto de perfil en este paso. Solo lo mínimo para identificar al usuario. El perfil se completa después.

---

### Fase 4: Creación del avatar

El usuario personaliza su avatar por primera vez.

**Flujo:**
1. Selección de base (hombre / mujer / neutro)
2. Tono de piel
3. Peinado
4. Ropa de entre opciones predefinidas
5. Confirmación con vista previa en 3D

**Tiempo objetivo:** menos de 2 minutos.

**Emoción esperada:** identidad. "Este soy yo (o quien quiero ser aquí)."  
**Riesgo:** parálisis de elección si hay demasiadas opciones, o frustración si hay muy pocas.

**Decisión de diseño:** en el MVP, las opciones son limitadas pero bien diseñadas. No hay opciones feas. Cualquier combinación produce un avatar atractivo. El usuario puede cambiar su avatar después — no tiene que ser perfecto ahora.

---

### Fase 5: Entrada a la sala

El usuario entra a la Cafetería por primera vez.

**Lo que ocurre:**
- El avatar aparece en la entrada de la cafetería
- Hay personas presentes (o al menos actividad visible)
- Un mensaje breve de orientación aparece y desaparece: *"Muévete para acercarte a las personas. A mayor cercanía, más escuchas."*
- No hay tutorial largo ni pantalla de instrucciones

**Emoción esperada:** asombro tranquilo. "Esto se siente vivo."  
**Riesgo:** sala vacía en el momento de entrada, lo que destruye la primera impresión.

**Decisión de diseño crítica:** durante el MVP, la gestión de usuarios concurrentes es esencial. Si la sala tiene pocos usuarios, se deben concentrar en una zona visible, no dispersar. En el futuro, NPC de IA pueden ocupar el espacio, pero en el MVP la solución es comunitaria: hay que asegurar masa crítica en horarios clave mediante la comunidad inicial.

---

### Fase 6: Primera conversación

El usuario se acerca a alguien y ocurre la primera interacción.

**Escenario ideal:**
- El usuario camina hacia un grupo
- Empieza a escuchar la conversación
- Alguien del grupo lo saluda o él/ella toma la iniciativa
- Se produce la primera conversación real

**Emoción esperada:** conexión. "Esto funciona. Esto es real."  
**Riesgo:** torpeza social — el usuario no sabe cómo iniciar, nadie le habla, se queda parado y sale.

**Decisión de diseño:** los usuarios veteranos y early adopters deben ser entrenados informalmente para dar la bienvenida a caras nuevas. La cultura de la comunidad se siembra desde el primer día.

---

### Fase 7: Salida

El usuario cierra la aplicación.

**Escenario ideal:** sale porque tiene que hacer algo, no porque se aburrió.  
**Emoción esperada:** satisfacción. "Estuvo bien. Vuelvo mañana."

**Decisión de diseño:** no hay pantalla de "¿Ya te vas?" ni notificaciones intrusivas al salir. La salida es limpia. El usuario se va cuando quiere.

---

### Fase 8: Regreso

El usuario vuelve al día siguiente o en los próximos días.

**¿Qué lo hace regresar?**
- Personas específicas que quiere volver a ver
- Conversaciones que quedaron abiertas
- La simple costumbre de "pasar por la cafetería"

**Decisión de diseño:** en el MVP no hay notificaciones push. El regreso debe ser motivado por la experiencia misma, no por interrupciones externas. Si el usuario regresa sin ser empujado, la hipótesis empieza a validarse.

---

## Variaciones por arquetipo

### Camila (La Sociable Digital)

- Fase 4 (Avatar): invierte más tiempo del promedio. La personalización le importa.
- Fase 5 (Entrada): va directo al grupo más grande y activo.
- Fase 6 (Conversación): inicia ella. No espera que la saluden.
- Fase 8 (Regreso): regresa porque quedó de verse con alguien.

### Rafael (El Introvertido Conectado)

- Fase 5 (Entrada): se queda cerca de la entrada, observando.
- Fase 6 (Conversación): escucha conversaciones antes de acercarse. Tarda más en iniciar.
- Fase 7 (Salida): sale satisfecho aunque no haya hablado mucho — el simple hecho de estar fue suficiente.
- Fase 8 (Regreso): regresa por la conversación que finalmente tuvo, o porque quiere intentarlo de nuevo.

### Mariela (La Nostálgica Social)

- Fase 3 (Registro): puede necesitar más tiempo. El proceso debe ser simple y sin jerga técnica.
- Fase 5 (Entrada): lo primero que evalúa es cómo se ve el espacio. La estética importa más que en cualquier otro arquetipo.
- Fase 8 (Regreso): regresa a la misma hora del día siguiente, como rutina.

### Jorge (El Constructor de Comunidad)

- Fase 1 (Descubrimiento): llega antes que los demás — busca ser early adopter.
- Fase 5 (Entrada): en su segunda visita ya está saludando a los nuevos usuarios.
- Fase 8 (Regreso): regresa varias veces al día. Él mismo trae a otras personas.

---

## El momento de la verdad

De todos los momentos del journey, hay uno que determina si el usuario regresa o no:

> El instante en que entra a la sala por primera vez y decide si hay personas reales con quienes vale la pena quedarse.

Todo lo anterior lleva a ese momento. Todo lo posterior depende de él.

El MVP tiene una sola misión: hacer que ese momento sea memorable de forma positiva, consistentemente, para cada persona que entre.

---

*Este documento debe revisarse con datos reales de sesiones de usuario en cuanto existan. Ver `10_OPERATIONS/Meeting_Notes/` para hallazgos de investigación.*
