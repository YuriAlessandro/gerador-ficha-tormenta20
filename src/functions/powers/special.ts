import CharacterSheet, { SubStep } from '@/interfaces/CharacterSheet';
import { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import tormentaPowers from '@/data/powers/tormentaPowers';
import { PRESENTES_DATA } from '@/data/races/duende';
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

function applyDuendeTamanho(sheet: CharacterSheet, tamanho: string): SubStep[] {
  if (tamanho === 'Minúsculo') {
    sheet.size = RACE_SIZES.MINUSCULO;
    sheet.displacement = 6;
    sheet.atributos[Atributo.FORCA].mod -= 1;
    return [
      {
        name: 'Tamanho',
        value: 'Minúsculo (-1 Força, 6m deslocamento)',
      },
    ];
  }
  if (tamanho === 'Pequeno') {
    sheet.size = RACE_SIZES.PEQUENO;
    sheet.displacement = 6;
    return [{ name: 'Tamanho', value: 'Pequeno (6m deslocamento)' }];
  }
  if (tamanho === 'Médio') {
    sheet.size = RACE_SIZES.MEDIO;
    sheet.displacement = 9;
    return [{ name: 'Tamanho', value: 'Médio (9m deslocamento)' }];
  }
  if (tamanho === 'Grande') {
    sheet.size = RACE_SIZES.GRANDE;
    sheet.displacement = 9;
    sheet.atributos[Atributo.DESTREZA].mod -= 1;
    return [
      {
        name: 'Tamanho',
        value: 'Grande (-1 Destreza, 9m deslocamento)',
      },
    ];
  }
  return [{ name: 'Tamanho', value: 'Padrão' }];
}

function applyDuendeNatureza(
  sheet: CharacterSheet,
  natureza: string
): SubStep[] {
  if (natureza === 'Animal') {
    sheet.raca.abilities?.push({
      name: 'Natureza Animal',
      description:
        'Você é feito de carne e osso, com um corpo humanoide de aparência variada. Você recebe +1 em um atributo à sua escolha. Este bônus PODE ser acumulado com um dos outros bônus de atributo do Duende, para um total de +2 em um atributo.',
    });
    return [
      {
        name: 'Natureza',
        value: 'Animal (+1 em atributo à escolha)',
      },
    ];
  }
  if (natureza === 'Vegetal') {
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
    return [{ name: 'Natureza', value: 'Vegetal' }];
  }
  if (natureza === 'Mineral') {
    sheet.raca.abilities?.push({
      name: 'Natureza Mineral',
      description:
        'Você é feito de material inorgânico como argila, rocha ou cristal. Você tem imunidade a efeitos de metabolismo e Redução de Dano 5 contra corte, fogo e perfuração. Você não se beneficia de itens da categoria alimentação.',
    });
    return [{ name: 'Natureza', value: 'Mineral' }];
  }
  return [{ name: 'Natureza', value: 'Nenhuma' }];
}

function applyDuendePresentes(
  sheet: CharacterSheet,
  presentes: string[]
): SubStep[] {
  const subSteps: SubStep[] = [];
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
  return subSteps;
}

function applyDuendeTabu(sheet: CharacterSheet, tabu: string): SubStep[] {
  const subSteps: SubStep[] = [];
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

  subSteps.push(...applyDuendeTamanho(sheet, choices.tamanho));
  subSteps.push(...applyDuendeNatureza(sheet, choices.natureza));
  subSteps.push(...applyDuendePresentes(sheet, choices.presentes));
  subSteps.push(...applyDuendeTabu(sheet, choices.tabu));

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
