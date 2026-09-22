'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronLeft, ChevronRight, Info, Mail, RotateCw, X, ZoomIn, ZoomOut } from 'lucide-react';

export type Resalte = { kind: 'date' | 'km'; x: number; y: number; w: number; h: number };
export type Escaneo = { src: string; w: number; h: number; highlights: Resalte[]; tipo: 'comprobante' | 'foto'; label?: string };
export type Servicio = {
  id: string;
  contexto?: string;
  date: string;
  workshop: string;
  category: string;
  notes: string;
  mileage?: number;
  mileageAnomaly?: boolean;
  scans?: Escaneo[];
};
export type Historia = {
  carpeta: string;
  titulo: string;
  texto: string;
  enlace?: { texto: string; url: string };
  fotos: Foto[];
};
export type Foto = { file: string; label: string; w: number; h: number; shot?: string; nota?: string; historia?: Historia };
export type Cuadro = { file: string; label: string; w: number; h: number };
export type Cochera = { file: string; label: string; w: number; h: number };
export type Equipo = { titulo: string; detalle: string; lista?: string[] };
export type Vehiculo = {
  nombre: string;
  modelo: string;
  anio: number;
  puertas: number;
  motor: string;
  caja: string;
  odometro: number;
  odometroFecha: string;
  cubiertas: string;
  compraKm?: number;
  precioUsd: number;
  contacto: string;
};

const km = (n: number) => new Intl.NumberFormat('es-AR').format(n);
const usd = (n: number) => new Intl.NumberFormat('es-AR').format(n);
const fecha = (d: string) =>
  new Intl.DateTimeFormat('es-AR', { day: 'numeric', month: 'short', year: 'numeric' }).format(new Date(`${d}T12:00:00`));
const anio = (d: string) => d.slice(0, 4);

/* Ficha técnica: la lista de la derecha; dos ítems abren una ventana con detalle. */
type Ventana = 'airbags' | 'tuercas' | 'polarizado';
const ESPECIFICACIONES: { titulo: string; agregado?: boolean; ventana?: Ventana }[] = [
  { titulo: 'Motor 1.6' },
  { titulo: 'Caja manual de 5ta' },
  { titulo: '7 airbags', ventana: 'airbags' },
  { titulo: 'Control de estabilidad y ESP' },
  { titulo: 'Asistente de arranque en pendiente' },
  { titulo: 'Techo solar eléctrico' },
  { titulo: 'Luces ambiente en el interior' },
  { titulo: 'Espejo retrovisor electrocrómico' },
  { titulo: 'Dirección eléctrica' },
  { titulo: 'Espejos exteriores con visor de punto ciego' },
  { titulo: 'Polarizado antivandálico marca Strong', agregado: true, ventana: 'polarizado' },
  { titulo: 'Kit luces xenón', agregado: true },
  { titulo: 'Sensores de estacionamiento traseros', agregado: true },
  { titulo: 'Tuercas de acero macizo', agregado: true, ventana: 'tuercas' },
];
const NOTAS: Record<string, string> = {
  'Kit luces xenón': 'Viene desinstalado',
  'Sensores de estacionamiento traseros': 'Agregados en agencia',
};

/* Botón "Escribirme": copia el mail al portapapeles y avisa un momento. */
function Copiar({ email }: { email: string }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(email);
      } else {
        const t = document.createElement('textarea');
        t.value = email;
        t.setAttribute('readonly', '');
        t.style.position = 'fixed';
        t.style.opacity = '0';
        document.body.appendChild(t);
        t.select();
        document.execCommand('copy');
        t.remove();
      }
      setCopiado(true);
      window.setTimeout(() => setCopiado(false), 2200);
    } catch {
      // si el portapapeles falla, al menos que el mail quede a la vista
      window.prompt('Copiá el mail:', email);
    }
  };
  return (
    <button type="button" className={`boton${copiado ? ' copiado' : ''}`} onClick={copiar} aria-live="polite">
      {copiado ? <><Check size={17} /> {email} copiado</> : <><Mail size={17} /> Escribirme</>}
    </button>
  );
}

function Giro({ cuadros }: { cuadros: Cuadro[] }) {
  const [i, setI] = useState(0);
  const arrastre = useRef<{ x: number; desde: number } | null>(null);
  const total = cuadros.length;

  useEffect(() => {
    const up = () => { arrastre.current = null; };
    const move = (e: PointerEvent) => {
      const a = arrastre.current;
      if (!a) return;
      // media pantalla de recorrido = una vuelta entera
      const paso = Math.round(((e.clientX - a.x) / (window.innerWidth * 0.5)) * total);
      setI((((a.desde + paso) % total) + total) % total);
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    window.addEventListener('pointermove', move);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      window.removeEventListener('pointermove', move);
    };
  }, [total]);

  return (
    <div className="giro">
      <div
        className="giro-escena"
        onPointerDown={(e) => { arrastre.current = { x: e.clientX, desde: i }; }}
        role="group"
        aria-label={`Vista giratoria del auto, cuadro ${i + 1} de ${total}`}
      >
        {cuadros.map((c, n) => (
          <Image
            key={c.file}
            className={n === i ? 'visible' : undefined}
            src={`/car/giro/${c.file}`}
            alt={n === i ? `${c.label}. Cuadro ${n + 1} de ${total}.` : ''}
            width={c.w}
            height={c.h}
            loading="eager"
            sizes="(max-width: 860px) 100vw, 1200px"
            draggable={false}
          />
        ))}
      </div>
      <div className="giro-pista">
        <button onClick={() => setI((i + 1) % cuadros.length)} aria-label="Girar un cuadro">
          <RotateCw size={15} />
        </button>
        <input
          type="range"
          min={0}
          max={total - 1}
          value={i}
          onChange={(e) => setI(+e.target.value)}
          aria-label="Girar el auto"
        />
        <span className="giro-cuenta dato">{i + 1} / {total}</span>
      </div>
    </div>
  );
}

function Escaneado({ escaneo, alt }: { escaneo: Escaneo; alt: string }) {
  return (
    <div className="escaneo">
      <Image src={escaneo.src} alt={alt} width={escaneo.w} height={escaneo.h} sizes="(max-width: 860px) 60vw, 700px" />
      {escaneo.highlights.map((h, i) => (
        <span
          key={i}
          className="resalte"
          style={{ left: `${h.x * 100}%`, top: `${h.y * 100}%`, width: `${h.w * 100}%`, height: `${h.h * 100}%` }}
        />
      ))}
    </div>
  );
}

type Vista =
  | { tipo: 'foto'; lista: Foto[]; i: number; carpeta: string }
  | { tipo: 'escaneo'; lista: Escaneo[]; i: number; pie: string }
  | { tipo: 'historia'; lista: Foto[]; i: number; carpeta: string; historia: Historia };

function Tarjetas({ lista, carpeta, abrir }: { lista: Foto[]; carpeta: string; abrir: (v: Vista) => void }) {
  if (!lista.length) return <p className="vacio">Agregá imágenes a public/car/{carpeta}/ para mostrarlas acá.</p>;
  return (
    <div className="detalles-grid">
      {lista.map((f, i) => (
        <div key={f.file} className="detalle">
          <button className="detalle-foto" onClick={() => abrir({ tipo: 'foto', lista, i, carpeta })} aria-label={`Ampliar: ${f.label}`}>
            <Image src={`/car/${carpeta}/${f.file}`} alt={f.label} width={f.w} height={f.h} sizes="(max-width: 860px) 90vw, 380px" />
          </button>
          {f.historia && (
            <button
              className="detalle-info"
              onClick={() => abrir({ tipo: 'historia', lista: f.historia!.fotos, i: 0, carpeta: f.historia!.carpeta, historia: f.historia! })}
              aria-label={`${f.historia.titulo}. Ver ${f.historia.fotos.length} fotos.`}
            >
              <Info size={16} />
            </button>
          )}
          <strong>{f.label}</strong>
        </div>
      ))}
    </div>
  );
}

function Ventana({ titulo, cerrar, children }: { titulo: string; cerrar: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrar(); };
    window.addEventListener('keydown', tecla);
    return () => {
      document.body.style.overflow = previo;
      window.removeEventListener('keydown', tecla);
    };
  }, [cerrar]);

  return (
    <div className="visor" role="dialog" aria-modal="true" aria-label={titulo} onClick={cerrar}>
      <div className="ventana" onClick={(e) => e.stopPropagation()}>
        <button className="visor-cerrar" onClick={cerrar} aria-label="Cerrar"><X size={20} /></button>
        <h3>{titulo}</h3>
        {children}
      </div>
    </div>
  );
}

function Visor({ vista, cerrar, mover }: { vista: Vista; cerrar: () => void; mover: (d: number) => void }) {
  // con el visor abierto la página de atrás no se mueve
  useEffect(() => {
    const previo = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = previo; };
  }, []);

  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrar();
      if (e.key === 'ArrowRight') mover(1);
      if (e.key === 'ArrowLeft') mover(-1);
    };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [vista, cerrar, mover]);

  const actual = vista.lista[vista.i];
  const pie =
    vista.tipo === 'escaneo'
      ? [vista.pie, (actual as Escaneo).label].filter(Boolean).join(' · ')
      : (actual as Foto).label;
  const varias = vista.lista.length > 1;

  return (
    <div className={`visor${vista.tipo === 'historia' ? ' visor-con-historia' : ''}`} role="dialog" aria-modal="true" aria-label={pie} onClick={cerrar}>
      <figure className="visor-marco" onClick={(e) => e.stopPropagation()}>
        <div className="visor-media">
          <button className="visor-cerrar" onClick={cerrar} aria-label="Cerrar"><X size={20} /></button>
          {vista.tipo !== 'escaneo' ? (
            <Image
              src={`/car/${vista.carpeta}/${(actual as Foto).file}`}
              alt={(actual as Foto).label}
              width={actual.w}
              height={actual.h}
              sizes="100vw"
            />
          ) : (
            <Escaneado escaneo={actual as Escaneo} alt={pie} />
          )}
          {varias && (
            <>
              <button className="visor-nav prev" onClick={() => mover(-1)} aria-label="Anterior"><ChevronLeft size={22} /></button>
              <button className="visor-nav sig" onClick={() => mover(1)} aria-label="Siguiente"><ChevronRight size={22} /></button>
            </>
          )}
        </div>
        <figcaption>
          {pie}
          {varias && <span className="visor-cuenta dato"> {vista.i + 1} / {vista.lista.length}</span>}
        </figcaption>
        {vista.tipo === 'historia' && (
          <div className="visor-historia">
            <h3>{vista.historia.titulo}</h3>
            <p>{vista.historia.texto}</p>
            {vista.historia.enlace && (
              <a href={vista.historia.enlace.url} target="_blank" rel="noreferrer noopener">
                {vista.historia.enlace.texto}
              </a>
            )}
          </div>
        )}
      </figure>
    </div>
  );
}

// el gráfico tiene dos sistemas de coordenadas: uno ancho para escritorio y uno
// compacto para el teléfono en vertical, donde entra a lo ancho sin scroll
const DIMS = {
  amplio: { ANCHO: 1000, ALTO: 420, PAD: { izq: 76, der: 26, arr: 28, aba: 64 } },
  compacto: { ANCHO: 560, ALTO: 480, PAD: { izq: 70, der: 18, arr: 36, aba: 80 } },
};

function useCompacto() {
  const [compacto, setCompacto] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 860px)');
    const leer = () => setCompacto(mq.matches);
    leer();
    mq.addEventListener('change', leer);
    return () => mq.removeEventListener('change', leer);
  }, []);
  return compacto;
}

export default function Pagina({
  vehiculo,
  fotos,
  giro,
  detalles,
  mejoras,
  cochera,
  equipamiento,
  services,
}: {
  vehiculo: Vehiculo;
  fotos: Foto[];
  giro: Cuadro[];
  detalles: Foto[];
  mejoras: Foto[];
  cochera: Cochera[];
  equipamiento: Equipo[];
  services: Servicio[];
}) {
  const compacto = useCompacto();
  const { ANCHO, ALTO, PAD } = compacto ? DIMS.compacto : DIMS.amplio;
  const [vista, setVista] = useState<Vista | null>(null);
  const [activo, setActivo] = useState<string | null>(null);
  const [fijo, setFijo] = useState(false);
  const [soloPropio, setSoloPropio] = useState(false);
  const [ventana, setVentana] = useState<Ventana | null>(null);
  const airbags = equipamiento.find((e) => e.lista);
  const tuercas = mejoras.find((m) => m.historia)?.historia;
  const abrirVentana = (v: Ventana) => {
    if (v === 'tuercas' && tuercas) setVista({ tipo: 'historia', lista: tuercas.fotos, i: 0, carpeta: tuercas.carpeta, historia: tuercas });
    else setVentana(v);
  };
  const [dibujado, setDibujado] = useState(false);
  const caja = useRef<HTMLDivElement>(null);

  const conKm = useMemo(() => services.filter((s) => s.mileage), [services]);
  const sinKm = useMemo(() => services.filter((s) => !s.mileage), [services]);

  const { ejeX, ejeY, tramos, base, ultimo, marcadores, marcasEstimadas, compra, cantidadEstimados } = useMemo(() => {
    const t = (f: string) => new Date(`${f}T12:00:00`).getTime();
    const odo = { fecha: vehiculo.odometroFecha, km: vehiculo.odometro };
    const crudos = [
      ...conKm.map((s) => ({ id: s.id, fecha: s.date, km: s.mileage!, servicio: s })),
      { id: 'odometro', fecha: odo.fecha, km: odo.km, servicio: null as Servicio | null },
    ];
    const tTotal0 = t(crudos[0].fecha);
    const t1 = t(crudos[crudos.length - 1].fecha);
    // fecha aproximada en la que el odómetro cruzó los km de compra
    const fechaEnKm = (k: number) => {
      for (let i = 1; i < crudos.length; i++) {
        const a = crudos[i - 1], b = crudos[i];
        if (k <= b.km) {
          const salto = b.km - a.km;
          const r = salto ? (k - a.km) / salto : 0;
          return t(a.fecha) + r * (t(b.fecha) - t(a.fecha));
        }
      }
      return t1;
    };
    const kmCompra = vehiculo.compraKm;
    const fechaCompra = kmCompra ? fechaEnKm(kmCompra) : null;
    const t0 = soloPropio && fechaCompra ? fechaCompra : tTotal0;
    const pasoKm = soloPropio ? 10000 : 20000;
    const kmMin = soloPropio && kmCompra ? Math.floor(kmCompra / pasoKm) * pasoKm : 0;
    const maximoCrudo = Math.max(...crudos.map((p) => p.km));
    const kmMax = Math.max(kmMin + pasoKm, Math.ceil(maximoCrudo / pasoKm) * pasoKm);
    const pxMs = (valor: number) => PAD.izq + ((valor - t0) / (t1 - t0)) * (ANCHO - PAD.izq - PAD.der);
    const px = (f: string) => pxMs(t(f));
    const py = (k: number) => ALTO - PAD.aba - ((k - kmMin) / (kmMax - kmMin)) * (ALTO - PAD.arr - PAD.aba);
    const puntosTodos = crudos.map((p) => ({ ...p, cx: px(p.fecha), cy: py(p.km) }));
    const puntos = soloPropio && fechaCompra
      ? puntosTodos.filter((p) => t(p.fecha) >= fechaCompra)
      : puntosTodos;
    const compra = kmCompra
      ? {
          km: kmCompra,
          cx: pxMs(fechaCompra!),
          cy: py(kmCompra),
        }
      : null;

    const puntosLinea = soloPropio && compra && fechaCompra
      ? [compra, ...puntos.filter((p) => t(p.fecha) > fechaCompra)]
      : puntos;
    const base = ALTO - PAD.aba;
    const linea = (pts: { cx: number; cy: number }[]) =>
      pts.map((p, i) => `${i ? 'L' : 'M'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ');
    const areaDe = (pts: { cx: number; cy: number }[]) =>
      `${linea(pts)} L ${pts[pts.length - 1].cx.toFixed(1)} ${base} L ${pts[0].cx.toFixed(1)} ${base} Z`;

    // km leído sobre la recta que une los dos registros que rodean esa fecha
    const kmEnFecha = (f: string) => {
      const x = t(f);
      for (let i = 1; i < crudos.length; i++) {
        const a = crudos[i - 1], b = crudos[i];
        if (x <= t(b.fecha)) {
          const r = (x - t(a.fecha)) / (t(b.fecha) - t(a.fecha));
          return a.km + r * (b.km - a.km);
        }
      }
      return crudos[crudos.length - 1].km;
    };

    const estimados = sinKm
      .filter((s) => t(s.date) >= t0)
      .map((s) => {
        const km = kmEnFecha(s.date);
        return { s, km, cx: px(s.date), cy: py(km) };
      });

    // dos tramos: hasta la compra y desde la compra
    let tramos: { d: string; area: string; x0: number; x1: number }[];
    if (compra && !soloPropio) {
      const corte = puntos.findIndex((p) => p.cx >= compra.cx);
      const antes = [...puntos.slice(0, Math.max(corte, 1)), compra];
      const despues = [compra, ...puntos.slice(Math.max(corte, 1))];
      tramos = [
        { d: linea(antes), area: areaDe(antes), x0: antes[0].cx, x1: compra.cx },
        { d: linea(despues), area: areaDe(despues), x0: compra.cx, x1: despues[despues.length - 1].cx },
      ];
    } else {
      tramos = [{ d: linea(puntosLinea), area: areaDe(puntosLinea), x0: puntosLinea[0].cx, x1: puntosLinea[puntosLinea.length - 1].cx }];
    }

    const anios: { a: string; x: number }[] = [];
    const primerAnio = new Date(t0).getFullYear();
    const ultimoAnio = new Date(t1).getFullYear();
    const pasoAnio = soloPropio ? 1 : compacto ? 3 : 2;
    for (let a = primerAnio; a <= ultimoAnio; a += pasoAnio) {
      const x = px(`${a}-01-01`);
      if (x >= PAD.izq - 4 && x <= ANCHO - PAD.der) anios.push({ a: String(a), x });
    }
    const ejeY: { k: number; y: number }[] = [];
    for (let k = kmMin; k <= kmMax; k += pasoKm) ejeY.push({ k, y: py(k) });

    // dos registros con fechas y km casi iguales quedan uno encima del otro: se agrupan en un marcador
    const agrupar = <T extends { cx: number; cy: number }>(items: T[], tope: number) => {
      const grupos: T[][] = [];
      for (const it of items) {
        const ultimo = grupos[grupos.length - 1];
        const ref = ultimo?.[ultimo.length - 1];
        if (ref && Math.hypot(it.cx - ref.cx, it.cy - ref.cy) <= tope) ultimo.push(it);
        else grupos.push([it]);
      }
      return grupos;
    };

    // radio de click: la mitad de la distancia al marcador más cercano, para que nunca se solapen
    const conRadio = <T extends { cx: number; cy: number }>(ms: T[]) =>
      ms.map((m) => {
        const cerca = ms.reduce((min, o) => (o === m ? min : Math.min(min, Math.hypot(o.cx - m.cx, o.cy - m.cy))), Infinity);
        return { ...m, r: Math.max(7, Math.min(16, cerca / 2)) };
      });

    const marcadores = conRadio(
      agrupar(puntos, 6.5).map((g) => ({
        id: g.map((p) => p.id).join('+'),
        cx: g.reduce((a, p) => a + p.cx, 0) / g.length,
        cy: g.reduce((a, p) => a + p.cy, 0) / g.length,
        entradas: g.map((p) => ({ servicio: p.servicio, km: p.km, fecha: p.fecha })),
        odometro: g.some((p) => p.id === 'odometro'),
      })),
    );

    const marcasEstimadas = conRadio(
      agrupar(estimados, 6.5).map((g) => ({
        id: g.map((e) => e.s.id).join('+'),
        cx: g.reduce((a, e) => a + e.cx, 0) / g.length,
        cy: g.reduce((a, e) => a + e.cy, 0) / g.length,
        entradas: g.map((e) => ({ servicio: e.s, km: e.km, fecha: e.s.date, estimado: true })),
        odometro: false,
      })),
    );

    return {
      ejeX: anios,
      ejeY,
      tramos,
      base,
      ultimo: puntosLinea[puntosLinea.length - 1],
      marcadores,
      marcasEstimadas,
      compra,
      cantidadEstimados: estimados.length,
    };
  }, [conKm, sinKm, vehiculo.odometro, vehiculo.odometroFecha, vehiculo.compraKm, ANCHO, ALTO, PAD, compacto, soloPropio]);

  useEffect(() => {
    if (!caja.current) return;
    for (const el of caja.current.querySelectorAll<SVGPathElement>('.trazo.dibujar'))
      el.style.setProperty('--largo', String(el.getTotalLength()));
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setDibujado(true); obs.disconnect(); } },
      { threshold: 0.3 },
    );
    obs.observe(caja.current);
    return () => obs.disconnect();
  }, [soloPropio]);

  const marcadorActivo = useMemo(
    () => [...marcadores, ...marcasEstimadas].find((m) => m.id === activo) ?? null,
    [activo, marcadores, marcasEstimadas],
  );

  const cerrarGlobo = useCallback(() => { setActivo(null); setFijo(false); }, []);

  useEffect(() => {
    if (!fijo) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarGlobo(); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [fijo, cerrarGlobo]);

  const mover = useCallback((delta: number) => {
    setVista((v) => (v ? { ...v, i: (v.i + delta + v.lista.length) % v.lista.length } : v));
  }, []);

  const abrirEscaneo = (s: Servicio, i = 0) =>
    s.scans && setVista({ tipo: 'escaneo', lista: s.scans, i, pie: `${s.workshop} · ${fecha(s.date)}` });

  return (
    <>
      <header className="header">
        <nav>
          <a href="#fotos">Fotos</a>
          <a href="#ficha">Ficha</a>
          <a href="#historial">Historial</a>
          <a href="#detalles">Detalles</a>
          <a href="#cochera">Cochera</a>
          <a href="#precio">Precio</a>
        </nav>
      </header>

      <main>
        <section id="portada" className="portada">
          {fotos[0] && (
            <Image
              src={`/car/fotos/${fotos[0].file}`}
              alt="Ford Fiesta 2012 de perfil, tres cuartos delantero"
              width={fotos[0].w}
              height={fotos[0].h}
              loading="eager"
              fetchPriority="high"
              sizes="100vw"
            />
          )}
          <div className="portada-cuerpo">
            <h1 className="portada-marcas">
              <Image className="portada-ford" src="/brand/ford.png" alt="Ford" width={1000} height={360} priority />
              <Image className="portada-fiesta" src="/brand/fiesta.png" alt="Fiesta" width={539} height={134} priority />
              <span className="oculto">{vehiculo.nombre}, {vehiculo.modelo} {vehiculo.anio}</span>
            </h1>
            <div className="ficha-tira dato">
              <div className="ficha-modelo"><span>Modelo</span><strong>{vehiculo.modelo}</strong></div>
              <div><span>Año</span><strong>{vehiculo.anio}</strong></div>
              <div><span>Odómetro</span><strong>{km(vehiculo.odometro)} <em>km</em></strong></div>
              <div><span>Registros de service</span><strong>{services.length}</strong></div>
              <div><span>Historial</span><strong>Segundo dueño</strong></div>
            </div>
          </div>
        </section>

        <section id="fotos" className="seccion fotos">
          {giro.length > 0 && <Giro cuadros={giro} />}
          <div className="rejilla">
            {fotos.map((f, i) => (
              <button
                key={f.file}
                onClick={() => setVista({ tipo: 'foto', lista: fotos, i, carpeta: 'fotos' })}
                aria-label={`Ampliar: ${f.label}`}
              >
                <Image src={`/car/fotos/${f.file}`} alt={f.label} width={f.w} height={f.h} sizes="(max-width: 860px) 92vw, 400px" />
              </button>
            ))}
          </div>
        </section>

        <section id="ficha" className="seccion">
          <div className="seccion-intro">
            <h2>Especificaciones</h2>
          </div>
          <div className="ficha">
            <Image className="ficha-foto" src="/brand/perfil.jpg" alt="Perfil izquierdo del Ford Fiesta" width={1700} height={816} sizes="(max-width: 860px) 100vw, 45vw" />
            <ul className="especificaciones">
              {ESPECIFICACIONES.map((e) => {
                const cuerpo = (
                  <>
                    {e.agregado && <small className="agregado dato">Agregado</small>}
                    <strong>{e.titulo}</strong>
                    {NOTAS[e.titulo] && <small>{NOTAS[e.titulo]}</small>}
                    {e.ventana && <span className="ver"><Info size={14} /> Ver detalle</span>}
                  </>
                );
                return (
                  <li key={e.titulo} className={e.ventana ? 'con-ventana' : undefined}>
                    {e.ventana ? (
                      <button type="button" onClick={() => abrirVentana(e.ventana!)} aria-haspopup="dialog">{cuerpo}</button>
                    ) : (
                      <div>{cuerpo}</div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section id="historial" className="seccion historial">
          <div className="historial-cabecera">
            <div className="seccion-intro">
              <h2>Service y kilómetros</h2>
            </div>
            {vehiculo.compraKm && (
              <button
                type="button"
                className="zoom-historial"
                aria-pressed={soloPropio}
                onClick={() => {
                  setSoloPropio((actual) => !actual);
                  setActivo(null);
                  setFijo(false);
                }}
              >
                {soloPropio ? <ZoomOut size={17} /> : <ZoomIn size={17} />}
                {soloPropio ? 'Ver historial completo' : 'Ver desde que lo compré'}
              </button>
            )}
          </div>

          <div className="historial-interactivo">
            <div className="grafico-caja">
              <div className="grafico-lienzo" ref={caja}>
            <svg className={`grafico${compacto ? ' compacto' : ''}`} viewBox={`0 0 ${ANCHO} ${ALTO}`} role="img"
              aria-label={soloPropio
                ? `Kilometraje durante el período del dueño actual, desde aproximadamente ${km(vehiculo.compraKm!)} hasta ${km(vehiculo.odometro)} kilómetros. El detalle completo está en la tabla que sigue.`
                : `Kilometraje registrado entre ${anio(services[0].date)} y ${anio(vehiculo.odometroFecha)}, de ${km(conKm[0].mileage!)} a ${km(vehiculo.odometro)} kilómetros. El detalle completo está en la tabla que sigue.`}>
              <defs>
                <linearGradient id="degradado" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#7cc7f0" stopOpacity="0.2" />
                  <stop offset="1" stopColor="#7cc7f0" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="degradadoGris" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="#8b9599" stopOpacity="0.16" />
                  <stop offset="1" stopColor="#8b9599" stopOpacity="0" />
                </linearGradient>
              </defs>

              {ejeY.map((g) => (
                <g key={g.k}>
                  <line className="eje-linea" x1={PAD.izq} y1={g.y} x2={ANCHO - PAD.der} y2={g.y} />
                  <text className="eje-texto" x={PAD.izq - 12} y={g.y + 4} textAnchor="end">{km(g.k)}</text>
                </g>
              ))}
              {ejeX.map((g) => (
                <text key={g.a} className="eje-texto" x={g.x} y={ALTO - PAD.aba + 22} textAnchor="middle">{g.a}</text>
              ))}

              {tramos.map((tr, i) => (
                <path
                  key={`area-${i}`}
                  className={`relleno${dibujado ? ' visible' : ''}`}
                  d={tr.area}
                  fill={`url(#${i === 0 && tramos.length > 1 ? 'degradadoGris' : 'degradado'})`}
                />
              ))}
              {tramos.map((tr, i) => (
                <path
                  key={`linea-${i}`}
                  className={`trazo dibujar tramo-${i}${i === 0 && tramos.length > 1 ? ' previo' : ''}${dibujado ? ' visible' : ''}`}
                  d={tr.d}
                />
              ))}
              {compra && !soloPropio && <line className="corte" x1={compra.cx} y1={compra.cy} x2={compra.cx} y2={base} />}
              {marcasEstimadas.map((m) => (
                <g
                  key={m.id}
                  className={`estimado${activo === m.id ? ' activo' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={`${m.entradas.map((e) => `${fecha(e.fecha)}, ${e.servicio!.workshop}`).join('; ')}. Sin kilometraje anotado, estimado ${km(Math.round(m.entradas[0].km))} kilómetros.`}
                  onMouseEnter={() => !fijo && setActivo(m.id)}
                  onMouseLeave={() => !fijo && setActivo(null)}
                  onFocus={() => setActivo(m.id)}
                  onClick={() => { setActivo(m.id); setFijo(true); }}
                >
                  <line className="estimado-tallo" x1={m.cx} y1={base} x2={m.cx} y2={m.cy} />
                  <circle className="estimado-punto" cx={m.cx} cy={m.cy} r={m.entradas.length > 1 ? 6 : 4.5} />
                  {m.entradas.length > 1 && <circle className="estimado-anillo" cx={m.cx} cy={m.cy} r="9.5" />}
                  <rect x={m.cx - m.r} y={m.cy - 10} width={m.r * 2} height={base - m.cy + 18} fill="transparent" />
                </g>
              ))}

              <text className="rail-nota" x={PAD.izq} y={ALTO - 12}>
                {compacto
                  ? `Punteado: ${cantidadEstimados} registros sin km, estimados`
                  : `Líneas punteadas: ${cantidadEstimados} registros sin kilometraje anotado, estimado sobre la curva`}
              </text>

              {marcadores.map((m) => (
                <g
                  key={m.id}
                  className={`punto${m.odometro ? ' punto-odometro' : ''}${compra && !soloPropio && m.cx < compra.cx ? ' previo' : ''}${activo === m.id ? ' activo' : ''}`}
                  tabIndex={0}
                  role="button"
                  aria-label={m.entradas
                    .map((e) =>
                      e.servicio
                        ? `${fecha(e.fecha)}, ${e.servicio.workshop}, ${km(e.km)} kilómetros`
                        : `Odómetro actual, ${fecha(e.fecha)}, ${km(e.km)} kilómetros`,
                    )
                    .join('; ')}
                  onMouseEnter={() => !fijo && setActivo(m.id)}
                  onMouseLeave={() => !fijo && setActivo(null)}
                  onFocus={() => setActivo(m.id)}
                  onClick={() => { setActivo(m.id); setFijo(true); }}
                >
                  <circle className="halo" cx={m.cx} cy={m.cy} r={m.r} />
                  <circle className="nucleo" cx={m.cx} cy={m.cy} r="6" />
                  {m.entradas.length > 1 && <circle className="anillo" cx={m.cx} cy={m.cy} r="10" />}
                </g>
              ))}

              {tramos.length > 1 && (
                <>
                  <text className="tramo-nota previo" x={(tramos[0].x0 + tramos[0].x1) / 2} y={base - 16} textAnchor="middle">
                    {compacto ? 'Dueño anterior' : `Dueño anterior, hasta ~${km(compra!.km)} km`}
                  </text>
                  <text className="tramo-nota" x={(tramos[1].x0 + tramos[1].x1) / 2} y={base - 16} textAnchor="middle">
                    Dueño actual
                  </text>
                </>
              )}

              <text className="eje-texto" x={ultimo.cx} y={ultimo.cy - 18} textAnchor="end" fill="#7cc7f0">
                {km(vehiculo.odometro)} km
              </text>
            </svg>

              </div>
            </div>
            <aside className="historial-detalle" aria-live="polite">
              {marcadorActivo ? (
                <Globo
                  marcador={marcadorActivo}
                  vehiculo={vehiculo}
                  fijo={fijo}
                  cerrar={cerrarGlobo}
                  ampliar={abrirEscaneo}
                />
              ) : (
                <div className="historial-ayuda">
                  <strong>Detalle de cada service</strong>
                  <p>Pasá el cursor o tocá un punto del gráfico para ver la visita y su comprobante.</p>
                </div>
              )}
            </aside>
          </div>

          <details className="registros">
            <summary>
              <span>Ver los {services.length} registros, uno por uno</span>
            </summary>
            <div className="registros-scroll">
            <table>
              <caption style={{ textAlign: 'left', padding: '1rem 0', fontSize: '0.78rem', color: '#7d8481' }}>
                Del más viejo al más nuevo.
              </caption>
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Lugar</th>
                  <th scope="col" className="col-km">Km</th>
                  <th scope="col" className="col-obs">Trabajo</th>
                  <th scope="col">Respaldo</th>
                </tr>
              </thead>
              <tbody>
                {services.map((s) => (
                  <tr key={s.id}>
                    <td className="dato">{fecha(s.date)}</td>
                    <td>{s.workshop}</td>
                    <td className="col-km dato">{s.mileage ? km(s.mileage) : '—'}</td>
                    <td className="col-obs">{s.notes}</td>
                    <td>
                      {s.scans ? (
                        <button onClick={() => abrirEscaneo(s)}>
                          Ver{s.scans.length > 1 ? ` (${s.scans.length})` : ''}
                        </button>
                      ) : (
                        <span style={{ color: '#5d6462' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </details>
        </section>

        <section id="detalles" className="seccion">
          <div className="seccion-intro">
            <h2>Detalles</h2>
          </div>
          <Tarjetas lista={detalles} carpeta="detalles" abrir={setVista} />
        </section>

        {cochera.length > 0 && (
          <section id="cochera" className="seccion cochera">
            <div className="seccion-intro">
              <h2>Siempre durmió en cochera</h2>
            </div>
            <div className="cochera-grid">
              {cochera.map((c, i) => (
                <button
                  key={c.file}
                  onClick={() => setVista({ tipo: 'foto', lista: cochera, i, carpeta: 'cochera' })}
                  aria-label={`Ampliar: ${c.label}`}
                >
                  <Image src={`/car/cochera/${c.file}`} alt={c.label} width={c.w} height={c.h} sizes="(max-width: 860px) 92vw, 560px" />
                </button>
              ))}
            </div>
          </section>
        )}

        <section id="precio" className="seccion precio">
          <div className="precio-caja">
            <div className="precio-monto dato">
              <span>Precio</span>USD {usd(vehiculo.precioUsd)}
            </div>
            <div>
              <Copiar email={vehiculo.contacto} />
            </div>
          </div>
        </section>
      </main>

      <footer>
        <span>Harrison · Ford Fiesta Kinetic Design 2012</span>
      </footer>

      {vista && <Visor vista={vista} cerrar={() => setVista(null)} mover={mover} />}
      {ventana === 'airbags' && airbags && (
        <Ventana titulo={airbags.titulo} cerrar={() => setVentana(null)}>
          <p>{airbags.detalle}</p>
          <ol className="airbags dato">
            {airbags.lista!.map((a, i) => (
              <li key={a}><span>{i + 1}</span>{a}</li>
            ))}
          </ol>
        </Ventana>
      )}
      {ventana === 'polarizado' && (
        <Ventana titulo="Polarizado antivandálico marca Strong" cerrar={() => setVentana(null)}>
          <p>El logo de Strong está en la luneta trasera, arriba del sticker de dietrich.</p>
          <Image className="ventana-foto" src="/car/mejoras/polarizado-strong.jpg" alt="Logo de Strong marcado en la luneta trasera" width={960} height={446} sizes="(max-width: 860px) 90vw, 560px" />
        </Ventana>
      )}
    </>
  );
}

type EntradaGlobo = { servicio: Servicio | null; km: number; fecha: string; estimado?: boolean };

function FilaGlobo({
  entrada,
  vehiculo,
  fijo,
  ampliar,
  compacta,
}: {
  entrada: EntradaGlobo;
  vehiculo: Vehiculo;
  fijo: boolean;
  ampliar: (s: Servicio) => void;
  compacta: boolean;
}) {
  const { servicio, km: kms, fecha: f, estimado } = entrada;
  const scans = servicio?.scans ?? [];
  const escaneo = scans[0];
  const docs = scans.filter((x) => x.tipo === 'comprobante').length;
  const fotos = scans.length - docs;
  const abrirTexto =
    docs && fotos ? `Ver el comprobante y ${fotos} foto${fotos > 1 ? 's' : ''}`
    : docs ? (docs > 1 ? `Ver los ${docs} comprobantes` : 'Ver el comprobante entero')
    : fotos > 1 ? `Ver las ${fotos} fotos del trabajo`
    : 'Ver la foto del trabajo';

  return (
    <div className={`globo-fila${compacta ? ' compacta' : ''}`}>
      {escaneo && <Escaneado escaneo={escaneo} alt="" />}
      <div className="globo-texto">
        <div className="globo-fecha dato">{fecha(f)}</div>
        <div className="globo-taller">{servicio ? servicio.workshop : 'Odómetro hoy'}</div>
        {estimado ? (
          <>
            <strong className="globo-km dato globo-km-estimado">~{km(Math.round(kms / 100) * 100)} km</strong>
            <div className="globo-sin">Sin kilometraje anotado. Estimado entre los dos registros que lo rodean.</div>
          </>
        ) : (
          <strong className="globo-km dato">{km(kms)} km</strong>
        )}
        <p>{servicio ? servicio.notes : `Lectura del tablero, ${fecha(vehiculo.odometroFecha)}.`}</p>
        {servicio?.contexto && <p className="globo-contexto">{servicio.contexto}</p>}
        {servicio?.mileageAnomaly && (
          <p>La planilla registra menos kilómetros que la visita anterior. Se deja como fue anotado.</p>
        )}
        {escaneo && fijo && (
          <button className="globo-ampliar" onClick={() => ampliar(servicio!)}>{abrirTexto}</button>
        )}
        {escaneo && !fijo && <div className="globo-sin">Tocá el punto para ampliar</div>}
        {servicio && !escaneo && <div className="globo-sin">Sin respaldo escaneado</div>}
      </div>
    </div>
  );
}

function Globo({
  marcador,
  vehiculo,
  fijo,
  cerrar,
  ampliar,
}: {
  marcador: { entradas: EntradaGlobo[] };
  vehiculo: Vehiculo;
  fijo: boolean;
  cerrar: () => void;
  ampliar: (s: Servicio) => void;
}) {
  const { entradas } = marcador;
  const varias = entradas.length > 1;

  return (
    <div className={`globo${fijo ? ' fijo' : ''}${varias ? ' multiple' : ''}`} role="status">
      {varias && <div className="globo-encabezado">{entradas.length} visitas casi el mismo día</div>}
      {entradas.map((e, i) => (
        <FilaGlobo
          key={e.servicio?.id ?? `odo-${i}`}
          entrada={e}
          vehiculo={vehiculo}
          fijo={fijo}
          ampliar={ampliar}
          compacta={varias}
        />
      ))}
      {fijo && (
        <button className="globo-cerrar" onClick={cerrar} aria-label="Cerrar detalle">
          <X size={15} />
        </button>
      )}
    </div>
  );
}
