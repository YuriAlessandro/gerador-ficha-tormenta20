import Race, { RaceAbility } from '../../interfaces/Race';
import Skill from '../../interfaces/Skills';
import { RACE_SIZES } from './raceSizes/raceSizes';

export const NATUREZA_ABILITIES: { [key: string]: RaceAbility[] } = {
  Animal: [
    {
      name: 'Natureza Animal',
      description:
        'Você é feito de carne e osso, com um corpo humanoide de aparência variada. Você recebe +1 em um atributo à sua escolha. Este bônus PODE ser acumulado com um dos outros bônus de atributo do Duende, para um total de +2 em um atributo.',
    },
  ],
  Vegetal: [
    {
      name: 'Natureza Vegetal',
      description:
        'Você é feito de material orgânico como folhas, vinhas ou madeira. Você é imune a atordoamento e metamorfose. É afetado por efeitos que afetam plantas monstruosas; se o efeito não tiver teste de resistência, você tem direito a um teste de Fortitude.',
    },
    {
      name: 'Florescer Feérico',
      description:
        'Uma vez por rodada, você pode gastar uma quantidade de PM limitada pela sua Constituição para curar 2d8 Pontos de Vida por PM gasto no início do seu próximo turno.',
    },
  ],
  Mineral: [
    {
      name: 'Natureza Mineral',
      description:
        'Você é feito de material inorgânico como argila, rocha ou cristal. Você tem imunidade a efeitos de metabolismo e Redução de Dano 5 contra corte, fogo e perfuração. Você não se beneficia de itens da categoria alimentação.',
    },
  ],
};

export const buildTabuAbility = (skill: Skill): RaceAbility => ({
  name: 'Tabu',
  description: `Você possui uma regra de comportamento que nunca pode quebrar (definida com o mestre). Você deve escolher uma das seguintes perícias para sofrer -5 de penalidade: Diplomacia, Iniciativa, Luta ou Percepção. A perícia escolhida foi: ${skill}. Quebrar o tabu acarreta em penalidades diárias e cumulativas: 1º dia fatigado, 2º dia exausto, 3º dia morto.`,
  sheetBonuses: [
    {
      source: { type: 'power' as const, name: 'Tabu' },
      target: { type: 'Skill', name: skill },
      modifier: { type: 'Fixed', value: -5 },
    },
  ],
});

export const PRESENTES_DATA: { [key: string]: RaceAbility } = {
  'Afinidade Elemental (Água)': {
    name: 'Afinidade Elemental (Água)',
    description:
      'Sua ligação com o elemento água lhe concede deslocamento de natação igual ao seu deslocamento base. Você pode lançar as magias Criar Elementos (apenas água) e Névoa. Seu atributo-chave para estas magias é Carisma.',
  },
  'Afinidade Elemental (Fogo)': {
    name: 'Afinidade Elemental (Fogo)',
    description:
      'Sua ligação com o elemento fogo lhe concede redução de dano de fogo 5. Você pode lançar as magias Criar Elementos (apenas fogo) e Explosão de Chamas. Seu atributo-chave para estas magias é Carisma.',
  },
  'Afinidade Elemental (Vegetação)': {
    name: 'Afinidade Elemental (Vegetação)',
    description:
      'Sua ligação com a vegetação permite que você atravesse terrenos difíceis naturais sem sofrer redução no deslocamento. Você pode lançar as magias Armamento da Natureza e Controlar Plantas. Seu atributo-chave para estas magias é Carisma.',
  },
  'Encantar Objetos': {
    name: 'Encantar Objetos',
    description:
      'Você pode gastar uma ação de movimento e 3 PM para tocar um item e aplicar a ele um encanto (sem pré-requisitos) que dura até o fim da cena.',
  },
  'Enfeitiçar': {
    name: 'Enfeitiçar',
    description:
      'Você pode lançar a magia Enfeitiçar e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
  },
  'Invisibilidade': {
    name: 'Invisibilidade',
    description:
      'Você pode lançar a magia Invisibilidade e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
  },
  'Língua da Natureza': {
    name: 'Língua da Natureza',
    description:
      'Você pode falar com animais e plantas e recebe +2 em Adestramento e Sobrevivência.',
    sheetBonuses: [
      {
        source: { type: 'power' as const, name: 'Língua da Natureza' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power' as const, name: 'Língua da Natureza' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  'Maldição': {
    name: 'Maldição',
    description:
      'Você pode gastar uma ação padrão e 3 PM para amaldiçoar uma criatura em alcance curto. A vítima tem direito a um teste de resistência (Fortitude ou Vontade, escolhido na criação do duende). Se falhar, sofre um efeito permanente (escolhido de uma lista na criação do duende) até ser cancelado ou curado. Você só pode manter uma maldição por vez.',
  },
  'Mais Lá do que Aqui': {
    name: 'Mais Lá do que Aqui',
    description:
      'Você pode gastar uma ação padrão e 2 PM para fazer a maior parte do seu corpo desaparecer por uma cena, recebendo camuflagem leve e +5 em Furtividade.',
    sheetBonuses: [
      {
        source: { type: 'power' as const, name: 'Mais Lá do que Aqui' },
        target: { type: 'Skill', name: Skill.FURTIVIDADE },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  'Metamorfose Animal': {
    name: 'Metamorfose Animal',
    description:
      'Você pode se transformar em um tipo de animal. Escolha uma forma selvagem básica do druida. Você pode gastar uma ação completa e 3 PM para assumir essa forma. Você pode falar e lançar magias em sua forma animal.',
  },
  'Sonhos Proféticos': {
    name: 'Sonhos Proféticos',
    description:
      'Uma vez por cena, você pode gastar 3 PM e rolar 1d20. Até o fim da cena, você pode substituir o resultado do d20 de um teste de uma criatura em alcance curto pelo resultado que você rolou.',
  },
  'Velocidade do Pensamento': {
    name: 'Velocidade do Pensamento',
    description:
      'No primeiro turno de cada cena, você pode gastar 2 PM para realizar uma ação padrão adicional, mas em troca pula o seu turno na segunda rodada.',
  },
  'Visão Feérica': {
    name: 'Visão Feérica',
    description:
      'Você recebe visão na penumbra e está permanentemente sob efeito da magia Visão Mística (com o aprimoramento para ver criaturas invisíveis).',
  },
  'Voo': {
    name: 'Voo',
    description:
      'Você pode flutuar a 1,5m do chão com deslocamento de seu deslocamento base +3m e é imune a dano por queda. Pode voar de verdade gastando 1 PM por rodada, com deslocamento de seu deslocamento base +6m.',
  },
};

const DUENDE: Race = {
  name: 'Duende',
  attributes: {
    attrs: [
      { attr: 'any', mod: 1 },
      { attr: 'any', mod: 1 },
    ],
  },
  faithProbability: {
    ALLIHANNA: 1,
    HYNINN: 1,
    NIMB: 1,
    WYNNA: 1,
  },
  size: RACE_SIZES.PEQUENO,
  getDisplacement: () => 9,
  abilities: [
    {
      name: 'Tipo de Criatura',
      description: 'Você é uma criatura do tipo Espírito.',
    },
    {
      name: 'Aversão a Ferro',
      description:
        'Você sofre 1 ponto de dano adicional por dado de dano de armas de ferro/aço e 1d6 de dano por rodada se empunhar ou vestir itens de ferro/aço.',
    },
    {
      name: 'Aversão a Sinos',
      description:
        'Ao ouvir o badalar de um sino, você fica nas condições alquebrado e esmorecido até o fim da cena. Em ambientes urbanos, há uma chance em seis (role 1d6, resultado 1) de ouvir um sino no início de qualquer cena.',
    },
    {
      name: 'Poderes de Duende',
      description:
        'Você pode escolher entre diferentes naturezas, tamanhos e poderes.',
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Poderes de Duende',
          },
          action: {
            type: 'special',
            specialAction: 'duendePowers',
          },
        },
      ],
    },
  ],
};

export default DUENDE;
