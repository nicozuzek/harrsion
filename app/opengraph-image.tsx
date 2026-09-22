import { ImageResponse } from 'next/og';
import { join } from 'node:path';
import { readFile } from 'node:fs/promises';
import data from '../content/car.json';

export const alt = 'Harrison · Ford Fiesta Kinetic 2012';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const n = (v: number) => new Intl.NumberFormat('es-AR').format(v);

// la foto no depende del request: se lee una sola vez
const foto = `data:image/jpeg;base64,${await readFile(join(process.cwd(), 'public/brand/og-auto.jpg'), 'base64')}`;

export default function OpenGraphImage() {
  const { vehiculo, services } = data;
  return new ImageResponse(
    <div style={{ display: 'flex', width: '100%', height: '100%', background: '#dde0de', color: '#16181a' }}>
      {/* foto a la derecha, se funde con el fondo por la izquierda */}
      <img src={foto} alt="" width={440} height={630} style={{ position: 'absolute', top: 0, right: 0 }} />
      <div
        style={{
          position: 'absolute',
          top: 0,
          right: 380,
          width: 60,
          height: 630,
          backgroundImage: 'linear-gradient(to right, #dde0de, rgba(221, 224, 222, 0))',
        }}
      />
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          width: 760,
          height: '100%',
          padding: '72px 0 72px 80px',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 150, fontWeight: 900, letterSpacing: -5, lineHeight: 1 }}>Harrison</span>
          <span style={{ fontSize: 34, color: '#4c4644', marginTop: 12 }}>
            {vehiculo.modelo} · {vehiculo.anio}
          </span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ display: 'flex', gap: 56 }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 20, color: '#6c7370' }}>Odómetro</span>
              <span style={{ fontSize: 52, fontWeight: 700 }}>{n(vehiculo.odometro)} km</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 20, color: '#6c7370' }}>Registros de service</span>
              <span style={{ fontSize: 52, fontWeight: 700 }}>{services.length}</span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 20, color: '#6c7370' }}>Precio</span>
            <span style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2, lineHeight: 1 }}>USD {n(vehiculo.precioUsd)}</span>
          </div>
        </div>
      </div>
    </div>,
    size,
  );
}
