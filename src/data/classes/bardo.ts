import _ from 'lodash';
import { pickFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { allSpellSchools } from '../../interfaces/Spells';
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
      Skill.RELIGIAO,
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
      text:
        'Você pode gastar uma ação padrão e 2 PM para inspirar as pessoas com sua música (ou outro tipo de arte, como dança). Você e todos os seus aliados em alcance curto ganham +1 em testes de perícia até o fim da cena. A cada quatro níveis, pode gastar +2 PM para aumentar o bônus em +1.',
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias arcanas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Você pode lançar essas magias vestindo armaduras leves sem precisar de testes de Misticismo. Seu atributo-chave para lançar magias é Carisma e você soma seu bônus de Carisma no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      nivel: 1,
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = _.cloneDeep(sheet);

        const finalPM = sheet.pm + sheet.atributos.Carisma.mod;
        substeps.push({
          name: 'Magias',
          value: `+(Mod CAR) PMs inicias (${sheet.pm} + ${sheet.atributos.Carisma.mod} = ${finalPM})`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: finalPM,
        });
      },
    },
    {
      name: 'Eclético',
      text:
        'A partir do 2º nível, você pode gastar 1 PM para receber todos os benefícios de ser treinado em uma perícia por um teste.',
      nivel: 2,
    },
    {
      name: 'Artista Completo',
      text:
        'Você pode usar Inspiração como uma ação livre. Enquanto estiver sob efeito de sua Inspiração, qualquer habilidade de bardo (incluindo magias) que você usar tem seu custo em PM reduzido pela metade (após aplicar quaisquer outras habilidades que reduzam o custo).',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Arte Mágica.',
      text:
        'Enquanto você estiver sob efeito de sua habilidade Inspiração, a CD para resistir a suas magias de bardo aumenta em +2.',
      requirements: [],
    },
    {
      name: 'Aumentar Repertório',
      text:
        'Você aprende duas magias de qualquer círculo que possa lançar. Elas devem pertencer às escolas que você sabe usar, mas podem ser arcanas ou divinas. Você pode escolher este poder quantas vezes quiser.',
      canRepeat: true,
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text:
        'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Canção Assustadora',
      text:
        'Você pode gastar uma ação padrão e 1 PM para forçar todas as criaturas a sua escolha em alcance curto a fazer um teste de Vontade (CD Car). Uma criatura que falhe fica abalada até o fim da cena. Uma criatura que passe se torna imune a esta habilidade até o fim do dia.',
      requirements: [],
    },
    {
      name: 'Dança das Lâminas',
      text:
        'Quando você lança uma magia com execução de uma ação padrão, pode gastar 1 PM para fazer um ataque corpo a corpo como uma ação livre.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Esgrima Mágica' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Esgrima Mágica',
      text:
        'Sua arte mescla esgrima e magia, transformando dança em golpes. Enquanto estiver sob efeito de Inspiração, você pode substituir testes de Luta por testes de Atuação, mas apenas se estiver empunhando armas leves ou de uma mão.',
      requirements: [],
    },
    {
      name: 'Estrelato',
      text:
        'Suas apresentações o tornaram famoso, fazendo com que você seja reconhecido e bem tratado por aqueles que apreciam a arte. Por outro lado, pode ser difícil passar despercebido, especialmente em grandes cidades. Quando usa Atuação para impressionar uma plateia, o bônus recebido em perícias baseadas em Carisma aumenta para +5.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Fascinar',
      text:
        'Você pode gastar uma ação padrão e 1 PM para fascinar uma criatura a sua escolha em alcance curto. Faça um teste de Atuação oposto pelo teste de Vontade da criatura. Se você passar, ela fica fascinada enquanto você se concentrar (uma ação padrão por rodada). Se a criatura passar, fica imune a este efeito por um dia.',
      requirements: [],
    },
    {
      name: 'Fascinar em Massa',
      text:
        'Quando usa Fascinar, você pode gastar 2 PM extras. Se fizer isso, afeta todas as criaturas a sua escolha em alcance curto (você faz um único teste de Atuação, oposto pelo teste de Vontade de cada criatura).',
      requirements: [[{ type: RequirementType.PODER, name: 'Fascinar' }]],
    },
    {
      name: 'Golpe Elemental',
      text:
        'Enquanto estiver sob efeito de Inspiração, sempre que você acertar um ataque corpo a corpo, pode gastar 1 PM para causar 1d6 de dano adicional de ácido, eletricidade, fogo ou frio, a sua escolha. Para cada quatro níveis que possuir, pode gastar +1 PM para aumentar o dano em +1d6.',
      requirements: [[{ type: RequirementType.PODER, name: 'Golpe Mágico' }]],
    },
    {
      name: 'Golpe Mágico',
      text:
        'Enquanto estiver sob efeito de Inspiração, sempre que você acertar um ataque corpo a corpo em um inimigo, recebe 2 PM temporários. Você pode ganhar um máximo de PM temporários por cena igual ao seu nível. PM temporários desaparecem no final da cena.',
      requirements: [[{ type: RequirementType.PODER, name: 'Esgrima Mágica' }]],
    },
    {
      name: 'Inspiração Marcial',
      text:
        'Quando você usa Inspiração, você e seus aliados aplicam o bônus recebido em rolagens de dano (além de testes de perícia).',
      requirements: [],
    },
    {
      name: 'Lendas e Histórias',
      text:
        'Você possui um acervo mental de relatos, canções e folclore, sendo um arquivo vivo de assuntos gerais. Além de outros benefícios a critério do mestre, você pode gastar 1 PM para rolar novamente um teste recém realizado de Conhecimento, Misticismo, Nobreza ou Religião para informação, identificar criaturas ou identificar itens mágicos.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 }],
      ],
    },
    {
      name: 'Manipular',
      text:
        'Você pode gastar 1 PM para forçar uma criatura que esteja fascinada a fazer um teste de Vontade (CD Car). Se a criatura falhar, sofre o efeito da magia Enfeitiçar até o fim da cena. Se passar, fica imune a esta habilidade por um dia. Usar esta habilidade não conta como uma ameaça à criatura fascinada.',
      requirements: [[{ type: RequirementType.PODER, name: 'Fascinar' }]],
    },
    {
      name: 'Manipular em Massa',
      text:
        'Quando usa Manipular, você pode gastar 2 PM extras. Se fizer isso, afeta todas as criaturas a sua escolha em alcance curto.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Fascinar em Massa' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Melodia Curativa',
      text:
        'Você pode gastar uma ação padrão e 1 PM para gerar um efeito curativo. Você e todos os seus aliados em alcance curto recuperam 1d6 PV. Para cada 2 PM extras que você gastar, cura +1d6 PV (ou seja, pode gastar 3 PM para recuperar 2d6 PV, 5 PM para recuperar 3d6 PV e assim por diante).',
      requirements: [],
    },
    {
      name: 'Melodia Restauradora',
      text:
        'Quando você usa Melodia Curativa, pode gastar 2 PM extras. Se fizer isso, escolha uma das condições a seguir: abalado, apavorado, alquebrado, atordoado, cego, confuso, esmorecido, exausto, fatigado, frustrado ou surdo. Você remove a condição escolhida de quaisquer aliados a sua escolha afetados pela Melodia Curativa.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Melodia Curativa' }],
      ],
    },
    {
      name: 'Mestre dos Sussurros',
      text:
        'Você é dissimulado, atento para rumores e ótimo em espalhar fofocas. Quando faz um teste de Investigação para obter informação ou um teste de Enganação para intriga, você rola dois dados e usa o melhor resultado. Além disso, pode fazer esses testes em ambientes sociais (taverna, festival, corte...) sem custo e em apenas uma hora (em vez de um dia).',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 13 },
          { type: RequirementType.PERICIA, name: 'Enganação' },
          { type: RequirementType.PERICIA, name: 'Investigação' },
        ],
      ],
    },
    {
      name: 'Paródia',
      text:
        'Uma vez por rodada, quando vê alguém lançando uma magia em alcance médio, você pode pagar 1 PM e fazer um teste de Atuação (CD 15 + custo em PM da magia). Se passar, até o final de seu próximo turno você pode lançar essa magia.',
      requirements: [],
    },
    {
      name: 'Prestidigitação',
      text:
        'Quando faz uma ação padrão qualquer, você pode aproveitar seus gestos para lançar uma magia de ilusão. Faça um teste de Atuação (CD 15 + custo em PM da magia). Se passar, você lança a magia como uma ação livre. Outros personagens só percebem que você lançou uma magia se passarem num teste de Misticismo (CD 20). Se falhar, a magia não funciona, mas você gasta os PM mesmo assim.',
      requirements: [],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
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
      spellType: 'Arcane',
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
