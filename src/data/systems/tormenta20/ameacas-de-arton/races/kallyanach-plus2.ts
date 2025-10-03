import Equipment from '../../../../../interfaces/Equipment';
import Race, { RaceAbility } from '../../../../../interfaces/Race';
import DRACONIC_BLESSINGS from '../powers/draconicBlessings';

// Arma natural baseada na herança dracônica
const garrasKallyanach: Equipment = {
  group: 'Arma',
  nome: 'Garras / Chifres',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Cort.',
  preco: 0,
};

// Habilidades compartilhadas entre as variantes
const kallyanachAbilities: RaceAbility[] = [
  {
    name: 'Herança Dracônica',
    description:
      'Você é uma criatura do tipo monstro e reduz o tipo de dano a sua escolha dentre ácido, eletricidade, frio, luz ou trevas.',
  },
  {
    name: 'Armamento Kallyanach',
    description:
      'Você possui uma arma natural (garra, chifre, capa, chifres, garras ou mordida) com a escolha dentre três, ácido, crítico, perfuração ou corte. Uma vez por rodada, quando usa a ação acertar para atacar com outra arma, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a arma natural, desde que esteja livre e não tenha sido usada para atacar neste turno.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Kallyanach' },
        action: {
          type: 'addEquipment',
          equipment: { Arma: [garrasKallyanach] },
          description: 'Garras/Chifres podem ser usados como arma natural.',
        },
      },
    ],
  },
  {
    name: 'Bênção de Kallyadranoch',
    description:
      'Escolha uma Bênção Dracônica. Você só pode escolher uma Bênção Dracônica por patamar de nível (Iniciante: 1º ao 4º, Veterano: 5º ao 10º, Campeão: 11º ao 16º, Herói: 17º ao 20º).',
    sheetActions: [
      {
        source: { type: 'power', name: 'Bênção de Kallyadranoch' },
        action: {
          type: 'getGeneralPower',
          availablePowers: DRACONIC_BLESSINGS,
          pick: 1,
        },
      },
    ],
  },
];

const faithProbability = {
  ARSENAL: 1,
  KALLYADRANOCH: 1,
  MEGALOKK: 1,
  WYNNA: 1,
};

// Variante: +2 em um atributo
const KALLYANACH_PLUS2: Race = {
  name: 'Kallyanach',
  attributes: {
    attrs: [
      {
        attr: 'any',
        mod: 2,
      },
    ],
  },
  faithProbability,
  abilities: kallyanachAbilities,
};

export default KALLYANACH_PLUS2;
