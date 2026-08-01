import Race, { RaceAbility } from '../../../../../interfaces/Race';
import DRACONIC_BLESSINGS from '../powers/draconicBlessings';

// Habilidades compartilhadas entre as variantes
const kallyanachAbilities: RaceAbility[] = [
  {
    name: 'Herança Dracônica',
    description:
      'Você é uma criatura do tipo monstro e recebe redução de dano 5 contra um tipo de dano a sua escolha entre ácido, eletricidade, fogo, frio, luz ou trevas.',
  },
  {
    name: 'Bênção de Kallyadranoch',
    description:
      'Escolha duas Bênçãos Dracônicas. Você só pode escolher uma Bênção Dracônica por patamar de nível (Iniciante: 1º ao 4º, Veterano: 5º ao 10º, Campeão: 11º ao 16º, Herói: 17º ao 20º).',
    sheetActions: [
      {
        source: { type: 'power', name: 'Bênção de Kallyadranoch' },
        action: {
          type: 'getGeneralPower',
          availablePowers: DRACONIC_BLESSINGS,
          pick: 2,
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

const KALLYANACH: Race = {
  name: 'Kallyanach',
  // Fallback (igual à primeira variante). O sorteio da geração aleatória fica em
  // rollAttributeVariant; no assistente quem escolhe a variante é o jogador.
  attributes: {
    attrs: [
      {
        attr: 'any',
        mod: 2,
      },
    ],
  },
  // Variantes para o wizard - usuário escolhe entre as opções
  attributeVariants: [
    {
      label: '+2 em 1 atributo',
      attrs: [{ attr: 'any', mod: 2 }],
    },
    {
      label: '+1 em 2 atributos',
      attrs: [
        { attr: 'any', mod: 1 },
        { attr: 'any', mod: 1 },
      ],
    },
  ],
  faithProbability,
  abilities: kallyanachAbilities,
};

export default KALLYANACH;
