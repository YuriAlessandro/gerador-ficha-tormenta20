import { GeneralPower, GeneralPowerType, RequirementType } from './types';

const magicPowers: GeneralPower[] = [
  {
    name: 'Celebrar Ritual',
    description:
      'Você pode lançar magias na forma de rituais. Fazer isso dobra seu limite de PM (permitindo usar mais aprimoramentos), mas aumenta sua execução para uma hora (ou para o dobro da sua execução, o que for maior) e adiciona um componente material de T$ 10 por PM na forma de incensos, óleos, oferendas etc. Quando faz um ritual, você paga apenas metade do custo da magia em PM (após aplicar quaisquer habilidades que modifiquem esse custo).',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
  {
    name: 'Escrever Pergaminho',
    description:
      'Você pode usar a perícia Ofício (escriba) para fabricar pergaminhos com magias que conheça. Veja a página 121 para a regra de fabricar itens e a página e 327 para a regra de pergaminhos. De acordo com o mestre, você pode usar outros objetos similares, como runas, tabuletas de argila etc.',
    type: GeneralPowerType.DESTINO,
    requirements: [
      { type: RequirementType.PERICIA, name: 'Ofício' },
      { type: RequirementType.HABILIDADE, name: 'Magias' },
    ],
  },
  {
    name: 'Foco em Magia',
    description:
      'Escolha uma magia. Seu custo diminui em –2 PM (não cumulativo com outras reduções de custo). Você pode escolher este poder outras vezes para magias diferentes.',
    type: GeneralPowerType.MAGIA,
    allowSeveralPicks: true,
    requirements: [],
  },
];

export default magicPowers;
