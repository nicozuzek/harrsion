# Harrison · Ford Fiesta Kinetic 2012

Página de venta particular, en español, para un Ford Fiesta Kinetic Design Titanium 2012. Next.js, estática, deployable a Vercel.

## Estructura de la página

1. **Portada** — foto a sangre, nombre y los cuatro datos duros (año, odómetro, registros, precio).
2. **Fotos** — vista giratoria de 7 cuadros (slider o arrastre) y grilla con las 15 fotos restantes. Click abre el visor.
3. **Especificaciones** — perfil del auto en blanco y negro con llamadas numeradas, la lista de datos y el equipamiento destacado (los 7 airbags nombrados uno por uno, ESP/ABS, arranque en pendiente, techo solar, espejos).
4. **Historial** — gráfico de kilometraje. Cada punto es un service; al pasar el mouse o tocarlo se abre el respaldo con la fecha y el kilometraje resaltados en amarillo. Los registros sin kilometraje anotado cuelgan de un tallo punteado hasta la curva, con el valor **estimado** por interpolación entre los dos registros que los rodean. Los registros que caen casi en el mismo punto (mismo km y pocos días de diferencia) se agrupan en un solo marcador —con un anillo alrededor— y el popup los lista a los dos; además cada marcador calcula su radio de click para que nunca se pisen. La curva va gris hasta los ~54.000 km con que se compró el auto y celeste desde ahí; el área bajo la curva sigue el mismo corte, con un rótulo por tramo. Debajo, la tabla con los 23 registros.
5. **Detalles** — primeros planos de las marcas que tiene el auto. Los que tienen una `historia` detrás muestran un botón **(i)** en la esquina que abre las fotos de contexto con su explicación.
6. **Cochera** — fotos del auto guardado bajo techo.
7. **Precio** — USD 9.500 y el mail de contacto.

## Contenido

Todo el contenido vive en `content/car.json`. No hay CMS ni base de datos.

- `vehiculo` — datos del auto, odómetro y precio.
- `fotos` / `detalles` / `mejoras` — archivos en `public/car/fotos/`, `public/car/detalles/` y `public/car/mejoras/`, con `label`, `nota` y dimensiones. `mejoras` ya no tiene sección propia: la primera entrada con `historia` alimenta la ventana "Tuercas de acero macizo" de Especificaciones. El popup de "7 airbags" sale de `equipamiento[0]`.
- `giro` — los cuadros de la vuelta al auto, en `public/car/giro/`, **en orden de giro**. El slider los recorre en ese orden.
- `cochera` — fotos de las cocheras, en `public/car/cochera/`.
- `equipamiento` — el equipamiento destacado. Un item con `lista` se muestra a ancho completo y numerado (los airbags).
- `detalles[].historia` / `mejoras[].historia` — opcional: `{ carpeta, titulo, texto, enlace?, fotos[] }`. Dispara el botón (i) y el visor con texto. Las fotos viven en `public/car/<carpeta>/`.
- `services` — los 23 registros. Cada uno puede tener `scans`, y cada scan lleva sus `highlights`. El campo opcional `contexto` es un párrafo que explica la reparación; aparece sólo en el popup del gráfico.
- `vehiculo.compraKm` — kilometraje con el que se compró el auto. La fecha de la marca en el gráfico se deduce cruzando ese valor con la curva, no está guardada.

Cada `scan` tiene un `tipo`:

- `comprobante` — el papel del taller, en `public/car/comprobantes/`. Lleva `highlights` sobre la fecha y el kilometraje.
- `foto` — foto del trabajo hecho, en `public/car/trabajos/`. Lleva `label` (epígrafe) y `highlights: []`.

Dentro de cada registro los documentos van primero; el visor los pagina con las flechas.

### Highlights de los comprobantes

Un `highlight` es un rectángulo en coordenadas normalizadas (0–1) sobre la imagen del comprobante:

```json
{ "kind": "date", "x": 0.548, "y": 0.079, "w": 0.119, "h": 0.023 }
```

Se dibuja como un `<span>` amarillo con `mix-blend-mode: multiply`, así que se ve como un resaltador sobre el papel. La imagen original no se toca.

Los archivos de `public/car/comprobantes/` se guardan ya rotados y sin EXIF: el optimizador de imágenes de Next descarta la orientación EXIF, y si el archivo dependiera de ese flag las coordenadas de los highlights caerían en el lugar equivocado.

El contenedor `.escaneo` tiene que medir **exactamente** lo mismo que la imagen: los highlights se posicionan en porcentaje sobre ese contenedor, así que si la imagen queda apaisada dentro de una caja más ancha (por ejemplo con `object-fit: contain`), las marcas se corren y se estiran.

## Desarrollo

```bash
npm install
npm run validate:content   # revisa fechas, ids, km, archivos y rangos de highlights
npm run dev
npm run build
```

`validate:content` falla si un respaldo apunta a un archivo que no existe, si un highlight se sale de 0–1, si una foto de trabajo no tiene epígrafe, o si el kilometraje baja sin `mileageAnomaly`.

## Datos personales

Los comprobantes de Norauto traen DNI, teléfono y correo del titular. Antes de publicarlos se difumina ese bloque; el nombre queda. Lo mismo con la patente de autos ajenos y con **la cara de cualquier persona** que aparezca en las fotos: la toma de la cámara de seguridad del incidente va con la cara difuminada. Si agregás una foto nueva, revisá esto primero.
