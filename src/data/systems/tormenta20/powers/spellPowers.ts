import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../interfaces/Poderes';

const magicPowers: Record<string, GeneralPower> = {
  CELEBRAR_RITUAL: {
    name: 'Celebrar Ritual',
    description:
      'Você pode lançar magias como rituais. Isso dobra seu limite de PM, mas muda a execução para 1 hora (ou o dobro, o que for maior) e exige um gasto de T$ 10 por PM gasto (em incensos, oferendas...). Assim, um arcanista de 8º nível pode lançar uma magia de 16 PM gastando T$ 160.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.HABILIDADE, name: 'Magias' },
        { type: RequirementType.NIVEL, value: 8 },
        { type: RequirementType.PERICIA, name: 'Misticismo' },
      ],
      [
        { type: RequirementType.HABILIDADE, name: 'Magias' },
        { type: RequirementType.NIVEL, value: 8 },
        { type: RequirementType.PERICIA, name: 'Religião' },
      ],
    ],
  },
  ESCREVER_PERGAMINHO: {
    name: 'Escrever Pergaminho',
    description:
      'Você pode usar a perícia Ofício (escriba) para fabricar pergaminhos com magias que conheça. Veja a página 121 para a regra de fabricar itens e as páginas 333 e 341 para as regras de pergaminhos. De acordo com o mestre, você pode usar objetos similares, como runas, tabuletas de argila etc',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.HABILIDADE, name: 'Magias' },
        { type: RequirementType.PERICIA, name: 'Ofício' },
      ],
    ],
  },
  FOCO_EM_MAGIA: {
    name: 'Foco em Magia',
    description:
      'Escolha uma magia que possa lançar. Seu custo diminui em –1 PM (cumulativo com outras reduções de custo). Você pode escolher este poder outras vezes para magias diferentes.',
    type: GeneralPowerType.MAGIA,
    allowSeveralPicks: true,
    requirements: [[{ type: RequirementType.HABILIDADE, name: 'Magias' }]],
  },
  MAGIA_ACELERADA: {
    name: 'Magia Acelerada',
    description:
      'Muda a execução da magia para ação livre. Você só pode aplicar este aprimoramento em magias com execução de movimento, padrão ou completa e só pode lançar uma magia como ação livre por rodada. Custo: +4 PM.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      [{ type: RequirementType.HABILIDADE, name: 'Magias', value: 2 }],
    ],
  },
  MAGIA_AMPLIADA: {
    name: 'Magia Ampliada',
    description:
      'Aumenta o alcance da magia em um passo (de curto para médio, de médio para longo) ou dobra a área de efeito da magia. Por exemplo, uma Bola de Fogo ampliada tem seu alcance aumentado para longo ou sua área aumentada para 12m de raio. Custo: +2 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [[{ type: RequirementType.HABILIDADE, name: 'Magias' }]],
  },
  MAGIA: {
    name: 'Magia Discreta',
    description:
      'Você lança a magia sem gesticular e falar, usando apenas concentração. Isso permite lançar magias com as mãos presas, amordaçado etc. Também permite lançar magias arcanas usando armadura sem teste de Misticismo. Outros personagens só percebem que você lançou uma magia se passarem num teste de Misticismo (CD 20). Custo: +2 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [[{ type: RequirementType.HABILIDADE, name: 'Magias' }]],
  },
  MAGIA_ILIMITADA: {
    name: 'Magia Ilimitada',
    description:
      'Você soma seu atributo-chave no limite de PM que pode gastar numa magia. Por exemplo, um arcanista de 5º nível com Int 4 e este poder pode gastar até 9 PM em cada magia.',
    type: GeneralPowerType.MAGIA,
    requirements: [[{ type: RequirementType.HABILIDADE, name: 'Magias' }]],
  },
  PREPARAR_POCAO: {
    name: 'Preparar Poção',
    description:
      'Você pode usar a perícia Ofício (alquimista) para fabricar poções com magias que conheça de 1º e 2º círculos. Veja a página 121 para a regra de fabricar itens e as páginas 333 e 341 para as regras de poções.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.HABILIDADE, name: 'Magias' },
        { type: RequirementType.PERICIA, name: 'Ofício (Alquimia)' },
      ],
    ],
  },
};

export default magicPowers;
