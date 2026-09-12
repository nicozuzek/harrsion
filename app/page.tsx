import fs from 'node:fs';
import path from 'node:path';
import data from '../content/services.json';
import HarrisonExperience, { type Asset, type Service } from './ui';

function assets(folder: string, recordFiles = false): Asset[] {
  const dir = path.join(process.cwd(), 'public/car', folder);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir).filter(name => !name.startsWith('.') && /\.(jpe?g|png|webp|avif|pdf)$/i.test(name)).sort((a,b)=>a.localeCompare(b, undefined, {numeric:true})).map(name => {
    const match = name.match(/^(\d{4}-\d{2}-\d{2})--(.+)$/); return { name, src: `/car/${folder}/${encodeURIComponent(name)}`, date: recordFiles ? match?.[1] : undefined, isPdf: /\.pdf$/i.test(name), label: name.replace(/^\d+[-_]?/, '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') };
  });
}
export default function Home() {
  const current = assets('current'); const details = assets('details'); const records = assets('records', true);
  return <HarrisonExperience services={data.services as Service[]} current={current} details={details} records={records} />;
}
