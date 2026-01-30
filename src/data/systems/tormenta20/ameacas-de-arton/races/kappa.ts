import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';

const kappaAbilities: RaceAbility[] = [
  {
    name: 'Alma da Água',
    description:
      'Você é uma criatura do tipo espírito e tem deslocamento de natação igual ao seu deslocamento terrestre.',
  },
  {
    name: 'Carapaça Kappa',
    description:
      'Você não pode ser flanqueado e recebe cobertura leve se estiver submerso ou caído. Você soma sua Constituição na Defesa, limitado pelo seu nível, mas apenas se não estiver usando armaduras pesadas (se já faz isso, como pela habilidade Casca Grossa, em vez disso você recebe +2 na Defesa).',
  },
  {
    name: 'Cura das Águas',
    description:
      'Você pode lançar a magia Curar Ferimentos (atributo-chave Sabedoria). Caso aprenda novamente essa magia, seu custo diminui em –1 PM. Você não pode usar esta habilidade se a água de sua cabeça estiver derramada.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Cura das Águas' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.curarFerimentos],
          pick: 1,
          customAttribute: Atributo.SABEDORIA,
        },
      },
    ],
  },
  {
    name: "Tigela d'Água",
    description:
      'Sempre que falhar por 5 ou mais em um teste para evitar ser agarrado, derrubado ou empurrado, você derrama a água de sua cabeça. Você fica enjoado até encher a tigela novamente (o que exige uma fonte de água e uma ação padrão).',
  },
];

const KAPPA: Race = {
  name: 'Kappa',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.CONSTITUICAO, mod: 1 },
      { attr: Atributo.CARISMA, mod: -1 },
    ],
  },
  faithProbability: {
    LINWU: 1,
    OCEANO: 1,
  },
  abilities: kappaAbilities,
};

export default KAPPA;
