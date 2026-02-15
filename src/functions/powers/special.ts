import CharacterSheet, {
  DamageType,
  SubStep,
} from '@/interfaces/CharacterSheet';
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

  // Check if Versátil was already applied (to avoid re-applying during recalculation)
  // We look for existing steps that mention "Versátil"
  const versatilAlreadyApplied = sheet.steps.some(
    (step) =>
      step.label === 'Habilidades de Raça' &&
      Array.isArray(step.value) &&
      step.value.some(
        (substep) =>
          typeof substep === 'object' &&
          'name' in substep &&
          substep.name === 'Versátil'
      )
  );

  // If Versátil was already applied and we don't have manual selections,
  // skip re-applying to avoid random selection during recalculation
  if (versatilAlreadyApplied && !hasManualSkills && !hasManualPowers) {
    return substeps;
  }

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

export function applyLefouDeformidade(
  sheet: CharacterSheet,
  manualSelections?: SelectionOptions
): SubStep[] {
  const subSteps: SubStep[] = [];

  // Check for manual selections
  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;

  // Check if Deformidade was already applied (to avoid re-applying during recalculation)
  const deformidadeAlreadyApplied = sheet.steps.some(
    (step) =>
      step.label === 'Habilidades de Raça' &&
      Array.isArray(step.value) &&
      step.value.some(
        (substep) =>
          typeof substep === 'object' &&
          'name' in substep &&
          substep.name === 'Deformidade'
      )
  );

  // If already applied and no manual selections, skip
  if (deformidadeAlreadyApplied && !hasManualSkills && !hasManualPowers) {
    return subSteps;
  }

  if (hasManualSkills) {
    // Manual selections from wizard
    const selectedSkills = manualSelections.skills!;

    // Apply +2 bonus to each selected skill
    selectedSkills.forEach((skill) => {
      addOtherBonusToSkill(sheet, skill as Skill, 2);
      subSteps.push({
        name: 'Deformidade',
        value: `+2 em Perícia (${skill})`,
      });
    });

    // If user chose a tormenta power as second choice
    if (hasManualPowers) {
      const selectedPower = manualSelections.powers![0] as GeneralPower;
      sheet.generalPowers.push(selectedPower);
      subSteps.push({
        name: 'Deformidade',
        value: `Poder da Tormenta recebido (${selectedPower.name})`,
      });
    }
  } else {
    // Random selection (backwards compatibility for random generation)
    const allSkills = Object.values(Skill);
    const shouldGetTwoSkills = Math.random() < 0.5;

    const pickedSkills = pickFromArray(allSkills, shouldGetTwoSkills ? 2 : 1);
    pickedSkills.forEach((randomSkill) => {
      addOtherBonusToSkill(sheet, randomSkill, 2);
      subSteps.push({
        name: 'Deformidade',
        value: `+2 em Perícia (${randomSkill})`,
      });
    });

    if (!shouldGetTwoSkills) {
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
  }

  return subSteps;
}

export function applyOsteonMemoriaPostuma(
  _sheet: CharacterSheet,
  manualSelections?: SelectionOptions
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

  // Check for manual selections
  const hasManualSkills =
    manualSelections?.skills && manualSelections.skills.length > 0;
  const hasManualPowers =
    manualSelections?.powers && manualSelections.powers.length > 0;
  const hasManualRaceAbilities =
    manualSelections?.raceAbilities &&
    manualSelections.raceAbilities.length > 0;

  // Check if Memória Póstuma was already applied (avoid re-applying during recalculation)
  const memoriaAlreadyApplied = _sheet.steps.some(
    (step) =>
      step.label === 'Habilidades de Raça' &&
      Array.isArray(step.value) &&
      step.value.some(
        (substep) =>
          typeof substep === 'object' &&
          'name' in substep &&
          substep.name === 'Memória Póstuma'
      )
  );

  if (
    memoriaAlreadyApplied &&
    !hasManualSkills &&
    !hasManualPowers &&
    !hasManualRaceAbilities
  ) {
    return subSteps;
  }

  if (_sheet.raca.oldRace) {
    if (_sheet.raca.oldRace.name === HUMANO.name) {
      // Humano path: skill or power
      if (hasManualSkills) {
        const skill = manualSelections.skills![0] as Skill;
        _sheet.skills.push(skill);
        subSteps.push({
          name: 'Memória Póstuma',
          value: `Perícia treinada (${skill})`,
        });
      } else if (hasManualPowers) {
        const power = manualSelections.powers![0] as GeneralPower;
        _sheet.generalPowers.push(power);
        subSteps.push({
          name: 'Memória Póstuma',
          value: `Poder geral recebido (${power.name})`,
        });
      } else {
        // Random fallback
        addSkillOrGeneralPower(_sheet, subSteps);
      }
    } else if (_sheet.raca.oldRace.abilities) {
      // Non-Humano path: race ability
      if (hasManualRaceAbilities) {
        const selectedAbilityName =
          manualSelections.raceAbilities![0].abilityName;
        const ability = _sheet.raca.oldRace.abilities.find(
          (a) => a.name === selectedAbilityName
        );
        if (ability) {
          _sheet.raca.abilities?.push(ability);
          subSteps.push({
            name: 'Memória Póstuma',
            value: `${_sheet.raca.oldRace.name} (${ability.name})`,
          });
          applyPower(_sheet, ability);
        }
      } else {
        // Random fallback
        getAndApplyRandomOldRaceAbility(_sheet, subSteps);
      }
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

const QAREEN_ELEMENTS: { name: string; damageType: DamageType }[] = [
  { name: 'Água', damageType: 'Frio' },
  { name: 'Ar', damageType: 'Eletricidade' },
  { name: 'Fogo', damageType: 'Fogo' },
  { name: 'Terra', damageType: 'Ácido' },
  { name: 'Luz', damageType: 'Luz' },
  { name: 'Trevas', damageType: 'Trevas' },
];

export function applyQareenResistenciaElemental(
  sheet: CharacterSheet
): SubStep[] {
  const substeps: SubStep[] = [];

  // Use pre-selected element (from wizard) or pick randomly
  let element: (typeof QAREEN_ELEMENTS)[number];
  if (sheet.qareenElement) {
    const found = QAREEN_ELEMENTS.find(
      (e) => e.damageType === sheet.qareenElement
    );
    element = found || getRandomItemFromArray(QAREEN_ELEMENTS);
  } else {
    element = getRandomItemFromArray(QAREEN_ELEMENTS);
  }

  sheet.qareenElement = element.damageType;

  sheet.sheetBonuses.push({
    source: { type: 'power', name: 'Resistência Elemental' },
    target: { type: 'DamageReduction', damageType: element.damageType },
    modifier: { type: 'Fixed', value: 10 },
  });

  substeps.push({
    name: 'Resistência Elemental',
    value: `Qareen ${element.name} — RD de ${element.damageType} 10`,
  });

  return substeps;
}
