import type { Metadata } from 'next';
import './globals.css';

const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;

export const metadata: Metadata = { metadataBase: new URL(productionHost ? `https://${productionHost}` : 'http://localhost:3000'), title: 'Harrison · Ford Fiesta 2012', description: 'Historia documentada y detalles del Ford Fiesta 2012 de Harrison.', openGraph: { title: 'Harrison · Ford Fiesta 2012', description: 'Una historia de mantenimiento, cuidada y transparente.' } };
export default function RootLayout({ children }: Readonly<{children: React.ReactNode}>) { return <html lang="es"><body>{children}</body></html>; }
