import Equipment from '../../interfaces/Equipment';
import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';

const mordida: Equipment = {
  group: 'Arma',
  nome: 'Mordida',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Perf.',
};

const TROG: Race = {
  name: 'Trog',
  attributes: {
    attrs: [
      { attr: Atributo.CONSTITUICAO, mod: 2 },
      { attr: Atributo.FORCA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    AHARADAK: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
    THWOR: 1,
  },
  abilities: [
    {
      name: 'Mau Cheiro',
      description:
        'Você pode gastar uma ação padrão e 2 PM para expelir um gás fétido. Todas as criaturas (exceto trogs) em alcance curto devem passar em um teste de Fortitude contra veneno (CD Con) ou ficarão enjoadas durante 1d6 rodadas. Uma criatura que passe no teste de resistência fica imune a esta habilidade por um dia.',
    },
    {
      name: 'Mordida',
      description:
        'Você possui uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Quando usa a ação atacar, pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Trog',
          },
          action: {
            type: 'addEquipment',
            equipment: {
              Arma: [mordida],
            },
            description: 'Mordida pode ser usado como arma.',
          },
        },
      ],
    },
    {
      name: 'Reptiliano',
      description:
        'Você é uma criatura do tipo monstro e recebe visão no escuro, +1 na Defesa (JÁ INCLUSO) e, se estiver sem armadura ou roupas pesadas, +5 em Furtividade.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Trog',
          },
          action: {
            type: 'addSense',
            sense: 'Visão no Escuro',
          },
        },
      ],
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Trog',
          },
          target: {
            type: 'Defense',
          },
          modifier: {
            type: 'Fixed',
            value: 1,
          },
        },
      ],
    },
    {
      name: 'Sangue Frio',
      description:
        'Você sofre 1 ponto de dano adicional por dado de dano de frio.',
    },
  ],
};

export default TROG;
