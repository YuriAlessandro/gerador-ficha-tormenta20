import Race, { RaceAbility } from '../../../../../interfaces/Race';
import { Atributo } from '../../atributos';
import {
  GeneralPower,
  GeneralPowerType,
} from '../../../../../interfaces/Poderes';

// Poderes disponíveis via Talentos do Bando
const PODER_AMONTOADOS: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Amontoados (Kobolds)',
  description:
    'Você pode se organizar em cubos além de 1,5m (você pode formar cubos de até 3m ou 4,5m de lado, desde que cada cubo tenha pelo menos um lado adjacente a outro). Pode mudar de configuração sempre que fizer uma ação de movimento para se deslocar.',
  requirements: [],
};

const PODER_ARMADILHA_TERRIVEL: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Armadilha Terrível (Kobolds)',
  description:
    'Você pode lançar uma magia de 1º círculo que tenha efeito em área ou cause dano ou um efeito negativo (como uma condição ou penalidade). Você pode usar esta magia como parte de uma ação de armadilha portátil de conjuração que tenha ação de ativação com Sobrenome como atributo-chave. Pode escolher esta habilidade mais de uma vez para magias diferentes.',
  requirements: [],
};

const PODER_DEFENSAO: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: "Defens'ão (Kobolds)",
  description:
    'Você recebe +2 de Destreza para estabelecer seu limite de carga (em vez de Força) e podem se beneficiar de um item vestido adicional. Pré-requisito: Organizadinhos.',
  requirements: [],
};

const PODER_OUSADO: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'O Ousado (Kobolds)',
  description:
    'Uma vez por cena, você pode gastar 1 PM e uma ação de movimento para que um membro do bando se afaste e atue sozinho. Ele age a partir da sua próxima rodada, tem deslocamento 9m e pode gastar uma ação padrão para causar 2d4 pontos de dano de corte em uma criatura adjacente (a cada patamar além de iniciante, cada dado desse dano aumenta em um passo). Ele é Pequeno, tem as mesmas características de retirante do bando, 1 PV e retorna ao bando quando "morto" ou ao fim da cena. Usos criativos para o ousado ficam a critério do mestre.',
  requirements: [],
};

const PODER_OS_DO_FUNDO: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Os do Fundo (Kobolds)',
  description:
    'Você consegue formar o equivalente a um terceiro braço, que pode empunhar um objeto (mas não concede ações extras). Se usarem-no para empunhar uma arma leve, uma vez por rodada, quando usam a ação agredir para atacar com outra arma, podem gastar 1 PM para fazer um ataque corpo a corpo extra com essa arma. Pré-requisito: Organizadinhos.',
  requirements: [],
};

const PODER_ORGANIZADINHOS: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Organizadinhos (Kobolds)',
  description:
    'Você consegue escolher o valor de Força para estabelecer seu limite de carga (em vez de Força) e podem se beneficiar de um item vestido adicional.',
  requirements: [],
};

const PODER_PESTES_OPORTUNISTAS: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Pestes Oportunistas (Kobolds)',
  description:
    'Uma vez por rodada, quando causam dano em uma criatura que já sofreu dano nessa rodada, vocês causam +1d6 pontos de dano do mesmo tipo. A cada patamar além de iniciante, esse dano extra aumenta em um passo.',
  requirements: [],
};

const PODER_SOMOS_EXPLOSIVOS: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Somos Explosivos (Kobolds)',
  description:
    'Você pode gastar uma ação completa, 1 PM e uma quantidade de PV (limitado pelo seu nível) para arremessar um kobold explosivo em um ponto em alcance curto. Criaturas a até 3m desse ponto sofrem 1d6 pontos de dano de impacto por PV gasto (Ref CD Des reduz à metade). Sempre que rolar o valor máximo em um dos dados de dano, o dano aumenta em +1d6.',
  requirements: [],
};

const PODER_TATICA_DE_ENXAME: GeneralPower = {
  type: GeneralPowerType.DESTINO,
  name: 'Tática de Enxame (Kobolds)',
  description:
    'Você pode gastar 2 PM para assumir uma forma de enxame com duração sustentada. Nessa forma, vocês podem ocupar o espaço de criaturas inimigas, tornam-se imunes a manobras de combate e sofrem apenas metade do dano de armas. Entretanto, não podem fazer nenhuma ação que exija coordenação e concentração (como usar a perícia Furtividade ou lançar magias). Criaturas dentro do espaço que você ocupam são consideradas em condição ruim para lançar magias. Pré-requisito: Amontoados.',
  requirements: [],
};

const koboldsAbilities: RaceAbility[] = [
  {
    name: 'Ajuntamento Escamoso',
    description:
      'Embora sejam um grupo de kobolds, para todos os efeitos vocês são uma única criatura Média com dois braços. Entretanto, contam como Pequenos para efeitos dos espaços por onde podem passar e, quando fazem um teste de resistência contra um efeito que afeta apenas uma criatura e não causa dano, rolam dois dados e usam o melhor resultado. Por fim, têm vulnerabilidade a dano de área.',
  },
  {
    name: 'Praça Perigosa',
    description:
      'Vocês são criaturas do tipo monstro e recebem visão no escuro e +2 em Sobrevivência.',
  },
  {
    name: 'Sensibilidade a Luz',
    description:
      'Quando expostos à luz do sol ou similar, vocês ficam ofuscados.',
  },
  {
    name: 'Talentos do Bando',
    description:
      'Escolham dois dos poderes a seguir. Uma vez por patamar, vocês podem escolher outro desses poderes no lugar de um poder de classe.',
    sheetActions: [
      {
        source: { type: 'power', name: 'Talentos do Bando' },
        action: {
          type: 'getGeneralPower',
          availablePowers: [
            PODER_AMONTOADOS,
            PODER_ARMADILHA_TERRIVEL,
            PODER_DEFENSAO,
            PODER_OUSADO,
            PODER_OS_DO_FUNDO,
            PODER_ORGANIZADINHOS,
            PODER_PESTES_OPORTUNISTAS,
            PODER_SOMOS_EXPLOSIVOS,
            PODER_TATICA_DE_ENXAME,
          ],
          pick: 2,
        },
      },
    ],
  },
];

const KOBOLDS: Race = {
  name: 'Kobolds',
  attributes: {
    attrs: [
      { attr: Atributo.DESTREZA, mod: 2 },
      { attr: Atributo.FORCA, mod: -1 },
    ],
  },
  faithProbability: {
    KALLYADRANOCH: 1,
    KHALMYR: 1,
    LENA: 1,
    MEGALOKK: 1,
    TENEBRA: 1,
  },
  abilities: koboldsAbilities,
};

export default KOBOLDS;
