import Race from '../../interfaces/Race';
import { Atributo } from '../atributos';
import { spellsCircle1 } from '../magias/generalSpells';
import { RACE_SIZES } from './raceSizes/raceSizes';

const fairySpells = [
  spellsCircle1.criarIlusao,
  spellsCircle1.enfeiticar,
  spellsCircle1.luz,
  spellsCircle1.sono,
];

const SILFIDE: Race = {
  name: 'Sílfide',
  attributes: {
    attrs: [
      { attr: Atributo.CARISMA, mod: 2 },
      { attr: Atributo.DESTREZA, mod: 1 },
      { attr: Atributo.FORCA, mod: -2 },
    ],
  },
  size: RACE_SIZES.MINUSCULO,
  faithProbability: {
    AHARADAK: 1,
    ALLIHANNA: 1,
    HYNINN: 1,
    NIMB: 1,
    WYNNA: 1,
  },
  abilities: [
    {
      name: 'Asas de Borboleta',
      description:
        'Seu tamanho é Minúsculo. Você pode pairar a 1,5m do chão com deslocamento 9m. Isso permite que você ignore terreno difícil e o torna imune a dano por queda (a menos que esteja inconsciente). Você pode gastar 1 PM por rodada para voar com deslocamento de 12m.',
    },
    {
      name: 'Espírito da Natureza',
      description:
        'Você é uma criatura do tipo espírito, recebe visão na penumbra e pode falar com animais livremente.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Espírito da Natureza',
          },
          action: {
            type: 'addSense',
            sense: 'Visão na Penumbra',
          },
        },
      ],
    },
    {
      name: 'Magia das Fadas',
      description:
        'Você pode lançar duas das magias a seguir (todas atributo-chave Carisma): Criar Ilusão, Enfeitiçar, Luz (como uma magia arcana) e Sono. Caso aprenda novamente uma dessas magias, seu custo diminui em –1 PM.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Magia das Fadas',
          },
          action: {
            type: 'learnSpell',
            availableSpells: fairySpells,
            pick: 2,
            customAttribute: Atributo.CARISMA,
          },
        },
      ],
    },
  ],
};

export default SILFIDE;
