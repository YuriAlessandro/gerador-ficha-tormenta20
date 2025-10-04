/**
 * Talentos do Bando - Poderes exclusivos da raça Kobolds
 * Os Kobolds escolhem 2 desses poderes inicialmente
 * Uma vez por patamar, podem escolher outro no lugar de um poder de classe
 */
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import { Atributo } from '../../atributos';
import { spellsCircle1 } from '../../magias/generalSpells';

const KOBOLDS_TALENTS: GeneralPower[] = [
  {
    type: GeneralPowerType.DESTINO,
    name: 'Amontoados (Kobolds)',
    description:
      'Você pode se organizar em cubos além de 1,5m (você pode formar cubos de até 3m ou 4,5m de lado, desde que cada cubo tenha pelo menos um lado adjacente a outro). Pode mudar de configuração sempre que fizer uma ação de movimento para se deslocar.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Armadilha Terrível (Kobolds)',
    description:
      'Escolham uma magia de 1º círculo que tenha como alvo uma criatura ou que tenha um efeito em área e que cause dano ou um efeito negativo (como uma condição ou penalidade). Vocês possuem uma armadilha portátil que contém essa magia. Sua armadilha usa as mesmas regras de engenhocas (veja Tormenta20, p. 70), mas é acionada com Sobrevivência e tem Sabedoria como atributo-chave. Vocês podem escolher esta habilidade mais de uma vez para magias diferentes.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
    allowSeveralPicks: true,
    sheetActions: [
      {
        source: { type: 'power', name: 'Armadilha Terrível (Kobolds)' },
        action: {
          type: 'learnSpell',
          availableSpells: Object.values(spellsCircle1),
          pick: 1,
          customAttribute: Atributo.SABEDORIA,
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Diferentão (Kobolds)',
    description:
      'Escolham um poder de outra classe cujos requisitos vocês cumpram (como um poder de bardo da lista de Poderes de Bardo). Vocês recebem o poder escolhido; para efeitos de nível na classe desse poder, considere seu nível de personagem −4.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Ex-Familiar (Kobolds)',
    description:
      'Vocês recebem +2 PM e os benefícios de um tipo de familiar, escolhidos entre os familiares básicos de arcanista (veja Tormenta20, p. 38). Se não tiverem um atributo-chave para conjuração, para efeitos desta habilidade vocês usam Carisma.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Ex-Familiar (Kobolds)' },
        target: { type: 'PM' },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'O Ousado (Kobolds)',
    description:
      'Uma vez por cena, vocês podem gastar 1 PM e uma ação de movimento para que um membro do bando se afaste e aja sozinho. Ele age a partir da sua próxima rodada, tem deslocamento 9m e pode gastar uma ação padrão para causar 2d4 pontos de dano de corte em uma criatura adjacente (a cada patamar além de iniciante, cada dado desse dano aumenta em um passo). Ele é Pequeno, tem as mesmas características do restante do bando, 1 PV, e retorna ao bando quando "morto" ou ao fim da cena. Usos criativos para o ousado ficam a critério do mestre.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Organizadinhos (Kobolds)',
    description:
      'Vocês podem usar Destreza para estabelecer seu limite de carga (em vez de Força) e podem se beneficiar de um item vestido adicional.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Os do Fundo (Kobolds)',
    description:
      'Vocês conseguem formar o equivalente a um terceiro braço, que pode empunhar um objeto (mas não concede ações extras). Se usarem-no para empunhar uma arma leve, uma vez por rodada, quando usam a ação agredir para atacar com outra arma, podem gastar 1 PM para fazer um ataque corpo a corpo extra com essa arma.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kobolds' },
        { type: RequirementType.PODER, name: 'Organizadinhos (Kobolds)' },
      ],
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Pestes Oportunistas (Kobolds)',
    description:
      'Uma vez por rodada, quando causam dano em uma criatura que já sofreu dano nessa rodada, vocês causam +1d6 pontos de dano do mesmo tipo. A cada patamar além de iniciante, esse dano extra aumenta em um passo.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Somos Explosivos (Kobolds)',
    description:
      'Vocês podem gastar uma ação completa, 1 PM e uma quantidade de PV (limitado pelo seu nível) para arremessar um kobold explosivo em um ponto em alcance curto. Criaturas a até 3m desse ponto sofrem 1d6 pontos de dano de impacto por PV gasto (Ref CD Des reduz à metade). Sempre que rolar o valor máximo em um dos dados de dano, o dano aumenta em +1d6.',
    requirements: [[{ type: RequirementType.RACA, name: 'Kobolds' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Tática de Enxame (Kobolds)',
    description:
      'Vocês podem gastar 2 PM para assumir uma forma de enxame com duração sustentada. Nessa forma, vocês podem ocupar o espaço de criaturas inimigas, tornam-se imunes a manobras de combate e sofrem apenas metade do dano de armas. Entretanto, não podem fazer nenhuma ação que exija coordenação e concentração (como usar a perícia Furtividade ou lançar magias). Criaturas dentro do espaço que vocês ocupam são consideradas em condição ruim para lançar magias.',
    requirements: [
      [
        { type: RequirementType.RACA, name: 'Kobolds' },
        { type: RequirementType.PODER, name: 'Amontoados (Kobolds)' },
      ],
    ],
  },
];

export default KOBOLDS_TALENTS;
