import {
  GeneralPower,
  GeneralPowerType,
  RequirementType,
} from '../../../../../interfaces/Poderes';
import Skill from '../../../../../interfaces/Skills';

/**
 * Poderes de Magia do suplemento Heróis de Arton
 */
const magicPowers: Record<string, GeneralPower> = {
  BARREIRA_MISTICA: {
    name: 'Barreira Mística',
    description:
      'Você usa a energia residual da conjuração de feitiços para materializar escudos capazes de protegê-lo de ataques físicos. Quando lança uma magia, você pode gastar 1 PM. Se fizer isso, você recebe +4 na Defesa até o início do seu próximo turno.',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
  ESOTERISMO: {
    name: 'Esoterismo',
    description:
      'Quando lança uma magia, você pode pagar 2 PM para canalizá-la através de dois itens esotéricos diferentes simultaneamente, recebendo os benefícios de ambos.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Lançar magias de 2º círculo' }],
    ],
  },
  ESTILO_ESOTERICO: {
    name: 'Estilo Esotérico',
    description:
      'Uma vez por rodada, quando faz a ação agredir em corpo a corpo enquanto empunha um item esotérico, você pode gastar 2 PM para lançar uma magia como uma ação livre. A magia precisa ter execução original de movimento, padrão ou completa.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.PERICIA, name: Skill.LUTA },
        { type: RequirementType.PERICIA, name: Skill.MISTICISMO },
        { type: RequirementType.NIVEL, value: 5 },
      ],
    ],
  },
  ENCANTAR_ITENS_MENORES: {
    name: 'Encantar Itens Menores',
    description:
      'Você pode encantar itens mágicos menores permanentes. Fazer isso segue as mesmas regras para fabricar esses itens, mas você usa Misticismo (se lança magias arcanas) ou Religião (se lança magias divinas) no lugar de Ofício e precisa já possuir o item base (você não fabrica o item, apenas adiciona os efeitos mágicos a ele).',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Lançar magias de 3º círculo' },
        { type: RequirementType.PERICIA, name: Skill.MISTICISMO },
      ],
      [
        { type: RequirementType.TEXT, text: 'Lançar magias de 3º círculo' },
        { type: RequirementType.PERICIA, name: Skill.RELIGIAO },
      ],
    ],
  },
  ENCANTAR_ITENS_MEDIOS: {
    name: 'Encantar Itens Médios',
    description:
      'Como Encantar Itens Menores, mas você pode encantar itens médios.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Lançar magias de 4º círculo' },
        { type: RequirementType.PODER, name: 'Encantar Itens Menores' },
      ],
    ],
  },
  ENCANTAR_ITENS_MAIORES: {
    name: 'Encantar Itens Maiores',
    description:
      'Como Encantar Itens Menores, mas você pode encantar itens maiores.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [
        { type: RequirementType.TEXT, text: 'Lançar magias de 5º círculo' },
        { type: RequirementType.PODER, name: 'Encantar Itens Médios' },
      ],
    ],
  },
  ESPECIALIZACAO_EM_MAGIA: {
    name: 'Especialização em Magia',
    description:
      'Escolha uma magia que possa lançar. A CD para resistir a essa magia aumenta em +2.',
    type: GeneralPowerType.MAGIA,
    requirements: [[{ type: RequirementType.PODER, name: 'Foco em Magia' }]],
    canRepeat: true,
  },
  EXPLOSAO_FULGENTE: {
    name: 'Explosão Fulgente',
    description:
      'Aprimoramento. Suas chamas mágicas emitem um brilho intenso. Um alvo que falhe no teste de resistência fica cego por 1 rodada (ou ofuscado, se já ficou cego por este aprimoramento nessa cena). Este aprimoramento só pode ser aplicado em magias que causam dano de fogo e permitem testes de resistência. Custo: +1 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
  GENESE_ELEMENTAL: {
    name: 'Gênese Elemental',
    description:
      'Aprimoramento. Além do normal, a magia cria 1d4 (+1 por círculo) capangas elementais Pequenos em espaços desocupados adjacentes ao alvo ou dentro da área de efeito da magia (deslocamento 9m, Defesa 15, dano 1d6+1 do tipo da magia, imunidade a atordoamento, cansaço, dano do seu elemento, dano não letal, efeitos de metabolismo e paralisia). Eles desaparecem quando são reduzidos a 0 PV ou no fim da cena. Custo: +3 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Lançar magias de 2º círculo' }],
    ],
  },
  MAGIA_DIVIDIDA: {
    name: 'Magia Dividida',
    description:
      'Aprimoramento. A área da magia é dividida em duas, cada uma com metade do tamanho da original, que não podem se sobrepor. Por exemplo, uma Bola de Fogo (raio de 6m) pode ser dividida em duas áreas com 3m de raio. Custo: +2 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [
      [{ type: RequirementType.TEXT, text: 'Lançar magias de 2º círculo' }],
    ],
  },
  MAGIA_SUSPENSA: {
    name: 'Magia Suspensa',
    description:
      'Quando lança uma magia com execução de ação de movimento ou padrão, você pode aumentar sua execução para uma ação completa ou para 2 ou 3 rodadas. Se fizer isso, a CD para resistir à magia aumenta respectivamente em +1, +2 ou +5.',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
  MIASMA_TOXICO: {
    name: 'Miasma Tóxico',
    description:
      'Aprimoramento. A magia exala vapores nocivos. Um alvo que falhe no teste de resistência fica enjoado por 1 rodada. Este aprimoramento só pode ser aplicado em magias que causam dano de ácido e permitem testes de resistência. Custo: +1 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
  PRISAO_GELIDA: {
    name: 'Prisão Gélida',
    description:
      'Aprimoramento. A magia cobre os alvos com cristais de gelo. Um alvo que falhe no teste de resistência fica enredado por 1 rodada. Este aprimoramento só pode ser aplicado em magias que causam dano de frio e permitem testes de resistência. Custo: +1 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
  TROVAO_RETUMBANTE: {
    name: 'Trovão Retumbante',
    description:
      'Aprimoramento. A magia emite um estrondo poderoso. Um alvo que falhe no teste de resistência fica caído (apenas uma vez por cena) e surdo. Este aprimoramento só pode ser aplicado em magias que causam dano de eletricidade e permitem testes de resistência. Custo: +1 PM.',
    type: GeneralPowerType.MAGIA,
    requirements: [],
  },
};

export default magicPowers;
