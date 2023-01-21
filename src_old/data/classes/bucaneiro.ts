import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';

import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const BUCANEIRO: ClassDescription = {
  name: 'Bucaneiro',
  pv: 16,
  addpv: 4,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'or',
      list: [Skill.LUTA, Skill.PONTARIA],
    },
    {
      type: 'and',
      list: [Skill.REFLEXOS],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ACROBACIA,
      Skill.ATLETISMO,
      Skill.ATUACAO,
      Skill.ENGANACAO,
      Skill.FORTITUDE,
      Skill.FURTIVIDADE,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.JOGATINA,
      Skill.LUTA,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PILOTAGEM,
      Skill.PONTARIA,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Audácia',
      text: 'Quando faz um teste de perícia, você pode gastar 2 PM para receber um bônus igual ao seu modificador de Carisma no teste. Você não pode usar esta habilidade em testes de ataque.',
      nivel: 1,
    },
    {
      name: 'Insolência',
      text: 'Você soma seu bônus de Carisma na Defesa, limitado pelo seu nível. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 1,
    },
    {
      name: 'Evasão',
      text: 'Quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar. Você ainda sofre dano normal se falhar no teste de Reflexos. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 2,
    },
    {
      name: 'Esquiva Sagaz',
      text: 'Você recebe +1 na Defesa (NÃO CONTABILIZADO). Esse bônus aumenta em +1 a cada quatro níveis. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 3,
    },
    {
      name: 'Panache',
      text: 'Sempre que faz um acerto crítico em combate ou reduz um inimigo a 0 PV, você recupera 1 PM.',
      nivel: 5,
    },
    {
      name: 'Evasão Aprimorada',
      text: 'Quando sofre um ataque que permite um teste de Reflexos para reduzir o dano à metade, você não sofre dano algum se passar e sofre apenas metade do dano se falhar. Esta habilidade exige liberdade de movimentos; você não pode usá-la se estiver de armadura pesada ou na condição imóvel.',
      nivel: 10,
    },
    {
      name: 'Sorte de Nimb',
      text: 'O bucaneiro está acostumado a encarar os piores desafios e rir na cara deles — pois sabe que tem a sorte ao seu lado. Você pode gastar 5 PM para rolar novamente um teste recém realizado. Qualquer resultado 11 ou mais na segunda rolagem será considerado um 20 natural.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Abusar dos Fracos',
      text: 'Quando ataca uma criatura sob efeito de uma condição de medo, seu dano aumenta em um passo.',
      requirements: [
        [{ type: RequirementType.PODER, name: 'Flagelo dos Mares' }],
      ],
    },
    {
      name: 'Amigos no Porto',
      text: 'Quando chega em uma comunidade portuária, você pode gastar 2 PM para fazer um teste de Carisma (CD 10). Se passar, encontra um amigo para o qual pode pedir um favor (veja a perícia Diplomacia) ou que pode ajudá-lo como um aliado por uma cena.',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 13 },
          { type: RequirementType.NIVEL, value: 6 },
        ],
      ],
    },
    {
      name: 'Aparar',
      text: 'Uma vez por rodada, quando é atingido por um ataque corpo a corpo, você pode gastar 1 PM para apará-lo. Faça um teste de ataque. Se o resultado do seu teste for maior que o do oponente, você evita o ataque. Você só pode usar este poder se estiver usando uma arma leve ou ágil.',
      requirements: [[{ type: RequirementType.PODER, name: 'Esgrimia' }]],
    },
    {
      name: 'Apostador',
      text: 'Você pode gastar um dia para encontrar e participar de uma mesa de wyrt ou outro jogo de azar. Escolha um valor e faça um teste de Jogatina contra a CD correspondente: T$ 100 (CD 15), T$ 250 (CD 20), T$ 500 (CD 25), T$ 1.000 (CD 30), T$ 2.500 (CD 35) e assim por diante. Se passar, você ganha o valor escolhido (ou um item ou favor equivalente, a critério do mestre). Se falhar, você perde esse mesmo valor. A critério do mestre, o lugar onde você está pode impossibilitar o uso deste poder ou limitá-lo a uma vez por semana ou mês.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Jogatina' }]],
    },
    {
      name: 'Ataque Acrobático',
      text: 'Quando se aproxima de um inimigo com uma pirueta ou pulo (em termos de jogo, usando Acrobacia ou Atletismo para se mover) e o ataca no mesmo turno, você recebe +2 em seu teste de ataque e na rolagem de dano.',
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [],
      canRepeat: true,
    },
    {
      name: 'Aventureiro Ávido',
      text: 'Uma vez por rodada, você pode gastar 5 PM para realizar uma ação padrão ou de movimento adicional. Se possuir o poder Surto Heroico, em vez disso seu custo diminui em –2 PM.',
      requirements: [],
    },
    {
      name: 'Bravata Audaz',
      text: 'Você jura fazer uma façanha específica, como roubar o tesouro de Sckhar ou ganhar um beijo do príncipe e da princesa até o fim do baile. Se cumprir a bravata, seu limite máximo de PM aumenta em +2d6 até o fim da aventura.',
      requirements: [],
    },
    {
      name: 'Bravata Imprudente',
      text: 'Na primeira rodada de um combate, você pode jurar derrotar seus inimigos com uma restrição a sua escolha, como lutar com uma mão nas costas, de guarda aberta (em termos de jogo, desprevenido), de olhos vendados (cego) etc. Uma restrição só é válida se prejudicá-lo (por exemplo, lutar com uma mão nas costas só vale como restrição se você luta com duas armas). O mestre tem a palavra final sobre a validade de uma restrição. Você sofre a penalidade durante todo o combate, mas, se vencer, recebe +2 nos testes de ataque e na margem de ameaça até o fim da aventura.',
      requirements: [],
    },
    {
      name: 'En Garde',
      text: 'Você pode gastar uma ação de movimento e 1 PM para assumir postura de luta. Até o fim da cena, se estiver usando uma arma leve ou ágil, você recebe +2 na Defesa e na margem de ameaça.',
      requirements: [[{ type: RequirementType.PODER, name: 'Esgrimista' }]],
    },
    {
      name: 'Esgrimista',
      text: 'Quando usa uma arma leve ou ágil, você soma seu bônus de Inteligência nas rolagens de dano (limitado pelo seu nível).',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Inteligência', value: 13 }],
      ],
    },
    {
      name: 'Flagelo dos Mares',
      text: 'Você aprende e pode lançar Amedrontar (atributo-chave Carisma). Esta não é uma habilidade mágica e provém de sua capacidade de incutir medo em seus inimigos.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Intimidação' }]],
    },
    {
      name: 'Folião',
      text: 'Você tem facilidade em criar amizades durante festas, de noitadas em tavernas a bailes na corte. O mestre define exatamente o que você pode fazer com este poder. Como regra geral, a atitude de todas as pessoas em relação a você durante uma festa melhora em uma categoria.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 13 }],
      ],
    },
    {
      name: 'Grudar o Cano',
      text: 'Quando faz um ataque à distância com uma arma de fogo contra um oponente adjacente, você não sofre a penalidade de –5 no teste de ataque e aumenta seu dano em um passo. Pré-requisito: treinado em Luta, Pistoleiro.',
      requirements: [],
    },
    {
      name: 'Pernas do Mar',
      text: 'Você está acostumado à superfície oscilante do convés. Você recebe +2 em Acrobacia e Atletismo e não fica desprevenido quando está se equilibrando ou escalando.',
      requirements: [],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Acrobacia' || sk.name === 'Atletismo') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Pernas do Mar',
          value: `+2 em Acrobacia e Atletismo`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Pistoleiro',
      text: 'Você recebe proficiência com armas de fogo e +2 nas rolagens de dano com essas armas (NÃO CONTABILIZADO).',
      requirements: [],
    },
    {
      name: 'Presença Paralisante',
      text: 'Você soma seu bônus de Carisma em Iniciativa (JÁ CONTABILIZADO).',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Carisma', value: 13 }],
      ],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Percepção' || sk.name === 'Reflexos') {
            value += sheetClone.atributos.Carisma.mod;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Presença Paralisante',
          value: `Somando modificador de CAR em Percepção e Reflexos`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Ripostar',
      text: 'Quando usa a habilidade aparar e evita o ataque, você pode gastar 1 PM. Se fizer isso, pode fazer um ataque corpo a corpo imediato contra o inimigo que o atacou (se ele estiver em alcance).',
      requirements: [[{ type: RequirementType.PODER, name: 'Aparar' }]],
    },
    {
      name: 'Touché',
      text: 'Quando se aproxima de um inimigo e o ataca com uma arma leve ou ágil no mesmo turno, você pode gastar 2 PM para aumentar seu dano em um passo e receber +5 na margem de ameaça.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Esgrimista' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    HYNINN: 1,
    NIMB: 1,
    OCEANO: 1,
    SSZZAAS: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.DESTREZA, Atributo.INTELIGENCIA],
};

export default BUCANEIRO;
