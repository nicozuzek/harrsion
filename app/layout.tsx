import type { Metadata } from 'next';
import './globals.css';

const sitio = 'https://harrison-se-vende.vercel.app';
const titulo = 'Harrison · Ford Fiesta Kinetic 2012';
const bajada = 'Fiesta Titanium 2012, 92.116 km, con 23 registros de service documentados. USD 9.500.';

export const metadata: Metadata = {
  metadataBase: new URL(sitio),
  title: titulo,
  description: bajada,
  openGraph: { title: titulo, description: bajada, locale: 'es_AR', type: 'website' },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es-AR">
      <body>{children}</body>
    </html>
  );
}
