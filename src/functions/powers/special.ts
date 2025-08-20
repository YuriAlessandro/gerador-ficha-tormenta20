import CharacterSheet, { SubStep } from '@/interfaces/CharacterSheet';
import { RaceAbility } from '@/interfaces/Race';
import Skill from '@/interfaces/Skills';
import tormentaPowers from '@/data/powers/tormentaPowers';
import {
  buildTabuAbility,
  NATUREZA_ABILITIES,
  PRESENTES_DATA,
} from '@/data/races/duende';
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

export function applyDuendePowers(sheet: CharacterSheet): SubStep[] {
  const subSteps: SubStep[] = [];

  function applyDuendeTamanho() {
    const tamanho = getRandomItemFromArray([
      'Minúsculo',
      'Pequeno',
      'Médio',
      'Grande',
    ]);

    const displacement = sheet.raca.getDisplacement?.(sheet.raca) ?? 9;

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
      sheet.displacement = displacement;
      subSteps.push({
        name: 'Tamanho',
        value: `Médio (${displacement}m deslocamento)`,
      });
    } else if (tamanho === 'Grande') {
      sheet.size = RACE_SIZES.GRANDE;
      sheet.displacement = displacement;
      sheet.atributos[Atributo.DESTREZA].mod -= 1;
      subSteps.push({
        name: 'Tamanho',
        value: `Grande (-1 Destreza, ${displacement}m deslocamento)`,
      });
    } else {
      subSteps.push({ name: 'Tamanho', value: 'Padrão' });
    }
  }

  function applyDuendeNatureza() {
    const natureza = getRandomItemFromArray(Object.keys(NATUREZA_ABILITIES));
    const abilities = NATUREZA_ABILITIES[natureza];

    if (abilities) {
      sheet.raca.abilities?.push(...abilities);
    }

    subSteps.push({
      name: 'Natureza',
      value: natureza,
    });
  }

  function applyDuendePresentes() {
    const presentes = pickFromArray(Object.keys(PRESENTES_DATA), 3);
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
  }

  function applyDuendeTabu() {
    const tabuSkill = getRandomItemFromArray([
      Skill.DIPLOMACIA,
      Skill.INICIATIVA,
      Skill.LUTA,
      Skill.PERCEPCAO,
    ]);

    const tabuAbility = buildTabuAbility(tabuSkill);
    sheet.raca.abilities?.push(tabuAbility);
    const [newSheet, newSubSteps] = applyPower(sheet, tabuAbility);
    Object.assign(sheet, newSheet);
    subSteps.push(...newSubSteps);
    subSteps.push({ name: 'Tabu', value: `-5 em ${tabuSkill}` });
  }

  applyDuendeTamanho();
  applyDuendeNatureza();
  applyDuendePresentes();
  applyDuendeTabu();

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
