import CharacterSheet, { SubStep } from '@/interfaces/CharacterSheet';
import { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import tormentaPowers from '@/data/powers/tormentaPowers';
import HUMANO from '@/data/races/humano';
import { Atributo } from '@/data/atributos';
import { RACE_SIZES } from '@/data/races/raceSizes/raceSizes';
import {
  getNotRepeatedRandom,
  getRandomItemFromArray,
  pickFromArray,
} from '../randomUtils';
import { getPowersAllowedByRequirements } from '../powers';
import { addOtherBonusToSkill } from '../skills/general';
import { applyPower } from '../general';

const PRESENTES_DATA: { [key: string]: RaceAbility } = {
  'Afinidade Elemental (Água)': {
    name: 'Afinidade Elemental (Água)',
    description:
      'Sua ligação com o elemento água lhe concede deslocamento de natação igual ao seu deslocamento base. Você pode lançar as magias Criar Elementos (apenas água) e Névoa. Seu atributo-chave para estas magias é Carisma.',
  },
  'Afinidade Elemental (Fogo)': {
    name: 'Afinidade Elemental (Fogo)',
    description:
      'Sua ligação com o elemento fogo lhe concede redução de dano de fogo 5. Você pode lançar as magias Criar Elementos (apenas fogo) e Explosão de Chamas. Seu atributo-chave para estas magias é Carisma.',
  },
  'Afinidade Elemental (Vegetação)': {
    name: 'Afinidade Elemental (Vegetação)',
    description:
      'Sua ligação com a vegetação permite que você atravesse terrenos difíceis naturais sem sofrer redução no deslocamento. Você pode lançar as magias Armamento da Natureza e Controlar Plantas. Seu atributo-chave para estas magias é Carisma.',
  },
  'Encantar Objetos': {
    name: 'Encantar Objetos',
    description:
      'Você pode gastar uma ação de movimento e 3 PM para tocar um item e aplicar a ele um encanto (sem pré-requisitos) que dura até o fim da cena.',
  },
  Enfeitiçar: {
    name: 'Enfeitiçar',
    description:
      'Você pode lançar a magia Enfeitiçar e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
  },
  Invisibilidade: {
    name: 'Invisibilidade',
    description:
      'Você pode lançar a magia Invisibilidade e seus aprimoramentos como se tivesse acesso aos mesmos círculos de magia que um arcanista de seu nível. A CD para resistência é baseada em Carisma.',
  },
  'Língua da Natureza': {
    name: 'Língua da Natureza',
    description:
      'Você pode falar com animais e plantas e recebe +2 em Adestramento e Sobrevivência.',
    sheetBonuses: [
      {
        source: { type: 'power' as const, name: 'Língua da Natureza' },
        target: { type: 'Skill', name: Skill.ADESTRAMENTO },
        modifier: { type: 'Fixed', value: 2 },
      },
      {
        source: { type: 'power' as const, name: 'Língua da Natureza' },
        target: { type: 'Skill', name: Skill.SOBREVIVENCIA },
        modifier: { type: 'Fixed', value: 2 },
      },
    ],
  },
  Maldição: {
    name: 'Maldição',
    description:
      'Você pode gastar uma ação padrão e 3 PM para amaldiçoar uma criatura em alcance curto. A vítima tem direito a um teste de resistência (Fortitude ou Vontade, escolhido na criação do duende). Se falhar, sofre um efeito permanente (escolhido de uma lista na criação do duende) até ser cancelado ou curado. Você só pode manter uma maldição por vez.',
  },
  'Mais Lá do que Aqui': {
    name: 'Mais Lá do que Aqui',
    description:
      'Você pode gastar uma ação padrão e 2 PM para fazer a maior parte do seu corpo desaparecer por uma cena, recebendo camuflagem leve e +5 em Furtividade.',
    sheetBonuses: [
      {
        source: { type: 'power' as const, name: 'Mais Lá do que Aqui' },
        target: { type: 'Skill', name: Skill.FURTIVIDADE },
        modifier: { type: 'Fixed', value: 5 },
      },
    ],
  },
  'Metamorfose Animal': {
    name: 'Metamorfose Animal',
    description:
      'Você pode se transformar em um tipo de animal. Escolha uma forma selvagem básica do druida. Você pode gastar uma ação completa e 3 PM para assumir essa forma. Você pode falar e lançar magias em sua forma animal.',
  },
  'Sonhos Proféticos': {
    name: 'Sonhos Proféticos',
    description:
      'Uma vez por cena, você pode gastar 3 PM e rolar 1d20. Até o fim da cena, você pode substituir o resultado do d20 de um teste de uma criatura em alcance curto pelo resultado que você rolou.',
  },
  'Velocidade do Pensamento': {
    name: 'Velocidade do Pensamento',
    description:
      'No primeiro turno de cada cena, você pode gastar 2 PM para realizar uma ação padrão adicional, mas em troca pula o seu turno na segunda rodada.',
  },
  'Visão Feérica': {
    name: 'Visão Feérica',
    description:
      'Você recebe visão na penumbra e está permanentemente sob efeito da magia Visão Mística (com o aprimoramento para ver criaturas invisíveis).',
  },
  Voo: {
    name: 'Voo',
    description:
      'Você pode flutuar a 1,5m do chão com deslocamento de seu deslocamento base +3m e é imune a dano por queda. Pode voar de verdade gastando 1 PM por rodada, com deslocamento de seu deslocamento base +6m.',
  },
};

export function applyHumanoVersatil(sheet: CharacterSheet): SubStep[] {
  const substeps: SubStep[] = [];
  const randomSkill = getNotRepeatedRandom(sheet.skills, Object.values(Skill));
  sheet.skills.push(randomSkill);

  const shouldGetSkill = Math.random() > 0.5;

  if (shouldGetSkill) {
    const randomSecondSkill = getNotRepeatedRandom(
      sheet.skills,
      Object.values(Skill)
    );
    sheet.skills.push(randomSecondSkill);
    substeps.push({
      name: 'Versátil',
      value: `Perícia treinada (${randomSecondSkill})`,
    });
  } else {
    const allowedPowers = getPowersAllowedByRequirements(sheet);
    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      allowedPowers
    );
    sheet.generalPowers.push(randomPower);
    substeps.push({
      name: 'Versátil',
      value: `Poder geral recebido (${randomPower.name})`,
    });
  }

  return substeps;
}

export function applyLefouDeformidade(sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];
  const randomNumber = Math.random();

  const allSkills = Object.values(Skill);
  const shouldGetSkill = randomNumber < 0.5;

  const pickedSkills = pickFromArray(allSkills, shouldGetSkill ? 2 : 1);
  pickedSkills.forEach((randomSkill) => {
    addOtherBonusToSkill(sheet, randomSkill, 2);
    subSteps.push({
      name: 'Deformidade',
      value: `+2 em Perícia (${randomSkill})`,
    });
  });

  if (!shouldGetSkill) {
    const allowedPowers = Object.values(tormentaPowers);
    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      allowedPowers
    );
    sheet.generalPowers.push(randomPower);

    subSteps.push({
      name: 'Deformidade',
      value: `Poder da Tormenta recebido (${randomPower.name})`,
    });
  }

  return subSteps;
}

export function applyDuendePowers(sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];

  // This is a placeholder for the choices UI that would be implemented.
  // For now, we will make random choices to simulate the logic.
  const choices = {
    tamanho: getRandomItemFromArray([
      'Minúsculo',
      'Pequeno',
      'Médio',
      'Grande',
    ]),
    natureza: getRandomItemFromArray(['Animal', 'Vegetal', 'Mineral']),
    presentes: pickFromArray(Object.keys(PRESENTES_DATA), 3),
    tabu: getRandomItemFromArray([
      'Diplomacia',
      'Iniciativa',
      'Luta',
      'Percepção',
    ]),
  };

  // Tamanho
  const { tamanho } = choices;
  if (tamanho === 'Minúsculo') {
    sheet.size = RACE_SIZES.MINUSCULO;
    sheet.displacement = 6;
    sheet.atributos[Atributo.FORCA].mod -= 1;
    subSteps.push({
      name: 'Tamanho',
      value: 'Minúsculo (-1 Força, 6m deslocamento)',
    });
  } else if (tamanho === 'Pequeno') {
    sheet.size = RACE_SIZES.PEQUENO;
    sheet.displacement = 6;
    subSteps.push({ name: 'Tamanho', value: 'Pequeno (6m deslocamento)' });
  } else if (tamanho === 'Médio') {
    sheet.size = RACE_SIZES.MEDIO;
    sheet.displacement = 9;
    subSteps.push({ name: 'Tamanho', value: 'Médio (9m deslocamento)' });
  } else if (tamanho === 'Grande') {
    sheet.size = RACE_SIZES.GRANDE;
    sheet.displacement = 9;
    sheet.atributos[Atributo.DESTREZA].mod -= 1;
    subSteps.push({
      name: 'Tamanho',
      value: 'Grande (-1 Destreza, 9m deslocamento)',
    });
  }

  // Natureza
  const { natureza } = choices;
  if (natureza === 'Animal') {
    sheet.raca.abilities?.push({
      name: 'Natureza Animal',
      description:
        'Você é feito de carne e osso, com um corpo humanoide de aparência variada. Você recebe +1 em um atributo à sua escolha. Este bônus PODE ser acumulado com um dos outros bônus de atributo do Duende, para um total de +2 em um atributo.',
    });
    subSteps.push({
      name: 'Natureza',
      value: 'Animal (+1 em atributo à escolha)',
    });
  } else if (natureza === 'Vegetal') {
    sheet.raca.abilities?.push(
      {
        name: 'Natureza Vegetal',
        description:
          'Você é feito de material orgânico como folhas, vinhas ou madeira. Você é imune a atordoamento e metamorfose. É afetado por efeitos que afetam plantas monstruosas; se o efeito não tiver teste de resistência, você tem direito a um teste de Fortitude.',
      },
      {
        name: 'Florescer Feérico',
        description:
          'Uma vez por rodada, você pode gastar uma quantidade de PM limitada pela sua Constituição para curar 2d8 Pontos de Vida por PM gasto no início do seu próximo turno.',
      }
    );
    subSteps.push({ name: 'Natureza', value: 'Vegetal' });
  } else if (natureza === 'Mineral') {
    sheet.raca.abilities?.push({
      name: 'Natureza Mineral',
      description:
        'Você é feito de material inorgânico como argila, rocha ou cristal. Você tem imunidade a efeitos de metabolismo e Redução de Dano 5 contra corte, fogo e perfuração. Você não se beneficia de itens da categoria alimentação.',
    });
    subSteps.push({ name: 'Natureza', value: 'Mineral' });
  }

  // Presentes
  const { presentes } = choices;
  presentes.forEach((presente: string) => {
    const presenteData = PRESENTES_DATA[presente];
    if (presenteData) {
      sheet.raca.abilities?.push(presenteData);
      const [newSheet, newSubSteps] = applyPower(sheet, presenteData);
      Object.assign(sheet, newSheet);
      subSteps.push(...newSubSteps);
      subSteps.push({ name: 'Presente', value: presente });
    }
  });

  // Tabu
  const { tabu } = choices;
  const tabuAbility: RaceAbility = {
    name: 'Tabu',
    description: `Você possui uma regra de comportamento que nunca pode quebrar (definida com o mestre). Você deve escolher uma das seguintes perícias para sofrer -5 de penalidade: Diplomacia, Iniciativa, Luta ou Percepção. A perícia escolhida foi: ${tabu}. Quebrar o tabu acarreta em penalidades diárias e cumulativas: 1º dia fatigado, 2º dia exausto, 3º dia morto.`,
    sheetBonuses: [
      {
        source: { type: 'power' as const, name: 'Tabu' },
        target: { type: 'Skill', name: tabu as Skill },
        modifier: { type: 'Fixed', value: -5 },
      },
    ],
  };
  sheet.raca.abilities?.push(tabuAbility);
  const [newSheet, newSubSteps] = applyPower(sheet, tabuAbility);
  Object.assign(sheet, newSheet);
  subSteps.push(...newSubSteps);
  subSteps.push({ name: 'Tabu', value: `-5 em ${tabu}` });

  return subSteps;
}

export function applyOsteonMemoriaPostuma(_sheet: CharacterSheet): SubStep[] {
  function addSkillOrGeneralPower(sheet: CharacterSheet, substeps: SubStep[]) {
    const shouldGetSkill = Math.random() > 0.5;

    if (shouldGetSkill) {
      const randomSkill = getNotRepeatedRandom(
        sheet.skills,
        Object.values(Skill)
      );
      sheet.skills.push(randomSkill);
      substeps.push({
        name: 'Memória Póstuma',
        value: `Perícia treinada (${randomSkill})`,
      });
    } else {
      const allowedPowers = getPowersAllowedByRequirements(sheet);
      const randomPower = getNotRepeatedRandom(
        sheet.generalPowers,
        allowedPowers
      );
      sheet.generalPowers.push(randomPower);
      substeps.push({
        name: 'Memória Póstuma',
        value: `Poder geral recebido (${randomPower.name})`,
      });
    }
  }

  function getAndApplyRandomOldRaceAbility(
    sheet: CharacterSheet,
    substeps: SubStep[]
  ) {
    if (sheet.raca.oldRace?.abilities) {
      const randomAbility = getRandomItemFromArray(
        sheet.raca.oldRace.abilities
      );
      sheet.raca.abilities?.push(randomAbility);
      substeps.push({
        name: 'Memória Póstuma',
        value: `${sheet.raca.oldRace.name} (${randomAbility.name})`,
      });

      applyPower(sheet, randomAbility);
    }

    return sheet;
  }

  const subSteps: SubStep[] = [];

  if (_sheet.raca.oldRace) {
    if (_sheet.raca.oldRace.name === HUMANO.name) {
      addSkillOrGeneralPower(_sheet, subSteps);
    } else if (_sheet.raca.oldRace.abilities) {
      _sheet = getAndApplyRandomOldRaceAbility(_sheet, subSteps);
    }
  }

  return subSteps;
}
