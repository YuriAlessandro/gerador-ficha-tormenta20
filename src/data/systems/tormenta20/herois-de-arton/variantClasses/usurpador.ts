import { VariantClassOverrides } from '../../../../../interfaces/Class';
import Skill from '../../../../../interfaces/Skills';
import { Atributo } from '../../atributos';

const USURPADOR: VariantClassOverrides = {
  name: 'Usurpador',
  isVariant: true,
  baseClassName: 'Clérigo',
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.ENGANACAO, Skill.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 2,
    list: [
      Skill.ATUACAO,
      Skill.CONHECIMENTO,
      Skill.CURA,
      Skill.DIPLOMACIA,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.MISTICISMO,
      Skill.NOBREZA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.REFLEXOS,
      Skill.RELIGIAO,
    ],
  },
  proficiencias: [],
  abilities: [
    {
      name: 'Inimigo dos Deuses',
      text: 'Por roubar o poder de todos os deuses, o usurpador não é aceito por nenhum. Você não pode ter nenhuma devoção.',
      nivel: 1,
    },
    {
      name: 'Magias',
      text: 'Você pode lançar magias divinas de 1º círculo. A cada quatro níveis, pode lançar magias de um círculo maior (2º círculo no 5º nível, 3º círculo no 9º nível e assim por diante). Você não começa com nenhuma magia e não aprende magias automaticamente como um clérigo faria (mas veja Usurpar). Seu atributo-chave para lançar magias é Carisma e você soma seu Carisma no seu total de PM.',
      nivel: 1,
      sheetBonuses: [
        {
          source: {
            type: 'power',
            name: 'Magias',
          },
          target: {
            type: 'PM',
          },
          modifier: {
            type: 'Attribute',
            attribute: Atributo.CARISMA,
          },
        },
      ],
    },
    {
      name: 'Usurpar',
      text: 'Você pode lançar qualquer magia divina de um círculo a que tenha acesso. Para lançar uma magia dessa forma, deve passar em um teste de Enganação (CD 15 + custo em PM da magia). Se falhar, a magia é perdida, mas os PM são gastos mesmo assim. Você não pode escolher 10 nesse teste, mesmo que possua uma habilidade que permita isso, e sofre penalidade de armadura nele. Além disso, sofre uma penalidade de –5 se estiver em um local contendo um símbolo sagrado visível.',
      nivel: 1,
    },
    {
      name: 'Canalização Falsa',
      text: 'No 2º nível, você pode canalizar tanto energia positiva quanto negativa.',
      nivel: 2,
    },
    {
      name: 'Discrição Divina',
      text: 'No 3º nível, você recebe +1 em Furtividade e testes de resistência. A cada seis níveis, esse bônus aumenta em +1.',
      nivel: 3,
    },
    {
      name: 'Poder Capturado',
      text: 'No 4º nível, você rouba o poder que os deuses concedem a seus devotos. Escolha um deus maior por nível e um poder concedido desse deus (você deve cumprir seus pré-requisitos e não pode escolher poderes exclusivos de qualquer classe, inclusive clérigo). Você pode gastar uma hora e fazer um teste de Enganação (CD é 20 +5 para cada uso adicional no mesmo dia). Se passar, você é considerado um devoto desse deus para efeitos de habilidades e itens, e pode usar o poder concedido escolhido, mas não precisa seguir as Obrigações e Restrições. Se falhar, você perde 3 PM. Este efeito dura até o fim do dia ou até você usá-lo novamente.',
      nivel: 4,
    },
    {
      name: 'Roubo Divino',
      text: 'No 20º nível, você é capaz de roubar a própria essência divina. Quando lança uma magia com Usurpar, para cada 10 pontos no resultado do teste de Enganação, o total de PM que você gasta nessa magia é reduzido em –1 (cumulativo com outras reduções) e a CD para resistir a ela aumenta em +1.',
      nivel: 20,
    },
  ],
  spellPath: {
    initialSpells: 0,
    spellType: 'Divine',
    qtySpellsLearnAtLevel: () => 0,
    spellCircleAvailableAtLevel: (level: number) => {
      if (level < 5) return 1;
      if (level < 9) return 2;
      if (level < 13) return 3;
      if (level < 17) return 4;
      return 5;
    },
    keyAttribute: Atributo.CARISMA,
  },
  excludedPowers: ['Conhecimento Mágico'],
  setup: undefined,
  probDevoto: 0,
  attrPriority: [Atributo.CARISMA],
};

export default USURPADOR;
