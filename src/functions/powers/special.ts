import CharacterSheet, { SubStep } from '@/interfaces/CharacterSheet';
import Skill from '@/interfaces/Skills';
import { SelectionOptions } from '@/interfaces/PowerSelections';
import { GeneralPower } from '@/interfaces/Poderes';
import tormentaPowers from '@/data/systems/tormenta20/powers/tormentaPowers';
import originPowers from '@/data/systems/tormenta20/powers/originPowers';
import HUMANO from '@/data/systems/tormenta20/races/humano';
import {
  getNotRepeatedRandom,
  getRandomItemFromArray,
  pickFromArray,
} from '../randomUtils';
import { getPowersAllowedByRequirements } from '../powers';
import { addOtherBonusToSkill } from '../skills/general';
import { applyPower } from '../general';

export function applyHumanoVersatil(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const substeps: SubStep[] = [];

  // Check for manual selections
  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;

  // First skill (always required)
  let firstSkill: Skill;
  if (hasManualSkills) {
    firstSkill = manualSelections.skills![0] as Skill;
  } else {
    firstSkill = getNotRepeatedRandom(sheet.skills, Object.values(Skill));
  }
  sheet.skills.push(firstSkill);

  // Second choice: either a skill OR a general power
  if (hasManualPowers) {
    // User chose a power for the second selection
    const selectedPower = manualSelections.powers![0] as GeneralPower;
    sheet.generalPowers.push(selectedPower);
    substeps.push({
      name: 'Versátil',
      value: `Poder geral recebido (${selectedPower.name})`,
    });
  } else if (hasManualSkills && manualSelections.skills!.length >= 2) {
    // User chose a second skill
    const secondSkill = manualSelections.skills![1] as Skill;
    sheet.skills.push(secondSkill);
    substeps.push({
      name: 'Versátil',
      value: `Perícia treinada (${secondSkill})`,
    });
  } else {
    // Random selection (backwards compatibility for random generation)
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

export function applyYidishanNaturezaOrganica(
  _sheet: CharacterSheet
): SubStep[] {
  function addSkillOrGeneralPower(sheet: CharacterSheet, substeps: SubStep[]) {
    const shouldGetSkill = Math.random() > 0.5;

    if (shouldGetSkill) {
      const randomSkill = getNotRepeatedRandom(
        sheet.skills,
        Object.values(Skill)
      );
      sheet.skills.push(randomSkill);
      substeps.push({
        name: 'Natureza Orgânica',
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
        name: 'Natureza Orgânica',
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
        name: 'Natureza Orgânica',
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

export function applyMeioElfoAmbicaoHerdada(sheet: CharacterSheet): SubStep[] {
  const substeps: SubStep[] = [];

  // 50% chance of getting a general power vs origin power
  const shouldGetGeneralPower = Math.random() > 0.5;

  if (shouldGetGeneralPower) {
    const allowedPowers = getPowersAllowedByRequirements(sheet);
    const randomPower = getNotRepeatedRandom(
      sheet.generalPowers,
      allowedPowers
    );
    sheet.generalPowers.push(randomPower);
    substeps.push({
      name: 'Ambição Herdada',
      value: `Poder geral recebido (${randomPower.name})`,
    });
  } else {
    // Get a random origin power
    const allOriginPowers = Object.values(originPowers);
    const randomOriginPower = getRandomItemFromArray(allOriginPowers);
    if (sheet.origin) {
      sheet.origin.powers.push(randomOriginPower);
    }
    substeps.push({
      name: 'Ambição Herdada',
      value: `Poder único de origem recebido (${randomOriginPower.name})`,
    });

    // Apply the origin power's effects if any
    applyPower(sheet, randomOriginPower);
  }

  return substeps;
}
