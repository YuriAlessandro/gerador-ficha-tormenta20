import _ from 'lodash';
import { v4 as uuid } from 'uuid';
import { pickFromArray } from '../../../../functions/randomUtils';
import { ClassDescription } from '../../../../interfaces/Class';
import { RequirementType } from '../../../../interfaces/Poderes';
import Skill from '../../../../interfaces/Skills';
import { allSpellSchools } from '../../../../interfaces/Spells';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const BARDO: ClassDescription = {
  name: 'Bardo',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.ATUACAO, Skill.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 6,
    list: [
      Skill.ACROBACIA,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LADINAGEM,
      Skill.LUTA,
      Skill.MISTICISMO,
      Skill.NOBREZA,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.VONTADE,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.SIMPLES,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
  ],
  abilities: [
    {
      name: 'Inspiração',
      text: 'Você pode gastar uma ação padrão e 2 PM para inspirar as pessoas com sua arte. Você e todos os seus aliados em alcance curto ganham +1 em testes de perícia até o fim da cena. A cada quatro níveis, pode gastar +2 PM para aumentar o bônus em +1.',
      nivel: 1,
    },
    {
      name: 'Magias',
      text: 'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias arcanas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Você pode lançar essas magias vestindo armaduras leves sem precisar de testes de Misticismo. Seu atributo-chave para lançar magias é Carisma e você soma seu bônus de Carisma no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
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
      name: 'Eclético',
      text: 'A partir do 2º nível, você pode gastar 1 PM para receber todos os benefícios de ser treinado em uma perícia por um teste.',
      nivel: 2,
    },
    {
      name: 'Artista Completo',
      text: 'No 20º nível, você pode usar Inspiração como uma ação livre. Enquanto estiver sob efeito de sua Inspiração, suas habilidades de bardo (incluindo magias) têm seu custo em PM reduzido pela metade (após aplicar aprimoramentos e quaisquer outros efeitos que reduzam custo).',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Arte Mágica.',
      text: 'Enquanto você estiver sob efeito de sua Inspiração, a CD para resistir a suas habilidades de bardo aumenta em +2',
      requirements: [],
    },
    {
      name: 'Aumentar Repertório',
      text: 'Você aprende duas magias de qualquer círculo que possa lançar. Elas devem pertencer às escolas que você sabe usar, mas podem ser arcanas ou divinas. Você pode escolher este poder quantas vezes quiser.',
      canRepeat: true,
      requirements: [],
      sheetActions: [
        {
          source: {
            type: 'power',
            name: 'Aumentar Repertório',
          },
          action: {
            type: 'learnAnySpellFromHighestCircle',
            allowedType: 'Both',
            pick: 2,
          },
        },
      ],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +1 em um atributo. Você pode escolher este poder várias vezes, mas apenas uma vez por patamar para um mesmo atributo.',
      requirements: [],
      canRepeat: true,
      sheetActions: [
        {
          source: { type: 'power', name: 'Aumento de Atributo' },
          action: { type: 'increaseAttribute' },
        },
      ],
    },
    {
      name: 'Dança das Lâminas',
      text: 'Quando você lança uma magia com execução de uma ação padrão, pode gastar 1 PM para fazer um ataque corpo a corpo como uma ação livre.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Esgrima Mágica' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Esgrima Mágica',
      text: 'Sua arte mescla esgrima e magia, transformando dança em golpes. Enquanto estiver sob efeito de Inspiração, você pode substituir testes de Luta por testes de Atuação, mas apenas para ataques com armas corpo a corpo leves ou de uma mão.',
      requirements: [],
    },
    {
      name: 'Estrelato',
      text: 'Suas apresentações o tornaram famoso, fazendo com que você seja reconhecido e bem tratado por aqueles que apreciam a arte. Por outro lado, pode ser difícil passar despercebido, especialmente em grandes cidades. Quando usa Atuação para impressionar uma plateia, o bônus recebido em perícias baseadas em Carisma aumenta para +5.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Fascinar em Massa',
      text: 'Quando usa Música: Balada Fascinante, você pode gastar 2 PM. Se fizer isso, afeta todas as criaturas a sua escolha no alcance da música (você faz um único teste de Atuação, oposto pelo teste de Vontade de cada criatura).',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Música: Balada Fascinante' }],
      ],
    },
    {
      name: 'Golpe Elemental',
      text: 'Enquanto estiver sob efeito de Inspiração, sempre que você acertar um ataque corpo a corpo, pode gastar 1 PM para causar 1d6 de dano adicional de ácido, eletricidade, fogo ou frio, a sua escolha. Para cada quatro níveis que possuir, pode gastar +1 PM para aumentar o dano em +1d6.',
      requirements: [[{ type: RequirementType.PODER, name: 'Golpe Mágico' }]],
      rolls: [
        {
          id: uuid(),
          label: 'Dano Elemental (base)',
          dice: '1d6',
        },
      ],
    },
    {
      name: 'Golpe Mágico',
      text: 'Enquanto estiver sob efeito de Inspiração, sempre que você acertar um ataque corpo a corpo em um inimigo, recebe 2 PM temporários. Você pode ganhar um máximo de PM temporários por cena igual ao seu nível. Esses pontos temporários desaparecem no final da cena',
      requirements: [[{ type: RequirementType.PODER, name: 'Esgrima Mágica' }]],
    },
    {
      name: 'Inspiração Marcial',
      text: 'Quando você usa Inspiração, você e seus aliados aplicam o bônus recebido em rolagens de dano (além de testes de perícia).',
      requirements: [],
    },
    {
      name: 'Lendas e Histórias',
      text: 'Você possui um acervo mental de relatos, canções e folclore, sendo um arquivo vivo de assuntos gerais. Além de outros benefícios a critério do mestre, você pode gastar 1 PM para rolar novamente um teste recém realizado de Conhecimento, Misticismo, Nobreza ou Religião para informação, identificar criaturas ou identificar itens mágicos.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 1 }],
      ],
    },
    {
      name: 'Manipular',
      text: 'Você pode gastar 1 PM para fazer uma criatura fascinada por você ficar enfeitiçada até o fim da cena (Von CD Car anula). Se a criatura passar, fica imune a este efeito por um dia. Usar esta habilidade não conta como ameaça à criatura fascinada',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Música: Balada Fascinante' }],
      ],
    },
    {
      name: 'Manipular em Massa',
      text: 'Quando usa Manipular, você pode gastar 2 PM extras. Se fizer isso, afeta todas as criaturas a sua escolha em alcance curto.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Fascinar em Massa' },
          { type: RequirementType.PODER, name: 'Manipular' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Música: Balada Fascinante',
      text: '(Ver regras de música, pag 45) Faça um teste de Atuação oposto pelo teste de Vontade de uma criatura no alcance. Se você passar, ela fica fascinada enquanto você se concentrar (uma ação padrão por rodada). Um alvo hostil ou envolvido em combate recebe +5 no teste de resistência e tem direito a um novo teste sempre que você se concentrar. Se a criatura passar, fica imune a este efeito por um dia.',
      requirements: [],
    },
    {
      name: 'Música: Canção Assustadora',
      text: '(Ver regras de música, pag 45) Faça um teste de Atuação oposto pelo teste de Vontade de cada criatura a sua escolha dentro do alcance (você faz um único teste). Alvos que falhem ficam abalados até o fim da cena. Alvos que passem ficam imunes a este efeito por um dia.',
      requirements: [],
    },
    {
      name: 'Música: Melodia Curativa',
      text: '(Ver regras de música, pag 45) Criaturas a sua escolha no alcance recuperam 1d6 PV. Quando usa esta habilidade, você pode gastar mais pontos de mana. Para cada PM extra, aumente a cura em +1d6 PV',
      requirements: [],
      rolls: [
        {
          id: uuid(),
          label: 'Cura (por PM gasto)',
          dice: '1d6',
        },
      ],
    },
    {
      name: 'Melodia Restauradora',
      text: 'Quando você usa  Música: Melodia Curativa, pode gastar +2 PM. Se fizer isso, escolha uma das condições a seguir:  abalado, alquebrado, apavorado, atordoado, cego, confuso, enfeitiçado, esmorecido, exausto, fatigado, frustrado, pasmo ou surdo. Você remove a condição escolhida das criaturas afetadas pela música.',
      requirements: [
        [{ type: RequirementType.PODER, name: ' Música: Melodia Curativa' }],
      ],
    },
    {
      name: 'Mestre dos Sussurros',
      text: 'Você é dissimulado, atento para rumores e ótimo em espalhar fofocas. Quando faz um teste de Investigação para interrogar ou um teste de Enganação para intriga, você rola dois dados e usa o melhor resultado. Além disso, pode fazer esses testes em ambientes sociais (taverna, festival, corte...) sem custo e em apenas uma hora (em vez de um dia)',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 1 },
          { type: RequirementType.PERICIA, name: 'Enganação' },
          { type: RequirementType.PERICIA, name: 'Investigação' },
        ],
      ],
    },
    {
      name: 'Paródia',
      text: 'Uma vez por rodada, quando vê alguém lançando uma magia em alcance médio, você pode pagar 1 PM e fazer um teste de Atuação (CD 15 + custo em PM da magia). Se passar, até o final de seu próximo turno você pode lançar essa magia.',
      requirements: [],
    },
    {
      name: 'Prestidigitação',
      text: 'Quando faz uma ação padrão, você pode aproveitar seus gestos para lançar uma magia com execução de ação completa ou menor. Faça um teste de Atuação (CD 15 + custo em PM da magia). Se passar, você lança a magia como uma ação livre. Se falhar, a magia não funciona, mas você gasta os PM mesmo assim. Outros personagens só percebem que você lançou uma magia com um teste de Misticismo (CD 20)',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    AHARADAK: 1,
    HYNINN: 1,
    MARAH: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TANNATOH: 1,
    TENEBRA: 1,
    VALKARIA: 1,
    WYNNA: 1,
  },
  attrPriority: [Atributo.CARISMA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 2,
      spellType: 'Both',
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      schools: pickFromArray(allSpellSchools, 3),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.CARISMA,
    };

    return modifiedClasse;
  },
};

export default BARDO;
