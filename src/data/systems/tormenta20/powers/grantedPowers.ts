import {
  GeneralPower,
  GeneralPowerType,
  grantedPowers,
  RequirementType,
} from '../../../../interfaces/Poderes';
import Skill from '../../../../interfaces/Skills';
import { spellsCircle1, spellsCircle2 } from '../magias/generalSpells';
import { Atributo } from '../atributos';

const GRANTED_POWERS: Record<grantedPowers, GeneralPower> = {
  AFINIDADE_COM_A_TORMENTA: {
    name: 'Afinidade com a Tormenta',
    description:
      'Você recebe +10 em testes de resistência contra efeitos da Tormenta, de suas criaturas e de devotos de Aharadak. Além disso, seu primeiro poder da Tormenta não conta para perda de Carisma.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
  },
  ALMEJAR_O_IMPOSSIVEL: {
    name: 'Almejar o Impossível',
    description:
      'Quando faz um teste de perícia, um resultado de 19 ou mais no dado sempre é um sucesso, não importando o valor a ser alcançado.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.DEVOTO, name: 'Thwor' }],
      [{ type: RequirementType.DEVOTO, name: 'Valkaria' }],
    ],
  },
  ANFIBIO: {
    name: 'Anfíbio',
    description:
      'Você pode respirar embaixo d’água e adquire deslocamento de natação igual a seu deslocamento terrestre.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
  },
  APOSTAR_COM_O_TRAPACEIRO: {
    name: 'Apostar com o Trapaceiro',
    description:
      'Quando faz um teste de perícia, você pode gastar 1 PM para apostar com Hyninn. Você e o mestre rolam 1d20, mas o mestre mantém o resultado dele em segredo. Você então escolhe entre usar seu próprio resultado ou o resultado oculto do mestre (neste caso, ele revela o resultado).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Hynnin' }]],
  },
  ARMAS_DA_AMBICAO: {
    name: 'Armas da Ambição',
    description:
      'Você recebe +1 em testes de ataque e na margem de ameaça com armas nas quais é proficiente.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Valkaria' }]],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Armas da Ambição',
        },
        target: {
          type: 'WeaponAttack',
          proficiencyRequired: true,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Armas da Ambição',
        },
        target: {
          type: 'WeaponCritical',
          proficiencyRequired: true,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
    ],
    // action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
    //   const sheetClone = _.cloneDeep(sheet);

    //   const simpleWeapons = EQUIPAMENTOS.armasSimples.map((w) => w.nome);
    //   const martialWeapons = EQUIPAMENTOS.armasMarciais.map((w) => w.nome);
    //   const exoticWeapons = EQUIPAMENTOS.armasExoticas.map((w) => w.nome);
    //   const fireWeapons = EQUIPAMENTOS.armasDeFogo.map((w) => w.nome);

    //   const { proficiencias } = sheetClone.classe;

    //   sheetClone.bag.equipments.Arma.forEach((weapon) => {
    //     if (simpleWeapons.includes(weapon.nome)) {
    //       // Arma simples recebe +1
    //       weapon.atkBonus = (weapon.atkBonus ?? 0) + 1;

    //       substeps.push({
    //         name: 'Armas da Ambição',
    //         value: `+1 de ataque em ${weapon.nome} (armas simples)`,
    //       });
    //     } else if (
    //       martialWeapons.includes(weapon.nome) &&
    //       proficiencias.includes(PROFICIENCIAS.MARCIAIS)
    //     ) {
    //       // Arma marcial recebe +1
    //       weapon.atkBonus = (weapon.atkBonus ?? 0) + 1;

    //       substeps.push({
    //         name: 'Armas da Ambição',
    //         value: `+1 de ataque em ${weapon.nome} (armas marciais)`,
    //       });
    //     } else if (
    //       exoticWeapons.includes(weapon.nome) &&
    //       proficiencias.includes(PROFICIENCIAS.EXOTICAS)
    //     ) {
    //       // Arma exótica recebe +1
    //       weapon.atkBonus = (weapon.atkBonus ?? 0) + 1;

    //       substeps.push({
    //         name: 'Armas da Ambição',
    //         value: `+1 de ataque em ${weapon.nome} (armas exóticas)`,
    //       });
    //     } else if (
    //       fireWeapons.includes(weapon.nome) &&
    //       proficiencias.includes(PROFICIENCIAS.FOGO)
    //     ) {
    //       // Arma de fogo recebe +1
    //       weapon.atkBonus = (weapon.atkBonus ?? 0) + 1;

    //       substeps.push({
    //         name: 'Armas da Ambição',
    //         value: `+1 de ataque em ${weapon.nome} (armas de fogo)`,
    //       });
    //     }
    //   });

    //   return sheetClone;
    // },
  },
  ARSENAL_DAS_PROFUNDEZAS: {
    name: 'Arsenal das profundezas',
    description:
      'Você recebe +2 nas rolagens de dano com azagaias, lanças e tridentes e seu multiplicador de crítico com essas armas aumenta em +1.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Arsenal das profundezas',
        },
        target: {
          type: 'WeaponDamage',
          weaponTags: ['armaDeMar'],
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Arsenal das profundezas',
        },
        target: {
          type: 'WeaponCritical',
          weaponTags: ['armaDeMar'],
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
    ],
    // action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
    //   const sheetClone = _.cloneDeep(sheet);

    //   const weapons = [
    //     Armas.AZAGAIA.nome,
    //     Armas.LANCA.nome,
    //     Armas.TRIDENTE.nome,
    //   ];

    //   sheetClone.bag.equipments.Arma.forEach((weapon) => {
    //     if (weapons.includes(weapon.nome)) {
    //       weapon.dano = `${weapon.dano} + 2`;
    //       if (weapon.critico) {
    //         switch (weapon.critico) {
    //           case '2x':
    //             weapon.critico = '3x';
    //             break;
    //           case '3x':
    //             weapon.critico = '4x';
    //             break;
    //           case '4x':
    //             weapon.critico = '5x';
    //             break;
    //           default:
    //             weapon.critico = `${weapon.critico} + 1`;
    //         }
    //       }

    //       substeps.push({
    //         name: 'Arsenal das profundezas',
    //         value: `+2 de dano e +1 no multiplicador de crítico em ${weapon.nome}`,
    //       });
    //     }
    //   });

    //   return sheetClone;
    // },
  },
  ASTUCIA_DA_SERPENTE: {
    name: 'Astúcia da Serpente',
    description: 'Você recebe +2 em Enganação, Furtividade e Intuição.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Astúcia da Serpente',
        },
        target: {
          type: 'Skill',
          name: Skill.ENGANACAO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Astúcia da Serpente',
        },
        target: {
          type: 'Skill',
          name: Skill.FURTIVIDADE,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
      {
        source: {
          type: 'power',
          name: 'Astúcia da Serpente',
        },
        target: {
          type: 'Skill',
          name: Skill.INTUICAO,
        },
        modifier: {
          type: 'Fixed',
          value: 2,
        },
      },
    ],
  },
  ATAQUE_PIEDOSO: {
    name: 'Ataque Piedoso',
    description:
      'Você pode usar armas corpo a corpo para causar dano não letal sem sofrer a penalidade de –5 no teste de ataque.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.DEVOTO, name: 'Lena' }],
      [{ type: RequirementType.DEVOTO, name: 'Thyatis' }],
    ],
  },
  AURA_DE_MEDO: {
    name: 'Aura de Medo',
    description:
      'Você pode gastar 2 PM para gerar uma aura de medo de 9m de raio e duração até o fim da cena. Todos os inimigos que entrem na aura devem fazer um teste de Vontade (CD Car) ou ficam abalados até o fim da cena. Uma criatura que passe no teste de Vontade fica imune a esta habilidade por um dia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }]],
  },
  AURA_DA_PAZ: {
    name: 'Aura de Paz',
    description:
      'Você pode gastar 2 PM para gerar uma aura de paz com alcance curto e duração de uma cena. Qualquer inimigo dentro da aura que tente fazer uma ação hostil contra você deve fazer um teste de Vontade (CD Car). Se falhar, perderá sua ação. Se passar, fica imune a esta habilidade por um dia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
  },
  AURA_RESTAURADORA: {
    name: 'Aura Restauradora',
    description:
      'Efeitos de cura usados por você e seus aliados em alcance curto recuperam +1 PV por dado.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Lena' }]],
  },
  BENCAO_DO_MANA: {
    name: 'Bênção do Mana',
    description: 'Você recebe +1 PM a cada nível ímpar.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Wynna' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Bênção do Mana' },
        target: { type: 'PM' },
        modifier: { type: 'LevelCalc', formula: 'Math.floor(({level} + 1)/2)' },
      },
    ],
  },
  CARICIA_SOMBRIA: {
    name: 'Carícia Sombria',
    description:
      'Você pode gastar 1 PM e uma ação padrão para cobrir sua mão com energia negativa e tocar uma criatura em alcance corpo a corpo. A criatura sofre 2d6 pontos de dano de trevas (Fortitude CD Sab reduz à metade) e você recupera PV iguais à metade do dano causado. Você pode aprender Toque Vampírico como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
  },
  CENTELHA_MAGICA: {
    name: 'Centelha Mágica',
    description:
      'Escolha uma magia arcana ou divina de 1º círculo. Você aprende e pode lançar essa magia',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [
        { type: RequirementType.HABILIDADE, name: 'Magias', not: true },
        { type: RequirementType.DEVOTO, name: 'Wynna' },
      ],
    ],
    sheetActions: [
      {
        source: { type: 'power', name: 'Centelha Mágica' },
        action: {
          type: 'learnSpell',
          availableSpells: Object.values(spellsCircle1),
          pick: 1,
        },
      },
    ],
  },
  COMPREENDER_OS_ERMOS: {
    name: 'Compreender os Ermos',
    description:
      'Você recebe +2 em Sobrevivência e pode usar Sabedoria para Adestramento (em vez de Carisma).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Compreender os Ermos' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  CONHECIMENTO_ENCICLOPEDICO: {
    name: 'Conhecimento Enciclopédico',
    description:
      'Você se torna treinado em duas perícias baseadas em Inteligência a sua escolha.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Conhecimento Enciclopédico' },
        action: {
          type: 'learnSkill',
          availableSkills: [
            Skill.CONHECIMENTO,
            Skill.GUERRA,
            Skill.INVESTIGACAO,
            Skill.MISTICISMO,
            Skill.NOBREZA,
            Skill.OFICIO,
          ],
          pick: 2,
        },
      },
    ],
  },
  CONJURAR_ARMA: {
    name: 'Conjurar Arma',
    description:
      'Você pode gastar 1 PM para invocar uma arma corpo a corpo ou de arremesso com a qual seja proficiente. A arma surge em sua mão, fornece +1 em testes de ataque e rolagens de dano, é considerada mágica e dura pela cena. Você não pode criar armas de disparo, mas pode criar 20 munições.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
  },
  CORAGEM_TOTAL: {
    name: 'Coragem Total',
    description:
      'Você é imune a efeitos de medo, mágicos ou não. Este poder não elimina fobias raciais (como o medo de altura dos minotauros).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.DEVOTO, name: 'Arsenal' }],
      [{ type: RequirementType.DEVOTO, name: 'Khalmyr' }],
      [{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }],
      [{ type: RequirementType.DEVOTO, name: 'Valkaria' }],
    ],
  },
  CURA_GENTIL: {
    name: 'Cura Gentil',
    description:
      'Você soma seu Carisma aos PV restaurados por seus efeitos mágicos de cura.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Lena' }]],
  },
  CURANDEIRA_PERFEITA: {
    name: 'Curandeira Perfeita',
    description:
      'Você sempre pode escolher 10 em testes de Cura. Além disso, não sofre penalidade por usar essa perícia sem uma maleta de medicamentos. Se possuir o item, recebe +2 no teste de Cura (ou +5, se ele for aprimorado).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Lena' }]],
  },
  DEDO_VERDE: {
    name: 'Dedo Verde',
    description:
      'Você aprende e pode lançar Controlar Plantas. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Dedo Verde' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.controlarPlantas],
          pick: 1,
        },
      },
    ],
  },
  DESCANSO_NATURAL: {
    name: 'Descanso Natural',
    description:
      'Para você, dormir ao relento conta como condição de descanso confortável.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
  },
  DOM_DA_ESPERANCA: {
    name: 'Dom da Esperança',
    description:
      'Você soma sua Sabedoria em seus PV em vez de Constituição, e se torna imune às condições alquebrado, esmorecido e frustrado.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Dom da Esperança',
        },
        target: {
          type: 'HPAttributeReplacement',
          newAttribute: Atributo.SABEDORIA,
        },
        modifier: {
          type: 'Fixed',
          value: 1, // Just a flag value, the actual logic is in recalculateSheet
        },
      },
    ],
  },
  DOM_DA_IMORTALIDADE: {
    name: 'Dom da Imortalidade',
    description:
      'Você é imortal. Sempre que morre, não importando o motivo, volta à vida após 3d6 dias. Apenas paladinos podem escolher este poder. Um personagem pode ter Dom da Imortalidade ou Dom da Ressurreição, mas não ambos.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [
        { type: RequirementType.CLASSE, name: 'Paladino' },
        { type: RequirementType.DEVOTO, name: 'Thyatis' },
      ],
    ],
  },
  DOM_DA_PROFECIA: {
    name: 'Dom da Profecia',
    description:
      'Você pode lançar Augúrio. Caso aprenda novamente essa magia, seu custo diminui em –1 PM. Você também pode gastar 2 PM para receber +2 em um teste.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Thyatis' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Dom da Profecia' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle2.augurio],
          pick: 1,
        },
      },
    ],
  },
  DOM_DA_RESSUREICAO: {
    name: 'Dom da Ressurreição',
    description:
      'Você pode gastar uma ação completa e todos os PM que possui (mínimo 1 PM) para tocar o corpo de uma criatura morta há menos de um ano e ressuscitá-la. A criatura volta à vida com 1 PV e 0 PM, e perde 1 ponto de Constituição permanentemente. Este poder só pode ser usado uma vez em cada criatura. Apenas clérigos podem escolher este poder. Um personagem pode ter Dom da Imortalidade ou Dom da Ressurreição, mas não ambos.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [
        { type: RequirementType.CLASSE, name: 'Clérigo' },
        { type: RequirementType.DEVOTO, name: 'Thyatis' },
      ],
    ],
  },
  DOM_DA_VERDADE: {
    name: 'Dom da Verdade',
    description:
      'Você pode pagar 2 PM para receber +5 em testes de Intuição, e em testes de Percepção contra Enganação e Furtividade, até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
  },
  ESCAMAS_DRACONICAS: {
    name: 'Escamas Dracônicas',
    description: 'Você recebe +2 na Defesa e em Fortitude.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Escamas Dracônicas' },
        target: { type: 'Defense' },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Escamas Dracônicas' },
        target: { type: 'Skill', name: Skill.FORTITUDE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  ESCUDO_MAGICO: {
    name: 'Escudo Mágico',
    description:
      'Quando lança uma magia, você recebe um bônus na Defesa igual ao círculo da magia lançada até o início do seu próximo turno. ',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Wynna' }]],
  },
  ESPADA_JUSTICEIRA: {
    name: 'Espada Justiceira',
    description:
      'Você pode gastar 1 PM para encantar sua espada (ou outra arma corpo a corpo de corte que esteja empunhando). Ela tem seu dano aumentado em um passo até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
  },
  ESPADA_SOLAR: {
    name: 'Espada Solar',
    description:
      'Você pode gastar 1 PM para fazer uma arma corpo a corpo de corte que esteja empunhando causar +1d6 de dano por fogo até o fim da cena. ',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Azgher' }]],
  },
  EXTASE_DA_LOUCURA: {
    name: 'Êxtase da Loucura',
    description:
      'Toda vez que uma ou mais criaturas falham em um teste de Vontade contra uma de suas habilidades mágicas, você recebe 1 PM temporário cumulativo. Você pode ganhar um máximo de PM temporários por cena desta forma igual a sua Sabedoria.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.DEVOTO, name: 'Aharadak' }],
      [{ type: RequirementType.DEVOTO, name: 'Nimb' }],
    ],
  },
  FAMILIAR_OFIDICO: {
    name: 'Familiar Ofídico',
    description:
      'Você recebe um familiar cobra (veja a página 38) que não conta em seu limite de parceiros.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
  },
  FARSA_DO_FINGIDOR: {
    name: 'Farsa do Fingidor',
    description:
      'Você aprende e pode lançar Criar Ilusão. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Hynnin' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Farsa do Fingidor' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.criarIlusao],
          pick: 1,
        },
      },
    ],
  },
  FE_GUERREIRA: {
    name: 'Fé Guerreira',
    description:
      'Você pode usar Sabedoria para Guerra (em vez de Inteligência). Além disso, em combate, pode gastar 2 PM para substituir um teste de perícia (exceto testes de ataque) por um teste de Guerra.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
  },
  FORMA_DE_MACACO: {
    name: 'Forma de Macaco',
    description:
      'Você pode gastar uma ação completa e 2 PM para se transformar em um macaco. Você adquire tamanho Minúsculo (o que fornece +5 em Furtividade e –5 em testes de manobra) e recebe deslocamento de escalar 9m. Seu equipamento desaparece (e você perde seus benefícios) até você voltar ao normal, mas suas outras estatísticas não são alteradas. A transformação dura indefinidamente, mas termina caso você faça um ataque, lance uma magia ou sofra dano. ',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Hynnin' }]],
  },
  FULGOR_SOLAR: {
    name: 'Fulgor Solar',
    description:
      'Você recebe redução de frio e trevas 5. Além disso, quando é alvo de um ataque você pode gastar 1 PM para emitir um clarão solar que deixa o atacante ofuscado por uma rodada.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Azgher' }]],
  },
  FURIA_DIVINA: {
    name: 'Fúria Divina',
    description:
      'Você pode gastar 2 PM para invocar uma fúria selvagem, tornando-se temível em combate. Até o fim da cena, você recebe +2 em testes de ataque e rolagens de dano corpo a corpo, mas não pode executar nenhuma ação que exija paciência ou concentração (como usar a perícia Furtividade ou lançar magias). Se usar este poder em conjunto com a habilidade Fúria, ela também dura uma cena (e não termina se você não atacar ou for alvo de uma ação hostil).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Thwor' }]],
  },
  GOLPISTA_DIVINO: {
    name: 'Golpista Divino',
    description: 'Você recebe +2 em Enganação, Jogatina e Ladinagem.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Hynnin' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Golpista Divino' },
        target: { type: 'Skill', name: Skill.ENGANACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Golpista Divino' },
        target: { type: 'Skill', name: Skill.JOGATINA },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Golpista Divino' },
        target: { type: 'Skill', name: Skill.LADINAGEM },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  HABITANTE_DO_DESERTO: {
    name: 'Habitante do Deserto',
    description:
      'Você recebe redução de fogo 10 e pode pagar 1 PM para criar água pura e potável suficiente para um odre (ou outro recipiente pequeno).',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Azgher' }]],
  },
  INIMIGO_DE_TENEBRA: {
    name: 'Inimigo de Tenebra',
    description:
      'Seus ataques e habilidades causam +1d6 pontos de dano contra mortos-vivos. Quando você usa um efeito que gera luz, o alcance da iluminação dobra.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Azgher' }]],
  },
  KIAI_DIVINO: {
    name: 'Kiai Divino',
    description:
      'Uma vez por rodada, quando faz um ataque corpo a corpo, você pode pagar 3 PM. Se acertar o ataque, causa dano máximo, sem necessidade de rolar dados.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
  },
  LIBERDADE_DIVINA: {
    name: 'Liberdade Divina',
    description:
      'Você pode gastar 2 PM para receber imunidade a efeitos de movimento por uma rodada.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Valkaria' }]],
  },
  MANTO_DA_PENUMBRA: {
    name: 'Manto da Penumbra',
    description:
      'Você aprende e pode lançar Escuridão. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Manto da Penumbra' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.escuridao],
          pick: 1,
        },
      },
    ],
  },
  MENTE_ANALITICA: {
    name: 'Mente Analítica',
    description: 'Você recebe +2 em Intuição, Investigação e Vontade.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Mente Analítica' },
        target: { type: 'Skill', name: Skill.INTUICAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Mente Analítica' },
        target: { type: 'Skill', name: Skill.INVESTIGACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Mente Analítica' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  MENTE_VAZIA: {
    name: 'Mente Vazia',
    description: 'Você recebe +2 em Iniciativa, Percepção e Vontade.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Mente Vazia' },
        target: { type: 'Skill', name: Skill.INICIATIVA },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Mente Vazia' },
        target: { type: 'Skill', name: Skill.PERCEPCAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Mente Vazia' },
        target: { type: 'Skill', name: Skill.VONTADE },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  MESTRE_DOS_MARES: {
    name: 'Mestre dos Mares',
    description:
      'Você pode falar com animais aquáticos (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra criaturas aquáticas. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
  },
  OLHAR_AMEDRONTADOR: {
    name: 'Olhar Amedrontador',
    description:
      'Você aprende e pode lançar Amedrontar. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.DEVOTO, name: 'Megalokk' }],
      [{ type: RequirementType.DEVOTO, name: 'Thwor' }],
    ],
    sheetActions: [
      {
        source: { type: 'power', name: 'Olhar Amedrontador' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.amedrontar],
          pick: 1,
        },
      },
    ],
  },
  PALAVRAS_DE_BONDADE: {
    name: 'Palavras de Bondade',
    description:
      'Você aprende e pode lançar Enfeitiçar. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Palavras de Bondade' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.enfeiticar],
          pick: 1,
        },
      },
    ],
  },
  PERCEPCAO_TEMPORAL: {
    name: 'Percepção Temporal',
    description:
      'Você pode gastar 3 PM para somar sua Sabedoria (limitado por seu nível e não cumulativo com efeitos que somam este atributo) a seus ataques, Defesa e testes de Reflexos até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
  },
  PESQUISA_ABENCOADA: {
    name: 'Pesquisa Abençoada',
    description:
      'Se passar uma hora pesquisando seus livros e anotações, você pode rolar novamente um teste de perícia baseada em Inteligência ou Sabedoria que tenha feito desde a última cena. Se tiver acesso a mais livros, você recebe um bônus no teste: +2 para uma coleção particular ou biblioteca pequena e +5 para a biblioteca de um templo ou universidade.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
  },
  PODER_OCULTO: {
    name: 'Poder Oculto',
    description:
      'Você pode gastar uma ação de movimento e 2 PM para invocar a força, a rapidez ou o vigor dos loucos. Role 1d6 para receber +2 em Força (1 ou 2), Destreza (3 ou 4) ou Constituição (5 ou 6) até o fim da cena. Você pode usar este poder várias vezes, mas bônus no mesmo atributo não são cumulativos.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Nimb' }]],
  },
  PRESAS_PRIMORDIAIS: {
    name: 'Presas Primordiais',
    description:
      'Você pode gastar 1 PM para transformar seus dentes em presas afiadas até o fim da cena. Você recebe uma arma natural de mordida (dano 1d6, crítico x2, perfuração). Uma vez por rodada, quando usa a ação agredir com outra arma, você pode gastar 1 PM para fazer um ataque corpo a corpo extra com a mordida. Se já possuir outro ataque natural de mordida, em vez disso, o dano desse ataque aumenta em dois passos.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }],
      [{ type: RequirementType.DEVOTO, name: 'Megalokk' }],
    ],
  },
  PRESAS_VENENOSAS: {
    name: 'Presas venenosas',
    description:
      'Você pode gastar uma ação de movimento e 1 PM para envenenar uma arma corpo a corpo que esteja empunhando. Em caso de acerto, a arma causa perda de 1d12 pontos de vida. A arma permanece envenenada até atingir uma criatura ou até o fim da cena, o que acontecer primeiro.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
  },
  REPARAR_INJUSTICA: {
    name: 'Reparar Injustiça',
    description:
      'Uma vez por rodada, quando um oponente em alcance curto acerta um ataque em você ou em um de seus aliados, você pode gastar 2 PM para fazer este oponente repetir o ataque, escolhendo o pior entre os dois resultados.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Khalmyr' }]],
  },
  SANGUE_DE_FERRO: {
    name: 'Sangue de Ferro',
    description:
      'Você pode pagar 3 PM para receber +2 em rolagens de dano e redução de dano 5 até o fim da cena.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Arsenal' }]],
  },
  REJEICAO_DIVINA: {
    name: 'Rejeição Divina',
    description: 'Você recebe resistência a magia divina +5.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Aharadak' }]],
  },
  SANGUE_OFIDICO: {
    name: 'Sangue Ofídico',
    description:
      'Você recebe resistência a veneno +5 e a CD para resistir aos seus venenos aumenta em +2.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Sszzaas' }]],
  },
  SERVOS_DO_DRAGAO: {
    name: 'Servos do Dragão',
    description:
      'Você pode gastar uma ação completa e 2 PM para invocar 2d4+1 kobolds capangas em espaços desocupados em alcance curto. Você pode gastar uma ação de movimento para fazer os kobolds andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6–1 pontos de dano de perfuração cada). Os kobolds têm For –1, Des 1, Defesa 12, 1 PV e falham automaticamente em qualquer teste de resistência ou oposto. Eles desaparecem quando morrem ou no fim da cena. Os kobolds não agem sem receber uma ordem. Usos criativos para capangas fora de combate ficam a critério do mestre.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Kallyadranoch' }]],
  },
  SOPRO_DO_MAR: {
    name: 'Sopro do Mar',
    description:
      'Você pode gastar uma ação padrão e 1 PM para soprar vento marinho em um cone de 6m. Criaturas na área sofrem 2d6 pontos de dano de frio (Reflexos CD Sab reduz à metade). Você pode aprender Sopro das Uivantes como uma magia divina. Se fizer isso, o custo dela diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Oceano' }]],
  },
  SORTE_DOS_LOUCOS: {
    name: 'Sorte dos loucos',
    description:
      'Você pode pagar 1 PM para rolar novamente um teste recém realizado. Se ainda assim falhar no teste, você perde 1d6 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Nimb' }]],
  },
  TALENTO_ARTISTICO: {
    name: 'Talento Artístico',
    description: 'Você recebe +2 em Acrobacia, Atuação e Diplomacia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Marah' }]],
    sheetBonuses: [
      {
        source: { type: 'power', name: 'Talento Artístico' },
        target: { type: 'Skill', name: Skill.ACROBACIA },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Talento Artístico' },
        target: { type: 'Skill', name: Skill.ATUACAO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power', name: 'Talento Artístico' },
        target: { type: 'Skill', name: Skill.DIPLOMACIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  TEURGISTA_MISTICO: {
    name: 'Teurgista Místico',
    description:
      'Até uma magia de cada círculo que você aprender poderá ser escolhida entre magias divinas (se você for um conjurador arcano) ou entre magias arcanas (se for um conjurador divino). Pré-requisito: habilidade de classe Magias.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [
      [
        { type: RequirementType.HABILIDADE, name: 'Magias' },
        { type: RequirementType.DEVOTO, name: 'Wynna' },
      ],
    ],
  },
  TRADICAO_DE_LIN_WU: {
    name: 'Tradição de Lin-Wu',
    description:
      'Você considera a katana uma arma simples e, se for proficiente em armas marciais, recebe +1 na margem de ameaça com ela.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Lin-Wu' }]],
    sheetBonuses: [
      {
        source: {
          type: 'power',
          name: 'Tradição de Lin-Wu',
        },
        target: {
          type: 'WeaponCritical',
          weaponName: 'Katana',
          proficiencyRequired: true,
        },
        modifier: {
          type: 'Fixed',
          value: 1,
        },
      },
    ],
    // action(
    //   sheet: CharacterSheet,
    //   subSteps: { name: string; value: string }[]
    // ): CharacterSheet {
    //   const sheetClone = cloneDeep(sheet);

    //   subSteps.push({
    //     name: 'Tradição de Lin-Wu',
    //     value: 'Katana considerada arma simples.',
    //   });

    //   sheetClone.bag.equipments.Arma = sheetClone.bag.equipments.Arma.map(
    //     (item) => {
    //       if (item.nome === Armas.Katana.nome) {
    //         return {
    //           ...item,
    //           critico: `${item.critico} - 1`,
    //         };
    //       }
    //       return item;
    //     }
    //   );

    //   subSteps.push({
    //     name: 'Tradição de Lin-Wu',
    //     value: 'Margem de ameaça da Katana aumentada em 1.',
    //   });

    //   return sheetClone;
    // },
  },
  TRANSMISSAO_DA_LOUCURA: {
    name: 'Transmissão da Loucura',
    description:
      'Você pode lançar Sussurros Insanos (CD Car). Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Nimb' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Transmissão da Loucura' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle2.sussurosInsanos],
          pick: 1,
        },
      },
    ],
  },
  TROPAS_DUYSHIDAKK: {
    name: 'Tropas Duyshidakk',
    description:
      'Você pode gastar uma ação completa e 2 PM para invocar 1d4+1 goblinoides capangas em espaços desocupados em alcance curto. Você pode gastar uma ação de movimento para fazer os goblinoides andarem (eles têm deslocamento 9m) ou uma ação padrão para fazê-los causar dano a criaturas adjacentes (1d6+1 pontos de dano de corte cada). Os goblinoides têm For 1, Des 1, Defesa 15, 1 PV e falham automaticamente em qualquer teste de resistência ou oposto. Eles desaparecem quando morrem ou no fim da cena. Os goblinoides não agem sem receber uma ordem. Usos criativos para capangas fora de combate ficam a critério do mestre',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Thwor' }]],
  },
  URRO_DIVINO: {
    name: 'Urro Divino',
    description:
      'Quando faz um ataque ou lança uma magia, você pode pagar 1 PM para somar sua Constituição (mínimo +1) à rolagem de dano desse ataque ou magia.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Megalokk' }]],
  },
  VISAO_NAS_TREVAS: {
    name: 'Visão nas Trevas',
    description:
      'Você enxerga perfeitamente no escuro, incluindo em magias de escuridão.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
  },
  VOZ_DA_CIVILIZACAO: {
    name: 'Voz da Civilização',
    description: 'Você está sempre sob efeito de Compreensão.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tanna-Toh' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Voz da Civilização' },
        action: {
          type: 'addVozCivilizacaoSpell',
        },
      },
    ],
  },
  VOZ_DA_NATUREZA: {
    name: 'Voz da Natureza',
    description:
      'Você pode falar com animais (como o efeito da magia Voz Divina) e aprende e pode lançar Acalmar Animal, mas só contra animais. Caso aprenda novamente essa magia, seu custo diminui em –1 PM.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Allihanna' }]],
    sheetActions: [
      {
        source: { type: 'power', name: 'Voz da Natureza' },
        action: {
          type: 'learnSpell',
          availableSpells: [spellsCircle1.acalmarAnimal],
          pick: 1,
        },
      },
    ],
  },
  VOZ_DOS_MONSTROS: {
    name: 'Voz dos Monstros',
    description:
      'Você conhece os idiomas de todos os monstros inteligentes e pode se comunicar livremente com monstros não inteligentes (Int –4 ou menor), como se estivesse sob efeito da magia Voz Divina.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Megalokk' }]],
  },
  ZUMBIFICAR: {
    name: 'Zumbificar',
    description:
      'Você pode gastar uma ação completa e 3 PM para reanimar o cadáver de uma criatura Pequena ou Média adjacente por um dia. O cadáver funciona como um parceiro iniciante de um tipo a sua escolha entre combatente, fortão ou guardião. Além disso, quando sofre dano, você pode sacrificar esse parceiro; se fizer isso, você sofre apenas metade do dano, mas o cadáver é destruído.',
    type: GeneralPowerType.CONCEDIDOS,
    requirements: [[{ type: RequirementType.DEVOTO, name: 'Tenebra' }]],
  },
};

export default GRANTED_POWERS;
