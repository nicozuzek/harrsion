import data from '../content/car.json';
import Pagina, { type Cochera, type Cuadro, type Equipo, type Foto, type Servicio, type Vehiculo } from './ui';

export default function Home() {
  return (
    <Pagina
      vehiculo={data.vehiculo as Vehiculo}
      fotos={data.fotos as Foto[]}
      giro={data.giro as Cuadro[]}
      detalles={data.detalles as Foto[]}
      mejoras={data.mejoras as Foto[]}
      cochera={data.cochera as Cochera[]}
      equipamiento={data.equipamiento as Equipo[]}
      services={data.services as Servicio[]}
    />
  );
}
