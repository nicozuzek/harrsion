import fs from 'node:fs';
import path from 'node:path';

const data = JSON.parse(fs.readFileSync(new URL('../content/car.json', import.meta.url)));
const errores = [];
const ids = new Set();
let previo = null;

data.services.forEach((s, i) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date)) errores.push(`services[${i}]: fecha inválida`);
  if (ids.has(s.id)) errores.push(`id duplicado: ${s.id}`);
  ids.add(s.id);
  if (s.mileage != null && previo != null && s.mileage < previo && !s.mileageAnomaly)
    errores.push(`el kilometraje baja en ${s.id} sin marcar mileageAnomaly`);
  if (s.mileage != null) previo = s.mileage;
  for (const scan of s.scans ?? []) {
    if (!fs.existsSync(path.join('public', scan.src))) errores.push(`falta el archivo ${scan.src}`);
    if (!['comprobante', 'foto'].includes(scan.tipo)) errores.push(`tipo inválido en ${s.id}: ${scan.tipo}`);
    if (scan.tipo === 'foto' && !scan.label) errores.push(`falta el epígrafe de ${scan.src}`);
    for (const h of scan.highlights)
      if ([h.x, h.y, h.w, h.h].some((v) => v < 0 || v > 1)) errores.push(`resalte fuera de rango en ${s.id}`);
  }
});

for (const [carpeta, lista] of [['fotos', data.fotos], ['detalles', data.detalles], ['giro', data.giro], ['cochera', data.cochera]])
  for (const a of lista)
    if (!fs.existsSync(path.join('public/car', carpeta, a.file))) errores.push(`falta la foto ${carpeta}/${a.file}`);

if (data.vehiculo.odometro < previo) errores.push('el odómetro es menor que el último service');

if (errores.length) {
  console.error(errores.join('\n'));
  process.exit(1);
}
const conRespaldo = data.services.filter((s) => s.scans).length;
const todos = data.services.flatMap((s) => s.scans ?? []);
console.log(
  `Contenido OK: ${data.services.length} registros, ${conRespaldo} con respaldo ` +
    `(${todos.filter((x) => x.tipo === 'comprobante').length} documentos + ${todos.filter((x) => x.tipo === 'foto').length} fotos de trabajos). ` +
    `${data.fotos.length} fotos, ${data.giro.length} cuadros de giro, ${data.detalles.length} detalles, ${data.cochera.length} de cochera.`,
);
