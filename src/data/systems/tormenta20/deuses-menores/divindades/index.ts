import Divindade from '../../../../../interfaces/Divindade';
import {
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import DEUSES_MENORES_POWERS from '../powers';

const CONCEDIDOS = DEUSES_MENORES_POWERS[GeneralPowerType.CONCEDIDOS];

/**
 * Divindades menores do Guia de Deuses Menores, com seu status divino (1-5).
 * Os campos descritivos (energia, arma preferida, devotos, obrigações) ainda
 * não foram transcritos do livro.
 */
const MINOR_DEITIES: { name: string; statusDivino: number }[] = [
  { name: 'A Espada-Deus', statusDivino: 1 },
  { name: 'Akok', statusDivino: 3 },
  { name: 'Altair', statusDivino: 2 },
  { name: 'Anilatir', statusDivino: 3 },
  { name: 'Apis', statusDivino: 3 },
  { name: 'Artaphan', statusDivino: 2 },
  { name: 'Ayllana', statusDivino: 3 },
  { name: 'Beluhga', statusDivino: 4 },
  { name: 'Benthos', statusDivino: 4 },
  { name: 'Betsumial', statusDivino: 1 },
  { name: 'Blinar', statusDivino: 2 },
  { name: 'Caerdellach', statusDivino: 3 },
  { name: 'Canastra', statusDivino: 2 },
  { name: 'Canora', statusDivino: 2 },
  { name: 'Cette', statusDivino: 3 },
  { name: 'Champarr', statusDivino: 3 },
  { name: 'Dahriol', statusDivino: 1 },
  { name: 'Drumak', statusDivino: 1 },
  { name: 'Dunsark', statusDivino: 2 },
  { name: 'Elrophin', statusDivino: 3 },
  { name: 'Escamandra', statusDivino: 1 },
  { name: 'Esmeralda', statusDivino: 2 },
  { name: 'Garanaan', statusDivino: 2 },
  { name: 'Gath', statusDivino: 2 },
  { name: 'Goharom', statusDivino: 4 },
  { name: 'Granto', statusDivino: 4 },
  { name: 'Gratissa', statusDivino: 2 },
  { name: 'Gwendolynn', statusDivino: 3 },
  { name: 'Hippinos', statusDivino: 4 },
  { name: 'Hurlaagh', statusDivino: 3 },
  { name: 'Hydora', statusDivino: 4 },
  { name: 'Inghlblhpholstgt', statusDivino: 3 },
  { name: 'Irione', statusDivino: 3 },
  { name: 'Jandra', statusDivino: 2 },
  { name: 'Klangor', statusDivino: 4 },
  { name: 'Kurur Lianth', statusDivino: 1 },
  { name: 'Laan', statusDivino: 3 },
  { name: 'Lamashtu', statusDivino: 4 },
  { name: 'Lupan', statusDivino: 2 },
  { name: 'Luvithy', statusDivino: 2 },
  { name: 'Marina', statusDivino: 3 },
  { name: 'Mauziell', statusDivino: 4 },
  { name: 'Mzzileyn', statusDivino: 3 },
  { name: 'Nerelim', statusDivino: 2 },
  { name: 'Neruíte', statusDivino: 2 },
  { name: 'O Deus Cristal de Urielka', statusDivino: 1 },
  { name: 'O Deus das Cidades', statusDivino: 4 },
  { name: 'O Deus do Medo', statusDivino: 4 },
  { name: 'Piscigeros', statusDivino: 1 },
  { name: 'Rhond', statusDivino: 3 },
  { name: 'Sartan', statusDivino: 4 },
  { name: 'Sckhar', statusDivino: 5 },
  { name: 'Sunnary', statusDivino: 2 },
  { name: 'Tamagrah', statusDivino: 3 },
  { name: 'Teldiskan', statusDivino: 1 },
  { name: 'Tessalus', statusDivino: 3 },
  { name: 'Tibar', statusDivino: 5 },
  { name: 'Toris', statusDivino: 1 },
  { name: 'Tukala', statusDivino: 1 },
  { name: 'Ur', statusDivino: 3 },
  { name: 'Yasshara', statusDivino: 3 },
  { name: 'Zadbblein', statusDivino: 4 },
  { name: 'Zakharov', statusDivino: 4 },
];

// Cada deus recebe os poderes que o declaram como requisito DEVOTO, para que
// a lista de poderes e a de divindades não possam sair de sincronia.
const DEUSES_MENORES_DIVINDADES: Divindade[] = MINOR_DEITIES.map(
  ({ name, statusDivino }) => ({
    name,
    statusDivino,
    poderes: CONCEDIDOS.filter((power) =>
      power.requirements?.some((group) =>
        group.some(
          (req) => req.type === RequirementType.DEVOTO && req.name === name
        )
      )
    ),
  })
);

export default DEUSES_MENORES_DIVINDADES;
