/**
 * Poderes de Destino avulsos do Ameaças de Arton.
 *
 * Separado de `draconicBlessings`: as Bênçãos Dracônicas são exclusivas do
 * Kallyanach e limitadas a uma por patamar (`TIER_LIMIT`). Estes aqui são
 * poderes gerais comuns, abertos a qualquer personagem que cumpra os
 * pré-requisitos.
 */
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import { Atributo } from '../../atributos';

const AMEACAS_ARTON_DESTINY_POWERS: GeneralPower[] = [
  {
    name: 'Coração de Dragão',
    description:
      'Você recebe +2 PV e +2 PM. Além disso, para você, um dragão jovem conta como um único parceiro para seu limite de parceiros.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [
        { type: RequirementType.ATRIBUTO, name: Atributo.CARISMA, value: 2 },
        { type: RequirementType.NIVEL, value: 3 },
      ],
    ],
    // A regra do limite de parceiros não tem automação na ficha: fica no texto.
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Coração de Dragão' },
        target: { type: 'PV' },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Coração de Dragão' },
        target: { type: 'PM' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
];

export default AMEACAS_ARTON_DESTINY_POWERS;
