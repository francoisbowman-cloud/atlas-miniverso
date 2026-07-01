# UX Principles — Atlas

**Versión:** 1.0  
**Fecha:** 2026-06-28  
**Estado:** Documento fundacional — estos principios guían cada decisión de diseño

---

## Propósito

Estos principios son el filtro de diseño de Atlas. Antes de que cualquier elemento de interfaz, flujo o interacción sea implementado, debe poder justificarse en términos de al menos uno de estos principios.

No son aspiraciones. Son criterios de evaluación.

---

## Principio 1 — La interfaz debe desaparecer

El mejor diseño de Atlas es el que el usuario no nota. La interfaz es un obstáculo necesario entre el usuario y la experiencia social. Nuestra misión es hacer ese obstáculo lo más pequeño posible.

**En la práctica:**
- Botones mínimos visibles en pantalla durante la sesión
- Tipografía legible pero discreta
- Sin paneles, menús o ventanas que interrumpan la vista de la sala
- Las acciones más frecuentes deben requerir el menor número de pasos

**Pregunta de evaluación:** *¿Este elemento de UI es absolutamente necesario para que el usuario haga lo que necesita hacer?*

---

## Principio 2 — El espacio comunica antes que la interfaz

El usuario debe entender el ambiente de una sala antes de leer un solo texto. El diseño visual, el audio ambiental y la distribución de objetos deben transmitir la emoción del espacio por sí solos.

**En la práctica:**
- La Cafetería debe sentirse tranquila y cálida antes de que el usuario hable con alguien
- El audio ambiental es parte del diseño, no un detalle
- La iluminación define el tono emocional de cada sala
- Los objetos decorativos deben propiciar interacción social (mesas para sentarse juntos, barras donde acercarse)

**Pregunta de evaluación:** *Si un usuario mudo con auriculares apagados entra a esta sala, ¿siente la emoción correcta?*

---

## Principio 3 — La proximidad es el lenguaje del producto

El sistema de proximidad no es solo una función técnica. Es el idioma con el que Atlas habla de distancia social, de invitación y de privacidad. Cada decisión de diseño del sistema de proximidad debe tratarse con la misma seriedad que el diseño visual.

**En la práctica:**
- El rango de proximidad debe calibrarse para que se sienta natural, no arbitrario
- Acercarse a alguien debe sentirse como un gesto social real, no como activar una función
- El desvanecimiento de voz con la distancia debe ser gradual y realista
- El usuario debe poder comunicar "no quiero ser interrumpido" sin usar menús

**Pregunta de evaluación:** *¿Esta decisión de proximidad refleja cómo las personas se relacionan en un espacio físico real?*

---

## Principio 4 — La fricción mata la conexión

Cada paso adicional entre el usuario y la conversación es una oportunidad perdida. La fricción más peligrosa no es la técnica — es la social. Un usuario que no sabe cómo iniciar una conversación se irá sin haber tenido ninguna.

**En la práctica:**
- El registro debe completarse en menos de 90 segundos
- El avatar debe configurarse en menos de 2 minutos
- Entrar a la sala no requiere tutoriales obligatorios
- Hablar con alguien no requiere "solicitudes de amistad" ni permisos previos

**Pregunta de evaluación:** *¿Cuántos pasos separan al usuario de su primera conversación? ¿Podemos reducirlo?*

---

## Principio 5 — El silencio es parte de la experiencia

No todas las interacciones son conversaciones. Estar en la sala sin hablar es una forma válida y valiosa de usar Atlas. El diseño debe hacer que el silencio sea cómodo, no incómodo.

**En la práctica:**
- El avatar en estado idle debe tener animaciones sutiles y naturales (respiración, mirar alrededor)
- La sala debe sentirse viva aunque el usuario no esté hablando
- No hay presión visual ni auditiva para participar activamente
- "Observar" es una acción legítima y debe ser posible sin sentirse invisible

**Pregunta de evaluación:** *¿Un usuario que entra y no habla con nadie durante 10 minutos está teniendo una experiencia positiva?*

---

## Principio 6 — La calidez es una decisión técnica

La sensación de calidez no surge solo del diseño visual. Surge de la combinación de paleta de color, iluminación, audio, velocidad de respuesta, fluidez de animación y tono del texto en la interfaz. Todo comunica.

**En la práctica:**
- Los textos de interfaz usan lenguaje humano, no técnico ("Bienvenido a la cafetería", no "Conectado al servidor")
- Los errores se comunican con empatía, no con códigos
- Las animaciones son fluidas y orgánicas, no robóticas o mecánicas
- La paleta de color de la UI complementa el ambiente de la sala, no lo contrasta

**Pregunta de evaluación:** *¿Este texto / animación / color hace que el usuario se sienta bienvenido?*

---

## Principio 7 — El usuario tiene el control de su privacidad

En un espacio donde las personas se escuchan por proximidad, la privacidad no es una función secundaria. Es infraestructura fundamental. El usuario debe sentir en todo momento que puede controlar quién lo escucha y quién puede acercarse.

**En la práctica:**
- Silenciar a un usuario individual debe ser posible en un máximo de 2 toques
- Bloquear a un usuario elimina toda posibilidad de interacción entre ambos
- El usuario puede ajustar su radio de proximidad (cuánto quiere escuchar y ser escuchado)
- Los estados de presencia (disponible, ocupado, ausente) son visibles y respetados

**Pregunta de evaluación:** *¿El usuario se siente seguro en este espacio?*

---

## Principio 8 — La consistencia construye confianza

Un producto inconsistente genera ansiedad. Cuando el usuario no puede predecir cómo se comporta la interfaz, dedica energía mental a descifrarla en lugar de disfrutar la experiencia social.

**En la práctica:**
- Los mismos gestos producen los mismos resultados en toda la aplicación
- El vocabulario es consistente — si algo se llama "sala" en un lugar, se llama "sala" en todos
- Las animaciones del avatar se comportan de forma predecible
- El sistema de proximidad funciona igual en cada rincón de la sala

**Pregunta de evaluación:** *¿Si el usuario aprendió a hacer algo de una forma, esa misma forma funciona en otro contexto?*

---

## Cómo usar estos principios

Cuando se evalúe una decisión de diseño — ya sea una función nueva, un flujo de onboarding, un botón, un texto o una animación — el equipo debe hacerse estas preguntas:

1. ¿Hace que la interfaz desaparezca o que sea más visible?
2. ¿El espacio comunica por sí solo o depende de texto para explicarse?
3. ¿Respeta y refuerza el lenguaje de proximidad?
4. ¿Añade o elimina fricción en el camino hacia la conexión?
5. ¿Hace que el silencio sea cómodo o incómodo?
6. ¿Contribuye a la calidez general del producto?
7. ¿El usuario mantiene el control de su privacidad?
8. ¿Es consistente con lo que el usuario ya aprendió?

Si la respuesta a varias de estas preguntas es negativa, la decisión debe revisarse.

---

*Estos principios son complementarios al Manifesto y la Constitution. El Manifesto dice qué somos. La Constitution dice qué no haremos. Los UX Principles dicen cómo diseñamos.*
