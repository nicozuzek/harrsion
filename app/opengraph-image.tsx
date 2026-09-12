import { ImageResponse } from 'next/og';

export const alt = 'Harrison · Ford Fiesta 2012';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        alignItems: 'center',
        background: '#06192b',
        color: 'white',
        display: 'flex',
        height: '100%',
        justifyContent: 'space-between',
        padding: '74px 82px',
        width: '100%',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 760 }}>
        <div style={{ color: '#79b5ee', fontSize: 22, letterSpacing: 6, marginBottom: 44 }}>
          HARRISON · 2012
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 104, fontWeight: 700, letterSpacing: -4, lineHeight: 0.9 }}>
          <span>Ford Fiesta</span>
          <span style={{ color: '#79b5ee' }}>Una historia documentada.</span>
        </div>
      </div>
      <div style={{ alignItems: 'flex-end', display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: 18, letterSpacing: 3 }}>ÚLTIMO REGISTRO</span>
        <span style={{ fontSize: 64, fontWeight: 700, marginTop: 8 }}>91.000 KM</span>
        <span style={{ color: '#b9d6ed', fontSize: 22, marginTop: 18 }}>USD 10.000</span>
      </div>
    </div>,
    size,
  );
}
