# Harrison — Ford Fiesta Kinetic 2012

## Objetivo

Página única de venta particular. El argumento de venta no es el auto: es el expediente. Trece años de comprobantes que coinciden con el odómetro. La página existe para que un comprador pueda verificar eso solo, sin preguntar nada.

## Tono

Español rioplatense, en primera persona cuando hace falta. Frases cortas y verificables. Nada de épica automotriz: el auto tiene 92.116 km y rayones, y la página los muestra.

## Dirección visual

- **Base gris frío** (`#dde0de`), del color de la chapa galvanizada. Contra ese fondo, todo documento aparece en **papel cálido** (`#f7f4ec`). El contraste frío/cálido es lo que hace leer los comprobantes como objetos físicos.
- **El amarillo es un resaltador, nunca un adorno.** Solo aparece marcando un dato sobre un comprobante y en las llamadas numeradas de la ficha. Si no señala un hecho, no va. La línea del gráfico va en celeste (`#7cc7f0`) para no competir con esas marcas.
- **Tipografía: Archivo** (Omnibus-Type, Buenos Aires), una sola familia usada en tres anchos: expandida para títulos, normal para texto, condensada con cifras tabulares para todo número. Los números son la voz de la página.
- **Dos dueños, dos colores.** La curva de kilómetros va gris mientras el auto fue de otro y celeste desde la compra, con el área bajo la curva igual. Los rótulos van dentro del área, no como globo.
- **Movimiento:** un solo gesto orquestado — la línea del gráfico se dibuja al entrar en pantalla, primero el tramo gris y después el propio. Todo lo demás responde a una acción de la persona. Respeta `prefers-reduced-motion`.
- Sin etiquetas en mayúsculas tracking-eadas, sin contadores `01 / 04`, sin tarjetas redondeadas uniformes.

## Arquitectura

1. Portada — foto, nombre, año / odómetro / registros / precio.
2. Fotos — vista giratoria de 7 cuadros + grilla de 15 fotos.
3. Ficha — perfil monocromo con 5 llamadas + lista de datos.
4. Historial — gráfico de km con popup de comprobante; tabla completa debajo.
5. Detalles — 5 primeros planos de imperfecciones, sin repetir la misma zona.
6. Cochera — el auto guardado bajo techo.
7. Precio — USD 9.500 y contacto.

## Reglas de contenido

- **Nada sin respaldo.** Motor, versión, año y medida de cubiertas salen de las facturas del concesionario, no de un aviso. Si un dato no está en un papel o en una foto, no se publica.
- **Ningún registro queda tapado.** Dos visitas con el mismo kilometraje y pocos días de diferencia comparten marcador: se agrupan, se marcan con un anillo y el popup muestra las dos. Nada se esconde para que el gráfico quede prolijo.
- **Lo estimado se dice estimado.** Los 7 registros sin kilometraje anotado muestran un valor interpolado, siempre con `~` y con la aclaración de que es una estimación. Nunca se presenta como una lectura real.
- **El odómetro manda.** La lectura actual (92.116 km) es mayor que el último service registrado (91.000 km); la página muestra las dos cosas y no las promedia.
- **Las anomalías se dejan a la vista.** El registro del 8 de mayo de 2013 anota menos kilómetros que el anterior. Se muestra como fue anotado, con la aclaración.
- **Los defectos no se esconden.** La sección Detalles es parte del argumento, no una concesión.
- **El respaldo es papel o es foto.** Un comprobante lleva resaltada la fecha y el kilometraje; una foto del trabajo lleva epígrafe y nada más. No se presenta una foto como si fuera un comprobante.
- **Los datos personales no se publican.** De los comprobantes se difumina DNI, teléfono y correo, y la patente de cualquier auto ajeno.

## Accesibilidad

- El gráfico tiene `role="img"` con un resumen, cada punto es un `button` con foco visible, y la tabla de abajo es el mismo contenido en forma accesible.
- El popup se abre con hover, con foco de teclado y con tap; se fija al hacer click y cierra con Escape.
- En pantallas chicas el popup pasa a ser una hoja fija abajo, y el gráfico se desplaza horizontalmente sin romper el layout.
