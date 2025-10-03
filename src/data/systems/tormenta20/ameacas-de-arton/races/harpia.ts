import Equipment from '../../../../../interfaces/Equipment';
import Race from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import Skill from '../../../../../interfaces/Skills';

const garras: Equipment = {
  group: 'Arma',
  nome: 'Garras',
  dano: '1d6',
  critico: 'x2',
  tipo: 'Cort.',
  preco: 0,
};

const HARPIA: Race = {
  name: 'Harpia',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.CARISMA, mod: 1 },
      { attr: Atributo.INTELIGENCIA, mod: -1 },
    ],
  },
  faithProbability: {
    HYNINN: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  abilities: [
    {
      name: 'Asas de Abutre',
      description:
        'Você possui asas no lugar dos braços e das mãos. Você pode pular a 1,5m do chão com deslocamento 12m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (+ menos que esteja inconsciente). Se não estiver usando armadura pesada, você pode gastar 1 PM por rodada para voar com deslocamento de 12m.',
    },
    {
      name: 'Cria de Masmorra',
      description:
        'Você é uma criatura do tipo monstro, possui visão no escuro e +2 em Intimidação e Sobrevivência.',
      sheetBonuses: [
        {
          source: { type: 'power', name: 'Cria de Masmorra' },
          target: { type: 'Skill', name: Skill.INTIMIDACAO },
          modifier: { type: 'Fixed', value: 2 },
        },
        {
          source: { type: 'power', name: 'Cria de Masmorra' },
          target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
          modifier: { type: 'Fixed', value: 2 },
        },
      ],
    },
    {
      name: 'Grito Aterrorizante',
      description:
        'Você pode gastar uma ação padrão para soltar um grito estridente. Criaturas em alcance curto ficam abaladas (Von CD Car evita).',
    },
    {
      name: 'Pés Rapaantes',
      description:
        'Seus pés podem ser usados como mãos ou como duas armas naturais de garras (dano 1d6 cada, crítico x2, corte). Uma vez por rodada, quando usa a ação acertar para atacar com uma arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com uma das garras, desde que esteja livre e não tenha sido usada para atacar neste turno. Como alternativa, se tiver habilidades que exijam uma arma sendo usada (como Estilo de Duas Armas), você pode usá-las com suas garras.',
      sheetActions: [
        {
          source: { type: 'power', name: 'Harpia' },
          action: {
            type: 'addEquipment',
            equipment: { Arma: [garras] },
            description: 'Garras podem ser usadas como armas.',
          },
        },
      ],
    },
  ],
};

export default HARPIA;
