import data from '../content/car.json';
import Pagina, { type Cochera, type Cuadro, type Foto, type Servicio, type Vehiculo } from './ui';

export default function Home() {
  return (
    <Pagina
      vehiculo={data.vehiculo as Vehiculo}
      fotos={data.fotos as Foto[]}
      giro={data.giro as Cuadro[]}
      detalles={data.detalles as Foto[]}
      cochera={data.cochera as Cochera[]}
      services={data.services as Servicio[]}
    />
  );
}
