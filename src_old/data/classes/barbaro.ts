import _ from 'lodash';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skill from '../../interfaces/Skills';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const BARBARO: ClassDescription = {
  name: 'Bárbaro',
  pv: 24,
  addpv: 6,
  pm: 3,
  addpm: 3,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skill.LUTA, Skill.FORTITUDE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skill.ADESTRAMENTO,
      Skill.ATLETISMO,
      Skill.CAVALGAR,
      Skill.INICIATIVA,
      Skill.INTIMIDACAO,
      Skill.OFICIO,
      Skill.PERCEPCAO,
      Skill.PONTARIA,
      Skill.SOBREVIVENCIA,
      Skill.VONTADE,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.ESCUDOS,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.MARCIAIS,
    PROFICIENCIAS.SIMPLES,
  ],
  abilities: [
    {
      name: 'Furia',
      text: 'Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode fazer nenhuma ação que exija calma e concentração (como usar a perícia Furtividade ou lançar magias). A cada cinco níveis, pode gastar +2 PM para aumentar os bônus em +1. A Fúria termina se, ao fim da rodada, você não tiver atacado nem sido alvo de um efeito (ataque, habilidade, magia...) hostil.',
      nivel: 1,
    },
    {
      name: 'Instinto Selvagem',
      text: 'Você recebe +1 em Percepção e Reflexos (JÁ CONTABILIZADO). A cada seis níveis, esse bônus aumenta em +1.',
      nivel: 3,
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Percepção' || sk.name === 'Reflexos') {
            value += 1;
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
      name: 'Resistência a Dano',
      text: 'Graças a seu vigor e força de vontade, você ignora parte de seus ferimentos. Você recebe resistência a dano 2 (todo dano que sofre é reduzido em 2). A cada três níveis, sua RD aumenta em 2, até um máximo de RD 10 no 17º nível.',
      nivel: 5,
    },
    {
      name: 'Fúria Titânica',
      text: 'No 20º nível, o bônus que você recebe nos testes de ataque e rolagens de dano quando usa Fúria é dobrado. Por exemplo, se gastar 8 PM, em vez de um bônus de +5, recebe um bônus de +10',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Alma de Bronze',
      text: 'Quando entra em fúria, você recebe uma quantidade de pontos de vida temporários igual a metade do seu nível + mod. Força.',
      requirements: [],
    },
    {
      name: 'Aumento de Atributo',
      text: 'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      canRepeat: true,
      requirements: [],
    },
    {
      name: 'Brado Assustador',
      text: 'Você pode gastar uma ação de movimento e 1 PM para soltar um berro feroz. Todos os inimigos em alcance curto devem fazer um teste de Vontade (CD Car). Um inimigo que falhe fica abalado até o fim da cena. Um inimigo que passe se torna imune a esta habilidade até o fim do dia.',
      requirements: [
        [{ type: RequirementType.PERICIA, name: Skill.INTIMIDACAO }],
      ],
    },
    {
      name: 'Crítico Brutal',
      text: 'Seu multiplicador de crítico com ataques corpo a corpo aumenta em +1. Por exemplo, se fizer um crítico com um machado de batalha, seu multiplicador será x4, em vez de x3.',
      requirements: [[{ type: RequirementType.NIVEL, value: 6 }]],
    },
    {
      name: 'Destruidor',
      text: 'Quando causa dano com uma arma corpo a corpo de duas mãos, você pode rolar novamente qualquer resultado 1 ou 2 das rolagens de dano da arma.',
      requirements: [
        [{ type: RequirementType.ATRIBUTO, name: 'Força', value: 13 }],
      ],
    },
    {
      name: 'Espírito Inquebrável',
      text: 'Enquanto está em fúria, você não fica inconsciente por estar com 0 ou menos pontos de vida (você ainda morre se chegar em um valor negativo igual à metade de seus PV máximos).',
      requirements: [[{ type: RequirementType.PODER, name: 'Alma de Bronze' }]],
    },
    {
      name: 'Esquiva Sobrenatural',
      text: 'Seus instintos ficam tão apurados que você consegue reagir ao perigo antes que seus sentidos percebam. Você nunca fica surpreendido.',
      requirements: [],
    },
    {
      name: 'Força Indomável',
      text: 'Você pode gastar 1 PM para somar seu nível em um teste de Força ou Atletismo. Você pode usar esta habilidade depois de rolar o dado, mas deve usá-la antes de o mestre dizer se você passou ou não.',
      requirements: [],
    },
    {
      name: 'Frenesi',
      text: 'Se estiver em fúria e usar a ação atacar para fazer um ataque corpo a corpo, você pode gastar 2 PM para fazer um ataque adicional.',
      requirements: [],
    },
    {
      name: 'Fúria da Savana',
      text: 'Seu deslocamento aumenta em +3m (JÁ CONTABILIZADO). Quando usa Fúria, você aplica o bônus em ataque e dano também a armas de arremesso.',
      requirements: [],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        substeps.push({
          name: 'Fúria da Savana',
          value: `+3 na Movimentação`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          displacement: sheetClone.displacement + 3,
        });
      },
    },
    {
      name: 'Fúria Raivosa',
      text: 'Se sua Fúria for terminar por você não ter atacado nem sido alvo de um efeito hostil, você pode pagar 1 PM para continuar em fúria nesta rodada. Se você atacar ou for atacado na rodada seguinte, sua fúria continua normalmente.',
      requirements: [],
    },
    {
      name: 'Golpe Poderoso',
      text: 'Ao acertar um ataque corpo a corpo, você pode gastar 1 PM para causar um dado de dano extra do mesmo tipo (por exemplo, com um montante, causa +1d6, para um dano total de 3d6; com um machado de guerra, causa +1d12).',
      requirements: [],
    },
    {
      name: 'Ímpeto',
      text: 'Você pode gastar 1 PM para aumentar seu deslocamento em +6m por uma rodada.',
      requirements: [],
    },
    {
      name: 'Investida Imprudente',
      text: 'Quando faz uma investida, você pode aumentar sua penalidade em Defesa pela investida para –5 para receber um bônus de +1d8 na rolagem de dano deste ataque.',
      requirements: [],
    },
    {
      name: 'Pele de Aço',
      text: 'O bônus de Pele de Ferro aumenta para +5.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Pele de Ferro' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Pele de Ferro',
      text: 'Você recebe +2 na Defesa, mas apenas se não estiver usando armadura pesada (NÃO CONTABILIZADO).',
      requirements: [],
    },
    {
      name: 'Sangue dos Inimigos',
      text: 'Enquanto está em fúria, quando faz um acerto crítico ou reduz um inimigo a 0 PV, você recebe um bônus cumulativo de +1 em testes de ataque e rolagens de dano, limitado pelo seu nível, até o fim da cena.',
      requirements: [[]],
    },
    {
      name: 'Superstição',
      text: 'Você odeia magia, o que faz com que seja mais resistente a ela. Você recebe resistência a magia +2.',
      requirements: [],
    },
    {
      name: 'Totem Espiritual',
      text: 'Você soma seu bônus de Sabedoria no seu total de pontos de mana (JÁ CONTABILIZADO). Escolha um animal totêmico (veja o quadro). Você pode lançar uma magia definida pelo animal escolhido (atributo-chave Sabedoria).',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Sabedoria', value: 13 },
          { type: RequirementType.NIVEL, value: 4 },
        ],
      ],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        substeps.push({
          name: 'Totem Espiritual',
          value: `Somando modificador de SAB no total de mana.`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: sheet.pm + sheet.atributos.Sabedoria.mod,
        });
      },
    },
    {
      name: 'Vigor Primal',
      text: 'Você pode gastar uma ação de movimento e 1 PM para recuperar 1d12 pontos de vida. Para cada 2 PM extras que você gastar, cura +1d12 PV (pode gastar 3 PM para recuperar 2d12 PV, 5 PM para recuperar 3d12 PV e assim por diante).',
      requirements: [],
    },
  ],
  probDevoto: 0.3,
  faithProbability: {
    ALLIHANNA: 1,
    ARSENAL: 1,
    AZGHER: 1,
    MEGALOKK: 1,
    NIMB: 1,
    OCEANO: 1,
    VALKARIA: 1,
  },
  attrPriority: [Atributo.FORCA, Atributo.CONSTITUICAO],
};

export default BARBARO;
