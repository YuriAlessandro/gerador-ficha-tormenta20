import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const LADINO: ClassDescription = {
  name: 'Ladino',
  pv: 12,
  addpv: 3,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LADINAGEM, Skill.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 8,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.ATUACAO,
      Skill.CAVALGAR,
      Skill.CONHECIMENTO,
      Skill.DIPLOMACIA,
      Skill.ENGANACAO,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.INTUICAO,
      Skill.INVESTIGACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.PILOTAGEM,
    ],
  },
  proficiencias: [PROFICIENCIAS.LEVES, PROFICIENCIAS.SIMPLES],
  abilities: [
    {
      name: 'Ataque Furtivo',
      text: 'Você sabe atingir os pontos vitais de um inimigo distraído. Uma vez por rodada, quando atinge um alvo desprevenido com um ataque corpo a corpo ou em alcance curto, ou um alvo que esteja flanqueando, você causa 1d6 pontos de dano adicional. A cada dois níveis, esse dano adicional aumenta em +1d6. Uma criatura imune a acertos críticos também é imune a ataques furtivos.',
      nivel: 1,
    },
    {
      name: 'Especialista',
      text: 'Escolha um número de perícias treinadas igual ao seu bônus de Inteligência (mínimo 1). Ao fazer um teste de uma dessas perícias, você pode gastar 1 PM para dobrar seu bônus de treinamento. Você não pode usar esta habilidade em testes de ataque.',
      nivel: 1,
    },
    {
      name: 'Evasão',
      text: 'A partir do 2º nível, quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar. Você ainda sofre dano normal se falhar no teste de Reflexos. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 2,
    },
    {
      name: 'Esquiva Sobrenatural',
      text: 'No 4º nível, seus instintos ficam tão apurados que você consegue reagir ao perigo antes que seus sentidos percebam. Você nunca fica surpreendido.',
      nivel: 4,
    },
    {
      name: 'Olhos nas Costas',
      text: 'A partir do 8º nível, você consegue lutar contra diversos inimigos como se fossem apenas um. Você não pode ser flanqueado.',
      nivel: 8,
    },
    {
      name: 'Evasão Aprimorada',
      text: 'No 10º nível, quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar e sofre apenas metade do dano se falhar. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 10,
    },
    {
      name: 'A Pessoa Certa para o Trabalho',
      text: 'No 20º nível, você se torna um verdadeiro mestre da ladinagem. Ao fazer um ataque furtivo ou usar uma perícia da lista de ladino, você pode gastar 5 PM para receber +10 no teste.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Assassinar',
      text: 'Você pode gastar uma ação de movimento e 3 PM para analisar uma criatura em alcance curto. Até o fim de seu próximo turno, seu primeiro Ataque Furtivo que causar dano a ela tem seus dados de dano extras dessa habilidade dobrados.',
      requirements: [[{ type: RequirementType.NIVEL, value: 5 }]],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +2 em um atributo a sua escolha. Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Emboscar',
      text: 'Você pode gastar 2 PM para realizar uma ação padrão adicional em seu turno. Você só pode usar este poder na primeira rodada de um combate.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.FURTIVIDADE }],
      ],
    },
    {
      name: 'Escapista',
      text: 'Você recebe +5 em testes de Acrobacia para escapar e em testes para resistir a efeitos que restrinjam seu movimento, como a manobra agarrar e a magia Amarras Etéreas.',
      requirements: [],
    },
    {
      name: 'Fuga Formidável',
      text: 'Você pode gastar uma ação completa e 1 PM para analisar o lugar no qual está (um castelo, um porto, a praça de uma cidade...). Até o fim da cena, você recebe +3m em seu deslocamento, +5 em testes de Acrobacia e Atletismo e ignora penalidades em movimento por terreno difícil. Porém, para receber esses bônus, todas as suas ações na rodada devem estar diretamente ligadas a fugir. Por exemplo, você só pode atacar um inimigo se ele estiver bloqueando seu caminho, agarrando-o etc. Você pode fazer ações para ajudar seus aliados, mas apenas se eles estiverem tentando escapar.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 }],
      ],
    },
    {
      name: 'Gatuno',
      text: 'Você recebe +2 em Atletismo (JÁ CONTABILIZADO). Quando escala, avança seu deslocamento normal, em vez de metade dele.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.ATLETISMO }],
      ],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Atletismo') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Gatuno',
          value: `Somando +2 em Atletismo`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Integrante de Guilda',
      text: 'Você é membro de uma organização criminosa, desde uma pequena guilda de ladrões a uma irmandade de Valkaria. Os efeitos deste poder variam de acordo com a organização e ficam a cargo do mestre. Como regra geral, você recebe +5 em testes de Diplomacia com pessoas ligadas ao submundo e +5 em testes de Intimidação com pessoas comuns que temeriam sua organização. Além disso, tem acesso a itens e serviços roubados ou proibidos (como armas de pólvora e venenos).',
      requirements: [],
    },
    {
      name: 'Ladrão Arcano',
      text: 'Quando causa dano com um ataque furtivo em uma criatura capaz de lançar magias, você pode “roubar” uma magia que já a tenha visto lançar. Você precisa pagar 1 PM por círculo da magia e pode roubar magias de até 4º círculo. Até o final da cena, você pode lançar a magia roubada (atributo-chave Inteligência).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Roubo de Mana' },
          { type: RequirementType.NIVEL, value: 13 },
        ],
      ],
    },
    {
      name: 'Mão na Boca',
      text: 'Você recebe +2 em testes de agarrar. Quando faz um ataque furtivo contra uma criatura desprevenida, você pode fazer um teste de agarrar como uma ação livre. Se agarrar a criatura, ela não poderá falar enquanto estiver agarrada.',
      requirements: [[{ type: RequirementType.PERICIA, name: Skill.LUTA }]],
    },
    {
      name: 'Mãos Rápidas',
      text: 'Ao fazer um teste de Ladinagem para abrir fechaduras, ocultar item, punga ou sabotar, você pode pagar 1 PM para fazê-lo como uma ação livre.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 15 },
          { type: RequirementType.PERICIA, name: Skill.LADINAGEM },
        ],
      ],
    },
    {
      name: 'Mente Criminosa',
      text: 'Você soma seu bônus de Inteligência em Ladinagem e Furtividade (JÁ CONTABILIZADO).',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Destreza', value: 13 }],
      ],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Ladinagem' || sk.name === 'Furtividade') {
            value += sheetClone.atributos.Inteligência.mod;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Mente Criminosa',
          value: `Somando modificador de INT em Ladinagem e Furtividade`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Oportunismo',
      text: 'Você recebe +2 em testes de ataque contra inimigos que já sofreram dano desde seu último turno.',
      requirements: [],
    },
    {
      name: 'Rolamento Defensivo',
      text: 'Sempre que sofre dano, você pode gastar 2 PM para reduzir esse dano à metade. Após usar este poder, você fica caído.',
      requirements: [[{ type: RequirementType.PERICIA, name: Skill.REFLEXOS }]],
    },
    {
      name: 'Roubo de Mana',
      text: 'Quando você causa dano com um ataque furtivo em uma criatura, a criatura perde 1 ponto de mana para cada 1d6 de dano de seu ataque furtivo. Você recebe PM temporários iguais aos PM que a criatura perder. Você só pode usar este poder uma vez por cena contra cada criatura específica.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Truque Mágico' },
          { type: RequirementType.NIVEL, value: 7 },
        ],
      ],
    },
    {
      name: 'Saqueador de Tumbas',
      text: 'Você recebe +5 em testes de Investigação para encontrar armadilhas e em testes de Reflexos para evitá-las. Além disso, gasta uma ação padrão para desabilitar mecanismos, em vez de 1d4 rodadas (veja a perícia Ladinagem).',
      requirements: [],
    },
    {
      name: 'Sombra',
      text: 'Você recebe +2 em Furtividade (JÁ CONTABILIZADO). Além disso, pode se mover com seu deslocamento normal enquanto usa Furtividade sem sofrer penalidades no teste de perícia.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.FURTIVIDADE }],
      ],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Furtividade') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Sombra',
          value: `Recebe +2 em Furtividade`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Truque Mágico',
      text: 'Você aprende e pode lançar uma magia arcana de 1º círculo a sua escolha, pagando seu custo normal em PM. Seu atributo-chave para esta magia é Inteligência. Você pode escolher este poder quantas vezes quiser.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 }],
      ],
      canRepeat: true,
    },
    {
      name: 'Velocidade Ladina',
      text: 'Uma vez por rodada, você pode gastar 2 PM para realizar uma ação de movimento adicional em seu turno.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Destreza', value: 15 },
          { type: RequirementType.PERICIA, name: Skill.INICIATIVA },
        ],
      ],
    },
    {
      name: 'Veneno Persistente',
      text: 'Quando aplica uma dose de veneno a uma arma, este veneno dura por três ataques (em vez de apenas um).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Veneno Potente' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Veneno Potente',
      text: 'A CD para resistir aos venenos que você usa aumenta em +2 e esses venenos causam +1 ponto de dano por dado de dano.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.OFICIO_ALQUIMIA }],
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    NIMB: 1,
    SSZZAAS: 1,
    TENEBRA: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.DESTREZA],
};

export default LADINO;
