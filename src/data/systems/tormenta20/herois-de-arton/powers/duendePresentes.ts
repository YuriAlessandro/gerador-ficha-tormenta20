/**
 * Presentes de Magia e do Caos - Poderes exclusivos da raça Duende
 * Os Duendes escolhem 3 desses poderes inicialmente na criação.
 * Ao subir de nível, podem adquirir novos presentes como poderes gerais.
 */
import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

const DUENDE_PRESENTES_POWERS: GeneralPower[] = [
  {
    type: GeneralPowerType.DESTINO,
    name: 'Afinidade Elemental (Água)',
    description:
      'Sua ligação com o elemento água lhe concede deslocamento de natação igual ao seu deslocamento base. Você pode lançar as magias Criar Elementos (apenas água) e Névoa. Seu atributo-chave para estas magias é Carisma.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Afinidade Elemental (Água)' },
        action: {
          type: 'addSense',
          sense: 'Deslocamento de natação igual ao deslocamento base',
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Afinidade Elemental (Fogo)',
    description:
      'Sua ligação com o elemento fogo lhe concede redução de dano de fogo 5. Você pode lançar as magias Criar Elementos (apenas fogo) e Explosão de Chamas. Seu atributo-chave para estas magias é Carisma.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
        action: {
          type: 'addSense',
          sense: 'Redução de fogo 5',
        },
      },
    ],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Afinidade Elemental (Fogo)' },
        target: { type: 'DamageReduction', damageType: 'Fogo' },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Afinidade Elemental (Vegetação)',
    description:
      'Sua ligação com a vegetação permite que você atravesse terrenos difíceis naturais sem sofrer redução no deslocamento. Você pode lançar as magias Armamento da Natureza e Controlar Plantas. Seu atributo-chave para estas magias é Carisma.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Afinidade Elemental (Vegetação)' },
        action: {
          type: 'addSense',
          sense: 'Ignora terreno difícil natural',
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Encantar Objetos',
    description:
      'Você pode gastar uma ação de movimento e 3 PM para tocar um item e aplicar a ele um encanto (sem pré-requisitos) que dura até o fim da cena.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Enfeitiçar',
    description:
      'Você pode lançar a magia Enfeitiçar e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Invisibilidade',
    description:
      'Você pode lançar a magia Invisibilidade e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Língua da Natureza',
    description:
      'Você pode falar com animais e plantas e recebe +2 em Adestramento e Sobrevivência.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Língua da Natureza' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Língua da Natureza' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Maldição',
    description:
      'Você pode gastar uma ação padrão e 3 PM para amaldiçoar uma criatura em alcance curto. A vítima tem direito a um teste de resistência (Fortitude ou Vontade, escolhido na criação do duende). Se falhar, sofre um efeito permanente (escolhido de uma lista na criação do duende) até ser cancelado ou curado. Você só pode manter uma maldição por vez.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Mais Lá do que Aqui',
    description:
      'Você pode gastar uma ação padrão e 2 PM para fazer a maior parte do seu corpo desaparecer por uma cena, recebendo camuflagem leve e +5 em Furtividade.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Metamorfose Animal',
    description:
      'Você pode se transformar em um tipo de animal. Escolha uma forma selvagem básica do druida. Você pode gastar uma ação completa e 3 PM para assumir essa forma. Você pode falar e lançar magias em sua forma animal.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Sonhos Proféticos',
    description:
      'Uma vez por cena, você pode gastar 3 PM e rolar 1d20. Até o fim da cena, você pode substituir o resultado do d20 de um teste de uma criatura em alcance curto pelo resultado que você rolou.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Velocidade do Pensamento',
    description:
      'No primeiro turno de cada cena, você pode gastar 2 PM para realizar uma ação padrão adicional, mas em troca pula o seu turno na segunda rodada.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Visão Feérica',
    description:
      'Você recebe visão na penumbra e está permanentemente sob efeito da magia Visão Mística (com o aprimoramento para ver criaturas invisíveis).',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Visão Feérica' },
        action: {
          type: 'addSense',
          sense: 'Visão na penumbra; Visão Mística permanente',
        },
      },
    ],
  },
  {
    type: GeneralPowerType.DESTINO,
    name: 'Voo',
    description:
      'Você pode flutuar a 1,5m do chão com deslocamento de seu deslocamento base +3m e é imune a dano por queda. Pode voar de verdade gastando 1 PM por rodada, com deslocamento de seu deslocamento base +6m.',
    requirements: [[{ type: RequirementType.RACA, name: 'Duende' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Voo' },
        action: {
          type: 'addSense',
          sense: 'Flutuar 1,5m; Imune a dano por queda',
        },
      },
    ],
  },
];

export default DUENDE_PRESENTES_POWERS;
