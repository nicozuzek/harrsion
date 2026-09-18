import { ImageResponse } from 'next/og';
import data from '../content/car.json';

export const alt = 'Harrison · Ford Fiesta Kinetic 2012';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const n = (v: number) => new Intl.NumberFormat('es-AR').format(v);

export default function OpenGraphImage() {
  const { vehiculo, services } = data;
  return new ImageResponse(
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        width: '100%',
        height: '100%',
        padding: '72px 80px',
        background: '#dde0de',
        color: '#16181a',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 150, fontWeight: 900, letterSpacing: -5, lineHeight: 1 }}>Harrison</span>
        <span style={{ fontSize: 34, color: '#4c4644', marginTop: 12 }}>
          {vehiculo.modelo} · {vehiculo.anio}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
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
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <span style={{ fontSize: 20, color: '#6c7370' }}>Precio</span>
          <span style={{ fontSize: 72, fontWeight: 900, letterSpacing: -2 }}>USD {n(vehiculo.precioUsd)}</span>
        </div>
      </div>
    </div>,
    size,
  );
}
