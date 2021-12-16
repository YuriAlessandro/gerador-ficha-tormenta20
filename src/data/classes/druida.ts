import _ from 'lodash';
import { pickFromArray } from '../../functions/randomUtils';
import CharacterSheet, { SubStep } from '../../interfaces/CharacterSheet';
import { ClassDescription } from '../../interfaces/Class';
import { RequirementType } from '../../interfaces/Poderes';
import Skills from '../../interfaces/Skills';
import { allSpellSchools } from '../../interfaces/Spells';
import { Atributo } from '../atributos';
import PROFICIENCIAS from '../proficiencias';

const DRUIDA: ClassDescription = {
  name: 'Druida',
  pv: 16,
  addpv: 4,
  pm: 4,
  addpm: 4,
  periciasbasicas: [
    {
      type: 'and',
      list: [Skills.SOBREVIVENCIA, Skills.VONTADE],
    },
  ],
  periciasrestantes: {
    qtd: 4,
    list: [
      Skills.ADESTRAMENTO,
      Skills.ATLETISMO,
      Skills.CAVALGAR,
      Skills.CONHECIMENTO,
      Skills.CURA,
      Skills.FORTITUDE,
      Skills.INICIATIVA,
      Skills.INTUICAO,
      Skills.LUTA,
      Skills.MISTICISMO,
      Skills.OFICIO,
      Skills.PERCEPCAO,
      Skills.RELIGIAO,
    ],
  },
  proficiencias: [
    PROFICIENCIAS.SIMPLES,
    PROFICIENCIAS.LEVES,
    PROFICIENCIAS.ESCUDOS,
  ],
  abilities: [
    {
      name: 'Devoto',
      text:
        'Você se torna devoto de uma divindade disponível para druidas (Allihanna, Megalokk ou Oceano). Você deve obedecer às Obrigações & Restrições de seu deus, mas, em troca, ganha os Poderes Concedidos dele. O nome desta habilidade muda de acordo com a divindade escolhida: Devoto de Allihanna, Devoto de Megalokk ou Devoto de Oceano.',
      nivel: 1,
    },
    {
      name: 'Empatia Selvagem',
      text:
        'Você pode se comunicar com animais por meio de linguagem corporal e vocalizações. Você pode usar Adestramento com animais para mudar atitude e pedir favores (veja Diplomacia, na página 117).',
      nivel: 1,
    },
    {
      name: 'Magias',
      text:
        'Escolha três escolas de magia. Uma vez feita, essa escolha não pode ser mudada. Você pode lançar magias divinas de 1º círculo que pertençam a essas escolas. À medida que sobe de nível, pode lançar magias de círculos maiores (2º círculo no 6º nível, 3º círculo no 10º nível e 4º círculo no 14º nível). Você começa com duas magias de 1º círculo. A cada nível par (2º, 4º etc.), aprende uma magia de qualquer círculo e escola que possa lançar. Seu atributo-chave para lançar magias é Sabedoria e você soma seu bônus de Sabedoria no seu total de PM. Veja o Capítulo 4 para as regras de magia.',
      nivel: 1,
      action(sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet {
        const sheetClone = _.cloneDeep(sheet);

        const finalPM = sheet.pm + sheet.atributos.Sabedoria.mod;
        substeps.push({
          name: 'Magias',
          value: `+(Mod SAB) PMs inicias (${sheet.pm} + ${sheet.atributos.Sabedoria.mod} = ${finalPM})`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          pm: finalPM,
        });
      },
    },
    {
      name: 'Caminho dos Ermos',
      text:
        'Você pode atravessar terrenos difíceis sem sofrer redução em seu deslocamento e a CD para rastreá-lo aumenta em +10. Esta habilidade só funciona em terrenos naturais.',
      nivel: 2,
    },
    {
      name: 'Força da Natureza',
      text:
        'Você diminui o custo de todas as suas magias em –2 PM e aumenta a CD delas em +2. Os bônus dobram (–4 PM e +4 na CD) se você estiver em terrenos naturais.',
      nivel: 20,
    },
  ],
  powers: [
    {
      name: 'Aspecto do Inverno',
      text:
        'Você recebe resistência a frio 5 e suas magias que causam dano de frio causam +1 ponto de dano por dado. Durante o inverno, suas magias de druida custam −1 PM.',
      requirements: [[]],
    },
    {
      name: 'Aspecto do Outono',
      text:
        'Você aprende uma magia de necromancia, arcana ou divina, de qualquer círculo que possa lançar. Você pode gastar 1 PM para impor uma penalidade de –2 nos testes de resistência de todos os inimigos em alcance médio até o início do seu próximo turno. Durante o outono, suas magias de druida custam −1 PM.',
      requirements: [[]],
    },
    {
      name: 'Aspecto da Primavera',
      text:
        'Você recebe +1 em Carisma (NÃO CONTABILIZADO) e suas magias de cura curam +1 PV por dado. Durante a primavera, suas magias de druida custam −1 PM.',
      requirements: [[]],
    },
    {
      name: 'Aspecto do Verão',
      text:
        'Você recebe +2 em Iniciativa (JÁ CONTABILIZADO) e pode gastar 1 PM para cobrir suas armas ou armas naturais com chamas, causando +1d6 pontos de dano de fogo até o fim da cena. Durante o verão, suas magias de druida custam −1 PM.',
      requirements: [[]],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Iniciativa') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Aspecto do Verão',
          value: `+2 em Iniciativa`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Aumento de Atributo',
      text:
        'Você recebe +2 em um atributo a sua escolha (NÃO CONTABILIZADO). Você pode escolher este poder várias vezes. A partir da segunda vez que escolhê-lo para o mesmo atributo, o aumento diminui para +1.',
      requirements: [[]],
      canRepeat: true,
    },
    {
      name: 'Companheiro Animal',
      text:
        'Você recebe um companheiro animal. Veja o quadro a seguir para detalhes.',
      requirements: [[{ type: RequirementType.PERICIA, name: 'Adestramento' }]],
    },
    {
      name: 'Companheiro Animal Adicional',
      text:
        'Você recebe um companheiro animal adicional, de um tipo diferente dos que já tenha. Você pode escolher este poder quantas vezes quiser, mas ainda está sujeito ao limite de aliados que pode ter (veja a página 246)',
      requirements: [
        [
          { type: RequirementType.ATRIBUTO, name: 'Carisma', value: 15 },
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 7 },
        ],
      ],
      canRepeat: true,
    },
    {
      name: 'Companheiro Animal Aprimorado',
      text:
        'Escolha um de seus companheiros animais. Esse animal recebe um segundo tipo diferente, ganhando os bônus equivalentes. Por exemplo, se você tiver um companheiro guardião, pode adicionar o tipo fortão a ele, tornando-o um guardião fortão que concede +2 na Defesa e +1d8 nas rolagens de dano corpo a corpo.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Companheiro Animal Lendário',
      text:
        'Escolha um de seus companheiros animais. Esse animal passa a dobrar seus bônus concedidos. No caso de companheiros que concedem dados de bônus, o número de dados aumenta em 1.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 18 },
        ],
      ],
    },
    {
      name: 'Companheiro Animal Mágico',
      text:
        'Escolha um de seus companheiros animais. Esse animal recebe um segundo tipo diferente, entre destruidor ou médico, ganhando os bônus equivalentes.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Companheiro Animal' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Coração da Selva',
      text:
        'Você recebe +2 em Fortitude (JÁ CONTABILIZADO) e se torna imune a venenos.',
      requirements: [[]],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Fortitude') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Coração da Selva',
          value: `+2 em Fortitude`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Espírito dos Equinócios',
      text:
        'Sua alma e corpo estão em equilíbrio. Você pode gastar 1 PM para escolher 10 em um teste de resistência.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Aspecto da Primavera' },
          { type: RequirementType.PODER, name: 'Aspecto do Outono' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Espírito dos Solstícios',
      text:
        'Você transita entre os extremos do mundo natural. Quando lança uma magia, pode gastar +4 PM para maximizar os efeitos numéricos variáveis dela. Por exemplo, uma magia Curar Ferimentos aprimorada para curar 5d8+5 PV irá curar automaticamente 45 PV, sem a necessidade de rolar dados. Uma magia sem efeitos variáveis não pode ser afetada por este poder.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Aspecto do Inverno' },
          { type: RequirementType.PODER, name: 'Aspecto do Verão' },
          { type: RequirementType.NIVEL, value: 10 },
        ],
      ],
    },
    {
      name: 'Força dos Penhascos',
      text:
        'Você recebe +2 em Fortitude (JÁ CONTABILIZADO). Se estiver pisando em rocha sólida, pode gastar 1 PM e uma reação para receber RD 10 contra um ataque.',
      requirements: [[]],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Fortitude') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Força dos Penhascos',
          value: `Somando +2 em Fortitude`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Forma Primal',
      text:
        'Quando usa Forma Selvagem, você pode se transformar em uma fera primal. Você recebe os benefícios de dois tipos de animais (bônus iguais não se acumulam; use o que você quiser de cada tipo).',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Forma Selvagem', value: 2 },
          { type: RequirementType.NIVEL, value: 18 },
        ],
      ],
    },
    {
      name: 'Forma Selvagem',
      text:
        'Você pode se transformar em um tipo de animal. Veja a seguir. Você pode escolher este poder diversas vezes. A cada vez, aprende uma forma selvagem diferente.',
      requirements: [[]],
      canRepeat: true,
    },
    {
      name: 'Liberdade da Pradaria',
      text:
        'Você recebe +2 em Reflexos (JÁ CONTABILIZADO). Se estiver ao ar livre, você pode gastar 1 PM sempre que lançar uma magia para aumentar o alcance dela em um passo (de toque para curto, de curto para médio etc.).',
      requirements: [[]],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Reflexos') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Liberdade da Pradaria',
          value: `Somando +2 em Reflexos`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
    {
      name: 'Magia Natural',
      text: 'Você pode lançar magias em forma selvagem.',
      requirements: [
        [
          { type: RequirementType.PODER, name: 'Forma Selvagem' },
          { type: RequirementType.NIVEL, value: 8 },
        ],
      ],
    },
    {
      name: 'Presas Afiadas',
      text:
        'A margem de ameaça de suas armas naturais em forma selvagem aumenta em +2.',
      requirements: [[{ type: RequirementType.PODER, name: 'Forma Selvagem' }]],
    },
    {
      name: 'Segredos da Natureza',
      text:
        'Você aprende duas magias de qualquer círculo que possa lançar. Elas devem pertencer às escolas que você sabe usar, mas podem ser arcanas ou divinas. Você pode escolher este poder quantas vezes quiser.',
      requirements: [[]],
    },
    {
      name: 'Tranquilidade dos Lagos',
      text:
        'Você recebe +2 em Vontade (JÁ CONTABILIZADO). Se estiver em alcance médio de um lago, rio ou equivalente, pode gastar 1 PM uma vez por rodada para repetir um teste de resistência recém realizado.',
      requirements: [[]],
      action: (sheet: CharacterSheet, substeps: SubStep[]): CharacterSheet => {
        const sheetClone = _.cloneDeep(sheet);

        const newCompleteSkills = sheetClone.completeSkills?.map((sk) => {
          let value = sk.others ?? 0;

          if (sk.name === 'Vontade') {
            value += 2;
          }

          return { ...sk, others: value };
        });

        substeps.push({
          name: 'Tranquilidade dos Lagos',
          value: `Somando +2 em Vontade`,
        });

        return _.merge<CharacterSheet, Partial<CharacterSheet>>(sheetClone, {
          completeSkills: newCompleteSkills,
        });
      },
    },
  ],
  probDevoto: 1,
  qtdPoderesConcedidos: 'all',
  faithProbability: {
    AHARADAK: 0,
    OCEANO: 1,
    TENEBRA: 0,
    VALKARIA: 0,
    WYNNA: 0,
    LENA: 0,
    SSZZAAS: 0,
    THYATIS: 0,
    ARSENAL: 0,
    TANNATOH: 0,
    ALLIHANNA: 1,
    MARAH: 0,
    KALLYADRANOCH: 0,
    KHALMYR: 0,
    THWOR: 0,
    HYNINN: 0,
    AZGHER: 0,
    LINWU: 0,
    MEGALOKK: 1,
    NIMB: 0,
  },
  attrPriority: [Atributo.SABEDORIA],
  setup: (classe) => {
    const modifiedClasse = _.cloneDeep(classe);
    modifiedClasse.spellPath = {
      initialSpells: 2,
      spellType: 'Divine',
      qtySpellsLearnAtLevel: (level) => (level % 2 === 0 ? 1 : 0),
      schools: pickFromArray(allSpellSchools, 3),
      spellCircleAvailableAtLevel: (level) => {
        if (level < 6) return 1;
        if (level < 10) return 2;
        if (level < 14) return 3;
        return 4;
      },
      keyAttribute: Atributo.SABEDORIA,
    };

    return modifiedClasse;
  },
};

export default DRUIDA;
