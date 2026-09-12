import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync(new URL('../content/services.json', import.meta.url)));
const services = data.services;
const errors = [];
const ids = new Set(); let previous = null;
services.forEach((s, i) => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s.date) || Number.isNaN(Date.parse(s.date))) errors.push(`services[${i}] invalid date`);
  if (ids.has(s.id)) errors.push(`duplicate id: ${s.id}`); ids.add(s.id);
  if (s.mileage != null && previous != null && s.mileage < previous && !s.mileageAnomaly) errors.push(`mileage decreases at ${s.id}`);
  if (s.mileage != null) previous = s.mileage;
});
if (services.length !== 23) errors.push(`expected 23 services, found ${services.length}`);
if (errors.length) { console.error(errors.join('\n')); process.exit(1); }
console.log(`Content OK: ${services.length} services, ${services.filter(s=>s.mileage != null).length} mileage readings.`);
